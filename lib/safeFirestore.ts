import { 
  collection, 
  addDoc, 
  doc, 
  getDoc, 
  updateDoc, 
  deleteDoc, 
  setDoc,
  Timestamp,
  getDocs,
  query,
  where
} from 'firebase/firestore';
import { db, auth, handleFirestoreError, OperationType } from '../firebase';
import { AuditLog, FeatureFlags, UserProfile } from '../types';
import { getFeatureFlags } from './planConfig';

/**
 * 再帰的に undefined を除去する
 */
const sanitizeData = (data: any): any => {
  if (data === null || typeof data !== 'object') return data;
  if (data instanceof Timestamp) return data;
  if (Array.isArray(data)) return data.map(sanitizeData);
  
  return Object.fromEntries(
    Object.entries(data)
      .filter(([_, v]) => v !== undefined)
      .map(([k, v]) => [k, sanitizeData(v)])
  );
};

/**
 * ユーザーの役割（Role）をチェックする
 */
export const validateRole = async (userId: string, requiredRole: 'admin' | 'staff'): Promise<void> => {
  const userRef = doc(db, 'users', userId);
  const userSnap = await getDoc(userRef);
  
  if (!userSnap.exists()) {
    throw new Error(`ユーザー設定(UID: ${userId})が見つかりません。Firestoreの users コレクションを確認してください。`);
  }

  const userData = userSnap.data() as UserProfile;
  
  // adminは常に許可、staffはrequiredRoleがstaffの場合のみ許可
  if (userData.role === 'admin') return;
  if (userData.role === 'staff' && requiredRole === 'staff') return;

  throw new Error(`権限不足です。現在の役割(${userData.role || 'なし'})ではこの操作は許可されていません。`);
};
/**
 * 機能制限のチェック（サーバー側ガード相当のロジック）
 */
export const validateFeature = async (clinicId: string, feature: keyof FeatureFlags): Promise<void> => {
  const clinicRef = doc(db, 'clinics', clinicId);
  const clinicSnap = await getDoc(clinicRef);
  
  if (!clinicSnap.exists()) {
    throw new Error('院データが見つかりません');
  }

  const plan = clinicSnap.data().plan || 'free';
  const flags = getFeatureFlags(plan);

  // Booleanフラグのチェック
  if (typeof flags[feature] === 'boolean' && flags[feature] === false) {
    throw new Error('プラン制限により利用できません');
  }

  // スタッフ数制限のチェック（特殊ケース）
  if (feature === 'maxStaffCount' && flags.maxStaffCount !== undefined) {
    const staffSnap = await getDocs(collection(db, `clinics/${clinicId}/staff`));
    if (staffSnap.size >= flags.maxStaffCount) {
      throw new Error('スタッフ登録数の上限に達しています。プランをアップグレードしてください。');
    }
  }
};

/**
 * clinicIdの存在チェックを行うガード関数
 */
export const validateClinicId = (clinicId: string | undefined): string => {
  if (!clinicId) {
    throw new Error('Clinic ID is missing. Operation aborted.');
  }
  return clinicId;
};

/**
 * 監査ログを作成する
 */
export const createAuditLog = async (
  clinicId: string,
  type: AuditLog['type'],
  details: string
) => {
  try {
    const user = auth.currentUser;
    if (!user) return;

    const logData: Omit<AuditLog, 'id'> = {
      type,
      userId: user.uid,
      userName: user.displayName || 'Unknown User',
      clinicId,
      details,
      timestamp: Timestamp.now(),
    };

    await addDoc(collection(db, `clinics/${clinicId}/logs`), logData);
  } catch (error) {
    console.error('Failed to create audit log:', error);
    // ログ作成の失敗でメインの処理を止めない
  }
};

/**
 * 安全な更新（存在チェックとundefined除外）
 */
export const safeUpdateDoc = async (
  clinicId: string,
  path: string,
  docId: string,
  data: any,
  logType?: AuditLog['type'],
  logDetails?: string,
  featureKey?: keyof FeatureFlags
) => {
  validateClinicId(clinicId);
  
  try {
    // 0. 権限とプランチェック
    const user = auth.currentUser;
    if (!user) throw new Error('認証が必要です');
    
    // 設定変更などはAdminのみ
    if (path.includes('/settings') || path.includes('/clinics/')) {
      await validateRole(user.uid, 'admin');
    }
    
    if (featureKey) {
      await validateFeature(clinicId, featureKey);
    }

    const docRef = doc(db, path, docId);
    
    // 1. 存在チェックと所属チェック
    const snap = await getDoc(docRef);
    if (!snap.exists()) {
      throw new Error(`Document not found: ${path}/${docId}`);
    }
    
    // セキュリティ強化: pathがclinics/{id}/... の形式なら、そのidがclinicIdと一致するか確認
    if (path.startsWith('clinics/') && !path.startsWith(`clinics/${clinicId}`)) {
      throw new Error('他院のデータにはアクセスできません');
    }

    // 2. undefinedの除外（再帰的）
    const cleanData = sanitizeData(data);

    // 3. 更新
    await updateDoc(docRef, {
      ...cleanData,
      updatedAt: Timestamp.now()
    });

    // 4. ログ記録
    if (logType && logDetails) {
      await createAuditLog(clinicId, logType, logDetails);
    }
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, `${path}/${docId}`);
    throw error; // 呼び出し側でエラーハンドリングできるように再スロー
  }
};

/**
 * 安全な作成
 */
export const safeAddDoc = async (
  clinicId: string,
  path: string,
  data: any,
  logType?: AuditLog['type'],
  logDetails?: string,
  featureKey?: keyof FeatureFlags
) => {
  validateClinicId(clinicId);
  
  try {
    // 0. 権限とプランチェック
    const user = auth.currentUser;
    if (!user) throw new Error('認証が必要です');

    if (featureKey) {
      await validateFeature(clinicId, featureKey);
    }

    // セキュリティ強化: pathがclinics/{id}/... の形式なら、そのidがclinicIdと一致するか確認
    if (path.startsWith('clinics/') && !path.startsWith(`clinics/${clinicId}`)) {
      throw new Error(`Access denied. Path "${path}" does not belong to clinic "${clinicId}".`);
    }

    const cleanData = sanitizeData(data);

    const docRef = await addDoc(collection(db, path), {
      ...cleanData,
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now()
    });

    if (logType && logDetails) {
      await createAuditLog(clinicId, logType, logDetails);
    }
    
    return docRef;
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, path);
    throw error; // 呼び出し側でエラーハンドリングできるように再スロー
  }
};

/**
 * 安全なセット（新規作成または上書き）
 */
export const safeSetDoc = async (
  clinicId: string,
  path: string,
  docId: string,
  data: any,
  logType?: AuditLog['type'],
  logDetails?: string,
  featureKey?: keyof FeatureFlags
) => {
  validateClinicId(clinicId);
  
  try {
    const user = auth.currentUser;
    if (!user) throw new Error('認証が必要です');

    // 設定変更などはAdminのみ
    if (path.includes('/settings') || path.includes('/clinics/')) {
      await validateRole(user.uid, 'admin');
    }

    if (featureKey) {
      await validateFeature(clinicId, featureKey);
    }

    if (path.startsWith('clinics/') && !path.startsWith(`clinics/${clinicId}`)) {
      throw new Error(`Access denied. Path "${path}" does not belong to clinic "${clinicId}".`);
    }

    const cleanData = sanitizeData(data);

    await setDoc(doc(db, path, docId), {
      ...cleanData,
      updatedAt: Timestamp.now()
    }, { merge: true });

    if (logType && logDetails) {
      await createAuditLog(clinicId, logType, logDetails);
    }
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, `${path}/${docId}`);
    throw error;
  }
};

/**
 * 安全な削除（確認ダイアログは呼び出し側で実装）
 */
export const safeDeleteDoc = async (
  clinicId: string,
  path: string,
  docId: string,
  logType?: AuditLog['type'],
  logDetails?: string,
  featureKey?: keyof FeatureFlags
) => {
  validateClinicId(clinicId);
  
  try {
    // 0. 権限とプランチェック
    const user = auth.currentUser;
    if (!user) throw new Error('認証が必要です');
    
    // 削除はAdminのみ許可
    await validateRole(user.uid, 'admin');

    if (featureKey) {
      await validateFeature(clinicId, featureKey);
    }

    // セキュリティ強化: pathがclinics/{id}/... の形式なら、そのidがclinicIdと一致するか確認
    if (path.startsWith('clinics/') && !path.startsWith(`clinics/${clinicId}`)) {
      throw new Error('他院のデータにはアクセスできません');
    }

    await deleteDoc(doc(db, path, docId));
    
    if (logType && logDetails) {
      await createAuditLog(clinicId, logType, logDetails);
    }
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, `${path}/${docId}`);
    throw error; // 呼び出し側でエラーハンドリングできるように再スロー
  }
};

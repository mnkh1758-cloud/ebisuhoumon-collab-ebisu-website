import { useState, useEffect, useMemo } from 'react';
import { useLocation } from 'react-router-dom';
import { doc, onSnapshot } from 'firebase/firestore';
import { db, auth } from '../firebase';
import { Clinic, UserProfile, FeatureFlags } from '../types';
import { getFeatureFlags } from '../lib/planConfig';
import { perf } from '@/ledger/utils/performance';

export const useSaaS = () => {
  const [clinic, setClinic] = useState<Clinic | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [customFlags, setCustomFlags] = useState<Partial<FeatureFlags>>({});
  const [loading, setLoading] = useState(true);
  const location = useLocation();

  useEffect(() => {
    perf.start('useSaaS_init');
    console.log("[useSaaS] start");
    const params = new URLSearchParams(location.search);
    const urlClinicId = params.get('clinicId') || 'haiki'; // フォールバックとして常にhaikiを許容する

    const unsubscribeAuth = auth.onAuthStateChanged((user) => {
      if (user) {
        perf.mark('useSaaS_auth_resolved');
        console.log("[useSaaS] auth user uid:", user.uid);
        // 1. ユーザープロファイルの取得
        const unsubscribeUser = onSnapshot(doc(db, 'users', user.uid), (userSnap) => {
          if (userSnap.exists()) {
            perf.mark('useSaaS_profile_loaded');
            console.log("[useSaaS] users取得成功");
            const userData = userSnap.data() as UserProfile;
            setUserProfile(userData);

            // 2. 院データの取得
            const unsubscribeClinic = onSnapshot(doc(db, 'clinics', userData.clinicId), (clinicSnap) => {
              if (clinicSnap.exists()) {
                perf.mark('useSaaS_clinic_loaded');
                setClinic({ id: clinicSnap.id, ...clinicSnap.data() } as Clinic);
              } else {
                console.warn("[useSaaS] Clinic data not found for ID:", userData.clinicId);
              }
            }, (error) => {
              console.error("[useSaaS] Error fetching clinic data:", error);
            });

            // 3. カスタム機能フラグの取得
            const unsubscribeFlags = onSnapshot(doc(db, `clinics/${userData.clinicId}/feature_flags`, 'current'), (flagsSnap) => {
              if (flagsSnap.exists()) {
                perf.mark('useSaaS_flags_loaded');
                setCustomFlags(flagsSnap.data() as Partial<FeatureFlags>);
              }
              perf.end('useSaaS_init');
              setLoading(false);
            }, (error) => {
              console.error("[useSaaS] Error fetching custom flags:", error);
              perf.end('useSaaS_init');
              setLoading(false);
            });

            return () => {
              unsubscribeClinic();
              unsubscribeFlags();
            };
          } else {
            if (urlClinicId) {
              console.warn("[useSaaS] fallback 発火: User data not found. Using fallback mock data for clinicId:", urlClinicId);
              // 暫定フォールバック: URLパラメータにclinicIdがある場合はモックデータをセット
              setUserProfile({
                uid: user.uid,
                email: user.email || '',
                displayName: user.displayName || 'テストユーザー(暫定確認用)',
                role: 'admin',
                clinicId: urlClinicId,
                createdAt: new Date() as any,
                updatedAt: new Date() as any
              });
              setClinic({
                id: urlClinicId,
                name: 'テストクリニック(暫定確認用)',
                plan: 'pro',
                billingStatus: 'active',
                businessHours: {} as any,
                holidays: [],
                createdAt: new Date() as any,
                updatedAt: new Date() as any
              });
              console.log("[useSaaS] loading true -> false (fallback)");
              setLoading(false);
            } else {
              alert(`ユーザーデータが見つかりません。\nFirestoreの users コレクションに、以下のドキュメントIDでデータを作成してください。\n\nUID: ${user.uid}`);
              console.log("[useSaaS] loading true -> false (no fallback)");
              setLoading(false);
            }
          }
        }, (error: any) => {
          console.error("[useSaaS] users取得失敗 error.code:", error.code, "error.message:", error.message);
          if (urlClinicId) {
            console.warn("[useSaaS] fallback 発火: Error fetching user data. Using fallback mock data for clinicId:", urlClinicId);
            setUserProfile({
              uid: user.uid,
              email: user.email || '',
              displayName: user.displayName || 'テストユーザー(暫定確認用)',
              role: 'admin',
              clinicId: urlClinicId,
              createdAt: new Date() as any,
              updatedAt: new Date() as any
            });
            setClinic({
              id: urlClinicId,
              name: 'テストクリニック(暫定確認用)',
              plan: 'pro',
              billingStatus: 'active',
              businessHours: {} as any,
              holidays: [],
              createdAt: new Date() as any,
              updatedAt: new Date() as any
            });
          }
          console.log("[useSaaS] loading true -> false (error fallback)");
          setLoading(false);
        });

        return () => unsubscribeUser();
      } else {
        setClinic(null);
        setUserProfile(null);
        setLoading(false);
      }
    });

    return () => unsubscribeAuth();
  }, [location.search]);

  const featureFlags = useMemo(() => {
    if (!clinic) return getFeatureFlags('starter');
    
    // 1. トライアル期限切れチェック
    if (clinic.billingStatus === 'trial' && clinic.trialEndsAt) {
      const now = new Date();
      const trialEnds = clinic.trialEndsAt.toDate();
      if (now > trialEnds) {
        return getFeatureFlags('starter'); // 期限切れならフリープラン相当に制限
      }
    }

    // 2. 支払い遅延・解約済みチェック
    if (clinic.billingStatus === 'past_due' || clinic.billingStatus === 'canceled') {
      return getFeatureFlags('starter'); // 制限
    }

    const baseFlags = getFeatureFlags(clinic.plan);
    return {
      ...baseFlags,
      ...customFlags
    };
  }, [clinic, customFlags]);

  const trialDaysLeft = useMemo(() => {
    if (clinic?.billingStatus === 'trial' && clinic.trialEndsAt) {
      const now = new Date();
      const trialEnds = clinic.trialEndsAt.toDate();
      const diff = trialEnds.getTime() - now.getTime();
      return Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)));
    }
    return null;
  }, [clinic]);

  const isAdmin = useMemo(() => userProfile?.role === 'admin', [userProfile]);

  const clinicId = useMemo(() => userProfile?.clinicId, [userProfile]);

  return {
    clinicId: clinicId || '',
    clinic,
    userProfile,
    featureFlags,
    trialDaysLeft,
    isAdmin,
    loading
  };
};

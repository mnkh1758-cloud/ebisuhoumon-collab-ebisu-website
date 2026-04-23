import React, { useState, useEffect } from 'react';
import { useParams, useOutletContext } from 'react-router-dom';
import { db, handleFirestoreError, OperationType } from '../../firebase';
import { collection, onSnapshot, doc, setDoc, updateDoc, deleteDoc } from 'firebase/firestore';
import { AdminStaff, StaffSchedule, DailySchedule, DayOfWeek, UserProfile, FeatureFlags } from '../../types';
import { Plus, Edit2, Trash2, X, CheckCircle2 } from 'lucide-react';
import { safeAddDoc, safeDeleteDoc, safeUpdateDoc, validateClinicId } from '../../lib/safeFirestore';
import { ImageUploader } from '../../src/components/common/ImageUploader';
import { useSaaS } from '../../src/hooks/useSaaS';
import { Lock, AlertCircle } from 'lucide-react';

const DAYS_JA: Record<DayOfWeek, string> = {
  monday: '月', tuesday: '火', wednesday: '水', thursday: '木', friday: '金', saturday: '土', sunday: '日'
};

const DEFAULT_DAILY: DailySchedule = { isWorking: false, start: '09:00', end: '18:00', breakStart: '13:00', breakEnd: '14:00' };

const DEFAULT_SCHEDULE: StaffSchedule = (Object.keys(DAYS_JA) as DayOfWeek[]).reduce((acc, day) => {
  acc[day] = { ...DEFAULT_DAILY };
  return acc;
}, {} as StaffSchedule);

export function validateDailySchedule(daily: DailySchedule, dayName: string): string | null {
  if (!daily.isWorking) return null;

  if (!daily.start || !daily.end) {
    return `${dayName}曜日の勤務時間を入力してください`;
  }

  if (daily.start >= daily.end) {
    return `${dayName}曜日の勤務終了時間は、開始時間より後に設定してください`;
  }

  const hasBreakStart = !!daily.breakStart;
  const hasBreakEnd = !!daily.breakEnd;

  if (hasBreakStart !== hasBreakEnd) {
    return `${dayName}曜日の休憩時間は、開始と終了の両方を入力するか、両方空にしてください`;
  }

  if (hasBreakStart && hasBreakEnd) {
    if (daily.breakStart >= daily.breakEnd) {
      return `${dayName}曜日の休憩終了時間は、休憩開始時間より後に設定してください`;
    }
    if (daily.breakStart < daily.start || daily.breakEnd > daily.end) {
      return `${dayName}曜日の休憩時間は、勤務時間内に設定してください`;
    }
  }

  return null;
}

export const StaffManagement: React.FC = () => {
  const { clinicId: saasClinicId, userProfile, featureFlags, loading: saasLoading } = useSaaS();
  const { clinicId: paramClinicId } = useParams<{ clinicId: string }>();
  const clinicId = paramClinicId || saasClinicId;
  const [staffList, setStaffList] = useState<AdminStaff[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingStaff, setEditingStaff] = useState<AdminStaff | null>(null);
  const [modalData, setModalData] = useState<Partial<AdminStaff>>({});

  useEffect(() => {
    if (!clinicId) return;
    const staffRef = collection(db, `clinics/${clinicId}/staff`);
    const unsub = onSnapshot(staffRef, (snapshot) => {
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as AdminStaff));
      setStaffList(data.sort((a, b) => a.order - b.order));
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, `clinics/${clinicId}/staff`);
    });
    return () => unsub();
  }, [clinicId]);

  const handleAdd = () => {
    if (userProfile?.role === 'staff') {
      alert('スタッフ権限ではスタッフの追加はできません。');
      return;
    }

    // Plan check
    const maxStaff = featureFlags.maxStaffCount || 0;
    if (staffList.length >= maxStaff) {
      alert(`現在のプランではスタッフを ${maxStaff} 名までしか登録できません。アップグレードをご検討ください。`);
      return;
    }

    setEditingStaff(null);
    setModalData({
      name: '',
      role: '',
      color: 'bg-blue-100',
      order: staffList.length + 1,
      isActive: true,
      schedule: DEFAULT_SCHEDULE,
    });
    setIsModalOpen(true);
  };

  const handleEdit = (staff: AdminStaff) => {
    if (userProfile?.role === 'staff') {
      alert('スタッフ権限ではスタッフの編集はできません。');
      return;
    }
    setEditingStaff(staff);
    setModalData({
      ...staff,
      schedule: staff.schedule || DEFAULT_SCHEDULE,
    });
    setIsModalOpen(true);
  };

  const handleScheduleChange = (day: DayOfWeek, field: keyof DailySchedule, value: string | boolean) => {
    setModalData(prev => {
      const currentSchedule = prev.schedule || DEFAULT_SCHEDULE;
      return {
        ...prev,
        schedule: {
          ...currentSchedule,
          [day]: { ...currentSchedule[day], [field]: value }
        }
      };
    });
  };

  const handleSave = async () => {
    if (!clinicId) {
      alert('院IDが見つかりません。再ログインを試してください。');
      return;
    }
    if (!modalData.name) {
      alert('スタッフ名は必須です。');
      return;
    }

    if (modalData.schedule) {
      for (const day of Object.keys(DAYS_JA) as DayOfWeek[]) {
        const daily = modalData.schedule[day] || DEFAULT_DAILY;
        const validationError = validateDailySchedule(daily, DAYS_JA[day]);
        if (validationError) {
          alert(validationError);
          return;
        }
      }
    }

    const path = `clinics/${clinicId}/staff`;
    console.log('[StaffSave] Starting save...', {
      clinicId,
      path,
      isEdit: !!editingStaff,
      payload: modalData
    });

    try {
      if (editingStaff) {
        await safeUpdateDoc(
          clinicId,
          path,
          editingStaff.id,
          modalData,
          'staff_update',
          `スタッフ「${modalData.name}」の情報を更新しました`
        );
      } else {
        await safeAddDoc(
          clinicId,
          path,
          modalData,
          'staff_update',
          `スタッフ「${modalData.name}」を追加しました`,
          'maxStaffCount'
        );
      }
      setIsModalOpen(false);
    } catch (error: any) {
      console.error('[StaffSave] Error detail:', {
        message: error.message,
        code: error.code,
        stack: error.stack
      });
      alert(`スタッフの保存に失敗しました。\n理由: ${error.message || '不明なエラー'}`);
      handleFirestoreError(error, editingStaff ? OperationType.UPDATE : OperationType.CREATE, path);
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if (!clinicId) return;
    
    if (userProfile?.role === 'staff') {
      alert('スタッフ権限ではスタッフの削除はできません。');
      return;
    }

    if (window.confirm(`本当にスタッフ「${name}」を削除しますか？`)) {
      try {
        await safeDeleteDoc(
          clinicId,
          `clinics/${clinicId}/staff`,
          id,
          'staff_update',
          `スタッフ「${name}」を削除しました`
        );
      } catch (error) {
        handleFirestoreError(error, OperationType.DELETE, `clinics/${clinicId}/staff/${id}`);
      }
    }
  };

  if (saasLoading) return <div className="p-8 text-stone-500">読み込み中...</div>;

  const isLimitReached = featureFlags.maxStaffCount !== undefined && staffList.length >= featureFlags.maxStaffCount;

  return (
    <div className="h-full flex flex-col gap-6">
      <div className="flex items-center justify-between bg-white p-4 rounded-2xl shadow-sm border border-stone-200">
        <div className="flex items-center gap-4">
          <h2 className="text-xl font-bold text-stone-800">スタッフ管理</h2>
          {isLimitReached && (
            <div className="flex items-center gap-1 text-xs font-bold text-amber-600 bg-amber-50 px-3 py-1 rounded-full border border-amber-100">
              <AlertCircle size={14} /> スタッフ登録上限に達しています
            </div>
          )}
        </div>
        <button
          onClick={handleAdd}
          disabled={isLimitReached}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl font-bold transition-colors shadow-sm ${
            isLimitReached 
              ? 'bg-stone-100 text-stone-400 cursor-not-allowed' 
              : 'bg-emerald-600 text-white hover:bg-emerald-700'
          }`}
        >
          {isLimitReached ? <Lock size={18} /> : <Plus size={18} />}
          <span>スタッフ追加</span>
        </button>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-stone-200 overflow-hidden flex-1">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-stone-50 border-b border-stone-200 text-stone-600">
              <th className="p-4 font-bold">表示順</th>
              <th className="p-4 font-bold">名前</th>
              <th className="p-4 font-bold">役職</th>
              <th className="p-4 font-bold">カラー</th>
              <th className="p-4 font-bold">ステータス</th>
              <th className="p-4 font-bold text-right">操作</th>
            </tr>
          </thead>
          <tbody>
            {staffList.map((staff) => (
              <tr key={staff.id} className="border-b border-stone-100 hover:bg-stone-50 transition-colors">
                <td className="p-4 font-medium text-stone-600">{staff.order}</td>
                <td className="p-4 font-bold text-stone-800">{staff.name}</td>
                <td className="p-4 text-stone-600">{staff.role || '-'}</td>
                <td className="p-4">
                  <div className={`w-6 h-6 rounded-full ${staff.color} border border-stone-200`}></div>
                </td>
                <td className="p-4">
                  {staff.isActive ? (
                    <span className="inline-flex items-center gap-1 text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-1 rounded-lg">
                      <CheckCircle2 size={14} /> 表示中
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 text-xs font-bold text-stone-500 bg-stone-100 px-2 py-1 rounded-lg">
                      非表示
                    </span>
                  )}
                </td>
                <td className="p-4 text-right space-x-2">
                  <button onClick={() => handleEdit(staff)} className="p-2 text-stone-400 hover:text-blue-600 transition-colors rounded-lg hover:bg-blue-50">
                    <Edit2 size={18} />
                  </button>
                  <button onClick={() => handleDelete(staff.id, staff.name)} className="p-2 text-stone-400 hover:text-red-600 transition-colors rounded-lg hover:bg-red-50">
                    <Trash2 size={18} />
                  </button>
                </td>
              </tr>
            ))}
            {staffList.length === 0 && (
              <tr>
                <td colSpan={6} className="p-8 text-center text-stone-500">
                  スタッフが登録されていません。「スタッフ追加」から登録してください。
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-stone-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl shadow-xl w-full max-w-3xl overflow-hidden flex flex-col max-h-[90vh]">
            <div className="p-6 border-b border-stone-100 flex items-center justify-between bg-stone-50 shrink-0">
              <h3 className="text-xl font-bold text-stone-800">
                {editingStaff ? 'スタッフ編集' : 'スタッフ追加'}
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="text-stone-400 hover:text-stone-600 p-2 rounded-full hover:bg-stone-200 transition-colors">
                <X size={24} />
              </button>
            </div>
            
            <div className="p-6 space-y-6 overflow-y-auto">
              {/* 写真アップロード */}
              <div className="flex flex-col items-center gap-4 py-4">
                <ImageUploader
                  images={modalData.photoURL ? [modalData.photoURL] : []}
                  onImagesChange={(urls) => setModalData(prev => ({ ...prev, photoURL: urls[0] || '' }))}
                  maxImages={1}
                  preset="STAFF"
                  storagePath={`clinics/${clinicId}/staff/photos`}
                  isCircular={true}
                />
                <p className="text-xs font-bold text-stone-400">スタッフ写真（自動最適化されます）</p>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-bold text-stone-600">名前 <span className="text-red-500">*</span></label>
                <input
                  type="text"
                  value={modalData.name || ''}
                  onChange={(e) => setModalData({ ...modalData, name: e.target.value })}
                  className="w-full bg-stone-50 border border-stone-200 rounded-xl px-4 py-3 font-bold text-stone-800 focus:ring-2 focus:ring-emerald-500 outline-none"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-bold text-stone-600">役職</label>
                <input
                  type="text"
                  value={modalData.role || ''}
                  onChange={(e) => setModalData({ ...modalData, role: e.target.value })}
                  className="w-full bg-stone-50 border border-stone-200 rounded-xl px-4 py-3 font-medium text-stone-800 focus:ring-2 focus:ring-emerald-500 outline-none"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-bold text-stone-600">表示順</label>
                  <input
                    type="number"
                    value={modalData.order || 1}
                    onChange={(e) => setModalData({ ...modalData, order: parseInt(e.target.value) })}
                    className="w-full bg-stone-50 border border-stone-200 rounded-xl px-4 py-3 font-bold text-stone-800 focus:ring-2 focus:ring-emerald-500 outline-none"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-bold text-stone-600">カラー</label>
                  <select
                    value={modalData.color || 'bg-blue-100'}
                    onChange={(e) => setModalData({ ...modalData, color: e.target.value })}
                    className="w-full bg-stone-50 border border-stone-200 rounded-xl px-4 py-3 font-bold text-stone-800 focus:ring-2 focus:ring-emerald-500 outline-none"
                  >
                    <option value="bg-blue-100">ブルー</option>
                    <option value="bg-green-100">グリーン</option>
                    <option value="bg-orange-100">オレンジ</option>
                    <option value="bg-purple-100">パープル</option>
                    <option value="bg-pink-100">ピンク</option>
                  </select>
                </div>
              </div>
              <div className="flex items-center gap-3 pt-2">
                <input
                  type="checkbox"
                  id="isActive"
                  checked={modalData.isActive ?? true}
                  onChange={(e) => setModalData({ ...modalData, isActive: e.target.checked })}
                  className="w-5 h-5 text-emerald-600 rounded focus:ring-emerald-500"
                />
                <label htmlFor="isActive" className="font-bold text-stone-700 cursor-pointer">タイムラインに表示する</label>
              </div>

              {/* シフト設定 */}
              <div className="space-y-4 border-t border-stone-200 pt-6">
                <h4 className="font-bold text-stone-800">シフト設定</h4>
                <div className="space-y-3">
                  {(Object.keys(DAYS_JA) as DayOfWeek[]).map(day => {
                    const daily = modalData.schedule?.[day] || DEFAULT_DAILY;
                    const disabled = !daily.isWorking;

                    return (
                      <div key={day} className={`flex items-center gap-4 p-3 rounded-xl border ${disabled ? 'bg-stone-50 border-stone-100' : 'bg-white border-stone-200'}`}>
                        {/* 曜日とトグル */}
                        <div className="w-24 flex items-center gap-2 shrink-0">
                          <input
                            type="checkbox"
                            checked={daily.isWorking}
                            onChange={(e) => handleScheduleChange(day, 'isWorking', e.target.checked)}
                            className="w-5 h-5 text-emerald-600 rounded focus:ring-emerald-500 cursor-pointer"
                          />
                          <span className={`font-medium ${disabled ? 'text-stone-400' : 'text-stone-700'}`}>
                            {DAYS_JA[day]}曜日
                          </span>
                        </div>

                        {/* 勤務時間 */}
                        <div className={`flex items-center gap-2 ${disabled ? 'opacity-50' : ''}`}>
                          <span className="text-sm font-bold text-stone-500 w-10 text-right">勤務</span>
                          <input
                            type="time"
                            value={daily.start}
                            onChange={(e) => handleScheduleChange(day, 'start', e.target.value)}
                            disabled={disabled}
                            className="border border-stone-200 rounded-lg px-2 py-1.5 text-sm disabled:bg-stone-100 focus:ring-2 focus:ring-emerald-500 outline-none"
                          />
                          <span className="text-stone-400">〜</span>
                          <input
                            type="time"
                            value={daily.end}
                            onChange={(e) => handleScheduleChange(day, 'end', e.target.value)}
                            disabled={disabled}
                            className="border border-stone-200 rounded-lg px-2 py-1.5 text-sm disabled:bg-stone-100 focus:ring-2 focus:ring-emerald-500 outline-none"
                          />
                        </div>

                        {/* 休憩時間 */}
                        <div className={`flex items-center gap-2 ${disabled ? 'opacity-50' : ''}`}>
                          <span className="text-sm font-bold text-stone-500 w-10 text-right">休憩</span>
                          <input
                            type="time"
                            value={daily.breakStart}
                            onChange={(e) => handleScheduleChange(day, 'breakStart', e.target.value)}
                            disabled={disabled}
                            className="border border-stone-200 rounded-lg px-2 py-1.5 text-sm disabled:bg-stone-100 focus:ring-2 focus:ring-emerald-500 outline-none"
                          />
                          <span className="text-stone-400">〜</span>
                          <input
                            type="time"
                            value={daily.breakEnd}
                            onChange={(e) => handleScheduleChange(day, 'breakEnd', e.target.value)}
                            disabled={disabled}
                            className="border border-stone-200 rounded-lg px-2 py-1.5 text-sm disabled:bg-stone-100 focus:ring-2 focus:ring-emerald-500 outline-none"
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            <div className="p-6 border-t border-stone-100 bg-stone-50 flex items-center justify-end gap-3 shrink-0">
              <button
                onClick={() => setIsModalOpen(false)}
                className="px-6 py-3 rounded-xl font-bold text-stone-600 hover:bg-stone-200 transition-colors"
              >
                キャンセル
              </button>
              <button
                onClick={handleSave}
                className="px-8 py-3 rounded-xl font-bold text-white bg-emerald-600 hover:bg-emerald-700 transition-colors shadow-sm"
              >
                保存する
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

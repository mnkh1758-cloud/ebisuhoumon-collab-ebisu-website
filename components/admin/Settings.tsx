import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Clock, CalendarOff, Save, Plus, Trash2 } from 'lucide-react';
import { db, handleFirestoreError, OperationType } from '../../firebase';
import { doc, getDoc, setDoc, collection, getDocs } from 'firebase/firestore';
import { ClinicSettings, DayOfWeek, BusinessHours, AdminStaff } from '../../types';
import { useSaaS } from '../../src/hooks/useSaaS';
import { Shield, Zap, Check, AlertCircle, Users, Lock, X } from 'lucide-react';
import { PLAN_NAMES } from '../../lib/planConfig';

const DAYS_OF_WEEK: { key: DayOfWeek; label: string }[] = [
  { key: 'monday', label: '月曜日' },
  { key: 'tuesday', label: '火曜日' },
  { key: 'wednesday', label: '水曜日' },
  { key: 'thursday', label: '木曜日' },
  { key: 'friday', label: '金曜日' },
  { key: 'saturday', label: '土曜日' },
  { key: 'sunday', label: '日曜日' },
];

const DEFAULT_HOURS: BusinessHours = {
  monday: { isOpen: true, start: '09:00', end: '20:00' },
  tuesday: { isOpen: true, start: '09:00', end: '20:00' },
  wednesday: { isOpen: true, start: '09:00', end: '20:00' },
  thursday: { isOpen: true, start: '09:00', end: '20:00' },
  friday: { isOpen: true, start: '09:00', end: '20:00' },
  saturday: { isOpen: true, start: '09:00', end: '15:00' },
  sunday: { isOpen: false, start: '09:00', end: '20:00' },
};

export const Settings: React.FC = () => {
  const { clinicId, clinic, isAdmin, featureFlags, loading: saasLoading } = useSaaS();
  const [settings, setSettings] = useState<ClinicSettings>({
    name: '',
    businessHours: DEFAULT_HOURS,
    holidays: [],
  });
  const [staffCount, setStaffCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [newHoliday, setNewHoliday] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      if (!clinicId) return;
      try {
        // Fetch settings
        const docRef = doc(db, `clinics/${clinicId}/settings/business`);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          const data = docSnap.data() as Partial<ClinicSettings>;
          setSettings({
            name: data.name || '',
            businessHours: data.businessHours || DEFAULT_HOURS,
            holidays: data.holidays || [],
            closeOnNationalHolidays: data.closeOnNationalHolidays || false,
          });
        }

        // Fetch staff count for usage display
        const staffSnap = await getDocs(collection(db, `clinics/${clinicId}/staff`));
        setStaffCount(staffSnap.size);
      } catch (error) {
        handleFirestoreError(error, OperationType.GET, `clinics/${clinicId}/settings/business`);
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, [clinicId]);

  const handleSave = async () => {
    if (!clinicId) return;
    setIsSaving(true);
    try {
      const docRef = doc(db, `clinics/${clinicId}/settings/business`);
      await setDoc(docRef, settings);
      alert('設定を保存しました');
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, `clinics/${clinicId}/settings/business`);
      alert('保存に失敗しました');
    } finally {
      setIsSaving(false);
    }
  };

  const handleHourChange = (day: DayOfWeek, field: 'isOpen' | 'start' | 'end', value: any) => {
    setSettings(prev => ({
      ...prev,
      businessHours: {
        ...prev.businessHours,
        [day]: {
          ...prev.businessHours[day],
          [field]: value
        }
      }
    }));
  };

  const handleAddHoliday = () => {
    if (!newHoliday) return;
    if (settings.holidays.includes(newHoliday)) {
      alert('すでに登録されています');
      return;
    }
    setSettings(prev => ({
      ...prev,
      holidays: [...prev.holidays, newHoliday].sort()
    }));
    setNewHoliday('');
  };

  const handleRemoveHoliday = (date: string) => {
    setSettings(prev => ({
      ...prev,
      holidays: prev.holidays.filter(h => h !== date)
    }));
  };

  if (saasLoading || isLoading) {
    return <div className="p-8 text-center text-stone-500">読み込み中...</div>;
  }

  if (!isAdmin) {
    return (
      <div className="h-full flex flex-col items-center justify-center p-8 text-center bg-stone-50 rounded-2xl border-2 border-dashed border-stone-200">
        <div className="w-16 h-16 rounded-full bg-stone-100 flex items-center justify-center text-stone-400 mb-4">
          <Lock size={32} />
        </div>
        <h3 className="text-xl font-bold text-stone-800 mb-2">アクセス権限がありません</h3>
        <p className="text-stone-500 max-w-md">
          設定画面は管理者（Admin）権限を持つユーザーのみがアクセス可能です。
        </p>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col gap-6 overflow-y-auto pb-20 custom-scrollbar">
      {/* プラン概要セクション */}
      <div className="bg-gradient-to-br from-stone-800 to-stone-900 p-8 rounded-3xl shadow-xl text-white relative overflow-hidden">
        <div className="absolute top-0 right-0 p-8 opacity-10">
          <Zap size={120} />
        </div>
        
        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-6">
            <span className="bg-emerald-500 text-white text-xs font-bold px-3 py-1 rounded-full uppercase tracking-widest">
              Current Plan
            </span>
            <h2 className="text-3xl font-bold">{clinic ? PLAN_NAMES[clinic.plan] : '---'}</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-white/10 backdrop-blur-md p-6 rounded-2xl border border-white/10">
              <div className="text-stone-400 text-xs font-bold mb-2 flex items-center gap-2 uppercase tracking-wider">
                <Users size={14} /> Staff Usage
              </div>
              <div className="flex items-end gap-2">
                <span className="text-3xl font-bold">{staffCount}</span>
                <span className="text-stone-400 mb-1">/ {featureFlags.maxStaffCount === Infinity ? '∞' : featureFlags.maxStaffCount}</span>
              </div>
              <div className="mt-3 w-full bg-white/10 h-1.5 rounded-full overflow-hidden">
                <div 
                  className="bg-emerald-500 h-full transition-all duration-500" 
                  style={{ width: `${Math.min(100, (staffCount / (featureFlags.maxStaffCount === Infinity ? staffCount : featureFlags.maxStaffCount)) * 100)}%` }}
                />
              </div>
            </div>

            <div className="md:col-span-2 bg-white/10 backdrop-blur-md p-6 rounded-2xl border border-white/10">
              <div className="text-stone-400 text-xs font-bold mb-4 uppercase tracking-wider">Available Features</div>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                {[
                  { label: '予約管理', enabled: featureFlags.canManageReservations },
                  { label: '電子カルテ', enabled: featureFlags.canUseChart },
                  { label: 'Web問診', enabled: featureFlags.canUseQuestionnaire },
                  { label: '経営分析', enabled: featureFlags.canUseAnalytics },
                ].map((f, i) => (
                  <div key={i} className={`flex items-center gap-2 text-sm font-bold ${f.enabled ? 'text-emerald-400' : 'text-white/30'}`}>
                    {f.enabled ? <Check size={16} /> : <X size={16} />}
                    {f.label}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {clinic?.plan !== 'pro' && (
            <div className="mt-8 flex items-center justify-between p-4 bg-emerald-500/10 rounded-2xl border border-emerald-500/20">
              <div className="flex items-center gap-3">
                <AlertCircle className="text-emerald-400" size={20} />
                <p className="text-sm font-medium">
                  上位プランへのアップグレードで、スタッフ数上限の解除や分析機能が利用可能になります。
                </p>
              </div>
              <button className="bg-emerald-500 hover:bg-emerald-600 text-white px-6 py-2 rounded-xl font-bold transition-all shadow-lg shadow-emerald-500/20">
                Upgrade Now
              </button>
            </div>
          )}
        </div>
      </div>

      <div className="bg-white p-4 rounded-2xl shadow-sm border border-stone-200 flex justify-between items-center">
        <h2 className="text-xl font-bold text-stone-800">院設定</h2>
        <button
          onClick={handleSave}
          disabled={isSaving}
          className="flex items-center gap-2 bg-emerald-600 text-white px-4 py-2 rounded-xl hover:bg-emerald-700 transition-colors disabled:opacity-50"
        >
          <Save size={20} />
          {isSaving ? '保存中...' : '設定を保存'}
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* 営業時間設定 */}
        <div className="bg-white rounded-2xl shadow-sm border border-stone-200 p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <Clock size={20} />
            </div>
            <h3 className="text-lg font-bold text-stone-800">営業時間設定</h3>
          </div>
          
          <div className="space-y-4">
            {DAYS_OF_WEEK.map(({ key, label }) => {
              const hours = settings.businessHours[key];
              return (
                <div key={key} className="flex items-center justify-between p-3 bg-stone-50 rounded-xl border border-stone-100">
                  <div className="flex items-center gap-4 w-32">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={hours.isOpen}
                        onChange={(e) => handleHourChange(key, 'isOpen', e.target.checked)}
                        className="w-5 h-5 text-emerald-600 rounded border-stone-300 focus:ring-emerald-500"
                      />
                      <span className="font-medium text-stone-700">{label}</span>
                    </label>
                  </div>
                  
                  <div className="flex items-center gap-2 flex-1 justify-end">
                    {hours.isOpen ? (
                      <>
                        <input
                          type="time"
                          value={hours.start}
                          onChange={(e) => handleHourChange(key, 'start', e.target.value)}
                          className="px-3 py-1.5 border border-stone-200 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                        />
                        <span className="text-stone-400">〜</span>
                        <input
                          type="time"
                          value={hours.end}
                          onChange={(e) => handleHourChange(key, 'end', e.target.value)}
                          className="px-3 py-1.5 border border-stone-200 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                        />
                      </>
                    ) : (
                      <span className="text-stone-400 font-medium px-4">休診</span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* 休診日設定 */}
        <div className="bg-white rounded-2xl shadow-sm border border-stone-200 p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-full bg-orange-50 text-orange-600 flex items-center justify-center">
              <CalendarOff size={20} />
            </div>
            <h3 className="text-lg font-bold text-stone-800">休診日設定（臨時休診・祝日など）</h3>
          </div>
          
          <div className="flex gap-2 mb-6">
            <input
              type="date"
              value={newHoliday}
              onChange={(e) => setNewHoliday(e.target.value)}
              className="flex-1 px-4 py-2 border border-stone-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
            />
            <button
              onClick={handleAddHoliday}
              disabled={!newHoliday}
              className="flex items-center gap-2 bg-stone-800 text-white px-4 py-2 rounded-xl hover:bg-stone-700 transition-colors disabled:opacity-50"
            >
              <Plus size={20} />
              追加
            </button>
          </div>

          <div className="space-y-2 max-h-[400px] overflow-y-auto pr-2">
            {settings.holidays.length === 0 ? (
              <p className="text-stone-500 text-center py-4">登録されている休診日はありません</p>
            ) : (
              settings.holidays.map((date) => (
                <div key={date} className="flex items-center justify-between p-3 bg-stone-50 rounded-xl border border-stone-100">
                  <span className="font-medium text-stone-700">{date}</span>
                  <button
                    onClick={() => handleRemoveHoliday(date)}
                    className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

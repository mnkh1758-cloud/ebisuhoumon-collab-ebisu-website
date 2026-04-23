import React, { useState, useEffect } from 'react';
import { useOutletContext, useNavigate } from 'react-router-dom';
import { db, handleFirestoreError, OperationType } from '../../firebase';
import { doc, getDoc, setDoc, collection, onSnapshot, query, orderBy, limit } from 'firebase/firestore';
import { ClinicSettings, BusinessHours, DayOfWeek, AdminStaff, UserProfile, Clinic, FeatureFlags, AuditLog, FeeMaster } from '../../types';
import { StaffManagement } from '../../components/admin/StaffManagement';
import { CsvImportSection } from '../components/CsvImportSection';
import { 
  Settings as SettingsIcon, 
  Building2, 
  Clock, 
  Users, 
  Save, 
  Loader2,
  CheckCircle2,
  AlertCircle,
  CreditCard,
  Zap,
  ShieldCheck,
  History,
  Search,
  MessageSquarePlus,
  ChevronRight,
  FileText,
  Hash,
  Upload,
  X 
} from 'lucide-react';
import { createAuditLog, validateClinicId, safeSetDoc } from '../../lib/safeFirestore';
import { PLAN_NAMES, PLAN_PRICES, PLAN_PRICES_ANNUAL, PLAN_DESCRIPTIONS, PLAN_CONFIG } from '../../lib/planConfig';
import { ImageUploader } from '../../src/components/common/ImageUploader';
import { PlanType } from '../../types';

const DAYS_JA: Record<DayOfWeek, string> = {
  monday: '月', tuesday: '火', wednesday: '水', thursday: '木', friday: '金', saturday: '土', sunday: '日'
};

export const Settings: React.FC = () => {
  const navigate = useNavigate();
  const { clinicId, userProfile, clinic, featureFlags, trialDaysLeft } = useOutletContext<{ 
    clinicId: string, 
    userProfile: UserProfile,
    clinic: Clinic,
    featureFlags: FeatureFlags,
    trialDaysLeft: number | null
  }>();
  const [activeTab, setActiveTab] = useState<'clinic' | 'hours' | 'staff' | 'plan' | 'logs' | 'saas' | 'feeMaster' | 'csvImport'>('clinic');
  
  const [settings, setSettings] = useState<ClinicSettings>({
    name: '',
    businessHours: (Object.keys(DAYS_JA) as DayOfWeek[]).reduce((acc, day) => {
      acc[day] = { isOpen: true, start: '09:00', end: '19:00' };
      return acc;
    }, {} as BusinessHours),
    holidays: []
  });

  const [saasSettings, setSaasSettings] = useState({
    signatureMode: 'standard',
    signatureFrequency: 'monthly',
    aiIntensity: 'normal'
  });

  const [saasFeatureFlags, setSaasFeatureFlags] = useState({
    enableAI: true,
    enableSignature: true,
    enableQuestionnaire: true,
    enableHumanBodyDraw: true,
    enableAiLearning: true,
    enableVoiceInput: true
  });

  const [loading, setLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [logLoading, setLogLoading] = useState(false);
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'annual'>('monthly');

  const [feeMasters, setFeeMasters] = useState<FeeMaster[]>([]);
  const [feeMasterLoading, setFeeMasterLoading] = useState(false);

  useEffect(() => {
    if (!clinicId || activeTab !== 'feeMaster') return;

    setFeeMasterLoading(true);
    const q = query(
      collection(db, `clinics/${clinicId}/feeMasters`),
      orderBy('effectiveFrom', 'desc')
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as FeeMaster[];
      setFeeMasters(data);
      setFeeMasterLoading(false);
    }, (error) => {
      console.error('Fee master fetch error:', error);
      setFeeMasterLoading(false);
    });

    return () => unsubscribe();
  }, [clinicId, activeTab]);

  useEffect(() => {
    if (!clinicId || activeTab !== 'logs') return;

    setLogLoading(true);
    const q = query(
      collection(db, `clinics/${clinicId}/logs`),
      orderBy('timestamp', 'desc'),
      limit(100)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const logsData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as AuditLog[];
      setLogs(logsData);
      setLogLoading(false);
    }, (error) => {
      console.error('Audit log fetch error:', error);
      setLogLoading(false);
    });

    return () => unsubscribe();
  }, [clinicId, activeTab]);

  useEffect(() => {
    if (!clinicId) return;

    const fetchSettings = async () => {
      try {
        const docRef = doc(db, `clinics/${clinicId}/settings`, 'general');
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          const data = docSnap.data() as Partial<ClinicSettings>;
          setSettings({
            name: data.name || '',
            businessHours: data.businessHours || (Object.keys(DAYS_JA) as DayOfWeek[]).reduce((acc, day) => {
              acc[day] = { isOpen: true, start: '09:00', end: '19:00' };
              return acc;
            }, {} as BusinessHours),
            holidays: data.holidays || [],
            closeOnNationalHolidays: data.closeOnNationalHolidays || false,
          });
        }

        const saasRef = doc(db, `clinics/${clinicId}/settings`, 'saas');
        const saasSnap = await getDoc(saasRef);
        if (saasSnap.exists()) {
          setSaasSettings(saasSnap.data() as any);
        }

        const flagsRef = doc(db, `clinics/${clinicId}/feature_flags`, 'current');
        const flagsSnap = await getDoc(flagsRef);
        if (flagsSnap.exists()) {
          setSaasFeatureFlags(prev => ({ ...prev, ...flagsSnap.data() }));
        }
      } catch (error) {
        handleFirestoreError(error, OperationType.GET, `clinics/${clinicId}/settings`);
      } finally {
        setLoading(false);
      }
    };

    fetchSettings();
  }, [clinicId]);

  const handleSave = async () => {
    if (!clinicId) return;
    
    // Role check
    if (userProfile?.role === 'staff') {
      alert('スタッフ権限では設定の変更はできません。管理者に依頼してください。');
      return;
    }

    setIsSaving(true);
    setSaveStatus('idle');

    try {
      validateClinicId(clinicId);
      await safeSetDoc(
        clinicId,
        `clinics/${clinicId}/settings`,
        'general',
        settings,
        'settings_update',
        '院の基本情報または営業時間を更新しました'
      );

      await safeSetDoc(
        clinicId,
        `clinics/${clinicId}/settings`,
        'saas',
        saasSettings,
        'saas_settings_update',
        'SaaS設定を更新しました'
      );

      await safeSetDoc(
        clinicId,
        `clinics/${clinicId}/feature_flags`,
        'current',
        saasFeatureFlags,
        'feature_flags_update',
        '機能フラグを更新しました'
      );

      setSaveStatus('success');
      setTimeout(() => setSaveStatus('idle'), 3000);
    } catch (error) {
      setSaveStatus('error');
      handleFirestoreError(error, OperationType.UPDATE, `clinics/${clinicId}/settings/general`);
    } finally {
      setIsSaving(false);
    }
  };

  const updateHours = (day: DayOfWeek, field: 'isOpen' | 'start' | 'end', value: any) => {
    setSettings(prev => ({
      ...prev,
      businessHours: {
        ...prev.businessHours,
        [day]: { ...prev.businessHours[day], [field]: value }
      }
    }));
  };

  const applyPreset = (type: 'jusei' | 'shinkyu' | 'visit') => {
    const presets = {
      jusei: { signatureMode: 'standard', signatureFrequency: 'monthly', aiIntensity: 'normal' },
      shinkyu: { signatureMode: 'light', signatureFrequency: 'monthly', aiIntensity: 'normal' },
      visit: { signatureMode: 'strict', signatureFrequency: 'every_visit', aiIntensity: 'high' }
    };
    
    if (confirm('設定をプリセットの内容で上書きしますか？')) {
      setSaasSettings(presets[type] as any);
    }
  };

  if (loading) {
    return (
      <div className="h-full flex items-center justify-center">
        <Loader2 className="animate-spin text-emerald-600" size={40} />
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col gap-6 animate-in fade-in duration-500">
      {/* Header */}
      <div className="flex items-center justify-between bg-white p-6 rounded-3xl shadow-sm border border-stone-200">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-emerald-100 flex items-center justify-center text-emerald-600">
            <SettingsIcon size={24} />
          </div>
          <div>
            <h2 className="text-xl font-black text-stone-800">院設定</h2>
            <p className="text-sm text-stone-500 font-bold">クリニックの基本情報とスタッフ管理</p>
          </div>
        </div>
        <div className="flex items-center gap-4">
          {saveStatus === 'success' && (
            <span className="text-emerald-600 font-bold flex items-center gap-1 text-sm animate-in slide-in-from-right-2">
              <CheckCircle2 size={18} /> 保存しました
            </span>
          )}
          {saveStatus === 'error' && (
            <span className="text-red-600 font-bold flex items-center gap-1 text-sm animate-in shake">
              <AlertCircle size={18} /> 保存失敗
            </span>
          )}
          <button
            onClick={handleSave}
            disabled={isSaving}
            className="flex items-center gap-2 bg-emerald-600 text-white px-6 py-3 rounded-2xl font-black hover:bg-emerald-700 transition-all shadow-lg shadow-emerald-100 disabled:opacity-50 active:scale-95"
          >
            {isSaving ? <Loader2 size={20} className="animate-spin" /> : <Save size={20} />}
            設定を保存
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 p-1 bg-stone-200/50 rounded-2xl w-fit">
        {[
          { id: 'clinic', label: '基本情報', icon: Building2 },
          { id: 'hours', label: '営業時間', icon: Clock },
          { id: 'staff', label: 'スタッフ', icon: Users },
          { id: 'saas', label: 'SaaS設定', icon: Zap },
          { id: 'csvImport', label: 'CSV取り込み', icon: Upload },
          { id: 'feeMaster', label: '料金マスタ', icon: FileText },
          { id: 'plan', label: 'プラン・契約', icon: CreditCard },
          { id: 'logs', label: '監査ログ', icon: ShieldCheck },
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`flex items-center gap-2 px-6 py-2.5 rounded-xl font-black text-sm transition-all ${
              activeTab === tab.id 
                ? 'bg-white text-emerald-700 shadow-sm' 
                : 'text-stone-500 hover:text-stone-700'
            }`}
          >
            <tab.icon size={18} />
            {tab.label}
          </button>
        ))}
      </div>

      {/* Content Area */}
      <div className="flex-1 bg-white rounded-3xl shadow-sm border border-stone-200 overflow-hidden flex flex-col">
        {activeTab === 'clinic' && (
          <div className="p-8 space-y-8 max-w-2xl">
            {/* 院のメイン写真 */}
            <ImageUploader
              images={settings.photoURL ? [settings.photoURL] : []}
              onImagesChange={(urls) => setSettings(prev => ({ ...prev, photoURL: urls[0] || '' }))}
              maxImages={1}
              preset="PROPERTY"
              storagePath={`clinics/${clinicId}/settings/photos`}
              label="院の外観・内観写真"
            />
            <p className="text-[10px] text-stone-400 font-bold -mt-4">※コーポレートサイトの物件案内などに反映されます。自動的に最適化されます。</p>

            <div className="space-y-2">
              <label className="text-sm font-black text-stone-400 uppercase tracking-widest">院名</label>
              <input
                type="text"
                value={settings.name}
                onChange={(e) => setSettings({ ...settings, name: e.target.value })}
                placeholder="例：ひまわり整骨院 大塔院"
                className="w-full bg-stone-50 border-2 border-stone-100 rounded-2xl px-5 py-4 font-bold text-stone-800 focus:border-emerald-500 focus:bg-white outline-none transition-all"
              />
            </div>
            <div className="p-6 bg-emerald-50 rounded-3xl border border-emerald-100">
              <h4 className="font-black text-emerald-800 mb-2 flex items-center gap-2">
                <AlertCircle size={18} /> マルチテナント設定について
              </h4>
              <p className="text-sm text-emerald-700 font-bold leading-relaxed">
                院名は各院のレシートや問診票、予約確認メールなどに反映されます。
                正確な名称を入力してください。
              </p>
            </div>
          </div>
        )}

        {activeTab === 'hours' && (
          <div className="p-8 overflow-y-auto custom-scrollbar">
            <div className="space-y-4 max-w-3xl">
              {(Object.keys(DAYS_JA) as DayOfWeek[]).map(day => {
                const h = settings.businessHours[day];
                return (
                  <div key={day} className={`flex items-center gap-6 p-4 rounded-2xl border-2 transition-all ${h.isOpen ? 'bg-white border-stone-100' : 'bg-stone-50 border-transparent opacity-60'}`}>
                    <div className="w-24 flex items-center gap-3">
                      <input
                        type="checkbox"
                        checked={h.isOpen}
                        onChange={(e) => updateHours(day, 'isOpen', e.target.checked)}
                        className="w-6 h-6 text-emerald-600 rounded-lg border-stone-300 focus:ring-emerald-500 cursor-pointer"
                      />
                      <span className="font-black text-stone-700">{DAYS_JA[day]}曜日</span>
                    </div>
                    
                    <div className={`flex items-center gap-3 ${!h.isOpen && 'pointer-events-none'}`}>
                      <input
                        type="time"
                        value={h.start}
                        onChange={(e) => updateHours(day, 'start', e.target.value)}
                        className="bg-stone-50 border border-stone-200 rounded-xl px-3 py-2 font-bold text-stone-800 focus:ring-2 focus:ring-emerald-500 outline-none"
                      />
                      <span className="text-stone-400 font-bold">〜</span>
                      <input
                        type="time"
                        value={h.end}
                        onChange={(e) => updateHours(day, 'end', e.target.value)}
                        className="bg-stone-50 border border-stone-200 rounded-xl px-3 py-2 font-bold text-stone-800 focus:ring-2 focus:ring-emerald-500 outline-none"
                      />
                    </div>
                    
                    {!h.isOpen && <span className="text-sm font-black text-stone-400 ml-auto">休診</span>}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {activeTab === 'staff' && (
          <div className="flex-1 overflow-hidden">
            <StaffManagement />
          </div>
        )}

        {activeTab === 'saas' && (
          <div className="p-8 space-y-10 max-w-2xl overflow-y-auto custom-scrollbar">
            {/* Presets */}
            <div className="space-y-4">
              <h3 className="text-sm font-black text-stone-400 uppercase tracking-widest flex items-center gap-2">
                <Zap size={16} className="text-emerald-500" /> おすすめプリセット
              </h3>
              <div className="grid grid-cols-3 gap-3">
                {[
                  { id: 'jusei', label: '整骨院モード', icon: Building2 },
                  { id: 'shinkyu', label: '鍼灸院モード', icon: Zap },
                  { id: 'visit', label: '訪問モード', icon: Clock },
                ].map(p => (
                  <button
                    key={p.id}
                    onClick={() => applyPreset(p.id as any)}
                    className="flex flex-col items-center gap-2 p-4 rounded-2xl border-2 border-stone-100 hover:border-emerald-500 hover:bg-emerald-50/30 transition-all active:scale-95 group"
                  >
                    <div className="w-10 h-10 rounded-xl bg-stone-50 flex items-center justify-center text-stone-400 group-hover:bg-emerald-100 group-hover:text-emerald-600 transition-colors">
                      <p.icon size={20} />
                    </div>
                    <span className="text-xs font-black text-stone-600 group-hover:text-emerald-700">{p.label}</span>
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-6">
              <h3 className="text-lg font-black text-stone-800 flex items-center gap-2">
                <ShieldCheck className="text-emerald-600" /> 電子サイン設定
              </h3>
              
              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-black text-stone-400 uppercase tracking-widest">署名モード（証拠力の強さ）</label>
                  <select 
                    value={saasSettings.signatureMode}
                    onChange={(e) => setSaasSettings(prev => ({ ...prev, signatureMode: e.target.value }))}
                    className="w-full bg-stone-50 border-2 border-stone-100 rounded-2xl px-5 py-4 font-bold text-stone-800 focus:border-emerald-500 focus:bg-white outline-none transition-all"
                  >
                    <option value="light">ライト（署名のみ・スピード重視）</option>
                    <option value="standard">標準（推奨・一般的な整骨院向け）</option>
                    <option value="strict">厳格（法的証拠力・訪問診療向け）</option>
                  </select>
                  <p className="text-[10px] text-stone-400 font-bold">※厳格モードでは、署名時の位置情報やデバイス情報の記録が必須となります。トラブル防止に効果的です。</p>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-black text-stone-400 uppercase tracking-widest">署名をもらう頻度</label>
                  <select 
                    value={saasSettings.signatureFrequency}
                    onChange={(e) => setSaasSettings(prev => ({ ...prev, signatureFrequency: e.target.value }))}
                    className="w-full bg-stone-50 border-2 border-stone-100 rounded-2xl px-5 py-4 font-bold text-stone-800 focus:border-emerald-500 focus:bg-white outline-none transition-all"
                  >
                    <option value="every_visit">毎回署名（来院のたびに必ずもらう）</option>
                    <option value="monthly">月1回（その月の最初の来院時にもらう）</option>
                    <option value="monthly_plus">月1回＋必要時（基本月1回、重要な時は都度）</option>
                    <option value="none">署名なし（自費診療のみの場合など）</option>
                  </select>
                  <p className="text-[10px] text-stone-400 font-bold">※保険請求を行う場合は「月1回」または「毎回」を推奨します。</p>
                </div>
              </div>
            </div>

            <div className="pt-8 border-t border-stone-100 space-y-6">
              <h3 className="text-lg font-black text-stone-800 flex items-center gap-2">
                <Zap className="text-emerald-600" /> AIアシスタント設定
              </h3>
              
              <div className="space-y-2">
                <label className="text-sm font-black text-stone-400 uppercase tracking-widest">AIの文章作成スタイル</label>
                <select 
                  value={saasSettings.aiIntensity}
                  onChange={(e) => setSaasSettings(prev => ({ ...prev, aiIntensity: e.target.value }))}
                  className="w-full bg-stone-50 border-2 border-stone-100 rounded-2xl px-5 py-4 font-bold text-stone-800 focus:border-emerald-500 focus:bg-white outline-none transition-all"
                >
                  <option value="low">低（入力した言葉をそのまま整理）</option>
                  <option value="normal">標準（自然な文章に補完・推奨）</option>
                  <option value="high">高（専門用語を交えて詳細に作成）</option>
                </select>
                <p className="text-[10px] text-stone-400 font-bold">※「高」にすると、AIがより専門的な表現でカルテ案を作成しますが、必ず内容の確認を行ってください。</p>
              </div>
            </div>

            {/* Feature Flags (Admin Only) */}
            <div className="pt-8 border-t border-stone-100 space-y-6">
              <h3 className="text-lg font-black text-stone-800 flex items-center gap-2">
                <CreditCard className="text-emerald-600" /> 会計・支払い設定
              </h3>
              <div className="p-6 bg-orange-50 rounded-3xl border border-orange-100 flex items-center justify-between">
                <div>
                  <h4 className="font-black text-orange-800 mb-1">支払い方法のカスタマイズ</h4>
                  <p className="text-xs text-orange-600 font-bold">院で利用可能なカードブランドや電子マネーを設定します</p>
                </div>
                <button 
                  onClick={() => navigate('/ledger/settings/payment-methods')}
                  className="px-6 py-3 bg-white border-2 border-orange-200 rounded-xl font-black text-sm text-orange-700 hover:bg-orange-100 transition-all active:scale-95 flex items-center gap-2"
                >
                  設定画面へ <ChevronRight size={18} />
                </button>
              </div>
            </div>

            {/* Feature Flags (Admin Only) */}
            <div className="pt-8 border-t border-stone-100 space-y-6">
              <h3 className="text-lg font-black text-stone-800 flex items-center gap-2">
                <ShieldCheck className="text-emerald-600" /> 機能有効化（ライセンス）
              </h3>
              <div className="grid grid-cols-1 gap-3">
                {[
                  { id: 'enableAI', label: 'AIカルテ生成機能', icon: Zap, desc: 'キーワードからカルテ文章を自動作成します' },
                  { id: 'enableSignature', label: '電子サイン機能', icon: ShieldCheck, desc: 'タブレット等で患者様の署名をデジタル保存します' },
                  { id: 'enableQuestionnaire', label: 'Web問診票機能', icon: MessageSquarePlus, desc: '来院前にスマホで問診に回答いただけます' },
                  { id: 'enableHumanBodyDraw', label: '人体図メモ機能', icon: Users, desc: '人体図に直接書き込みができるようになります' },
                  { id: 'enableAiLearning', label: 'AI学習・テンプレート機能', icon: Zap, desc: '院独自の表現やよく使うフレーズを学習します' },
                  { id: 'enableVoiceInput', label: '音声入力補助機能', icon: Clock, desc: 'マイクを使ってカルテの短文入力ができます' },
                ].map(flag => (
                  <div key={flag.id} className="flex items-center justify-between p-4 bg-stone-50 rounded-2xl border border-stone-100">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center text-stone-400 shadow-sm">
                        <flag.icon size={20} />
                      </div>
                      <div>
                        <div className="text-sm font-black text-stone-700">{flag.label}</div>
                        <div className="text-[10px] text-stone-400 font-bold">{flag.desc}</div>
                      </div>
                    </div>
                    <button
                      onClick={() => setSaasFeatureFlags(prev => ({ ...prev, [flag.id]: !prev[flag.id as keyof typeof prev] }))}
                      className={`w-12 h-6 rounded-full transition-all relative ${saasFeatureFlags[flag.id as keyof typeof saasFeatureFlags] ? 'bg-emerald-500' : 'bg-stone-300'}`}
                    >
                      <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${saasFeatureFlags[flag.id as keyof typeof saasFeatureFlags] ? 'left-7' : 'left-1'}`} />
                    </button>
                  </div>
                ))}
              </div>
              <p className="text-[10px] text-stone-400 font-bold">※これらの設定は契約プランに基づいて自動的に制御される予定です。</p>
            </div>
          </div>
        )}

        {activeTab === 'feeMaster' && (
          <div className="flex-1 flex flex-col overflow-hidden">
            <div className="p-8 border-b border-stone-100 bg-stone-50/50">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-blue-100 flex items-center justify-center text-blue-600">
                    <FileText size={20} />
                  </div>
                  <div>
                    <h4 className="font-black text-stone-800">料金マスタ（準備中 / v2土台）</h4>
                    <p className="text-xs text-stone-500 font-bold">将来の保険料金改定に備えた版管理システムです。※初期設定は手入力が優先されます。</p>
                  </div>
                </div>
                <div className="px-4 py-2 bg-blue-600 text-white rounded-xl text-xs font-black opacity-50 cursor-not-allowed">
                  + 新しい版を追加（Smart Ledger 2にて提供）
                </div>
              </div>
            </div>
            
            <div className="flex-1 overflow-y-auto p-8">
              {feeMasterLoading ? (
                <div className="py-20 flex justify-center">
                  <Loader2 className="animate-spin text-stone-300" size={40} />
                </div>
              ) : feeMasters.length === 0 ? (
                <div className="py-12 px-8 bg-stone-50 rounded-[2rem] border-2 border-dashed border-stone-200 text-center">
                  <div className="w-16 h-16 bg-stone-100 rounded-full flex items-center justify-center mx-auto mb-4 text-stone-300">
                    <FileText size={32} />
                  </div>
                  <h5 className="font-black text-stone-400 mb-2">まだマスタが登録されていません</h5>
                  <p className="text-xs text-stone-400 font-bold max-w-sm mx-auto leading-relaxed">
                    現在はデフォルトの手動会計モードで動作しています。将来的に厚労省の料金改定データを取り込むための土台がここに表示されます。
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {feeMasters.map((fm) => (
                    <div key={fm.id} className={`p-6 rounded-3xl border-2 transition-all ${fm.isActive ? 'border-emerald-500 bg-emerald-50/30' : 'border-stone-100 bg-white'}`}>
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-3">
                          <span className={`px-2 py-1 rounded text-[10px] font-black uppercase tracking-wider ${fm.isActive ? 'bg-emerald-600 text-white' : 'bg-stone-200 text-stone-500'}`}>
                            {fm.isActive ? '適用中' : '過去の版'}
                          </span>
                          <h5 className="font-black text-stone-800">{fm.category === 'jusei' ? '柔道整復師' : fm.category === 'ahaki' ? 'あはき' : 'その他'} 料金マスタ</h5>
                        </div>
                        <div className="text-right">
                          <div className="text-[10px] text-stone-400 font-bold uppercase tracking-widest">施行日</div>
                          <div className="text-sm font-black text-stone-700">{fm.effectiveFrom} 〜</div>
                        </div>
                      </div>
                      <div className="flex items-center gap-4 text-xs font-bold text-stone-500">
                        <div className="flex items-center gap-1">
                          <Hash size={14} /> ID: {fm.id}
                        </div>
                        <div className="flex items-center gap-1">
                          <CheckCircle2 size={14} /> 項目数: {fm.items?.length || 0}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              <div className="mt-12 p-8 bg-stone-900 rounded-[2rem] text-white shadow-xl relative overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/10 rounded-full -mr-32 -mt-32 blur-3xl"></div>
                <div className="relative z-10">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 rounded-xl bg-emerald-500 flex items-center justify-center">
                      <Zap size={20} />
                    </div>
                    <h5 className="text-lg font-black tracking-tight">Smart Ledger 2 構想</h5>
                  </div>
                  <p className="text-sm text-stone-300 font-bold leading-relaxed mb-6">
                    「将来の料金自動化」へのロードマップ：<br />
                    1. 厚生労働省から公示される最新の料金改正データを自動検知。<br />
                    2. 新たな「版」として本マスタへ自動ドラフト保存。<br />
                    3. 管理者の承認を経て「適用」ボタンを押すと、会計画面の単価が一斉に切り替わります。
                  </p>
                  <div className="flex gap-2">
                    <span className="px-3 py-1 bg-white/10 rounded-full text-[10px] font-black tracking-widest uppercase">Version Management</span>
                    <span className="px-3 py-1 bg-white/10 rounded-full text-[10px] font-black tracking-widest uppercase">Auto Updates</span>
                    <span className="px-3 py-1 bg-white/10 rounded-full text-[10px] font-black tracking-widest uppercase">Regulatory Compliance</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'plan' && (
          <div className="p-8 space-y-8 max-w-4xl overflow-y-auto custom-scrollbar">
            {/* Current Status Banner */}
            <div className={`flex items-center justify-between p-8 rounded-[2rem] text-white shadow-xl transition-all duration-500 ${
              clinic?.billingStatus === 'trial' ? 'bg-gradient-to-br from-amber-500 to-amber-600' :
              clinic?.billingStatus === 'active' ? 'bg-gradient-to-br from-emerald-600 to-emerald-700' :
              'bg-gradient-to-br from-stone-800 to-stone-900'
            }`}>
              <div>
                <p className="text-white/70 font-bold text-sm mb-1">現在のステータス</p>
                <h3 className="text-3xl font-black flex items-center gap-3">
                  {PLAN_NAMES[clinic?.plan || 'free']}
                  <span className="px-3 py-1 bg-white/20 text-white text-xs rounded-full uppercase tracking-widest">
                    {clinic?.billingStatus?.toUpperCase() || 'FREE'}
                  </span>
                </h3>
                {clinic?.billingStatus === 'trial' && (
                  <p className="mt-2 text-sm font-bold text-amber-100">
                    トライアル終了まで残り <span className="text-lg">{trialDaysLeft}</span> 日
                  </p>
                )}
              </div>
              <div className="text-right">
                <p className="text-white/70 font-bold text-sm mb-1">お支払い状況</p>
                <p className="text-xl font-black">
                  {clinic?.billingStatus === 'past_due' ? '要確認' : '正常'}
                </p>
              </div>
            </div>

            {/* Pricing Table */}
            <div className="flex flex-col items-center mb-8">
              <div className="bg-stone-100 p-1 rounded-xl flex items-center gap-1">
                <button 
                  onClick={() => setBillingCycle('monthly')}
                  className={`px-6 py-2 rounded-lg text-xs font-black transition-all ${billingCycle === 'monthly' ? 'bg-white text-stone-800 shadow-sm' : 'text-stone-500'}`}
                >
                  月払い
                </button>
                <button 
                  onClick={() => setBillingCycle('annual')}
                  className={`px-6 py-2 rounded-lg text-xs font-black transition-all flex items-center gap-2 ${billingCycle === 'annual' ? 'bg-white text-stone-800 shadow-sm' : 'text-stone-500'}`}
                >
                  年払い <span className="px-1.5 py-0.5 bg-emerald-100 text-emerald-600 rounded text-[10px]">20% OFF</span>
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {(['starter', 'standard', 'pro'] as PlanType[]).map((p) => {
                const price = billingCycle === 'monthly' ? PLAN_PRICES[p] : PLAN_PRICES_ANNUAL[p];
                return (
                  <div key={p} className={`p-6 rounded-3xl border-2 transition-all duration-300 ${
                    clinic?.plan === p ? 'border-emerald-500 bg-emerald-50/30 ring-4 ring-emerald-500/10' : 'border-stone-100 bg-white hover:border-stone-200'
                  }`}>
                    <h4 className="font-black text-stone-800 text-lg mb-1">{PLAN_NAMES[p]}</h4>
                    <p className="text-[10px] text-stone-500 font-bold mb-4 h-8 leading-tight">{PLAN_DESCRIPTIONS[p]}</p>
                    <div className="mb-6">
                      <span className="text-3xl font-black text-stone-900">¥{price.toLocaleString()}</span>
                      <span className="text-stone-400 font-bold text-sm"> / 月</span>
                      {billingCycle === 'annual' && p !== 'starter' && (
                        <p className="text-[10px] text-emerald-600 font-black mt-1">年間 ¥{(price * 12).toLocaleString()} (一括払い)</p>
                      )}
                    </div>
                    <ul className="space-y-3 mb-8">
                    <li className="flex items-center gap-2 text-xs font-bold text-stone-600">
                      <CheckCircle2 size={14} className="text-emerald-500" /> スタッフ最大 {PLAN_CONFIG[p].maxStaffCount === Infinity ? '無制限' : `${PLAN_CONFIG[p].maxStaffCount} 名`}
                    </li>
                    <li className={`flex items-center gap-2 text-xs font-bold ${PLAN_CONFIG[p].canUseChart ? 'text-stone-600' : 'text-stone-300'}`}>
                      {PLAN_CONFIG[p].canUseChart ? <CheckCircle2 size={14} className="text-emerald-500" /> : <X size={14} />} 電子カルテ
                    </li>
                    <li className={`flex items-center gap-2 text-xs font-bold ${PLAN_CONFIG[p].canUseQuestionnaire ? 'text-stone-600' : 'text-stone-300'}`}>
                      {PLAN_CONFIG[p].canUseQuestionnaire ? <CheckCircle2 size={14} className="text-emerald-500" /> : <X size={14} />} Web問診票
                    </li>
                    <li className={`flex items-center gap-2 text-xs font-bold ${PLAN_CONFIG[p].canUseAnalytics ? 'text-stone-600' : 'text-stone-300'}`}>
                      {PLAN_CONFIG[p].canUseAnalytics ? <CheckCircle2 size={14} className="text-emerald-500" /> : <X size={14} />} 経営分析
                    </li>
                  </ul>
                  <button 
                    disabled={clinic?.plan === p}
                    className={`w-full py-3 rounded-xl font-black text-sm transition-all ${
                      clinic?.plan === p 
                        ? 'bg-stone-100 text-stone-400 cursor-default' 
                        : 'bg-emerald-600 text-white hover:bg-emerald-700 shadow-lg shadow-emerald-100 active:scale-95'
                    }`}
                  >
                    {clinic?.plan === p ? '現在のプラン' : 'プランを選択'}
                  </button>
                </div>
              );
            })}
          </div>

            <div className="p-8 bg-stone-50 rounded-[2rem] border border-stone-100">
              <h4 className="font-black text-stone-800 mb-4 flex items-center gap-2">
                <ShieldCheck size={20} className="text-emerald-600" /> お支払い情報の管理
              </h4>
              <p className="text-sm text-stone-500 font-bold mb-6">
                クレジットカード情報の変更や領収書の確認は、Stripeカスタマーポータルから行えます。
              </p>
              <button className="flex items-center gap-2 px-6 py-3 bg-white border-2 border-stone-200 rounded-xl font-black text-sm text-stone-700 hover:bg-stone-50 transition-all active:scale-95">
                <CreditCard size={18} /> Stripeポータルを開く
              </button>
            </div>
          </div>
        )}

        {activeTab === 'logs' && (
          <div className="flex-1 flex flex-col overflow-hidden">
            <div className="p-6 border-b border-stone-100 bg-stone-50/50 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <History size={20} className="text-stone-400" />
                <h4 className="font-black text-stone-800">操作履歴（最新100件）</h4>
              </div>
              <div className="relative">
                <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" />
                <input 
                  type="text" 
                  placeholder="ログを検索..." 
                  className="pl-10 pr-4 py-2 bg-white border border-stone-200 rounded-xl text-sm font-bold focus:border-emerald-500 outline-none transition-all w-64"
                />
              </div>
            </div>
            
            <div className="flex-1 overflow-y-auto custom-scrollbar">
              {logLoading ? (
                <div className="p-20 flex justify-center">
                  <Loader2 className="animate-spin text-stone-300" size={40} />
                </div>
              ) : logs.length === 0 ? (
                <div className="p-20 text-center text-stone-400 font-bold">
                  ログが見つかりません
                </div>
              ) : (
                <table className="w-full text-left border-collapse">
                  <thead className="sticky top-0 bg-white shadow-sm z-10">
                    <tr className="text-[10px] font-black text-stone-400 uppercase tracking-widest border-b border-stone-100">
                      <th className="px-6 py-4">日時</th>
                      <th className="px-6 py-4">ユーザー</th>
                      <th className="px-6 py-4">アクション</th>
                      <th className="px-6 py-4">詳細</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-stone-50">
                    {logs.map((log) => (
                      <tr key={log.id} className="hover:bg-stone-50/50 transition-colors">
                        <td className="px-6 py-4 text-xs font-bold text-stone-500 whitespace-nowrap">
                          {log.timestamp?.toDate ? log.timestamp.toDate().toLocaleString('ja-JP') : '---'}
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2">
                            <div className="w-6 h-6 rounded-full bg-stone-100 flex items-center justify-center text-[10px] font-black text-stone-500">
                              {log.userId?.substring(0, 2).toUpperCase()}
                            </div>
                            <span className="text-xs font-black text-stone-700">{log.userId}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span className={`px-2 py-1 rounded-md text-[10px] font-black uppercase tracking-wider ${
                            log.type.includes('delete') ? 'bg-red-50 text-red-600' :
                            log.type.includes('update') ? 'bg-blue-50 text-blue-600' :
                            'bg-emerald-50 text-emerald-600'
                          }`}>
                            {log.type}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-xs font-bold text-stone-600">
                          {log.details}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        )}

        {activeTab === 'csvImport' && <CsvImportSection clinicId={clinicId} userProfile={userProfile} />}
      </div>
    </div>
  );
};

import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { db, handleFirestoreError, OperationType } from '../../firebase';
import { collection, query, orderBy, limit, getDocs, Timestamp, where } from 'firebase/firestore';
import { MedicalRecord, Patient, Questionnaire } from '../../types';
import { 
  X, 
  Save, 
  History, 
  MessageSquarePlus, 
  RefreshCcw, 
  Trash2, 
  ClipboardList,
  Mic,
  MicOff,
  CheckCircle2,
  AlertCircle,
  Loader2
} from 'lucide-react';
import { safeAddDoc } from '../../lib/safeFirestore';

const QUICK_PHRASES = [
  "頚部から肩甲骨周りの緊張が強い",
  "腰部起立筋の緊張、可動域制限あり",
  "前回より症状は改善傾向",
  "日常生活でのストレッチを指導",
  "週2回程度の来院を推奨",
  "アイシングと安静を指示",
  "患部の熱感は消失",
  "しびれの範囲が縮小",
  "トリガーポイントへの刺鍼を実施",
  "手技療法により筋緊張を緩和",
];

interface ChartEditorProps {
  clinicId: string;
  patient: Patient;
  onClose: () => void;
  onSaved?: () => void;
}

export const ChartEditor: React.FC<ChartEditorProps> = ({ clinicId, patient, onClose, onSaved }) => {
  const [s, setS] = useState('');
  const [o, setO] = useState('');
  const [a, setA] = useState('');
  const [p, setP] = useState('');
  const [menu, setMenu] = useState('');
  const [activeField, setActiveField] = useState<'s' | 'o' | 'a' | 'p' | 'menu'>('s');
  
  const [isSaving, setIsSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [isCopying, setIsCopying] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const [isListening, setIsListening] = useState<string | null>(null);
  const recognitionRef = useRef<any>(null);
  const longPressTimerRef = useRef<any>(null);
  const isLongPressRef = useRef(false);
  
  const [showRestorePrompt, setShowRestorePrompt] = useState(false);
  const [draftData, setDraftData] = useState<any>(null);
  const [questionnaire, setQuestionnaire] = useState<Questionnaire | null>(null);

  // localStorageのキー
  const DRAFT_KEY = useMemo(() => `chart_draft_${patient.id}`, [patient.id]);

  // 初期化時に下書きを確認
  useEffect(() => {
    const savedDraft = localStorage.getItem(DRAFT_KEY);
    if (savedDraft) {
      try {
        const parsed = JSON.parse(savedDraft);
        // 内容が空でない場合のみプロンプトを表示
        if (parsed.s || parsed.o || parsed.a || parsed.p || parsed.menu) {
          setDraftData(parsed);
          setShowRestorePrompt(true);
        }
      } catch (e) {
        console.error('Failed to parse draft:', e);
      }
    }
  }, [DRAFT_KEY]);

  // 問診票の取得
  useEffect(() => {
    const fetchQuestionnaire = async () => {
      if (!clinicId || !patient.name) return;
      try {
        const q = query(
          collection(db, `clinics/${clinicId}/questionnaires`),
          where('name', '==', patient.name),
          orderBy('createdAt', 'desc'),
          limit(1)
        );
        const snap = await getDocs(q);
        if (!snap.empty) {
          setQuestionnaire({ id: snap.docs[0].id, ...snap.docs[0].data() } as Questionnaire);
        }
      } catch (e) {
        console.error('Failed to fetch questionnaire:', e);
      }
    };
    fetchQuestionnaire();
  }, [clinicId, patient.name]);

  // 自動保存 (Debounce 3s)
  useEffect(() => {
    // 初期化時や復元プロンプト表示中は保存しない
    if (showRestorePrompt) return;

    const timer = setTimeout(() => {
      const data = { s, o, a, p, menu, updatedAt: new Date().toISOString() };
      // 何かしら入力がある場合のみ保存
      if (s || o || a || p || menu) {
        localStorage.setItem(DRAFT_KEY, JSON.stringify(data));
      }
    }, 3000);

    return () => clearTimeout(timer);
  }, [s, o, a, p, menu, DRAFT_KEY, showRestorePrompt]);

  // 復元処理
  const handleRestore = () => {
    if (draftData) {
      setS(draftData.s || '');
      setO(draftData.o || '');
      setA(draftData.a || '');
      setP(draftData.p || '');
      setMenu(draftData.menu || '');
    }
    setShowRestorePrompt(false);
  };

  // 下書き破棄
  const handleDiscardDraft = () => {
    localStorage.removeItem(DRAFT_KEY);
    setShowRestorePrompt(false);
  };

  const stopListening = () => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
      recognitionRef.current = null;
    }
    setIsListening(null);
  };

  const startListening = (fieldId: string, setter: (val: string) => void) => {
    if (isListening) {
      stopListening();
      return;
    }

    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert("お使いのブラウザは音声入力に対応していません。");
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.lang = 'ja-JP';
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;

    recognition.onstart = () => setIsListening(fieldId);
    recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript;
      setter(transcript);
    };
    recognition.onerror = () => {
      setIsListening(null);
      recognitionRef.current = null;
    };
    recognition.onend = () => {
      setIsListening(null);
      recognitionRef.current = null;
    };
    
    recognitionRef.current = recognition;
    recognition.start();
  };

  const handleMicMouseDown = (fieldId: string, setter: (val: string) => void) => {
    isLongPressRef.current = false;
    longPressTimerRef.current = setTimeout(() => {
      isLongPressRef.current = true;
      startListening(fieldId, setter);
    }, 400);
  };

  const handleMicMouseUp = () => {
    clearTimeout(longPressTimerRef.current);
    if (isLongPressRef.current) {
      stopListening();
    }
  };

  const handleMicClick = (fieldId: string, setter: (val: string) => void) => {
    if (!isLongPressRef.current) {
      startListening(fieldId, setter);
    }
  };

  // 問診票データのインポート
  const handleImportQuestionnaire = () => {
    if (!questionnaire) return;
    setIsImporting(true);
    
    const symptomsText = `【主訴】\n${questionnaire.symptom}\n\n【いつから】\n${questionnaire.whenText}\n\n【場所】\n${questionnaire.whereText}\n\n【きっかけ】\n${questionnaire.triggerText}`;
    const objectiveText = `【補足】\n${questionnaire.freeText || 'なし'}`;
    
    if (questionnaire.aiGenerated) {
      setS(prev => prev ? `${prev}\n\n${questionnaire.aiGenerated?.chiefComplaint}` : questionnaire.aiGenerated?.chiefComplaint || '');
      setO(prev => prev ? `${prev}\n\n${questionnaire.aiGenerated?.injuryMechanism}` : questionnaire.aiGenerated?.injuryMechanism || '');
    } else {
      setS(prev => prev ? `${prev}\n\n${symptomsText}` : symptomsText);
      setO(prev => prev ? `${prev}\n\n${objectiveText}` : objectiveText);
    }
    
    setIsImporting(false);
    setQuestionnaire(null); // 一度インポートしたら非表示に
  };

  // 日付の初期値
  const today = useMemo(() => {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
  }, []);

  // 前回カルテのコピー
  const handleCopyPrevious = async () => {
    if (!clinicId || !patient.id) return;
    setIsCopying(true);
    try {
      const q = query(
        collection(db, `clinics/${clinicId}/medicalRecords`),
        where('patientDocId', '==', patient.id),
        orderBy('createdAt', 'desc'),
        limit(1)
      );
      const snapshot = await getDocs(q);
      if (!snapshot.empty) {
        const prev = snapshot.docs[0].data() as MedicalRecord;
        setS(prev.s || '');
        setO(prev.o || '');
        setA(prev.a || '');
        setP(prev.p || '');
        setMenu(prev.menu || '');
      } else {
        alert('前回のカルテが見つかりませんでした');
      }
    } catch (e) {
      handleFirestoreError(e, OperationType.GET, `clinics/${clinicId}/medicalRecords`);
    } finally {
      setIsCopying(false);
    }
  };

  // 定型文の挿入
  const insertPhrase = (phrase: string) => {
    const setterMap = { s: setS, o: setO, a: setA, p: setP, menu: setMenu };
    const currentValMap = { s, o, a, p, menu };
    const setter = setterMap[activeField];
    const currentVal = currentValMap[activeField];
    
    if (setter) {
      const newVal = currentVal ? `${currentVal}\n${phrase}` : phrase;
      setter(newVal);
    }
  };

  const handleSave = async () => {
    if (!clinicId || !patient.id || isSaving) return;
    setIsSaving(true);
    setSaveStatus('idle');

    try {
      const recordData: Omit<MedicalRecord, 'id'> & { patientDocId: string } = {
        date: today,
        s, o, a, p,
        menu,
        chiefComplaint: s.split('\n')[0] || '', // Sの1行目を主訴とする（簡易設計）
        patientDocId: patient.id,
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now(),
        images: [],
      };

      await safeAddDoc(
        clinicId,
        `clinics/${clinicId}/medicalRecords`,
        recordData,
        'medical_record_save',
        `${patient.name}様のカルテを保存しました`,
        'canUseChart'
      );
      
      // 保存成功時に下書きを削除
      localStorage.removeItem(DRAFT_KEY);
      
      setSaveStatus('success');
      setTimeout(() => {
        if (onSaved) onSaved();
        onClose();
      }, 1000);
    } catch (e) {
      setSaveStatus('error');
      handleFirestoreError(e, OperationType.CREATE, `clinics/${clinicId}/medicalRecords`);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-stone-900/60 backdrop-blur-sm flex items-center justify-center z-[100] p-4">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden animate-in fade-in zoom-in duration-200">
        {/* Header */}
        <div className="p-6 border-b border-stone-100 flex items-center justify-between bg-stone-50/50">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-emerald-600 text-white flex items-center justify-center font-bold text-lg shadow-lg shadow-emerald-100">
              {patient.patientId}
            </div>
            <div>
              <h2 className="text-xl font-bold text-stone-800">{patient.name} 様</h2>
              <p className="text-xs text-stone-500 font-medium">カルテ入力: {today}</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            {questionnaire && (
              <button
                onClick={handleImportQuestionnaire}
                disabled={isImporting}
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-50 text-emerald-700 font-bold hover:bg-emerald-100 transition-all active:scale-95 disabled:opacity-50 border border-emerald-200"
              >
                {isImporting ? <Loader2 size={18} className="animate-spin" /> : <ClipboardList size={18} />}
                問診票を引用
              </button>
            )}
            <button
              onClick={handleCopyPrevious}
              disabled={isCopying}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-stone-600 font-bold hover:bg-stone-100 transition-all active:scale-95 disabled:opacity-50 border border-stone-200"
            >
              {isCopying ? <Loader2 size={18} className="animate-spin" /> : <History size={18} />}
              前回コピー
            </button>
            <button
              onClick={onClose}
              className="p-2.5 text-stone-400 hover:text-stone-600 hover:bg-stone-100 rounded-xl transition-all"
            >
              <X size={24} />
            </button>
          </div>
        </div>

        {/* Restore Prompt */}
        {showRestorePrompt && (
          <div className="bg-amber-50 border-b border-amber-100 p-4 flex items-center justify-between animate-in slide-in-from-top duration-300">
            <div className="flex items-center gap-3 text-amber-800">
              <div className="w-10 h-10 rounded-full bg-amber-100 flex items-center justify-center">
                <RefreshCcw size={20} className="text-amber-600" />
              </div>
              <div>
                <p className="font-bold text-sm">未保存のデータがあります</p>
                <p className="text-xs opacity-80">前回の入力内容を復元しますか？</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={handleDiscardDraft}
                className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-stone-500 font-bold text-xs hover:bg-stone-200/50 transition-colors"
              >
                <Trash2 size={14} /> 破棄
              </button>
              <button
                onClick={handleRestore}
                className="bg-amber-600 text-white px-4 py-2 rounded-lg font-bold text-xs hover:bg-amber-700 transition-all shadow-sm active:scale-95"
              >
                復元する
              </button>
            </div>
          </div>
        )}

        {/* Main Content */}
        <div className="flex-1 overflow-hidden flex flex-col md:flex-row">
          {/* Editor Area */}
          <div className="flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar">
            <div className="grid grid-cols-1 gap-6">
              {[
                { id: 's', label: 'S (主観的所見)', value: s, setter: setS, placeholder: '患者さんの訴え、痛み、違和感など' },
                { id: 'o', label: 'O (客観的所見)', value: o, setter: setO, placeholder: '検査、触診、姿勢、可動域など' },
                { id: 'a', label: 'A (評価・見立て)', value: a, setter: setA, placeholder: '原因の考察、専門的な判断' },
                { id: 'p', label: 'P (計画・処置)', value: p, setter: setP, placeholder: '本日の施術、今後の計画、指導' },
                { id: 'menu', label: '施術メニュー', value: menu, setter: setMenu, placeholder: '例: 全身調整、鍼灸' },
              ].map((field) => (
                <div key={field.id} className="space-y-2">
                  <div className="flex justify-between items-center">
                    <label className="text-xs font-black text-stone-400 uppercase tracking-widest flex items-center gap-2">
                      {field.label}
                      {activeField === field.id && <span className="text-emerald-500 animate-pulse">入力中</span>}
                    </label>
                    <button 
                      onMouseDown={() => handleMicMouseDown(field.id, (val) => field.setter(field.value ? `${field.value}\n${val}` : val))}
                      onMouseUp={handleMicMouseUp}
                      onTouchStart={() => handleMicMouseDown(field.id, (val) => field.setter(field.value ? `${field.value}\n${val}` : val))}
                      onTouchEnd={handleMicMouseUp}
                      onClick={() => handleMicClick(field.id, (val) => field.setter(field.value ? `${field.value}\n${val}` : val))}
                      className={`p-1.5 rounded-full transition-colors relative ${isListening === field.id ? 'bg-red-500 text-white animate-pulse' : 'text-stone-300 hover:text-emerald-600'}`}
                      title="音声入力（長押しで録音）"
                    >
                      {isListening === field.id ? <MicOff size={16} /> : <Mic size={16} />}
                      {isListening === field.id && isLongPressRef.current && (
                        <span className="absolute -top-8 left-1/2 -translate-x-1/2 bg-red-500 text-white text-[8px] px-1 rounded whitespace-nowrap">録音中</span>
                      )}
                    </button>
                  </div>
                  <textarea
                    value={field.value}
                    onChange={(e) => field.setter(e.target.value)}
                    onFocus={() => setActiveField(field.id as any)}
                    placeholder={field.placeholder}
                    className={`w-full p-4 rounded-2xl border-2 transition-all outline-none min-h-[100px] leading-relaxed text-stone-800 font-medium ${
                      activeField === field.id 
                        ? 'border-emerald-500 bg-emerald-50/10 ring-4 ring-emerald-500/5' 
                        : 'border-stone-100 bg-stone-50/30 hover:border-stone-200'
                    }`}
                  />
                </div>
              ))}
            </div>
          </div>

          {/* Quick Phrases Sidebar */}
          <div className="w-full md:w-72 bg-stone-50 border-l border-stone-100 p-6 overflow-y-auto flex flex-col gap-4">
            <h3 className="text-sm font-black text-stone-400 uppercase tracking-widest flex items-center gap-2">
              <MessageSquarePlus size={16} /> 定型文
            </h3>
            <div className="flex flex-wrap md:flex-col gap-2">
              {QUICK_PHRASES.map((phrase, i) => (
                <button
                  key={i}
                  onClick={() => insertPhrase(phrase)}
                  className="text-left px-4 py-3 rounded-xl bg-white border border-stone-200 text-sm text-stone-700 font-bold hover:border-emerald-500 hover:text-emerald-600 hover:shadow-md transition-all active:scale-95"
                >
                  {phrase}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-stone-100 bg-stone-50/50 flex items-center justify-between">
          <div className="flex items-center gap-2">
            {saveStatus === 'success' && (
              <span className="flex items-center gap-1.5 text-emerald-600 font-bold animate-in slide-in-from-left-2">
                <CheckCircle2 size={20} /> 保存しました
              </span>
            )}
            {saveStatus === 'error' && (
              <span className="flex items-center gap-1.5 text-red-600 font-bold animate-in shake">
                <AlertCircle size={20} /> 保存に失敗しました
              </span>
            )}
          </div>
          <div className="flex items-center gap-4">
            <button
              onClick={onClose}
              className="px-6 py-3 text-stone-500 font-bold hover:text-stone-700 transition-colors"
            >
              キャンセル
            </button>
            <button
              onClick={handleSave}
              disabled={isSaving}
              className={`flex items-center gap-2 px-10 py-3.5 rounded-2xl font-black text-lg transition-all shadow-xl active:scale-95 disabled:opacity-50 ${
                saveStatus === 'success' 
                  ? 'bg-emerald-100 text-emerald-700' 
                  : 'bg-emerald-600 text-white hover:bg-emerald-700 shadow-emerald-100'
              }`}
            >
              {isSaving ? <Loader2 size={24} className="animate-spin" /> : <Save size={24} />}
              {isSaving ? '保存中...' : 'カルテを保存'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { db, handleFirestoreError, OperationType, storage } from '../../firebase';
import { doc, Timestamp, getDoc } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { MedicalRecord, Patient, RecordImage, ImageGroup, Reservation, Questionnaire } from '../../types';
import { GoogleGenAI } from '@google/genai';
import { Camera, X, Sparkles, Loader2, User, ArrowLeft, Save, CheckSquare, Square, Plus, ClipboardCopy } from 'lucide-react';
import { optimizeImage, uploadOptimizedImage, OPTIMIZATION_PRESETS } from '../../utils/imageUploadOptimizer';
import { safeAddDoc, safeUpdateDoc } from '../../lib/safeFirestore';
import { useSaaS } from '../../hooks/useSaaS';
import { Lock } from 'lucide-react';

const BODY_PARTS = ['首', '頭', '肩', '背中', '腰', '骨盤', '腕', '手', '脚', '足', '全身', 'その他'];
const CATEGORY_OPTIONS = ['柔整', '鍼灸', '訪問鍼灸'];

export interface MedicalRecordFormProps {
  clinicId: string;
  patient: Patient;
  onSaved?: () => void;
}

export const MedicalRecordForm: React.FC<MedicalRecordFormProps> = ({ clinicId, patient, onSaved }) => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { featureFlags, loading: saasLoading } = useSaaS();
  const reservationId = searchParams.get('reservationId');

  const patientId = patient.id;

  const [date, setDate] = useState(() => {
    const now = new Date();
    const offset = now.getTimezoneOffset() * 60000;
    return new Date(now.getTime() - offset).toISOString().split('T')[0];
  });
  
  const [chiefComplaint, setChiefComplaint] = useState('');
  const [s, setS] = useState('');
  const [o, setO] = useState('');
  const [a, setA] = useState('');
  const [p, setP] = useState('');
  const [menu, setMenu] = useState('');
  const [staffName, setStaffName] = useState('');
  const [categories, setCategories] = useState<string[]>([]);
  
  const [imageGroups, setImageGroups] = useState<{ id: string; label: string; images: { id: string; file?: File; url: string; isProtected: boolean }[] }[]>([
    { id: 'default', label: '基本画像', images: [] }
  ]);
  
  const [aiBodyParts, setAiBodyParts] = useState<string[]>([]);
  const [aiKeywords, setAiKeywords] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [questionnaireData, setQuestionnaireData] = useState<Questionnaire | null>(null);

  useEffect(() => {
    const fetchReservation = async () => {
      if (!clinicId || !reservationId) return;
      try {
        const docRef = doc(db, `clinics/${clinicId}/reservations`, reservationId);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          const resData = docSnap.data() as Reservation;
          if (resData.menu) setMenu(resData.menu);
          if (resData.date) setDate(resData.date);
          
          // Fetch staff name if staffId exists
          if (resData.staffId) {
            const staffRef = doc(db, `clinics/${clinicId}/staff`, resData.staffId);
            const staffSnap = await getDoc(staffRef);
            if (staffSnap.exists()) {
              setStaffName(staffSnap.data().name);
            }
          }

          // Fetch questionnaire if exists
          if (resData.questionnaireId) {
            const qRef = doc(db, `clinics/${clinicId}/questionnaires`, resData.questionnaireId);
            const qSnap = await getDoc(qRef);
            if (qSnap.exists()) {
              setQuestionnaireData({ id: qSnap.id, ...qSnap.data() } as Questionnaire);
            }
          } else if (resData.questionnaire) {
            // Support embedded questionnaire if any
            setQuestionnaireData({ id: 'embedded', ...resData.questionnaire } as any);
          }
        }
      } catch (error) {
        console.error('Failed to fetch reservation:', error);
      }
    };
    fetchReservation();
  }, [clinicId, reservationId]);

  const applyQuestionnaire = () => {
    if (!questionnaireData) return;

    if (questionnaireData.aiGenerated) {
      if (questionnaireData.aiGenerated.chiefComplaint) {
        setChiefComplaint(questionnaireData.aiGenerated.chiefComplaint);
      }
      if (questionnaireData.aiGenerated.injuryMechanism) {
        setS(questionnaireData.aiGenerated.injuryMechanism);
      }
    } else {
      setChiefComplaint(questionnaireData.symptom || '');
      const sText = `${questionnaireData.whenText || ''}、${questionnaireData.whereText || ''}にて${questionnaireData.triggerText || ''}を契機に${questionnaireData.symptom || ''}に痛みが出現。${questionnaireData.freeText || ''}`;
      setS(sText);
    }
    
    // 部位の自動選択（簡易マッチング）
    if (questionnaireData.symptom) {
      const parts = BODY_PARTS.filter(p => questionnaireData.symptom.includes(p));
      if (parts.length > 0) {
        setAiBodyParts(prev => Array.from(new Set([...prev, ...parts])));
      }
    }
  };

  const handleImageUploadToGroup = async (e: React.ChangeEvent<HTMLInputElement>, groupId: string) => {
    const files = Array.from(e.target.files || []);
    const groupIndex = imageGroups.findIndex(g => g.id === groupId);
    if (groupIndex === -1) return;
    
    const currentImages = imageGroups[groupIndex].images;

    if (currentImages.length + files.length > 15) {
      alert('1項目につき画像は最大15枚までです。');
      return;
    }

    const newImages = [];
    for (const file of files) {
      try {
        const optimizedBlob = await optimizeImage(file, OPTIMIZATION_PRESETS.MEDICAL_RECORD);
        const url = URL.createObjectURL(optimizedBlob);
        const optimizedFile = new File([optimizedBlob], file.name.replace(/\.[^/.]+$/, "") + ".webp", { type: 'image/webp' });
        newImages.push({
          id: Math.random().toString(36).substring(7),
          file: optimizedFile,
          url,
          isProtected: false
        });
      } catch (error) {
        console.error('Image optimization error:', error);
      }
    }
    
    let updatedImages = [...currentImages, ...newImages];
    if (updatedImages.length > 15) {
      const protectedImages = updatedImages.filter(img => img.isProtected);
      const unprotectedImages = updatedImages.filter(img => !img.isProtected);
      
      const excessCount = updatedImages.length - 15;
      if (unprotectedImages.length >= excessCount) {
        unprotectedImages.splice(0, excessCount);
        updatedImages = [...protectedImages, ...unprotectedImages];
      } else {
        alert('保護された画像が多すぎるため、これ以上追加できません。');
        return;
      }
    }
    
    const newGroups = [...imageGroups];
    newGroups[groupIndex].images = updatedImages;
    setImageGroups(newGroups);
    if (e.target) e.target.value = '';
  };

  const toggleImageProtection = (groupId: string, imageId: string) => {
    setImageGroups(imageGroups.map(g => {
      if (g.id === groupId) {
        return { ...g, images: g.images.map(img => img.id === imageId ? { ...img, isProtected: !img.isProtected } : img) };
      }
      return g;
    }));
  };

  const removeImage = (groupId: string, imageId: string) => {
    setImageGroups(imageGroups.map(g => {
      if (g.id === groupId) {
        return { ...g, images: g.images.filter(img => img.id !== imageId) };
      }
      return g;
    }));
  };

  const addImageGroup = () => {
    setImageGroups([...imageGroups, { id: Math.random().toString(36).substring(7), label: `追加項目 ${imageGroups.length}`, images: [] }]);
  };

  const updateImageGroupLabel = (groupId: string, label: string) => {
    setImageGroups(imageGroups.map(g => g.id === groupId ? { ...g, label } : g));
  };

  const removeImageGroup = (groupId: string) => {
    if (window.confirm('この画像項目を削除しますか？')) {
      setImageGroups(imageGroups.filter(g => g.id !== groupId));
    }
  };

  const toggleCategory = (cat: string) => {
    setCategories(prev => prev.includes(cat) ? prev.filter(c => c !== cat) : [...prev, cat]);
  };

  const toggleBodyPart = (part: string) => {
    setAiBodyParts(prev => prev.includes(part) ? prev.filter(p => p !== part) : [...prev, part]);
  };

  const generateAIRecord = async () => {
    if (!aiKeywords && aiBodyParts.length === 0) {
      alert('部位またはキーワードを入力してください。');
      return;
    }

    setIsGenerating(true);
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
      const prompt = `
あなたは優秀な柔道整復師・鍼灸師です。以下の情報を元に、丁寧なトーンでSOAP形式の施術記録を作成してください。
出力はJSON形式で、キーは "s", "o", "a", "p" としてください。

【施術区分】
${categories.join('、') || '指定なし'}
（※区分に応じて、専門用語やアプローチ方法を適切に調整してください）

【対象部位】
${aiBodyParts.join('、') || '指定なし'}

【施術内容・キーワード】
${aiKeywords || '指定なし'}

【出力フォーマット（JSON）】
{
  "s": "患者の主観的な訴え（丁寧な文体で）",
  "o": "客観的な所見、検査結果、姿勢の評価など",
  "a": "評価、見立て、原因の考察",
  "p": "本日の施術内容（部位と手技）、今後の治療計画、生活指導など"
}
`;

      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: prompt,
        config: {
          responseMimeType: 'application/json',
        }
      });

      if (response.text) {
        const result = JSON.parse(response.text);
        setS(result.s || '');
        setO(result.o || '');
        setA(result.a || '');
        setP(result.p || '');
      }
    } catch (error) {
      console.error('AI Generation Error:', error);
      alert('AIによる生成に失敗しました。');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSave = async () => {
    if (!clinicId || !patientId) return;
    if (!date) {
      alert('日付を入力してください。');
      return;
    }
    
    if (!window.confirm('この内容でカルテを保存しますか？')) {
      return;
    }

    setIsSaving(true);
    try {
      const uploadedImageGroups: ImageGroup[] = [];
      for (const group of imageGroups) {
        const uploadedImages: RecordImage[] = [];
        for (const img of group.images) {
          if (img.file) {
            const storagePath = `clinics/${clinicId}/patients/${patientId}/records`;
            const downloadUrl = await uploadOptimizedImage(img.file, storagePath, 'MEDICAL_RECORD');
            uploadedImages.push({
              url: downloadUrl,
              createdAt: Timestamp.now(),
              isProtected: img.isProtected
            });
          } else {
            uploadedImages.push({
              url: img.url,
              createdAt: Timestamp.now(),
              isProtected: img.isProtected
            });
          }
        }
        uploadedImageGroups.push({
          id: group.id,
          label: group.label,
          images: uploadedImages
        });
      }

      const recordData: Omit<MedicalRecord, 'id'> & { patientDocId: string } = {
        date,
        staffName,
        categories,
        chiefComplaint,
        s,
        o,
        a,
        p,
        menu,
        images: [], // 後方互換性のため空配列
        imageGroups: uploadedImageGroups,
        patientDocId: patientId, // フラット構造のため患者IDを保持
        aiPromptData: {
          bodyParts: aiBodyParts,
          keywords: aiKeywords,
          categories
        },
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now(),
      };

      await safeAddDoc(
        clinicId,
        `clinics/${clinicId}/medicalRecords`,
        recordData,
        'medical_record_save',
        `${patient.name}様のカルテを保存しました`,
        'canUseChart'
      );
      
      // Update patient's lastVisit
      await safeUpdateDoc(
        clinicId,
        `clinics/${clinicId}/patients`,
        patientId,
        {
          lastVisit: Timestamp.now(),
          updatedAt: Timestamp.now()
        }
      );

      // Clear form
      setChiefComplaint('');
      setS('');
      setO('');
      setA('');
      setP('');
      setMenu('');
      setImageGroups([{ id: 'default', label: '基本画像', images: [] }]);
      setAiKeywords('');
      setAiBodyParts([]);
      setCategories([]);

      if (onSaved) {
        onSaved();
      }
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, `clinics/${clinicId}/patients/${patientId}/records`);
    } finally {
      setIsSaving(false);
    }
  };

  if (saasLoading) return <div className="p-8 text-stone-500">読み込み中...</div>;

  if (!featureFlags.canUseChart) {
    return (
      <div className="h-full bg-stone-50 rounded-2xl border-2 border-dashed border-stone-200 flex flex-col items-center justify-center p-8 text-center">
        <div className="w-16 h-16 rounded-full bg-stone-100 flex items-center justify-center text-stone-400 mb-4">
          <Lock size={32} />
        </div>
        <h3 className="text-lg font-bold text-stone-800 mb-2">カルテ機能は制限されています</h3>
        <p className="text-stone-500 text-sm mb-6 max-w-xs">
          現在のプランではカルテの作成・保存ができません。スタンダードプラン以上にアップグレードしてご利用ください。
        </p>
        <button
          onClick={() => navigate('/ledger/settings')}
          className="bg-emerald-600 text-white px-6 py-3 rounded-xl font-bold hover:bg-emerald-700 transition-all shadow-md"
        >
          プランを確認する
        </button>
      </div>
    );
  }

  return (
    <div className="h-full overflow-y-auto bg-white rounded-2xl shadow-sm border border-stone-200 p-6 custom-scrollbar">
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <h2 className="text-xl font-bold text-stone-800 flex items-center gap-2">
              <Sparkles size={20} className="text-emerald-600" /> 新規カルテ作成
            </h2>
            {questionnaireData && (
              <button
                onClick={applyQuestionnaire}
                className="flex items-center gap-1.5 bg-stone-800 text-white px-4 py-2 rounded-xl text-sm font-bold hover:bg-stone-700 transition-all shadow-sm active:scale-95"
                title="問診内容をカルテに反映します"
              >
                <ClipboardCopy size={16} />
                問診を反映
              </button>
            )}
          </div>
          <button
            onClick={handleSave}
            disabled={isSaving}
            className="flex items-center gap-2 bg-emerald-600 text-white px-6 py-3 rounded-xl font-bold hover:bg-emerald-700 transition-colors disabled:opacity-50"
          >
            {isSaving ? <Loader2 size={20} className="animate-spin" /> : <Save size={20} />}
            {isSaving ? '保存中...' : 'カルテを保存'}
          </button>
        </div>

        <div className="space-y-8">
          <div className="flex items-center gap-4 pb-6 border-b border-stone-100">
            <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold text-xl">
              {patient.patientId}
            </div>
            <div>
              <h3 className="text-lg font-bold text-stone-800">{patient.name}</h3>
              <p className="text-stone-500 text-sm">患者番号: {patient.patientId}</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            <div>
              <label className="block text-sm font-bold text-stone-600 mb-2">日付</label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full bg-stone-50 border border-stone-200 rounded-xl px-4 py-3 font-bold text-stone-800 focus:ring-2 focus:ring-emerald-500 outline-none"
              />
            </div>
            <div>
              <label className="block text-sm font-bold text-stone-600 mb-2 flex items-center gap-2"><User size={16}/> 担当スタッフ</label>
              <input
                type="text"
                value={staffName}
                onChange={(e) => setStaffName(e.target.value)}
                placeholder="担当者名"
                className="w-full bg-stone-50 border border-stone-200 rounded-xl px-4 py-3 font-medium text-stone-800 focus:ring-2 focus:ring-emerald-500 outline-none"
              />
            </div>
          </div>

          <div className="mb-8">
            <label className="block text-sm font-bold text-stone-600 mb-2">施術区分（複数選択可）</label>
            <div className="flex flex-wrap gap-3">
              {CATEGORY_OPTIONS.map(cat => (
                <label key={cat} className="flex items-center gap-2 cursor-pointer bg-stone-50 px-4 py-2 rounded-xl border border-stone-200 hover:border-emerald-500 transition-colors">
                  <input
                    type="checkbox"
                    checked={categories.includes(cat)}
                    onChange={() => toggleCategory(cat)}
                    className="w-4 h-4 text-emerald-600 rounded border-stone-300 focus:ring-emerald-500"
                  />
                  <span className="font-bold text-stone-700">{cat}</span>
                </label>
              ))}
            </div>
          </div>

          <div className="mb-8">
            <label className="block text-sm font-bold text-stone-600 mb-2">主訴</label>
            <input
              type="text"
              value={chiefComplaint}
              onChange={(e) => setChiefComplaint(e.target.value)}
              placeholder="例：右肩の痛み、腰の重だるさ"
              className="w-full bg-stone-50 border border-stone-200 rounded-xl px-4 py-3 font-medium text-stone-800 focus:ring-2 focus:ring-emerald-500 outline-none"
            />
          </div>

          <div className="mb-8">
            <label className="block text-sm font-bold text-stone-600 mb-2">施術メニュー</label>
            <input
              type="text"
              value={menu}
              onChange={(e) => setMenu(e.target.value)}
              placeholder="例：全身調整コース、鍼灸治療"
              className="w-full bg-stone-50 border border-stone-200 rounded-xl px-4 py-3 font-medium text-stone-800 focus:ring-2 focus:ring-emerald-500 outline-none"
            />
          </div>

          {/* AI Generation Section */}
          <div className="bg-emerald-50 rounded-2xl p-6 border border-emerald-100 mb-8">
            <h3 className="text-sm font-bold text-emerald-800 flex items-center gap-2 mb-4">
              <Sparkles size={18} /> AIカルテ生成アシスト
            </h3>
            
            <div className="mb-4">
              <label className="block text-xs font-bold text-emerald-700 mb-2">対象部位（複数選択可）</label>
              <div className="flex flex-wrap gap-2">
                {BODY_PARTS.map(part => (
                  <button
                    key={part}
                    onClick={() => toggleBodyPart(part)}
                    className={`px-3 py-1.5 rounded-lg text-sm font-bold transition-colors ${
                      aiBodyParts.includes(part)
                        ? 'bg-emerald-600 text-white'
                        : 'bg-white text-emerald-700 border border-emerald-200 hover:bg-emerald-100'
                    }`}
                  >
                    {part}
                  </button>
                ))}
              </div>
            </div>

            <div className="mb-4">
              <label className="block text-xs font-bold text-emerald-700 mb-2">施術内容・キーワード</label>
              <input
                type="text"
                value={aiKeywords}
                onChange={(e) => setAiKeywords(e.target.value)}
                placeholder="例：筋膜リリース、骨盤矯正、右肩挙上時痛"
                className="w-full bg-white border border-emerald-200 rounded-xl px-4 py-3 font-medium text-stone-800 focus:ring-2 focus:ring-emerald-500 outline-none"
              />
            </div>

            <button
              onClick={generateAIRecord}
              disabled={isGenerating || (!aiKeywords && aiBodyParts.length === 0)}
              className="bg-emerald-600 text-white px-6 py-3 rounded-xl font-bold hover:bg-emerald-700 transition-colors disabled:opacity-50 flex items-center justify-center gap-2 w-full sm:w-auto"
            >
              {isGenerating ? <Loader2 size={18} className="animate-spin" /> : <Sparkles size={18} />}
              {isGenerating ? 'AIでSOAPを生成中...' : 'AIでSOAPを生成'}
            </button>
          </div>

          {/* SOAP Fields */}
          <div className="space-y-6 mb-8">
            <div>
              <label className="block text-sm font-bold text-stone-600 mb-2">S (Subjective) - 主観的情報</label>
              <textarea
                value={s}
                onChange={(e) => setS(e.target.value)}
                placeholder="患者の訴え、症状の経過など"
                className="w-full bg-stone-50 border border-stone-200 rounded-xl px-4 py-3 font-medium text-stone-800 focus:ring-2 focus:ring-emerald-500 outline-none min-h-[100px] leading-relaxed"
              />
            </div>
            <div>
              <label className="block text-sm font-bold text-stone-600 mb-2">O (Objective) - 客観的情報</label>
              <textarea
                value={o}
                onChange={(e) => setO(e.target.value)}
                placeholder="検査結果、姿勢、可動域、触診所見など"
                className="w-full bg-stone-50 border border-stone-200 rounded-xl px-4 py-3 font-medium text-stone-800 focus:ring-2 focus:ring-emerald-500 outline-none min-h-[100px] leading-relaxed"
              />
            </div>
            <div>
              <label className="block text-sm font-bold text-stone-600 mb-2">A (Assessment) - 評価</label>
              <textarea
                value={a}
                onChange={(e) => setA(e.target.value)}
                placeholder="SとOに基づく専門的な評価、見立て"
                className="w-full bg-stone-50 border border-stone-200 rounded-xl px-4 py-3 font-medium text-stone-800 focus:ring-2 focus:ring-emerald-500 outline-none min-h-[100px] leading-relaxed"
              />
            </div>
            <div>
              <label className="block text-sm font-bold text-stone-600 mb-2">P (Plan) - 計画・施術内容</label>
              <textarea
                value={p}
                onChange={(e) => setP(e.target.value)}
                placeholder="本日の施術内容、今後の治療計画、生活指導など"
                className="w-full bg-stone-50 border border-stone-200 rounded-xl px-4 py-3 font-medium text-stone-800 focus:ring-2 focus:ring-emerald-500 outline-none min-h-[100px] leading-relaxed"
              />
            </div>
          </div>

          {/* Images */}
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <label className="block text-sm font-bold text-stone-600">画像添付</label>
              <button
                onClick={addImageGroup}
                className="flex items-center gap-1 text-sm font-bold text-emerald-600 hover:text-emerald-700 bg-emerald-50 px-3 py-1.5 rounded-lg transition-colors"
              >
                <Plus size={16} /> 項目を追加
              </button>
            </div>

            {imageGroups.map((group, index) => (
              <div key={group.id} className="bg-stone-50 rounded-xl p-4 border border-stone-200">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex-1 mr-4">
                    <input
                      type="text"
                      value={group.label}
                      onChange={(e) => updateImageGroupLabel(group.id, e.target.value)}
                      placeholder="項目名（例：右肩エコー、姿勢分析）"
                      className="w-full bg-white border border-stone-200 rounded-lg px-3 py-2 text-sm font-bold text-stone-800 focus:ring-2 focus:ring-emerald-500 outline-none"
                    />
                  </div>
                  <div className="flex items-center gap-4">
                    <span className="text-xs font-bold text-stone-500">{group.images.length} / 15枚</span>
                    {index > 0 && (
                      <button
                        onClick={() => removeImageGroup(group.id)}
                        className="text-stone-400 hover:text-red-500 transition-colors"
                        title="この項目を削除"
                      >
                        <X size={20} />
                      </button>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-5 gap-4">
                  {group.images.map((img) => (
                    <div key={img.id} className="relative aspect-square rounded-xl overflow-hidden border border-stone-200 group/img">
                      <img src={img.url} alt="添付画像" className="w-full h-full object-cover" />
                      
                      <div className="absolute top-0 left-0 right-0 p-2 bg-gradient-to-b from-black/50 to-transparent flex justify-between items-start opacity-0 group-hover/img:opacity-100 transition-opacity">
                        <button
                          onClick={() => toggleImageProtection(group.id, img.id)}
                          className="text-white hover:text-emerald-400 transition-colors"
                          title={img.isProtected ? "保護を解除" : "画像を保護"}
                        >
                          {img.isProtected ? <CheckSquare size={18} className="text-emerald-400" /> : <Square size={18} />}
                        </button>
                        <button
                          onClick={() => removeImage(group.id, img.id)}
                          className="text-white hover:text-red-400 transition-colors"
                        >
                          <X size={18} />
                        </button>
                      </div>
                      {img.isProtected && (
                        <div className="absolute bottom-2 left-2 bg-emerald-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded">
                          保護
                        </div>
                      )}
                    </div>
                  ))}
                  
                  {group.images.length < 15 && (
                    <label className="aspect-square rounded-xl border-2 border-dashed border-stone-300 flex flex-col items-center justify-center text-stone-400 hover:border-emerald-500 hover:text-emerald-500 cursor-pointer transition-colors bg-white">
                      <Camera size={24} />
                      <span className="text-xs mt-1 font-bold">追加</span>
                      <input type="file" accept="image/*" multiple className="hidden" onChange={(e) => handleImageUploadToGroup(e, group.id)} />
                    </label>
                  )}
                </div>
              </div>
            ))}
            <p className="text-xs text-stone-500 mt-2">
              ※1項目につき15枚を超える場合、保護されていない古い画像から自動的に削除されます。残したい画像はチェックを入れて保護してください。
            </p>
          </div>

        </div>
      </div>
    </div>
  );
};

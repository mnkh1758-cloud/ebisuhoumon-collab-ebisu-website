import React, { useState, useEffect, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
import { db, handleFirestoreError, OperationType } from '../../firebase';
import { Timestamp, doc, updateDoc } from 'firebase/firestore';
import { 
  CheckCircle2, 
  AlertCircle, 
  Loader2, 
  ClipboardCheck, 
  ChevronRight, 
  ChevronLeft,
  MessageSquare,
  Sparkles,
  Mic,
  MicOff,
  Search,
  MapPin
} from 'lucide-react';
import { safeAddDoc, validateClinicId } from '../../lib/safeFirestore';
import { GoogleGenAI } from '@google/genai';

const SYMPTOM_OPTIONS = ['首痛', '腰痛', '肩', '膝', 'その他'];
const WHEN_OPTIONS = ['今日', '昨日', '数日前', '1週間以上'];
const WHERE_OPTIONS = ['自宅', '職場', '外出先', '不明'];
const TRIGGER_OPTIONS = ['起床時', '運動時', '仕事中', '不明'];

export const PublicQuestionnaire: React.FC = () => {
  const [searchParams] = useSearchParams();
  const clinicId = searchParams.get('clinicId') || 'default';
  const reservationId = searchParams.get('reservationId');

  const [step, setStep] = useState(0);
  const [formData, setFormData] = useState({
    symptom: '',
    whenText: '',
    whereText: '',
    triggerText: '',
    freeText: '',
    zipcode: '',
    addressText: '',
    address: {
      postalCode: '',
      prefecture: '',
      city: '',
      town: '',
      detail: ''
    }
  });

  const [isSearchingZip, setIsSearchingZip] = useState(false);
  const [zipError, setZipError] = useState<string | null>(null);
  const addressInputRef = useRef<HTMLInputElement>(null);
  const lastSearchedZipRef = useRef<string>('');

  const searchZipcode = async (zip: string) => {
    const cleanZip = zip.replace(/-/g, '');
    if (cleanZip.length !== 7) return;
    if (cleanZip === lastSearchedZipRef.current) return;

    setIsSearchingZip(true);
    setZipError(null);

    try {
      const res = await fetch(`https://zipcloud.ibsnet.co.jp/api/search?zipcode=${cleanZip}`);
      const data = await res.json();

      if (data.status === 200 && data.results) {
        const result = data.results[0];
        const address1 = result.address1;
        const address2 = result.address2;
        const address3 = result.address3;
        const fullAddress = `${address1}${address2}${address3}`;
        
        setFormData(prev => ({ 
          ...prev, 
          addressText: fullAddress,
          address: {
            ...prev.address,
            postalCode: cleanZip,
            prefecture: address1,
            city: address2,
            town: address3,
            detail: ''
          }
        }));
        lastSearchedZipRef.current = cleanZip;
        
        // 取得成功後、少し待ってから番地入力欄へフォーカス
        setTimeout(() => {
          addressInputRef.current?.focus();
        }, 100);
      } else {
        setZipError(data.message || '該当する住所が見つかりませんでした');
        lastSearchedZipRef.current = '';
      }
    } catch (error) {
      setZipError('通信エラーが発生しました');
      lastSearchedZipRef.current = '';
    } finally {
      setIsSearchingZip(false);
    }
  };

  const handleZipChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setFormData(prev => ({ 
      ...prev, 
      zipcode: val,
      address: {
        ...prev.address,
        postalCode: val.replace(/-/g, '')
      }
    }));
    
    const cleanZip = val.replace(/-/g, '');
    if (cleanZip.length === 7 && !isSearchingZip && cleanZip !== lastSearchedZipRef.current) {
      searchZipcode(cleanZip);
    }
  };

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [status, setStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [aiPreview, setAiPreview] = useState<{ chiefComplaint: string; injuryMechanism: string } | null>(null);

  const [isListening, setIsListening] = useState(false);
  const recognitionRef = useRef<any>(null);
  const longPressTimerRef = useRef<any>(null);
  const isLongPressRef = useRef(false);

  const handleSelect = (field: keyof typeof formData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (step < 3) {
      setStep(step + 1);
    }
  };

  const generateAiContent = async () => {
    if (!process.env.GEMINI_API_KEY) {
      // 簡易テンプレ
      const today = new Date();
      const dateStr = `R8年${today.getMonth() + 1}月${today.getDate()}日`;
      return {
        chiefComplaint: `${formData.symptom}の痛み`,
        injuryMechanism: `${dateStr}、${formData.whereText}にて${formData.triggerText}を契機に${formData.symptom}に痛みが出現。その後、${formData.freeText || '症状'}を認める。`
      };
    }

    setIsGenerating(true);
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

      const today = new Date();
      const dateStr = `R8年${today.getMonth() + 1}月${today.getDate()}日`;

      const prompt = `
        あなたは整骨院の優秀な受付アシスタントです。
        以下の問診データから、カルテ用の「主訴」と「受傷機序」を生成してください。

        【問診データ】
        症状: ${formData.symptom}
        いつ: ${formData.whenText}
        どこで: ${formData.whereText}
        きっかけ: ${formData.triggerText}
        補足: ${formData.freeText}

        【生成ルール】
        - 主訴: 簡潔に（例：右腰部の疼痛）
        - 受傷機序: 以下の形式をベースに自然な文章にすること
          「${dateStr}、{場所}にて{動作}を契機に{部位}に痛みが出現。その後、{補足}を認める。」
        - 「外力が加わり負傷」などの表現は避け、「痛みが出現」「症状を認める」に統一すること。
        - JSON形式で出力してください： {"chiefComplaint": "...", "injuryMechanism": "..."}
      `;

      const response = await ai.models.generateContent({
        model: 'gemini-2.0-flash',
        contents: [{ role: 'user', parts: [{ text: prompt }] }]
      });
      
      const text = response.candidates?.[0]?.content?.parts?.[0]?.text || '';
      const jsonMatch = text.match(/\{.*\}/s);
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0]);
      }
      throw new Error('Invalid AI response');
    } catch (error) {
      console.error('AI Generation error:', error);
      // 失敗時の簡易テンプレ
      const today = new Date();
      const dateStr = `R8年${today.getMonth() + 1}月${today.getDate()}日`;
      return {
        chiefComplaint: `${formData.symptom}の痛み`,
        injuryMechanism: `${dateStr}、${formData.whereText}にて${formData.triggerText}を契機に${formData.symptom}に痛みが出現。その後、${formData.freeText || '症状'}を認める。`
      };
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSubmit = async () => {
    if (isSubmitting) return;

    setIsSubmitting(true);
    setStatus('idle');
    setErrorMessage(null);

    try {
      validateClinicId(clinicId);

      // AI生成を実行
      const aiResult = await generateAiContent();

      const data = {
        ...formData,
        reservationId,
        status: 'submitted',
        aiGenerated: aiResult,
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now(),
      };

      const docRef = await safeAddDoc(
        clinicId,
        `clinics/${clinicId}/questionnaires`,
        data,
        undefined,
        undefined,
        'canUseQuestionnaire'
      );

      // 予約データに紐付け
      if (reservationId) {
        await updateDoc(doc(db, `clinics/${clinicId}/reservations`, reservationId), {
          questionnaireId: docRef.id,
          updatedAt: Timestamp.now()
        });
      }

      setStatus('success');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (error: any) {
      console.error('Questionnaire submission error:', error);
      setStatus('error');
      setErrorMessage(error.message || '送信に失敗しました。');
    } finally {
      setIsSubmitting(false);
    }
  };

  const stopListening = () => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
      recognitionRef.current = null;
    }
    setIsListening(false);
  };

  const startListening = () => {
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

    recognition.onstart = () => setIsListening(true);
    recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript;
      setFormData(prev => ({ ...prev, freeText: prev.freeText ? `${prev.freeText} ${transcript}` : transcript }));
    };
    recognition.onerror = () => {
      setIsListening(false);
      recognitionRef.current = null;
    };
    recognition.onend = () => {
      setIsListening(false);
      recognitionRef.current = null;
    };
    
    recognitionRef.current = recognition;
    recognition.start();
  };

  const handleMicMouseDown = () => {
    isLongPressRef.current = false;
    longPressTimerRef.current = setTimeout(() => {
      isLongPressRef.current = true;
      startListening();
    }, 400);
  };

  const handleMicMouseUp = () => {
    clearTimeout(longPressTimerRef.current);
    if (isLongPressRef.current) {
      stopListening();
    }
  };

  const handleMicClick = () => {
    if (!isLongPressRef.current) {
      startListening();
    }
  };

  if (status === 'success') {
    return (
      <div className="min-h-screen bg-stone-50 flex items-center justify-center p-6">
        <div className="bg-white p-10 rounded-3xl shadow-xl max-w-md w-full text-center space-y-6 animate-in fade-in zoom-in duration-300">
          <div className="w-20 h-20 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto">
            <CheckCircle2 size={48} />
          </div>
          <h2 className="text-2xl font-black text-stone-800">問診が完了しました</h2>
          <p className="text-stone-500 font-bold leading-relaxed">
            ご協力ありがとうございました。<br />
            そのままお待ちください。
          </p>
        </div>
      </div>
    );
  }

  const steps = [
    { title: '症状', field: 'symptom', options: SYMPTOM_OPTIONS },
    { title: 'いつ', field: 'whenText', options: WHEN_OPTIONS },
    { title: 'どこで', field: 'whereText', options: WHERE_OPTIONS },
    { title: 'きっかけ', field: 'triggerText', options: TRIGGER_OPTIONS },
  ];

  return (
    <div className="min-h-screen bg-stone-50 py-6 px-4">
      <div className="max-w-md mx-auto">
        {/* Progress Bar */}
        <div className="flex gap-1 mb-6">
          {[0, 1, 2, 3, 4].map((i) => (
            <div 
              key={i} 
              className={`h-1.5 flex-1 rounded-full transition-all duration-500 ${
                i <= step ? 'bg-emerald-500' : 'bg-stone-200'
              }`}
            />
          ))}
        </div>

        <div className="bg-white rounded-3xl shadow-xl overflow-hidden border border-stone-200 min-h-[500px] flex flex-col">
          {/* Header */}
          <div className="bg-emerald-600 p-6 text-white">
            <h1 className="text-xl font-black flex items-center gap-2">
              <ClipboardCheck size={24} /> 電子問診票
            </h1>
          </div>

          {/* Step Content */}
          <div className="flex-1 p-6 flex flex-col">
            {step < 4 ? (
              <div className="space-y-6 animate-in slide-in-from-right duration-300">
                <h2 className="text-2xl font-black text-stone-800">
                  {steps[step].title}を教えてください
                </h2>
                <div className="grid grid-cols-1 gap-3">
                  {steps[step].options.map(option => (
                    <button
                      key={option}
                      onClick={() => handleSelect(steps[step].field as any, option)}
                      className={`p-5 rounded-2xl font-black text-lg text-left transition-all flex items-center justify-between group ${
                        formData[steps[step].field as keyof typeof formData] === option
                          ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-100 scale-[1.02]'
                          : 'bg-stone-50 text-stone-600 hover:bg-stone-100 active:scale-95'
                      }`}
                    >
                      {option}
                      <ChevronRight size={20} className={formData[steps[step].field as keyof typeof formData] === option ? 'opacity-100' : 'opacity-0 group-hover:opacity-100 transition-opacity'} />
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              <div className="space-y-8 animate-in slide-in-from-right duration-300">
                {/* 住所入力エリア */}
                <div className="space-y-4">
                  <h2 className="text-xl font-black text-stone-800 flex items-center gap-2">
                    <MapPin className="text-emerald-600" /> ご住所（任意）
                  </h2>
                  <div className="space-y-4 bg-white p-5 rounded-2xl border-2 border-stone-100">
                    <div>
                      <label className="block text-sm font-bold text-stone-600 mb-2">郵便番号</label>
                      <div className="flex gap-2">
                        <input
                          type="text"
                          value={formData.zipcode}
                          onChange={handleZipChange}
                          placeholder="8571234 または 857-1234"
                          className="flex-1 p-3 bg-stone-50 border-2 border-stone-100 rounded-xl focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/5 outline-none font-bold transition-all text-lg"
                        />
                        <button
                          onClick={() => searchZipcode(formData.zipcode)}
                          disabled={isSearchingZip || formData.zipcode.replace(/-/g, '').length < 7}
                          className="px-5 bg-stone-800 text-white rounded-xl font-bold disabled:opacity-50 flex items-center gap-2 hover:bg-stone-700 active:scale-95 transition-all"
                        >
                          {isSearchingZip ? <Loader2 size={18} className="animate-spin" /> : <Search size={18} />}
                          検索
                        </button>
                      </div>
                      {zipError && <p className="text-red-500 text-sm font-bold mt-2">{zipError}</p>}
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-stone-600 mb-2">住所（都道府県・市区町村・番地・建物名）</label>
                      <input
                        ref={addressInputRef}
                        type="text"
                        value={formData.addressText}
                        onChange={e => {
                          const val = e.target.value;
                          setFormData(prev => {
                            const base = `${prev.address.prefecture}${prev.address.city}${prev.address.town}`;
                            let newDetail = val;
                            if (base && val.startsWith(base)) {
                              newDetail = val.substring(base.length);
                            }
                            return {
                              ...prev,
                              addressText: val,
                              address: {
                                ...prev.address,
                                detail: newDetail
                              }
                            };
                          });
                        }}
                        placeholder="長崎県佐世保市..."
                        className="w-full p-3 bg-stone-50 border-2 border-stone-100 rounded-xl focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/5 outline-none font-bold transition-all text-lg"
                      />
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <h2 className="text-xl font-black text-stone-800 flex items-center gap-2">
                      <MessageSquare className="text-emerald-600" /> 最後に一言（任意）
                    </h2>
                    <button 
                      onMouseDown={handleMicMouseDown}
                      onMouseUp={handleMicMouseUp}
                      onTouchStart={handleMicMouseDown}
                      onTouchEnd={handleMicMouseUp}
                      onClick={handleMicClick}
                      className={`p-3 rounded-full transition-all shadow-md relative ${isListening ? 'bg-red-500 text-white animate-pulse scale-110' : 'bg-white text-stone-400 hover:text-emerald-600'}`}
                      title="音声入力（長押しで録音）"
                    >
                      {isListening ? <MicOff size={24} /> : <Mic size={24} />}
                      {isListening && isLongPressRef.current && (
                        <span className="absolute -top-10 left-1/2 -translate-x-1/2 bg-red-500 text-white text-[10px] px-2 py-1 rounded whitespace-nowrap shadow-lg">録音中</span>
                      )}
                    </button>
                  </div>
                  <textarea
                    value={formData.freeText}
                    onChange={e => setFormData({ ...formData, freeText: e.target.value })}
                    placeholder="例：今日中に治したい、以前も同じ場所を痛めたなど"
                    className="w-full p-5 bg-stone-50 border-2 border-stone-100 rounded-2xl focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/5 outline-none font-bold transition-all min-h-[150px] text-lg"
                  />
                  
                  <div className="bg-emerald-50 p-4 rounded-2xl border border-emerald-100">
                    <p className="text-emerald-700 text-sm font-bold flex items-center gap-1">
                      <Sparkles size={14} /> AIがカルテの下書きを自動生成します
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Navigation */}
            <div className="mt-auto pt-6 flex gap-3">
              {step > 0 && (
                <button
                  onClick={() => setStep(step - 1)}
                  className="flex-1 py-4 bg-stone-100 text-stone-600 rounded-2xl font-black flex items-center justify-center gap-2 active:scale-95 transition-all"
                >
                  <ChevronLeft size={20} /> 戻る
                </button>
              )}
              {step === 4 ? (
                <button
                  onClick={handleSubmit}
                  disabled={isSubmitting}
                  className="flex-[2] py-4 bg-emerald-600 text-white rounded-2xl font-black text-lg shadow-xl shadow-emerald-100 hover:bg-emerald-700 active:scale-95 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {isSubmitting ? <Loader2 className="animate-spin" /> : <ClipboardCheck />}
                  {isSubmitting ? '送信中...' : '問診を完了する'}
                </button>
              ) : (
                step < 4 && formData[steps[step].field as keyof typeof formData] && (
                  <button
                    onClick={() => setStep(step + 1)}
                    className="flex-1 py-4 bg-emerald-600 text-white rounded-2xl font-black flex items-center justify-center gap-2 active:scale-95 transition-all"
                  >
                    次へ <ChevronRight size={20} />
                  </button>
                )
              )}
            </div>
          </div>
        </div>

        {status === 'error' && (
          <div className="mt-4 p-4 bg-red-50 border border-red-100 rounded-2xl flex items-center gap-3 text-red-600 font-bold">
            <AlertCircle size={20} />
            {errorMessage}
          </div>
        )}

        <p className="text-center text-stone-400 text-[10px] mt-6 font-bold">
          Smart Ledger1 Questionnaire Engine v2<br />
          // TODO: 人体図連動 / 音声入力 / LINE連携
        </p>
      </div>
    </div>
  );
};

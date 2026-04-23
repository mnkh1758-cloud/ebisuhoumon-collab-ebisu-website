import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { db } from '../../../firebase';
import { doc, getDoc, updateDoc, Timestamp, serverTimestamp } from 'firebase/firestore';
import { 
  ClipboardCheck, 
  User, 
  Calendar, 
  Clock, 
  AlertCircle, 
  Loader2, 
  CheckCircle2,
  ChevronRight,
  MessageSquare,
  Stethoscope,
  MapPin,
  History
} from 'lucide-react';

export const PatientQuestionnaire: React.FC = () => {
  const [searchParams] = useSearchParams();
  const clinicId = searchParams.get('clinicId');
  const reservationId = searchParams.get('reservationId');
  const token = searchParams.get('token');

  const [reservation, setReservation] = useState<any>(null);
  const [clinic, setClinic] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const [formData, setFormData] = useState({
    chiefComplaint: '',
    sinceWhen: '',
    bodyPart: '',
    trigger: '',
    memo: ''
  });

  // Load reservation data
  useEffect(() => {
    const fetchData = async () => {
      if (!clinicId || !reservationId || !token) {
        const missing = [];
        if (!clinicId) missing.push('clinicId');
        if (!reservationId) missing.push('reservationId');
        if (!token) missing.push('token');
        setError(`必要なパラメータ（${missing.join(', ')}）が不足しています。正しいリンクからアクセスしてください。`);
        setLoading(false);
        return;
      }

      try {
        const resRef = doc(db, `clinics/${clinicId}/reservations`, reservationId);
        const resSnap = await getDoc(resRef);

        if (!resSnap.exists()) {
          setError('予約情報が見つかりませんでした。');
          setLoading(false);
          return;
        }

        const resData = resSnap.data();

        // Token validation
        if (!resData.accessToken || resData.accessToken !== token) {
          setError('このリンクは無効です。受付へお声がけください。');
          setLoading(false);
          return;
        }

        setReservation({ id: resSnap.id, ...resData });

        // If existing questionnaire, fill form
        if (resData.questionnaire) {
          setFormData({
            chiefComplaint: resData.questionnaire.chiefComplaint || '',
            sinceWhen: resData.questionnaire.sinceWhen || '',
            bodyPart: resData.questionnaire.bodyPart || '',
            trigger: resData.questionnaire.trigger || '',
            memo: resData.questionnaire.memo || ''
          });
          if (resData.questionnaireStatus === 'submitted') {
            setSubmitted(true);
          }
        }

        // Fetch clinic info (optional)
        const clinicRef = doc(db, 'clinics', clinicId);
        const clinicSnap = await getDoc(clinicRef);
        if (clinicSnap.exists()) {
          setClinic(clinicSnap.data());
        }

      } catch (err: any) {
        console.error('Fetch error:', err);
        setError('データの読み込みに失敗しました。');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [clinicId, reservationId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!clinicId || !reservationId) return;

    if (!formData.chiefComplaint.trim()) {
      alert('一番つらい症状を入力してください。');
      return;
    }

    setIsSubmitting(true);
    try {
      const resRef = doc(db, `clinics/${clinicId}/reservations`, reservationId);
      
      const questionnaire = {
        ...formData,
        submittedAt: serverTimestamp(),
        submittedBy: 'patient',
        status: 'submitted'
      };

      await updateDoc(resRef, {
        questionnaire,
        questionnaireStatus: 'submitted',
        updatedAt: serverTimestamp()
      });

      setSubmitted(true);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (err: any) {
      console.error('Submission error:', err);
      alert('送信に失敗しました。受付へお声がけください。');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-stone-50 flex flex-col items-center justify-center p-6">
        <Loader2 className="w-12 h-12 text-emerald-600 animate-spin mb-4" />
        <p className="text-stone-500 font-bold">読み込み中...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-stone-50 flex items-center justify-center p-6">
        <div className="bg-white p-8 rounded-3xl shadow-xl max-w-md w-full text-center space-y-6">
          <div className="w-16 h-16 bg-red-100 text-red-600 rounded-full flex items-center justify-center mx-auto">
            <AlertCircle size={32} />
          </div>
          <h2 className="text-xl font-black text-stone-800">エラーが発生しました</h2>
          <p className="text-stone-500 font-bold leading-relaxed">{error}</p>
        </div>
      </div>
    );
  }

  if (submitted) {
    return (
      <div className="min-h-screen bg-stone-50 flex items-center justify-center p-6">
        <div className="bg-white p-10 rounded-3xl shadow-xl max-w-md w-full text-center space-y-6 animate-in fade-in zoom-in duration-300">
          <div className="w-20 h-20 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto">
            <CheckCircle2 size={48} />
          </div>
          <h2 className="text-2xl font-black text-stone-800">送信が完了しました。</h2>
          <p className="text-stone-500 font-bold leading-relaxed text-lg">
            受付へお声がけください。
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-stone-50 py-10 px-4 flex flex-col items-center">
      <div className="max-w-xl w-full space-y-8">
        {/* Header Section */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-emerald-600 text-white rounded-2xl shadow-lg mb-4">
            <ClipboardCheck size={32} />
          </div>
          <h1 className="text-3xl font-black text-stone-800 tracking-tight">問診票入力</h1>
          <p className="text-emerald-600 font-bold bg-emerald-50 inline-block px-3 py-1 rounded-full text-xs mb-2">入力内容は安全に保存されます</p>
          <p className="text-stone-500 font-bold mt-2">受付で案内された内容をご入力ください</p>
          <p className="text-[10px] text-stone-400 mt-1">事前に案内された方のみご利用ください</p>
        </div>

        {/* Info Card */}
        <div className="bg-white rounded-2xl shadow-sm border border-stone-100 overflow-hidden">
          <div className="bg-stone-50 px-6 py-4 border-b border-stone-100 flex items-center gap-2">
            <History size={18} className="text-stone-400" />
            <h2 className="text-sm font-black text-stone-600 uppercase tracking-widest">予約内容の確認</h2>
          </div>
          <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-stone-100 flex items-center justify-center text-stone-400">
                <User size={20} />
              </div>
              <div>
                <p className="text-[10px] font-black text-stone-400 uppercase tracking-widest">患者名</p>
                <p className="text-lg font-black text-stone-800">{reservation.patientName} 様</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-stone-100 flex items-center justify-center text-stone-400">
                <Calendar size={20} />
              </div>
              <div>
                <p className="text-[10px] font-black text-stone-400 uppercase tracking-widest">予約日</p>
                <p className="text-lg font-black text-stone-800">{reservation.date}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-stone-100 flex items-center justify-center text-stone-400">
                <Clock size={20} />
              </div>
              <div>
                <p className="text-[10px] font-black text-stone-400 uppercase tracking-widest">時間</p>
                <p className="text-lg font-black text-stone-800">{reservation.startTime} 〜</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-100 flex items-center justify-center text-emerald-600">
                <Stethoscope size={20} />
              </div>
              <div>
                <p className="text-[10px] font-black text-emerald-600 uppercase tracking-widest">当院</p>
                <p className="text-lg font-black text-emerald-700">{clinic?.name || 'えびす鍼灸整骨院'}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Form Section */}
        <form onSubmit={handleSubmit} className="bg-white rounded-[2rem] shadow-xl shadow-stone-200/50 p-8 space-y-8 border border-white">
          
          <div className="space-y-6">
            {/* Chief Complaint */}
            <div className="space-y-3">
              <label className="flex items-center gap-2 text-stone-800 font-black">
                <span className="w-1.5 h-4 bg-emerald-500 rounded-full"></span>
                今日一番つらい症状（主訴）<span className="text-red-500 text-xs ml-1">必須</span>
              </label>
              <input 
                type="text"
                required
                value={formData.chiefComplaint}
                onChange={e => setFormData({...formData, chiefComplaint: e.target.value})}
                placeholder="例：右側の腰が痛む、首が回らない"
                className="w-full bg-stone-50 border-2 border-transparent focus:border-emerald-400 focus:bg-white rounded-2xl px-5 py-4 outline-none transition-all font-bold text-stone-800 text-lg"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Since When */}
              <div className="space-y-3">
                <label className="flex items-center gap-2 text-stone-800 font-black">
                  <span className="w-1.5 h-4 bg-blue-500 rounded-full"></span>
                  いつから
                </label>
                <input 
                  type="text"
                  value={formData.sinceWhen}
                  onChange={e => setFormData({...formData, sinceWhen: e.target.value})}
                  placeholder="例：3日前から、今朝起きてから"
                  className="w-full bg-stone-50 border-2 border-transparent focus:border-blue-400 focus:bg-white rounded-2xl px-5 py-4 outline-none transition-all font-bold text-stone-800 text-lg"
                />
              </div>

              {/* Body Part */}
              <div className="space-y-3">
                <label className="flex items-center gap-2 text-stone-800 font-black">
                  <span className="w-1.5 h-4 bg-purple-500 rounded-full"></span>
                  どこがつらいか
                </label>
                <input 
                  type="text"
                  value={formData.bodyPart}
                  onChange={e => setFormData({...formData, bodyPart: e.target.value})}
                  placeholder="例：腰の右下、肩甲骨の内側"
                  className="w-full bg-stone-50 border-2 border-transparent focus:border-purple-400 focus:bg-white rounded-2xl px-5 py-4 outline-none transition-all font-bold text-stone-800 text-lg"
                />
              </div>
            </div>

            {/* Trigger */}
            <div className="space-y-3">
              <label className="flex items-center gap-2 text-stone-800 font-black">
                <span className="w-1.5 h-4 bg-orange-500 rounded-full"></span>
                きっかけ・原因（思い当たるもの）
              </label>
              <textarea 
                value={formData.trigger}
                onChange={e => setFormData({...formData, trigger: e.target.value})}
                placeholder="例：重い物を持った、デスクワーク中、スポーツ中"
                className="w-full bg-stone-50 border-2 border-transparent focus:border-orange-400 focus:bg-white rounded-2xl px-5 py-4 outline-none transition-all font-bold text-stone-800 text-lg h-24 resize-none"
              />
            </div>

            {/* Memo */}
            <div className="space-y-3">
              <label className="flex items-center gap-2 text-stone-800 font-black text-sm">
                <MessageSquare size={16} className="text-stone-400" />
                その他、伝えておきたいこと（自由記入）
              </label>
              <textarea 
                value={formData.memo}
                onChange={e => setFormData({...formData, memo: e.target.value})}
                placeholder="例：以前も同じ場所を痛めた、特定の動きで痛む"
                className="w-full bg-stone-50 border-2 border-transparent focus:border-stone-400 focus:bg-white rounded-2xl px-5 py-4 outline-none transition-all font-bold text-stone-800 text-lg h-32 resize-none"
              />
            </div>
          </div>

          <div className="pt-4">
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-5 bg-emerald-600 text-white rounded-[1.5rem] text-xl font-black shadow-xl shadow-emerald-100 hover:bg-emerald-700 active:scale-[0.98] transition-all flex items-center justify-center gap-3 disabled:opacity-50"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="animate-spin" />
                  送信中…
                </>
              ) : (
                <>
                  送信する
                  <ChevronRight />
                </>
              )}
            </button>
            <p className="text-center text-stone-400 text-xs mt-6 font-bold">
              ※ 送信後、自動的に受付へ通知されます。
            </p>
          </div>
        </form>
      </div>
    </div>
  );
};

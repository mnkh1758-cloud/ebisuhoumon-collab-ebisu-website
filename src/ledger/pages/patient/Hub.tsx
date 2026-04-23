import React from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { 
  Calendar, 
  Search, 
  ClipboardCheck, 
  MessageSquare, 
  ChevronRight, 
  MapPin,
  ExternalLink,
  Info,
  Sparkles
} from 'lucide-react';

/**
 * PatientHub: 患者用ハブページ
 * LINEリッチメニュー等からの主要な入口となるページ。
 */
export const PatientHub: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const clinicId = searchParams.get('clinicId');

  // スクロール用
  const scrollToQuestionnaire = () => {
    const element = document.getElementById('questionnaire-info');
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="min-h-screen bg-stone-50 py-10 px-4 flex flex-col items-center">
      <div className="max-w-md w-full space-y-6">
        
        {/* Header */}
        <div className="text-center space-y-3">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-emerald-600 text-white rounded-3xl shadow-xl mb-2 rotate-3">
            <ClipboardCheck size={40} />
          </div>
          <h1 className="text-3xl font-black text-stone-800 tracking-tight">ご予約・問診</h1>
          <div className="bg-emerald-50 text-emerald-700 px-4 py-2 rounded-2xl border border-emerald-100 mt-2">
            <p className="text-xs font-black">次回からはLINEから簡単に予約できます</p>
          </div>
        </div>

        {/* Main Buttons */}
        <div className="space-y-4">
          <button 
            onClick={() => navigate('/予約')}
            className="w-full bg-blue-600 hover:bg-blue-700 p-6 rounded-[2rem] shadow-xl shadow-blue-200 flex items-center justify-between group transition-all active:scale-[0.98] text-white border-2 border-blue-500 hover:border-blue-400"
          >
            <div className="flex items-center gap-5">
              <div className="w-16 h-16 bg-white/20 text-white rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform shadow-inner">
                <Calendar size={32} />
              </div>
              <div className="text-left">
                <p className="text-2xl font-black text-white tracking-wide">予約する</p>
                <p className="text-sm text-blue-100 font-bold mt-1">24時間いつでも受付中</p>
              </div>
            </div>
            <ChevronRight className="text-white opacity-70 group-hover:translate-x-1 group-hover:opacity-100 transition-all w-8 h-8" />
          </button>

          <button 
            onClick={() => alert('現在準備中です。')}
            className="w-full bg-white hover:bg-stone-50 border-2 border-stone-100 p-5 rounded-3xl shadow-sm flex items-center justify-between group transition-all active:scale-[0.98]"
          >
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-stone-100 text-stone-400 rounded-xl flex items-center justify-center">
                <Search size={24} />
              </div>
              <div className="text-left">
                <p className="text-lg font-black text-stone-800">予約を確認する</p>
                <p className="text-[11px] text-stone-400 font-bold">現在準備中</p>
              </div>
            </div>
            <ChevronRight className="text-stone-300" />
          </button>

          <button 
            onClick={scrollToQuestionnaire}
            className="w-full bg-white hover:bg-emerald-50 border-2 border-stone-100 hover:border-emerald-200 p-5 rounded-3xl shadow-sm flex items-center justify-between group transition-all active:scale-[0.98]"
          >
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-emerald-50 text-emerald-600 rounded-xl flex items-center justify-center group-hover:rotate-12 transition-transform">
                <ClipboardCheck size={24} />
              </div>
              <div className="text-left">
                <p className="text-lg font-black text-stone-800">問診票について</p>
                <p className="text-[11px] text-emerald-600/70 font-bold">基本は受付でQRをご案内します</p>
              </div>
            </div>
            <ChevronRight className="text-stone-300 group-hover:translate-y-1 transition-transform" />
          </button>
        </div>

        <div id="questionnaire-info" className="bg-stone-900 rounded-[2.5rem] p-8 text-white space-y-4 shadow-2xl shadow-stone-900/50">
          <div className="flex items-center gap-3">
            <Sparkles size={24} className="text-emerald-400" />
            <h2 className="text-xl font-black tracking-tight">問診票の入力方法</h2>
          </div>
          <p className="font-bold leading-relaxed opacity-90 text-sm">
            待ち時間短縮のため「問診票は受付でQRコードをご案内します」。
          </p>
          <div className="bg-white/5 rounded-2xl p-5 border border-white/10 space-y-3">
            <div className="flex gap-3">
              <div className="w-6 h-6 bg-emerald-500 rounded-full flex items-center justify-center text-[10px] font-black shrink-0">1</div>
              <p className="text-xs font-bold leading-relaxed">
                受付でスタッフが案内する<span className="text-emerald-400 font-black">「問診QRコード」</span>をスマホで読み取ってください。
              </p>
            </div>
            <div className="flex gap-3">
              <div className="w-6 h-6 bg-emerald-500 rounded-full flex items-center justify-center text-[10px] font-black shrink-0">2</div>
              <p className="text-xs font-bold leading-relaxed">
                セキュリティ保護された専用の問診画面が表示されます。
              </p>
            </div>
          </div>
          <p className="text-[10px] text-stone-500 font-bold text-center mt-6">
            ※ 事前入力が必要な場合のみ、案内されたリンクをご利用ください。
          </p>
        </div>

        {/* Secondary Buttons */}
        <div className="grid grid-cols-2 gap-4">
          <a 
            href="#" // LINE起動等の処理
            className="bg-white p-5 rounded-3xl border border-stone-100 shadow-sm flex flex-col items-center gap-2 group hover:bg-stone-50 transition-all active:scale-95"
          >
            <MessageSquare size={24} className="text-stone-400 group-hover:text-emerald-500 transition-colors" />
            <span className="text-xs font-black text-stone-600 tracking-wider">LINEで相談</span>
          </a>
          <button 
            onClick={() => navigate('/予約')}
            className="bg-stone-800 p-5 rounded-3xl shadow-xl flex flex-col items-center gap-2 group hover:bg-stone-900 transition-all active:scale-95 text-white border border-stone-700"
          >
            <Calendar size={24} className="text-stone-300 group-hover:scale-110 transition-transform" />
            <span className="text-xs font-black tracking-wider text-stone-100">次回予約はこちら</span>
          </button>
        </div>

        {/* Footer info */}
        <div className="pt-10 text-center">
          <p className="text-[10px] text-stone-400 font-bold tracking-widest uppercase">
            © {new Date().getFullYear()} Ebisu Acupuncture & Orthopedic Clinic
          </p>
        </div>

      </div>
    </div>
  );
};

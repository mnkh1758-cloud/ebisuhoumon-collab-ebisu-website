import React, { useEffect } from 'react';
import { CalendarClock, Store, Laptop, CheckCircle2, Info, ChevronRight } from 'lucide-react';
import { Link } from 'react-router-dom';

export const ReservationPage: React.FC = () => {
  useEffect(() => {
    window.scrollTo(0, 0);
    document.title = "施術を予約する｜えびす鍼灸整骨院";
    const metaDescription = document.querySelector('meta[name="description"]');
    if (metaDescription) {
      metaDescription.setAttribute("content", "佐世保市のえびす鍼灸整骨院の予約ページです。ご希望の院をお選びください。");
    }
  }, []);

  const clinics = [
    { name: 'えびす鍼灸整骨院 大塔院', path: '/予約/大塔院', color: 'bg-blue-600', hoverColor: 'hover:bg-blue-700', iconColor: 'text-blue-600', badge: '🟦' },
    { name: 'えびす鍼灸整骨院 早岐院', path: '/予約/早岐院', color: 'bg-green-600', hoverColor: 'hover:bg-green-700', iconColor: 'text-green-600', badge: '🟩' },
    { name: 'えびす鍼灸整骨院 矢峰院', path: '/予約/矢峰院', color: 'bg-orange-500', hoverColor: 'hover:bg-orange-600', iconColor: 'text-orange-500', badge: '🟧' },
  ];

  return (
    <main className="bg-stone-50 min-h-screen pt-20">
      {/* Hero Section */}
      <div className="relative bg-white border-b border-stone-200 overflow-hidden">
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-emerald-50 rounded-full blur-3xl opacity-50 -translate-y-1/2 translate-x-1/3"></div>
        <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-emerald-50 rounded-full blur-3xl opacity-50 translate-y-1/3 -translate-x-1/3"></div>
        
        <div className="container mx-auto px-6 py-16 md:py-24 relative z-10">
          <div className="max-w-4xl mx-auto text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full mb-6">
              <CalendarClock size={32} />
            </div>
            <h1 className="text-3xl md:text-5xl font-bold font-serif text-stone-800 mb-6 leading-tight">
              施術を予約する
            </h1>
            <p className="text-lg text-stone-600 leading-relaxed max-w-2xl mx-auto">
              ご希望の院をお選びください。
            </p>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-6 py-16 md:py-24 max-w-4xl space-y-16">
        
        {/* 院の選択 */}
        <section>
          <div className="bg-white rounded-3xl p-8 md:p-12 shadow-sm border border-stone-100 text-center">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
              {clinics.map((clinic, i) => (
                <Link 
                  key={i}
                  to={clinic.path} 
                  className={`flex flex-col items-center justify-center ${clinic.color} text-white p-8 rounded-3xl ${clinic.hoverColor} transition-all duration-300 transform hover:-translate-y-1 hover:shadow-xl group shadow-md w-full`}
                >
                  <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center text-3xl mb-6 group-hover:scale-110 transition-transform">
                    {clinic.badge}
                  </div>
                  <div className="text-center w-full">
                    <div className="font-bold text-xl mb-3">{clinic.name}</div>
                    <div className="text-sm opacity-90 mb-6">👉 {clinic.name.split(' ')[1]}の予約ページへ</div>
                    <div className="inline-flex items-center justify-center w-full bg-white/20 rounded-xl py-3 font-bold group-hover:bg-white/30 transition-colors">
                      予約する <ChevronRight size={20} className="ml-1 group-hover:translate-x-1 transition-transform" />
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>

        {/* 予約方法について */}
        <section>
          <div className="text-center mb-10">
            <h2 className="text-2xl md:text-3xl font-bold font-serif text-stone-800 mb-4">
              ▼ 予約方法について
            </h2>
          </div>
          
          <div className="bg-white rounded-3xl p-8 md:p-12 shadow-sm border border-stone-100 max-w-2xl mx-auto">
            <ul className="space-y-6">
              <li className="flex items-start gap-3 text-stone-700 text-lg">
                <CheckCircle2 className="text-emerald-500 shrink-0 mt-0.5" size={24} />
                <span>店頭予約（枠だけ確保 → 後から名前追加OK）</span>
              </li>
              <li className="flex items-start gap-3 text-stone-700 text-lg">
                <CheckCircle2 className="text-emerald-500 shrink-0 mt-0.5" size={24} />
                <span>オンライン予約（24時間受付）</span>
              </li>
              <li className="flex items-start gap-3 text-stone-700 text-lg">
                <CheckCircle2 className="text-emerald-500 shrink-0 mt-0.5" size={24} />
                <span>スタッフ別の空き状況をリアルタイム表示</span>
              </li>
            </ul>
          </div>
        </section>

        {/* お問い合わせ */}
        <section className="text-center">
          <div className="inline-flex items-center justify-center gap-2 text-stone-600 bg-white border border-stone-200 px-8 py-5 rounded-2xl shadow-sm">
            <Info size={24} className="text-stone-400" />
            <span className="font-medium">ご不明点があればお気軽にお問い合わせください。</span>
          </div>
        </section>

      </div>
    </main>
  );
};

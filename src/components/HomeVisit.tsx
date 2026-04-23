import React from 'react';
import { Home, Phone, ShieldCheck, ChevronRight } from 'lucide-react';
import { Link } from 'react-router-dom';

export const HomeVisit: React.FC = () => {

  return (
    <section id="home-visit" className="py-20 bg-orange-50/50 relative">
      {/* Decorative Background */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
         <div className="absolute -top-24 -left-24 w-96 h-96 bg-orange-200/20 rounded-full blur-[80px]"></div>
         <div className="absolute top-1/2 right-0 w-72 h-72 bg-emerald-200/20 rounded-full blur-[80px]"></div>
      </div>

      <div className="container mx-auto px-6 relative z-10">
        <div className="bg-white rounded-[2.5rem] p-8 md:p-12 shadow-xl border border-orange-100 overflow-hidden relative">
          
          {/* SEO Optimized Text Block (Visible) */}
          <div className="flex flex-col lg:flex-row items-center gap-10 lg:gap-16">
            <div className="lg:w-1/2 space-y-6">
               <div className="inline-flex items-center gap-2 bg-orange-100 text-orange-800 px-4 py-1.5 rounded-full text-xs font-bold tracking-wider mb-2">
                 <Home size={14} />
                 <span>訪問鍼灸・訪問マッサージ</span>
               </div>
               
               <h2 className="text-3xl md:text-5xl font-bold font-serif text-stone-800 leading-tight">
                 通院が困難な方へ。<br />
                 <span className="text-orange-600">国家資格者</span>がご自宅に伺います。
               </h2>
               
               <p className="text-stone-600 leading-relaxed">
                 佐世保市で<strong>訪問治療・在宅リハビリ</strong>をお探しの方へ。<br />
                 「歩行が困難で整骨院に通えない」「介護保険の枠がいっぱいでリハビリが足りない」<br />
                 そんなお悩みを持つご高齢者様と、支えるご家族様のための訪問サービスです。<br />
                 医師の同意があれば<strong>医療保険（健康保険）</strong>が適用され、1回400～500円程度からご利用いただけます。
               </p>

               <div className="flex flex-col sm:flex-row gap-4 pt-4">
                 <Link 
                   to="/home-visit"
                   className="flex-1 bg-orange-600 text-white px-8 py-4 rounded-xl font-bold shadow-lg shadow-orange-600/30 hover:bg-orange-500 hover:translate-y-[-2px] transition-all flex items-center justify-center gap-2 group"
                 >
                   <span>訪問鍼灸について詳しく</span>
                   <ChevronRight size={18} className="group-hover:translate-x-1 transition-transform" />
                 </Link>
                 <a 
                    href="tel:08025105242" 
                    className="flex-1 bg-white border-2 border-orange-200 text-orange-800 px-6 py-3 rounded-xl font-bold hover:bg-orange-50 transition-colors flex flex-col items-center justify-center leading-tight"
                 >
                   <div className="flex items-center gap-2 text-xs mb-1">
                     <Phone size={14} />
                     <span>担当者直通</span>
                   </div>
                   <span className="text-xl tracking-wider">080-2510-5242</span>
                 </a>
               </div>
            </div>

            <div className="lg:w-1/2 relative w-full">
              <div className="relative rounded-2xl overflow-hidden shadow-2xl rotate-1 hover:rotate-0 transition-transform duration-500 group">
                <img 
                  src="https://github.com/ebisuhoumon-collab/ebisuhoumon-collab-ebisu-website/blob/main/roujin.jpg.webp?raw=true" 
                  alt="Visiting Care Elderly Smile" 
                  loading="lazy"
                  className="w-full h-[350px] object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-stone-900/60 to-transparent flex items-end p-8">
                  <div className="text-white">
                    <p className="font-bold text-lg mb-1">その笑顔を、もう一度。</p>
                    <p className="text-sm opacity-90">Pain relief & Rehabilitation at home.</p>
                  </div>
                </div>
              </div>
              
              {/* Floating Badge */}
              <div className="absolute -bottom-6 -left-6 bg-white p-4 rounded-xl shadow-lg border-l-4 border-orange-500 flex items-start gap-3 max-w-xs animate-bounce-slow hidden md:flex">
                 <div className="bg-orange-100 p-2 rounded-full text-orange-600 shrink-0">
                   <ShieldCheck size={20} />
                 </div>
                 <div>
                   <p className="text-xs font-bold text-stone-500 mb-0.5">HEALTH INSURANCE</p>
                   <p className="font-bold text-stone-800 text-sm">医療保険適用で<br/>自己負担 1割〜3割</p>
                 </div>
              </div>
            </div>
          </div>

          {/* Keywords for Local SEO */}
          <div className="mt-12 pt-8 border-t border-stone-100 text-xs text-stone-400 flex flex-wrap gap-x-4 gap-y-2 justify-center">
            <span>#佐世保市 訪問治療</span>
            <span>#在宅リハビリテーション</span>
            <span>#訪問マッサージ</span>
            <span>#機能回復訓練</span>
            <span>#脳梗塞後遺症 リハビリ</span>
            <span>#パーキンソン病 ケア</span>
            <span>#介護負担軽減</span>
          </div>
        </div>
      </div>
    </section>
  );
};
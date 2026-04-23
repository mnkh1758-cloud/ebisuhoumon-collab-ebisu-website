import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Hero } from './Hero';
import { SymptomGrid } from './SymptomGrid';
import { Services } from './Services';
import { HomeVisit } from './HomeVisit';
import { Access } from './Access';
import { Recruit } from './Recruit';
import { ArrowRight, Car } from 'lucide-react';

export const Home: React.FC = () => {
  useEffect(() => {
    document.title = "えびす鍼灸整骨院 | 佐世保市大塔・早岐・矢峰の整骨院";
    const metaDescription = document.querySelector('meta[name="description"]');
    if (metaDescription) {
      metaDescription.setAttribute("content", "佐世保市で肩こり、腰痛、骨盤矯正、交通事故治療なら「えびす鍼灸整骨院」へ。大塔院、早岐院、矢峰院の3店舗展開。国家資格者による安心の施術を提供します。");
    }
  }, []);

  return (
    <main>
      <Hero />
      
      {/* Traffic Accident Special Banner */}
      <section className="bg-red-50 border-y border-red-100 py-12 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-red-100 rounded-full blur-3xl opacity-50 -translate-y-1/2 translate-x-1/2"></div>
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-red-100 rounded-full blur-3xl opacity-50 translate-y-1/2 -translate-x-1/2"></div>
        
        <div className="container mx-auto px-6 relative z-10">
          <div className="max-w-4xl mx-auto bg-white rounded-3xl shadow-xl shadow-red-900/5 border border-red-100 p-8 md:p-12 text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-red-100 text-red-600 rounded-full mb-6">
              <Car size={32} />
            </div>
            <h2 className="text-2xl md:text-3xl font-bold text-stone-800 mb-6">
              🚗 交通事故治療（むちうち・後遺症）はこちら
            </h2>
            <p className="text-stone-600 leading-relaxed mb-8 text-lg">
              交通事故後の首の痛み・頭痛・めまい・腰痛・しびれなどでお困りの方へ。<br className="hidden md:block" />
              当院では、鍼灸・ハイボルト・メディセル・超音波などを組み合わせた専門施術で<br className="hidden md:block" />
              <strong className="text-red-600 font-bold">早期回復・後遺症予防</strong> を徹底サポートします。
            </p>
            <Link 
              to="/traffic-accident"
              className="inline-flex items-center justify-center gap-2 bg-red-600 hover:bg-red-700 text-white font-bold py-4 px-10 rounded-full shadow-lg shadow-red-600/30 transition-all hover:-translate-y-1 text-lg group"
            >
              👉 交通事故治療の詳細はこちら
              <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>
        </div>
      </section>

      {/* Concept Section - A smooth transition from Hero */}
      <section id="about" className="py-32 container mx-auto px-6 text-center relative">
        <div className="max-w-4xl mx-auto space-y-10 relative z-10">
          <div className="flex flex-col items-center gap-4">
             <span className="w-px h-16 bg-emerald-300"></span>
             <span className="text-emerald-800 font-bold text-xs tracking-[0.3em] uppercase">Our Philosophy</span>
          </div>
          
          <h3 className="text-3xl md:text-5xl font-serif font-bold text-stone-800 leading-tight">
            根本治療のエキスパート
            <span className="block text-xl md:text-2xl mt-6 font-sans font-normal text-stone-600">
              痛み・不調を根本から解決する佐世保の整骨院です。
            </span>
          </h3>
          
          <div className="text-stone-600 leading-[2.5] text-lg font-light space-y-10">
            <p className="bg-emerald-50/50 py-8 px-6 rounded-2xl border border-emerald-100/50 inline-block w-full">
              <span className="font-bold text-emerald-800 text-xl block mb-4 font-serif">「患者様を完治できる治療院をめざす」</span>
              これをモットーに、通院の必要のない「完治」を目指す<br className="hidden md:inline" />
              根本治療を行っております。
            </p>
            
            <div className="text-justify md:text-center space-y-6 max-w-3xl mx-auto">
              <p>
                症状を引き起こす原因を西洋・東洋医学を用いた様々な面から考慮した治療法によって、<br className="hidden md:inline" />
                あらゆる症状に対応いたします。
              </p>
              <p>
                また、骨格の歪みからくる、筋肉や関節・内臓への負担を軽減させ、<br className="hidden md:inline" />
                痛みが再発しないように根本から改善していきます。
              </p>
            </div>
          </div>

          <img 
             src="https://github.com/ebisuhoumon-collab/ebisuhoumon-collab-ebisu-website/blob/main/aozorajosei.jpg.webp?raw=true"
             alt="Refreshing Mountain Landscape"
             loading="lazy"
             className="w-full h-64 md:h-80 object-cover rounded-3xl opacity-90 mt-12 hover:opacity-100 transition-all duration-1000 ease-out shadow-2xl shadow-emerald-900/10"
          />
        </div>
        
        {/* Decorative background text */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-[10rem] md:text-[15rem] font-serif font-bold text-stone-100 opacity-50 pointer-events-none select-none whitespace-nowrap z-0">
          Expertise
        </div>
      </section>

      <SymptomGrid />
      
      {/* Banner CTA */}
      <section className="relative py-32 bg-fixed bg-cover bg-center" style={{ backgroundImage: 'url(https://images.unsplash.com/photo-1519823551278-64ac927ac4bb?q=80&w=1920&auto=format&fit=crop)' }}>
         <div className="absolute inset-0 bg-stone-900/70 backdrop-blur-sm"></div>
         <div className="container mx-auto px-6 relative z-10 text-center text-white">
           <h3 className="text-4xl md:text-5xl font-serif font-bold mb-8 drop-shadow-lg">まずは、お気軽にご相談ください</h3>
           <p className="mb-12 text-stone-200 text-lg max-w-2xl mx-auto leading-relaxed">
             初めての方でも安心してご来院いただけるよう、<br/>丁寧なカウンセリングと説明を心がけています。
           </p>
           <div className="flex flex-col md:flex-row gap-6 justify-center items-center">
              <a href="#access" className="w-full md:w-auto inline-block bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-5 px-12 rounded-full shadow-lg shadow-emerald-900/50 transition-all hover:-translate-y-1 hover:shadow-emerald-500/30 text-lg">
                お近くの店舗へ電話予約
              </a>
              
              {/* Traffic Accident Special CTA */}
              <Link 
                to="/traffic-accident"
                className="w-full md:w-auto inline-flex items-center justify-center gap-2 bg-stone-800/80 hover:bg-red-600/90 backdrop-blur border border-white/20 text-white font-bold py-5 px-10 rounded-full shadow-lg transition-all hover:-translate-y-1 text-lg group"
              >
                <Car size={24} />
                交通事故治療の方はこちら
                <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
              </Link>
           </div>
         </div>
      </section>

      <Services />
      
      {/* New Home Visit Section */}
      <HomeVisit />

      <Access />
      <div id="staff"></div>
      <Recruit />
      
      {/* News Section */}
      <section className="py-32 container mx-auto px-6 bg-white">
        <div className="max-w-4xl mx-auto">
          <div className="flex justify-between items-end mb-12 border-b border-stone-200 pb-6">
             <div>
                <span className="text-emerald-600 font-bold text-xs tracking-widest uppercase block mb-2">Information</span>
                <h3 className="text-3xl font-bold font-serif text-stone-800">お知らせ</h3>
             </div>
             <a href="#" className="text-emerald-700 text-sm font-bold hover:underline flex items-center gap-1 group">
               一覧を見る
               <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
             </a>
          </div>
          <div className="grid gap-2">
            {[1, 2, 3].map((i) => (
              <a key={i} href="#" className="group flex flex-col md:flex-row gap-4 md:items-center py-6 px-6 hover:bg-stone-50 rounded-2xl transition-all border border-transparent hover:border-stone-100">
                <div className="flex items-center gap-4 min-w-[180px]">
                  <span className="text-sm text-stone-400 font-mono">2024.05.2{i}</span>
                  <span className="text-[10px] bg-emerald-100 text-emerald-800 px-3 py-1 rounded-full font-bold tracking-wider">NEWS</span>
                </div>
                <span className="text-stone-700 font-medium flex-1 group-hover:text-emerald-800 transition-colors leading-relaxed">
                  6月の休診日のお知らせと、新しい美容鍼メニューの導入についてのご案内
                </span>
                <div className="w-8 h-8 rounded-full bg-white border border-stone-200 flex items-center justify-center text-stone-400 group-hover:border-emerald-200 group-hover:text-emerald-600 transition-colors">
                  <ArrowRight size={14} />
                </div>
              </a>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
};

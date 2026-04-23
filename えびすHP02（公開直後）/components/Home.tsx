import React, { useState } from 'react';
import { Hero } from './Hero';
import { SymptomGrid } from './SymptomGrid';
import { Services } from './Services';
import { HomeVisit } from './HomeVisit';
import { Access } from './Access';
import { Recruit } from './Recruit';
import { TrafficAccident } from './TrafficAccident';
import { ArrowRight, Car } from 'lucide-react';

export const Home: React.FC = () => {
  const [isTrafficModalOpen, setIsTrafficModalOpen] = useState(false);

  return (
    <main>
      <Hero />
      
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
             src="https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?q=80&w=1200&auto=format&fit=crop"
             alt="Refreshing Mountain Landscape"
             className="w-full h-64 md:h-80 object-cover rounded-3xl opacity-90 mt-12 hover:opacity-100 transition-all duration-1000 ease-out shadow-2xl shadow-emerald-900/10"
          />
        </div>
        
        {/* Decorative background text */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-[10rem] md:text-[15rem] font-serif font-bold text-stone-100 opacity-50 pointer-events-none select-none whitespace-nowrap z-0">
          Expertise
        </div>
      </section>

      <SymptomGrid onOpenTrafficModal={() => setIsTrafficModalOpen(true)} />
      
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
              <button 
                onClick={() => setIsTrafficModalOpen(true)}
                className="w-full md:w-auto inline-flex items-center justify-center gap-2 bg-stone-800/80 hover:bg-red-600/90 backdrop-blur border border-white/20 text-white font-bold py-5 px-10 rounded-full shadow-lg transition-all hover:-translate-y-1 text-lg group"
              >
                <Car size={24} />
                交通事故治療の方はこちら
                <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
              </button>
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

      {/* Traffic Accident Modal */}
      <TrafficAccident 
        isOpen={isTrafficModalOpen} 
        onClose={() => setIsTrafficModalOpen(false)} 
      />
    </main>
  );
};

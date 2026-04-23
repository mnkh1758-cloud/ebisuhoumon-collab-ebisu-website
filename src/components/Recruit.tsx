import React, { useState, useEffect } from 'react';
import { Phone, MapPin, Clock, Briefcase, GraduationCap, Heart, Banknote, Calendar, ChevronRight, X } from 'lucide-react';

export const Recruit: React.FC = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    const handleHashChange = () => {
      if (window.location.hash === '#recruit-details') {
        setIsModalOpen(true);
        const section = document.getElementById('recruit');
        if (section) {
          section.scrollIntoView({ behavior: 'smooth' });
        }
      }
    };

    // Check on mount
    handleHashChange();

    // Listen for hash changes
    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  return (
    <section id="recruit" className="py-32 bg-white relative overflow-hidden">
      {/* Background Elements */}
      <div className="absolute top-0 right-0 w-2/3 h-full bg-stone-50 skew-x-12 translate-x-1/3"></div>

      <div className="container mx-auto px-6 relative z-10">
        
        {/* Header Section */}
        <div className="flex flex-col lg:flex-row items-center gap-16 mb-16">
          <div className="lg:w-1/2 space-y-8">
            <div className="inline-flex items-center gap-2 mb-4">
              <span className="w-10 h-px bg-emerald-500"></span>
              <span className="text-emerald-600 font-bold tracking-[0.2em] text-xs uppercase">Recruit</span>
            </div>
            <h2 className="text-4xl md:text-5xl font-serif font-bold text-stone-800 leading-tight">
              私たちと一緒に、<br />
              地域の健康を支えませんか？
            </h2>
            <p className="text-stone-600 leading-loose text-lg">
              えびす鍼灸整骨院では、患者様の「治したい」という想いに真摯に向き合える仲間を募集しています。<br />
              技術向上のための研修制度も充実。未経験の方や学生さんも大歓迎です。<br />
              あなたの資格と情熱を、ここ佐世保で活かしてください。
            </p>
            <div className="flex flex-wrap gap-4 pt-4">
               <span className="px-4 py-2 bg-emerald-100 text-emerald-800 rounded-full text-sm font-bold">#柔道整復師</span>
               <span className="px-4 py-2 bg-emerald-100 text-emerald-800 rounded-full text-sm font-bold">#鍼灸師</span>
               <span className="px-4 py-2 bg-emerald-100 text-emerald-800 rounded-full text-sm font-bold">#学生アルバイト</span>
               <span className="px-4 py-2 bg-emerald-100 text-emerald-800 rounded-full text-sm font-bold">#未経験歓迎</span>
            </div>
            
            {/* CTA Button for Requirements */}
            <div className="pt-8">
              <button 
                onClick={() => setIsModalOpen(true)}
                className="group flex items-center gap-4 bg-stone-800 text-white px-10 py-5 rounded-full font-bold text-lg shadow-lg hover:bg-stone-700 hover:shadow-xl transition-all hover:-translate-y-1"
              >
                募集要項を見る
                <span className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center group-hover:bg-emerald-500 group-hover:text-white transition-colors">
                  <ChevronRight size={18} />
                </span>
              </button>
            </div>
          </div>
          
          <div className="lg:w-1/2 relative">
             <div className="relative rounded-[2rem] overflow-hidden shadow-2xl rotate-2 hover:rotate-0 transition-transform duration-500">
               {/* Updated Image: User requested '求人募集.Jpg' */}
               <img 
                 src="https://github.com/ebisuhoumon-collab/ebisuhoumon-collab-ebisu-website/blob/main/kyuujin%E2%91%A1.jpg.webp?raw=true" 
                 alt="スタッフイメージ" 
                 loading="lazy"
                 className="w-full h-[500px] object-cover"
               />
               <div className="absolute inset-0 bg-gradient-to-t from-emerald-900/50 to-transparent"></div>
               <div className="absolute bottom-8 left-8 text-white">
                 <p className="font-serif text-2xl font-bold mb-2">成長できる環境がここにあります。</p>
                 <p className="text-sm opacity-90">先輩スタッフが丁寧に指導します</p>
               </div>
             </div>
          </div>
        </div>

        {/* Modal for Requirements Table */}
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 md:p-6">
            <div 
              className="absolute inset-0 bg-stone-900/70 backdrop-blur-sm transition-opacity duration-300" 
              onClick={() => setIsModalOpen(false)}
            ></div>
            
            <div className="bg-white rounded-[2rem] w-full max-w-5xl max-h-[90vh] overflow-hidden relative shadow-2xl animate-fade-in-up flex flex-col">
               <div className="flex justify-between items-center p-6 border-b border-stone-100 bg-stone-50">
                 <h3 className="text-2xl font-bold font-serif text-stone-800">募集要項詳細</h3>
                 <button 
                   onClick={() => setIsModalOpen(false)}
                   className="p-2 hover:bg-stone-200 rounded-full transition-colors"
                 >
                   <X size={24} className="text-stone-500" />
                 </button>
               </div>
               
               <div className="overflow-y-auto custom-scrollbar p-6 bg-stone-50/30">
                 <div className="max-w-4xl mx-auto rounded-3xl border border-stone-100 overflow-hidden shadow-sm">
                    <div className="divide-y divide-stone-100">
                        {/* 募集職種 */}
                        <div className="grid md:grid-cols-4 p-8 gap-4 bg-white hover:bg-stone-50 transition-colors">
                            <div className="md:col-span-1 flex items-center gap-3 font-bold text-emerald-800">
                                <Briefcase size={20} />
                                募集職種
                            </div>
                            <div className="md:col-span-3 space-y-2">
                                <div className="flex items-center gap-3">
                                <span className="bg-emerald-600 text-white text-xs px-2 py-1 rounded">正社員</span>
                                <span className="font-bold">柔道整復師 / 鍼灸師</span>
                                </div>
                                <div className="flex items-center gap-3">
                                <span className="bg-orange-500 text-white text-xs px-2 py-1 rounded">アルバイト</span>
                                <span className="font-bold">助手（柔整師・鍼灸師を目指す学生）</span>
                                </div>
                            </div>
                        </div>

                        {/* 給与 */}
                        <div className="grid md:grid-cols-4 p-8 gap-4 bg-white hover:bg-stone-50 transition-colors">
                            <div className="md:col-span-1 flex items-center gap-3 font-bold text-emerald-800">
                                <Banknote size={20} />
                                給与
                            </div>
                            <div className="md:col-span-3 space-y-6">
                                <div>
                                <h4 className="font-bold text-stone-800 mb-2 border-l-4 border-emerald-500 pl-3">正社員（柔道整復師・鍼灸師）</h4>
                                <p className="text-xl font-bold text-emerald-700 mb-2">月給 250,000円〜</p>
                                <ul className="text-sm text-stone-600 space-y-1 list-disc list-inside bg-stone-50 p-4 rounded-xl">
                                    <li>基本給：210,000円</li>
                                    <li>資格手当：20,000円</li>
                                    <li>技術手当：20,000円</li>
                                    <li><span className="text-emerald-600 font-bold">ダブルライセンス手当：＋10,000円</span></li>
                                    <li>歩合給あり</li>
                                    <li>賞与あり（業務賞与・成果賞与 ※業績による）</li>
                                </ul>
                                </div>
                                <div>
                                <h4 className="font-bold text-stone-800 mb-2 border-l-4 border-orange-400 pl-3">アルバイト（助手・学生）</h4>
                                <p className="text-xl font-bold text-emerald-700">時給 1,100円〜</p>
                                </div>
                            </div>
                        </div>

                        {/* 勤務時間 */}
                        <div className="grid md:grid-cols-4 p-8 gap-4 bg-white hover:bg-stone-50 transition-colors">
                            <div className="md:col-span-1 flex items-center gap-3 font-bold text-emerald-800">
                                <Clock size={20} />
                                勤務時間
                            </div>
                            <div className="md:col-span-3 text-stone-700">
                                <div className="grid sm:grid-cols-2 gap-4">
                                <div className="bg-stone-50 p-4 rounded-xl">
                                    <span className="block text-xs font-bold text-emerald-600 mb-1">平日</span>
                                    <span className="font-bold">9:00～13:00 / 14:00～20:00</span>
                                    <span className="text-xs text-stone-500 block mt-1">（休憩3時間）</span>
                                </div>
                                <div className="bg-stone-50 p-4 rounded-xl">
                                    <span className="block text-xs font-bold text-emerald-600 mb-1">土曜</span>
                                    <span className="font-bold">9:00～18:00</span>
                                    <span className="text-xs text-stone-500 block mt-1">（休憩1時間）</span>
                                </div>
                                </div>
                                <p className="text-sm text-stone-500 mt-3 flex items-start gap-2">
                                <GraduationCap size={16} className="mt-0.5 shrink-0" />
                                学生の方は、授業の時間帯に応じて勤務時間を柔軟に考慮いたします。お気軽にご相談ください！
                                </p>
                            </div>
                        </div>

                        {/* 休日 */}
                        <div className="grid md:grid-cols-4 p-8 gap-4 bg-white hover:bg-stone-50 transition-colors">
                            <div className="md:col-span-1 flex items-center gap-3 font-bold text-emerald-800">
                                <Calendar size={20} />
                                休日・休暇
                            </div>
                            <div className="md:col-span-3 text-stone-700">
                                <p className="font-bold mb-1">週休2日制（シフト制）</p>
                                <p className="text-sm text-stone-600">日曜・祝日、夏季休暇、年末年始休暇</p>
                            </div>
                        </div>

                        {/* 待遇・福利厚生 */}
                        <div className="grid md:grid-cols-4 p-8 gap-4 bg-white hover:bg-stone-50 transition-colors">
                            <div className="md:col-span-1 flex items-center gap-3 font-bold text-emerald-800">
                                <Heart size={20} />
                                待遇・福利厚生
                            </div>
                            <div className="md:col-span-3 text-stone-700">
                                <div className="grid sm:grid-cols-2 gap-2">
                                <div className="flex items-center gap-2 text-sm"><span className="w-1.5 h-1.5 bg-emerald-500 rounded-full"></span>社会保険完備</div>
                                <div className="flex items-center gap-2 text-sm"><span className="w-1.5 h-1.5 bg-emerald-500 rounded-full"></span>交通費支給（月1万円迄）</div>
                                <div className="flex items-center gap-2 text-sm"><span className="w-1.5 h-1.5 bg-emerald-500 rounded-full"></span>昇給・賞与あり</div>
                                <div className="flex items-center gap-2 text-sm"><span className="w-1.5 h-1.5 bg-emerald-500 rounded-full"></span>能力給あり</div>
                                <div className="flex items-center gap-2 text-sm"><span className="w-1.5 h-1.5 bg-emerald-500 rounded-full"></span>制服貸与</div>
                                <div className="flex items-center gap-2 text-sm"><span className="w-1.5 h-1.5 bg-emerald-500 rounded-full"></span>健康診断</div>
                                </div>
                            </div>
                        </div>

                        {/* 勤務地 */}
                        <div className="grid md:grid-cols-4 p-8 gap-4 bg-white hover:bg-stone-50 transition-colors">
                            <div className="md:col-span-1 flex items-center gap-3 font-bold text-emerald-800">
                                <MapPin size={20} />
                                勤務地
                            </div>
                            <div className="md:col-span-3 text-stone-700 space-y-2">
                                <p className="flex items-center gap-2"><span className="font-bold w-16">早岐院:</span> 長崎県佐世保市勝海町261-6</p>
                                <p className="flex items-center gap-2"><span className="font-bold w-16">大塔院:</span> 長崎県佐世保市大塔町1730-15</p>
                                <p className="flex items-center gap-2"><span className="font-bold w-16">矢峰院:</span> 長崎県佐世保市矢峰町223-5</p>
                            </div>
                        </div>
                    </div>
                 </div>
                 
                 <div className="text-center mt-12 mb-6">
                    <p className="text-stone-600 mb-6 font-bold">まずは見学からでもOKです。<br className="md:hidden"/>お気軽にお問い合わせください。</p>
                    <a 
                        href="tel:0956379110"
                        className="inline-flex items-center gap-3 bg-emerald-700 text-white px-10 py-5 rounded-full font-bold text-xl shadow-lg hover:bg-emerald-600 hover:shadow-emerald-500/40 transition-all hover:-translate-y-1"
                    >
                        <Phone size={24} />
                        0956-37-9110
                        <span className="text-sm font-normal opacity-80 ml-2">（採用担当まで）</span>
                    </a>
                </div>
               </div>
            </div>
          </div>
        )}
      </div>
    </section>
  );
};
import React, { useState } from 'react';
import { Home, HeartHandshake, UserPlus, Stethoscope, Phone, CheckCircle2, ChevronRight, X, Clock, ShieldCheck, Smile, FileText, Quote, Activity, CalendarCheck, Star, AlertCircle, Frown, Users, Clock3, Heart, FileCheck, Stethoscope as StethoscopeIcon } from 'lucide-react';

export const HomeVisit: React.FC = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);

  // --- Animation Components ---
  
  const Step1PhoneAnimation = () => (
    <div className="relative flex items-center justify-center w-24 h-24 mx-auto mb-6">
      {/* Pulse Effect */}
      <div className="absolute inset-0 bg-orange-100 rounded-full opacity-0 group-hover:opacity-100 group-hover:animate-ping transition-opacity duration-700"></div>
      <div className="absolute inset-0 bg-orange-50 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
      
      {/* Icon Container */}
      <div className="relative bg-white p-5 rounded-full shadow-sm border-2 border-stone-100 group-hover:border-orange-500 group-hover:shadow-orange-200 transition-all duration-300 z-10">
        <Phone className="text-stone-400 w-8 h-8 group-hover:text-orange-600 group-hover:animate-[wiggle_0.5s_ease-in-out_infinite] transition-colors duration-300" />
      </div>
      
      {/* Notification Badge */}
      <div className="absolute top-1 right-2 bg-red-500 w-4 h-4 rounded-full border-2 border-white opacity-0 group-hover:opacity-100 group-hover:scale-110 transition-all duration-300 delay-100"></div>
      
      <style>{`
        @keyframes wiggle {
          0%, 100% { transform: rotate(-3deg); }
          50% { transform: rotate(3deg); }
        }
      `}</style>
    </div>
  );

  const Step2DocAnimation = () => (
    <div className="relative flex items-center justify-center w-24 h-24 mx-auto mb-6">
      {/* Document Icon constructed with divs */}
      <div className="relative bg-white w-14 h-18 border-2 border-stone-200 rounded-lg shadow-sm flex flex-col items-center justify-center gap-1.5 p-1 group-hover:-translate-y-2 transition-transform duration-300 group-hover:border-blue-300">
         <div className="w-8 h-0.5 bg-stone-200 rounded-full group-hover:bg-blue-100 transition-colors"></div>
         <div className="w-8 h-0.5 bg-stone-200 rounded-full group-hover:bg-blue-100 transition-colors"></div>
         <div className="w-6 h-0.5 bg-stone-200 rounded-full mr-2 group-hover:bg-blue-100 transition-colors"></div>
         <div className="w-8 h-0.5 bg-stone-200 rounded-full group-hover:bg-blue-100 transition-colors"></div>
         
         {/* Stamp */}
         <div className="absolute -bottom-3 -right-3 w-10 h-10 bg-white rounded-full border-2 border-red-500 flex items-center justify-center opacity-0 scale-150 group-hover:opacity-100 group-hover:scale-100 transition-all duration-500 cubic-bezier(0.175, 0.885, 0.32, 1.275) shadow-md z-20 delay-100">
            <span className="text-[10px] font-bold text-red-500 rotate-[-10deg]">同意</span>
         </div>
      </div>
      
      {/* Pen */}
      <div className="absolute top-2 right-4 w-1 h-8 bg-stone-300 rotate-45 opacity-0 group-hover:opacity-100 group-hover:translate-x-2 group-hover:-translate-y-2 transition-all duration-500 delay-75">
          <div className="absolute bottom-0 left-0 w-full h-2 bg-stone-800"></div>
      </div>
    </div>
  );

  const Step3StartAnimation = () => (
    <div className="relative flex items-center justify-center w-24 h-24 mx-auto mb-6">
      {/* Rotating Ring */}
      <div className="absolute inset-0 border-2 border-dashed border-emerald-300 rounded-full opacity-0 group-hover:opacity-100 group-hover:animate-[spin_8s_linear_infinite] transition-opacity duration-300"></div>
      
      {/* Main Icon */}
      <div className="relative bg-white p-5 rounded-full shadow-sm border-2 border-stone-100 group-hover:border-emerald-500 group-hover:shadow-emerald-200 transition-all duration-300 z-10">
        <HeartHandshake className="text-stone-400 w-8 h-8 group-hover:text-emerald-600 group-hover:scale-110 transition-all duration-300" />
      </div>

      {/* Pop-up Checkmark */}
      <div className="absolute top-0 right-1 w-7 h-7 bg-orange-500 rounded-full flex items-center justify-center text-white shadow-md border-2 border-white opacity-0 translate-y-2 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-300 delay-200">
        <CheckCircle2 size={14} />
      </div>
    </div>
  );

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
                 医師の同意があれば<strong>医療保険（健康保険）</strong>が適用され、1回数百円からご利用いただけます。
               </p>

               <div className="flex flex-col sm:flex-row gap-4 pt-4">
                 <button 
                   onClick={() => setIsModalOpen(true)}
                   className="flex-1 bg-orange-600 text-white px-8 py-4 rounded-xl font-bold shadow-lg shadow-orange-600/30 hover:bg-orange-500 hover:translate-y-[-2px] transition-all flex items-center justify-center gap-2 group"
                 >
                   <span>訪問鍼灸について詳しく</span>
                   <ChevronRight size={18} className="group-hover:translate-x-1 transition-transform" />
                 </button>
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
                  src="https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?q=80&w=800&auto=format&fit=crop" 
                  alt="Visiting Care Elderly Smile" 
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

      {/* DETAILED MODAL (Sub-page) */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto custom-scrollbar bg-stone-50">
          <div className="min-h-screen">
             {/* Modal Header */}
             <div className="sticky top-0 bg-white/95 backdrop-blur-md z-50 border-b border-stone-100 px-6 py-4 flex justify-between items-center shadow-sm">
                <div className="flex items-center gap-3">
                  <div className="bg-orange-100 p-1.5 rounded-lg text-orange-600">
                    <Home size={18} />
                  </div>
                  <div>
                    <span className="font-bold text-stone-800 text-sm md:text-base block leading-none">訪問鍼灸・マッサージ</span>
                    <span className="text-[10px] text-stone-500">Service Details</span>
                  </div>
                </div>
                <button 
                  onClick={() => setIsModalOpen(false)}
                  className="p-2 bg-stone-100 hover:bg-stone-200 rounded-full transition-colors"
                >
                  <X size={24} className="text-stone-600" />
                </button>
             </div>

             {/* Hero Area of Modal */}
             <div className="relative h-[50vh] md:h-[500px]">
               <img 
                 src="https://images.unsplash.com/photo-1516307365426-bea591f05011?q=80&w=1920&auto=format&fit=crop" 
                 alt="Holding hands care"
                 className="w-full h-full object-cover"
               />
               <div className="absolute inset-0 bg-stone-900/60 flex items-center justify-center text-center px-4">
                 <div className="max-w-3xl animate-fade-in-up">
                   <p className="text-orange-300 font-bold tracking-widest uppercase mb-4 text-sm md:text-base">For Your Family</p>
                   <h2 className="text-3xl md:text-5xl font-bold font-serif text-white mb-6 leading-tight">
                     家族の想いも、<br/>一緒に背負わせてください。
                   </h2>
                   <p className="text-stone-200 text-lg leading-relaxed hidden md:block">
                     「痛い」と言われるのが辛い。リハビリに行かせてあげたいけれど時間がない。<br/>
                     そんなご家族様の抱える悩みや不安に、私たちは医療の力で寄り添います。
                   </p>
                 </div>
               </div>
             </div>

             <div className="container mx-auto px-6 py-16 md:py-24 max-w-5xl">
                
                {/* 1. Concerns Section */}
                <div className="mb-24 space-y-20">
                  {/* Patient Side */}
                  <div className="flex flex-col md:flex-row gap-10 items-center">
                    <div className="md:w-1/2 relative order-1 md:order-1">
                       <div className="absolute inset-0 bg-blue-50 rounded-[3rem] rotate-3 transform translate-y-4"></div>
                       <img 
                         src="https://images.unsplash.com/photo-1581573913757-72c81db85492?q=80&w=800&auto=format&fit=crop" 
                         alt="Patient Rehab" 
                         className="relative rounded-[3rem] shadow-xl w-full h-80 object-cover"
                       />
                       <div className="absolute bottom-8 left-8 bg-white/95 backdrop-blur px-6 py-4 rounded-xl shadow-lg border border-stone-50">
                         <p className="text-[10px] font-bold text-blue-900 uppercase tracking-widest mb-1">For Patient</p>
                         <p className="font-serif font-bold text-xl text-stone-800">ご本人様のお悩み</p>
                       </div>
                    </div>
                    <div className="md:w-1/2 space-y-8 order-2 md:order-2">
                       <div>
                         <h3 className="text-2xl font-bold font-serif text-stone-800 leading-tight mb-4">
                           「もっと動けるようになりたい」<br/>その想いを諦めないでください。
                         </h3>
                         <p className="text-stone-600 leading-relaxed text-sm">
                           痛みや麻痺で思うように動けないもどかしさ。通院したくても一人では行けない不安。<br/>
                           住み慣れたご自宅でリラックスしながら、無理のないペースで機能回復を目指せます。
                         </p>
                       </div>
                       <div className="grid gap-3">
                         {[
                           { icon: AlertCircle, text: '痛みや痺れが強く、一人での通院が困難' },
                           { icon: Activity, text: '脳梗塞やパーキンソン病の後遺症（麻痺）がある' },
                           { icon: Frown, text: '関節が固まってしまい、着替えやトイレが大変' },
                           { icon: CheckCircle2, text: '床ずれが心配・寝たきりを予防したい' },
                           { icon: Heart, text: 'もっとリハビリを増やしたい' },
                         ].map((item, i) => (
                           <div key={i} className="flex items-center gap-4 bg-white p-4 rounded-xl border border-stone-100 shadow-sm hover:shadow-md transition-shadow">
                             <div className="bg-blue-50 p-2.5 rounded-full text-blue-600 shrink-0">
                               <item.icon size={18} />
                             </div>
                             <span className="font-bold text-stone-700 text-sm">{item.text}</span>
                           </div>
                         ))}
                       </div>
                    </div>
                  </div>

                  {/* Family Side */}
                  <div className="flex flex-col md:flex-row-reverse gap-10 items-center bg-orange-50/60 rounded-[3rem] p-8 md:p-16 border border-orange-100/50">
                    <div className="md:w-1/2 relative w-full">
                       <div className="absolute inset-0 bg-white/50 rounded-[3rem] -rotate-2 scale-105"></div>
                       <img 
                         src="https://images.unsplash.com/photo-1516307365426-bea591f05011?q=80&w=800&auto=format&fit=crop" 
                         alt="Family Care" 
                         className="relative rounded-[3rem] shadow-xl w-full h-96 object-cover"
                       />
                       <div className="absolute -bottom-6 -left-6 bg-white p-4 rounded-2xl shadow-lg border-l-4 border-orange-400 max-w-[200px] hidden md:block">
                          <p className="text-xs font-bold text-orange-600 mb-1">安心のサポート</p>
                          <p className="text-xs text-stone-600 leading-relaxed">
                            定期的な訪問で、安否確認や体調変化のご報告も行います。
                          </p>
                       </div>
                    </div>
                    
                    <div className="md:w-1/2 space-y-8">
                       <div>
                         <p className="text-orange-600 font-bold text-xs tracking-[0.2em] uppercase mb-3 flex items-center gap-2">
                            <span className="w-8 h-px bg-orange-400"></span>
                            FOR FAMILIES
                         </p>
                         <h3 className="text-3xl md:text-4xl font-bold font-serif text-stone-800 leading-tight mb-6">
                           ご家族様の想いにも<br/>寄り添います
                         </h3>
                         <div className="bg-white p-6 rounded-2xl border border-orange-100 text-stone-600 text-sm leading-loose shadow-sm relative">
                           <Quote size={32} className="absolute -top-3 -left-2 text-orange-200 fill-orange-50" />
                           <p className="mb-4 relative z-10">
                             <span className="font-bold text-orange-800">大切なご家族には、いつまでも笑顔でいてほしい。</span><br/>
                             しかし、介護の日々は身体的にも精神的にも大きな負担がかかります。
                           </p>
                           <p className="relative z-10">
                             「痛がっている姿を見るのが辛い」「リハビリをしてあげたいが、自分ではどうすればいいかわからない」「仕事や家事で忙しく、通院に付き添う時間が取れない」
                           </p>
                           <p className="mt-4 pt-4 border-t border-orange-50 font-bold text-orange-900 relative z-10">
                             訪問鍼灸は、患者様ご本人のケアだけでなく、ご家族様の介護負担の軽減や、精神的な安心感にもつながります。
                           </p>
                         </div>
                       </div>
                       <div className="space-y-4">
                         <p className="font-bold text-stone-700 flex items-center gap-2 text-sm">
                            <Users size={16} className="text-orange-500" />
                            こんなお悩みも解決へ導きます
                         </p>
                         <ul className="grid gap-3">
                            {[
                              '介護での腰痛など、ご家族の身体的負担が大きい',
                              '仕事や家事で、通院の付き添い時間が取れない',
                              '専門家のアドバイスが欲しい',
                              '日中、一人にしておくのが心配'
                            ].map((text, i) => (
                              <li key={i} className="flex items-center gap-3">
                                 <div className="w-1.5 h-1.5 bg-orange-400 rounded-full shrink-0"></div>
                                 <span className="text-stone-700 text-sm">{text}</span>
                              </li>
                            ))}
                         </ul>
                       </div>
                    </div>
                  </div>
                </div>

                {/* 2. Detailed Service Features (Expanded) */}
                <div className="mb-24">
                   <div className="text-center mb-12">
                     <span className="text-orange-600 font-bold text-xs tracking-[0.2em] uppercase block mb-3">Our Services</span>
                     <h3 className="text-3xl font-bold font-serif text-stone-800">えびす鍼灸整骨院の訪問治療</h3>
                     <p className="text-stone-500 mt-4 max-w-2xl mx-auto">
                       国家資格（鍼灸師・あん摩マッサージ指圧師）を持った施術者がご自宅や施設へ伺い、心と身体のケアを行います。
                       介護保険の枠とは別で、医療保険が適用されるため、併用が可能です。
                     </p>
                   </div>
                   
                   <div className="grid md:grid-cols-3 gap-8">
                      {/* Feature 1 */}
                      <div className="bg-stone-50 rounded-3xl p-8 hover:bg-white hover:shadow-xl transition-all duration-300 group border border-stone-100">
                        <div className="w-14 h-14 bg-white rounded-2xl flex items-center justify-center mb-6 shadow-sm group-hover:bg-orange-100 group-hover:text-orange-600 transition-colors text-stone-400">
                           <HeartHandshake size={28} />
                        </div>
                        <h4 className="font-bold text-lg mb-3 text-stone-800">疼痛緩和・機能訓練</h4>
                        <p className="text-sm text-stone-600 leading-relaxed mb-4">
                          硬くなった関節や筋肉をマッサージや鍼灸で緩め、痛み・痺れを緩和します。また、関節可動域訓練（リハビリ）を行うことで、衣服の着脱やトイレへの移動など、日常生活動作（ADL）の維持・向上を目指します。
                        </p>
                        <ul className="text-xs text-stone-500 space-y-1 bg-white/50 p-3 rounded-lg">
                           <li className="flex items-center gap-2"><div className="w-1 h-1 bg-orange-400 rounded-full"></div>血行促進・床ずれ予防</li>
                           <li className="flex items-center gap-2"><div className="w-1 h-1 bg-orange-400 rounded-full"></div>筋力低下の予防</li>
                        </ul>
                      </div>
                      
                      {/* Feature 2 */}
                      <div className="bg-stone-50 rounded-3xl p-8 hover:bg-white hover:shadow-xl transition-all duration-300 group border border-stone-100">
                        <div className="w-14 h-14 bg-white rounded-2xl flex items-center justify-center mb-6 shadow-sm group-hover:bg-orange-100 group-hover:text-orange-600 transition-colors text-stone-400">
                           <ShieldCheck size={28} />
                        </div>
                        <h4 className="font-bold text-lg mb-3 text-stone-800">医療保険の適用</h4>
                        <p className="text-sm text-stone-600 leading-relaxed mb-4">
                          医師の同意に基づき、健康保険（療養費）が適用されます。介護保険の限度額を気にする必要はありません。
                          後期高齢者医療保険（1割負担）の方で、1回あたり300円〜600円程度（往療料含む）でご利用いただけます。
                        </p>
                         <ul className="text-xs text-stone-500 space-y-1 bg-white/50 p-3 rounded-lg">
                           <li className="flex items-center gap-2"><div className="w-1 h-1 bg-orange-400 rounded-full"></div>障害者手帳受給者証も適用可</li>
                           <li className="flex items-center gap-2"><div className="w-1 h-1 bg-orange-400 rounded-full"></div>生活保護の方も対応</li>
                        </ul>
                      </div>

                      {/* Feature 3 */}
                      <div className="bg-stone-50 rounded-3xl p-8 hover:bg-white hover:shadow-xl transition-all duration-300 group border border-stone-100">
                        <div className="w-14 h-14 bg-white rounded-2xl flex items-center justify-center mb-6 shadow-sm group-hover:bg-orange-100 group-hover:text-orange-600 transition-colors text-stone-400">
                           <Smile size={28} />
                        </div>
                        <h4 className="font-bold text-lg mb-3 text-stone-800">心のケアと見守り</h4>
                        <p className="text-sm text-stone-600 leading-relaxed mb-4">
                          「会話」も大切な治療の一部です。患者様とコミュニケーションを取ることで、孤独感やストレスの緩和を図ります。
                          また、定期的な訪問により、体調の急変などをいち早く察知し、ご家族やケアマネージャー様へ報告・連携します。
                        </p>
                        <ul className="text-xs text-stone-500 space-y-1 bg-white/50 p-3 rounded-lg">
                           <li className="flex items-center gap-2"><div className="w-1 h-1 bg-orange-400 rounded-full"></div>独居の高齢者様の安否確認</li>
                           <li className="flex items-center gap-2"><div className="w-1 h-1 bg-orange-400 rounded-full"></div>認知症の方への寄り添い</li>
                        </ul>
                      </div>
                   </div>
                </div>

                {/* 3. User Testimonials */}
                <div className="mb-24">
                   <div className="flex items-center gap-4 mb-8">
                      <div className="h-px flex-1 bg-stone-200"></div>
                      <h3 className="text-2xl font-bold font-serif text-stone-800 text-center">
                        <span className="block text-xs text-orange-600 font-sans font-bold tracking-widest uppercase mb-1">Voice</span>
                        ご利用者様・ご家族様の声
                      </h3>
                      <div className="h-px flex-1 bg-stone-200"></div>
                   </div>

                   <div className="grid md:grid-cols-3 gap-6">
                      {/* Testimonial 1 */}
                      <div className="bg-white p-6 rounded-2xl shadow-sm border border-stone-100 relative">
                         <Quote className="absolute top-4 right-4 text-stone-100 rotate-180" size={40} />
                         <div className="flex items-center gap-3 mb-4">
                            <div className="w-10 h-10 rounded-full bg-orange-100 flex items-center justify-center text-orange-600 font-bold text-xs">80代</div>
                            <div>
                               <p className="font-bold text-sm">膝の痛みで歩行困難</p>
                               <p className="text-xs text-stone-400">佐世保市在住 女性</p>
                            </div>
                         </div>
                         <h4 className="font-bold text-stone-800 mb-2 text-sm">「玄関まで自分の足で歩けるように」</h4>
                         <p className="text-xs text-stone-600 leading-relaxed">
                            膝が痛くて寝たきりに近い状態でしたが、先生のマッサージとリハビリのおかげで、今は杖をついて玄関まで歩けるようになりました。週に3回来てくれるのが楽しみで、お話をするだけで元気が出ます。
                         </p>
                         <div className="mt-3 flex gap-1">
                            {[1,2,3,4,5].map(i => <Star key={i} size={12} className="text-yellow-400 fill-yellow-400" />)}
                         </div>
                      </div>

                      {/* Testimonial 2 */}
                      <div className="bg-white p-6 rounded-2xl shadow-sm border border-stone-100 relative">
                         <Quote className="absolute top-4 right-4 text-stone-100 rotate-180" size={40} />
                         <div className="flex items-center gap-3 mb-4">
                            <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold text-xs">70代</div>
                            <div>
                               <p className="font-bold text-sm">脳梗塞後遺症</p>
                               <p className="text-xs text-stone-400">佐世保市在住 男性</p>
                            </div>
                         </div>
                         <h4 className="font-bold text-stone-800 mb-2 text-sm">「退院後のリハビリ不足を解消」</h4>
                         <p className="text-xs text-stone-600 leading-relaxed">
                            退院後、介護保険のリハビリだけでは回数が足りず、筋肉が固まるのが不安でした。訪問マッサージをお願いしてからは、関節の動きが良くなり、麻痺側の拘縮も和らいでいます。家でリラックスして受けられるのが良いですね。
                         </p>
                         <div className="mt-3 flex gap-1">
                            {[1,2,3,4,5].map(i => <Star key={i} size={12} className="text-yellow-400 fill-yellow-400" />)}
                         </div>
                      </div>

                      {/* Testimonial 3 */}
                      <div className="bg-white p-6 rounded-2xl shadow-sm border border-stone-100 relative">
                         <Quote className="absolute top-4 right-4 text-stone-100 rotate-180" size={40} />
                         <div className="flex items-center gap-3 mb-4">
                            <div className="w-10 h-10 rounded-full bg-pink-100 flex items-center justify-center text-pink-600 font-bold text-xs">娘様</div>
                            <div>
                               <p className="font-bold text-sm">お母様が認知症</p>
                               <p className="text-xs text-stone-400">同居のご家族より</p>
                            </div>
                         </div>
                         <h4 className="font-bold text-stone-800 mb-2 text-sm">「仕事中の見守り代わりにも」</h4>
                         <p className="text-xs text-stone-600 leading-relaxed">
                            日中、母が一人になる時間に訪問していただけるので、仕事をしていても安心感があります。先生が来る日は母の機嫌も良く、夜もぐっすり眠ってくれるので、私の介護負担も随分軽くなりました。
                         </p>
                         <div className="mt-3 flex gap-1">
                            {[1,2,3,4,5].map(i => <Star key={i} size={12} className="text-yellow-400 fill-yellow-400" />)}
                         </div>
                      </div>
                   </div>
                </div>

                {/* 4. Steps & CTA (Redesigned with Animation) */}
                <div className="bg-orange-50 rounded-[2.5rem] p-8 md:p-12 relative overflow-hidden">
                   <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-orange-300 via-orange-400 to-orange-300"></div>
                   
                   <div className="max-w-5xl mx-auto text-center">
                      <div className="mb-16">
                        <span className="text-orange-600 font-bold text-xs tracking-[0.2em] uppercase block mb-3">Process Flow</span>
                        <h3 className="text-2xl md:text-3xl font-bold font-serif text-stone-800">ご利用までの流れ</h3>
                        <p className="text-stone-500 text-sm mt-3">
                          煩雑な手続きは当院がサポートしますので、安心してご相談ください。
                        </p>
                      </div>

                      <div className="flex flex-col md:flex-row justify-between items-stretch gap-6 text-left mb-16 relative">
                         {/* Connecting Line (Desktop) */}
                         <div className="hidden md:block absolute top-12 left-0 w-full h-0.5 bg-gradient-to-r from-transparent via-orange-200 to-transparent -z-0"></div>

                         {/* Step 1 */}
                         <div className="flex-1 bg-white p-6 rounded-3xl shadow-sm border border-orange-100 w-full relative group hover:-translate-y-2 hover:shadow-xl hover:border-orange-300 transition-all duration-300 z-10 flex flex-col">
                            <div className="absolute -top-4 -left-2 w-10 h-10 bg-gradient-to-br from-orange-400 to-orange-600 rounded-xl text-white flex items-center justify-center font-bold text-lg shadow-lg rotate-3 group-hover:rotate-12 transition-transform">1</div>
                            
                            <Step1PhoneAnimation />
                            
                            <div className="text-center mt-2 flex-1 flex flex-col">
                               <div className="font-bold text-lg mb-3 text-stone-800 group-hover:text-orange-600 transition-colors">無料相談・体験</div>
                               <p className="text-xs text-stone-600 leading-relaxed mb-4 text-justify">
                                  まずはお電話にてお悩みをお聞かせください。担当者がご自宅へ伺い、お身体の状態を確認した上で、保険適用の可否判断と無料体験施術を行います。
                               </p>
                               <div className="mt-auto bg-stone-50 rounded-xl p-3 text-[10px] text-stone-500 text-left space-y-1">
                                  <div className="flex items-center gap-1.5"><CheckCircle2 size={10} className="text-orange-400"/> 電話ヒアリング</div>
                                  <div className="flex items-center gap-1.5"><CheckCircle2 size={10} className="text-orange-400"/> ご自宅訪問・問診</div>
                                  <div className="flex items-center gap-1.5"><CheckCircle2 size={10} className="text-orange-400"/> 無料体験マッサージ</div>
                               </div>
                            </div>
                         </div>
                         
                         {/* Arrow for Mobile */}
                         <div className="md:hidden flex justify-center text-orange-200">
                           <div className="w-0.5 h-8 bg-orange-200"></div>
                         </div>

                         {/* Step 2 */}
                         <div className="flex-1 bg-white p-6 rounded-3xl shadow-sm border border-orange-100 w-full relative group hover:-translate-y-2 hover:shadow-xl hover:border-blue-300 transition-all duration-300 z-10 flex flex-col">
                            <div className="absolute -top-4 -left-2 w-10 h-10 bg-gradient-to-br from-stone-500 to-stone-700 rounded-xl text-white flex items-center justify-center font-bold text-lg shadow-lg rotate-3 group-hover:rotate-12 transition-transform">2</div>
                            
                            <Step2DocAnimation />

                            <div className="text-center mt-2 flex-1 flex flex-col">
                               <div className="font-bold text-lg mb-3 text-stone-800 group-hover:text-blue-600 transition-colors">医師の同意書</div>
                               <p className="text-xs text-stone-600 leading-relaxed mb-4 text-justify">
                                  かかりつけ医に「同意書」の作成を依頼します。用紙は当院で用意いたします。お一人での通院が難しい場合は、私たちがサポートや代行を行います。
                               </p>
                               <div className="mt-auto bg-stone-50 rounded-xl p-3 text-[10px] text-stone-500 text-left space-y-1">
                                  <div className="flex items-center gap-1.5"><CheckCircle2 size={10} className="text-blue-400"/> 書類手配は当院が担当</div>
                                  <div className="flex items-center gap-1.5"><CheckCircle2 size={10} className="text-blue-400"/> かかりつけ医へ受診</div>
                                  <div className="flex items-center gap-1.5"><CheckCircle2 size={10} className="text-blue-400"/> 書類受け取り</div>
                               </div>
                            </div>
                         </div>

                         {/* Arrow for Mobile */}
                         <div className="md:hidden flex justify-center text-orange-200">
                           <div className="w-0.5 h-8 bg-orange-200"></div>
                         </div>

                         {/* Step 3 */}
                         <div className="flex-1 bg-white p-6 rounded-3xl shadow-sm border border-orange-100 w-full relative group hover:-translate-y-2 hover:shadow-xl hover:border-emerald-300 transition-all duration-300 z-10 flex flex-col">
                            <div className="absolute -top-4 -left-2 w-10 h-10 bg-gradient-to-br from-emerald-500 to-emerald-700 rounded-xl text-white flex items-center justify-center font-bold text-lg shadow-lg rotate-3 group-hover:rotate-12 transition-transform">3</div>
                            
                            <Step3StartAnimation />

                            <div className="text-center mt-2 flex-1 flex flex-col">
                               <div className="font-bold text-lg mb-3 text-stone-800 group-hover:text-emerald-600 transition-colors">治療開始</div>
                               <p className="text-xs text-stone-600 leading-relaxed mb-4 text-justify">
                                  患者様・ご家族様のご都合に合わせて訪問スケジュールを決定します。国家資格者が計画的に施術・リハビリを行い、定期的に経過をご報告します。
                               </p>
                               <div className="mt-auto bg-stone-50 rounded-xl p-3 text-[10px] text-stone-500 text-left space-y-1">
                                  <div className="flex items-center gap-1.5"><CheckCircle2 size={10} className="text-emerald-400"/> スケジュール調整</div>
                                  <div className="flex items-center gap-1.5"><CheckCircle2 size={10} className="text-emerald-400"/> 施術・リハビリ開始</div>
                                  <div className="flex items-center gap-1.5"><CheckCircle2 size={10} className="text-emerald-400"/> ケアマネージャー連携</div>
                               </div>
                            </div>
                         </div>
                      </div>

                      <div className="bg-white rounded-3xl p-8 shadow-lg inline-block w-full max-w-lg border-2 border-orange-100 relative overflow-hidden group">
                         <div className="absolute top-0 right-0 w-32 h-32 bg-orange-50 rounded-bl-full -mr-16 -mt-16 z-0 group-hover:scale-110 transition-transform duration-700"></div>
                         <div className="relative z-10">
                            <p className="font-bold text-stone-600 mb-2 text-sm">佐世保市内全域へお伺いします</p>
                            <p className="text-2xl font-bold text-stone-800 mb-6 font-serif">まずは無料体験をお試しください</p>
                            <a href="tel:08025105242" className="block w-full bg-gradient-to-r from-orange-600 to-orange-500 text-white py-4 rounded-xl font-bold shadow-lg hover:shadow-orange-500/40 transition-all hover:-translate-y-1 mb-3">
                              <div className="flex flex-col items-center justify-center">
                                <span className="flex items-center justify-center gap-2 text-2xl">
                                  <Phone size={24} className="animate-bounce" /> 080-2510-5242
                                </span>
                                <span className="text-sm font-normal opacity-90 mt-1">（担当者直通 / 携帯）</span>
                              </div>
                            </a>
                            <p className="text-[10px] text-stone-400">受付：平日 9:00-20:00 / 土曜 9:00-14:00</p>
                         </div>
                      </div>
                      <button 
                        onClick={() => setIsModalOpen(false)}
                        className="mt-8 text-stone-500 text-sm font-bold hover:text-stone-800 underline flex items-center gap-1 mx-auto"
                      >
                        <X size={14} /> 閉じる
                      </button>
                   </div>
                </div>
             </div>
          </div>
        </div>
      )}
    </section>
  );
};
import React, { useEffect } from 'react';
import { X, Phone, ShieldCheck, Car, AlertTriangle, CheckCircle2, Building2, FileText, ArrowRight, HelpCircle, Clock, MapPin } from 'lucide-react';

interface TrafficAccidentProps {
  isOpen: boolean;
  onClose: () => void;
}

export const TrafficAccident: React.FC<TrafficAccidentProps> = ({ isOpen, onClose }) => {
  
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-0 md:p-4">
      <div 
        className="absolute inset-0 bg-stone-900/90 backdrop-blur-md transition-opacity duration-300" 
        onClick={onClose}
      ></div>
      
      <div className="bg-white md:rounded-[2rem] w-full max-w-6xl h-full md:h-[95vh] overflow-hidden relative shadow-2xl flex flex-col animate-fade-in-up">
        
        {/* Close Button */}
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 z-50 p-3 bg-white/10 backdrop-blur-md rounded-full hover:bg-stone-800 text-white transition-colors border border-white/20 shadow-lg group"
        >
          <X size={24} className="group-hover:rotate-90 transition-transform duration-300" />
        </button>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto custom-scrollbar relative">
          
          {/* 1. Hero Section (Overwhelming Impact) */}
          <section className="relative min-h-[60vh] md:min-h-[70vh] flex items-center justify-center overflow-hidden">
            <img 
              src="https://images.unsplash.com/photo-1598965402089-274123a4b648?q=80&w=1920&auto=format&fit=crop" 
              alt="佐世保市の交通事故・むち打ち治療" 
              className="absolute inset-0 w-full h-full object-cover grayscale brightness-50 scale-105"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-stone-900 via-stone-900/60 to-transparent"></div>
            
            <div className="relative z-10 container mx-auto px-6 text-center text-white">
              <div className="inline-flex items-center gap-2 bg-red-600/90 text-white px-6 py-2 rounded-full text-xs md:text-sm font-bold tracking-widest uppercase mb-6 shadow-lg shadow-red-900/50 animate-bounce-slow">
                <AlertTriangle size={16} />
                Traffic Accident Support
              </div>
              
              <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold font-serif mb-6 leading-tight tracking-tight drop-shadow-2xl">
                佐世保市の<br className="md:hidden"/>交通事故・むち打ち<br/>
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-300 via-white to-emerald-200">
                  専門治療プログラム
                </span>
              </h1>
              
              <p className="text-stone-300 text-sm md:text-lg max-w-2xl mx-auto leading-loose font-light">
                「レントゲンで異常なしと言われたが痛い」「保険の手続きがわからない」<br/>
                その不安、すべて当院にお任せください。<br/>
                <span className="text-white font-bold border-b border-emerald-500">自己負担0円</span>で、専門家による徹底的な治療と補償サポートを提供します。
              </p>

              <div className="mt-10 flex flex-col sm:flex-row justify-center gap-4">
                <a href="tel:08025105242" className="bg-emerald-600 hover:bg-emerald-500 text-white px-10 py-5 rounded-full font-bold text-lg shadow-lg shadow-emerald-900/50 transition-all hover:-translate-y-1 flex items-center justify-center gap-3">
                  <Phone size={24} />
                  担当者直通で相談
                </a>
                <div className="bg-white/10 backdrop-blur-md border border-white/20 text-white px-8 py-5 rounded-full font-bold flex items-center justify-center gap-3">
                  <Clock size={20} />
                  24時間受付中
                </div>
              </div>
            </div>
          </section>

          {/* 2. Distress Check (Empathy) */}
          <section className="py-20 bg-stone-50">
            <div className="container mx-auto px-6 max-w-4xl">
              <div className="text-center mb-12">
                <h2 className="text-2xl md:text-3xl font-bold font-serif text-stone-800 mb-4">
                  こんな<span className="text-red-600">お悩み</span>はありませんか？
                </h2>
                <div className="w-16 h-1 bg-red-600 mx-auto rounded-full"></div>
              </div>
              
              <div className="grid md:grid-cols-2 gap-4">
                {[
                  '事故直後は何ともなかったのに、数日後から首や腰が痛い',
                  '病院（整形外科）で「異常なし」と言われたが、不調が続く',
                  '頭痛、めまい、吐き気、手足のしびれが取れない',
                  '保険会社とのやり取りがストレスで、治療に専念できない',
                  '仕事帰りに通院したいが、病院の受付時間に間に合わない',
                  '今の治療で良くなるのか不安。転院できるか知りたい'
                ].map((item, i) => (
                  <div key={i} className="bg-white p-5 rounded-xl shadow-sm border border-stone-100 flex items-start gap-4 hover:shadow-md transition-shadow">
                    <div className="bg-red-50 text-red-600 p-2 rounded-full shrink-0">
                      <CheckCircle2 size={20} />
                    </div>
                    <span className="font-bold text-stone-700 text-sm md:text-base">{item}</span>
                  </div>
                ))}
              </div>
              
              <div className="mt-10 bg-red-50 border border-red-100 p-6 rounded-2xl text-center">
                <p className="text-red-800 font-bold mb-2 text-lg">交通事故の症状は「後遺症」になりやすいのが特徴です。</p>
                <p className="text-stone-600 text-sm">
                  違和感を放置せず、早期に専門的な治療を開始することが、完治への最短ルートです。<br/>
                  佐世保市で多くの実績を持つ当院へ、まずはご相談ください。
                </p>
              </div>
            </div>
          </section>

          {/* 3. Five Merits (USP) */}
          <section className="py-24 bg-white relative overflow-hidden">
             <div className="absolute top-0 right-0 w-1/3 h-full bg-emerald-50/50 skew-x-12"></div>
             
             <div className="container mx-auto px-6 relative z-10 max-w-5xl">
               <div className="text-center mb-16">
                 <span className="text-emerald-600 font-bold text-xs tracking-[0.2em] uppercase block mb-3">Why Choose Us</span>
                 <h2 className="text-3xl md:text-4xl font-bold font-serif text-stone-800">
                   えびす鍼灸整骨院が選ばれる<br/>
                   <span className="text-emerald-700 text-5xl">5</span>つの理由
                 </h2>
               </div>

               <div className="space-y-8">
                 {/* Merit 1 */}
                 <div className="bg-white rounded-3xl p-8 md:p-10 shadow-xl border border-stone-100 flex flex-col md:flex-row items-center gap-8 relative overflow-hidden group">
                   <div className="absolute top-0 left-0 w-2 h-full bg-emerald-500"></div>
                   <div className="md:w-1/3 w-full">
                     <img 
                       src="https://images.unsplash.com/photo-1554224155-6726b3ff858f?q=80&w=800&auto=format&fit=crop" 
                       alt="自賠責保険適用" 
                       className="rounded-2xl shadow-lg w-full h-48 object-cover"
                     />
                   </div>
                   <div className="md:w-2/3 w-full">
                     <div className="flex items-center gap-3 mb-3">
                       <span className="text-5xl font-bold text-emerald-100 font-serif absolute -top-4 right-4 md:static md:text-emerald-100">01</span>
                       <h3 className="text-xl md:text-2xl font-bold text-stone-800">
                         自賠責保険適用で<br/>
                         治療費は<span className="text-red-600 text-3xl mx-1">0円</span>です
                       </h3>
                     </div>
                     <p className="text-stone-600 leading-relaxed text-sm md:text-base">
                       交通事故による怪我の治療は、自賠責保険が適用されるため、患者様の窓口負担はありません。
                       通院にかかる交通費や、休業損害の補償対象にもなりますので、安心して治療に専念していただけます。
                     </p>
                   </div>
                 </div>

                 {/* Merit 2 */}
                 <div className="bg-white rounded-3xl p-8 md:p-10 shadow-xl border border-stone-100 flex flex-col md:flex-row items-center gap-8 relative overflow-hidden group">
                   <div className="absolute top-0 left-0 w-2 h-full bg-stone-800"></div>
                   <div className="md:w-1/3 w-full order-1 md:order-2">
                     <img 
                       src="https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?q=80&w=800&auto=format&fit=crop" 
                       alt="専門治療" 
                       className="rounded-2xl shadow-lg w-full h-48 object-cover"
                     />
                   </div>
                   <div className="md:w-2/3 w-full order-2 md:order-1">
                     <div className="flex items-center gap-3 mb-3">
                       <span className="text-5xl font-bold text-stone-100 font-serif absolute -top-4 right-4 md:static md:text-stone-100">02</span>
                       <h3 className="text-xl md:text-2xl font-bold text-stone-800">
                         むち打ち専門プログラムと<br/>
                         最新機器による根本治療
                       </h3>
                     </div>
                     <p className="text-stone-600 leading-relaxed text-sm md:text-base">
                       交通事故特有の深層筋のダメージには、通常のマッサージだけでは届きません。
                       当院では「ハイボルト（高電圧治療）」「超音波」「鍼灸」「骨格矯正」を組み合わせた専門プログラムで、
                       後遺症を残さない徹底的な治療を行います。
                     </p>
                   </div>
                 </div>

                 {/* Merit 3 */}
                 <div className="bg-white rounded-3xl p-8 md:p-10 shadow-xl border border-stone-100 flex flex-col md:flex-row items-center gap-8 relative overflow-hidden group">
                   <div className="absolute top-0 left-0 w-2 h-full bg-blue-500"></div>
                   <div className="md:w-1/3 w-full">
                     <img 
                       src="https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?q=80&w=800&auto=format&fit=crop" 
                       alt="整形外科連携" 
                       className="rounded-2xl shadow-lg w-full h-48 object-cover"
                     />
                   </div>
                   <div className="md:w-2/3 w-full">
                     <div className="flex items-center gap-3 mb-3">
                       <span className="text-5xl font-bold text-blue-100 font-serif absolute -top-4 right-4 md:static md:text-blue-100">03</span>
                       <h3 className="text-xl md:text-2xl font-bold text-stone-800">
                         整形外科との<span className="border-b-4 border-blue-200">併用・転院</span>も<br/>
                         可能です
                       </h3>
                     </div>
                     <p className="text-stone-600 leading-relaxed text-sm md:text-base">
                       「現在整形外科に通っているが、なかなか痛みが引かない」という方の転院も可能です。
                       また、定期的な検査は整形外科で行い、日々のリハビリは当院で行う「併用」も認められています。
                       手続きは当院が代行しますのでご安心ください。
                     </p>
                   </div>
                 </div>
                 
                 {/* Merit 4 & 5 Compact */}
                 <div className="grid md:grid-cols-2 gap-8">
                    <div className="bg-stone-50 rounded-3xl p-8 border border-stone-100 relative">
                        <span className="text-4xl font-bold text-stone-200 font-serif absolute top-4 right-6">04</span>
                        <h3 className="text-lg font-bold text-stone-800 mb-3 flex items-center gap-2">
                           <Clock className="text-emerald-600" />
                           平日夜20時まで受付
                        </h3>
                        <p className="text-sm text-stone-600 leading-relaxed">
                           お仕事帰りや学校帰りでも通いやすいよう、夜20時まで受付しております。予約優先制で待ち時間も少なくスムーズです。
                        </p>
                    </div>
                    <div className="bg-stone-50 rounded-3xl p-8 border border-stone-100 relative">
                        <span className="text-4xl font-bold text-stone-200 font-serif absolute top-4 right-6">05</span>
                        <h3 className="text-lg font-bold text-stone-800 mb-3 flex items-center gap-2">
                           <ShieldCheck className="text-emerald-600" />
                           保険会社との交渉サポート
                        </h3>
                        <p className="text-sm text-stone-600 leading-relaxed">
                           面倒な保険会社との連絡や書類作成、慰謝料の手続きなど、治療以外の不安もトータルでサポート。必要に応じて提携弁護士の紹介も可能です。
                        </p>
                    </div>
                 </div>
               </div>
             </div>
          </section>

          {/* 4. Flow Chart */}
          <section className="py-20 bg-stone-900 text-white">
             <div className="container mx-auto px-6 max-w-5xl">
                <div className="text-center mb-16">
                  <h2 className="text-3xl font-bold font-serif mb-4">事故発生から解決までの流れ</h2>
                  <p className="text-stone-400 text-sm">
                    まずは警察に連絡し、その後すぐに当院へお電話ください。<br/>
                    その後の手順を丁寧にご案内いたします。
                  </p>
                </div>

                <div className="grid md:grid-cols-5 gap-4">
                   {[
                     { step: '01', title: '警察・保険会社へ連絡', desc: '事故証明が必要です。些細な事故でも必ず警察へ。' },
                     { step: '02', title: '当院へ電話相談', desc: '「えびす整骨院で治療したい」と保険会社へお伝えください。' },
                     { step: '03', title: 'カウンセリング・検査', desc: '触診や可動域検査で痛みの原因を特定します。' },
                     { step: '04', title: '治療開始', desc: '症状に合わせた専門治療を行います。自己負担は0円です。' },
                     { step: '05', title: '示談・解決', desc: '痛みが完治した後、保険会社より示談内容が届きます。' },
                   ].map((item, index) => (
                     <div key={index} className="relative flex flex-col items-center text-center group">
                        <div className="w-16 h-16 rounded-full bg-emerald-800 border-2 border-emerald-500 flex items-center justify-center text-xl font-bold font-serif mb-4 group-hover:bg-emerald-600 transition-colors z-10 relative shadow-glow">
                           {item.step}
                        </div>
                        {index !== 4 && (
                          <div className="hidden md:block absolute top-8 left-1/2 w-full h-0.5 bg-stone-700 -z-0"></div>
                        )}
                        <h3 className="font-bold mb-2 text-sm md:text-base">{item.title}</h3>
                        <p className="text-xs text-stone-400 leading-relaxed px-2">{item.desc}</p>
                     </div>
                   ))}
                </div>
             </div>
          </section>

          {/* 5. FAQ */}
          <section className="py-20 bg-white">
             <div className="container mx-auto px-6 max-w-3xl">
                <div className="text-center mb-12">
                   <h2 className="text-2xl font-bold font-serif text-stone-800">よくあるご質問</h2>
                </div>
                
                <div className="space-y-4">
                  {[
                    { q: '治療費は本当にかからないのですか？', a: 'はい、自賠責保険が適用される場合、窓口負担は0円です。' },
                    { q: '現在、整形外科に通っていますが併用はできますか？', a: 'はい、可能です。定期検査は整形外科、日々のリハビリは当院といった通い方が一般的で、早期回復に有効です。' },
                    { q: '保険会社から「整骨院ではなく病院へ行って」と言われました。', a: '治療を受ける医療機関を選ぶ権利は患者様にあります。「えびす整骨院で治療を受けたい」と強くお伝えいただければ問題ありません。' },
                    { q: '毎日通ってもいいですか？', a: 'はい。症状が辛い時期は、可能な限り続けて治療することをお勧めします。通院日数が多いほど、慰謝料の算定でも有利になるケースがあります。' }
                  ].map((qa, i) => (
                    <div key={i} className="bg-stone-50 rounded-2xl p-6 border border-stone-100">
                       <h3 className="font-bold text-stone-800 flex items-start gap-3 mb-3">
                         <span className="text-emerald-600 font-serif text-lg">Q.</span>
                         {qa.q}
                       </h3>
                       <p className="text-stone-600 text-sm leading-relaxed pl-7">
                         <span className="font-bold text-stone-400 mr-2">A.</span>
                         {qa.a}
                       </p>
                    </div>
                  ))}
                </div>
             </div>
          </section>

          {/* New Contact List Section */}
          <section className="py-20 bg-stone-100">
             <div className="container mx-auto px-6 max-w-5xl">
                <h2 className="text-2xl font-bold font-serif text-center mb-12 text-stone-800">各院のご案内・ご予約</h2>
                <div className="grid md:grid-cols-2 gap-4">
                   
                   {/* Mobile / Person in Charge - Primary Option */}
                   <a href="tel:08025105242" className="md:col-span-2 bg-gradient-to-r from-red-600 to-red-500 text-white p-6 rounded-2xl shadow-lg flex flex-col md:flex-row items-center justify-between hover:scale-[1.01] transition-transform group relative overflow-hidden">
                      <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -mr-16 -mt-16 pointer-events-none"></div>
                      <div className="flex items-center gap-4 relative z-10 w-full md:w-auto mb-4 md:mb-0">
                         <div className="bg-white/20 p-4 rounded-full animate-pulse"><Phone size={28} /></div>
                         <div>
                            <p className="text-xs font-bold opacity-90 tracking-widest uppercase mb-1 flex items-center gap-1">
                               <span className="w-2 h-2 bg-white rounded-full animate-ping"></span>
                               24h Emergency
                            </p>
                            <p className="text-xl md:text-2xl font-bold">交通事故担当者 直通携帯</p>
                            <p className="text-xs opacity-80 mt-1">夜間（21時まで）・休日も対応可能です。お急ぎの方はこちらへ。</p>
                         </div>
                      </div>
                      <span className="text-3xl md:text-4xl font-bold font-mono tracking-tight relative z-10 flex items-center gap-2 group-hover:translate-x-2 transition-transform">
                         080-2510-5242 <ArrowRight size={24} />
                      </span>
                   </a>

                   {/* Clinics */}
                   {[
                      { name: '早岐院', tel: '0956-56-3390', color: 'border-emerald-200' },
                      { name: '大塔院', tel: '0956-37-9110', color: 'border-blue-200' },
                      { name: '矢峰院', tel: '0956-56-3921', color: 'border-orange-200' },
                      { name: '総合窓口', tel: '0956-37-9110', color: 'border-stone-200', sub: '大塔院に繋がります' }
                   ].map((clinic, idx) => (
                      <a key={idx} href={`tel:${clinic.tel.replace(/-/g,'')}`} className={`bg-white p-6 rounded-xl border ${clinic.color} shadow-sm flex items-center justify-between hover:border-emerald-500 hover:shadow-md transition-all group`}>
                         <div className="flex items-center gap-3">
                            <div className={`w-2 h-12 rounded-full ${idx === 3 ? 'bg-stone-300' : 'bg-emerald-500'}`}></div>
                            <div>
                               <p className="font-bold text-stone-800 text-lg">{clinic.name}</p>
                               <p className="text-xs text-stone-400">{clinic.sub || '診療時間内受付'}</p>
                            </div>
                         </div>
                         <div className="text-right">
                             <Phone size={16} className="text-stone-300 mb-1 ml-auto group-hover:text-emerald-500 transition-colors" />
                             <span className="text-xl font-bold text-stone-700 font-mono tracking-tight group-hover:text-emerald-700">{clinic.tel}</span>
                         </div>
                      </a>
                   ))}
                </div>
             </div>
          </section>

          {/* Bottom Padding for Fixed Footer */}
          <div className="h-32"></div>
        </div>

        {/* Sticky Footer CTA */}
        <div className="absolute bottom-0 inset-x-0 bg-white border-t border-stone-200 p-4 pb-8 md:pb-4 shadow-2xl z-40">
           <div className="container mx-auto max-w-4xl flex flex-col md:flex-row items-center gap-4 justify-between">
              <div className="hidden md:block">
                 <p className="text-xs text-stone-500 font-bold mb-1">お困りの際はまずお電話を</p>
                 <p className="text-xl font-bold text-stone-800 font-serif">えびす鍼灸整骨院 交通事故相談窓口</p>
              </div>
              <div className="flex w-full md:w-auto gap-3">
                 <a href="tel:08025105242" className="flex-1 md:flex-none bg-red-600 hover:bg-red-500 text-white px-8 py-3 rounded-xl font-bold flex items-center justify-center gap-3 shadow-lg transition-all hover:-translate-y-0.5">
                    <Phone size={24} className="animate-pulse" />
                    <div className="text-left leading-none">
                       <span className="block text-[10px] opacity-90 font-bold mb-0.5">担当者直通（夜間21時まで・休日OK）</span>
                       <span className="text-xl font-serif tracking-wide">080-2510-5242</span>
                    </div>
                 </a>
                 <button onClick={onClose} className="bg-stone-100 hover:bg-stone-200 text-stone-600 px-6 py-3 rounded-xl font-bold transition-colors">
                    閉じる
                 </button>
              </div>
           </div>
        </div>
      </div>
    </div>
  );
};
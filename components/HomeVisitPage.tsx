import React, { useEffect } from 'react';
import { Home, HeartHandshake, Phone, CheckCircle2, ShieldCheck, Smile, Quote, Activity, Star, AlertCircle, Frown, Users, Zap, MessageCircle, Sparkles, PersonStanding, ChevronRight, FileText, ClipboardList, FileCheck, Calendar, MapPin } from 'lucide-react';
import { Link } from 'react-router-dom';

export const HomeVisitPage: React.FC = () => {
  useEffect(() => {
    window.scrollTo(0, 0);
    
    // SEO Settings
    document.title = "訪問鍼灸・マッサージ | 佐世保市のえびす鍼灸整骨院（医療保険適用）";
    const metaDescription = document.querySelector('meta[name="description"]');
    if (metaDescription) {
      metaDescription.setAttribute("content", "佐世保市で訪問鍼灸・訪問マッサージならえびす鍼灸整骨院へ。通院が困難な方のご自宅や施設へ国家資格者が伺い、リハビリやマッサージを行います。医療保険適用で1回約300〜600円から。");
    }
  }, []);

  return (
    <main className="bg-stone-50 min-h-screen pt-20">
      {/* Hero Area of Page */}
      <div className="relative h-[50vh] md:h-[500px]">
        <img 
          src="https://github.com/ebisuhoumon-collab/ebisuhoumon-collab-ebisu-website/blob/main/kazokudanran%E2%91%A1.jpg.webp?raw=true" 
          alt="Holding hands care"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-stone-900/60 flex items-center justify-center text-center px-4">
          <div className="max-w-3xl animate-fade-in-up">
            <p className="text-orange-300 font-bold tracking-widest uppercase mb-4 text-sm md:text-base">For Your Family</p>
            <h1 className="text-3xl md:text-5xl font-bold font-serif text-white mb-6 leading-tight">
              家族の想いも、<br/>一緒に背負わせてください。
            </h1>
            <p className="text-stone-200 text-lg leading-relaxed hidden md:block">
              「痛い」と言われるのが辛い。リハビリに行かせてあげたいけれど時間がない。<br/>
              そんなご家族様の抱える悩みや不安に、私たちは医療の力で寄り添います。
            </p>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-6 py-16 md:py-24 max-w-5xl">
        
        {/* NEW SECTION: 訪問鍼灸マッサージとは */}
        <div className="mb-24">
          <div className="bg-white rounded-[2.5rem] p-8 md:p-14 shadow-sm border border-stone-100 relative overflow-hidden">
            {/* Decorative elements */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-orange-50 rounded-full blur-3xl opacity-50 -translate-y-1/2 translate-x-1/3"></div>
            <div className="absolute bottom-0 left-0 w-48 h-48 bg-emerald-50 rounded-full blur-3xl opacity-50 translate-y-1/3 -translate-x-1/3"></div>
            
            <div className="relative z-10 text-center max-w-3xl mx-auto">
              <span className="text-orange-600 font-bold text-xs tracking-[0.2em] uppercase block mb-4">About Home Visit Care</span>
              <h2 className="text-3xl md:text-4xl font-bold font-serif text-stone-800 mb-8">訪問鍼灸マッサージとは</h2>
              
              <div className="space-y-6 text-stone-700 leading-loose text-base md:text-lg text-left md:text-center">
                <p>
                  訪問鍼灸マッサージは、歩行が困難な方や外出が難しい方のために、<br className="hidden md:block" />
                  国家資格を持つ施術者がご自宅・施設へ伺い、<span className="font-bold text-orange-700 bg-orange-50 px-2 py-0.5 rounded">医療保険を使って受けられる在宅ケア</span>です。
                </p>
                <p>
                  痛み・しびれ・筋緊張・関節拘縮・むくみ・筋力低下など、<br className="hidden md:block" />
                  日常生活に支障をきたす症状に対して、<span className="font-bold text-stone-900 border-b-2 border-emerald-200">鍼灸・マッサージ・リハビリを組み合わせて施術</span>します。
                </p>
                <p>
                  佐世保市内で多数の訪問実績があり、<br className="hidden md:block" />
                  医師・ケアマネージャーとの連携体制も整っています。
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* 1. Concerns Section */}
        <div className="mb-24 space-y-20">
          {/* Patient Side */}
          <div className="flex flex-col md:flex-row gap-10 items-center">
            <div className="md:w-1/2 relative order-1 md:order-1">
                <div className="absolute inset-0 bg-blue-50 rounded-[3rem] rotate-3 transform translate-y-4"></div>
                <img 
                  src="https://github.com/ebisuhoumon-collab/ebisuhoumon-collab-ebisu-website/blob/main/koureisha%20nayami.jpg.webp?raw=true" 
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
                    { icon: HeartHandshake, text: 'もっとリハビリを増やしたい' },
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
                  src="https://github.com/ebisuhoumon-collab/ebisuhoumon-collab-ebisu-website/blob/main/kazokudanran%E2%91%A1.jpg.webp?raw=true" 
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

        {/* 当院の専門性と安心のサポート体制 */}
        <div className="mb-24">
            <div className="flex items-center gap-4 mb-8">
              <div className="h-px flex-1 bg-stone-200"></div>
              <h3 className="text-2xl font-bold font-serif text-stone-800 text-center">
                <span className="block text-xs text-orange-600 font-sans font-bold tracking-widest uppercase mb-1">Support</span>
                当院の専門性と安心のサポート体制
              </h3>
              <div className="h-px flex-1 bg-stone-200"></div>
            </div>

            <div className="max-w-4xl mx-auto">
              <div className="bg-white rounded-3xl p-8 md:p-12 shadow-sm border border-stone-100 relative overflow-hidden">
                {/* Decorative Elements */}
                <div className="absolute top-0 right-0 w-64 h-64 bg-orange-50 rounded-full opacity-50 -mr-32 -mt-32 pointer-events-none"></div>
                <div className="absolute bottom-0 left-0 w-48 h-48 bg-stone-50 rounded-full opacity-50 -ml-24 -mb-24 pointer-events-none"></div>
                
                <div className="relative z-10">
                  <ul className="space-y-4">
                    <li className="flex items-start gap-4 bg-stone-50 p-4 rounded-2xl border border-stone-100 hover:border-orange-200 transition-colors">
                      <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center shrink-0 shadow-sm">
                        <ShieldCheck className="text-orange-500 w-5 h-5" />
                      </div>
                      <div className="pt-2">
                        <span className="font-bold text-stone-700">国家資格保持者（はり師・きゅう師・あん摩マッサージ指圧師）が施術</span>
                      </div>
                    </li>
                    <li className="flex items-start gap-4 bg-stone-50 p-4 rounded-2xl border border-stone-100 hover:border-orange-200 transition-colors">
                      <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center shrink-0 shadow-sm">
                        <MapPin className="text-orange-500 w-5 h-5" />
                      </div>
                      <div className="pt-2">
                        <span className="font-bold text-stone-700">佐世保市での訪問施術の実績多数</span>
                      </div>
                    </li>
                    <li className="flex items-start gap-4 bg-stone-50 p-4 rounded-2xl border border-stone-100 hover:border-orange-200 transition-colors">
                      <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center shrink-0 shadow-sm">
                        <Users className="text-orange-500 w-5 h-5" />
                      </div>
                      <div className="pt-2">
                        <span className="font-bold text-stone-700">医師・ケアマネージャーとの連携体制</span>
                      </div>
                    </li>
                    <li className="flex items-start gap-4 bg-stone-50 p-4 rounded-2xl border border-stone-100 hover:border-orange-200 transition-colors">
                      <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center shrink-0 shadow-sm">
                        <HeartHandshake className="text-orange-500 w-5 h-5" />
                      </div>
                      <div className="pt-2">
                        <span className="font-bold text-stone-700">医療保険が使えるため経済的負担が少ない</span>
                      </div>
                    </li>
                    <li className="flex items-start gap-4 bg-stone-50 p-4 rounded-2xl border border-stone-100 hover:border-orange-200 transition-colors">
                      <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center shrink-0 shadow-sm">
                        <ClipboardList className="text-orange-500 w-5 h-5" />
                      </div>
                      <div className="pt-2">
                        <span className="font-bold text-stone-700">ご家族・施設スタッフへの報告も丁寧に実施</span>
                      </div>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
        </div>

        {/* NEW SECTION: Specific Treatment Contents (SEO/MEO Optimized) */}
        <div className="mb-24 bg-white rounded-[3rem] p-8 md:p-12 shadow-xl border border-stone-100 relative overflow-hidden">
          {/* Background Decoration */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-orange-50 rounded-full blur-3xl opacity-50 -translate-y-1/2 translate-x-1/2"></div>
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-blue-50 rounded-full blur-3xl opacity-50 translate-y-1/2 -translate-x-1/2"></div>
          
          <div className="relative z-10">
            <div className="text-center mb-12">
              <span className="text-orange-600 font-bold text-xs tracking-[0.2em] uppercase block mb-3">Treatment Contents</span>
              <h3 className="text-3xl font-bold font-serif text-stone-800 mb-4">当院で提供できる施術</h3>
              <p className="text-stone-600 max-w-2xl mx-auto text-sm leading-relaxed">
                症状やお身体の状態に合わせて、以下の施術を組み合わせて行います。<br className="hidden md:block"/>
                <span className="font-bold text-orange-700">国家資格（はり師・きゅう師・あん摩マッサージ指圧師）</span>を持つ施術者が担当します。
              </p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              {/* Card 1: 鍼灸 */}
              <div className="bg-stone-50 rounded-2xl p-6 border border-stone-100 hover:border-orange-200 transition-colors flex flex-col gap-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center shrink-0 shadow-sm text-orange-500">
                    <Sparkles size={20} />
                  </div>
                  <h4 className="font-bold text-stone-800 text-base">鍼灸</h4>
                </div>
                <p className="text-sm text-stone-600 leading-relaxed flex-1">
                  痛み・しびれ・筋緊張の緩和
                </p>
              </div>

              {/* Card 2: ハイボルト電気治療 */}
              <div className="bg-stone-50 rounded-2xl p-6 border border-stone-100 hover:border-blue-200 transition-colors flex flex-col gap-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center shrink-0 shadow-sm text-blue-500">
                    <Zap size={20} />
                  </div>
                  <h4 className="font-bold text-stone-800 text-base">ハイボルト電気治療</h4>
                </div>
                <p className="text-sm text-stone-600 leading-relaxed flex-1">
                  急性痛・神経痛・深部の炎症にアプローチ
                </p>
              </div>

              {/* Card 3: メディセル */}
              <div className="bg-stone-50 rounded-2xl p-6 border border-stone-100 hover:border-emerald-200 transition-colors flex flex-col gap-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center shrink-0 shadow-sm text-emerald-500">
                    <Activity size={20} />
                  </div>
                  <h4 className="font-bold text-stone-800 text-base">メディセル<br/><span className="text-xs font-normal">（筋膜リリース）</span></h4>
                </div>
                <p className="text-sm text-stone-600 leading-relaxed flex-1">
                  拘縮予防・むくみ改善・筋膜癒着の改善
                </p>
              </div>

              {/* Card 4: 超音波治療 */}
              <div className="bg-stone-50 rounded-2xl p-6 border border-stone-100 hover:border-blue-200 transition-colors flex flex-col gap-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center shrink-0 shadow-sm text-blue-500">
                    <Activity size={20} />
                  </div>
                  <h4 className="font-bold text-stone-800 text-base">超音波治療</h4>
                </div>
                <p className="text-sm text-stone-600 leading-relaxed flex-1">
                  深部組織の回復促進・炎症軽減
                </p>
              </div>

              {/* Card 5: マッサージ・指圧 */}
              <div className="bg-stone-50 rounded-2xl p-6 border border-stone-100 hover:border-orange-200 transition-colors flex flex-col gap-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center shrink-0 shadow-sm text-orange-500">
                    <HeartHandshake size={20} />
                  </div>
                  <h4 className="font-bold text-stone-800 text-base">マッサージ・指圧</h4>
                </div>
                <p className="text-sm text-stone-600 leading-relaxed flex-1">
                  血流改善・筋緊張の緩和・リラクゼーション
                </p>
              </div>

              {/* Card 6: リハビリ・機能訓練 */}
              <div className="bg-stone-50 rounded-2xl p-6 border border-stone-100 hover:border-emerald-200 transition-colors flex flex-col gap-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center shrink-0 shadow-sm text-emerald-500">
                    <PersonStanding size={20} />
                  </div>
                  <h4 className="font-bold text-stone-800 text-base">リハビリ・機能訓練</h4>
                </div>
                <p className="text-sm text-stone-600 leading-relaxed flex-1">
                  関節可動域改善・筋力低下予防・歩行訓練
                </p>
              </div>

              {/* Card 7: 酸素ルーム */}
              <div className="bg-stone-50 rounded-2xl p-6 border border-stone-100 hover:border-blue-200 transition-colors flex flex-col gap-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center shrink-0 shadow-sm text-blue-500">
                    <Smile size={20} />
                  </div>
                  <h4 className="font-bold text-stone-800 text-base">酸素ルーム</h4>
                </div>
                <p className="text-sm text-stone-600 leading-relaxed flex-1">
                  疲労回復・自律神経調整・慢性症状の改善補助
                </p>
              </div>

              {/* Card 8: コミュニケーションケア */}
              <div className="bg-stone-50 rounded-2xl p-6 border border-stone-100 hover:border-pink-200 transition-colors flex flex-col gap-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center shrink-0 shadow-sm text-pink-500">
                    <MessageCircle size={20} />
                  </div>
                  <h4 className="font-bold text-stone-800 text-base">コミュニケーション</h4>
                </div>
                <p className="text-sm text-stone-600 leading-relaxed flex-1">
                  精神的ケア・認知症予防
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* NEW SECTION: Supported Symptoms List */}
        <div className="mb-24">
            <div className="text-center mb-12">
              <span className="text-orange-600 font-bold text-xs tracking-[0.2em] uppercase block mb-3">Symptoms</span>
              <h3 className="text-3xl font-bold font-serif text-stone-800 mb-4">対応している症状一覧</h3>
              <p className="text-stone-600 max-w-2xl mx-auto text-sm leading-relaxed">
                えびす鍼灸整骨院では、以下のような症状でお困りの方に訪問鍼灸マッサージを提供しています。<br className="hidden md:block"/>
                症状ごとの詳しいページもご用意していますので、気になる項目をお選びください。
              </p>
            </div>

            <div className="bg-white rounded-3xl p-6 md:p-10 shadow-sm border border-stone-100">
              <ul className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-6 gap-y-4">
                {[
                  { name: '脳梗塞後遺症', link: '/symptoms/noukousoku' },
                  { name: 'パーキンソン病', link: '/symptoms/parkinson' },
                  { name: '関節拘縮', link: '/symptoms/kousyuku' },
                  { name: '神経痛（坐骨神経痛・帯状疱疹後神経痛など）', link: '/symptoms/shinkeitsuu' },
                  { name: '変形性膝関節症', link: '/symptoms/hizakansetsu' },
                  { name: '変形性股関節症', link: '/symptoms/kokansetsu' },
                  { name: '寝たきり・廃用症候群', link: '/symptoms/netakiri' },
                  { name: 'むくみ（浮腫）', link: '/symptoms/mukumi' },
                  { name: '筋萎縮', link: '/symptoms/kinishuku' },
                  { name: 'リウマチ', link: '/symptoms/ryumachi' },
                  { name: '頚椎症', link: '/symptoms/keitsuisyou' },
                  { name: '慢性腰痛', link: '/symptoms/manseiyoutsu' },
                  { name: '認知症の方のケア', link: '/symptoms/ninchishou' },
                  { name: '施設入居者向けケア', link: '/symptoms/shisetsu' },
                  { name: '退院後の在宅ケア', link: '/symptoms/taiin' },
                ].map((symptom, i) => (
                  <li key={i}>
                    <Link to={symptom.link} className="flex items-center justify-between p-4 rounded-xl hover:bg-orange-50 hover:text-orange-700 transition-colors group border border-stone-100 hover:border-orange-200">
                      <div className="flex items-center gap-3">
                        <div className="w-2 h-2 bg-orange-300 rounded-full group-hover:bg-orange-500 transition-colors shrink-0"></div>
                        <span className="text-stone-700 text-sm font-bold group-hover:text-orange-700 transition-colors">{symptom.name}</span>
                      </div>
                      <ChevronRight size={16} className="text-stone-300 group-hover:text-orange-500 transition-colors" />
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
        </div>

        {/* 症状別の改善例 */}
        <div className="mb-24">
            <div className="flex items-center gap-4 mb-8">
              <div className="h-px flex-1 bg-stone-200"></div>
              <h3 className="text-2xl font-bold font-serif text-stone-800 text-center">
                <span className="block text-xs text-orange-600 font-sans font-bold tracking-widest uppercase mb-1">Examples</span>
                症状別の改善例
              </h3>
              <div className="h-px flex-1 bg-stone-200"></div>
            </div>
            
            <p className="text-center text-sm text-stone-500 mb-8">
              ※改善には個人差があります。医学的に誠実な範囲で記載しています。
            </p>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {/* 脳梗塞後遺症 */}
              <div className="bg-white p-6 rounded-2xl shadow-sm border border-stone-100">
                <h4 className="font-bold text-lg text-stone-800 mb-4 flex items-center gap-2 border-b border-stone-100 pb-3">
                  <div className="w-2 h-6 bg-orange-400 rounded-full"></div>
                  脳梗塞後遺症
                </h4>
                <ul className="space-y-3">
                  <li className="flex items-start gap-2 text-sm text-stone-600">
                    <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                    <span>関節拘縮の進行予防</span>
                  </li>
                  <li className="flex items-start gap-2 text-sm text-stone-600">
                    <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                    <span>むくみの軽減</span>
                  </li>
                  <li className="flex items-start gap-2 text-sm text-stone-600">
                    <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                    <span>手足のこわばりの緩和</span>
                  </li>
                  <li className="flex items-start gap-2 text-sm text-stone-600">
                    <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                    <span>立ち上がり・歩行動作の安定</span>
                  </li>
                </ul>
              </div>

              {/* パーキンソン病 */}
              <div className="bg-white p-6 rounded-2xl shadow-sm border border-stone-100">
                <h4 className="font-bold text-lg text-stone-800 mb-4 flex items-center gap-2 border-b border-stone-100 pb-3">
                  <div className="w-2 h-6 bg-orange-400 rounded-full"></div>
                  パーキンソン病
                </h4>
                <ul className="space-y-3">
                  <li className="flex items-start gap-2 text-sm text-stone-600">
                    <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                    <span>筋固縮の緩和</span>
                  </li>
                  <li className="flex items-start gap-2 text-sm text-stone-600">
                    <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                    <span>姿勢保持の改善</span>
                  </li>
                  <li className="flex items-start gap-2 text-sm text-stone-600">
                    <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                    <span>動作のスムーズさ向上</span>
                  </li>
                </ul>
              </div>

              {/* 関節拘縮 */}
              <div className="bg-white p-6 rounded-2xl shadow-sm border border-stone-100">
                <h4 className="font-bold text-lg text-stone-800 mb-4 flex items-center gap-2 border-b border-stone-100 pb-3">
                  <div className="w-2 h-6 bg-orange-400 rounded-full"></div>
                  関節拘縮
                </h4>
                <ul className="space-y-3">
                  <li className="flex items-start gap-2 text-sm text-stone-600">
                    <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                    <span>関節可動域の改善</span>
                  </li>
                  <li className="flex items-start gap-2 text-sm text-stone-600">
                    <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                    <span>痛みの軽減</span>
                  </li>
                  <li className="flex items-start gap-2 text-sm text-stone-600">
                    <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                    <span>日常生活動作の向上</span>
                  </li>
                </ul>
              </div>

              {/* 神経痛 */}
              <div className="bg-white p-6 rounded-2xl shadow-sm border border-stone-100">
                <h4 className="font-bold text-lg text-stone-800 mb-4 flex items-center gap-2 border-b border-stone-100 pb-3">
                  <div className="w-2 h-6 bg-orange-400 rounded-full"></div>
                  神経痛<span className="text-xs text-stone-500 font-normal ml-1">（坐骨神経痛・帯状疱疹後痛など）</span>
                </h4>
                <ul className="space-y-3">
                  <li className="flex items-start gap-2 text-sm text-stone-600">
                    <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                    <span>痛みの軽減</span>
                  </li>
                  <li className="flex items-start gap-2 text-sm text-stone-600">
                    <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                    <span>しびれの緩和</span>
                  </li>
                  <li className="flex items-start gap-2 text-sm text-stone-600">
                    <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                    <span>動作時の負担軽減</span>
                  </li>
                </ul>
              </div>

              {/* むくみ（浮腫） */}
              <div className="bg-white p-6 rounded-2xl shadow-sm border border-stone-100">
                <h4 className="font-bold text-lg text-stone-800 mb-4 flex items-center gap-2 border-b border-stone-100 pb-3">
                  <div className="w-2 h-6 bg-orange-400 rounded-full"></div>
                  むくみ（浮腫）
                </h4>
                <ul className="space-y-3">
                  <li className="flex items-start gap-2 text-sm text-stone-600">
                    <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                    <span>リンパ循環の改善</span>
                  </li>
                  <li className="flex items-start gap-2 text-sm text-stone-600">
                    <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                    <span>足の重だるさの軽減</span>
                  </li>
                  <li className="flex items-start gap-2 text-sm text-stone-600">
                    <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                    <span>皮膚トラブルの予防</span>
                  </li>
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

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 text-left mb-16 relative">
                  {/* Step 1 */}
                  <div className="bg-white p-6 rounded-3xl shadow-sm border border-orange-100 relative group hover:-translate-y-2 hover:shadow-xl hover:border-orange-300 transition-all duration-300 flex flex-col">
                    <div className="absolute -top-4 -left-2 w-10 h-10 bg-gradient-to-br from-orange-400 to-orange-600 rounded-xl text-white flex items-center justify-center font-bold text-lg shadow-lg rotate-3 group-hover:rotate-12 transition-transform">1</div>
                    <div className="flex justify-center mb-6 mt-2">
                      <div className="w-16 h-16 bg-orange-50 rounded-full flex items-center justify-center group-hover:bg-orange-100 transition-colors">
                        <Phone className="text-orange-500 w-8 h-8 group-hover:scale-110 transition-transform" />
                      </div>
                    </div>
                    <div className="text-center flex-1 flex flex-col">
                        <div className="font-bold text-lg mb-3 text-stone-800 group-hover:text-orange-600 transition-colors">お問い合わせ</div>
                        <p className="text-sm text-stone-600 leading-relaxed">
                          お電話または<Link to="/予約" className="text-orange-600 underline hover:text-orange-700">WEB予約</Link>からご相談ください。
                        </p>
                    </div>
                  </div>

                  {/* Step 2 */}
                  <div className="bg-white p-6 rounded-3xl shadow-sm border border-orange-100 relative group hover:-translate-y-2 hover:shadow-xl hover:border-orange-300 transition-all duration-300 flex flex-col">
                    <div className="absolute -top-4 -left-2 w-10 h-10 bg-gradient-to-br from-orange-400 to-orange-600 rounded-xl text-white flex items-center justify-center font-bold text-lg shadow-lg rotate-3 group-hover:rotate-12 transition-transform">2</div>
                    <div className="flex justify-center mb-6 mt-2">
                      <div className="w-16 h-16 bg-orange-50 rounded-full flex items-center justify-center group-hover:bg-orange-100 transition-colors">
                        <Home className="text-orange-500 w-8 h-8 group-hover:scale-110 transition-transform" />
                      </div>
                    </div>
                    <div className="text-center flex-1 flex flex-col">
                        <div className="font-bold text-lg mb-3 text-stone-800 group-hover:text-orange-600 transition-colors">初回訪問・カウンセリング</div>
                        <p className="text-sm text-stone-600 leading-relaxed">
                          ご自宅・施設へ伺い、症状・生活状況・お身体の状態を丁寧に確認します。
                        </p>
                    </div>
                  </div>

                  {/* Step 3 */}
                  <div className="bg-white p-6 rounded-3xl shadow-sm border border-orange-100 relative group hover:-translate-y-2 hover:shadow-xl hover:border-orange-300 transition-all duration-300 flex flex-col">
                    <div className="absolute -top-4 -left-2 w-10 h-10 bg-gradient-to-br from-orange-400 to-orange-600 rounded-xl text-white flex items-center justify-center font-bold text-lg shadow-lg rotate-3 group-hover:rotate-12 transition-transform">3</div>
                    <div className="flex justify-center mb-6 mt-2">
                      <div className="w-16 h-16 bg-orange-50 rounded-full flex items-center justify-center group-hover:bg-orange-100 transition-colors">
                        <FileText className="text-orange-500 w-8 h-8 group-hover:scale-110 transition-transform" />
                      </div>
                    </div>
                    <div className="text-center flex-1 flex flex-col">
                        <div className="font-bold text-lg mb-3 text-stone-800 group-hover:text-orange-600 transition-colors">医師の同意書取得</div>
                        <p className="text-sm text-stone-600 leading-relaxed">
                          訪問鍼灸マッサージは医療保険を使うため、医師の同意書が必要です。<br/>取得方法は当院がサポートします。
                        </p>
                    </div>
                  </div>

                  {/* Step 4 */}
                  <div className="bg-white p-6 rounded-3xl shadow-sm border border-orange-100 relative group hover:-translate-y-2 hover:shadow-xl hover:border-orange-300 transition-all duration-300 flex flex-col">
                    <div className="absolute -top-4 -left-2 w-10 h-10 bg-gradient-to-br from-orange-400 to-orange-600 rounded-xl text-white flex items-center justify-center font-bold text-lg shadow-lg rotate-3 group-hover:rotate-12 transition-transform">4</div>
                    <div className="flex justify-center mb-6 mt-2">
                      <div className="w-16 h-16 bg-orange-50 rounded-full flex items-center justify-center group-hover:bg-orange-100 transition-colors">
                        <ClipboardList className="text-orange-500 w-8 h-8 group-hover:scale-110 transition-transform" />
                      </div>
                    </div>
                    <div className="text-center flex-1 flex flex-col">
                        <div className="font-bold text-lg mb-3 text-stone-800 group-hover:text-orange-600 transition-colors">施術プランの作成</div>
                        <p className="text-sm text-stone-600 leading-relaxed">
                          症状に合わせて、鍼灸・マッサージ・リハビリ・電気治療などを組み合わせた最適なプランを作成。
                        </p>
                    </div>
                  </div>

                  {/* Step 5 */}
                  <div className="bg-white p-6 rounded-3xl shadow-sm border border-orange-100 relative group hover:-translate-y-2 hover:shadow-xl hover:border-orange-300 transition-all duration-300 flex flex-col">
                    <div className="absolute -top-4 -left-2 w-10 h-10 bg-gradient-to-br from-orange-400 to-orange-600 rounded-xl text-white flex items-center justify-center font-bold text-lg shadow-lg rotate-3 group-hover:rotate-12 transition-transform">5</div>
                    <div className="flex justify-center mb-6 mt-2">
                      <div className="w-16 h-16 bg-orange-50 rounded-full flex items-center justify-center group-hover:bg-orange-100 transition-colors">
                        <HeartHandshake className="text-orange-500 w-8 h-8 group-hover:scale-110 transition-transform" />
                      </div>
                    </div>
                    <div className="text-center flex-1 flex flex-col">
                        <div className="font-bold text-lg mb-3 text-stone-800 group-hover:text-orange-600 transition-colors">施術開始</div>
                        <p className="text-sm text-stone-600 leading-relaxed">
                          週1〜3回のペースで訪問し、症状改善・生活動作の向上を目指します。
                        </p>
                    </div>
                  </div>

                  {/* Step 6 */}
                  <div className="bg-white p-6 rounded-3xl shadow-sm border border-orange-100 relative group hover:-translate-y-2 hover:shadow-xl hover:border-orange-300 transition-all duration-300 flex flex-col">
                    <div className="absolute -top-4 -left-2 w-10 h-10 bg-gradient-to-br from-orange-400 to-orange-600 rounded-xl text-white flex items-center justify-center font-bold text-lg shadow-lg rotate-3 group-hover:rotate-12 transition-transform">6</div>
                    <div className="flex justify-center mb-6 mt-2">
                      <div className="w-16 h-16 bg-orange-50 rounded-full flex items-center justify-center group-hover:bg-orange-100 transition-colors">
                        <FileCheck className="text-orange-500 w-8 h-8 group-hover:scale-110 transition-transform" />
                      </div>
                    </div>
                    <div className="text-center flex-1 flex flex-col">
                        <div className="font-bold text-lg mb-3 text-stone-800 group-hover:text-orange-600 transition-colors">定期的な評価・報告</div>
                        <p className="text-sm text-stone-600 leading-relaxed">
                          状態の変化を確認し、必要に応じて施術内容を調整します。<br/>ケアマネージャー様への報告も行います。
                        </p>
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
            </div>
        </div>

        {/* 5. FAQ Section */}
        <div className="mb-24">
            <div className="flex items-center gap-4 mb-8">
              <div className="h-px flex-1 bg-stone-200"></div>
              <h3 className="text-2xl font-bold font-serif text-stone-800 text-center">
                <span className="block text-xs text-orange-600 font-sans font-bold tracking-widest uppercase mb-1">FAQ</span>
                よくある質問
              </h3>
              <div className="h-px flex-1 bg-stone-200"></div>
            </div>

            <div className="max-w-3xl mx-auto space-y-4">
              {/* FAQ 1 */}
              <div className="bg-white p-6 rounded-2xl shadow-sm border border-stone-100">
                <h4 className="font-bold text-stone-800 mb-3 flex items-start gap-3">
                  <span className="text-orange-500 font-serif text-xl leading-none">Q.</span>
                  医療保険は使えますか？
                </h4>
                <div className="flex items-start gap-3 text-stone-600 text-sm bg-stone-50 p-4 rounded-xl">
                  <span className="text-stone-400 font-serif text-xl leading-none">A.</span>
                  <p>はい。医師の同意書があれば、1〜3割負担で利用できます。</p>
                </div>
              </div>

              {/* FAQ 2 */}
              <div className="bg-white p-6 rounded-2xl shadow-sm border border-stone-100">
                <h4 className="font-bold text-stone-800 mb-3 flex items-start gap-3">
                  <span className="text-orange-500 font-serif text-xl leading-none">Q.</span>
                  どんな人が来てくれますか？
                </h4>
                <div className="flex items-start gap-3 text-stone-600 text-sm bg-stone-50 p-4 rounded-xl">
                  <span className="text-stone-400 font-serif text-xl leading-none">A.</span>
                  <p>国家資格（はり師・きゅう師・あん摩マッサージ指圧師）を持つ施術者が伺います。</p>
                </div>
              </div>

              {/* FAQ 3 */}
              <div className="bg-white p-6 rounded-2xl shadow-sm border border-stone-100">
                <h4 className="font-bold text-stone-800 mb-3 flex items-start gap-3">
                  <span className="text-orange-500 font-serif text-xl leading-none">Q.</span>
                  施設にも来てもらえますか？
                </h4>
                <div className="flex items-start gap-3 text-stone-600 text-sm bg-stone-50 p-4 rounded-xl">
                  <span className="text-stone-400 font-serif text-xl leading-none">A.</span>
                  <p>はい。グループホーム・特養・有料老人ホームなど、施設訪問も可能です。</p>
                </div>
              </div>

              {/* FAQ 4 */}
              <div className="bg-white p-6 rounded-2xl shadow-sm border border-stone-100">
                <h4 className="font-bold text-stone-800 mb-3 flex items-start gap-3">
                  <span className="text-orange-500 font-serif text-xl leading-none">Q.</span>
                  家族が不在でも大丈夫ですか？
                </h4>
                <div className="flex items-start gap-3 text-stone-600 text-sm bg-stone-50 p-4 rounded-xl">
                  <span className="text-stone-400 font-serif text-xl leading-none">A.</span>
                  <p>はい。ご本人が対応できる状態であれば問題ありません。</p>
                </div>
              </div>

              {/* FAQ 5 */}
              <div className="bg-white p-6 rounded-2xl shadow-sm border border-stone-100">
                <h4 className="font-bold text-stone-800 mb-3 flex items-start gap-3">
                  <span className="text-orange-500 font-serif text-xl leading-none">Q.</span>
                  週に何回受けられますか？
                </h4>
                <div className="flex items-start gap-3 text-stone-600 text-sm bg-stone-50 p-4 rounded-xl">
                  <span className="text-stone-400 font-serif text-xl leading-none">A.</span>
                  <p>医師の同意内容により異なりますが、週2〜3回の方が多いです。</p>
                </div>
              </div>

              {/* FAQ 6 */}
              <div className="bg-white p-6 rounded-2xl shadow-sm border border-stone-100">
                <h4 className="font-bold text-stone-800 mb-3 flex items-start gap-3">
                  <span className="text-orange-500 font-serif text-xl leading-none">Q.</span>
                  どんな症状に対応していますか？
                </h4>
                <div className="flex items-start gap-3 text-stone-600 text-sm bg-stone-50 p-4 rounded-xl">
                  <span className="text-stone-400 font-serif text-xl leading-none">A.</span>
                  <p>脳梗塞後遺症・パーキンソン病・関節拘縮・神経痛・むくみ・慢性痛など幅広く対応しています。</p>
                </div>
              </div>
            </div>
        </div>

        {/* 6. Service Area */}
        <div className="mb-24">
            <div className="flex items-center gap-4 mb-8">
              <div className="h-px flex-1 bg-stone-200"></div>
              <h3 className="text-2xl font-bold font-serif text-stone-800 text-center">
                <span className="block text-xs text-orange-600 font-sans font-bold tracking-widest uppercase mb-1">Area</span>
                訪問対応エリア
              </h3>
              <div className="h-px flex-1 bg-stone-200"></div>
            </div>

            <div className="max-w-4xl mx-auto">
              <div className="bg-white rounded-3xl p-8 md:p-12 shadow-sm border border-stone-100 relative overflow-hidden">
                {/* Decorative Map Background Elements */}
                <div className="absolute top-0 right-0 w-64 h-64 bg-orange-50 rounded-full opacity-50 -mr-32 -mt-32 pointer-events-none"></div>
                <div className="absolute bottom-0 left-0 w-48 h-48 bg-stone-50 rounded-full opacity-50 -ml-24 -mb-24 pointer-events-none"></div>
                
                <div className="relative z-10 flex flex-col md:flex-row items-center gap-8">
                  <div className="shrink-0">
                    <div className="w-24 h-24 bg-orange-100 rounded-full flex items-center justify-center">
                      <MapPin className="text-orange-500 w-12 h-12" />
                    </div>
                  </div>
                  
                  <div className="flex-1 text-center md:text-left">
                    <h4 className="text-xl font-bold text-stone-800 mb-2">佐世保市全域</h4>
                    <p className="text-stone-600 mb-6">佐世保市内のご自宅・施設へ訪問いたします。</p>
                    
                    <div className="bg-stone-50 p-6 rounded-2xl border border-stone-100">
                      <p className="text-sm font-bold text-stone-700 mb-3 flex items-center justify-center md:justify-start gap-2">
                        <MapPin size={16} className="text-orange-500" />
                        訪問可能エリア例
                      </p>
                      <p className="text-sm text-stone-600 leading-relaxed">
                        佐世保市中心部 / 広田 / 大塔 / 日宇 / 早岐 / 吉岡町 / 皆瀬町 / もみじが丘 / 黒髪町 / 白岳町 / 大野町 / 相浦 / 中里 / 山手町 / 木風町 / 他市内全域
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
        </div>

        {/* 7. Final CTA Section */}
        <div className="mb-12">
            <div className="bg-gradient-to-br from-orange-50 to-orange-100 rounded-[3rem] p-8 md:p-16 text-center shadow-sm border border-orange-200 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-64 h-64 bg-white rounded-full blur-3xl opacity-50 -translate-y-1/2 translate-x-1/2"></div>
              <div className="absolute bottom-0 left-0 w-64 h-64 bg-white rounded-full blur-3xl opacity-50 translate-y-1/2 -translate-x-1/2"></div>
              
              <div className="relative z-10">
                <span className="text-orange-600 font-bold text-xs tracking-[0.2em] uppercase block mb-4">Contact Us</span>
                <h3 className="text-2xl md:text-4xl font-bold font-serif text-stone-800 mb-6">
                  訪問鍼灸マッサージのご予約はこちら
                </h3>
                <p className="text-stone-600 mb-8 max-w-2xl mx-auto leading-relaxed">
                  症状やお身体の状態について、まずはお気軽にご相談ください。<br className="hidden md:block"/>
                  ご自宅・施設へお伺いし、初回評価を行います。
                </p>
                
                <div className="flex flex-col md:flex-row items-center justify-center gap-4">
                  <a href="tel:08025105242" className="w-full md:w-auto bg-gradient-to-r from-orange-600 to-orange-500 hover:from-orange-500 hover:to-orange-400 text-white px-10 py-5 rounded-2xl font-bold flex items-center justify-center gap-4 shadow-lg shadow-orange-500/30 transition-all hover:-translate-y-1 group">
                    <div className="bg-white/20 p-3 rounded-full group-hover:scale-110 transition-transform">
                      <Phone size={28} className="animate-pulse" />
                    </div>
                    <div className="text-left">
                      <span className="block text-xs opacity-90 font-bold mb-1">担当者直通（無料体験受付中）</span>
                      <span className="text-3xl font-serif tracking-wider">080-2510-5242</span>
                    </div>
                  </a>
                </div>
                <p className="text-xs text-stone-500 mt-6 font-medium">受付：平日 9:00-20:00 / 土曜 9:00-14:00</p>
              </div>
            </div>
        </div>
      </div>

      {/* Bottom Padding for Fixed Footer */}
      <div className="h-32"></div>

      {/* Sticky Footer CTA */}
      <div className="fixed bottom-0 inset-x-0 bg-white border-t border-stone-200 p-4 pb-8 md:pb-4 shadow-[0_-10px_40px_rgba(0,0,0,0.1)] z-40">
         <div className="container mx-auto max-w-4xl flex flex-col md:flex-row items-center gap-4 justify-between">
            <div className="hidden md:block">
               <p className="text-xs text-stone-500 font-bold mb-1">訪問鍼灸・マッサージのご相談はこちら</p>
               <p className="text-xl font-bold text-stone-800 font-serif">えびす鍼灸整骨院 訪問専用窓口</p>
            </div>
            <div className="flex w-full md:w-auto gap-3">
               <a href="tel:08025105242" className="flex-1 md:flex-none bg-orange-600 hover:bg-orange-500 text-white px-8 py-3 rounded-xl font-bold flex items-center justify-center gap-3 shadow-lg transition-all hover:-translate-y-0.5">
                  <Phone size={24} className="animate-pulse" />
                  <div className="text-left leading-none">
                     <span className="block text-[10px] opacity-90 font-bold mb-0.5">担当者直通（無料体験受付中）</span>
                     <span className="text-xl font-serif tracking-wide">080-2510-5242</span>
                  </div>
               </a>
            </div>
         </div>
      </div>
    </main>
  );
};

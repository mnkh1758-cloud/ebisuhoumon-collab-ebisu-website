import React, { useEffect } from 'react';
import { AlignVerticalJustifyCenter, CheckCircle2, Activity, AlertTriangle, ArrowRight, Info } from 'lucide-react';

export const LumbagoPage: React.FC = () => {
  useEffect(() => {
    window.scrollTo(0, 0);

    // SEO Settings
    document.title = "腰の痛み・ぎっくり腰・坐骨神経痛 | 佐世保市のえびす鍼灸整骨院";
    const metaDescription = document.querySelector('meta[name="description"]');
    if (metaDescription) {
      metaDescription.setAttribute("content", "佐世保市で腰の痛み、ぎっくり腰、坐骨神経痛にお悩みならえびす鍼灸整骨院へ。急性期の鎮痛から、骨格矯正やEMSを用いた根本治療まで。再発しない体づくりをサポートします。");
    }
  }, []);

  return (
    <main className="pt-20 bg-stone-50 min-h-screen animate-fade-in-up">
      {/* Hero Section */}
      <div className="relative h-[40vh] md:h-[500px] overflow-hidden">
        <img 
          src="https://images.unsplash.com/photo-1551698618-1dfe5d97d256?auto=format&fit=crop&w=1920&q=80" 
          alt="腰の痛み・ぎっくり腰・坐骨神経痛"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-amber-900/90 to-amber-800/50 flex items-center">
          <div className="container mx-auto px-6">
            <div className="max-w-2xl text-white">
              <div className="inline-flex items-center gap-2 bg-amber-500/30 backdrop-blur-md px-4 py-2 rounded-full text-sm font-bold tracking-wider mb-6 border border-amber-400/30">
                <AlignVerticalJustifyCenter size={16} />
                <span>LUMBAGO</span>
              </div>
              <h1 className="text-3xl md:text-5xl font-bold font-serif mb-6 leading-tight">
                腰の痛み・ぎっくり腰・坐骨神経痛
              </h1>
              <p className="text-lg md:text-xl text-amber-50 leading-relaxed font-medium">
                繰り返す腰の痛みにお悩みの方へ。<br className="hidden md:block" />
                骨盤の歪みとインナーマッスルのバランスを整え、再発しない体へ。
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-6 py-16 md:py-24 max-w-5xl">
        
        {/* Concept Section */}
        <div className="text-center mb-20">
          <span className="text-amber-600 font-bold text-xs tracking-[0.2em] uppercase block mb-3">Concept</span>
          <h2 className="text-2xl md:text-4xl font-bold font-serif text-stone-800 leading-tight mb-8">
            腰の痛みを根本から治療する専門治療
          </h2>
          <div className="bg-white p-8 md:p-12 rounded-3xl shadow-sm border border-amber-100 text-left">
            <p className="text-stone-700 leading-loose mb-6">
              急性期の症状にはアイシングや超音波を使い鎮痛から施術をしていきます。腰の痛みが半減したところから根本治療となる骨格矯正やEMSを使用いたします。
            </p>
            <p className="text-stone-700 leading-loose">
              また、神経症状がどこから発生しているかを詳しく見極め、鍼灸治療、矯正治療を中心に患者様に適した治療法を行います。
            </p>
          </div>
        </div>

        {/* Symptoms List */}
        <div className="mb-20">
          <div className="flex items-center gap-4 mb-8">
            <div className="h-px flex-1 bg-amber-200"></div>
            <h3 className="text-2xl font-bold font-serif text-stone-800 text-center flex items-center gap-2">
              <Activity className="text-amber-500" />
              こんなお悩みはありませんか？
            </h3>
            <div className="h-px flex-1 bg-amber-200"></div>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {[
              '腰痛で悩んでいる',
              '体重が増えた',
              '寝返りが打てない',
              '重い荷物を持つと痛む',
              '安静時も痛みを感じる',
              '立っていると脚が痛む'
            ].map((symptom, idx) => (
              <div key={idx} className="bg-white p-4 rounded-xl border border-amber-100 shadow-sm flex items-center gap-3">
                <CheckCircle2 className="text-amber-500 shrink-0" size={20} />
                <span className="font-bold text-stone-700 text-sm">{symptom}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Gikkuri Goshi Section */}
        <div className="mb-24">
          <div className="flex items-center gap-3 mb-8">
            <div className="w-12 h-12 bg-orange-100 rounded-2xl flex items-center justify-center text-orange-600">
              <AlertTriangle size={24} />
            </div>
            <h3 className="text-3xl font-bold font-serif text-stone-800">ぎっくり腰</h3>
          </div>
          
          <div className="bg-white rounded-3xl p-8 md:p-10 shadow-sm border border-orange-100 mb-8">
            <p className="text-stone-700 leading-relaxed mb-8 text-lg">
              一般的に「急性腰痛」や「椎間捻挫」といわれ、ギクッとした衝撃とともに腰が強烈な激痛に襲われるものです。このようにふとしたことから急に痛みが出現するので「魔女の一撃」という別名があります。腰痛には根本的な治療をお勧めします。
            </p>

            <div className="grid md:grid-cols-2 gap-8">
              <div className="bg-orange-50 p-6 rounded-2xl">
                <h4 className="font-bold text-orange-900 mb-4 flex items-center gap-2">
                  <Info size={18} />
                  原因
                </h4>
                <p className="text-sm text-stone-700 leading-relaxed">
                  ぎっくり腰になる原因としては、筋挫傷、肉離れ、捻挫、ヘルニア、骨粗しょう症による圧迫骨折などがあります。日ごろの運動不足による筋肉の柔軟性の低下や、筋力低下で背骨の安定性が低下すると、不良姿勢によるちょっとした負担でも背骨周囲の組織が傷つきます。急性期の痛みの原因は、損傷した組織を守るために筋肉の緊張が強まったり、筋肉のけいれんが起きることが主な要因であることが多いです。
                </p>
              </div>

              <div className="bg-stone-50 p-6 rounded-2xl border border-stone-200">
                <h4 className="font-bold text-stone-800 mb-4 flex items-center gap-2">
                  <Activity size={18} className="text-orange-500" />
                  治療内容
                </h4>
                <p className="text-sm text-stone-700 leading-relaxed mb-4">
                  ぎっくり腰は早めにケアすることにより、痛みを軽減させることができます。急性期の症状には、アイシングや超音波を使い鎮痛から施術をしていきます。腰の痛みが半減したころから根本治療となる骨格矯正やEMSを使用いたします。
                </p>
                <div className="text-xs text-stone-500 bg-white p-3 rounded-lg border border-stone-100">
                  主な施術：鍼灸治療、筋膜リリース、超音波治療、電気刺激治療、カイロ、アイシング、テーピングなど
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Sciatica Section */}
        <div className="mb-24">
          <div className="flex items-center gap-3 mb-8">
            <div className="w-12 h-12 bg-red-100 rounded-2xl flex items-center justify-center text-red-600">
              <ArrowRight className="rotate-45" size={24} />
            </div>
            <h3 className="text-3xl font-bold font-serif text-stone-800">坐骨神経痛</h3>
          </div>
          
          <div className="bg-white rounded-3xl p-8 md:p-10 shadow-sm border border-red-100">
            <p className="text-stone-700 leading-relaxed mb-8 text-lg">
              坐骨神経痛とは、腰から足にかけて伸びている「坐骨神経」がさまざまな原因によって圧迫・刺激されることであらわれる、痛みや痺れるような痛みなどの症状のことを指します。多くの場合、腰痛に引き続いて発症し、次にお尻や太ももの後ろ、すね、足先などに痛みやしびれるような痛みがあらわれます。
            </p>

            <div className="bg-red-50 p-6 rounded-2xl mb-8">
              <h4 className="font-bold text-red-900 mb-4 flex items-center gap-2">
                <Info size={18} />
                原因
              </h4>
              <p className="text-sm text-stone-700 leading-relaxed">
                腰のあたりにある脊柱管が狭くなって神経が圧迫された状態のことで、50代を超えた中高年に多く見られます。脊柱管が老化などが原因で狭くなり、神経根や馬尾と呼ばれる部分が圧迫され、下半身に痛みやしびれるような痛み、麻痺や間欠跛行と呼ばれる痛みによる歩行障害を伴うこともあります。
              </p>
            </div>

            <h4 className="font-bold text-stone-800 mb-6 text-xl">坐骨神経痛を引き起こす主な疾患</h4>
            <div className="grid md:grid-cols-3 gap-6 mb-10">
              {[
                {
                  title: '①腰部脊柱管狭窄症',
                  desc: '背骨の隙間である「脊柱管」が老化などが原因で狭くなり、神経が圧迫された状態。50代を超えた中高年に多く見られ、下半身の痛みやしびれ、間欠跛行（歩行障害）を伴うこともあります。'
                },
                {
                  title: '②腰椎椎間板ヘルニア',
                  desc: '背骨のクッションである「椎間板」の中のゼリー状の「髄核」が押し出され、神経が圧迫されることで痛みやしびれが起こります。腰のあたりの背骨で生じ、下半身に痛みが起こります。'
                },
                {
                  title: '③梨状筋症候群',
                  desc: 'お尻の奥を横切る筋肉（梨状筋）の中を走る坐骨神経が、外傷やスポーツ活動などで圧迫されて起こる痛みのことを指します。'
                }
              ].map((item, idx) => (
                <div key={idx} className="bg-stone-50 p-6 rounded-2xl border border-stone-200">
                  <h5 className="font-bold text-red-800 mb-3">{item.title}</h5>
                  <p className="text-sm text-stone-600 leading-relaxed">{item.desc}</p>
                </div>
              ))}
            </div>

            <div className="bg-stone-800 text-white p-8 rounded-2xl relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-red-500/20 rounded-full blur-2xl -translate-y-1/2 translate-x-1/2"></div>
              <h4 className="font-bold text-red-400 mb-4 flex items-center gap-2 relative z-10">
                <Activity size={18} />
                治療内容
              </h4>
              <p className="text-sm text-stone-300 leading-relaxed relative z-10">
                神経症状がどこから発生しているかを詳しく見極め、鍼灸治療、矯正治療を中心に患者様に適した治療法を行います。椎間板の変形や、腰部･骨盤のずれ調整し、圧迫されていた筋肉や神経を緩和していきます。炎症部位には発痛部位が多くあるので、それらを刺激する手技療法を施術します。歪みやずれを伴うことが多いので、矯正治療と併用するとさらに効果があります。発痛部位が深部にある場合、鍼療法による施術を行います。
              </p>
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
               <p className="text-xs text-stone-500 font-bold mb-1">腰の痛み・坐骨神経痛のご相談はこちら</p>
               <p className="text-xl font-bold text-stone-800 font-serif">えびす鍼灸整骨院</p>
            </div>
            <div className="flex w-full md:w-auto gap-3">
               <a href="/#access" className="flex-1 md:flex-none bg-amber-600 hover:bg-amber-500 text-white px-12 py-4 rounded-xl font-bold flex items-center justify-center gap-3 shadow-lg transition-all hover:-translate-y-0.5">
                  <span className="text-xl font-serif tracking-wide">お問合せ</span>
               </a>
            </div>
         </div>
      </div>
    </main>
  );
};

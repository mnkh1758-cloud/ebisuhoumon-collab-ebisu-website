import React, { useEffect } from 'react';
import { Baby, AlignVerticalJustifyCenter, CheckCircle2, Activity, Heart, ArrowRight, ShieldCheck } from 'lucide-react';

export const PelvicCorrectionPage: React.FC = () => {
  useEffect(() => {
    window.scrollTo(0, 0);

    // SEO Settings
    document.title = "産後骨盤矯正・骨格矯正(姿勢改善) | 佐世保市のえびす鍼灸整骨院";
    const metaDescription = document.querySelector('meta[name="description"]');
    if (metaDescription) {
      metaDescription.setAttribute("content", "佐世保市で産後骨盤矯正・骨格矯正ならえびす鍼灸整骨院へ。産後の体型変化や尿漏れ、慢性的な肩こり・腰痛、猫背などの姿勢改善に。キッズスペース完備でママも安心のソフトで安全な矯正プログラムをご提供します。");
    }
  }, []);

  return (
    <main className="pt-20 bg-stone-50 min-h-screen animate-fade-in-up">
      {/* Hero Section */}
      <div className="relative h-[40vh] md:h-[500px] overflow-hidden">
        <img 
          src="https://github.com/ebisuhoumon-collab/ebisuhoumon-collab-ebisu-website/blob/main/kotubannkyousei%20.jpg.webp?raw=true" 
          alt="産後骨盤矯正・骨格矯正"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-rose-900/90 to-rose-800/50 flex items-center">
          <div className="container mx-auto px-6">
            <div className="max-w-2xl text-white">
              <div className="inline-flex items-center gap-2 bg-rose-500/30 backdrop-blur-md px-4 py-2 rounded-full text-sm font-bold tracking-wider mb-6 border border-rose-400/30">
                <Baby size={16} />
                <span>POSTPARTUM & PELVIC CARE</span>
              </div>
              <h1 className="text-3xl md:text-5xl font-bold font-serif mb-6 leading-tight">
                産後骨盤矯正・骨格矯正
              </h1>
              <p className="text-lg md:text-xl text-rose-50 leading-relaxed font-medium">
                産後のデリケートな骨盤ケアから、<br className="hidden md:block" />
                長年の癖による姿勢の歪み改善まで。
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-6 py-16 md:py-24 max-w-5xl">
        
        {/* Concept Section */}
        <div className="text-center mb-20">
          <span className="text-rose-600 font-bold text-xs tracking-[0.2em] uppercase block mb-3">Concept</span>
          <h2 className="text-2xl md:text-4xl font-bold font-serif text-stone-800 leading-tight mb-8">
            骨盤・骨格の歪みは「万病の元」<br />
            根本から整え、美しい姿勢と健康な体へ
          </h2>
          <div className="bg-white p-8 md:p-12 rounded-3xl shadow-sm border border-rose-100 text-left">
            <p className="text-stone-700 leading-loose mb-6">
              人の身体は、日常生活の姿勢・動作のクセ・加齢や出産などにより、少しずつ骨格のバランスが崩れていきます。骨格の歪みは、筋肉の過緊張や関節可動域の制限、神経・血流・リンパの循環不良などを引き起こし、慢性的な肩こり・腰痛・頭痛・しびれなど、さまざまな不調の原因となります。
            </p>
            <p className="text-stone-700 leading-loose">
              当院では、国家資格を持つ施術者が身体の状態を丁寧に検査し、歪みの原因を分析した上で、一人ひとりに最適な施術を行います。産後のデリケートなママの身体から、慢性的な不調にお悩みの方まで、安全かつ効果的に正しいバランスへと導きます。
            </p>
          </div>
        </div>

        {/* Postpartum Section */}
        <div className="mb-24">
          <div className="flex items-center gap-3 mb-8">
            <div className="w-12 h-12 bg-pink-100 rounded-2xl flex items-center justify-center text-pink-600">
              <Baby size={24} />
            </div>
            <h3 className="text-3xl font-bold font-serif text-stone-800">産後骨盤矯正 (Postpartum Care)</h3>
          </div>
          
          <div className="bg-white rounded-3xl p-8 md:p-10 shadow-sm border border-pink-100 mb-8">
            <div className="grid md:grid-cols-2 gap-8 items-center mb-10">
              <div>
                <h4 className="text-xl font-bold text-pink-800 mb-4">産後のデリケートな身体に特化</h4>
                <p className="text-stone-700 leading-relaxed mb-6">
                  出産という大仕事を終えたママの身体は、骨盤が開き、靭帯が緩み、筋肉が低下している非常にデリケートな状態です。無理な矯正は禁物です。
                </p>
                <p className="text-stone-700 leading-relaxed mb-6">
                  当院では、産後専用のソフトな矯正技術で、開いた骨盤を正しい位置に戻し、緩んだ骨盤底筋群を引き締めます。キッズスペースも完備しておりますので、お子様連れでも安心して通院いただけます。
                </p>
              </div>
              <div className="bg-pink-50 p-6 rounded-2xl border border-pink-100">
                <h5 className="font-bold text-pink-900 mb-4 flex items-center gap-2">
                  <Activity size={18} />
                  こんなお悩みありませんか？
                </h5>
                <ul className="space-y-3">
                  {[
                    '産後、腰や股関節が痛む',
                    '産前のズボンが入らない',
                    '尿漏れがある',
                    '冷えやむくみがひどくなった',
                    '体重が戻らない',
                    '骨盤の歪みが気になる'
                  ].map((item, idx) => (
                    <li key={idx} className="flex items-start gap-3 text-stone-700 text-sm">
                      <CheckCircle2 className="text-pink-500 shrink-0 mt-0.5" size={16} />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            <div className="bg-stone-50 p-8 rounded-2xl border border-stone-200">
              <h4 className="font-bold text-stone-800 mb-6 text-center text-lg">なぜ産後の骨盤矯正が必要なの？</h4>
              <p className="text-stone-600 text-center mb-8 max-w-2xl mx-auto">
                出産時に分泌されるホルモンの影響で、骨盤周りの靭帯が緩み、骨盤が大きく開きます。産後、自然に戻ろうとしますが、筋力不足や育児の姿勢により、歪んだまま固まってしまうことが多いのです。
              </p>
              <div className="grid md:grid-cols-2 gap-6">
                <div className="bg-white p-6 rounded-xl shadow-sm">
                  <h5 className="font-bold text-pink-700 mb-2">① 体型崩れ・肥満の原因</h5>
                  <p className="text-sm text-stone-600 leading-relaxed">
                    骨盤が開いたままだと内臓が下がり、ポッコリお腹の原因になります。また、基礎代謝が落ちて太りやすく、産前の体型に戻りにくくなります。
                  </p>
                </div>
                <div className="bg-white p-6 rounded-xl shadow-sm">
                  <h5 className="font-bold text-pink-700 mb-2">② 慢性的な痛みの原因</h5>
                  <p className="text-sm text-stone-600 leading-relaxed">
                    骨盤の歪みは、腰痛や股関節痛、肩こりなどの原因となります。育児での抱っこや授乳の姿勢が加わることで、さらに痛みが悪化しやすくなります。
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* General Pelvic Correction Section */}
        <div className="mb-24">
          <div className="flex items-center gap-3 mb-8">
            <div className="w-12 h-12 bg-teal-100 rounded-2xl flex items-center justify-center text-teal-600">
              <AlignVerticalJustifyCenter size={24} />
            </div>
            <h3 className="text-3xl font-bold font-serif text-stone-800">骨格矯正・姿勢改善 (Pelvic Correction)</h3>
          </div>
          
          <div className="bg-white rounded-3xl p-8 md:p-10 shadow-sm border border-teal-100">
            <div className="grid md:grid-cols-2 gap-8 items-center mb-10">
              <div className="order-2 md:order-1 bg-teal-50 p-6 rounded-2xl border border-teal-100">
                <h5 className="font-bold text-teal-900 mb-4 flex items-center gap-2">
                  <Activity size={18} />
                  こんなお悩みありませんか？
                </h5>
                <ul className="space-y-3">
                  {[
                    '姿勢が悪い・猫背と言われる',
                    'よく足を組む癖がある',
                    '慢性的な肩こり・腰痛が治らない',
                    '片足重心で立つ癖がある',
                    'スカートが回ってしまう',
                    'マッサージに行ってもすぐ戻る'
                  ].map((item, idx) => (
                    <li key={idx} className="flex items-start gap-3 text-stone-700 text-sm">
                      <CheckCircle2 className="text-teal-500 shrink-0 mt-0.5" size={16} />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
              <div className="order-1 md:order-2">
                <h4 className="text-xl font-bold text-teal-800 mb-4">深層筋へのアプローチと同時に行う矯正</h4>
                <p className="text-stone-700 leading-relaxed mb-6">
                  ボキボキの矯正もいたしますが、苦手な方にはソフトな矯正を用いて、関節や筋肉の生理的な可動を利用し、安全かつ効果的に正しいバランスへと導きます。
                </p>
                <p className="text-stone-700 leading-relaxed">
                  骨格が整うことで、痛みや不調の改善はもちろん、姿勢や動作の安定、再発予防にもつながります。「根本から改善したい」「長年の不調を見直したい」という方におすすめの施術です。
                </p>
              </div>
            </div>

            <div className="bg-stone-800 text-white p-8 rounded-2xl relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-teal-500/20 rounded-full blur-2xl -translate-y-1/2 translate-x-1/2"></div>
              <h4 className="font-bold text-teal-400 mb-6 flex items-center gap-2 relative z-10 text-lg">
                <ShieldCheck size={20} />
                骨盤がずれる3つの主な原因
              </h4>
              <div className="grid md:grid-cols-3 gap-6 relative z-10">
                {[
                  {
                    title: '姿勢・座り方',
                    desc: '仕事や日常生活の姿勢が悪い、猫背である、横座りや足を八の字に開く座り方をする。'
                  },
                  {
                    title: '身体の癖',
                    desc: 'よく足を組む癖がある、どちらかの足に体重をかけて立つ、バッグを持つ腕が決まっている。'
                  },
                  {
                    title: '筋力低下',
                    desc: '運動不足によるインナーマッスル（深層筋）の低下により、正しい骨格を維持できなくなる。'
                  }
                ].map((item, idx) => (
                  <div key={idx} className="bg-stone-900/50 p-5 rounded-xl border border-stone-700">
                    <h5 className="font-bold text-stone-100 mb-2">{item.title}</h5>
                    <p className="text-sm text-stone-400 leading-relaxed">{item.desc}</p>
                  </div>
                ))}
              </div>
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
               <p className="text-xs text-stone-500 font-bold mb-1">産後骨盤矯正・姿勢改善のご相談はこちら</p>
               <p className="text-xl font-bold text-stone-800 font-serif">えびす鍼灸整骨院</p>
            </div>
            <div className="flex w-full md:w-auto gap-3">
               <a href="/#access" className="flex-1 md:flex-none bg-rose-600 hover:bg-rose-500 text-white px-12 py-4 rounded-xl font-bold flex items-center justify-center gap-3 shadow-lg transition-all hover:-translate-y-0.5">
                  <span className="text-xl font-serif tracking-wide">お問合せ</span>
               </a>
            </div>
         </div>
      </div>
    </main>
  );
};

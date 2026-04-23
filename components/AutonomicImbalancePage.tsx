import React, { useEffect } from 'react';
import { HeartPulse, Moon, CheckCircle2, Activity, Wind, AlertTriangle, ArrowRight, Info } from 'lucide-react';

export const AutonomicImbalancePage: React.FC = () => {
  useEffect(() => {
    window.scrollTo(0, 0);

    // SEO Settings
    document.title = "自律神経失調症・不眠症（睡眠障害） | 佐世保市のえびす鍼灸整骨院";
    const metaDescription = document.querySelector('meta[name="description"]');
    if (metaDescription) {
      metaDescription.setAttribute("content", "佐世保市で自律神経失調症・不眠症（睡眠障害）にお悩みならえびす鍼灸整骨院へ。鍼灸治療や高気圧酸素ルーム（O2ルーム）で交感神経と副交感神経のバランスを整え、深いリラックスと睡眠の質の向上をサポートします。");
    }
  }, []);

  return (
    <main className="pt-20 bg-stone-50 min-h-screen animate-fade-in-up">
      {/* Hero Section */}
      <div className="relative h-[40vh] md:h-[500px] overflow-hidden">
        <img 
          src="https://images.unsplash.com/photo-1506126613408-eca07ce68773?auto=format&fit=crop&w=1920&q=80" 
          alt="自律神経失調症・不眠症"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-indigo-900/90 to-indigo-800/50 flex items-center">
          <div className="container mx-auto px-6">
            <div className="max-w-2xl text-white">
              <div className="inline-flex items-center gap-2 bg-indigo-500/30 backdrop-blur-md px-4 py-2 rounded-full text-sm font-bold tracking-wider mb-6 border border-indigo-400/30">
                <HeartPulse size={16} />
                <span>AUTONOMIC IMBALANCE & INSOMNIA</span>
              </div>
              <h1 className="text-3xl md:text-5xl font-bold font-serif mb-6 leading-tight">
                自律神経失調症・不眠症
              </h1>
              <p className="text-lg md:text-xl text-indigo-50 leading-relaxed font-medium">
                原因不明のだるさや、夜眠れないお悩みに。<br className="hidden md:block" />
                心と体に優しいアプローチで、深いリラックスへ。
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-6 py-16 md:py-24 max-w-5xl">
        
        {/* Concept Section */}
        <div className="text-center mb-20">
          <span className="text-indigo-600 font-bold text-xs tracking-[0.2em] uppercase block mb-3">Concept</span>
          <h2 className="text-2xl md:text-4xl font-bold font-serif text-stone-800 leading-tight mb-8">
            交感神経と副交感神経のスイッチを整える<br />
            心と体に優しいアプローチ
          </h2>
          <div className="bg-white p-8 md:p-12 rounded-3xl shadow-sm border border-indigo-100 text-left">
            <p className="text-stone-700 leading-loose mb-6">
              現代社会のストレスや不規則な生活により、自律神経のバランス（交感神経と副交感神経の切り替え）が乱れることで、様々な不調が現れます。自律神経は、呼吸、血液循環、消化、体温調節などをコントロールしており、このバランスが崩れると、「検査では異常がないのに体調が悪い」という不定愁訴が現れます。
            </p>
            <p className="text-stone-700 leading-loose">
              当院では、東洋医学的観点から「気・血・水」のバランスを整える鍼灸治療や、最新の酸素ルームを用いたアプローチを行います。特に首や背中の緊張を和らげ、リラックス効果の高いツボを刺激することで、副交感神経を優位にし、身体が本来持っている回復力を引き出します。
            </p>
          </div>
        </div>

        {/* Insomnia Deep Dive */}
        <div className="mb-24">
          <div className="flex items-center gap-4 mb-12">
            <div className="h-px flex-1 bg-indigo-200"></div>
            <h3 className="text-3xl font-bold font-serif text-stone-800 text-center flex items-center gap-3">
              <Moon className="text-indigo-500" size={32} />
              「不眠症」について
            </h3>
            <div className="h-px flex-1 bg-indigo-200"></div>
          </div>

          <div className="grid md:grid-cols-2 gap-8 mb-12">
            <div className="bg-white p-8 rounded-3xl shadow-sm border border-indigo-100">
              <h4 className="text-xl font-bold text-indigo-800 mb-4 border-b border-indigo-100 pb-4">不眠の悩みは3人に1人</h4>
              <p className="text-stone-700 leading-relaxed mb-4">
                不眠の悩みは3人に一人、不眠症は10人に一人と言われ、比較的女性に多い悩みです。普段より寝付くのに長く時間がかかる、一旦寝付いても途中で何度も目が覚める、朝極端に早く目覚めてしまい再度寝付けないなど、症状は様々です。
              </p>
              <p className="text-stone-700 leading-relaxed">
                3～5割程度の人がこれらの不眠症状を一過性に経験し、おおよそ1割の人が慢性的な不眠で悩むと言われています。
              </p>
            </div>

            <div className="bg-white p-8 rounded-3xl shadow-sm border border-indigo-100">
              <h4 className="text-xl font-bold text-indigo-800 mb-4 border-b border-indigo-100 pb-4">加齢に伴う増加とストレス</h4>
              <p className="text-stone-700 leading-relaxed mb-4">
                不眠で悩む人の割合は、加齢に伴って増加します。加齢により必要な睡眠時間が短くなることや、睡眠・覚醒のメリハリが小さくなることが関係しています。
              </p>
              <p className="text-stone-700 leading-relaxed">
                また、不眠症状の多くはストレスに伴い出現します。強いストレスを感じる出来事に遭遇すると一時的な不眠を経験し、それが週3日以上、3ヶ月以上持続する場合、治療が必要な不眠症の可能性があります。
              </p>
            </div>
          </div>

          {/* Bad Habits */}
          <div className="bg-indigo-50 rounded-3xl p-8 md:p-12 mb-12">
            <h4 className="text-2xl font-bold text-indigo-900 mb-6 text-center">不眠を慢性化させる4つの「不適切な睡眠衛生・習慣」</h4>
            <p className="text-stone-700 text-center mb-8 max-w-2xl mx-auto">
              眠れないことへの恐怖心から眠ろうと努力すればするほど、不眠はかえって悪化する傾向があります。以下の習慣を早めに修正することが、慢性化を防ぐコツです。
            </p>
            <div className="grid md:grid-cols-2 gap-6">
              {[
                {
                  title: '寝る前の覚醒促進物質の摂取',
                  desc: '寝る前のカフェイン（緑茶、紅茶、コーヒー）・ニコチン（タバコ）の摂取、寝酒など。'
                },
                {
                  title: '床上時間のミスマッチ',
                  desc: '寝不足を取り戻そうとして普段より長く寝床に居続けることで、かえって寝つきが悪化し、眠りが浅くなります。'
                },
                {
                  title: '日中の活動量減少',
                  desc: '不眠が続くと日中に動くのが億劫になりがちですが、活動量が減ると寝つきが悪くなり、眠りが浅くなります。'
                },
                {
                  title: '睡眠状態誤認',
                  desc: '実際の睡眠時間と自覚的な睡眠時間が一致しないことがあります。睡眠時間をむしろ積極的に短くすることが、睡眠を濃縮させ不眠解消に役立つことがあります。'
                }
              ].map((item, idx) => (
                <div key={idx} className="bg-white p-6 rounded-2xl shadow-sm">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-8 h-8 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center font-bold shrink-0">
                      {idx + 1}
                    </div>
                    <h5 className="font-bold text-stone-800">{item.title}</h5>
                  </div>
                  <p className="text-stone-600 text-sm leading-relaxed">{item.desc}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Treatments */}
          <div className="mb-16">
            <h4 className="text-2xl font-bold font-serif text-stone-800 mb-8 text-center">不眠症の治療・支援</h4>
            <div className="space-y-6">
              <div className="bg-white p-6 md:p-8 rounded-2xl border border-stone-200 shadow-sm flex flex-col md:flex-row gap-6 items-start">
                <div className="w-12 h-12 bg-indigo-100 rounded-xl flex items-center justify-center text-indigo-600 shrink-0">
                  <Activity size={24} />
                </div>
                <div>
                  <h5 className="text-lg font-bold text-stone-800 mb-3">睡眠衛生・習慣の改善</h5>
                  <p className="text-stone-600 leading-relaxed">
                    まずは前述の不適切な睡眠習慣を見直すことから始まります。うまく寝つけない場合には、いったん寝床を離れ緊張をほぐし、眠気が再度訪れたら寝床に入り直す方法も効果的です。眠りが不十分であっても、決まった時刻に起床することで、翌日は体を休めようとする生理的欲求が高まり、眠りが促されます。
                  </p>
                </div>
              </div>
              <div className="bg-white p-6 md:p-8 rounded-2xl border border-stone-200 shadow-sm flex flex-col md:flex-row gap-6 items-start">
                <div className="w-12 h-12 bg-indigo-100 rounded-xl flex items-center justify-center text-indigo-600 shrink-0">
                  <Info size={24} />
                </div>
                <div>
                  <h5 className="text-lg font-bold text-stone-800 mb-3">薬物療法・非薬物療法</h5>
                  <p className="text-stone-600 leading-relaxed mb-4">
                    習慣改善でも解消しない場合、医療機関での睡眠薬による治療（薬物療法）が用いられることがあります。主治医の指示に従い、決められた使用法・使用量を守ることが重要です。
                  </p>
                  <p className="text-stone-600 leading-relaxed">
                    欧米では非薬物療法（認知行動療法など）が推奨されていますが、わが国では医療保険が適用されず、治療を提供できる医療施設も多くないのが現状です。
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Our Approach (O2 Room) */}
        <div className="mb-24">
          <div className="bg-stone-800 text-white rounded-3xl p-8 md:p-12 shadow-lg relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/20 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
            
            <div className="relative z-10">
              <div className="inline-flex items-center gap-2 bg-stone-700/50 px-4 py-2 rounded-full text-xs font-bold tracking-wider mb-6 border border-stone-600">
                <Wind size={16} className="text-indigo-400" />
                <span>OUR APPROACH</span>
              </div>
              
              <h3 className="text-2xl md:text-3xl font-bold font-serif mb-6 leading-tight">
                えびす鍼灸整骨院の不眠症ケア<br />
                「酸素ROOM」による深いリラックス効果
              </h3>
              
              <p className="text-stone-300 leading-relaxed mb-10">
                当院の酸素ROOMは、高気圧環境で「溶解型酸素」を体内に取り込み、副交感神経を優位にすることで自律神経のバランスを整え、不眠症や寝つきの悪さ、睡眠の質を改善します。脳へ酸素を供給して疲労回復・ストレス軽減を促し、<strong className="text-indigo-300">1時間の利用で約3〜4時間相当の睡眠効果</strong>とも言われる深いリラックス効果をもたらします。
              </p>

              <div className="grid md:grid-cols-2 gap-6 mb-10">
                {[
                  {
                    title: '効果・メリット',
                    items: [
                      '高濃度の酸素が血行を促進し、筋肉の緊張をほぐす',
                      '自律神経の乱れを整え、眠りの質を向上',
                      '寝つきの改善、中途覚醒の減少',
                      '疲労感の軽減、ストレス緩和'
                    ]
                  },
                  {
                    title: '利用方法・特徴',
                    items: [
                      '週1〜2回、夕方や寝る前の利用が効果的',
                      '1回の利用（30分〜90分程度）で数時間の睡眠効果',
                      '鍼灸治療との併用でさらなる相乗効果'
                    ]
                  }
                ].map((section, idx) => (
                  <div key={idx} className="bg-stone-900/50 p-6 rounded-2xl border border-stone-700">
                    <h4 className="text-indigo-400 font-bold mb-4">{section.title}</h4>
                    <ul className="space-y-3">
                      {section.items.map((item, i) => (
                        <li key={i} className="flex items-start gap-3 text-stone-200 text-sm leading-relaxed">
                          <CheckCircle2 className="text-indigo-500 shrink-0 mt-0.5" size={16} />
                          {item}
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>

              {/* Cautions */}
              <div className="bg-stone-900/80 border border-stone-700 p-6 rounded-2xl">
                <h4 className="text-stone-100 font-bold mb-4 flex items-center gap-2">
                  <AlertTriangle size={18} className="text-amber-500" />
                  注意点と副作用
                </h4>
                <div className="grid md:grid-cols-3 gap-4 mb-4">
                  <div>
                    <span className="block text-amber-500 text-sm font-bold mb-1">耳の違和感</span>
                    <p className="text-stone-400 text-xs leading-relaxed">加圧・減圧時に耳の痛みや閉塞感を感じることがあります（飛行機と同様）。</p>
                  </div>
                  <div>
                    <span className="block text-amber-500 text-sm font-bold mb-1">閉所恐怖症</span>
                    <p className="text-stone-400 text-xs leading-relaxed">狭い空間にいるため、閉所恐怖症の方は注意が必要です。</p>
                  </div>
                  <div>
                    <span className="block text-amber-500 text-sm font-bold mb-1">体調不良</span>
                    <p className="text-stone-400 text-xs leading-relaxed">初回は頭痛や、好転反応としてだるさを感じることがあります。</p>
                  </div>
                </div>
                <p className="text-stone-500 text-xs mt-4 pt-4 border-t border-stone-800">
                  ※慢性的な不眠症や持病がある場合は、利用前に医師に相談することをお勧めします。
                </p>
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
               <p className="text-xs text-stone-500 font-bold mb-1">自律神経・不眠症のご相談はこちら</p>
               <p className="text-xl font-bold text-stone-800 font-serif">えびす鍼灸整骨院</p>
            </div>
            <div className="flex w-full md:w-auto gap-3">
               <a href="/#access" className="flex-1 md:flex-none bg-indigo-600 hover:bg-indigo-500 text-white px-12 py-4 rounded-xl font-bold flex items-center justify-center gap-3 shadow-lg transition-all hover:-translate-y-0.5">
                  <span className="text-xl font-serif tracking-wide">お問合せ</span>
               </a>
            </div>
         </div>
      </div>
    </main>
  );
};

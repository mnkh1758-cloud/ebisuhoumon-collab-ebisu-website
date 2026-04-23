import React, { useEffect } from 'react';
import { Baby, Phone, CheckCircle2, Heart, Sparkles, Quote, Activity, Star, Wind } from 'lucide-react';

export const InfertilityPage: React.FC = () => {
  useEffect(() => {
    window.scrollTo(0, 0);

    // SEO Settings
    document.title = "不妊症治療・妊活ケア | 佐世保市のえびす鍼灸整骨院";
    const metaDescription = document.querySelector('meta[name="description"]');
    if (metaDescription) {
      metaDescription.setAttribute("content", "佐世保市で不妊症治療・妊活ケアならえびす鍼灸整骨院へ。高圧酸素ルームや鍼灸による体質改善で、血流やホルモンバランスを整え、妊娠しやすい身体づくりをサポートします。");
    }
  }, []);

  return (
    <main className="pt-20 bg-stone-50 min-h-screen animate-fade-in-up">
      {/* Hero Section */}
      <div className="relative h-[40vh] md:h-[500px] overflow-hidden">
        <img 
          src="https://github.com/ebisuhoumon-collab/ebisuhoumon-collab-ebisu-website/blob/main/ninpu.jpg.webp?raw=true" 
          alt="不妊症治療・妊活ケア"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-pink-900/80 to-pink-800/40 flex items-center">
          <div className="container mx-auto px-6">
            <div className="max-w-2xl text-white">
              <div className="inline-flex items-center gap-2 bg-pink-500/30 backdrop-blur-md px-4 py-2 rounded-full text-sm font-bold tracking-wider mb-6 border border-pink-400/30">
                <Baby size={16} />
                <span>INFERTILITY CARE</span>
              </div>
              <h1 className="text-3xl md:text-5xl font-bold font-serif mb-6 leading-tight">
                不妊症治療・妊活ケア
              </h1>
              <p className="text-lg md:text-xl text-pink-50 leading-relaxed font-medium">
                高圧酸素ルームや鍼灸による体質改善。<br className="hidden md:block" />
                血流やホルモンバランスを整え、妊娠しやすい身体づくりをサポートします。
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-6 py-16 md:py-24 max-w-5xl">
        
        {/* Concept Section */}
        <div className="text-center mb-20">
          <span className="text-pink-600 font-bold text-xs tracking-[0.2em] uppercase block mb-3">Concept</span>
          <h2 className="text-2xl md:text-4xl font-bold font-serif text-stone-800 leading-tight mb-8">
            医学的アプローチ × 自然の力。<br />
            高圧酸素が“授かる力”を底上げします。
          </h2>
          <div className="bg-white p-8 md:p-12 rounded-3xl shadow-sm border border-pink-100 text-left">
            <p className="text-stone-700 leading-loose mb-6">
              <strong className="text-pink-800 text-lg block mb-4">血流・ホルモン・心のバランスまで。すべてを支えるのは酸素でした。</strong>
              高圧酸素ルームは、通常より高い気圧環境を作ることで、身体にたっぷりと酸素を取り込み、血液中の「溶解型酸素」を増やすことができます。この酸素の力が、妊娠に大切な体の働きを内側からサポートしていきます。
            </p>
            <p className="text-stone-700 leading-loose mb-6">
              妊娠には「ホルモンのバランス」「血流」「卵子・精子の質」など、さまざまな要素が関わっています。高圧酸素ルームは、自然の力で体の内側からこれらをサポートし、「妊娠しやすい身体づくり」を後押しします。
            </p>
            <p className="text-stone-700 leading-loose">
              高圧酸素ルームは薬や注射とは違い、「身体が本来持っている回復力・整える力」を高める補助的ケアです。医療行為ではありませんが、不妊治療と並行して利用される方も多くいらっしゃいます。妊活中の心と身体の負担を軽くし、少しでも安心して毎日を過ごせるように――<br />
              そんな想いで、私たちは皆さまの妊活を応援しています。
            </p>
          </div>
        </div>

        {/* Symptoms List */}
        <div className="mb-20">
          <div className="flex items-center gap-4 mb-8">
            <div className="h-px flex-1 bg-pink-200"></div>
            <h3 className="text-2xl font-bold font-serif text-stone-800 text-center flex items-center gap-2">
              <Activity className="text-pink-500" />
              こんなお悩みはありませんか？
            </h3>
            <div className="h-px flex-1 bg-pink-200"></div>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {[
              '冷え・むくみ',
              '生理不順',
              'ストレス・不安',
              'ホルモンバランスの乱れ',
              '卵子・精子の質が気になる',
              '体質改善をしたい'
            ].map((symptom, idx) => (
              <div key={idx} className="bg-white p-4 rounded-xl border border-pink-100 shadow-sm flex items-center gap-3">
                <CheckCircle2 className="text-pink-500 shrink-0" size={20} />
                <span className="font-bold text-stone-700 text-sm">{symptom}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Effects of High Pressure Oxygen */}
        <div className="mb-24">
          <div className="text-center mb-12">
            <span className="text-pink-600 font-bold text-xs tracking-[0.2em] uppercase block mb-3">Double the effect</span>
            <h3 className="text-3xl font-bold font-serif text-stone-800 mb-4">高圧酸素の効果</h3>
            <p className="text-stone-600 max-w-2xl mx-auto">
              高圧酸素ルームは、身体のすみずみにまで酸素を行き渡らせることで、妊娠に欠かせない「血流」「ホルモンバランス」「卵子・精子の質」を内側からサポートします。
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            {[
              {
                title: '01 卵巣や子宮の血流改善',
                description: '高気圧環境によって血液中の「溶解型酸素」が増えることで、卵巣や子宮、精巣など末端の臓器にまで酸素がしっかり届きます。これにより臓器本来の働きがサポートされ、妊娠の準備が整いやすい状態へと導かれます。'
              },
              {
                title: '02 着床環境の改善',
                description: '酸素のめぐりが良くなることで子宮内膜の血流や栄養状態が整い、ふかふかのベッドのような着床環境をつくり出します。新しい命を迎えるための大切な第一歩を、内側からサポートします。'
              },
              {
                title: '03 卵子・精子の質を守るサポート',
                description: '酸素は細胞がエネルギーを生み出すための源。卵子や精子の細胞分裂や成熟を支えることで、健やかな成長を助けます。また、酸素が体内で活性酸素を除去しやすくすることで、ダメージを防ぎ、質を守る効果も期待できます。'
              },
              {
                title: '04 ホルモンバランス・自律神経の調整',
                description: '脳や神経の働きに酸素が十分に届くことで、ホルモンのリズムが安定しやすくなります。乱れがちな自律神経を整えることで、妊娠に必要なホルモンの分泌がスムーズに。心身の調和を後押しします。'
              },
              {
                title: '05 冷え・むくみの改善',
                description: '血流が促進されることで体温が上がり、冷えやすい体を温めます。子宮の環境もポカポカと温かく保たれ、妊娠を目指す体づくりにプラスの作用をもたらします。同時に、滞りがちな余分な水分も流れやすくなり、むくみの改善にもつながります。'
              },
              {
                title: '06 ストレス軽減・気持ちの安定',
                description: '妊活中はどうしても不安やプレッシャーを抱えやすい時期。酸素が脳にしっかり行き渡ることでリラックス効果が得られ、心が落ち着きやすくなります。前向きな気持ちで毎日を過ごせるようサポートします。'
              }
            ].map((effect, idx) => (
              <div key={idx} className="bg-white p-6 rounded-2xl shadow-sm border border-pink-50 hover:border-pink-200 transition-colors group">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-pink-50 rounded-xl flex items-center justify-center shrink-0 group-hover:bg-pink-100 transition-colors">
                    <Wind className="text-pink-600" size={24} />
                  </div>
                  <div>
                    <h4 className="font-bold text-stone-800 text-lg mb-2">{effect.title}</h4>
                    <p className="text-sm text-stone-600 leading-relaxed">{effect.description}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Testimonials */}
        <div className="mb-24">
          <div className="flex items-center gap-4 mb-12">
            <div className="h-px flex-1 bg-stone-200"></div>
            <h3 className="text-2xl font-bold font-serif text-stone-800 text-center">
              <span className="block text-xs text-pink-600 font-sans font-bold tracking-widest uppercase mb-1">Voice</span>
              会員様の声
            </h3>
            <div className="h-px flex-1 bg-stone-200"></div>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {[
              {
                title: '30代前半 (妊活歴2年)',
                description: '「長い間、体の冷えと生理不順に悩んでいました。高圧酸素ルームを利用し始めてから、手足の冷たさがやわらぎ、朝の目覚めもスッキリ。基礎体温が安定してきて、体が整ってきたなと実感しています。焦る気持ちが落ち着き、前向きに妊活に取り組めるようになりました。」'
              },
              {
                title: '30代後半 (妊活歴3年)',
                description: '「育児と仕事で自分のケアが後回しになっていましたが、酸素ルームに入ると頭がスッと軽くなって、体の芯まで温まる感覚があります。通ううちに生理周期が整い、肌の調子まで良くなりました。気持ちにも余裕が生まれて、またがんばってみようと思えるようになりました。」'
              },
              {
                title: '40代前半 (妊活歴5年以上)',
                description: '「年齢的に難しいかも…と半分あきらめていましたが、通い始めてから冷えやむくみが軽くなり、体が動かしやすくなりました。夜もぐっすり眠れるようになり、朝の疲れが残らなくなったのが嬉しいです。最近は夫から表情が明るくなったねと言われて、心まで軽くなった気がします。」'
              }
            ].map((voice, idx) => (
              <div key={idx} className="bg-white p-6 rounded-2xl shadow-sm border border-stone-100 relative">
                <Quote className="absolute top-4 right-4 text-pink-50 rotate-180" size={40} />
                <div className="flex items-center gap-3 mb-4 relative z-10">
                  <div className="w-10 h-10 rounded-full bg-pink-100 flex items-center justify-center text-pink-600 font-bold text-xs">
                    <Heart size={16} />
                  </div>
                  <div>
                    <p className="font-bold text-sm text-stone-800">{voice.title}</p>
                  </div>
                </div>
                <p className="text-xs text-stone-600 leading-relaxed relative z-10">
                  {voice.description}
                </p>
                <div className="mt-4 flex gap-1">
                  {[1,2,3,4,5].map(i => <Star key={i} size={12} className="text-yellow-400 fill-yellow-400" />)}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Satisfaction Data */}
        <div className="bg-pink-50 rounded-3xl p-8 md:p-12 border border-pink-100 mb-12">
          <div className="text-center mb-10">
            <h3 className="text-2xl font-bold font-serif text-stone-800 mb-2">実感できる変化</h3>
            <p className="text-stone-600 text-sm">多くの方が、継続的なケアで確かな変化を感じています。</p>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {[
              { title: '体調の変化を実感', percentage: 92, description: '冷えやむくみの改善、睡眠の質の向上など' },
              { title: '精神的な安定', percentage: 88, description: 'イライラや不安感の軽減' },
              { title: '生理周期の安定', percentage: 85, description: '基礎体温の安定化' }
            ].map((data, idx) => (
              <div key={idx} className="bg-white p-6 rounded-2xl text-center shadow-sm">
                <div className="text-4xl font-bold text-pink-500 font-mono mb-2">{data.percentage}<span className="text-xl">%</span></div>
                <h4 className="font-bold text-stone-800 mb-2">{data.title}</h4>
                <p className="text-xs text-stone-500">{data.description}</p>
              </div>
            ))}
          </div>
        </div>

      </div>

      {/* Bottom Padding for Fixed Footer */}
      <div className="h-32"></div>

      {/* Sticky Footer CTA */}
      <div className="fixed bottom-0 inset-x-0 bg-white border-t border-stone-200 p-4 pb-8 md:pb-4 shadow-[0_-10px_40px_rgba(0,0,0,0.1)] z-40">
         <div className="container mx-auto max-w-4xl flex flex-col md:flex-row items-center gap-4 justify-between">
            <div className="hidden md:block">
               <p className="text-xs text-stone-500 font-bold mb-1">妊活・不妊症治療のご相談はこちら</p>
               <p className="text-xl font-bold text-stone-800 font-serif">えびす鍼灸整骨院</p>
            </div>
            <div className="flex w-full md:w-auto gap-3">
               <a href="tel:0956379110" className="flex-1 md:flex-none bg-pink-600 hover:bg-pink-500 text-white px-8 py-3 rounded-xl font-bold flex items-center justify-center gap-3 shadow-lg transition-all hover:-translate-y-0.5">
                  <Phone size={24} className="animate-pulse" />
                  <div className="text-left leading-none">
                     <span className="block text-[10px] opacity-90 font-bold mb-0.5">総合窓口（大塔院）</span>
                     <span className="text-xl font-serif tracking-wide">0956-37-9110</span>
                  </div>
               </a>
            </div>
         </div>
      </div>
    </main>
  );
};

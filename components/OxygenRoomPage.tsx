import React, { useEffect } from 'react';
import { Wind, Phone, CheckCircle2, Activity, Zap, Brain, Heart, Info, ArrowRight } from 'lucide-react';

export const OxygenRoomPage: React.FC = () => {
  useEffect(() => {
    window.scrollTo(0, 0);

    // SEO Settings
    document.title = "O2ルーム(酸素ルーム)・高気圧/低気圧ケア | 佐世保市のえびす鍼灸整骨院";
    const metaDescription = document.querySelector('meta[name="description"]');
    if (metaDescription) {
      metaDescription.setAttribute("content", "佐世保市でO2ルーム(酸素ルーム)ならえびす鍼灸整骨院へ。高気圧×低気圧の2つの環境で、疲労回復からアンチエイジング、高地トレーニングまで。怪我の早期回復にも特化した最先端設備をご用意しています。");
    }
  }, []);

  return (
    <main className="pt-20 bg-stone-50 min-h-screen animate-fade-in-up">
      {/* Hero Section */}
      <div className="relative h-[40vh] md:h-[500px] overflow-hidden">
        <img 
          src="https://github.com/ebisuhoumon-collab/ebisuhoumon-collab-ebisu-website/blob/main/o2room.jpg.webp?raw=true" 
          alt="O2ルーム (酸素ルーム)"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-cyan-900/90 to-cyan-800/50 flex items-center">
          <div className="container mx-auto px-6">
            <div className="max-w-2xl text-white">
              <div className="inline-flex items-center gap-2 bg-cyan-500/30 backdrop-blur-md px-4 py-2 rounded-full text-sm font-bold tracking-wider mb-6 border border-cyan-400/30">
                <Wind size={16} />
                <span>OXYGEN ROOM</span>
              </div>
              <h1 className="text-3xl md:text-5xl font-bold font-serif mb-6 leading-tight">
                O²ルーム (酸素ルーム)
              </h1>
              <p className="text-lg md:text-xl text-cyan-50 leading-relaxed font-medium">
                高気圧×低気圧の2つの環境で、<br className="hidden md:block" />
                疲労回復から高地トレーニングまで。
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-6 py-16 md:py-24 max-w-5xl">
        
        {/* Concept Section */}
        <div className="text-center mb-20">
          <span className="text-cyan-600 font-bold text-xs tracking-[0.2em] uppercase block mb-3">Concept</span>
          <h2 className="text-2xl md:text-4xl font-bold font-serif text-stone-800 leading-tight mb-8">
            高気圧酸素 × 低気圧酸素による<br />
            身体ケアのための最先端設備！
          </h2>
          <div className="bg-white p-8 md:p-12 rounded-3xl shadow-sm border border-cyan-100 text-left">
            <p className="text-stone-700 leading-loose mb-6">
              O²ルームとは、高気圧酸素空間と低気圧酸素空間を創り出すことで、身体の細胞の活性化を促す効果をもたらす最新機器です。
              カプセル内は広い空間になっているので、同時に整体やトレーニングを行うことができ、相乗効果も期待できます。
            </p>
            <p className="text-stone-700 leading-loose">
              高濃度酸素ルームによって、痛めた体の自己治癒能力を向上させ、骨折やむち打ちなどで痛めた体の治癒能力の向上に最適です。また、疲労回復やアンチエイジングなど、健康維持にも高い効果を発揮します。
            </p>
          </div>
        </div>

        {/* Symptoms List */}
        <div className="mb-20">
          <div className="flex items-center gap-4 mb-8">
            <div className="h-px flex-1 bg-cyan-200"></div>
            <h3 className="text-2xl font-bold font-serif text-stone-800 text-center flex items-center gap-2">
              <Activity className="text-cyan-500" />
              こんなお悩み・目的はありませんか？
            </h3>
            <div className="h-px flex-1 bg-cyan-200"></div>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {[
              '慢性的な疲労',
              '怪我が治りにくい',
              '睡眠不足・二日酔い',
              '集中力不足',
              '冷え・むくみ',
              'スポーツのパフォーマンス向上'
            ].map((symptom, idx) => (
              <div key={idx} className="bg-white p-4 rounded-xl border border-cyan-100 shadow-sm flex items-center gap-3">
                <CheckCircle2 className="text-cyan-500 shrink-0" size={20} />
                <span className="font-bold text-stone-700 text-sm">{symptom}</span>
              </div>
            ))}
          </div>
        </div>

        {/* High Pressure Section */}
        <div className="mb-24">
          <div className="flex items-center gap-3 mb-8">
            <div className="w-12 h-12 bg-blue-100 rounded-2xl flex items-center justify-center text-blue-600">
              <ArrowRight className="rotate-90" size={24} />
            </div>
            <h3 className="text-3xl font-bold font-serif text-stone-800">高気圧酸素ルームの効果</h3>
          </div>
          
          <div className="bg-white rounded-3xl p-8 md:p-10 shadow-sm border border-blue-100 mb-8">
            <div className="grid md:grid-cols-2 gap-8 items-center mb-10">
              <div>
                <h4 className="text-xl font-bold text-blue-800 mb-4">高気圧酸素ルームの仕組み</h4>
                <p className="text-stone-700 leading-relaxed mb-6">
                  気圧を上げることで、血液中に溶け込む「溶解型酸素」を通常の3倍以上に増やし、身体の隅々まで酸素を行き渡らせます。
                </p>
                <div className="bg-blue-50 p-6 rounded-2xl">
                  <h5 className="font-bold text-blue-900 mb-2">溶解型酸素とは？</h5>
                  <p className="text-sm text-stone-600 leading-relaxed">
                    通常の呼吸で取り込む酸素（結合型酸素）はヘモグロビンと結びつきますが、毛細血管よりもサイズが大きいため、末端まで届きにくい性質があります。一方、高気圧環境で増える「溶解型酸素」は非常に微細で、血液や体液に直接溶け込むため、毛細血管の先まで酸素を届けることができます。
                  </p>
                </div>
              </div>
              <div className="rounded-2xl overflow-hidden h-64">
                <img src="https://github.com/ebisuhoumon-collab/ebisuhoumon-collab-ebisu-website/blob/main/aozora.jpg.webp?raw=true" alt="高気圧酸素ルームの仕組み" className="w-full h-full object-cover" />
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              {[
                {
                  icon: <Zap size={24} />,
                  title: '疲労回復・ケガの早期回復',
                  description: '酸素は乳酸を分解し、細胞の再生時間を大幅に短縮します。骨折や肉離れなどの怪我の回復を早める効果があり、プロスポーツ選手も愛用しています。'
                },
                {
                  icon: <Heart size={24} />,
                  title: 'アンチエイジング・美容・ダイエット',
                  description: '肌細胞の新陳代謝を活性化し、肌のターンオーバーを整えます。また、脂肪燃焼効率を高め、太りにくい体質を作ります。'
                },
                {
                  icon: <Brain size={24} />,
                  title: '脳の活性化・二日酔い回復',
                  description: '脳に酸素を行き渡らせることで集中力や記憶力がアップ。また、アルコールの分解を助け、二日酔いを解消します。'
                },
                {
                  icon: <Activity size={24} />,
                  title: '自律神経・レオロジー効果',
                  description: '均一な圧力で体の歪みを整え（レオロジー効果）、自律神経の働きを正常化します。睡眠の質向上にもつながります。'
                }
              ].map((effect, idx) => (
                <div key={idx} className="bg-stone-50 p-6 rounded-2xl border border-stone-100">
                  <div className="flex items-center gap-3 mb-3 text-blue-600">
                    {effect.icon}
                    <h5 className="font-bold text-stone-800">{effect.title}</h5>
                  </div>
                  <p className="text-sm text-stone-600 leading-relaxed">{effect.description}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Low Pressure Section */}
        <div className="mb-24">
          <div className="flex items-center gap-3 mb-8">
            <div className="w-12 h-12 bg-emerald-100 rounded-2xl flex items-center justify-center text-emerald-600">
              <ArrowRight className="-rotate-90" size={24} />
            </div>
            <h3 className="text-3xl font-bold font-serif text-stone-800">低気圧酸素ルームの効果</h3>
          </div>
          
          <div className="bg-white rounded-3xl p-8 md:p-10 shadow-sm border border-emerald-100">
            <div className="grid md:grid-cols-2 gap-8 items-center mb-10">
              <div className="order-2 md:order-1 rounded-2xl overflow-hidden h-64">
                <img src="https://images.unsplash.com/photo-1551632811-561732d1e306?auto=format&fit=crop&w=800&q=80" alt="低気圧酸素ルームの効果" className="w-full h-full object-cover" />
              </div>
              <div className="order-1 md:order-2">
                <p className="text-stone-700 leading-relaxed mb-6 text-lg">
                  高地（標高2000m〜3000m級）の環境を再現し、細胞を活性化させます。
                </p>
                <div className="space-y-6">
                  <div className="bg-emerald-50 p-6 rounded-2xl">
                    <h5 className="font-bold text-emerald-900 mb-2 flex items-center gap-2">
                      <Activity size={18} />
                      心肺機能・パフォーマンス向上
                    </h5>
                    <p className="text-sm text-stone-600 leading-relaxed">
                      「高地トレーニング」と同じ環境を作ることで、酸素運搬能力やスタミナを強化。疲れにくい体を作ります。マラソンや持久系スポーツをされる方に最適です。
                    </p>
                  </div>
                  <div className="bg-emerald-50 p-6 rounded-2xl">
                    <h5 className="font-bold text-emerald-900 mb-2 flex items-center gap-2">
                      <Heart size={18} />
                      健康増進・長寿への期待
                    </h5>
                    <p className="text-sm text-stone-600 leading-relaxed">
                      血管拡張作用や基礎代謝の向上により、動脈硬化や肥満の予防など、健康寿命を延ばす効果が期待できます。
                    </p>
                  </div>
                </div>
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
               <p className="text-xs text-stone-500 font-bold mb-1">O2ルームのご予約・ご相談はこちら</p>
               <p className="text-xl font-bold text-stone-800 font-serif">えびす鍼灸整骨院</p>
            </div>
            <div className="flex w-full md:w-auto gap-3">
               <a href="/#access" className="flex-1 md:flex-none bg-cyan-600 hover:bg-cyan-500 text-white px-12 py-4 rounded-xl font-bold flex items-center justify-center gap-3 shadow-lg transition-all hover:-translate-y-0.5">
                  <span className="text-xl font-serif tracking-wide">お問合せ</span>
               </a>
            </div>
         </div>
      </div>
    </main>
  );
};

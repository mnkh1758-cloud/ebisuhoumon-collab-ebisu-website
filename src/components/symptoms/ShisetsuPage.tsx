import React, { useEffect } from 'react';
import { 
  HeartHandshake, 
  Activity, 
  CheckCircle2, 
  ShieldCheck, 
  Smile, 
  Users, 
  Zap, 
  MessageCircle, 
  Sparkles, 
  PersonStanding,
  ChevronRight,
  Stethoscope,
  MapPin,
  Phone
} from 'lucide-react';
import { Link } from 'react-router-dom';

export const ShisetsuPage: React.FC = () => {
  useEffect(() => {
    window.scrollTo(0, 0);
    document.title = "施設入居者向けケアでお困りの方へ｜佐世保市の訪問鍼灸マッサージ";
  }, []);

  return (
    <main className="bg-stone-50 min-h-screen pt-20">
      <div className="relative bg-white border-b border-stone-200 overflow-hidden">
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-orange-50 rounded-full blur-3xl opacity-50 -translate-y-1/2 translate-x-1/3"></div>
        <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-blue-50 rounded-full blur-3xl opacity-50 translate-y-1/3 -translate-x-1/3"></div>
        
        <div className="container mx-auto px-6 py-16 md:py-24 relative z-10">
          <div className="max-w-4xl mx-auto text-center">
            <span className="inline-block py-1 px-3 rounded-full bg-orange-100 text-orange-700 text-sm font-bold tracking-widest mb-6">
              佐世保市の訪問鍼灸マッサージ
            </span>
            <h1 className="text-3xl md:text-5xl font-bold font-serif text-stone-800 mb-8 leading-tight">
              【施設入居者向けケア】で<br className="md:hidden" />お困りの方へ
            </h1>
            <p className="text-lg md:text-xl text-stone-600 mb-10 leading-relaxed font-medium">
              ご自宅・施設へ訪問し、<span className="text-orange-600 font-bold border-b-2 border-orange-200">医療保険を使って受けられる在宅ケア</span>です。
            </p>
            
            <div className="bg-white/80 backdrop-blur-sm p-6 md:p-8 rounded-3xl shadow-sm border border-stone-100 text-left max-w-2xl mx-auto">
              <p className="text-stone-700 mb-4 font-bold">施設入居中の</p>
              <ul className="grid grid-cols-2 gap-3 mb-6">
                {['リハビリの時間が足りない', '関節が固まってきた', 'むくみや冷えがひどい', '痛みを訴えている', 'ベッドで過ごす時間が多い', '外部との関わりを持たせたい'].map((item, i) => (
                  <li key={i} className="flex items-center gap-2 text-stone-600 text-sm md:text-base">
                    <CheckCircle2 size={18} className="text-orange-500 shrink-0" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
              <p className="text-stone-700 text-sm md:text-base leading-relaxed">
                などでお悩みの方に、国家資格者がご自宅で施術を行います。<br/>
                <span className="font-bold text-orange-600">「施設での生活の質（QOL）向上と、機能維持」</span> のためのサポートを行います。
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-6 py-16 md:py-24 max-w-4xl space-y-24">
        <section>
          <div className="text-center mb-10">
            <h2 className="text-2xl md:text-3xl font-bold font-serif text-stone-800 mb-4">
              1. 施設入居者の方の特徴とよくある悩み
            </h2>
          </div>
          <div className="bg-white rounded-3xl p-8 shadow-sm border border-stone-100">
            <div className="grid md:grid-cols-2 gap-6">
              {[
                '施設のリハビリだけでは運動量が足りないと感じる',
                '車椅子やベッドでの生活が長く、関節が固まってきた',
                '足のむくみがひどく、靴が履きにくい',
                '慢性的な痛みがあるが、施設では対応が難しい',
                '家族が頻繁に面会に行けず、刺激が少ない',
                '施設スタッフの介護負担を少しでも減らしたい'
              ].map((item, i) => (
                <div key={i} className="flex items-start gap-3">
                  <div className="bg-blue-50 p-1.5 rounded-full text-blue-600 mt-0.5 shrink-0">
                    <Activity size={16} />
                  </div>
                  <span className="text-stone-700 font-medium">{item}</span>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section>
          <div className="text-center mb-10">
            <h2 className="text-2xl md:text-3xl font-bold font-serif text-stone-800 mb-4">
              2. 当院の訪問ケアでできること
            </h2>
          </div>
          <div className="grid sm:grid-cols-2 gap-6">
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-stone-100">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-emerald-50 rounded-lg flex items-center justify-center text-emerald-600">
                  <PersonStanding size={20} />
                </div>
                <h3 className="font-bold text-lg text-stone-800">リハビリ・関節可動域訓練</h3>
              </div>
              <ul className="space-y-2 text-sm text-stone-600">
                <li className="flex items-center gap-2"><div className="w-1.5 h-1.5 bg-stone-300 rounded-full"></div>施設のリハビリを補完する運動療法</li>
                <li className="flex items-center gap-2"><div className="w-1.5 h-1.5 bg-stone-300 rounded-full"></div>関節拘縮の予防と改善</li>
                <li className="flex items-center gap-2"><div className="w-1.5 h-1.5 bg-stone-300 rounded-full"></div>立ち上がりや歩行などの動作訓練</li>
              </ul>
            </div>
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-stone-100">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-orange-50 rounded-lg flex items-center justify-center text-orange-600">
                  <HeartHandshake size={20} />
                </div>
                <h3 className="font-bold text-lg text-stone-800">マッサージ・指圧</h3>
              </div>
              <ul className="space-y-2 text-sm text-stone-600">
                <li className="flex items-center gap-2"><div className="w-1.5 h-1.5 bg-stone-300 rounded-full"></div>全身の血流・リンパの循環改善</li>
                <li className="flex items-center gap-2"><div className="w-1.5 h-1.5 bg-stone-300 rounded-full"></div>足のむくみや冷えの緩和</li>
                <li className="flex items-center gap-2"><div className="w-1.5 h-1.5 bg-stone-300 rounded-full"></div>筋肉の緊張緩和とリラクゼーション</li>
              </ul>
            </div>
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-stone-100">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-orange-50 rounded-lg flex items-center justify-center text-orange-600">
                  <Sparkles size={20} />
                </div>
                <h3 className="font-bold text-lg text-stone-800">鍼灸（ご希望に応じて）</h3>
              </div>
              <ul className="space-y-2 text-sm text-stone-600">
                <li className="flex items-center gap-2"><div className="w-1.5 h-1.5 bg-stone-300 rounded-full"></div>慢性的な痛みの緩和</li>
                <li className="flex items-center gap-2"><div className="w-1.5 h-1.5 bg-stone-300 rounded-full"></div>自律神経の調整（不眠や便秘の改善）</li>
              </ul>
            </div>
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-stone-100">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-pink-50 rounded-lg flex items-center justify-center text-pink-600">
                  <MessageCircle size={20} />
                </div>
                <h3 className="font-bold text-lg text-stone-800">施設スタッフ・ご家族との連携</h3>
              </div>
              <ul className="space-y-2 text-sm text-stone-600">
                <li className="flex items-center gap-2"><div className="w-1.5 h-1.5 bg-stone-300 rounded-full"></div>施術内容や身体状況の定期的な報告</li>
                <li className="flex items-center gap-2"><div className="w-1.5 h-1.5 bg-stone-300 rounded-full"></div>施設スタッフと協力したケア体制の構築</li>
                <li className="flex items-center gap-2"><div className="w-1.5 h-1.5 bg-stone-300 rounded-full"></div>ご家族への安心の提供</li>
              </ul>
            </div>
          </div>
        </section>

        <section className="bg-orange-50/50 rounded-3xl p-8 md:p-12 border border-orange-100">
          <div className="text-center mb-10">
            <h2 className="text-2xl md:text-3xl font-bold font-serif text-stone-800 mb-4">
              3. 期待できる効果
            </h2>
          </div>
          <div className="max-w-2xl mx-auto">
            <ul className="grid sm:grid-cols-2 gap-4 mb-8">
              {[
                '関節が柔らかくなり、着替えや移乗が楽になる',
                'むくみが取れ、足が軽くなる',
                '痛みが和らぎ、表情が穏やかになる',
                '定期的な訪問により、生活にメリハリが出る',
                '会話やスキンシップにより、認知機能の低下を予防',
                '施設スタッフの介護負担が軽減される'
              ].map((item, i) => (
                <li key={i} className="flex items-center gap-3 bg-white p-3 rounded-xl shadow-sm border border-stone-100">
                  <CheckCircle2 size={18} className="text-emerald-500 shrink-0" />
                  <span className="text-stone-700 font-medium text-sm">{item}</span>
                </li>
              ))}
            </ul>
          </div>
        </section>

        {/* 4. 料金と保険適用 */}
        <section>
          <div className="text-center mb-10">
            <h2 className="text-2xl md:text-3xl font-bold font-serif text-stone-800 mb-4">
              4. 料金と保険適用
            </h2>
          </div>
          
          <div className="bg-white rounded-3xl p-8 shadow-sm border border-stone-100 text-center max-w-2xl mx-auto">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-50 text-blue-600 rounded-full mb-6">
              <ShieldCheck size={32} />
            </div>
            <h3 className="text-xl font-bold text-stone-800 mb-4">
              訪問鍼灸マッサージは<span className="text-blue-600">医療保険</span>が使えます。
            </h3>
            <p className="text-stone-600 mb-8">
              医師の同意書があれば、<span className="font-bold text-lg text-stone-800">1〜3割負担</span>で利用できます。
            </p>
            
            <div className="grid sm:grid-cols-3 gap-4">
              <div className="bg-stone-50 p-4 rounded-xl">
                <p className="font-bold text-stone-700 text-sm">同意書取得は<br/>当院がサポート</p>
              </div>
              <div className="bg-stone-50 p-4 rounded-xl">
                <p className="font-bold text-stone-700 text-sm">交通費込み</p>
              </div>
              <div className="bg-stone-50 p-4 rounded-xl">
                <p className="font-bold text-stone-700 text-sm">生活保護の方も<br/>利用可能</p>
              </div>
            </div>
          </div>
        </section>

        {/* 9. 予約導線 & 最後に */}
        <section className="bg-orange-600 rounded-3xl p-8 md:p-12 text-center text-white shadow-lg relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
          <div className="relative z-10">
            <h2 className="text-2xl md:text-3xl font-bold font-serif mb-6">
              施設入居者向けケアのことでお困りの方は、<br className="hidden md:block" />
              まずはお気軽にご相談ください
            </h2>
            <p className="text-orange-100 mb-10 max-w-2xl mx-auto">
              症状やお身体の状態について、まずはお気軽にご相談ください。<br />
              ご自宅・施設へお伺いし、初回評価を行います。
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a href="tel:08025105242" className="inline-flex items-center justify-center gap-2 bg-white text-orange-600 px-8 py-4 rounded-full font-bold hover:bg-orange-50 transition-colors shadow-sm">
                <Phone size={20} />
                <span>080-2510-5242</span>
              </a>
              <Link to="/予約" className="inline-flex items-center justify-center gap-2 bg-stone-900 text-white px-8 py-4 rounded-full font-bold hover:bg-stone-800 transition-colors shadow-sm">
                <span>施術を予約する</span>
                <ChevronRight size={20} />
              </Link>
            </div>
            
            <div className="mt-8 flex flex-wrap justify-center gap-4">
              <Link to="/home-visit" className="text-sm text-orange-200 hover:text-white underline underline-offset-4">
                訪問鍼灸マッサージの詳細へ
              </Link>
              <Link to="/price" className="text-sm text-orange-200 hover:text-white underline underline-offset-4">
                料金表・メニュー一覧へ
              </Link>
              <Link to="/" className="text-sm text-orange-200 hover:text-white underline underline-offset-4">
                トップページへ戻る
              </Link>
            </div>
          </div>
        </section>

      </div>
    </main>
  );
};

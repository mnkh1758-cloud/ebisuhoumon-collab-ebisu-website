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

export const ParkinsonPage: React.FC = () => {
  useEffect(() => {
    window.scrollTo(0, 0);
    
    // SEO Settings
    document.title = "パーキンソン病でお困りの方へ｜佐世保市の訪問鍼灸マッサージ";
    const metaDescription = document.querySelector('meta[name="description"]');
    if (metaDescription) {
      metaDescription.setAttribute("content", "佐世保市でパーキンソン病による筋固縮、動作の緩慢、姿勢保持の難しさ等にお悩みならえびす鍼灸整骨院の訪問マッサージへ。医療保険適用でご自宅・施設へ伺い、リハビリや鍼灸治療を行います。");
    }
  }, []);

  return (
    <main className="bg-stone-50 min-h-screen pt-20">
      {/* Hero Section */}
      <div className="relative bg-white border-b border-stone-200 overflow-hidden">
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-orange-50 rounded-full blur-3xl opacity-50 -translate-y-1/2 translate-x-1/3"></div>
        <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-blue-50 rounded-full blur-3xl opacity-50 translate-y-1/3 -translate-x-1/3"></div>
        
        <div className="container mx-auto px-6 py-16 md:py-24 relative z-10">
          <div className="max-w-4xl mx-auto text-center">
            <span className="inline-block py-1 px-3 rounded-full bg-orange-100 text-orange-700 text-sm font-bold tracking-widest mb-6">
              佐世保市の訪問鍼灸マッサージ
            </span>
            <h1 className="text-3xl md:text-5xl font-bold font-serif text-stone-800 mb-8 leading-tight">
              【パーキンソン病】で<br className="md:hidden" />お困りの方へ
            </h1>
            <p className="text-lg md:text-xl text-stone-600 mb-10 leading-relaxed font-medium">
              ご自宅・施設へ訪問し、<span className="text-orange-600 font-bold border-b-2 border-orange-200">医療保険を使って受けられる在宅ケア</span>です。
            </p>
            
            <div className="bg-white/80 backdrop-blur-sm p-6 md:p-8 rounded-3xl shadow-sm border border-stone-100 text-left max-w-2xl mx-auto">
              <p className="text-stone-700 mb-4 font-bold">パーキンソン病は、</p>
              <ul className="grid grid-cols-2 gap-3 mb-6">
                {['筋固縮（筋肉のこわばり）', '動作の緩慢', '姿勢保持の難しさ', '歩行の不安定さ', 'ふるえ', '疲れやすさ', '日常生活動作（ADL）の低下'].map((item, i) => (
                  <li key={i} className="flex items-center gap-2 text-stone-600 text-sm md:text-base">
                    <CheckCircle2 size={18} className="text-orange-500 shrink-0" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
              <p className="text-stone-700 text-sm md:text-base leading-relaxed">
                などが徐々に進行しやすい疾患です。<br/>
                当院では、国家資格者がご自宅で症状に合わせた施術を行い、<br/>
                <span className="font-bold text-orange-600">「できることを維持・向上させる」</span> ためのサポートを行います。
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-6 py-16 md:py-24 max-w-4xl space-y-24">
        
        {/* 1. 特徴とよくある悩み */}
        <section>
          <div className="text-center mb-10">
            <h2 className="text-2xl md:text-3xl font-bold font-serif text-stone-800 mb-4">
              1. パーキンソン病の特徴とよくある悩み
            </h2>
            <p className="text-stone-600">パーキンソン病では、以下のような症状が日常生活に影響します。</p>
          </div>
          
          <div className="bg-white rounded-3xl p-8 shadow-sm border border-stone-100">
            <div className="grid md:grid-cols-2 gap-6">
              {[
                '体が固まって動きにくい',
                '歩き始めが難しい（すくみ足）',
                '小刻み歩行になる',
                '姿勢が前かがみになる',
                '転倒しやすい',
                '手足の震え',
                '疲れやすく、動作が遅くなる',
                '介助量が増えてきた'
              ].map((item, i) => (
                <div key={i} className="flex items-start gap-3">
                  <div className="bg-blue-50 p-1.5 rounded-full text-blue-600 mt-0.5 shrink-0">
                    <Activity size={16} />
                  </div>
                  <span className="text-stone-700 font-medium">{item}</span>
                </div>
              ))}
            </div>
            <div className="mt-8 p-4 bg-orange-50 rounded-xl border border-orange-100 text-center">
              <p className="text-orange-800 font-bold">
                通院が難しくなる方も多く、在宅でのケアが非常に重要です。
              </p>
            </div>
          </div>
        </section>

        {/* 2. 当院の訪問ケアでできること */}
        <section>
          <div className="text-center mb-10">
            <h2 className="text-2xl md:text-3xl font-bold font-serif text-stone-800 mb-4">
              2. えびす鍼灸整骨院の訪問ケアでできること
            </h2>
            <p className="text-stone-600">パーキンソン病に対して、当院では以下の施術を組み合わせて行います。</p>
          </div>

          <div className="grid sm:grid-cols-2 gap-6">
            {/* 鍼灸 */}
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-stone-100">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-orange-50 rounded-lg flex items-center justify-center text-orange-600">
                  <Sparkles size={20} />
                </div>
                <h3 className="font-bold text-lg text-stone-800">鍼灸</h3>
              </div>
              <ul className="space-y-2 text-sm text-stone-600">
                <li className="flex items-center gap-2"><div className="w-1.5 h-1.5 bg-stone-300 rounded-full"></div>筋固縮の緩和</li>
                <li className="flex items-center gap-2"><div className="w-1.5 h-1.5 bg-stone-300 rounded-full"></div>動作のスムーズさ向上</li>
                <li className="flex items-center gap-2"><div className="w-1.5 h-1.5 bg-stone-300 rounded-full"></div>姿勢保持の改善</li>
                <li className="flex items-center gap-2"><div className="w-1.5 h-1.5 bg-stone-300 rounded-full"></div>疲労軽減</li>
              </ul>
            </div>

            {/* ハイボルト電気治療 */}
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-stone-100">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-blue-50 rounded-lg flex items-center justify-center text-blue-600">
                  <Zap size={20} />
                </div>
                <h3 className="font-bold text-lg text-stone-800">ハイボルト電気治療</h3>
              </div>
              <ul className="space-y-2 text-sm text-stone-600">
                <li className="flex items-center gap-2"><div className="w-1.5 h-1.5 bg-stone-300 rounded-full"></div>深部の筋緊張を緩める</li>
                <li className="flex items-center gap-2"><div className="w-1.5 h-1.5 bg-stone-300 rounded-full"></div>動作時の痛みを軽減</li>
                <li className="flex items-center gap-2"><div className="w-1.5 h-1.5 bg-stone-300 rounded-full"></div>姿勢保持のサポート</li>
              </ul>
            </div>

            {/* メディセル */}
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-stone-100">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-emerald-50 rounded-lg flex items-center justify-center text-emerald-600">
                  <Activity size={20} />
                </div>
                <h3 className="font-bold text-lg text-stone-800">メディセル（筋膜リリース）</h3>
              </div>
              <ul className="space-y-2 text-sm text-stone-600">
                <li className="flex items-center gap-2"><div className="w-1.5 h-1.5 bg-stone-300 rounded-full"></div>筋膜の癒着を改善</li>
                <li className="flex items-center gap-2"><div className="w-1.5 h-1.5 bg-stone-300 rounded-full"></div>こわばりの軽減</li>
                <li className="flex items-center gap-2"><div className="w-1.5 h-1.5 bg-stone-300 rounded-full"></div>動作の滑らかさ向上</li>
              </ul>
            </div>

            {/* 超音波治療 */}
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-stone-100">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-blue-50 rounded-lg flex items-center justify-center text-blue-600">
                  <Activity size={20} />
                </div>
                <h3 className="font-bold text-lg text-stone-800">超音波治療</h3>
              </div>
              <ul className="space-y-2 text-sm text-stone-600">
                <li className="flex items-center gap-2"><div className="w-1.5 h-1.5 bg-stone-300 rounded-full"></div>深部組織の柔軟性向上</li>
                <li className="flex items-center gap-2"><div className="w-1.5 h-1.5 bg-stone-300 rounded-full"></div>関節周囲の硬さを軽減</li>
              </ul>
            </div>

            {/* マッサージ・指圧 */}
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-stone-100">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-orange-50 rounded-lg flex items-center justify-center text-orange-600">
                  <HeartHandshake size={20} />
                </div>
                <h3 className="font-bold text-lg text-stone-800">マッサージ・指圧</h3>
              </div>
              <ul className="space-y-2 text-sm text-stone-600">
                <li className="flex items-center gap-2"><div className="w-1.5 h-1.5 bg-stone-300 rounded-full"></div>血流改善</li>
                <li className="flex items-center gap-2"><div className="w-1.5 h-1.5 bg-stone-300 rounded-full"></div>筋緊張の緩和</li>
                <li className="flex items-center gap-2"><div className="w-1.5 h-1.5 bg-stone-300 rounded-full"></div>リラクゼーション効果</li>
              </ul>
            </div>

            {/* リハビリ・機能訓練 */}
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-stone-100">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-emerald-50 rounded-lg flex items-center justify-center text-emerald-600">
                  <PersonStanding size={20} />
                </div>
                <h3 className="font-bold text-lg text-stone-800">リハビリ・機能訓練</h3>
              </div>
              <ul className="space-y-2 text-sm text-stone-600">
                <li className="flex items-center gap-2"><div className="w-1.5 h-1.5 bg-stone-300 rounded-full"></div>姿勢保持訓練</li>
                <li className="flex items-center gap-2"><div className="w-1.5 h-1.5 bg-stone-300 rounded-full"></div>歩行訓練（すくみ足対策）</li>
                <li className="flex items-center gap-2"><div className="w-1.5 h-1.5 bg-stone-300 rounded-full"></div>関節可動域改善</li>
                <li className="flex items-center gap-2"><div className="w-1.5 h-1.5 bg-stone-300 rounded-full"></div>筋力低下予防</li>
                <li className="flex items-center gap-2"><div className="w-1.5 h-1.5 bg-stone-300 rounded-full"></div>日常生活動作（ADL）の向上</li>
              </ul>
            </div>

            {/* 酸素ルーム */}
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-stone-100">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-blue-50 rounded-lg flex items-center justify-center text-blue-600">
                  <Smile size={20} />
                </div>
                <h3 className="font-bold text-lg text-stone-800">酸素ルーム</h3>
              </div>
              <ul className="space-y-2 text-sm text-stone-600">
                <li className="flex items-center gap-2"><div className="w-1.5 h-1.5 bg-stone-300 rounded-full"></div>疲労回復</li>
                <li className="flex items-center gap-2"><div className="w-1.5 h-1.5 bg-stone-300 rounded-full"></div>自律神経の調整</li>
                <li className="flex items-center gap-2"><div className="w-1.5 h-1.5 bg-stone-300 rounded-full"></div>慢性症状の改善補助</li>
              </ul>
              <p className="text-xs text-stone-400 mt-2">※訪問施術と併用することで回復をサポート</p>
            </div>

            {/* コミュニケーションケア */}
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-stone-100">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-pink-50 rounded-lg flex items-center justify-center text-pink-600">
                  <MessageCircle size={20} />
                </div>
                <h3 className="font-bold text-lg text-stone-800">コミュニケーションケア</h3>
              </div>
              <ul className="space-y-2 text-sm text-stone-600">
                <li className="flex items-center gap-2"><div className="w-1.5 h-1.5 bg-stone-300 rounded-full"></div>精神的ケア</li>
                <li className="flex items-center gap-2"><div className="w-1.5 h-1.5 bg-stone-300 rounded-full"></div>意欲向上</li>
                <li className="flex items-center gap-2"><div className="w-1.5 h-1.5 bg-stone-300 rounded-full"></div>認知症予防</li>
              </ul>
            </div>
          </div>
        </section>

        {/* 3. 期待できる効果 */}
        <section className="bg-orange-50/50 rounded-3xl p-8 md:p-12 border border-orange-100">
          <div className="text-center mb-10">
            <h2 className="text-2xl md:text-3xl font-bold font-serif text-stone-800 mb-4">
              3. 期待できる効果
            </h2>
            <p className="text-stone-500 text-sm">※改善には個人差があります。</p>
          </div>
          
          <div className="max-w-2xl mx-auto">
            <ul className="grid sm:grid-cols-2 gap-4 mb-8">
              {[
                '筋固縮の軽減',
                '姿勢保持の安定',
                '歩行のスムーズさ向上',
                'すくみ足の軽減',
                '転倒リスクの低減',
                '疲れにくさの改善',
                '日常生活動作（ADL）の向上'
              ].map((item, i) => (
                <li key={i} className="flex items-center gap-3 bg-white p-3 rounded-xl shadow-sm border border-stone-100">
                  <CheckCircle2 size={18} className="text-emerald-500 shrink-0" />
                  <span className="text-stone-700 font-medium text-sm">{item}</span>
                </li>
              ))}
            </ul>
            
            <div className="text-center bg-white p-6 rounded-2xl border border-orange-200 shadow-sm">
              <p className="text-stone-800 font-bold text-lg leading-relaxed">
                「治す」ではなく、<br />
                <span className="text-orange-600 text-xl">“できることを維持し、生活の質（QOL）を高める”</span><br />
                ことを目的としたケアです。
              </p>
            </div>
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

        {/* 5. 施術の流れ */}
        <section>
          <div className="text-center mb-10">
            <h2 className="text-2xl md:text-3xl font-bold font-serif text-stone-800 mb-4">
              5. 施術の流れ（Flow）
            </h2>
          </div>
          
          <div className="max-w-3xl mx-auto">
            <div className="space-y-4 relative before:absolute before:inset-0 before:ml-6 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-stone-200 before:to-transparent">
              {[
                { title: 'お問い合わせ', desc: 'まずはお気軽にご相談ください。' },
                { title: '初回訪問・評価', desc: 'ご自宅・施設へ伺います。' },
                { title: '医師の同意書取得', desc: '当院がしっかりサポートいたします。' },
                { title: '施術プラン作成', desc: 'お身体の状態に合わせた計画を立てます。' },
                { title: '施術開始', desc: '週1〜3回のペースで訪問します。' },
                { title: '定期評価・報告', desc: 'ケアマネージャー様へも報告可能です。' },
              ].map((step, i) => (
                <div key={i} className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
                  <div className="flex items-center justify-center w-12 h-12 rounded-full border-4 border-white bg-orange-100 text-orange-600 font-bold shadow shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 z-10">
                    {i + 1}
                  </div>
                  <div className="w-[calc(100%-4rem)] md:w-[calc(50%-3rem)] bg-white p-4 rounded-xl shadow-sm border border-stone-100">
                    <h4 className="font-bold text-stone-800 mb-1">{step.title}</h4>
                    <p className="text-sm text-stone-600">{step.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* 6. よくある質問 */}
        <section>
          <div className="text-center mb-10">
            <h2 className="text-2xl md:text-3xl font-bold font-serif text-stone-800 mb-4">
              6. よくある質問（FAQ）
            </h2>
          </div>
          
          <div className="max-w-3xl mx-auto space-y-4">
            {[
              { q: 'パーキンソン病でも保険は使えますか？', a: 'はい。医師の同意書があれば1〜3割負担で利用できます。' },
              { q: 'どんな人が来てくれますか？', a: '国家資格（はり師・きゅう師・あん摩マッサージ指圧師）を持つ施術者です。' },
              { q: '施設にも来てもらえますか？', a: 'はい。グループホーム・特養・有料老人ホームなど訪問可能です。' },
              { q: '週に何回受けられますか？', a: '多くの方が週2〜3回のペースで利用されています。' }
            ].map((faq, i) => (
              <div key={i} className="bg-white p-6 rounded-2xl shadow-sm border border-stone-100">
                <div className="flex gap-4 mb-3">
                  <div className="w-6 h-6 rounded bg-orange-100 text-orange-600 font-bold flex items-center justify-center shrink-0">Q</div>
                  <h4 className="font-bold text-stone-800">{faq.q}</h4>
                </div>
                <div className="flex gap-4">
                  <div className="w-6 h-6 rounded bg-stone-100 text-stone-600 font-bold flex items-center justify-center shrink-0">A</div>
                  <p className="text-stone-600 text-sm leading-relaxed pt-0.5">{faq.a}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* 7. 訪問対応エリア */}
        <section className="bg-stone-100 rounded-3xl p-8 md:p-12 text-center">
          <div className="inline-flex items-center justify-center w-12 h-12 bg-white text-stone-600 rounded-full mb-4 shadow-sm">
            <MapPin size={24} />
          </div>
          <h2 className="text-2xl font-bold font-serif text-stone-800 mb-6">
            7. 訪問対応エリア（佐世保市全域）
          </h2>
          <p className="text-stone-600 leading-relaxed max-w-2xl mx-auto text-sm md:text-base">
            佐世保市中心部 / 広田 / 大塔 / 日宇 / 早岐 / 吉岡町 / 皆瀬町 / もみじが丘 /
            黒髪町 / 白岳町 / 大野町 / 相浦 / 中里 / 山手町 / 木風町 / 他市内全域
          </p>
        </section>

        {/* 8. 当院の専門性 */}
        <section>
          <div className="text-center mb-10">
            <h2 className="text-2xl md:text-3xl font-bold font-serif text-stone-800 mb-4">
              8. 当院の専門性
            </h2>
          </div>
          
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 max-w-4xl mx-auto">
            {[
              { icon: Stethoscope, text: '国家資格保持者が施術' },
              { icon: MapPin, text: '佐世保市で訪問施術の実績多数' },
              { icon: Users, text: '医師・ケアマネージャーとの連携体制' },
              { icon: ShieldCheck, text: '医療保険が使える安心の制度' },
              { icon: MessageCircle, text: 'ご家族・施設への報告も丁寧に実施' }
            ].map((item, i) => (
              <div key={i} className="bg-white p-4 rounded-xl shadow-sm border border-stone-100 flex items-center gap-3">
                <div className="text-emerald-600 bg-emerald-50 p-2 rounded-lg shrink-0">
                  <item.icon size={20} />
                </div>
                <span className="font-bold text-stone-700 text-sm">{item.text}</span>
              </div>
            ))}
          </div>
        </section>

        {/* 9. 予約導線 & 最後に */}
        <section className="bg-orange-600 rounded-3xl p-8 md:p-12 text-center text-white shadow-lg relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
          <div className="relative z-10">
            <h2 className="text-2xl md:text-3xl font-bold font-serif mb-6">
              パーキンソン病のことでお困りの方は、<br className="hidden md:block" />
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

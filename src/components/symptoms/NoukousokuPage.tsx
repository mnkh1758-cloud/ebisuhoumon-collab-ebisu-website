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
  Clock,
  Phone
} from 'lucide-react';
import { Link } from 'react-router-dom';

export const NoukousokuPage: React.FC = () => {
  useEffect(() => {
    window.scrollTo(0, 0);
    
    // SEO Settings
    document.title = "脳梗塞後遺症でお困りの方へ｜佐世保市の訪問鍼灸マッサージ";
    const metaDescription = document.querySelector('meta[name="description"]');
    if (metaDescription) {
      metaDescription.setAttribute("content", "佐世保市で脳梗塞後遺症による手足のこわばり、関節拘縮、むくみ等にお悩みならえびす鍼灸整骨院の訪問マッサージへ。医療保険適用でご自宅・施設へ伺い、リハビリや鍼灸治療を行います。");
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
              【脳梗塞後遺症】で<br className="md:hidden" />お困りの方へ
            </h1>
            <p className="text-lg md:text-xl text-stone-600 mb-10 leading-relaxed font-medium">
              ご自宅・施設へ訪問し、<span className="text-orange-600 font-bold border-b-2 border-orange-200">医療保険を使って受けられる在宅ケア</span>です。
            </p>
            
            <div className="bg-white/80 backdrop-blur-sm p-6 md:p-8 rounded-3xl shadow-sm border border-stone-100 text-left max-w-2xl mx-auto">
              <p className="text-stone-700 mb-4 font-bold">脳梗塞・脳出血の後遺症による</p>
              <ul className="grid grid-cols-2 gap-3 mb-6">
                {['手足の麻痺・動かしにくさ', '関節が固まって痛い（拘縮）', '筋肉が突っ張る（痙縮）', '歩行が不安定で転びやすい', 'むくみや冷えがひどい', 'リハビリの機会が減って不安'].map((item, i) => (
                  <li key={i} className="flex items-center gap-2 text-stone-600 text-sm md:text-base">
                    <CheckCircle2 size={18} className="text-orange-500 shrink-0" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
              <p className="text-stone-700 text-sm md:text-base leading-relaxed">
                などでお悩みの方に、国家資格者がご自宅で施術を行います。<br/>
                <span className="font-bold text-orange-600">「機能の維持・改善と、日常生活動作（ADL）の向上」</span> のためのサポートを行います。
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
              1. 脳梗塞後遺症の特徴とよくある悩み
            </h2>
            <p className="text-stone-600">脳梗塞後は、麻痺や筋緊張の亢進により、以下のような症状が起こりやすくなります。</p>
          </div>
          
          <div className="bg-white rounded-3xl p-8 shadow-sm border border-stone-100">
            <div className="grid md:grid-cols-2 gap-6">
              {[
                '麻痺側の手足が重く、動かしにくい',
                '筋肉が突っ張って（痙縮）、着替えが大変',
                '関節が固まってきて（拘縮）、痛みを伴う',
                '麻痺側の手足がむくみやすく、冷えている',
                'バランスが取りづらく、歩くのが怖い',
                '退院後、リハビリの量が減って機能低下が心配'
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
                ご本人だけでなく、ご家族の負担も大きくなりやすい症状です。
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
            <p className="text-stone-600">脳梗塞後遺症に対して、当院では以下の施術を組み合わせて行います。</p>
          </div>

          <div className="grid sm:grid-cols-2 gap-6">
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-stone-100">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-orange-50 rounded-lg flex items-center justify-center text-orange-600">
                  <HeartHandshake size={20} />
                </div>
                <h3 className="font-bold text-lg text-stone-800">マッサージ・指圧</h3>
              </div>
              <ul className="space-y-2 text-sm text-stone-600">
                <li className="flex items-center gap-2"><div className="w-1.5 h-1.5 bg-stone-300 rounded-full"></div>麻痺側の筋肉の突っ張り（痙縮）を和らげる</li>
                <li className="flex items-center gap-2"><div className="w-1.5 h-1.5 bg-stone-300 rounded-full"></div>健側（麻痺のない側）の疲労やコリをほぐす</li>
                <li className="flex items-center gap-2"><div className="w-1.5 h-1.5 bg-stone-300 rounded-full"></div>血流・リンパの循環を促し、むくみや冷えを改善</li>
              </ul>
            </div>
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-stone-100">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-emerald-50 rounded-lg flex items-center justify-center text-emerald-600">
                  <PersonStanding size={20} />
                </div>
                <h3 className="font-bold text-lg text-stone-800">リハビリ・関節可動域訓練</h3>
              </div>
              <ul className="space-y-2 text-sm text-stone-600">
                <li className="flex items-center gap-2"><div className="w-1.5 h-1.5 bg-stone-300 rounded-full"></div>関節が固まる（拘縮）のを防ぐための運動</li>
                <li className="flex items-center gap-2"><div className="w-1.5 h-1.5 bg-stone-300 rounded-full"></div>残存機能（動かせる筋肉）の維持・強化</li>
                <li className="flex items-center gap-2"><div className="w-1.5 h-1.5 bg-stone-300 rounded-full"></div>寝返り、起き上がり、歩行などの基本動作訓練</li>
              </ul>
            </div>
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-stone-100">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-blue-50 rounded-lg flex items-center justify-center text-blue-600">
                  <Sparkles size={20} />
                </div>
                <h3 className="font-bold text-lg text-stone-800">鍼灸治療（神経・筋肉へのアプローチ）</h3>
              </div>
              <ul className="space-y-2 text-sm text-stone-600">
                <li className="flex items-center gap-2"><div className="w-1.5 h-1.5 bg-stone-300 rounded-full"></div>麻痺側の神経や筋肉に刺激を与え、働きを促す</li>
                <li className="flex items-center gap-2"><div className="w-1.5 h-1.5 bg-stone-300 rounded-full"></div>関節の痛みや、しびれの緩和</li>
                <li className="flex items-center gap-2"><div className="w-1.5 h-1.5 bg-stone-300 rounded-full"></div>自律神経を整え、体調を管理する</li>
              </ul>
            </div>
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-stone-100">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-orange-50 rounded-lg flex items-center justify-center text-orange-600">
                  <Zap size={20} />
                </div>
                <h3 className="font-bold text-lg text-stone-800">物理療法（ハイボルト・超音波など）</h3>
              </div>
              <ul className="space-y-2 text-sm text-stone-600">
                <li className="flex items-center gap-2"><div className="w-1.5 h-1.5 bg-stone-300 rounded-full"></div>深部の筋肉の緊張を緩める</li>
                <li className="flex items-center gap-2"><div className="w-1.5 h-1.5 bg-stone-300 rounded-full"></div>痛みのブロックと血流改善</li>
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
                '関節の可動域が広がり、着替えなどが楽になる',
                '筋肉の突っ張りが和らぎ、動きやすくなる',
                '健側の疲労が取れ、全身のバランスが整う',
                'むくみや冷えが改善し、手足が軽く感じる',
                '定期的なリハビリで、機能低下の不安がなくなる',
                'ご家族の介護負担が軽減される'
              ].map((item, i) => (
                <li key={i} className="flex items-center gap-3 bg-white p-3 rounded-xl shadow-sm border border-stone-100">
                  <CheckCircle2 size={18} className="text-emerald-500 shrink-0" />
                  <span className="text-stone-700 font-medium text-sm">{item}</span>
                </li>
              ))}
            </ul>
            
            <div className="text-center bg-white p-6 rounded-2xl border border-orange-200 shadow-sm">
              <p className="text-stone-800 font-bold text-lg leading-relaxed">
                「完全に治す」ではなく、<br />
                <span className="text-orange-600 text-xl">“できることを増やす・維持する”</span><br />
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
            
            <div className="grid sm:grid-cols-3 gap-4 mb-8">
              <div className="bg-stone-50 p-6 rounded-xl border border-stone-100">
                <p className="text-sm text-stone-500 mb-2">1割負担の方</p>
                <p className="text-xl font-bold text-stone-800">400<span className="text-sm font-normal">円〜</span>500<span className="text-sm font-normal">円程度</span></p>
                <p className="text-xs text-stone-400 mt-1">1回あたり</p>
              </div>
              <div className="bg-stone-50 p-6 rounded-xl border border-stone-100">
                <p className="text-sm text-stone-500 mb-2">2割負担の方</p>
                <p className="text-xl font-bold text-stone-800">800<span className="text-sm font-normal">円〜</span>1,000<span className="text-sm font-normal">円程度</span></p>
                <p className="text-xs text-stone-400 mt-1">1回あたり</p>
              </div>
              <div className="bg-stone-50 p-6 rounded-xl border border-stone-100">
                <p className="text-sm text-stone-500 mb-2">3割負担の方</p>
                <p className="text-xl font-bold text-stone-800">1,200<span className="text-sm font-normal">円〜</span>1,500<span className="text-sm font-normal">円程度</span></p>
                <p className="text-xs text-stone-400 mt-1">1回あたり</p>
              </div>
            </div>
            <p className="text-xs text-stone-500 mb-8">※距離・施術内容により変動します。</p>
            
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
              { q: '脳梗塞後遺症でも保険は使えますか？', a: 'はい。医師の同意書があれば1〜3割負担で利用できます。' },
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
              脳梗塞後遺症のことでお困りの方は、<br className="hidden md:block" />
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

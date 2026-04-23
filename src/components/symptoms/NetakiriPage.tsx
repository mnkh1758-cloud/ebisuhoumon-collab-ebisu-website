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
  Phone,
  Wind,
  Waves
} from 'lucide-react';
import { Link } from 'react-router-dom';

export const NetakiriPage: React.FC = () => {
  useEffect(() => {
    window.scrollTo(0, 0);
    
    // SEO Settings
    document.title = "寝たきり・廃用症候群でお困りの方へ｜佐世保市の訪問鍼灸マッサージ";
    const metaDescription = document.querySelector('meta[name="description"]');
    if (metaDescription) {
      metaDescription.setAttribute("content", "佐世保市で寝たきり・廃用症候群による筋力低下や関節拘縮にお悩みならえびす鍼灸整骨院の訪問マッサージへ。医療保険適用でご自宅・施設へ伺い、筋力維持・関節可動域改善・むくみ軽減を目指します。");
    }
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
              【寝たきり・廃用症候群】で<br className="md:hidden" />お困りの方へ
            </h1>
            <p className="text-lg md:text-xl text-stone-600 mb-10 leading-relaxed font-medium">
              ご自宅・施設へ訪問し、<span className="text-orange-600 font-bold border-b-2 border-orange-200">医療保険を使って受けられる在宅ケア</span>です。
            </p>
            
            <div className="bg-white/80 backdrop-blur-sm p-6 md:p-8 rounded-3xl shadow-sm border border-stone-100 text-left max-w-2xl mx-auto">
              <p className="text-stone-700 mb-4 font-bold">寝たきり・廃用症候群は、</p>
              <ul className="grid sm:grid-cols-2 gap-3 mb-6">
                {['長期間の安静', '病気や手術後の体力低下', '関節拘縮', '筋力低下', 'むくみ', '認知機能の低下', '介助量の増加'].map((item, i) => (
                  <li key={i} className="flex items-center gap-2 text-stone-600 text-sm md:text-base">
                    <CheckCircle2 size={18} className="text-orange-500 shrink-0" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
              <p className="text-stone-700 text-sm md:text-base leading-relaxed">
                などが複合的に進行する状態です。<br/>
                当院では、国家資格者がご自宅で<br/>
                <span className="font-bold text-orange-600">筋力維持・関節可動域改善・むくみ軽減・生活動作の向上</span> を目的とした施術を行います。
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-6 py-16 md:py-24 max-w-4xl space-y-24">
        <section>
          <div className="text-center mb-10">
            <h2 className="text-2xl md:text-3xl font-bold font-serif text-stone-800 mb-4">
              1. 寝たきり・廃用症候群の特徴とよくある悩み
            </h2>
            <p className="text-stone-600">長期間の不動により、身体機能が急速に低下します。</p>
          </div>
          <div className="bg-white rounded-3xl p-8 shadow-sm border border-stone-100">
            <p className="font-bold text-stone-800 mb-6 text-center">よくあるお悩み：</p>
            <div className="grid md:grid-cols-2 gap-6">
              {[
                '関節が固まって動かない',
                '体を起こすとめまいがする',
                '足の筋力が弱り、立てない',
                'むくみがひどい',
                '食欲が落ちてきた',
                '認知機能が低下してきた',
                '介助の負担が増えてきた'
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
                放置するとさらに機能が低下し、回復が難しくなる悪循環に陥ります。
              </p>
            </div>
          </div>
        </section>

        <section>
          <div className="text-center mb-10">
            <h2 className="text-2xl md:text-3xl font-bold font-serif text-stone-800 mb-4">
              2. えびす鍼灸整骨院の訪問ケアでできること
            </h2>
            <p className="text-stone-600">寝たきり・廃用症候群に対して、当院では以下の施術を組み合わせて行います。</p>
          </div>
          <div className="grid sm:grid-cols-2 gap-6">
            {/* マッサージ・指圧 */}
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-stone-100">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-orange-50 rounded-lg flex items-center justify-center text-orange-600">
                  <HeartHandshake size={20} />
                </div>
                <h3 className="font-bold text-lg text-stone-800">マッサージ・指圧</h3>
              </div>
              <ul className="space-y-2 text-sm text-stone-600">
                <li className="flex items-center gap-2"><div className="w-1.5 h-1.5 bg-stone-300 rounded-full"></div>全身の血流改善</li>
                <li className="flex items-center gap-2"><div className="w-1.5 h-1.5 bg-stone-300 rounded-full"></div>むくみの軽減</li>
                <li className="flex items-center gap-2"><div className="w-1.5 h-1.5 bg-stone-300 rounded-full"></div>筋緊張の緩和</li>
                <li className="flex items-center gap-2"><div className="w-1.5 h-1.5 bg-stone-300 rounded-full"></div>床ずれ（褥瘡）の予防</li>
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
                <li className="flex items-center gap-2"><div className="w-1.5 h-1.5 bg-stone-300 rounded-full"></div>関節可動域訓練（ROM）</li>
                <li className="flex items-center gap-2"><div className="w-1.5 h-1.5 bg-stone-300 rounded-full"></div>筋力維持・強化訓練</li>
                <li className="flex items-center gap-2"><div className="w-1.5 h-1.5 bg-stone-300 rounded-full"></div>寝返り・起き上がり訓練</li>
                <li className="flex items-center gap-2"><div className="w-1.5 h-1.5 bg-stone-300 rounded-full"></div>座位・立位保持訓練</li>
              </ul>
            </div>

            {/* 鍼灸 */}
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-stone-100">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-orange-50 rounded-lg flex items-center justify-center text-orange-600">
                  <Sparkles size={20} />
                </div>
                <h3 className="font-bold text-lg text-stone-800">鍼灸</h3>
              </div>
              <ul className="space-y-2 text-sm text-stone-600">
                <li className="flex items-center gap-2"><div className="w-1.5 h-1.5 bg-stone-300 rounded-full"></div>自律神経の調整</li>
                <li className="flex items-center gap-2"><div className="w-1.5 h-1.5 bg-stone-300 rounded-full"></div>内臓機能の活性化（便秘・食欲不振の改善）</li>
                <li className="flex items-center gap-2"><div className="w-1.5 h-1.5 bg-stone-300 rounded-full"></div>痛みの緩和</li>
              </ul>
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
                <li className="flex items-center gap-2"><div className="w-1.5 h-1.5 bg-stone-300 rounded-full"></div>精神的ケア・意欲の向上</li>
                <li className="flex items-center gap-2"><div className="w-1.5 h-1.5 bg-stone-300 rounded-full"></div>認知機能低下の予防</li>
                <li className="flex items-center gap-2"><div className="w-1.5 h-1.5 bg-stone-300 rounded-full"></div>ご家族の介護相談・サポート</li>
              </ul>
            </div>
          </div>
        </section>

        <section className="bg-orange-50/50 rounded-3xl p-8 md:p-12 border border-orange-100">
          <div className="text-center mb-10">
            <h2 className="text-2xl md:text-3xl font-bold font-serif text-stone-800 mb-4">
              3. 期待できる効果<span className="text-lg md:text-xl font-normal text-stone-600 ml-2">（誠実な医学的表現）</span>
            </h2>
            <p className="text-stone-500 text-sm">※改善には個人差があります。</p>
          </div>
          <div className="max-w-2xl mx-auto">
            <ul className="grid sm:grid-cols-2 gap-4 mb-8">
              {[
                '関節可動域の維持・改善',
                '筋力の維持・向上',
                'むくみ・床ずれの予防',
                '便秘・不眠の改善',
                '生活意欲の向上',
                '介護負担の軽減'
              ].map((item, i) => (
                <li key={i} className="flex items-center gap-3 bg-white p-3 rounded-xl shadow-sm border border-stone-100">
                  <CheckCircle2 size={18} className="text-emerald-500 shrink-0" />
                  <span className="text-stone-700 font-medium text-sm">{item}</span>
                </li>
              ))}
            </ul>
            
            <div className="text-center bg-white p-6 rounded-2xl border border-orange-200 shadow-sm">
              <p className="text-stone-800 font-bold text-lg leading-relaxed">
                「完全に治す」のではなく、<br />
                <span className="text-orange-600 text-xl">“今の機能を維持し、少しでも生活を楽にする”</span><br />
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
              { q: '寝たきりでも保険は使えますか？', a: 'はい。医師の同意書があれば1〜3割負担で利用できます。' },
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
              寝たきり・廃用症候群のことでお困りの方は、<br className="hidden md:block" />
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

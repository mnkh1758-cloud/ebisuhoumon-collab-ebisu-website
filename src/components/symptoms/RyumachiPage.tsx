import React, { useEffect } from 'react';
import { 
  HeartHandshake, 
  Activity, 
  CheckCircle2, 
  ShieldCheck, 
  Zap, 
  Sparkles, 
  PersonStanding,
  ChevronRight,
  Phone,
  HelpCircle,
  MapPin,
  Wind,
  MessageCircle
} from 'lucide-react';
import { Link } from 'react-router-dom';

export const RyumachiPage: React.FC = () => {
  useEffect(() => {
    window.scrollTo(0, 0);
    document.title = "リウマチでお困りの方へ｜佐世保市の訪問鍼灸マッサージ";
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
              【リウマチ】で<br className="md:hidden" />お困りの方へ
            </h1>
            <p className="text-lg md:text-xl text-stone-600 mb-10 leading-relaxed font-medium">
              ご自宅・施設へ訪問し、<span className="text-orange-600 font-bold border-b-2 border-orange-200">医療保険を使って受けられる在宅ケア</span>です。
            </p>
            
            <div className="bg-white/80 backdrop-blur-sm p-6 md:p-8 rounded-3xl shadow-sm border border-stone-100 text-left max-w-2xl mx-auto">
              <p className="text-stone-700 mb-4 font-bold">リウマチは、</p>
              <ul className="grid grid-cols-2 gap-3 mb-6">
                {['関節の腫れ・痛み', '朝のこわばり', '手足の変形', '動作のしにくさ', '疲れやすさ', '生活動作の低下'].map((item, i) => (
                  <li key={i} className="flex items-center gap-2 text-stone-600 text-sm md:text-base">
                    <CheckCircle2 size={18} className="text-orange-500 shrink-0" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
              <p className="text-stone-700 text-sm md:text-base leading-relaxed">
                などが続き、日常生活に大きな負担を与える疾患です。<br/>
                当院では、国家資格者がご自宅に伺い、痛みの緩和と動作の改善をサポートします。
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-6 py-16 md:py-24 max-w-4xl space-y-24">
        {/* 1. リウマチの特徴とよくある悩み */}
        <section>
          <div className="text-center mb-10">
            <h2 className="text-2xl md:text-3xl font-bold font-serif text-stone-800 mb-4">
              1. リウマチの特徴とよくある悩み
            </h2>
          </div>
          <div className="bg-white rounded-3xl p-8 shadow-sm border border-stone-100">
            <p className="font-bold text-stone-800 mb-6 text-center">よくあるお悩み：</p>
            <div className="grid md:grid-cols-2 gap-6">
              {[
                '朝起きると手足がこわばる',
                '指が痛くて家事ができない',
                '歩くと膝や足首が痛む',
                '関節が腫れて熱を持つ',
                '痛み止めだけでは不安',
                '通院が難しい'
              ].map((item, i) => (
                <div key={i} className="flex items-start gap-3">
                  <div className="bg-orange-50 p-1.5 rounded-full text-orange-600 mt-0.5 shrink-0">
                    <Activity size={16} />
                  </div>
                  <span className="text-stone-700 font-medium">{item}</span>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* 2. 当院でできる施術・改善アプローチ */}
        <section>
          <div className="text-center mb-10">
            <h2 className="text-2xl md:text-3xl font-bold font-serif text-stone-800 mb-4">
              2. 当院でできる施術・改善アプローチ
            </h2>
          </div>
          <div className="grid sm:grid-cols-2 gap-6">
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-stone-100">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-orange-50 rounded-lg flex items-center justify-center text-orange-600">
                  <Sparkles size={20} />
                </div>
                <h3 className="font-bold text-lg text-stone-800">鍼灸</h3>
              </div>
              <ul className="space-y-2 text-sm text-stone-600">
                <li className="flex items-center gap-2"><div className="w-1.5 h-1.5 bg-stone-300 rounded-full"></div>関節痛の緩和</li>
                <li className="flex items-center gap-2"><div className="w-1.5 h-1.5 bg-stone-300 rounded-full"></div>血流改善</li>
                <li className="flex items-center gap-2"><div className="w-1.5 h-1.5 bg-stone-300 rounded-full"></div>自律神経の調整</li>
              </ul>
            </div>
            
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-stone-100">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-blue-50 rounded-lg flex items-center justify-center text-blue-600">
                  <Zap size={20} />
                </div>
                <h3 className="font-bold text-lg text-stone-800">ハイボルト電気治療</h3>
              </div>
              <ul className="space-y-2 text-sm text-stone-600">
                <li className="flex items-center gap-2"><div className="w-1.5 h-1.5 bg-stone-300 rounded-full"></div>深部の炎症にアプローチ</li>
                <li className="flex items-center gap-2"><div className="w-1.5 h-1.5 bg-stone-300 rounded-full"></div>動作時の痛みを軽減</li>
              </ul>
            </div>

            <div className="bg-white rounded-2xl p-6 shadow-sm border border-stone-100">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-emerald-50 rounded-lg flex items-center justify-center text-emerald-600">
                  <Activity size={20} />
                </div>
                <h3 className="font-bold text-lg text-stone-800">メディセル（筋膜リリース）</h3>
              </div>
              <ul className="space-y-2 text-sm text-stone-600">
                <li className="flex items-center gap-2"><div className="w-1.5 h-1.5 bg-stone-300 rounded-full"></div>関節周囲の癒着改善</li>
                <li className="flex items-center gap-2"><div className="w-1.5 h-1.5 bg-stone-300 rounded-full"></div>むくみ軽減</li>
                <li className="flex items-center gap-2"><div className="w-1.5 h-1.5 bg-stone-300 rounded-full"></div>動作の滑らかさ向上</li>
              </ul>
            </div>

            <div className="bg-white rounded-2xl p-6 shadow-sm border border-stone-100">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-purple-50 rounded-lg flex items-center justify-center text-purple-600">
                  <Zap size={20} />
                </div>
                <h3 className="font-bold text-lg text-stone-800">超音波治療</h3>
              </div>
              <ul className="space-y-2 text-sm text-stone-600">
                <li className="flex items-center gap-2"><div className="w-1.5 h-1.5 bg-stone-300 rounded-full"></div>深部組織の回復促進</li>
                <li className="flex items-center gap-2"><div className="w-1.5 h-1.5 bg-stone-300 rounded-full"></div>慢性痛の緩和</li>
              </ul>
            </div>

            <div className="bg-white rounded-2xl p-6 shadow-sm border border-stone-100">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-rose-50 rounded-lg flex items-center justify-center text-rose-600">
                  <HeartHandshake size={20} />
                </div>
                <h3 className="font-bold text-lg text-stone-800">マッサージ・指圧</h3>
              </div>
              <ul className="space-y-2 text-sm text-stone-600">
                <li className="flex items-center gap-2"><div className="w-1.5 h-1.5 bg-stone-300 rounded-full"></div>血流改善</li>
                <li className="flex items-center gap-2"><div className="w-1.5 h-1.5 bg-stone-300 rounded-full"></div>筋緊張の緩和</li>
              </ul>
            </div>

            <div className="bg-white rounded-2xl p-6 shadow-sm border border-stone-100">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-teal-50 rounded-lg flex items-center justify-center text-teal-600">
                  <PersonStanding size={20} />
                </div>
                <h3 className="font-bold text-lg text-stone-800">リハビリ・機能訓練</h3>
              </div>
              <ul className="space-y-2 text-sm text-stone-600">
                <li className="flex items-center gap-2"><div className="w-1.5 h-1.5 bg-stone-300 rounded-full"></div>関節可動域改善</li>
                <li className="flex items-center gap-2"><div className="w-1.5 h-1.5 bg-stone-300 rounded-full"></div>筋力低下予防</li>
                <li className="flex items-center gap-2"><div className="w-1.5 h-1.5 bg-stone-300 rounded-full"></div>日常生活動作の向上</li>
              </ul>
            </div>

            <div className="bg-white rounded-2xl p-6 shadow-sm border border-stone-100 sm:col-span-2">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-sky-50 rounded-lg flex items-center justify-center text-sky-600">
                  <Wind size={20} />
                </div>
                <h3 className="font-bold text-lg text-stone-800">酸素ルーム</h3>
              </div>
              <ul className="space-y-2 text-sm text-stone-600 grid sm:grid-cols-2">
                <li className="flex items-center gap-2"><div className="w-1.5 h-1.5 bg-stone-300 rounded-full"></div>疲労回復</li>
                <li className="flex items-center gap-2"><div className="w-1.5 h-1.5 bg-stone-300 rounded-full"></div>自律神経の調整</li>
              </ul>
            </div>
          </div>
        </section>

        {/* 3. 期待できる効果 */}
        <section className="bg-orange-50/50 rounded-3xl p-8 md:p-12 border border-orange-100">
          <div className="text-center mb-10">
            <h2 className="text-2xl md:text-3xl font-bold font-serif text-stone-800 mb-4">
              3. 期待できる効果<span className="text-lg font-normal text-stone-500 ml-2">（個人差あり）</span>
            </h2>
          </div>
          <div className="max-w-2xl mx-auto">
            <ul className="grid sm:grid-cols-2 gap-4">
              {[
                '関節痛の軽減',
                '朝のこわばりの緩和',
                'むくみの軽減',
                '動作の改善',
                '日常生活動作（ADL）の向上'
              ].map((item, i) => (
                <li key={i} className="flex items-center gap-3 bg-white p-4 rounded-xl shadow-sm border border-stone-100">
                  <CheckCircle2 size={20} className="text-emerald-500 shrink-0" />
                  <span className="text-stone-700 font-bold">{item}</span>
                </li>
              ))}
            </ul>
          </div>
        </section>

        {/* 4. 料金（医療保険適用） */}
        <section>
          <div className="text-center mb-10">
            <h2 className="text-2xl md:text-3xl font-bold font-serif text-stone-800 mb-4">
              4. 料金（医療保険適用）
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
              5. 施術の流れ
            </h2>
          </div>
          
          <div className="max-w-3xl mx-auto">
            <div className="space-y-4 relative before:absolute before:inset-0 before:ml-6 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-stone-200 before:to-transparent">
              {[
                { title: 'お問い合わせ', desc: 'まずはお気軽にご相談ください。' },
                { title: '初回訪問・評価', desc: 'ご自宅・施設へ伺います。' },
                { title: '同意書取得', desc: 'かかりつけ医に同意書を依頼します。' },
                { title: '施術プラン作成', desc: 'お一人おひとりに合わせた計画を立てます。' },
                { title: '施術開始', desc: '定期的な訪問ケアをスタートします。' },
                { title: '定期評価・報告', desc: '経過を確認し、ご家族やケアマネジャー様へ報告します。' },
              ].map((step, index) => (
                <div key={index} className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
                  <div className="flex items-center justify-center w-12 h-12 rounded-full border-4 border-white bg-orange-100 text-orange-600 font-bold shadow shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 z-10">
                    {index + 1}
                  </div>
                  <div className="w-[calc(100%-4rem)] md:w-[calc(50%-3rem)] p-4 rounded-2xl bg-white shadow-sm border border-stone-100">
                    <h3 className="font-bold text-stone-800 mb-1">{step.title}</h3>
                    <p className="text-sm text-stone-600">{step.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* 6. FAQ */}
        <section className="bg-white rounded-3xl p-8 md:p-12 shadow-sm border border-stone-100">
          <div className="text-center mb-10">
            <h2 className="text-2xl md:text-3xl font-bold font-serif text-stone-800 mb-4">
              6. FAQ（よくあるご質問）
            </h2>
          </div>
          <div className="max-w-3xl mx-auto space-y-6">
            <div className="flex gap-4">
              <div className="w-8 h-8 rounded-full bg-orange-100 text-orange-600 flex items-center justify-center font-bold shrink-0">Q</div>
              <div>
                <p className="font-bold text-stone-800 mb-2">保険は使えますか？</p>
                <div className="flex gap-3">
                  <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-bold shrink-0">A</div>
                  <p className="text-stone-600">はい、1〜3割負担です。</p>
                </div>
              </div>
            </div>
            <div className="w-full h-px bg-stone-100"></div>
            <div className="flex gap-4">
              <div className="w-8 h-8 rounded-full bg-orange-100 text-orange-600 flex items-center justify-center font-bold shrink-0">Q</div>
              <div>
                <p className="font-bold text-stone-800 mb-2">施設にも来ますか？</p>
                <div className="flex gap-3">
                  <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-bold shrink-0">A</div>
                  <p className="text-stone-600">はい、訪問可能です。</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* 7. 訪問エリア */}
        <section>
          <div className="text-center mb-10">
            <h2 className="text-2xl md:text-3xl font-bold font-serif text-stone-800 mb-4">
              7. 訪問エリア
            </h2>
          </div>
          <div className="bg-white rounded-3xl p-8 shadow-sm border border-stone-100 text-center max-w-2xl mx-auto">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-orange-50 text-orange-600 rounded-full mb-6">
              <MapPin size={32} />
            </div>
            <h3 className="text-xl font-bold text-stone-800 mb-4">佐世保市全域</h3>
            <p className="text-stone-600">
              中心部 ／ 広田 ／ 大塔 ／ 日宇 ／ 早岐 ／ 他
            </p>
          </div>
        </section>

        {/* 予約導線 & 最後に */}
        <section className="bg-orange-600 rounded-3xl p-8 md:p-12 text-center text-white shadow-lg relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
          <div className="relative z-10">
            <h2 className="text-2xl md:text-3xl font-bold font-serif mb-6">
              リウマチでお困りの方は、<br className="hidden md:block" />
              まずはお気軽にご相談ください。
            </h2>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center mt-10">
              <a href="tel:08025105242" className="inline-flex items-center justify-center gap-2 bg-white text-orange-600 px-8 py-4 rounded-full font-bold hover:bg-orange-50 transition-colors shadow-sm">
                <Phone size={20} />
                <span>080-2510-5242</span>
              </a>
              <a href="https://lin.ee/1234567" target="_blank" rel="noopener noreferrer" className="inline-flex items-center justify-center gap-2 bg-[#06C755] text-white px-8 py-4 rounded-full font-bold hover:bg-[#05b34c] transition-colors shadow-sm">
                <MessageCircle size={20} />
                <span>LINEで相談する</span>
              </a>
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


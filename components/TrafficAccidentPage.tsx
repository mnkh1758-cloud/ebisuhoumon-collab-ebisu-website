import React, { useEffect } from 'react';
import { 
  CheckCircle2, 
  ShieldCheck, 
  ChevronRight,
  Phone,
  MapPin,
  AlertTriangle,
  Stethoscope,
  Activity,
  Zap,
  Wind,
  Waves,
  HeartHandshake,
  Brain,
  MessageCircle,
  FileText,
  Clock,
  HelpCircle,
  Store,
  Laptop
} from 'lucide-react';
import { Link } from 'react-router-dom';

export const TrafficAccidentPage: React.FC = () => {
  useEffect(() => {
    window.scrollTo(0, 0);
    document.title = "【交通事故治療専門】むちうち・頭痛・めまい・腰痛・しびれ｜えびす鍼灸整骨院";
    const metaDescription = document.querySelector('meta[name="description"]');
    if (metaDescription) {
      metaDescription.setAttribute("content", "佐世保市のえびす鍼灸整骨院は交通事故治療専門。むちうち、頭痛、めまい、腰痛、しびれなど、自賠責保険で窓口負担0円。早期回復・後遺症予防を徹底サポートします。");
    }
  }, []);

  return (
    <main className="bg-stone-50 min-h-screen pt-20">
      {/* Hero Section */}
      <div className="relative bg-white border-b border-stone-200 overflow-hidden">
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-red-50 rounded-full blur-3xl opacity-50 -translate-y-1/2 translate-x-1/3"></div>
        <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-emerald-50 rounded-full blur-3xl opacity-50 translate-y-1/3 -translate-x-1/3"></div>
        
        <div className="container mx-auto px-6 py-16 md:py-24 relative z-10">
          <div className="max-w-4xl mx-auto text-center">
            <span className="inline-block py-1 px-3 rounded-full bg-red-100 text-red-700 text-sm font-bold tracking-widest mb-6">
              交通事故治療専門
            </span>
            <h1 className="text-3xl md:text-5xl font-bold font-serif text-stone-800 mb-6 leading-tight">
              むちうち・頭痛・めまい<br className="md:hidden" />腰痛・しびれ
            </h1>
            <p className="text-lg text-stone-600 mb-10 leading-relaxed font-medium">
              佐世保市のえびす鍼灸整骨院
            </p>
            
            <div className="bg-white/80 backdrop-blur-sm p-8 rounded-3xl shadow-sm border border-stone-100 text-left max-w-2xl mx-auto">
              <h2 className="text-xl font-bold text-stone-800 mb-4 text-center border-b border-stone-200 pb-4">
                交通事故後の痛み・不調でお困りではありませんか？
              </h2>
              <p className="text-stone-600 mb-6 text-center">
                レントゲンで「異常なし」と言われても、実際には…
              </p>
              <ul className="grid grid-cols-2 gap-4 mb-6">
                {[
                  '首の痛み（むちうち）', 
                  '頭痛・めまい', 
                  '腰痛', 
                  '手足のしびれ',
                  '倦怠感',
                  '集中力低下',
                  '天候で悪化する痛み'
                ].map((item, i) => (
                  <li key={i} className="flex items-center gap-2 text-stone-700 font-medium">
                    <AlertTriangle size={18} className="text-orange-500 shrink-0" />
                    <span className="text-sm md:text-base">{item}</span>
                  </li>
                ))}
              </ul>
              <p className="text-stone-700 text-center font-bold bg-red-50 p-4 rounded-xl">
                などの症状が長く続くことがあります。<br />
                えびす鍼灸整骨院では、交通事故専門の施術で<br />
                <span className="text-red-600 text-lg">早期回復・後遺症予防</span> を徹底サポートします。
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-6 py-16 md:py-24 max-w-4xl space-y-24">
        
        {/* 1. 当院の交通事故治療が選ばれる理由 */}
        <section>
          <div className="text-center mb-10">
            <span className="text-red-600 font-bold text-xl block mb-2">1</span>
            <h2 className="text-2xl md:text-3xl font-bold font-serif text-stone-800">
              当院の交通事故治療が選ばれる理由
            </h2>
          </div>
          
          <div className="grid sm:grid-cols-2 gap-6">
            {[
              {
                title: "国家資格者による専門施術",
                desc: "筋肉・靭帯・神経・自律神経まで総合的にアプローチ。",
                icon: <Stethoscope size={24} />
              },
              {
                title: "病院との併用OK",
                desc: "整形外科での検査＋当院での施術が最も効果的。",
                icon: <HeartHandshake size={24} />
              },
              {
                title: "他院からの転院OK",
                desc: "「良くならない」「説明が不十分」などの理由でも問題ありません。",
                icon: <Activity size={24} />
              },
              {
                title: "自賠責保険で窓口負担0円",
                desc: "施術費は0円。交通費・休業補償も対象。",
                icon: <ShieldCheck size={24} />
              },
              {
                title: "予約が取りやすい",
                desc: "店頭では枠だけ確保 → 後から名前追加が可能。オンライン予約も対応。",
                icon: <Clock size={24} />
              }
            ].map((item, i) => (
              <div key={i} className="bg-white rounded-2xl p-6 shadow-sm border border-stone-100">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 bg-red-50 text-red-600 rounded-lg flex items-center justify-center shrink-0">
                    {item.icon}
                  </div>
                  <h3 className="font-bold text-lg text-stone-800">{item.title}</h3>
                </div>
                <p className="text-stone-600 text-sm leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* 2. 交通事故後の症状はなぜ長引くのか？ */}
        <section>
          <div className="text-center mb-10">
            <span className="text-red-600 font-bold text-xl block mb-2">2</span>
            <h2 className="text-2xl md:text-3xl font-bold font-serif text-stone-800">
              交通事故後の症状はなぜ長引くのか？
            </h2>
          </div>
          
          <div className="bg-white rounded-3xl p-8 md:p-12 shadow-sm border border-stone-100">
            <p className="text-stone-700 mb-8 leading-relaxed text-center md:text-lg">
              交通事故の衝撃は、日常生活では起こらないレベルで<br className="hidden md:block" />
              <span className="font-bold text-red-600">筋肉・靭帯・神経・自律神経</span> にダメージを与えます。
            </p>
            
            <ul className="space-y-4 max-w-2xl mx-auto mb-8">
              {[
                'レントゲンでは写らない深部の損傷',
                '数日後に痛みが悪化する',
                '自律神経の乱れによる頭痛・めまい',
                '血流障害による回復遅延'
              ].map((item, i) => (
                <li key={i} className="flex items-center gap-3 bg-stone-50 p-4 rounded-xl">
                  <AlertTriangle size={20} className="text-orange-500 shrink-0" />
                  <span className="font-medium text-stone-800">{item}</span>
                </li>
              ))}
            </ul>
            
            <div className="text-center">
              <p className="inline-block bg-red-100 text-red-800 px-6 py-3 rounded-full font-bold">
                放置すると 後遺症として残る可能性 があります。
              </p>
            </div>
          </div>
        </section>

        {/* 3. 当院の交通事故治療（施術内容） */}
        <section>
          <div className="text-center mb-10">
            <span className="text-red-600 font-bold text-xl block mb-2">3</span>
            <h2 className="text-2xl md:text-3xl font-bold font-serif text-stone-800">
              当院の交通事故治療（施術内容）
            </h2>
          </div>
          
          <div className="grid sm:grid-cols-2 gap-6">
            {[
              {
                title: "鍼灸",
                items: ["深部の筋緊張を緩和", "自律神経の調整", "頭痛・めまいの軽減"],
                icon: <Activity size={24} />
              },
              {
                title: "ハイボルト電気治療",
                items: ["交通事故の急性期に最も効果的", "深部の炎症・痛みを軽減", "可動域改善"],
                icon: <Zap size={24} />
              },
              {
                title: "メディセル（筋膜リリース）",
                items: ["筋膜の癒着を改善", "重だるさ・コリを軽減", "血流改善"],
                icon: <Waves size={24} />
              },
              {
                title: "超音波治療",
                items: ["組織の回復促進", "慢性化した痛みに効果的"],
                icon: <Activity size={24} />
              },
              {
                title: "マッサージ・指圧",
                items: ["筋緊張の緩和", "血流改善"],
                icon: <HeartHandshake size={24} />
              },
              {
                title: "リハビリ・機能訓練",
                items: ["姿勢改善", "再発予防"],
                icon: <Activity size={24} />
              },
              {
                title: "酸素ルーム",
                items: ["自律神経の安定", "回復スピード向上", "慢性痛の改善補助"],
                icon: <Wind size={24} />
              }
            ].map((service, i) => (
              <div key={i} className="bg-white rounded-2xl p-6 shadow-sm border border-stone-100">
                <div className="flex items-center gap-3 mb-4 border-b border-stone-100 pb-3">
                  <div className="text-emerald-600">{service.icon}</div>
                  <h3 className="font-bold text-lg text-stone-800">{service.title}</h3>
                </div>
                <ul className="space-y-2">
                  {service.items.map((item, j) => (
                    <li key={j} className="flex items-start gap-2 text-sm text-stone-600">
                      <CheckCircle2 size={16} className="text-emerald-500 shrink-0 mt-0.5" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </section>

        {/* 4. 症状別の専門ページ */}
        <section>
          <div className="text-center mb-10">
            <span className="text-red-600 font-bold text-xl block mb-2">4</span>
            <h2 className="text-2xl md:text-3xl font-bold font-serif text-stone-800">
              症状別のアプローチ
            </h2>
          </div>
          
          <div className="grid md:grid-cols-2 gap-6">
            {[
              {
                title: "むちうち（頚椎捻挫）",
                symptoms: ["首の痛み", "動かすと痛い", "頭痛・めまい"],
                approach: "深部筋・神経へのアプローチが重要"
              },
              {
                title: "頭痛",
                symptoms: ["後頭部の痛み", "こめかみのズキズキ"],
                approach: "鍼灸＋ハイボルトが効果的"
              },
              {
                title: "めまい",
                symptoms: ["ふらつき", "立ちくらみ"],
                approach: "自律神経ケアが必須"
              },
              {
                title: "腰痛",
                symptoms: ["動作時の痛み", "鈍痛"],
                approach: "ハイボルト＋筋膜リリース"
              },
              {
                title: "手足のしびれ",
                symptoms: ["ビリビリ", "感覚低下"],
                approach: "神経周囲の炎症改善"
              },
              {
                title: "事故後の不安",
                symptoms: ["眠れない", "気分が落ち込む"],
                approach: "鍼灸＋酸素ルームが有効"
              },
              {
                title: "保険会社とのやり取り",
                symptoms: ["何を伝えればいい？", "手続きが不安…"],
                approach: "当院がサポートします"
              }
            ].map((item, i) => (
              <div key={i} className="bg-white rounded-2xl p-6 shadow-sm border border-stone-100">
                <h3 className="font-bold text-lg text-stone-800 mb-3 bg-stone-50 p-2 rounded-lg text-center">
                  {item.title}
                </h3>
                <ul className="mb-4 space-y-1">
                  {item.symptoms.map((sym, j) => (
                    <li key={j} className="text-sm text-stone-600 flex items-center gap-2">
                      <div className="w-1.5 h-1.5 rounded-full bg-stone-400"></div>
                      {sym}
                    </li>
                  ))}
                </ul>
                <div className="text-sm font-bold text-red-600 bg-red-50 p-3 rounded-xl flex items-start gap-2">
                  <ChevronRight size={16} className="shrink-0 mt-0.5" />
                  <span>{item.approach}</span>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* 5. 自賠責保険について（重要） */}
        <section>
          <div className="text-center mb-10">
            <span className="text-red-600 font-bold text-xl block mb-2">5</span>
            <h2 className="text-2xl md:text-3xl font-bold font-serif text-stone-800">
              自賠責保険について（重要）
            </h2>
          </div>
          
          <div className="bg-white rounded-3xl p-8 md:p-12 shadow-sm border border-stone-100 text-center max-w-2xl mx-auto">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-red-50 text-red-600 rounded-full mb-8">
              <ShieldCheck size={32} />
            </div>
            
            <ul className="grid sm:grid-cols-2 gap-4 text-left max-w-md mx-auto">
              {[
                { text: '施術費 0円', highlight: true },
                { text: '通院交通費も補償' },
                { text: '休業補償あり' },
                { text: '他院からの転院OK' },
                { text: '病院との併用OK' }
              ].map((item, i) => (
                <li key={i} className={`flex items-center gap-3 p-4 rounded-xl border ${item.highlight ? 'bg-red-50 border-red-100' : 'bg-stone-50 border-stone-100'}`}>
                  <CheckCircle2 size={20} className={item.highlight ? 'text-red-500' : 'text-emerald-500'} />
                  <span className={`font-bold ${item.highlight ? 'text-red-700 text-lg' : 'text-stone-700'}`}>{item.text}</span>
                </li>
              ))}
            </ul>
          </div>
        </section>

        {/* 6. 施術の流れ */}
        <section>
          <div className="text-center mb-10">
            <span className="text-red-600 font-bold text-xl block mb-2">6</span>
            <h2 className="text-2xl md:text-3xl font-bold font-serif text-stone-800">
              施術の流れ
            </h2>
          </div>
          
          <div className="max-w-3xl mx-auto">
            <div className="space-y-4 relative before:absolute before:inset-0 before:ml-6 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-stone-200 before:to-transparent">
              {[
                'お問い合わせ',
                'カウンセリング',
                '検査',
                '施術（鍼灸・ハイボルト・メディセルなど）',
                '病院との併用',
                '経過観察',
                '後遺症予防'
              ].map((step, i) => (
                <div key={i} className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
                  <div className="flex items-center justify-center w-12 h-12 rounded-full border-4 border-white bg-red-100 text-red-600 font-bold shadow shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2">
                    {i + 1}
                  </div>
                  <div className="w-[calc(100%-4rem)] md:w-[calc(50%-3rem)] bg-white p-6 rounded-2xl shadow-sm border border-stone-100 flex items-center">
                    <h3 className="font-bold text-stone-800">{step}</h3>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* 7. よくある質問（FAQ） */}
        <section>
          <div className="text-center mb-10">
            <span className="text-red-600 font-bold text-xl block mb-2">7</span>
            <h2 className="text-2xl md:text-3xl font-bold font-serif text-stone-800">
              よくある質問（FAQ）
            </h2>
          </div>
          
          <div className="max-w-3xl mx-auto space-y-4">
            {[
              {
                q: "病院と併用できますか？",
                a: "はい、可能です。"
              },
              {
                q: "他の整骨院から転院できますか？",
                a: "いつでも可能です。"
              },
              {
                q: "事故後、数日してから痛みが出ました…",
                a: "よくあることです。早期施術が重要です。"
              },
              {
                q: "保険会社とのやり取りが不安です…",
                a: "当院がサポートします。"
              }
            ].map((faq, i) => (
              <div key={i} className="bg-white rounded-2xl p-6 shadow-sm border border-stone-100">
                <div className="flex gap-4 mb-3">
                  <div className="w-8 h-8 bg-red-50 text-red-600 rounded-full flex items-center justify-center font-bold shrink-0">Q</div>
                  <h3 className="font-bold text-stone-800 mt-1">{faq.q}</h3>
                </div>
                <div className="flex gap-4">
                  <div className="w-8 h-8 bg-stone-100 text-stone-600 rounded-full flex items-center justify-center font-bold shrink-0">A</div>
                  <p className="text-stone-600 mt-1">{faq.a}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* 8. 対応エリア */}
        <section>
          <div className="text-center mb-10">
            <span className="text-red-600 font-bold text-xl block mb-2">8</span>
            <h2 className="text-2xl md:text-3xl font-bold font-serif text-stone-800">
              対応エリア（佐世保市全域）
            </h2>
          </div>
          
          <div className="bg-white rounded-3xl p-8 shadow-sm border border-stone-100 text-center max-w-3xl mx-auto">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-orange-50 text-orange-600 rounded-full mb-6">
              <MapPin size={32} />
            </div>
            <p className="text-stone-700 leading-relaxed">
              佐世保市中心部 / 広田 / 大塔 / 日宇 / 早岐 / 吉岡町 / 皆瀬町 / もみじが丘 /<br className="hidden md:block" />
              黒髪町 / 白岳町 / 大野町 / 相浦 / 中里 / 山手町 / 木風町 / 他市内全域
            </p>
          </div>
        </section>

        {/* 9. 予約方法 */}
        <section>
          <div className="text-center mb-10">
            <span className="text-red-600 font-bold text-xl block mb-2">9</span>
            <h2 className="text-2xl md:text-3xl font-bold font-serif text-stone-800">
              予約方法（最重要）
            </h2>
          </div>
          
          <div className="grid md:grid-cols-3 gap-6">
            {/* 店頭予約 */}
            <div className="bg-white rounded-3xl p-8 shadow-sm border border-stone-100">
              <div className="flex items-center gap-3 mb-6 border-b border-stone-100 pb-4">
                <div className="w-10 h-10 bg-emerald-100 text-emerald-600 rounded-lg flex items-center justify-center">
                  <Store size={24} />
                </div>
                <h3 className="text-xl font-bold text-stone-800">店頭予約（最速）</h3>
              </div>
              <ul className="space-y-4">
                {[
                  '枠だけ確保 → 後から名前追加OK',
                  'スタッフ別の空き状況をリアルタイム表示'
                ].map((item, i) => (
                  <li key={i} className="flex items-start gap-3 text-stone-700">
                    <CheckCircle2 className="text-emerald-500 shrink-0 mt-0.5" size={20} />
                    <span className="text-sm">{item}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* オンライン予約 */}
            <div className="bg-white rounded-3xl p-8 shadow-sm border border-stone-100">
              <div className="flex items-center gap-3 mb-6 border-b border-stone-100 pb-4">
                <div className="w-10 h-10 bg-blue-100 text-blue-600 rounded-lg flex items-center justify-center">
                  <Laptop size={24} />
                </div>
                <h3 className="text-xl font-bold text-stone-800">オンライン予約</h3>
              </div>
              <p className="text-sm text-stone-600 mb-6">24時間受付</p>
              <Link to="/施術予約" className="flex items-center justify-center gap-2 bg-stone-900 text-white p-4 rounded-xl hover:bg-stone-800 transition-colors">
                <span>予約ページへ</span>
                <ChevronRight size={16} />
              </Link>
            </div>

            {/* 電話予約 */}
            <div className="bg-white rounded-3xl p-8 shadow-sm border border-stone-100">
              <div className="flex items-center gap-3 mb-6 border-b border-stone-100 pb-4">
                <div className="w-10 h-10 bg-orange-100 text-orange-600 rounded-lg flex items-center justify-center">
                  <Phone size={24} />
                </div>
                <h3 className="text-xl font-bold text-stone-800">電話予約</h3>
              </div>
              <div className="flex flex-col gap-4">
                <a href="tel:0956-37-9110" className="flex items-center justify-between bg-stone-50 p-3 rounded-xl hover:bg-stone-100 transition-colors">
                  <span className="text-sm font-bold text-stone-700">大塔院</span>
                  <span className="font-mono text-emerald-600 font-bold">0956-37-9110</span>
                </a>
                <a href="tel:0956-56-3390" className="flex items-center justify-between bg-stone-50 p-3 rounded-xl hover:bg-stone-100 transition-colors">
                  <span className="text-sm font-bold text-stone-700">早岐院</span>
                  <span className="font-mono text-emerald-600 font-bold">0956-56-3390</span>
                </a>
                <a href="tel:0956-56-3921" className="flex items-center justify-between bg-stone-50 p-3 rounded-xl hover:bg-stone-100 transition-colors">
                  <span className="text-sm font-bold text-stone-700">矢峰院</span>
                  <span className="font-mono text-emerald-600 font-bold">0956-56-3921</span>
                </a>
              </div>
            </div>
          </div>
        </section>

        {/* 10. 最後に */}
        <section className="bg-red-600 rounded-3xl p-8 md:p-12 text-center text-white shadow-lg relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
          <div className="relative z-10">
            <span className="text-red-200 font-bold text-xl block mb-2">10</span>
            <h2 className="text-2xl md:text-3xl font-bold font-serif mb-6">
              最後に
            </h2>
            <p className="text-red-100 mb-6 max-w-2xl mx-auto leading-relaxed">
              交通事故後の痛みは、放置すると <span className="font-bold text-white">後遺症として残る可能性</span> があります。<br />
              早期施術が最も重要です。
            </p>
            <p className="text-xl font-bold mb-10 bg-white/10 inline-block px-6 py-4 rounded-2xl">
              交通事故治療は窓口負担0円。<br className="md:hidden" />まずはお気軽にご相談ください。
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/施術予約" className="inline-flex items-center justify-center gap-2 bg-stone-900 text-white px-8 py-4 rounded-full font-bold hover:bg-stone-800 transition-colors shadow-sm">
                <span>施術を予約する</span>
                <ChevronRight size={20} />
              </Link>
            </div>
          </div>
        </section>

      </div>
    </main>
  );
};

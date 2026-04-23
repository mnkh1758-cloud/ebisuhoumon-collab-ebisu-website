import React, { useEffect } from 'react';
import { Smile, Phone, CheckCircle2, Sparkles, Clock, Info } from 'lucide-react';

export const BeautyAcupuncturePage: React.FC = () => {
  useEffect(() => {
    window.scrollTo(0, 0);

    // SEO Settings
    document.title = "美容鍼・顔のむくみ改善 | 佐世保市のえびす鍼灸整骨院";
    const metaDescription = document.querySelector('meta[name="description"]');
    if (metaDescription) {
      metaDescription.setAttribute("content", "佐世保市で美容鍼ならえびす鍼灸整骨院へ。お肌のハリやリフトアップ、顔のむくみ、しわ・たるみの改善に。内側から輝く美しさを引き出します。顔面神経麻痺のケアもご相談ください。");
    }
  }, []);

  return (
    <main className="pt-20 bg-stone-50 min-h-screen animate-fade-in-up">
      {/* Hero Section */}
      <div className="relative h-[40vh] md:h-[500px] overflow-hidden">
        <img 
          src="https://images.unsplash.com/photo-1512290923902-8a9f81dc236c?auto=format&fit=crop&w=1920&q=80" 
          alt="美容鍼・顔のむくみ"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-rose-900/80 to-rose-800/40 flex items-center">
          <div className="container mx-auto px-6">
            <div className="max-w-2xl text-white">
              <div className="inline-flex items-center gap-2 bg-rose-500/30 backdrop-blur-md px-4 py-2 rounded-full text-sm font-bold tracking-wider mb-6 border border-rose-400/30">
                <Smile size={16} />
                <span>BEAUTY ACUPUNCTURE</span>
              </div>
              <h1 className="text-3xl md:text-5xl font-bold font-serif mb-6 leading-tight">
                美容鍼・顔のむくみ
              </h1>
              <p className="text-lg md:text-xl text-rose-50 leading-relaxed font-medium">
                お肌のハリやリフトアップに。<br className="hidden md:block" />
                内側から輝く美しさを引き出します。
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
            深層筋に対するアプローチと同時に行う、<br />
            肌にハリとツヤを与える特殊美容法
          </h2>
          <div className="bg-white p-8 md:p-12 rounded-3xl shadow-sm border border-rose-100 text-left">
            <h3 className="text-xl font-bold text-rose-800 mb-6 border-b border-rose-100 pb-4">顔の張り・食いしばり・たるみ・むくみのお悩みに</h3>
            <p className="text-stone-700 leading-loose mb-6">
              美容鍼は、お顔の筋肉（表情筋）や血流に直接アプローチし、内側から整える美容ケアです。
            </p>
            
            <div className="bg-rose-50 p-6 rounded-2xl mb-8">
              <ul className="space-y-3">
                {[
                  '顔の張りが気になる',
                  'フェイスラインがぼやけてきた',
                  '食いしばり・エラのこわばり',
                  '目の疲れ・重だるさ'
                ].map((item, idx) => (
                  <li key={idx} className="flex items-center gap-3 text-stone-700 font-medium">
                    <CheckCircle2 className="text-rose-500 shrink-0" size={20} />
                    {item}
                  </li>
                ))}
              </ul>
              <p className="mt-4 text-stone-600 text-sm">このようなお悩みをお持ちの方に選ばれています。</p>
            </div>

            <p className="text-stone-700 leading-loose">
              当院の美容鍼は、「見た目の変化」だけでなく顔が動かしやすく、疲れにくい状態を目指します。<br />
              無理な刺激は行わず、はじめての方にも安心して受けていただける施術です。
            </p>
          </div>
        </div>

        {/* Symptoms List */}
        <div className="mb-20">
          <div className="flex items-center gap-4 mb-8">
            <div className="h-px flex-1 bg-rose-200"></div>
            <h3 className="text-2xl font-bold font-serif text-stone-800 text-center flex items-center gap-2">
              <Sparkles className="text-rose-500" />
              こんなお悩みはありませんか？
            </h3>
            <div className="h-px flex-1 bg-rose-200"></div>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {[
              '顔のむくみ',
              'しわ・たるみ',
              'しみが濃い',
              '目の下のクマ',
              '肌のくすみ',
              '化粧ノリが悪い'
            ].map((symptom, idx) => (
              <div key={idx} className="bg-white p-4 rounded-xl border border-rose-100 shadow-sm flex items-center gap-3">
                <CheckCircle2 className="text-rose-500 shrink-0" size={20} />
                <span className="font-bold text-stone-700 text-sm">{symptom}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Special Care Section */}
        <div className="mb-24">
          <div className="bg-stone-800 text-white rounded-3xl p-8 md:p-12 shadow-lg relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-rose-500/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
            
            <div className="relative z-10">
              <div className="inline-flex items-center gap-2 bg-stone-700/50 px-4 py-2 rounded-full text-xs font-bold tracking-wider mb-6 border border-stone-600">
                <Info size={16} className="text-rose-400" />
                <span>SPECIAL CARE</span>
              </div>
              
              <h3 className="text-2xl md:text-3xl font-bold font-serif mb-6 leading-tight">
                【顔面神経麻痺・整形後の神経麻痺】<br />
                鍼灸による回復サポートについて
              </h3>
              
              <p className="text-stone-300 leading-relaxed mb-8">
                顔面神経麻痺や、美容整形・手術後の神経麻痺では、以下のような症状が続くことがあります。
              </p>

              <div className="grid md:grid-cols-2 gap-8 mb-8">
                <div className="bg-stone-900/50 p-6 rounded-2xl border border-stone-700">
                  <h4 className="text-rose-400 font-bold mb-4">よくある症状</h4>
                  <ul className="space-y-3">
                    {[
                      '顔が動かしづらい',
                      '左右差が気になる',
                      'つっぱり感・違和感が残る'
                    ].map((item, idx) => (
                      <li key={idx} className="flex items-center gap-3 text-stone-200 text-sm">
                        <CheckCircle2 className="text-rose-500 shrink-0" size={16} />
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
                
                <div className="bg-stone-900/50 p-6 rounded-2xl border border-stone-700">
                  <h4 className="text-rose-400 font-bold mb-4">当院のケアの目的</h4>
                  <p className="text-stone-300 text-sm mb-4">医療機関での診断・治療を最優先としたうえで、鍼灸・顔への施術により以下のサポートを行います。</p>
                  <ul className="space-y-3">
                    {[
                      '血流改善',
                      '神経周囲の環境調整',
                      '表情筋の緊張緩和'
                    ].map((item, idx) => (
                      <li key={idx} className="flex items-center gap-3 text-stone-200 text-sm">
                        <div className="w-1.5 h-1.5 rounded-full bg-rose-500 shrink-0"></div>
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              <div className="bg-rose-900/30 border border-rose-800/50 p-6 rounded-2xl">
                <p className="text-rose-100 text-sm leading-relaxed">
                  回復のスピードや経過には個人差がありますが、「今できるケアを探している」方の選択肢のひとつとしてご相談ください。カウンセリングのみでも可能です。
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* FAQ Section */}
        <div className="mb-12">
          <div className="text-center mb-12">
            <h3 className="text-2xl font-bold font-serif text-stone-800 mb-4">よくあるご質問</h3>
          </div>

          <div className="bg-white p-8 rounded-2xl shadow-sm border border-stone-100">
            <div className="flex gap-4 items-start">
              <div className="w-10 h-10 rounded-full bg-rose-100 flex items-center justify-center shrink-0 text-rose-600 font-bold">
                Q
              </div>
              <div>
                <h4 className="font-bold text-stone-800 text-lg mb-4 pt-2">効果の持続時間は？</h4>
                <div className="bg-stone-50 p-6 rounded-xl text-stone-700 leading-relaxed text-sm">
                  <p className="mb-4">
                    個人差はありますが、施術直後からリフトアップや目がくっきり大きく見えるなどの効果を実感していただけると思います。初めて施術を受けられた方でしたら、施術直後から数日間は効果を実感していただけます。
                  </p>
                  <p>
                    また、効果をより長く持続させるために、初めの1ヶ月は週に1～2回のペースで、その後は2～3週間に1～2回程度通っていただくことによって、更に効果を維持していただけます。
                  </p>
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
               <p className="text-xs text-stone-500 font-bold mb-1">美容鍼・お顔のお悩み相談はこちら</p>
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

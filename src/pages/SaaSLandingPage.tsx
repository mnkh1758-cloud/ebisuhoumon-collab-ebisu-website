import React from 'react';
import { Link } from 'react-router-dom';
import { 
  CheckCircle2, 
  Zap, 
  ArrowRight, 
  FileText, 
  TrendingUp, 
  Users, 
  ShieldCheck, 
  Clock, 
  Smartphone,
  ChevronRight,
  PlayCircle,
  MessageSquare,
  BarChart3,
  Calendar,
  Lock,
  Search
} from 'lucide-react';
import { motion } from 'motion/react';
import { PLAN_NAMES, PLAN_PRICES, PLAN_PRICES_ANNUAL } from '../lib/planConfig';

export const SaaSLandingPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-white font-sans text-stone-800 selection:bg-emerald-100 selection:text-emerald-900">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-md border-b border-stone-100">
        <div className="container mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-emerald-600 rounded-lg flex items-center justify-center text-white shadow-lg shadow-emerald-200">
              <Zap size={20} className="fill-white" />
            </div>
            <span className="text-xl font-black tracking-tighter text-stone-900">Smart Ledger<span className="text-emerald-600">1</span></span>
          </div>
          <div className="hidden md:flex items-center gap-8 text-sm font-bold text-stone-600">
            <a href="#features" className="hover:text-emerald-600 transition-colors">機能</a>
            <a href="#pricing" className="hover:text-emerald-600 transition-colors">料金</a>
            <a href="#faq" className="hover:text-emerald-600 transition-colors">よくある質問</a>
          </div>
          <div className="flex items-center gap-4">
            <Link to="/ledger/login" className="text-sm font-bold text-stone-500 hover:text-stone-800 transition-colors">ログイン</Link>
            <Link 
              to="/ledger/login" 
              className="bg-emerald-600 text-white px-6 py-2.5 rounded-full text-sm font-black hover:bg-emerald-700 transition-all shadow-lg shadow-emerald-100 active:scale-95"
            >
              無料で始める
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-40 pb-24 overflow-hidden">
        <div className="container mx-auto px-6">
          <div className="max-w-5xl mx-auto text-center space-y-8">
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-50 text-emerald-700 rounded-full text-xs font-black tracking-widest uppercase"
            >
              <Zap size={14} className="fill-emerald-500" /> 整骨院・鍼灸院向け次世代SaaS
            </motion.div>
            
            <motion.h1 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="text-5xl md:text-7xl font-black text-stone-900 leading-[1.1] tracking-tight"
            >
              紙カルテ、まだ探していますか？<br />
              <span className="text-emerald-600">検索0秒</span>、iPad1台で始まるスマート経営
            </motion.h1>
            
            <motion.p 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="text-xl text-stone-500 font-bold max-w-2xl mx-auto leading-relaxed"
            >
              受付、電子カルテ、Web問診、経営分析をこれ1つで。<br className="hidden md:block" />
              現場の「迷い」をゼロにし、本来の施術に集中できる環境を作ります。
            </motion.p>
            
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4"
            >
              <Link 
                to="/ledger/login" 
                className="w-full sm:w-auto bg-emerald-600 text-white px-10 py-5 rounded-2xl text-lg font-black hover:bg-emerald-700 transition-all shadow-2xl shadow-emerald-200 active:scale-95 flex items-center justify-center gap-2 group"
              >
                30日間無料で今すぐ始める
                <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
              </Link>
              <button className="w-full sm:w-auto flex items-center justify-center gap-2 px-10 py-5 text-stone-600 font-black hover:text-stone-900 transition-colors group">
                <PlayCircle size={24} className="text-emerald-600" />
                デモ動画を見る（1分）
              </button>
            </motion.div>

            {/* Hero Image / Mockup */}
            <motion.div 
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.4 }}
              className="relative mt-20"
            >
              <div className="absolute inset-0 bg-gradient-to-t from-white via-transparent to-transparent z-10"></div>
              <div className="relative bg-stone-900 rounded-[2.5rem] p-4 shadow-2xl shadow-stone-200 border-8 border-stone-800">
                <img 
                  src="https://images.unsplash.com/photo-1576091160550-2173dba999ef?q=80&w=2070&auto=format&fit=crop" 
                  alt="Smart Ledger Dashboard" 
                  className="rounded-2xl w-full object-cover aspect-video opacity-90"
                />
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-20">
                  <div className="w-20 h-20 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center text-white cursor-pointer hover:scale-110 transition-transform">
                    <PlayCircle size={48} />
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Pain Points */}
      <section className="py-24 bg-stone-50">
        <div className="container mx-auto px-6">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-black text-stone-900 text-center mb-16">
              こんな「現場の悩み」ありませんか？
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {[
                { icon: Search, text: "過去のカルテを探すのに時間がかかる" },
                { icon: BarChart3, text: "今月の売上が集計するまで見えない" },
                { icon: MessageSquare, text: "スタッフ間での情報共有が漏れる" }
              ].map((item, i) => (
                <div key={i} className="bg-white p-8 rounded-3xl border border-stone-100 shadow-sm flex flex-col items-center text-center">
                  <div className="w-14 h-14 bg-red-50 text-red-500 rounded-2xl flex items-center justify-center mb-6">
                    <item.icon size={28} />
                  </div>
                  <p className="font-black text-stone-700 leading-relaxed">{item.text}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="py-32">
        <div className="container mx-auto px-6">
          <div className="max-w-6xl mx-auto space-y-32">
            {/* Feature 1 */}
            <div className="flex flex-col md:flex-row items-center gap-16">
              <div className="flex-1 space-y-6">
                <div className="w-12 h-12 bg-emerald-100 text-emerald-600 rounded-2xl flex items-center justify-center">
                  <FileText size={24} />
                </div>
                <h3 className="text-4xl font-black text-stone-900">
                  AIアシストで、<br />
                  カルテ作成が劇的に速くなる。
                </h3>
                <p className="text-lg text-stone-500 font-bold leading-relaxed">
                  キーワードを入力するだけで、AIが適切なSOAP形式の文章を提案。
                  施術後の記録時間を大幅に短縮し、患者様との対話時間を増やせます。
                </p>
                <ul className="space-y-3">
                  {['SOAP形式の自動生成', '過去カルテのワンタップコピー', '画像への直接書き込み'].map(f => (
                    <li key={f} className="flex items-center gap-2 font-black text-stone-700">
                      <CheckCircle2 size={20} className="text-emerald-500" /> {f}
                    </li>
                  ))}
                </ul>
              </div>
              <div className="flex-1 bg-stone-100 rounded-[2.5rem] p-8 aspect-square flex items-center justify-center">
                <div className="w-full h-full bg-white rounded-2xl shadow-xl p-6 space-y-4">
                  <div className="h-4 w-1/3 bg-stone-100 rounded"></div>
                  <div className="h-20 w-full bg-stone-50 rounded-xl border border-stone-100"></div>
                  <div className="h-4 w-1/2 bg-stone-100 rounded"></div>
                  <div className="h-32 w-full bg-stone-50 rounded-xl border border-stone-100"></div>
                  <div className="flex justify-end">
                    <div className="h-10 w-24 bg-emerald-600 rounded-lg"></div>
                  </div>
                </div>
              </div>
            </div>

            {/* Feature 2 */}
            <div className="flex flex-col md:flex-row-reverse items-center gap-16">
              <div className="flex-1 space-y-6">
                <div className="w-12 h-12 bg-blue-100 text-blue-600 rounded-2xl flex items-center justify-center">
                  <TrendingUp size={24} />
                </div>
                <h3 className="text-4xl font-black text-stone-900">
                  経営の「今」を、<br />
                  リアルタイムで可視化。
                </h3>
                <p className="text-lg text-stone-500 font-bold leading-relaxed">
                  売上、来院数、客単価、リピート率。
                  経営に必要な全ての数字が、ダッシュボードに自動集計されます。
                  感覚に頼らない、データに基づいた経営判断を。
                </p>
                <ul className="space-y-3">
                  {['売上・来院数の自動集計', 'スタッフ別貢献度の可視化', '自費メニューの販売分析'].map(f => (
                    <li key={f} className="flex items-center gap-2 font-black text-stone-700">
                      <CheckCircle2 size={20} className="text-blue-500" /> {f}
                    </li>
                  ))}
                </ul>
              </div>
              <div className="flex-1 bg-stone-100 rounded-[2.5rem] p-8 aspect-square flex items-center justify-center">
                <div className="w-full h-full bg-white rounded-2xl shadow-xl p-8 flex flex-col justify-between">
                  <div className="flex items-center justify-between">
                    <div className="h-4 w-24 bg-stone-100 rounded"></div>
                    <div className="h-4 w-12 bg-stone-100 rounded"></div>
                  </div>
                  <div className="flex items-end gap-2 h-40">
                    {[40, 70, 50, 90, 60, 80, 100].map((h, i) => (
                      <div key={i} className="flex-1 bg-emerald-500 rounded-t-lg" style={{ height: `${h}%` }}></div>
                    ))}
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="h-16 bg-stone-50 rounded-xl"></div>
                    <div className="h-16 bg-stone-50 rounded-xl"></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="py-32 bg-stone-900 text-white overflow-hidden relative">
        <div className="absolute top-0 left-0 w-full h-full opacity-10 pointer-events-none">
          <div className="absolute top-0 left-1/4 w-96 h-96 bg-emerald-500 rounded-full blur-[120px]"></div>
          <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-blue-500 rounded-full blur-[120px]"></div>
        </div>
        
        <div className="container mx-auto px-6 relative z-10">
          <div className="max-w-4xl mx-auto text-center space-y-6 mb-20">
            <h2 className="text-4xl md:text-5xl font-black">
              圧倒的なコストパフォーマンス。
            </h2>
            <p className="text-stone-400 font-bold text-lg">
              初期費用0円。まずは30日間、全ての機能をお試しください。
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {(['free', 'standard', 'pro'] as const).map((p) => (
              <div key={p} className={`p-8 rounded-[2.5rem] border-2 transition-all duration-300 flex flex-col ${
                p === 'standard' ? 'border-emerald-500 bg-white/5 backdrop-blur-xl scale-105 shadow-2xl shadow-emerald-500/20' : 'border-white/10 bg-white/5'
              }`}>
                <div className="mb-8">
                  <h4 className="font-black text-xl mb-2">{PLAN_NAMES[p]}</h4>
                  <div className="flex items-baseline gap-1">
                    <span className="text-4xl font-black">¥{PLAN_PRICES[p].toLocaleString()}</span>
                    <span className="text-stone-400 font-bold text-sm"> / 月</span>
                  </div>
                </div>
                
                <ul className="space-y-4 mb-10 flex-1">
                  {[
                    `スタッフ最大 ${p === 'free' ? '3' : p === 'standard' ? '10' : '無制限'} 名`,
                    '予約管理システム',
                    p !== 'free' ? '電子カルテ機能' : null,
                    p !== 'free' ? 'Web問診票' : null,
                    p === 'pro' ? '経営分析ダッシュボード' : null,
                    '30日間無料トライアル'
                  ].filter(Boolean).map((f, i) => (
                    <li key={i} className="flex items-center gap-3 text-sm font-bold text-stone-300">
                      <CheckCircle2 size={18} className="text-emerald-500 shrink-0" /> {f}
                    </li>
                  ))}
                </ul>

                <Link 
                  to="/ledger/login" 
                  className={`w-full py-4 rounded-2xl font-black text-center transition-all active:scale-95 ${
                    p === 'standard' ? 'bg-emerald-600 text-white hover:bg-emerald-700' : 'bg-white/10 text-white hover:bg-white/20'
                  }`}
                >
                  無料で始める
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section id="faq" className="py-32">
        <div className="container mx-auto px-6">
          <div className="max-w-3xl mx-auto">
            <h2 className="text-3xl font-black text-stone-900 text-center mb-16">よくある質問</h2>
            <div className="space-y-6">
              {[
                { q: "本当に30日間無料ですか？", a: "はい。登録から30日間は全ての機能を無料でお使いいただけます。期間終了前にこちらから継続確認をさせていただきますので、勝手に課金されることはありません。" },
                { q: "今のカルテからの移行は大変ですか？", a: "患者様の名簿データ（CSV等）があれば、一括で取り込むことが可能です。操作に不安がある場合は、専任スタッフがオンラインで設定をサポートいたします。" },
                { q: "セキュリティは大丈夫ですか？", a: "銀行レベルの暗号化通信（SSL）を使用し、データはGoogleの堅牢なクラウドサーバーで管理されています。紙の紛失や盗難のリスクに比べ、格段に安全です。" }
              ].map((item, i) => (
                <div key={i} className="p-8 bg-stone-50 rounded-3xl border border-stone-100">
                  <h4 className="font-black text-stone-800 mb-2 flex items-center gap-3">
                    <span className="w-6 h-6 bg-emerald-600 text-white rounded-full flex items-center justify-center text-[10px]">Q</span>
                    {item.q}
                  </h4>
                  <p className="text-stone-500 font-bold text-sm leading-relaxed pl-9">{item.a}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-32 bg-emerald-600 relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-full opacity-10 pointer-events-none">
          <Zap size={400} className="absolute -top-40 -right-40 text-white" />
        </div>
        <div className="container mx-auto px-6 relative z-10 text-center text-white space-y-8">
          <h2 className="text-4xl md:text-6xl font-black">
            今日から、<br className="md:hidden" />スマートな経営を。
          </h2>
          <p className="text-xl text-emerald-100 font-bold max-w-2xl mx-auto">
            30日間の無料トライアルで、現場の変化を実感してください。<br />
            初期設定のサポートも無料で行っております。
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
            <Link 
              to="/ledger/login" 
              className="w-full sm:w-auto bg-white text-emerald-700 px-12 py-6 rounded-2xl text-xl font-black hover:bg-stone-100 transition-all shadow-2xl shadow-emerald-900/20 active:scale-95 flex items-center justify-center gap-2 group"
            >
              無料で今すぐ始める
              <ArrowRight size={24} className="group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 border-t border-stone-100 bg-stone-50">
        <div className="container mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-8">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 bg-emerald-600 rounded flex items-center justify-center text-white">
              <Zap size={14} className="fill-white" />
            </div>
            <span className="font-black tracking-tighter text-stone-900">Smart Ledger<span className="text-emerald-600">1</span></span>
          </div>
          <div className="flex items-center gap-8 text-xs font-bold text-stone-400">
            <a href="#" className="hover:text-stone-600 transition-colors">利用規約</a>
            <a href="#" className="hover:text-stone-600 transition-colors">プライバシーポリシー</a>
            <a href="#" className="hover:text-stone-600 transition-colors">特定商取引法に基づく表記</a>
          </div>
          <p className="text-xs font-bold text-stone-400">© 2024 Smart Ledger 1. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
};

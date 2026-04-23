import React from 'react';
import { Link } from 'react-router-dom';
import { Lock, Zap, ArrowRight } from 'lucide-react';
import { motion } from 'motion/react';

interface FeatureLockProps {
  title: string;
  description: string;
  planRequired?: 'standard' | 'pro';
}

export const FeatureLock: React.FC<FeatureLockProps> = ({ 
  title, 
  description, 
  planRequired = 'standard' 
}) => {
  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="h-full min-h-[400px] flex flex-col items-center justify-center p-8 text-center bg-white rounded-[2.5rem] border-2 border-dashed border-stone-200"
    >
      <div className="w-20 h-20 bg-amber-50 text-amber-600 rounded-3xl flex items-center justify-center mb-6 relative">
        <Lock size={40} />
        <div className="absolute -top-2 -right-2 w-8 h-8 bg-emerald-500 text-white rounded-full flex items-center justify-center shadow-lg">
          <Zap size={16} className="fill-white" />
        </div>
      </div>
      
      <h2 className="text-2xl font-black text-stone-800 mb-2">{title}</h2>
      <p className="text-stone-500 font-bold max-w-md mb-8 leading-relaxed">
        {description}
      </p>

      <div className="flex flex-col sm:flex-row gap-4">
        <Link 
          to="/ledger/settings"
          className="flex items-center gap-2 bg-emerald-600 text-white px-8 py-4 rounded-2xl font-black hover:bg-emerald-700 transition-all shadow-xl shadow-emerald-100 active:scale-95 group"
        >
          {planRequired === 'pro' ? 'プロプラン' : 'スタンダードプラン'}へアップグレード
          <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
        </Link>
      </div>
      
      <p className="mt-6 text-xs font-bold text-stone-400">
        ※アップグレードは即時反映され、すぐに機能をご利用いただけます。
      </p>
    </motion.div>
  );
};

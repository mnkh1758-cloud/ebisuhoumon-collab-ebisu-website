import React, { useState, useEffect, useMemo } from 'react';
import { db } from '../firebase';
import { collection, onSnapshot, query } from 'firebase/firestore';
import { Clinic, PlanType } from '../types';
import { PLAN_PRICES } from '../lib/planConfig';
import { 
  Building2, 
  CircleDollarSign, 
  Users, 
  TrendingUp, 
  ArrowUpRight, 
  ArrowDownRight,
  Loader2,
  ShieldCheck,
  Zap,
  CreditCard
} from 'lucide-react';
import { StatCard } from '../ledger/components/StatCard';

export const SaaSAdminDashboard: React.FC = () => {
  const [clinics, setClinics] = useState<Clinic[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const q = query(collection(db, 'clinics'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Clinic));
      setClinics(data);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const stats = useMemo(() => {
    const totalClinics = clinics.length;
    const activeSubscriptions = clinics.filter(c => c.billingStatus === 'active').length;
    const trialClinics = clinics.filter(c => c.billingStatus === 'trial').length;
    
    const monthlyRevenue = clinics.reduce((sum, c) => {
      if (c.billingStatus === 'active') {
        return sum + (PLAN_PRICES[c.plan] || 0);
      }
      return sum;
    }, 0);

    const planDistribution = clinics.reduce((acc, c) => {
      acc[c.plan] = (acc[c.plan] || 0) + 1;
      return acc;
    }, {} as Record<PlanType, number>);

    return {
      totalClinics,
      activeSubscriptions,
      trialClinics,
      monthlyRevenue,
      planDistribution
    };
  }, [clinics]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-stone-50">
        <Loader2 className="animate-spin text-emerald-600" size={40} />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-stone-50 p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-black text-stone-800 flex items-center gap-3">
              <ShieldCheck className="text-emerald-600" size={32} /> SaaS 管理ダッシュボード
            </h1>
            <p className="text-stone-500 font-bold mt-1">プラットフォーム全体の稼働状況と売上推移</p>
          </div>
          <div className="bg-white px-6 py-3 rounded-2xl border border-stone-200 shadow-sm flex items-center gap-3">
            <div className="w-3 h-3 bg-emerald-500 rounded-full animate-pulse"></div>
            <span className="text-sm font-black text-stone-600">システム正常稼働中</span>
          </div>
        </div>

        {/* KPI Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard
            title="総契約院数"
            value={stats.totalClinics}
            unit="院"
            icon={Building2}
            color="emerald"
            description="全登録ベース"
          />
          <StatCard
            title="月間推定売上"
            value={stats.monthlyRevenue.toLocaleString()}
            unit="円"
            icon={CircleDollarSign}
            color="blue"
            description="アクティブ契約のみ"
          />
          <StatCard
            title="有料購読数"
            value={stats.activeSubscriptions}
            unit="院"
            icon={CreditCard}
            color="emerald"
            description={`トライアル中: ${stats.trialClinics}院`}
          />
          <StatCard
            title="MRR成長率"
            value={12.5}
            unit="%"
            icon={TrendingUp}
            color="emerald"
            description="前月比（シミュレーション）"
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Plan Distribution */}
          <div className="lg:col-span-1 bg-white p-8 rounded-[2.5rem] border border-stone-200 shadow-sm">
            <h2 className="text-lg font-black text-stone-800 mb-6 flex items-center gap-2">
              <Zap className="text-amber-500" size={20} /> プラン別分布
            </h2>
            <div className="space-y-6">
              {(['free', 'standard', 'pro'] as PlanType[]).map(plan => {
                const count = stats.planDistribution[plan] || 0;
                const percentage = stats.totalClinics > 0 ? (count / stats.totalClinics) * 100 : 0;
                return (
                  <div key={plan}>
                    <div className="flex justify-between text-sm font-bold mb-2">
                      <span className="text-stone-600 uppercase tracking-widest">{plan}</span>
                      <span className="text-stone-900">{count} 院 ({Math.round(percentage)}%)</span>
                    </div>
                    <div className="w-full h-3 bg-stone-100 rounded-full overflow-hidden">
                      <div 
                        className={`h-full transition-all duration-1000 ${
                          plan === 'pro' ? 'bg-emerald-600' :
                          plan === 'standard' ? 'bg-blue-500' :
                          'bg-stone-400'
                        }`}
                        style={{ width: `${percentage}%` }}
                      ></div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Recent Clinics */}
          <div className="lg:col-span-2 bg-white rounded-[2.5rem] border border-stone-200 shadow-sm overflow-hidden">
            <div className="p-8 border-b border-stone-100">
              <h2 className="text-lg font-black text-stone-800 flex items-center gap-2">
                <Users className="text-emerald-600" size={20} /> 最近の登録院
              </h2>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="text-[10px] font-black text-stone-400 uppercase tracking-widest border-b border-stone-100 bg-stone-50/50">
                    <th className="px-8 py-4">院名</th>
                    <th className="px-8 py-4">プラン</th>
                    <th className="px-8 py-4">ステータス</th>
                    <th className="px-8 py-4">登録日</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-50">
                  {clinics.slice(0, 10).map(c => (
                    <tr key={c.id} className="hover:bg-stone-50/50 transition-colors">
                      <td className="px-8 py-4 font-black text-stone-800 text-sm">{c.name}</td>
                      <td className="px-8 py-4">
                        <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ${
                          c.plan === 'pro' ? 'bg-emerald-100 text-emerald-700' :
                          c.plan === 'standard' ? 'bg-blue-100 text-blue-700' :
                          'bg-stone-100 text-stone-600'
                        }`}>
                          {c.plan}
                        </span>
                      </td>
                      <td className="px-8 py-4">
                        <span className={`flex items-center gap-1.5 text-xs font-bold ${
                          c.billingStatus === 'active' ? 'text-emerald-600' :
                          c.billingStatus === 'trial' ? 'text-amber-600' :
                          'text-red-600'
                        }`}>
                          <div className={`w-1.5 h-1.5 rounded-full ${
                            c.billingStatus === 'active' ? 'bg-emerald-500' :
                            c.billingStatus === 'trial' ? 'bg-amber-500' :
                            'bg-red-500'
                          }`}></div>
                          {c.billingStatus}
                        </span>
                      </td>
                      <td className="px-8 py-4 text-xs font-bold text-stone-500">
                        {c.createdAt?.toDate ? c.createdAt.toDate().toLocaleDateString('ja-JP') : '---'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

import React, { useState, useEffect, useMemo } from 'react';
import { useOutletContext, Link } from 'react-router-dom';
import { db, handleFirestoreError, OperationType } from '../../firebase';
import { collection, query, where, onSnapshot } from 'firebase/firestore';
import { Reservation, FeatureFlags } from '../../types';
import { StatCard } from '../components/StatCard';
import { perf } from '@/ledger/utils/performance';
import { FeatureLock } from '../../src/components/common/FeatureLock';
import { 
  Users, 
  CircleDollarSign, 
  CreditCard, 
  XCircle, 
  Activity,
  CalendarDays,
  TrendingUp,
  Clock,
  Zap
} from 'lucide-react';

export const Dashboard: React.FC = () => {
  const { clinicId, featureFlags } = useOutletContext<{ clinicId: string, featureFlags: FeatureFlags }>();
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [loading, setLoading] = useState(true);

  const todayStr = useMemo(() => {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
  }, []);

  useEffect(() => {
    perf.start('Dashboard_load');
    if (!clinicId || !featureFlags.canUseAnalytics) return;

    setLoading(true);
    const q = query(
      collection(db, `clinics/${clinicId}/reservations`),
      where('date', '==', todayStr)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      perf.mark('Dashboard_data_received');
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Reservation));
      setReservations(data);
      setLoading(false);
      perf.end('Dashboard_load');
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, `clinics/${clinicId}/reservations`);
      setLoading(false);
      perf.end('Dashboard_load');
    });

    return () => unsubscribe();
  }, [clinicId, todayStr, featureFlags.canUseAnalytics]);

  if (!featureFlags.canUseAnalytics) {
    return (
      <FeatureLock 
        title="ダッシュボードはプロプラン限定です"
        description="売上分析、客単価推移、稼働率などの詳細な経営分析機能を利用するには、プロプランへのアップグレードが必要です。"
        planRequired="pro"
      />
    );
  }

  // 集計ロジック (useMemoで最適化)
  const stats = useMemo(() => {
    const activeReservations = reservations.filter(r => r.status !== 'cancelled');
    
    // 来院数 (未来院以外)
    const visitorCount = activeReservations.filter(r => r.visitStatus && r.visitStatus !== 'not_arrived').length;
    
    // 売上合計 (会計待ち or 完了)
    const totalSales = activeReservations
      .filter(r => r.visitStatus === 'waiting_for_payment' || r.visitStatus === 'completed')
      .reduce((sum, r) => sum + (r.grandTotal || 0), 0);
    
    // 未会計件数
    const unpaidCount = activeReservations.filter(r => r.visitStatus === 'waiting_for_payment').length;
    
    // キャンセル数
    const cancelledCount = reservations.filter(r => r.status === 'cancelled').length;
    
    // 施術中 or 来院中 (arrived)
    const activePatientCount = activeReservations.filter(r => r.visitStatus === 'arrived').length;

    return {
      visitorCount,
      totalSales,
      unpaidCount,
      cancelledCount,
      activePatientCount,
      totalReservations: activeReservations.length
    };
  }, [reservations]);

  const LoadingValue = () => (
    <div className="h-8 w-16 bg-stone-100 rounded animate-pulse"></div>
  );

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black text-stone-800 flex items-center gap-2">
            <TrendingUp className="text-emerald-600" /> 経営ダッシュボード
          </h1>
          <p className="text-stone-500 font-bold flex items-center gap-2 mt-1">
            <CalendarDays size={16} /> {todayStr.replace(/-/g, '/')} の状況
          </p>
        </div>
        <div className="bg-white px-4 py-2 rounded-2xl border border-stone-200 shadow-sm flex items-center gap-2">
          <div className={`w-2 h-2 rounded-full ${loading ? 'bg-stone-300' : 'bg-emerald-500 animate-pulse'}`}></div>
          <span className="text-xs font-black text-stone-600">{loading ? 'データ読込中...' : 'リアルタイム更新中'}</span>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6">
        <StatCard
          title="本日の来院数"
          value={loading ? <LoadingValue /> : stats.visitorCount}
          unit="名"
          icon={Users}
          color="emerald"
          description={loading ? '読込中...' : `全予約: ${stats.totalReservations}件`}
        />
        <StatCard
          title="本日の売上"
          value={loading ? <LoadingValue /> : stats.totalSales.toLocaleString()}
          unit="円"
          icon={CircleDollarSign}
          color="blue"
          description="確定+会計待ち"
        />
        <StatCard
          title="未会計"
          value={loading ? <LoadingValue /> : stats.unpaidCount}
          unit="件"
          icon={CreditCard}
          color={stats.unpaidCount > 0 ? 'orange' : 'stone'}
          description="要チェック"
        />
        <StatCard
          title="施術中/来院中"
          value={loading ? <LoadingValue /> : stats.activePatientCount}
          unit="名"
          icon={Activity}
          color="emerald"
          description="現在の稼働"
        />
        <StatCard
          title="キャンセル"
          value={loading ? <LoadingValue /> : stats.cancelledCount}
          unit="件"
          icon={XCircle}
          color={stats.cancelledCount > 0 ? 'red' : 'stone'}
          description="本日の欠損"
        />
      </div>

      {/* Quick Info */}
      <div className="bg-white p-8 rounded-3xl border border-stone-200 shadow-sm">
        <h2 className="text-lg font-black text-stone-800 mb-6 flex items-center gap-2">
          <Clock className="text-emerald-600" size={20} /> 本日の稼働サマリー
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-stone-50 rounded-2xl border border-stone-100">
              <span className="font-bold text-stone-600">予約消化率</span>
              <span className="font-black text-emerald-600 text-xl">
                {stats.totalReservations > 0 
                  ? Math.round((stats.visitorCount / stats.totalReservations) * 100) 
                  : 0}%
              </span>
            </div>
            <div className="flex items-center justify-between p-4 bg-stone-50 rounded-2xl border border-stone-100">
              <span className="font-bold text-stone-600">客単価（平均）</span>
              <span className="font-black text-blue-600 text-xl">
                {stats.visitorCount > 0 
                  ? Math.round(stats.totalSales / stats.visitorCount).toLocaleString() 
                  : 0}円
              </span>
            </div>
          </div>
          <div className="flex flex-col justify-center p-6 bg-emerald-50/50 rounded-3xl border border-emerald-100">
            <p className="text-sm font-bold text-emerald-700 mb-2">院長へのアドバイス</p>
            <p className="text-stone-700 font-bold leading-relaxed">
              {stats.unpaidCount > 0 
                ? `未会計が${stats.unpaidCount}件あります。スタッフに確認してください。` 
                : stats.activePatientCount > 3 
                  ? "現在、院内が混み合っています。スムーズな誘導を心がけましょう。" 
                  : "本日の稼働は順調です。空き時間でカルテの整理や清掃を行いましょう。"}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

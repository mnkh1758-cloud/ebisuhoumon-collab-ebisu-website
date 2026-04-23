import React, { useState, useEffect, useMemo } from 'react';
import { useOutletContext } from 'react-router-dom';
import { db, handleFirestoreError, OperationType } from '../../firebase';
import { collection, query, where, onSnapshot, orderBy, Timestamp } from 'firebase/firestore';
import { 
  BarChart3, 
  Calendar as CalendarIcon, 
  ChevronLeft, 
  ChevronRight, 
  Printer, 
  TrendingUp, 
  Wallet, 
  CreditCard, 
  Banknote, 
  MoreHorizontal, 
  Users,
  ArrowUpRight,
  Receipt,
  AlertCircle,
  FileDown,
  FileSpreadsheet
} from 'lucide-react';

import { UserProfile, Clinic } from '../../types';

interface Checkout {
  amounts: {
    totalAmount: number;
    insuranceAmount: number;
    selfPayAmount: number;
    optionAmount: number;
  };
  payment: {
    paymentMethodType: string;
    paymentMethodDetail: string;
  };
  receivable: {
    isReceivable: boolean;
    receivableAmount: number;
  };
  clearedAt: Timestamp;
}

interface Reservation {
  id: string;
  date: string;
  startTime: string;
  visitStatus: string;
  checkout?: Checkout;
  patientName?: string;
  staffName?: string;
  staffId?: string;
}

export const Summary: React.FC = () => {
  const { clinicId, clinic } = useOutletContext<{ clinicId: string, clinic: Clinic }>();
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [loading, setLoading] = useState(true);

  const getTodayStr = () => {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
  };

  const [startDate, setStartDate] = useState(getTodayStr());
  const [endDate, setEndDate] = useState(getTodayStr());

  const todayStr = useMemo(() => getTodayStr(), []);

  useEffect(() => {
    if (!clinicId) return;

    setLoading(true);
    // 期間指定でデータを取得
    const q = query(
      collection(db, `clinics/${clinicId}/reservations`),
      where('date', '>=', startDate),
      where('date', '<=', endDate),
      where('visitStatus', '==', 'completed')
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Reservation));
      setReservations(data);
      setLoading(false);
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, `clinics/${clinicId}/reservations`);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [clinicId, startDate, endDate]);

  // フォーマット関数
  const formatYen = (num: number) => {
    return new Intl.NumberFormat('ja-JP', { style: 'currency', currency: 'JPY' }).format(num);
  };

  // --- 集計ロジック ---

  // 日計表 (今日)
  const dailyStats = useMemo(() => {
    const todayData = reservations.filter(r => {
      if (!r.checkout || !r.checkout.clearedAt) return false;
      const clearedDate = r.checkout.clearedAt.toDate();
      const dStr = `${clearedDate.getFullYear()}-${String(clearedDate.getMonth() + 1).padStart(2, '0')}-${String(clearedDate.getDate()).padStart(2, '0')}`;
      return dStr === todayStr;
    });

    const stats = {
      total: 0,
      insurance: 0,
      selfPay: 0,
      option: 0,
      payments: {
        cash: 0,
        card: 0,
        emoney: 0,
        other: 0,
        receivable: 0
      },
      receivableCount: 0,
      count: todayData.length
    };

    todayData.forEach(r => {
      const c = r.checkout!;
      stats.total += Number(c.amounts.totalAmount || 0);
      stats.insurance += Number(c.amounts.insuranceAmount || 0);
      stats.selfPay += Number(c.amounts.selfPayAmount || 0);
      stats.option += Number(c.amounts.optionAmount || 0);

      const type = c.payment?.paymentMethodType || 'other';
      if (type === 'cash') stats.payments.cash += Number(c.amounts.totalAmount || 0);
      else if (type === 'card') stats.payments.card += Number(c.amounts.totalAmount || 0);
      else if (type === 'emoney') stats.payments.emoney += Number(c.amounts.totalAmount || 0);
      else stats.payments.other += Number(c.amounts.totalAmount || 0);

      if (c.receivable?.isReceivable) {
        stats.payments.receivable += Number(c.receivable.receivableAmount || 0);
        stats.receivableCount++;
      }
    });

    return stats;
  }, [reservations, todayStr]);

  // 月次集計
  const monthlyStats = useMemo(() => {
    const stats = {
      total: 0,
      insurance: 0,
      selfPay: 0,
      option: 0,
      receivable: 0,
      dailyList: {} as Record<string, number>
    };

    reservations.forEach(r => {
      if (!r.checkout) return;
      const c = r.checkout;
      stats.total += Number(c.amounts.totalAmount || 0);
      stats.insurance += Number(c.amounts.insuranceAmount || 0);
      stats.selfPay += Number(c.amounts.selfPayAmount || 0);
      stats.option += Number(c.amounts.optionAmount || 0);
      if (c.receivable?.isReceivable) {
        stats.receivable += Number(c.receivable.receivableAmount || 0);
      }

      // 日別リスト (clearedAt基準)
      const clearedDate = c.clearedAt.toDate();
      const dKey = `${clearedDate.getMonth() + 1}/${clearedDate.getDate()}`;
      stats.dailyList[dKey] = (stats.dailyList[dKey] || 0) + Number(c.amounts.totalAmount || 0);
    });

    return stats;
  }, [reservations]);

  // 支払い方法別
  const paymentMethodStats = useMemo(() => {
    const typeTotals: Record<string, number> = {};
    const detailTotals: Record<string, number> = {};

    reservations.forEach(r => {
      if (!r.checkout) return;
      const c = r.checkout;
      const amount = Number(c.amounts.totalAmount || 0);
      const type = c.payment?.paymentMethodType || 'other';
      const detail = c.payment?.paymentMethodDetail || '詳細なし';

      typeTotals[type] = (typeTotals[type] || 0) + amount;
      detailTotals[detail] = (detailTotals[detail] || 0) + amount;
    });

    const sortedTypes = Object.entries(typeTotals).sort((a,b) => b[1] - a[1]);
    const sortedDetails = Object.entries(detailTotals).sort((a,b) => b[1] - a[1]);

    return { sortedTypes, sortedDetails };
  }, [reservations]);

  // スタッフ別ランキング集計
  const staffStats = useMemo(() => {
    const statsMap: Record<string, { id: string; name: string; total: number; selfPay: number; option: number; count: number }> = {};

    reservations.forEach(r => {
      if (!r.checkout) return;
      const c = r.checkout;
      const staffId = r.staffId || 'unknown';
      const staffName = r.staffName || '未設定';

      if (!statsMap[staffId]) {
        statsMap[staffId] = { id: staffId, name: staffName, total: 0, selfPay: 0, option: 0, count: 0 };
      }

      const s = statsMap[staffId];
      s.total += Number(c.amounts.totalAmount || 0);
      s.selfPay += Number(c.amounts.selfPayAmount || 0);
      s.option += Number(c.amounts.optionAmount || 0);
      s.count += 1;
    });

    const staffList = Object.values(statsMap);
    
    // 総売上ランキング
    const totalRanking = [...staffList].sort((a, b) => {
      if (b.total !== a.total) return b.total - a.total;
      return b.count - a.count;
    });

    // 自費売上ランキング
    const selfPayRanking = [...staffList].sort((a, b) => {
      if (b.selfPay !== a.selfPay) return b.selfPay - a.selfPay;
      return b.count - a.count;
    });

    return { totalRanking, selfPayRanking };
  }, [reservations]);

  // 印刷用集計ロジック
  const printStats = useMemo(() => {
    const stats = {
      total: 0,
      insurance: 0,
      selfPay: 0,
      option: 0,
      cash: 0,
      card: 0,
      emoney: 0,
      other: 0,
      receivable: 0,
      receivableCount: 0,
      visitCount: reservations.length
    };

    reservations.forEach(r => {
      if (!r.checkout) return;
      const c = r.checkout;
      stats.total += Number(c.amounts.totalAmount || 0);
      stats.insurance += Number(c.amounts.insuranceAmount || 0);
      stats.selfPay += Number(c.amounts.selfPayAmount || 0);
      stats.option += Number(c.amounts.optionAmount || 0);

      const type = c.payment?.paymentMethodType;
      if (type === 'cash') stats.cash += Number(c.amounts.totalAmount || 0);
      else if (type === 'card') stats.card += Number(c.amounts.totalAmount || 0);
      else if (type === 'emoney') stats.emoney += Number(c.amounts.totalAmount || 0);
      else stats.other += Number(c.amounts.totalAmount || 0);

      if (c.receivable?.isReceivable) {
        stats.receivable += Number(c.receivable.receivableAmount || 0);
        stats.receivableCount++;
      }
    });

    return stats;
  }, [reservations]);

  const handlePrint = () => {
    window.print();
  };

  const sanitizeFileName = (name: string) => {
    return (name || 'clinic')
      .replace(/[\s\t　]/g, '_')
      .replace(/[\\/:*?"<>|,]/g, '');
  };

  const getTypeName = (type: string) => {
    switch(type) {
      case 'cash': return '現金';
      case 'card': return 'カード';
      case 'emoney': return '電子マネー';
      default: return 'その他';
    }
  };

  // --- CSV出力ロジック ---

  // 支払い種別の日本語変換 (CSV用)
  const formatPaymentTypeCSV = (type: string) => {
    switch (type) {
      case 'cash': return '現金';
      case 'card': return 'カード';
      case 'emoney': return '電子マネー';
      default: return 'その他';
    }
  };

  // CSVダウンロード実行関数
  const downloadCSV = (filename: string, csvContent: string) => {
    const bom = new Uint8Array([0xEF, 0xBB, 0xBF]); // UTF-8 BOM
    const blob = new Blob([bom, csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', filename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // ① 現場用詳細CSV出力
  const generateDetailCSV = () => {
    if (startDate > endDate) {
      alert('開始日が終了日より後の日付になっています。');
      return;
    }

    const clinicTitle = clinic?.name || 'clinic';
    const header = ['clinic名', '日付', '時間', '患者名', 'staffId', '担当者', '保険', '自費', 'オプション', '合計', '支払い方法', '支払い詳細', '売掛フラグ', '売掛金額'];
    const rows = reservations
      .filter(r => r.checkout)
      .sort((a, b) => {
        const dateA = a.date + (a.startTime || '00:00');
        const dateB = b.date + (b.startTime || '00:00');
        return dateA.localeCompare(dateB);
      })
      .map(r => {
        const c = r.checkout!;
        const date = c.clearedAt.toDate();
        const dateStr = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
        const timeStr = `${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`;
        
        return [
          clinicTitle,
          dateStr,
          timeStr,
          r.patientName || '未設定',
          r.staffId || '',
          r.staffName || '未設定',
          Number(c.amounts.insuranceAmount || 0),
          Number(c.amounts.selfPayAmount || 0),
          Number(c.amounts.optionAmount || 0),
          Number(c.amounts.totalAmount || 0),
          formatPaymentTypeCSV(c.payment.paymentMethodType),
          c.payment.paymentMethodDetail || '',
          c.receivable.isReceivable ? 'あり' : '',
          Number(c.receivable.receivableAmount || 0)
        ].join(',');
      });

    const csvContent = [header.join(','), ...rows].join('\n');
    const safeClinicName = sanitizeFileName(clinicTitle);
    const fileName = rows.length === 1 && reservations.length > 0
      ? `${safeClinicName}_detail_${startDate}.csv`
      : `${safeClinicName}_detail_${startDate}_to_${endDate}.csv`;
    
    downloadCSV(fileName, csvContent);
  };

  // ② 税理士用集計CSV出力
  const generateTaxCSV = () => {
    if (startDate > endDate) {
      alert('開始日が終了日より後の日付になっています。');
      return;
    }

    const clinicTitle = clinic?.name || 'clinic';
    const header = ['clinic名', '日付', '総売上', '保険（非課税）', '自費（課税）', 'オプション（課税）', '現金', 'カード', '電子マネー', 'その他', '売掛'];
    
    // 日次で集計
    const dailyData: Record<string, any> = {};
    
    reservations.forEach(r => {
      if (!r.checkout) return;
      const c = r.checkout;
      const d = c.clearedAt.toDate();
      const dKey = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
      
      if (!dailyData[dKey]) {
        dailyData[dKey] = { total: 0, ins: 0, self: 0, opt: 0, cash: 0, card: 0, emoney: 0, other: 0, receivable: 0 };
      }
      
      const row = dailyData[dKey];
      row.total += Number(c.amounts.totalAmount || 0);
      row.ins += Number(c.amounts.insuranceAmount || 0);
      row.self += Number(c.amounts.selfPayAmount || 0);
      row.opt += Number(c.amounts.optionAmount || 0);
      
      const type = c.payment.paymentMethodType;
      if (type === 'cash') row.cash += Number(c.amounts.totalAmount || 0);
      else if (type === 'card') row.card += Number(c.amounts.totalAmount || 0);
      else if (type === 'emoney') row.emoney += Number(c.amounts.totalAmount || 0);
      else row.other += Number(c.amounts.totalAmount || 0);
      
      if (c.receivable.isReceivable) {
        row.receivable += Number(c.receivable.receivableAmount || 0);
      }
    });

    const rows = Object.entries(dailyData)
      .sort((a, b) => a[0].localeCompare(b[0]))
      .map(([date, data]) => {
        return [
          clinicTitle,
          date,
          data.total,
          data.ins,
          data.self,
          data.opt,
          data.cash,
          data.card,
          data.emoney,
          data.other,
          data.receivable
        ].join(',');
      });

    const csvContent = [header.join(','), ...rows].join('\n');
    const safeClinicName = sanitizeFileName(clinicTitle);
    const monthPart = startDate.substring(0, 7);
    const fileName = `${safeClinicName}_tax_${monthPart}.csv`;
    
    downloadCSV(fileName, csvContent);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-20">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-10 pb-20 print:space-y-6 print:pb-0">
      {/* Header & Controls */}
      <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-6 print:hidden">
        <div>
          <h1 className="text-3xl font-black text-stone-800 tracking-tighter flex items-center gap-2">
            <BarChart3 className="text-emerald-600" size={32} /> 管理集計ボード
          </h1>
          <p className="text-stone-500 font-bold mt-1">売上、支払い状況、経営指標のリアルタイム集計</p>
        </div>

        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 p-4 bg-white border border-stone-200 rounded-3xl shadow-sm">
          <div className="flex items-center gap-2">
            <div className="flex flex-col">
              <span className="text-[10px] font-black text-stone-400 uppercase ml-1">From</span>
              <input 
                type="date" 
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl font-bold text-stone-700 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
              />
            </div>
            <span className="mt-4 text-stone-300">〜</span>
            <div className="flex flex-col">
              <span className="text-[10px] font-black text-stone-400 uppercase ml-1">To</span>
              <input 
                type="date" 
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl font-bold text-stone-700 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
              />
            </div>
          </div>
          <div className="h-10 w-[1px] bg-stone-100 hidden sm:block"></div>
          <div className="flex items-center gap-2">
            <button 
              onClick={generateDetailCSV}
              className="flex items-center gap-2 px-4 py-2.5 bg-white border border-stone-200 text-stone-700 font-black text-xs rounded-xl hover:bg-stone-50 transition-all active:scale-95 shadow-sm"
              title="詳細CSV出力"
            >
              <FileDown size={16} /> 詳細CSV
            </button>
            <button 
              onClick={generateTaxCSV}
              className="flex items-center gap-2 px-4 py-2.5 bg-white border border-stone-200 text-stone-700 font-black text-xs rounded-xl hover:bg-stone-50 transition-all active:scale-95 shadow-sm"
              title="税理士用CSV出力"
            >
              <FileSpreadsheet size={16} /> 税理士用CSV
            </button>
            <button 
              onClick={handlePrint}
              className="flex items-center gap-2 px-4 py-2.5 bg-emerald-600 border border-emerald-600 text-white font-black text-xs rounded-xl hover:bg-emerald-700 transition-all shadow-md active:scale-95"
            >
              <Printer size={16} /> 日計表を印刷
            </button>
          </div>
        </div>
      </div>

      {/* --- Section 1: Daily Summary (日計表) --- */}
      <section className="space-y-6">
        <div className="flex items-center gap-2 px-2">
          <div className="w-1.5 h-6 bg-emerald-500 rounded-full"></div>
          <h2 className="text-xl font-black text-stone-800 uppercase tracking-widest">本日 ({todayStr.replace(/-/g, '/')}) の集計</h2>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Main Total Card */}
          <div className="lg:col-span-2 bg-gradient-to-br from-stone-800 to-stone-900 p-8 rounded-[2.5rem] text-white shadow-xl relative overflow-hidden group">
            <div className="absolute -right-10 -top-10 w-40 h-40 bg-white/5 rounded-full blur-3xl group-hover:bg-emerald-500/10 transition-all duration-700"></div>
            <div className="relative z-10">
              <div className="flex items-center justify-between mb-2">
                <span className="text-stone-400 font-black text-xs uppercase tracking-[0.2em]">Total Revenue / 本日総売上</span>
                <TrendingUp size={24} className="text-emerald-400" />
              </div>
              <div className="flex items-baseline gap-2">
                <span className="text-5xl font-black tracking-tighter">{formatYen(dailyStats.total).replace('¥', '')}</span>
                <span className="text-xl font-bold text-stone-400">円</span>
              </div>
              
              <div className="mt-8 grid grid-cols-3 gap-6 pt-8 border-t border-white/10">
                <div>
                  <div className="text-[10px] font-black text-stone-500 uppercase mb-1">Insurance / 保険</div>
                  <div className="font-black text-lg">{formatYen(dailyStats.insurance)}</div>
                </div>
                <div>
                  <div className="text-[10px] font-black text-stone-500 uppercase mb-1">Self-Pay / 自費</div>
                  <div className="font-black text-lg">{formatYen(dailyStats.selfPay)}</div>
                </div>
                <div>
                  <div className="text-[10px] font-black text-stone-500 uppercase mb-1">Options / オプション</div>
                  <div className="font-black text-lg">{formatYen(dailyStats.option)}</div>
                </div>
              </div>
            </div>
          </div>

          {/* Visit Count & AR Card */}
          <div className="space-y-6">
            <div className="bg-white p-6 rounded-[2rem] border border-stone-200 shadow-sm">
              <div className="flex items-center justify-between mb-1">
                <span className="text-[10px] font-black text-stone-400 uppercase">Visits / 来院数</span>
                <Users size={18} className="text-blue-500" />
              </div>
              <div className="flex items-baseline gap-1">
                <span className="text-3xl font-black text-stone-800">{dailyStats.count}</span>
                <span className="text-sm font-bold text-stone-500">名</span>
              </div>
            </div>
            <div className={`p-6 rounded-[2rem] border transition-all ${dailyStats.receivableCount > 0 ? 'bg-red-50 border-red-200' : 'bg-white border-stone-200'}`}>
              <div className="flex items-center justify-between mb-1">
                <span className={`text-[10px] font-black uppercase ${dailyStats.receivableCount > 0 ? 'text-red-600' : 'text-stone-400'}`}>Accounts Receivable / 売掛</span>
                <AlertCircle size={18} className={dailyStats.receivableCount > 0 ? 'text-red-500' : 'text-stone-300'} />
              </div>
              <div className="flex items-baseline gap-1">
                <span className={`text-3xl font-black ${dailyStats.receivableCount > 0 ? 'text-red-600' : 'text-stone-800'}`}>{formatYen(dailyStats.payments.receivable)}</span>
              </div>
              <div className={`text-xs font-bold mt-1 ${dailyStats.receivableCount > 0 ? 'text-red-500' : 'text-stone-400'}`}>
                件数: {dailyStats.receivableCount}件
              </div>
            </div>
          </div>

          {/* Payment Breakdown Card */}
          <div className="bg-white p-6 rounded-[2rem] border border-stone-200 shadow-sm">
            <h3 className="text-[10px] font-black text-stone-400 uppercase mb-4 tracking-widest">Payment Breakdown / 支払い内訳</h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-emerald-100 flex items-center justify-center text-emerald-700"><Banknote size={16} /></div>
                  <span className="text-xs font-bold text-stone-700">現金</span>
                </div>
                <span className="text-sm font-black">{formatYen(dailyStats.payments.cash)}</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-blue-100 flex items-center justify-center text-blue-700"><CreditCard size={16} /></div>
                  <span className="text-xs font-bold text-stone-700">カード</span>
                </div>
                <span className="text-sm font-black">{formatYen(dailyStats.payments.card)}</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-purple-100 flex items-center justify-center text-purple-700"><Wallet size={16} /></div>
                  <span className="text-xs font-bold text-stone-700">電子マネー</span>
                </div>
                <span className="text-sm font-black">{formatYen(dailyStats.payments.emoney)}</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-stone-100 flex items-center justify-center text-stone-700"><MoreHorizontal size={16} /></div>
                  <span className="text-xs font-bold text-stone-700">その他</span>
                </div>
                <span className="text-sm font-black">{formatYen(dailyStats.payments.other)}</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* --- Section 2: Aggregation Period (集計レポート) --- */}
      <section className="space-y-6">
        <div className="flex items-center justify-between px-2">
          <div className="flex items-center gap-2">
            <div className="w-1.5 h-6 bg-blue-500 rounded-full"></div>
            <h2 className="text-xl font-black text-stone-800 uppercase tracking-widest">期間集計レポート</h2>
          </div>
          <div className="text-xs font-bold text-stone-500 bg-white px-4 py-2 rounded-full border border-stone-100 shadow-sm">
            {startDate.replace(/-/g, '/')} 〜 {endDate.replace(/-/g, '/')}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
          <div className="bg-white p-6 rounded-3xl border border-stone-200 shadow-sm flex flex-col justify-between">
            <span className="text-[10px] font-black text-stone-400 uppercase">Monthly Total / 月間総売上</span>
            <div className="flex items-baseline gap-1 mt-1">
              <span className="text-2xl font-black text-stone-800">{formatYen(monthlyStats.total)}</span>
            </div>
          </div>
          <div className="bg-white p-6 rounded-3xl border border-stone-200 shadow-sm flex flex-col justify-between">
            <span className="text-[10px] font-black text-stone-400 uppercase">Insurance / 保険合計</span>
            <div className="flex items-baseline gap-1 mt-1">
              <span className="text-2xl font-black text-stone-800">{formatYen(monthlyStats.insurance)}</span>
            </div>
          </div>
          <div className="bg-white p-6 rounded-3xl border border-stone-200 shadow-sm flex flex-col justify-between">
            <span className="text-[10px] font-black text-stone-400 uppercase">Self-Pay / 自費合計</span>
            <div className="flex items-baseline gap-1 mt-1">
              <span className="text-2xl font-black text-stone-800">{formatYen(monthlyStats.selfPay)}</span>
            </div>
          </div>
          <div className="bg-white p-6 rounded-3xl border border-stone-200 shadow-sm flex flex-col justify-between">
            <span className="text-[10px] font-black text-stone-400 uppercase">Options / オプション合計</span>
            <div className="flex items-baseline gap-1 mt-1">
              <span className="text-2xl font-black text-stone-800">{formatYen(monthlyStats.option)}</span>
            </div>
          </div>
          <div className="bg-white p-6 rounded-3xl border border-stone-200 shadow-sm flex flex-col justify-between">
            <span className="text-[10px] font-black text-stone-400 uppercase text-red-500">AR / 売掛合計</span>
            <div className="flex items-baseline gap-1 mt-1">
              <span className="text-2xl font-black text-red-600">{formatYen(monthlyStats.receivable)}</span>
            </div>
          </div>
        </div>

        {/* Daily List */}
        <div className="bg-white rounded-[2.5rem] border border-stone-200 shadow-sm overflow-hidden">
          <div className="px-8 py-6 border-b border-stone-100 flex items-center justify-between bg-stone-50/50">
            <h3 className="font-black text-stone-800 flex items-center gap-2 uppercase tracking-widest text-sm">
              <TrendingUp size={18} className="text-emerald-500" /> 期間内売上推移
            </h3>
            <span className="text-xs font-bold text-stone-500 uppercase tracking-widest">日別リスト</span>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-7 divide-x divide-y divide-stone-100">
            {Object.entries(monthlyStats.dailyList)
              .sort((a,b) => a[0].localeCompare(b[0]))
              .map(([day, amount]) => (
              <div key={day} className="p-6 hover:bg-stone-50 transition-colors">
                <div className="text-[10px] font-black text-stone-400 uppercase mb-1">{day}</div>
                <div className="text-lg font-black text-stone-800 leading-none">{formatYen(amount).replace('¥', '')}<span className="text-[10px] ml-0.5 font-bold">円</span></div>
              </div>
            ))}
            {Object.keys(monthlyStats.dailyList).length === 0 && (
              <div className="col-span-full py-20 text-center text-stone-400 font-bold">抽出データがありません</div>
            )}
          </div>
        </div>
      </section>

      {/* --- Section 3: Payment Breakdown (支払い方法別) --- */}
      <section className="space-y-6">
        <div className="flex items-center gap-2 px-2">
          <div className="w-1.5 h-6 bg-purple-500 rounded-full"></div>
          <h2 className="text-xl font-black text-stone-800 uppercase tracking-widest">支払い方法別集計</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* By Type */}
          <div className="bg-white p-8 rounded-[2.5rem] border border-stone-200 shadow-sm">
            <h3 className="font-black text-stone-800 mb-6 flex items-center gap-2 text-sm uppercase tracking-widest">
              <Receipt size={18} className="text-purple-500" /> タイプ別集計
            </h3>
            <div className="space-y-4">
              {paymentMethodStats.sortedTypes.map(([type, amount]) => (
                <div key={type} className="group">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-black text-stone-700">{getTypeName(type)}</span>
                    <span className="text-sm font-black text-stone-800">{formatYen(amount)}</span>
                  </div>
                  <div className="h-2 bg-stone-100 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-purple-500 transition-all duration-1000 ease-out"
                      style={{ width: `${(amount / monthlyStats.total) * 100}%` }}
                    ></div>
                  </div>
                </div>
              ))}
              {paymentMethodStats.sortedTypes.length === 0 && (
                <div className="text-center py-10 text-stone-400 font-bold">なし</div>
              )}
            </div>
          </div>

          {/* By Detail */}
          <div className="bg-white p-8 rounded-[2.5rem] border border-stone-200 shadow-sm">
            <h3 className="font-black text-stone-800 mb-6 flex items-center gap-2 text-sm uppercase tracking-widest">
              <ArrowUpRight size={18} className="text-blue-500" /> 詳細別（上位）
            </h3>
            <div className="space-y-4">
              {paymentMethodStats.sortedDetails.slice(0, 10).map(([detail, amount]) => (
                <div key={detail} className="flex items-center justify-between p-4 bg-stone-50 rounded-2xl border border-stone-100 hover:bg-white hover:shadow-md transition-all">
                  <span className="text-xs font-black text-stone-600">{detail}</span>
                  <span className="text-sm font-black text-stone-800">{formatYen(amount)}</span>
                </div>
              ))}
              {paymentMethodStats.sortedDetails.length === 0 && (
                <div className="text-center py-10 text-stone-400 font-bold">なし</div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* --- Section 4: Staff Rankings (スタッフ別ランキング) --- */}
      <section className="space-y-6">
        <div className="flex items-center gap-2 px-2">
          <div className="w-1.5 h-6 bg-emerald-600 rounded-full"></div>
          <h2 className="text-xl font-black text-stone-800 uppercase tracking-widest">スタッフ別ランキング</h2>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Total Revenue Ranking */}
          <div className="bg-white p-8 rounded-[2.5rem] border border-stone-200 shadow-sm relative overflow-hidden">
            <div className="absolute top-0 right-0 p-8 opacity-5">
              <TrendingUp size={120} className="text-emerald-900" />
            </div>
            
            <h3 className="font-black text-stone-800 mb-8 flex items-center justify-between relative z-10">
              <div className="flex items-center gap-2 text-sm uppercase tracking-widest">
                <BarChart3 size={18} className="text-emerald-600" /> 総売上ランキング
              </div>
              <span className="text-[10px] font-bold text-stone-400">Total Revenue Ranking</span>
            </h3>

            <div className="space-y-3 relative z-10">
              {staffStats.totalRanking.length > 0 ? (
                staffStats.totalRanking.map((staff, index) => (
                  <div 
                    key={staff.id} 
                    className={`flex items-center justify-between p-5 rounded-2xl transition-all border ${
                      index === 0 ? 'bg-emerald-50/50 border-emerald-100 shadow-sm' : 'bg-stone-50/50 border-stone-100'
                    }`}
                  >
                    <div className="flex items-center gap-4">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center font-black text-sm italic ${
                        index === 0 ? 'bg-amber-400 text-amber-900 ring-4 ring-amber-100' :
                        index === 1 ? 'bg-stone-300 text-stone-700' :
                        index === 2 ? 'bg-orange-300 text-orange-900' :
                        'bg-stone-100 text-stone-400'
                      }`}>
                        {index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : index + 1}
                      </div>
                      <div>
                        <div className="text-sm font-black text-stone-800">{staff.name}</div>
                        <div className="text-[10px] font-bold text-stone-400">{staff.count}件</div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className={`text-lg font-black tracking-tight ${index === 0 ? 'text-emerald-700' : 'text-stone-800'}`}>
                        {formatYen(staff.total)}
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="py-20 text-center text-stone-400 font-bold">データがありません</div>
              )}
            </div>
          </div>

          {/* Self-Pay Revenue Ranking */}
          <div className="bg-white p-8 rounded-[2.5rem] border border-stone-200 shadow-sm relative overflow-hidden">
            <div className="absolute top-0 right-0 p-8 opacity-5">
              <Wallet size={120} className="text-blue-900" />
            </div>

            <h3 className="font-black text-stone-800 mb-8 flex items-center justify-between relative z-10">
              <div className="flex items-center gap-2 text-sm uppercase tracking-widest">
                <TrendingUp size={18} className="text-blue-600" /> 自費売上ランキング
              </div>
              <span className="text-[10px] font-bold text-stone-400">Self-Pay Ranking</span>
            </h3>

            <div className="space-y-3 relative z-10">
              {staffStats.selfPayRanking.length > 0 ? (
                staffStats.selfPayRanking.map((staff, index) => (
                  <div 
                    key={staff.id} 
                    className={`flex items-center justify-between p-5 rounded-2xl transition-all border ${
                      index === 0 ? 'bg-blue-50/50 border-blue-100 shadow-sm' : 'bg-stone-50/50 border-stone-100'
                    }`}
                  >
                    <div className="flex items-center gap-4">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center font-black text-sm italic ${
                        index === 0 ? 'bg-amber-400 text-amber-900 ring-4 ring-amber-100' :
                        index === 1 ? 'bg-stone-300 text-stone-700' :
                        index === 2 ? 'bg-orange-300 text-orange-900' :
                        'bg-stone-100 text-stone-400'
                      }`}>
                        {index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : index + 1}
                      </div>
                      <div>
                        <div className="text-sm font-black text-stone-800">{staff.name}</div>
                        <div className="text-[10px] font-bold text-stone-400">{staff.count}件</div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className={`text-lg font-black tracking-tight ${index === 0 ? 'text-blue-700' : 'text-stone-800'}`}>
                        {formatYen(staff.selfPay)}
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="py-20 text-center text-stone-400 font-bold">データがありません</div>
              )}
            </div>
          </div>
        </div>
      </section>

      <style dangerouslySetInnerHTML={{ __html: `
        @media print {
          /* 全体制御 */
          @page { size: A4 portrait; margin: 15mm; }
          body { background: white !important; font-family: sans-serif; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
          .max-w-6xl { max-width: 100% !important; margin: 0 !important; width: 100% !important; padding: 0 !important; border: none !important; }
          
          /* 非表示設定 */
          aside, header, nav, .print\\:hidden, #app-header, .md\\:flex { display: none !important; }
          
          /* 表示設定 */
          #print-report { display: block !important; visibility: visible !important; }
          
          /* レイアウト調整 */
          main { overflow: visible !important; height: auto !important; padding: 0 !important; }
        }
      `}} />

      {/* --- A4 Print Specific Layout --- */}
      <div id="print-report" className="hidden print:block p-2 bg-white text-stone-900 font-sans min-h-screen">
        {/* Print Header */}
        <div className="border-b-4 border-stone-800 pb-6 mb-12 flex justify-between items-end">
          <div>
            <div className="text-sm font-black text-stone-400 uppercase tracking-[0.2em] mb-1">{clinic?.name || 'クリニック'}</div>
            <h1 className="text-4xl font-black tracking-tighter text-stone-900">日計表 <span className="text-lg font-bold text-stone-400 ml-4">Daily Accounting Report</span></h1>
          </div>
          <div className="text-right">
            <div className="text-xs font-black text-stone-500 bg-stone-100 px-3 py-1 rounded-md inline-block mb-1">
              対象期間: {startDate === endDate ? startDate : `${startDate} 〜 ${endDate}`}
            </div>
            <div className="text-[10px] font-bold text-stone-400">出力: {new Date().toLocaleString('ja-JP')}</div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-16 mb-16">
          {/* Revenue Section */}
          <div className="space-y-6">
            <h3 className="text-sm font-black uppercase tracking-[0.2em] bg-stone-900 text-white px-4 py-2 flex justify-between items-center">
              <span>1. 売上サマリー</span>
              <span className="text-[10px] font-normal opacity-70">Revenue Summary</span>
            </h3>
            <div className="space-y-4 px-2">
              <div className="flex justify-between items-end border-b-2 border-stone-100 pb-4">
                <span className="text-lg font-black text-stone-500">総売上額</span>
                <span className="text-4xl font-black tabular-nums tracking-tighter">{printStats.total.toLocaleString()} <span className="text-lg font-bold">円</span></span>
              </div>
              <div className="grid grid-cols-1 gap-4 pt-4">
                <div className="flex justify-between items-center text-sm">
                  <span className="font-bold text-stone-400 italic">保険金額 (非課税)</span>
                  <span className="font-black tabular-nums">{printStats.insurance.toLocaleString()} 円</span>
                </div>
                <div className="flex justify-between items-center text-sm">
                  <span className="font-bold text-stone-400 italic">自費金額 (課税)</span>
                  <span className="font-black tabular-nums">{printStats.selfPay.toLocaleString()} 円</span>
                </div>
                <div className="flex justify-between items-center text-sm">
                  <span className="font-bold text-stone-400 italic">オプション (課税)</span>
                  <span className="font-black tabular-nums">{printStats.option.toLocaleString()} 円</span>
                </div>
              </div>
            </div>
          </div>

          {/* Payment breakdown */}
          <div className="space-y-6">
            <h3 className="text-sm font-black uppercase tracking-[0.2em] bg-stone-100 text-stone-800 px-4 py-2 border-l-4 border-stone-800 flex justify-between items-center">
              <span>2. 支払い内訳</span>
              <span className="text-[10px] font-normal opacity-50">Payment Breakdown</span>
            </h3>
            <div className="space-y-3 px-2">
              <div className="flex justify-between items-center py-2 border-b border-stone-100">
                <span className="text-xs font-black text-stone-500">現金</span>
                <span className="text-lg font-black tabular-nums">{printStats.cash.toLocaleString()} 円</span>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-stone-100">
                <span className="text-xs font-black text-stone-500">カード</span>
                <span className="text-lg font-black tabular-nums">{printStats.card.toLocaleString()} 円</span>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-stone-100">
                <span className="text-xs font-black text-stone-500">電子マネー</span>
                <span className="text-lg font-black tabular-nums">{printStats.emoney.toLocaleString()} 円</span>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-stone-100">
                <span className="text-xs font-black text-stone-500">その他</span>
                <span className="text-lg font-black tabular-nums">{printStats.other.toLocaleString()} 円</span>
              </div>
              <div className="flex justify-between items-center py-3 bg-red-50 px-2 rounded-lg mt-2">
                <span className="text-xs font-black text-red-700">売掛発生額</span>
                <span className="text-xl font-black tabular-nums text-red-700">{printStats.receivable.toLocaleString()} 円</span>
              </div>
            </div>
          </div>
        </div>

        <div className="border-t-2 border-stone-100 pt-16 grid grid-cols-2 gap-16 items-start">
           {/* Visits */}
           <div className="space-y-6">
            <h3 className="text-sm font-black uppercase tracking-[0.2em] bg-stone-100 text-stone-800 px-4 py-2 border-l-4 border-stone-400 flex justify-between items-center">
              <span>3. 件数サマリー</span>
              <span className="text-[10px] font-normal opacity-50">Count Analysis</span>
            </h3>
            <div className="flex gap-12 px-2">
              <div>
                <div className="text-[10px] font-black text-stone-400 uppercase mb-1">来院件数</div>
                <div className="text-3xl font-black tracking-tighter">{printStats.visitCount} <span className="text-sm">件</span></div>
              </div>
              <div>
                <div className="text-[10px] font-black text-stone-400 uppercase mb-1">売掛発生件数</div>
                <div className="text-3xl font-black tracking-tighter text-red-600">{printStats.receivableCount} <span className="text-sm">件</span></div>
              </div>
            </div>
           </div>

           {/* Memo or Stamp space */}
           <div className="h-40 border-2 border-dashed border-stone-200 rounded-3xl p-6 flex flex-col justify-end">
              <div className="text-[10px] font-black text-stone-300 uppercase italic">Verification Stamp / 確認印</div>
           </div>
        </div>

        {/* Print Footer */}
        <div className="fixed bottom-12 left-2 right-2 flex justify-between items-center text-[10px] font-black text-stone-300 uppercase tracking-[0.3em] border-t border-stone-100 pt-6">
          <div>Smart Ledger | {clinic?.name || 'Clinic'} Report System</div>
          <div>Report ID: {Math.random().toString(36).substring(2, 10).toUpperCase()}</div>
        </div>
      </div>
    </div>
  );
};

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useOutletContext, useNavigate } from 'react-router-dom';
import { db, handleFirestoreError, OperationType } from '../../firebase';
import { collection, query, where, onSnapshot, orderBy, Timestamp, doc, updateDoc } from 'firebase/firestore';
import { Clock, User, CheckCircle2, FileText, X, AlertCircle, ClipboardCheck, LayoutGrid, Maximize2, Monitor, AlertTriangle, Sparkles, ChevronRight, Info, QrCode, PenTool, Wifi, WifiOff, UserCheck } from 'lucide-react';
import { SimpleChartModal } from '../components/SimpleChartModal';
import { SimpleCheckoutModal } from '../components/SimpleCheckoutModal';
import { QRCodeSVG } from 'qrcode.react';
import { useFeatureFlags } from '../hooks/useFeatureFlags';
import { useNetworkStatus } from '../hooks/useNetworkStatus';
import { getJapaneseHolidayName } from '../../lib/holidayUtils';
import { formatPaymentTag } from '../lib/paymentUtils';

export const ReceptionBoard: React.FC = () => {
  const context = useOutletContext<any>() || {};
  const { clinicId, userProfile } = context;
  const flags = useFeatureFlags(clinicId);
  const navigate = useNavigate();
  const { isOnline, showBackOnline } = useNetworkStatus();
  
  const [reservations, setReservations] = useState<any[]>([]);
  const [staffs, setStaffs] = useState<any[]>([]);
  const [patients, setPatients] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [isSaving, setIsSaving] = useState(false);
  const [updatingResId, setUpdatingResId] = useState<string | null>(null);
  const [saveToast, setSaveToast] = useState<{ type: 'success' | 'error', message: string } | null>(null);
  const [showInitialGuide, setShowInitialGuide] = useState(false);

  // 会計・モーダル用ステート
  const [activePaymentRes, setActivePaymentRes] = useState<any | null>(null);
  const [checkoutConfirmData, setCheckoutConfirmData] = useState<{ res: any; issues: string[] } | null>(null);
  const [activeChartData, setActiveChartData] = useState<{res: any, patientName: string, staffName: string} | null>(null);
  const [activeQRRes, setActiveQRRes] = useState<any | null>(null);
  const [arrivalConfirmForQRRes, setArrivalConfirmForQRRes] = useState<any | null>(null);

  const [selectedStaffId, setSelectedStaffId] = useState<string>('all');

  const today = useMemo(() => {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
  }, []);

  // 担当者ごとのカラー決定関数（左ボーダー用）
  const getStaffColor = useCallback((staffName: string) => {
    if (staffName.includes('山田')) return 'border-l-blue-500';
    if (staffName.includes('佐藤')) return 'border-l-emerald-500';
    if (staffName.includes('田中')) return 'border-l-purple-500';
    if (staffName.includes('鈴木')) return 'border-l-orange-500';
    if (staffName.includes('高橋')) return 'border-l-rose-500';
    if (staffName.includes('渡辺')) return 'border-l-cyan-500';
    
    // その他は名前の文字コードから色を適当に割り当てる
    const colors = [
      'border-l-indigo-500', 'border-l-teal-500', 'border-l-fuchsia-500', 
      'border-l-amber-500', 'border-l-lime-500', 'border-l-sky-500'
    ];
    let hash = 0;
    for (let i = 0; i < staffName.length; i++) {
        hash = staffName.charCodeAt(i) + ((hash << 5) - hash);
    }
    return colors[Math.abs(hash) % colors.length];
  }, []);

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 60000);
    
    // 初回ガイド管理
    const hasSeenGuide = localStorage.getItem('smart_ledger_reception_guide_v1');
    if (!hasSeenGuide) {
      setShowInitialGuide(true);
    }

    return () => clearInterval(timer);
  }, []);

  // マスタ & 予約データ取得 (Reception.tsxと同じロジックを簡潔に)
  useEffect(() => {
    if (!clinicId) return;

    const unsubStaff = onSnapshot(query(collection(db, `clinics/${clinicId}/staff`), where('isActive', '==', true)), (s) => {
      setStaffs(s.docs.map(d => ({ id: d.id, ...d.data() })));
    });

    const unsubPatient = onSnapshot(collection(db, `clinics/${clinicId}/patients`), (s) => {
      setPatients(s.docs.map(d => ({ id: d.id, ...d.data() })));
    });

    const q = query(collection(db, `clinics/${clinicId}/reservations`), where('date', '==', today), orderBy('startTime', 'asc'));
    const unsubRes = onSnapshot(q, (s) => {
      setReservations(s.docs.map(d => ({ id: d.id, ...d.data() })));
      setLoading(false);
    });

    return () => { unsubStaff(); unsubPatient(); unsubRes(); };
  }, [clinicId, today]);

  const displayData = useMemo(() => {
    const staffMap = new Map(staffs.map(s => [s.id, s.name]));
    const patientDocMap = new Map(patients.map(p => [p.id, p.name]));
    const patientIdMap = new Map(patients.map(p => [p.patientId, p.name]));
    
    // 電話番号フォールバック用のマップ
    const patientPhoneMap = new Map(patients.map(p => [p.id, (p as any).phone || (p as any).phoneNumber || (p as any).tel || '']));
    const patientIdPhoneMap = new Map(patients.map(p => [p.patientId, (p as any).phone || (p as any).phoneNumber || (p as any).tel || '']));

    const currentTotalMinutes = currentTime.getHours() * 60 + currentTime.getMinutes();

    const items = reservations
      .map(res => {
        const patientName = res.patientName || 
          (res.patientDocId ? patientDocMap.get(res.patientDocId) : null) || 
          (res.patientId ? patientIdMap.get(res.patientId) : null) || 
          '未設定';
          
        const patientPhone = (res as any).phone || (res as any).phoneNumber || 
          (res.patientDocId ? patientPhoneMap.get(res.patientDocId) : null) || 
          (res.patientId ? patientIdPhoneMap.get(res.patientId) : null) || 
          '';

        const staffName = staffMap.get(res.staffId) || '未設定';
        // キャンセルされている場合は強制的に cancelled 状態として扱う
        const visitStatus = res.status === 'cancelled' ? 'cancelled' : (res.visitStatus || 'not_arrived');

        let isLate = false;
        if (visitStatus === 'not_arrived' && res.startTime) {
          const [h, m] = res.startTime.split(':').map(Number);
          if (currentTotalMinutes > (h * 60 + m)) isLate = true;
        }

        // 放置判定 (10分以上放置: 会計待ち または arrived)
        let isNeglected = false;
        if ((visitStatus === 'waiting_for_payment' || visitStatus === 'arrived') && res.updatedAt) {
          const updatedAt = res.updatedAt.toDate ? res.updatedAt.toDate() : new Date();
          const diffMs = currentTime.getTime() - updatedAt.getTime();
          if (diffMs > 10 * 60 * 1000) {
            isNeglected = true;
          }
        }

        return { res, patientName, patientPhone, staffName, visitStatus, isLate, isNeglected };
      });

    const activeItems = items.filter(i => i.visitStatus !== 'cancelled');
    const waitingForPayment = activeItems.filter(i => i.visitStatus === 'waiting_for_payment');
    const unreflected = activeItems.filter(i => i.visitStatus === 'arrived' && i.res.questionnaireStatus === 'submitted' && !i.res.questionnaireApplied);
    const uninterviewed = activeItems.filter(i => i.visitStatus === 'arrived' && i.res.questionnaireStatus !== 'submitted');

    // 軽い売上集計 (レセコン化に向けた土台)
    const sales = {
      total: 0,
      insurance: 0,
      privateSales: 0,
      option: 0,
      paymentBreakdown: {
        cash: 0,
        card: 0,
        e_money: 0,
        accounts_receivable: 0,
        other: 0
      },
      hasIncompleteCheckout: 0,
      receivableCount: 0,
      completedCount: 0
    };

    items.forEach(i => {
      if (i.visitStatus !== 'completed') return;
      
      sales.completedCount++;

      if (!i.res.checkout || !i.res.checkout.amounts) {
        sales.hasIncompleteCheckout++;
        return;
      }

      const amounts = i.res.checkout.amounts;
      const ins = Number(amounts.insuranceAmount || 0);
      const self = Number(amounts.selfPayAmount || 0);
      const opt = Number(amounts.optionAmount || 0);
      const t = Number(amounts.totalAmount || (ins + self + opt));

      sales.total += t;
      sales.insurance += ins;
      sales.privateSales += self;
      sales.option += opt;

      const method = i.res.checkout.payment?.paymentMethodType || 'other';
      if ((sales.paymentBreakdown as any)[method] !== undefined) {
        (sales.paymentBreakdown as any)[method] += t;
      } else {
        sales.paymentBreakdown.other += t;
      }

      if (i.res.checkout.receivable?.isReceivable) {
        sales.receivableCount++;
      }
    });

    // 運用スコア計算用
    const arrivedCount = activeItems.filter(i => i.visitStatus !== 'not_arrived').length;
    const submittedCount = activeItems.filter(i => i.res.questionnaireStatus === 'submitted').length;
    const appliedCount = activeItems.filter(i => i.res.questionnaireApplied).length;
    const qrUnusedCount = uninterviewed.length;

    // 優先患者の特定
    let priorityItem = null;
    if (waitingForPayment.length > 0) {
      priorityItem = waitingForPayment.find(i => i.isNeglected) || waitingForPayment[0];
    } else if (unreflected.length > 0) {
      priorityItem = unreflected[0];
    } else if (uninterviewed.length > 0) {
      priorityItem = uninterviewed[0];
    } else {
      const lateItems = activeItems.filter(i => i.isLate);
      if (lateItems.length > 0) priorityItem = lateItems[0];
    }

    return {
      allActiveItems: items.sort((a,b) => (a.res.startTime || '').localeCompare(b.res.startTime || '')),
      notArrived: items.filter(i => i.visitStatus === 'not_arrived').sort((a,b) => (a.res.startTime || '').localeCompare(b.res.startTime || '')),
      arrived: items.filter(i => i.visitStatus === 'arrived'),
      waitingForPayment,
      completed: items.filter(i => i.visitStatus === 'completed'),
      stats: {
        totalCount: activeItems.length,
        completedCount: items.filter(i => i.visitStatus === 'completed').length,
        neglectedCount: activeItems.filter(i => i.isNeglected).length,
        uninterviewedCount: uninterviewed.length,
        unreflectedCount: unreflected.length,
        waitingForPaymentCount: waitingForPayment.length,
        arrivedCount,
        submittedCount,
        appliedCount,
        qrUnusedCount,
        interviewRate: arrivedCount > 0 ? Math.round((submittedCount / arrivedCount) * 100) : 0,
        reflectionRate: submittedCount > 0 ? Math.round((appliedCount / submittedCount) * 100) : 0
      },
      sales,
      priorityItem
    };
  }, [reservations, staffs, patients, currentTime]);

  const handleStatusChange = useCallback(async (reservationId: string, newStatus: string) => {
    if (!clinicId || !reservationId || isSaving) return;
    setIsSaving(true);
    setUpdatingResId(reservationId);
    try {
      await updateDoc(doc(db, `clinics/${clinicId}/reservations`, reservationId), {
        visitStatus: newStatus,
        updatedAt: Timestamp.now(),
        lastEditedBy: userProfile?.displayName || userProfile?.uid || 'unknown',
        lastEditedAt: Timestamp.now()
      });
      setSaveToast({ type: 'success', message: '更新しました' });
      setTimeout(() => setSaveToast(null), 2000);
    } catch (e: any) {
      console.error('Status change error:', e);
      let msg = "保存に失敗しました";
      if (e.message?.includes('offline') || e.message?.includes('network')) {
        msg = "保存失敗：通信エラー";
      } else if (e.message?.includes('permission')) {
        msg = "保存失敗：権限エラー";
      }
      setSaveToast({ type: 'error', message: msg });
      setTimeout(() => setSaveToast(null), 3000);
      handleFirestoreError(e, OperationType.UPDATE, `clinics/${clinicId}/reservations/${reservationId}`);
    } finally {
      setIsSaving(false);
      setUpdatingResId(null);
    }
  }, [clinicId, isSaving, userProfile]);

  // 監査ログ追加ヘルパー
  const addAuditLog = useCallback(async (reservation: any, type: string, details?: string) => {
    if (!clinicId || !reservation.id) return;
    
    try {
      const now = Timestamp.now();
      const deviceId = typeof navigator !== 'undefined' ? (navigator.userAgent || 'unknown') : 'unknown';
      const userId = userProfile?.uid || 'unknown';
      
      const newLog = {
        type,
        timestamp: now,
        deviceId,
        userId,
        details: details || ''
      };

      // 予約ドメインの監査ログ（最新50件）
      const prevLogs = reservation.auditLogs || [];
      const nextLogs = [newLog, ...prevLogs].slice(0, 50);

      await updateDoc(doc(db, `clinics/${clinicId}/reservations`, reservation.id), {
        auditLogs: nextLogs,
        updatedAt: now
      });
    } catch (err) {
      console.error("Failed to add audit log:", err);
    }
  }, [clinicId, userProfile?.uid]);

  const handleOpenQR = useCallback(async (res: any, skipConfirm = false) => {
    if (!clinicId || !res.id) return;
    
    // 来院前なら確認を出す
    if (res.visitStatus === 'not_arrived' && !skipConfirm) {
      setArrivalConfirmForQRRes(res);
      return;
    }

    // アクセストークンがない場合は生成
    if (!res.accessToken) {
      const token = Math.random().toString(36).substring(2, 10);
      await updateDoc(doc(db, `clinics/${clinicId}/reservations`, res.id), {
        accessToken: token
      });
      res.accessToken = token;
    }

    // 監査ログ記録
    await addAuditLog(res, 'qr_shown', '受付ボードからQRを表示しました');
    
    setActiveQRRes(res);
  }, [clinicId, addAuditLog]);

  if (loading) return (
    <div className="fixed inset-0 bg-[#1f1a17] flex items-center justify-center">
      <div className="flex flex-col items-center gap-4">
        <Monitor size={56} className="text-amber-500 animate-pulse" />
        <div className="text-amber-500/80 font-black tracking-widest uppercase text-xs">Connecting to Smart Ledger...</div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#1f1a17] flex flex-col h-screen overflow-hidden antialiased relative">
      {/* ネットワーク状態バー */}
      {!isOnline && (
        <div className="bg-amber-500 text-white px-4 py-1.5 flex items-center justify-center gap-2 text-[11px] font-bold z-[60] animate-in slide-in-from-top duration-300">
          <WifiOff size={14} className="animate-pulse" />
          <span>オフラインです。保存にご注意ください</span>
        </div>
      )}

      {showBackOnline && (
        <div className="bg-emerald-500 text-white px-4 py-1.5 flex items-center justify-center gap-2 text-[11px] font-bold z-[60] animate-in fade-in duration-300">
          <Wifi size={14} />
          <span>オンラインに復帰しました</span>
        </div>
      )}

      {/* トースト通知 */}
      {saveToast && (
        <div className="fixed top-20 right-6 z-[100] animate-in slide-in-from-right duration-300">
          <div className={`px-4 py-2 rounded-xl shadow-2xl flex items-center gap-2 border font-bold text-xs ${
            saveToast.type === 'success' ? 'bg-emerald-500 text-white border-emerald-400' : 'bg-rose-500 text-white border-rose-400'
          }`}>
            {saveToast.type === 'success' ? <CheckCircle2 size={14} /> : <AlertCircle size={14} />}
            {saveToast.message}
          </div>
        </div>
      )}

      {/* 軽い経営表示 (判断補助) */}
      <div className="bg-stone-900 border-b border-stone-800 px-6 py-3 flex flex-wrap items-center justify-between gap-6 z-30 shadow-2xl relative">
        {(() => {
          const { uninterviewedCount, unreflectedCount, waitingForPaymentCount, totalCount, completedCount, neglectedCount } = displayData.stats;
          const counts = [
            { type: 'uninterviewed', val: uninterviewedCount },
            { type: 'unreflected', val: unreflectedCount },
            { type: 'waiting', val: waitingForPaymentCount }
          ];
          const maxCount = Math.max(...counts.map(c => c.val));
          
          let statusMsg = '順調です';
          let statusColor = 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20';
          if (waitingForPaymentCount > 4) {
            statusMsg = '会計が混み始めています';
            statusColor = 'text-amber-400 bg-amber-500/10 border-amber-500/20';
          } else if (unreflectedCount > 4) {
            statusMsg = 'カルテが詰まっています';
            statusColor = 'text-amber-400 bg-amber-500/10 border-amber-500/20';
          } else if (uninterviewedCount > 4) {
            statusMsg = '問診入力が遅れています';
            statusColor = 'text-amber-400 bg-amber-500/10 border-amber-500/20';
          }

          const progressPercent = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;
          
          // 支払い割合計算
          const tSales = displayData.sales.total > 0 ? displayData.sales.total : 1;
          const cashP = Math.round((displayData.sales.paymentBreakdown.cash / tSales) * 100);
          const cardP = Math.round((displayData.sales.paymentBreakdown.card / tSales) * 100);
          const emoneyP = Math.round((displayData.sales.paymentBreakdown.e_money / tSales) * 100);

          return (
            <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between w-full gap-4">
              <div className="flex items-center gap-6 w-full overflow-x-auto no-scrollbar">
                {/* 1. 状態メッセージ */}
                <div className={`px-3 py-1 rounded border text-[10px] font-black shrink-0 ${statusColor}`}>
                  {statusMsg}
                </div>

                <div className="h-4 w-px bg-stone-800 shrink-0"></div>

                {/* 2. 進行状況バー */}
                <div className="flex items-center gap-3 shrink-0">
                  <div className="text-[10px] font-black text-stone-500 shrink-0">
                    本日の進捗 <span className="text-stone-300 ml-1">{completedCount} / {totalCount}</span>
                  </div>
                  <div className="h-1.5 w-24 bg-stone-800 rounded-full overflow-hidden flex">
                    <div className="h-full bg-emerald-500 rounded-full transition-all duration-500" style={{ width: `${progressPercent}%` }}></div>
                  </div>
                </div>

                <div className="h-4 w-px bg-stone-800 shrink-0"></div>

                {/* 3. ボトルネック可視化 */}
                <div className="flex items-center gap-4 shrink-0">
                  <div className={`flex items-center gap-1.5 px-2 py-0.5 rounded transition-all ${maxCount > 0 && maxCount === uninterviewedCount ? 'bg-stone-700/50 outline outline-1 outline-stone-600' : ''}`}>
                    <span className="text-[9px] font-black text-stone-500 uppercase">未問診</span>
                    <span className={`text-sm font-black transition-colors ${uninterviewedCount > 0 ? 'text-stone-400' : 'text-stone-700'}`}>{uninterviewedCount}</span>
                  </div>
                  <div className={`flex items-center gap-1.5 px-2 py-0.5 rounded transition-all ${maxCount > 0 && maxCount === unreflectedCount ? 'bg-yellow-500/20 outline outline-1 outline-yellow-500/40 animate-pulse' : ''}`}>
                    <span className="text-[9px] font-black text-stone-500 uppercase">未反映</span>
                    <span className={`text-sm font-black transition-colors ${unreflectedCount > 0 ? 'text-yellow-500' : 'text-stone-700'}`}>{unreflectedCount}</span>
                  </div>
                  <div className={`flex items-center gap-1.5 px-2 py-0.5 rounded transition-all ${maxCount > 0 && maxCount === waitingForPaymentCount ? 'bg-red-500/20 outline outline-1 outline-red-500/40 animate-pulse' : ''}`}>
                    <span className="text-[9px] font-black text-stone-500 uppercase">会計待ち</span>
                    <span className={`text-sm font-black transition-colors ${waitingForPaymentCount > 0 ? 'text-red-500' : 'text-stone-700'}`}>{waitingForPaymentCount}</span>
                  </div>
                </div>

                {/* 4. 放置アラート */}
                {neglectedCount > 0 && (
                  <>
                    <div className="h-4 w-px bg-stone-800 shrink-0"></div>
                    <div className="flex items-center gap-2 bg-orange-500/20 border border-orange-500/40 px-3 py-1 rounded text-orange-400 shrink-0">
                      <span className="text-[12px] animate-pulse">⚠</span>
                      <span className="text-[10px] font-black">
                        放置あり（{neglectedCount}件）
                      </span>
                    </div>
                  </>
                )}
              </div>

              {/* 5. 売上ライト表示 (レセコン化の布石) */}
              {displayData.sales.completedCount > 0 && (
                <div className="flex flex-col lg:flex-row items-start lg:items-center gap-4 shrink-0 bg-stone-800/50 p-1.5 px-4 rounded-xl border border-stone-700">
                  <div className="flex items-center gap-4 border-r border-stone-700 pr-4">
                    <div className="flex flex-col">
                      <div className="flex items-center gap-2 mb-0.5">
                        <span className="text-[8px] font-black text-stone-500 uppercase tracking-widest leading-none">本日売上</span>
                        {(() => {
                          const total = displayData.sales.total;
                          let label = '普通';
                          let color = 'text-stone-400';
                          if (total > 150000) { label = '順調です'; color = 'text-emerald-400'; }
                          else if (total < 50000) { label = '売上が低めです'; color = 'text-rose-400'; }
                          return <span className={`text-[8px] font-bold ${color}`}>{label}</span>;
                        })()}
                      </div>
                      <span className="text-xl font-black text-emerald-400 leading-none">¥{displayData.sales.total.toLocaleString()}</span>
                    </div>
                    <div className="flex flex-col gap-0.5">
                      <span className="text-[9px] font-bold text-stone-300 leading-none">保 ¥{displayData.sales.insurance.toLocaleString()}</span>
                      <span className="text-[9px] font-bold text-stone-300 leading-none">自 ¥{(displayData.sales.privateSales + displayData.sales.option).toLocaleString()}</span>
                    </div>
                  </div>

                  <div className="flex flex-col lg:flex-row items-start lg:items-center gap-4">
                    {/* リスク表示 */}
                    {(displayData.sales.receivableCount > 0 || displayData.sales.hasIncompleteCheckout > 0 || waitingForPaymentCount > 0) && (
                      <div className="flex flex-wrap gap-2">
                        {displayData.sales.receivableCount > 0 && (
                          <span className="text-[9px] font-black bg-stone-700 text-orange-400 px-1.5 py-0.5 rounded">売掛あり ({displayData.sales.receivableCount}件)</span>
                        )}
                        {displayData.sales.hasIncompleteCheckout > 0 && (
                          <span className="text-[9px] font-black bg-rose-500/20 text-rose-400 px-1.5 py-0.5 rounded">⚠ 会計未入力あり</span>
                        )}
                        {waitingForPaymentCount > 0 && (
                          <span className="text-[9px] font-black text-amber-500/80">会計待ちあり</span>
                        )}
                      </div>
                    )}

                    <div className="flex flex-col justify-end w-32">
                      <div className="flex justify-between text-[8px] font-bold text-stone-400 leading-none mb-1">
                        <span>現金 {cashP}%</span>
                        <span>Card {cardP}%</span>
                      </div>
                      <div className="h-1 w-full bg-stone-800 rounded-full flex overflow-hidden">
                        <div style={{ width: `${cashP}%` }} className="h-full bg-emerald-500/60"></div>
                        <div style={{ width: `${cardP}%` }} className="h-full bg-blue-500/60"></div>
                        <div style={{ width: `${emoneyP}%` }} className="h-full bg-purple-500/60"></div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          );
        })()}
      </div>



      {/* Fixed Sticky Header for Board */}
      <header className="bg-[#1f1a17] border-b border-stone-800 p-4 px-6 flex justify-between items-center shrink-0 shadow-xl z-20">
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-teal-600 flex items-center justify-center shadow-md shadow-teal-900/40">
              <LayoutGrid size={24} className="text-white" />
            </div>
            <div>
              <h1 className="text-xl font-black tracking-tighter leading-none text-stone-100">RECEPTION BOARD</h1>
              <div className="text-[10px] font-black text-amber-500/80 uppercase tracking-[0.2em] mt-1">Smart Ledger / Real-time View</div>
            </div>
          </div>
          
          <div className="h-8 w-px bg-stone-800 mx-2 hidden md:block"></div>
          
          <div className="hidden md:flex items-center gap-4">
            <div className="flex flex-col">
              <span className="text-[10px] font-black text-stone-500 uppercase">Today's Date</span>
              <span className="text-sm font-black text-stone-200">{today}</span>
            </div>
            {getJapaneseHolidayName(today) && (
              <span className="px-2 py-1 bg-amber-600/20 text-amber-500 border border-amber-600/30 text-[10px] font-black rounded-lg shadow-sm">
                祝: {getJapaneseHolidayName(today)}
              </span>
            )}
          </div>
        </div>

        <div className="flex items-center gap-6">
          <div className="flex items-center gap-3 bg-stone-800/50 p-1.5 rounded-xl border border-stone-700 shadow-inner">
            <label className="text-[10px] font-black text-stone-500 pl-2 uppercase">担当:</label>
            <select 
              value={selectedStaffId} 
              onChange={e => setSelectedStaffId(e.target.value)}
              className="bg-stone-900 border border-stone-700 text-stone-200 text-xs font-bold rounded-lg py-1.5 px-3 pr-8 focus:outline-none focus:ring-2 focus:ring-amber-500/30 max-w-[140px] appearance-none"
              style={{ backgroundImage: `url("data:image/svg+xml;charset=UTF-8,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='%23857d77' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3e%3cpolyline points='6 9 12 15 18 9'%3e%3c/polyline%3e%3c/svg%3e")`, backgroundRepeat: 'no-repeat', backgroundPosition: 'right 0.5rem center', backgroundSize: '1em' }}
            >
              <option value="all">全員</option>
              <option value="unassigned">未設定</option>
              {staffs.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
            </select>
          </div>
          <div className="h-8 w-px bg-stone-800 hidden lg:block"></div>
          <div className="flex gap-4">
            <div className="flex flex-col items-end">
              <span className="text-[10px] font-black text-stone-500 uppercase">Wait for Pay</span>
              <span className={`text-xl font-black ${displayData.waitingForPayment.length > 0 ? 'text-amber-500' : 'text-stone-500'}`}>
                {displayData.waitingForPayment.length}<span className="text-xs ml-1 font-bold">名</span>
              </span>
            </div>
          </div>
          <button 
            onClick={() => window.close()}
            className="p-2 hover:bg-stone-800 rounded-full transition-colors text-stone-500 hover:text-stone-300"
            title="ボードを閉じる"
          >
            <X size={20} />
          </button>
        </div>
      </header>

      {/* List View (Sanshiro Style) */}
      <section className="flex-1 p-4 md:p-6 overflow-hidden flex flex-col items-center">
        <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden flex flex-col h-full w-full max-w-[1500px] shadow-[0_25px_50px_-12px_rgba(0,0,0,0.5)]">
          <div className="overflow-x-auto overflow-y-auto custom-scrollbar flex-1 bg-white">
            <table className="w-full text-left border-collapse min-w-[1100px]">
              <thead className="sticky top-0 bg-slate-50 border-b border-slate-200 z-10 shadow-sm">
                <tr>
                  <th className="py-4 px-6 text-[11px] text-slate-500 font-bold uppercase tracking-[0.1em] w-28">来院</th>
                  <th className="py-4 px-4 text-[11px] text-slate-500 font-bold uppercase tracking-[0.1em] w-24">時間</th>
                  <th className="py-4 px-4 text-[11px] text-slate-500 font-bold uppercase tracking-[0.1em] w-64">名前 / 問診状態</th>
                  <th className="py-4 px-4 text-[11px] text-slate-500 font-bold uppercase tracking-[0.1em] w-48 text-center">次にやる事</th>
                  <th className="py-4 px-4 text-[11px] text-slate-500 font-bold uppercase tracking-[0.1em] w-28 text-center">担当</th>
                  <th className="py-4 px-4 text-[11px] text-slate-500 font-bold uppercase tracking-[0.1em] w-36 text-center">電話番号</th>
                  <th className="py-4 px-4 text-[11px] text-slate-500 font-bold uppercase tracking-[0.1em] w-48">メニュー</th>
                  <th className="py-4 px-4 text-[11px] text-slate-500 font-bold uppercase tracking-[0.1em] w-32 text-center">カルテ</th>
                  <th className="py-4 px-4 text-[11px] text-slate-500 font-bold uppercase tracking-[0.1em] w-32 text-center">清算</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {displayData.allActiveItems
                 .filter(item => {
                    if (selectedStaffId === 'all') return true;
                    if (selectedStaffId === 'unassigned') return !item.res.staffId;
                    return item.res.staffId === selectedStaffId;
                 })
                 .map(({ res, patientName, patientPhone, staffName, visitStatus, isNeglected }) => {
                  let rowClasses = "transition-all duration-150 border-b border-slate-100 hover:bg-slate-50 relative ";
                  let leftBorderClass = "border-l-4 border-l-transparent "; 
                  
                  if (visitStatus === 'cancelled') {
                    rowClasses += "opacity-40 grayscale bg-slate-50 ";
                  } else if (visitStatus === 'completed') {
                    rowClasses += "opacity-50 bg-slate-50 grayscale-[0.3] ";
                  } else if (visitStatus === 'waiting_for_payment') {
                    rowClasses += isNeglected ? "bg-red-50/60 z-10 animate-pulse-gentle " : "bg-orange-50/20 z-10 ";
                    leftBorderClass = res.checkout?.receivable?.isReceivable 
                      ? "border-l-4 border-l-red-500 "
                      : isNeglected ? "border-l-4 border-l-red-600 " : "border-l-4 border-l-orange-400 ";
                  } else if (visitStatus === 'arrived') {
                    rowClasses += "bg-white ";
                    leftBorderClass = `border-l-4 ${getStaffColor(staffName)} `;
                  } else {
                    rowClasses += "bg-white ";
                    if (res.checkout?.receivable?.isReceivable) {
                      leftBorderClass = "border-l-4 border-l-red-500 ";
                    }
                  }
                  
                  return (
                    <tr key={res.id} className={rowClasses}>
                      {/* 来院 */}
                      <td className={`py-5 px-4 ${leftBorderClass}`}>
                        {visitStatus === 'cancelled' ? (
                          <span className="text-[10px] font-black text-slate-400 block text-center px-1 border border-slate-300 rounded bg-slate-100 uppercase">CANCEL</span>
                        ) : visitStatus === 'not_arrived' ? (
                          <button 
                            onClick={() => handleStatusChange(res.id, 'arrived')}
                            disabled={isSaving}
                            className={`w-full py-3 rounded-xl text-xs font-black active:scale-[0.97] transition-all text-center uppercase shadow-lg border-b-4 ${
                              updatingResId === res.id 
                                ? 'bg-stone-100 text-stone-400 border-stone-200' 
                                : 'bg-blue-600 text-white hover:bg-blue-700 border-blue-800 shadow-blue-600/20'
                            }`}
                          >
                            {updatingResId === res.id ? '処理中' : '来院受付'}
                          </button>
                        ) : visitStatus === 'waiting_for_payment' ? (
                          <span className="text-[10px] font-black text-orange-600 block text-center uppercase tracking-widest bg-orange-100 py-2 rounded-lg border border-orange-200">WAITING</span>
                        ) : (
                          <div className="flex flex-col items-center gap-1">
                            <span className="text-[10px] font-bold text-emerald-600 block text-center uppercase tracking-widest bg-emerald-50 px-2 py-1 rounded-md border border-emerald-100">ARRIVED</span>
                            <span className="text-[9px] text-stone-300 font-bold">来院済</span>
                          </div>
                        )}
                      </td>
                      {/* 時間 */}
                      <td className={`py-5 px-4 text-sm font-black ${visitStatus === 'cancelled' ? 'text-slate-400' : 'text-slate-700'}`}>
                        {res.startTime}
                      </td>
                      {/* 名前 / 問診状態 */}
                      <td className={`py-5 px-4 text-base font-bold truncate ${visitStatus === 'cancelled' ? 'text-slate-400' : 'text-slate-900'}`}>
                        <div className="flex flex-col gap-1">
                          <div className="flex items-center gap-2">
                            <span>{patientName || '---'}</span>
                            {res.checkout?.receivable?.isReceivable && (
                              <span className="bg-red-500 text-white text-[9px] font-bold px-1.5 py-0.5 rounded animate-pulse">売掛</span>
                            )}
                          </div>
                          <div className="flex items-center gap-1.5 mt-0.5">
                            {res.questionnaireStatus === 'submitted' ? (
                              res.questionnaireApplied ? (
                                <span className="text-[9px] font-bold text-emerald-600 flex items-center gap-0.5">
                                  <CheckCircle2 size={10} /> カルテ反映済
                                </span>
                              ) : (
                                <span className="text-[9px] font-bold text-blue-600 flex items-center gap-0.5">
                                  <Sparkles size={10} /> 問診済 (未反映)
                                </span>
                              )
                            ) : (
                              <div className="flex items-center gap-2">
                                <span className="text-[9px] font-bold text-stone-300 tracking-tighter">未問診</span>
                                {(visitStatus === 'arrived' || visitStatus === 'not_arrived') && (
                                  <button 
                                    onClick={() => handleOpenQR(res)}
                                    className="text-[9px] text-blue-500 hover:text-blue-700 underline font-bold flex items-center gap-0.5"
                                  >
                                    <QrCode size={10} /> QR表示
                                  </button>
                                )}
                              </div>
                            )}
                          </div>
                          {res.lastEditedBy && res.lastEditedAt && (
                            <div className="text-[8px] text-stone-400 mt-1 flex items-center gap-1 font-normal">
                              <PenTool size={8} />
                              {res.lastEditedBy} / 
                              {(() => {
                                const date = res.lastEditedAt.toDate ? res.lastEditedAt.toDate() : new Date(res.lastEditedAt);
                                const now = new Date();
                                const diffMs = now.getTime() - date.getTime();
                                const diffMins = Math.floor(diffMs / 60000);
                                if (diffMins < 1) return "たった今";
                                if (diffMins < 60) return `${diffMins}分前`;
                                const diffHours = Math.floor(diffMins / 60);
                                if (diffHours < 24) return `${diffHours}時間前`;
                                return `${date.getMonth()+1}/${date.getDate()}`;
                              })()}
                            </div>
                          )}
                        </div>
                      </td>
                      {/* 次にやる事 */}
                      <td className="py-5 px-4 text-center">
                        {visitStatus === 'not_arrived' ? (
                          <span className="text-[10px] font-bold text-stone-400">来院待ち</span>
                        ) : visitStatus === 'waiting_for_payment' ? (
                          <span className="text-xs font-black text-rose-600 bg-rose-50 px-3 py-1.5 rounded-xl border border-rose-200 animate-pulse-gentle">次：会計</span>
                        ) : visitStatus === 'completed' ? (
                          <span className="text-[10px] font-bold text-stone-300">完了</span>
                        ) : (
                          /* arrived 状態 */
                          res.questionnaireStatus !== 'submitted' ? (
                            <span className="text-xs font-black text-blue-600 bg-blue-50 px-3 py-1.5 rounded-xl border border-blue-200">次：問診入力(QR)</span>
                          ) : !res.questionnaireApplied ? (
                            <span className="text-xs font-black text-blue-700 bg-blue-100 px-4 py-2 rounded-xl border border-blue-300 shadow-md">次：カルテに反映</span>
                          ) : (
                            <span className="text-[10px] font-bold text-emerald-600">施術・記録中</span>
                          )
                        )}
                      </td>
                      {/* 担当 */}
                      <td className="py-5 px-4 text-center">
                        <span className="inline-block text-[10px] font-bold text-slate-600 bg-slate-50 border border-slate-200 px-2 py-1 rounded-md">
                          {staffName || '---'}
                        </span>
                      </td>
                      {/* 電話番号 */}
                      <td className="py-5 px-4 text-[10px] text-slate-400 text-center font-bold">
                        {patientPhone || '---'}
                      </td>
                      {/* メニュー */}
                      <td className="py-5 px-4 text-[11px] text-slate-500 font-bold truncate max-w-[120px]">
                        {res.selfCareMenu || '-'}
                      </td>
                      {/* カルテ */}
                      <td className="py-5 px-4">
                        {visitStatus !== 'cancelled' && (
                          <button 
                            onClick={() => setActiveChartData({ res, patientName, staffName })}
                            className={`w-full py-2.5 rounded-xl flex gap-1 items-center justify-center text-xs font-black transition-all active:scale-95 ${
                              visitStatus === 'arrived' && res.questionnaireStatus === 'submitted' && !res.questionnaireApplied
                                ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/30 ring-2 ring-blue-300'
                                : visitStatus === 'arrived' || visitStatus === 'waiting_for_payment'
                                  ? 'bg-slate-800 text-white hover:bg-slate-700'
                                  : 'bg-stone-50 text-stone-300 border border-stone-100'
                            }`}
                          >
                            <FileText size={14} /> カルテ
                          </button>
                        )}
                      </td>
                      {/* 清算 */}
                      <td className="py-5 px-4">
                        {visitStatus === 'waiting_for_payment' ? (
                          <div className="flex flex-col gap-2">
                            {/* 事前チェック表示 */}
                            <div className="flex flex-wrap gap-1 mb-1 justify-center">
                              {(() => {
                                const isChartSaved = !!res.signature;
                                const isSignatureDone = !!res.signature?.isLocked;
                                const isQuestionnaireSubmitted = res.questionnaireStatus === 'submitted';
                                const isQuestionnaireReflected = !!res.questionnaireApplied;

                                return (
                                  <>
                                    <span className={`text-[9px] px-1.5 py-0.5 rounded-md font-bold border ${isChartSaved ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 'bg-amber-50 text-amber-600 border-amber-100'}`}>
                                      カルテ{isChartSaved ? '済' : '未'}
                                    </span>
                                    <span className={`text-[9px] px-1.5 py-0.5 rounded-md font-bold border ${isSignatureDone ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 'bg-amber-50 text-amber-600 border-amber-100'}`}>
                                      サイン{isSignatureDone ? '済' : '未'}
                                    </span>
                                    {isQuestionnaireSubmitted && (
                                      <span className={`text-[9px] px-1.5 py-0.5 rounded-md font-bold border ${isQuestionnaireReflected ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 'bg-amber-50 text-amber-600 border-amber-100'}`}>
                                        問診{isQuestionnaireReflected ? '反映済' : '未反映'}
                                      </span>
                                    )}
                                  </>
                                );
                              })()}
                            </div>
                            <button 
                              onClick={() => {
                                const isChartSaved = !!res.signature;
                                const isSignatureDone = !!res.signature?.isLocked;
                                const isQuestionnaireSubmitted = res.questionnaireStatus === 'submitted';
                                const isQuestionnaireReflected = !!res.questionnaireApplied;
                                
                                const issues = [];
                                if (!isChartSaved) issues.push("カルテが未完了です");
                                if (!isSignatureDone) issues.push("電子サインが未完了です");
                                if (isQuestionnaireSubmitted && !isQuestionnaireReflected) issues.push("問診がカルテへ未反映です");

                                if (issues.length > 0) {
                                  setCheckoutConfirmData({ res, issues });
                                } else {
                                  setActivePaymentRes(res);
                                }
                              }}
                              disabled={isSaving}
                              className={`w-full py-3 bg-rose-600 text-white rounded-xl text-xs font-black shadow-lg shadow-rose-600/40 hover:bg-rose-700 active:scale-95 transition-all border-b-4 border-rose-800 ${
                                isSaving && updatingResId === res.id ? 'opacity-50' : 'animate-pulse-gentle'
                              }`}
                            >
                              {updatingResId === res.id ? '処理中' : '清算'}
                            </button>
                          </div>
                        ) : visitStatus === 'completed' ? (
                          <div className="flex items-center justify-center gap-1.5 h-[40px]">
                             <span className="text-[10px] font-bold text-emerald-600">完了</span>
                             <button
                               onClick={() => handleStatusChange(res.id, 'waiting_for_payment')}
                               className="text-stone-300 hover:text-red-500 p-1.5 transition-colors"
                               title="会計待ちに戻す"
                             ><X size={14} /></button>
                          </div>
                        ) : null}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* Initial Guide Modal */}
      {showInitialGuide && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-300">
          <div className="bg-white rounded-[2.5rem] shadow-2xl max-w-lg w-full overflow-hidden flex flex-col animate-in zoom-in-95 duration-300">
            <div className="bg-teal-600 p-8 text-white relative">
              <div className="flex items-center gap-4 mb-2">
                <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center backdrop-blur-sm">
                  <LayoutGrid size={28} />
                </div>
                <h2 className="text-2xl font-black tracking-tight">Smart Ledger 運用ガイド</h2>
              </div>
              <p className="text-teal-100 font-bold">教育不要。この流れだけで運用が完結します。</p>
              <button 
                onClick={() => {
                  setShowInitialGuide(false);
                  localStorage.setItem('smart_ledger_reception_guide_v1', 'true');
                }}
                className="absolute top-6 right-6 p-2 hover:bg-white/10 rounded-full transition-colors"
              >
                <X size={24} />
              </button>
            </div>
            
            <div className="p-8 space-y-6">
              <div className="bg-stone-50 rounded-2xl p-4 border border-stone-100 flex flex-col gap-3">
                <span className="text-[10px] font-black text-stone-400 uppercase tracking-widest">コピペ用メッセージ</span>
                <div className="space-y-2">
                   <button 
                     onClick={() => {
                       navigator.clipboard.writeText("ご予約ありがとうございます。\n当日は受付でQRコードをご案内しますので、\nその場で問診の入力をお願いいたします。");
                       alert('コピーしました');
                     }}
                     className="w-full text-left p-2.5 bg-white border border-stone-200 rounded-lg text-[10px] font-bold text-stone-600 hover:bg-stone-50 active:scale-[0.98] transition-all"
                   >
                     予約完了時：当日はQRから入力...
                   </button>
                   <button 
                     onClick={() => {
                       navigator.clipboard.writeText("事前に問診をご入力いただけます。\nこちらからご入力ください。\n[URLをここに貼る]");
                       alert('コピーしました。最後にURLを添えてください。');
                     }}
                     className="w-full text-left p-2.5 bg-white border border-stone-200 rounded-lg text-[10px] font-bold text-stone-600 hover:bg-stone-50 active:scale-[0.98] transition-all"
                   >
                     事前案内：事前に問診をご入力...
                   </button>
                </div>
              </div>

              <div className="space-y-4">
                {[
                    { step: '①', title: '来院・QR', desc: '患者に問診QRを提示。「スマホで入力をお願いします」と伝えます。' },
                    { step: '②', title: '問診入力', desc: '患者が操作。ボードのステータスが「問診済」になるのを待ちます。' },
                    { step: '③', title: 'カルテへ反映', desc: '「カルテ」ボタンから問診を反映。既存入力は消えません。' },
                    { step: '④', title: '記録・サイン', desc: '施術内容を記録し、電子サインをもらいます。' },
                    { step: '⑤', title: '会計', desc: '「清算」ボタンを押して完了。説明不要のスピード会計です。' }
                ].map((item, idx) => (
                  <div key={idx} className="flex gap-4 group">
                    <div className="text-teal-600 font-black text-xl pt-0.5">{item.step}</div>
                    <div>
                      <h4 className="font-black text-stone-800 flex items-center gap-2">
                        {item.title}
                        {idx === 0 && <span className="text-[10px] px-1.5 py-0.5 bg-blue-100 text-blue-600 rounded uppercase">Start</span>}
                      </h4>
                      <p className="text-sm text-stone-500 font-medium leading-relaxed">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>

              <button 
                onClick={() => {
                  setShowInitialGuide(false);
                  localStorage.setItem('smart_ledger_reception_guide_v1', 'true');
                }}
                className="w-full py-4 bg-stone-900 text-white rounded-2xl font-black text-lg hover:bg-stone-800 transition-all shadow-xl active:scale-95 flex items-center justify-center gap-2"
              >
                わかった！使ってみる
                <ChevronRight size={20} />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modals integrated for functionality */}
      {activeQRRes && (
        <div className="fixed inset-0 z-[100] bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-white rounded-[2.5rem] shadow-2xl max-w-sm w-full overflow-hidden p-8 flex flex-col items-center animate-in zoom-in-95 duration-500">
            <div className="w-full flex justify-between items-center mb-6">
              <h3 className="font-black text-stone-800 text-lg flex items-center gap-2">
                <QrCode className="text-emerald-500" /> 問診URL QR
              </h3>
              <button onClick={() => setActiveQRRes(null)} className="p-2 hover:bg-stone-100 rounded-full text-stone-400">
                <X size={24} />
              </button>
            </div>

            <div className="bg-white p-6 rounded-3xl shadow-inner border border-stone-100 mb-6">
              <QRCodeSVG 
                value={`${window.location.origin}/patient/questionnaire?clinicId=${clinicId}&reservationId=${activeQRRes.id}&token=${activeQRRes.accessToken}`}
                size={200}
                level="H"
                includeMargin={true}
              />
            </div>

            <p className="text-center font-black text-stone-800 text-lg mb-2">
              {activeQRRes.patientName || patients.find(p => p.id === activeQRRes.patientDocId || p.patientId === activeQRRes.patientId)?.name || '患者'} 様
            </p>
            <p className="text-center text-xs text-stone-400 mb-8 font-bold">スマホのカメラで読み取ってください</p>

            <button 
              onClick={() => setActiveQRRes(null)}
              className="w-full py-4 bg-stone-900 text-white rounded-2xl font-black text-lg shadow-xl active:scale-95 transition-all"
            >
              閉じる
            </button>
          </div>
        </div>
      )}

      {activePaymentRes && (
        <SimpleCheckoutModal
          reservation={activePaymentRes}
          onClose={() => setActivePaymentRes(null)}
          onConfirm={async (checkoutData) => {
               if (!clinicId || !userProfile || isSaving) return;
               setIsSaving(true);
               try {
                 const reservationRef = doc(db, `clinics/${clinicId}/reservations`, activePaymentRes.id);
                 
                 // Audit information for the checkout
                 const checkoutWithAudit = {
                   ...checkoutData,
                   clearedAt: Timestamp.now(),
                   clearedBy: userProfile.uid,
                   clearedByName: userProfile.displayName || '不明',
                   audit: {
                     createdAt: Timestamp.now(),
                     createdBy: userProfile.uid,
                     createdByName: userProfile.displayName || '不明',
                     updatedAt: Timestamp.now(),
                     updatedBy: userProfile.uid,
                     updatedByName: userProfile.displayName || '不明',
                   }
                 };

                 await updateDoc(reservationRef, {
                   visitStatus: 'completed',
                   checkout: checkoutWithAudit,
                   // 既存のフラットなフィールドも念のため互換性維持（必要最小限）
                   paidAt: Timestamp.now(),
                   updatedAt: Timestamp.now(),
                   updatedBy: userProfile.uid,
                   updatedByName: userProfile.displayName || '不明'
                 });
                 setActivePaymentRes(null);
               } catch (e: any) {
                 console.error('Checkout error:', e);
                 let msg = "会計失敗";
                 if (e.message?.includes('offline') || e.message?.includes('network')) {
                   msg = "会計失敗：通信エラー";
                 } else if (e.message?.includes('permission')) {
                   msg = "会計失敗：権限エラー";
                 }
                 setSaveToast({ type: 'error', message: msg });
                 setTimeout(() => setSaveToast(null), 3000);
                 alert(msg);
               } finally {
                 setIsSaving(false);
                 setUpdatingResId(null);
               }
          }}
          isSaving={isSaving}
        />
      )}

      {arrivalConfirmForQRRes && (
        <div className="fixed inset-0 z-[120] bg-black/70 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-white rounded-[2.5rem] shadow-2xl max-w-sm w-full overflow-hidden p-8 animate-in zoom-in-95 duration-300">
            <div className="flex flex-col items-center text-center">
              <div className="w-20 h-20 bg-blue-50 rounded-full flex items-center justify-center mb-6 text-blue-600">
                <UserCheck size={40} />
              </div>
              <h3 className="text-xl font-black text-stone-800 mb-2">来院処理を行いますか？</h3>
              <p className="text-sm text-stone-500 font-bold mb-8">
                QRを表示する前に、患者様を「来院済み」に変更しますか？
              </p>
              
              <div className="grid grid-cols-1 gap-3 w-full">
                <button 
                  onClick={async () => {
                    const res = arrivalConfirmForQRRes;
                    setArrivalConfirmForQRRes(null);
                    // 来院処理をしてからQR表示
                    await handleStatusChange(res.id, 'arrived');
                    handleOpenQR(res, true);
                  }}
                  className="w-full py-4 bg-blue-600 text-white rounded-2xl font-black text-lg shadow-xl shadow-blue-500/30 active:scale-[0.97] transition-all flex items-center justify-center gap-2"
                >
                  はい、来院済みにする
                </button>
                <button 
                  onClick={() => {
                    const res = arrivalConfirmForQRRes;
                    setArrivalConfirmForQRRes(null);
                    // 来院処理をせずにQR表示
                    handleOpenQR(res, true);
                  }}
                  className="w-full py-4 bg-stone-100 text-stone-600 rounded-2xl font-bold text-base hover:bg-stone-200 transition-all active:scale-[0.97]"
                >
                  いいえ、QRだけ出す
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {checkoutConfirmData && (
        <div className="fixed inset-0 z-[110] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl shadow-2xl max-w-sm w-full overflow-hidden p-6 animate-in zoom-in-95 duration-200">
            <div className="flex items-center gap-3 mb-4 text-orange-500">
              <AlertCircle size={28} />
              <h3 className="text-lg font-black text-stone-800">会計前の確認</h3>
            </div>
            
            <div className="bg-amber-50 rounded-2xl p-4 mb-6 border border-amber-100">
              <p className="text-sm font-bold text-amber-800 mb-3">以下の項目が未完了です：</p>
              <ul className="space-y-2">
                {checkoutConfirmData.issues.map((issue, idx) => (
                  <li key={idx} className="flex items-center gap-2 text-stone-700 text-xs font-bold leading-relaxed">
                    <span className="w-1.5 h-1.5 bg-orange-400 rounded-full shrink-0" />
                    {issue}
                  </li>
                ))}
              </ul>
            </div>

            <div className="flex flex-col gap-2">
              <button 
                onClick={() => {
                  const res = checkoutConfirmData.res;
                  setCheckoutConfirmData(null);
                  setActivePaymentRes(res);
                } }
                className="w-full py-4 bg-rose-600 text-white rounded-xl font-black text-base shadow-lg shadow-rose-500/30 active:scale-95 transition-all"
              >
                このまま会計を続ける
              </button>
              <button 
                onClick={() => setCheckoutConfirmData(null)}
                className="w-full py-3 bg-stone-100 text-stone-600 rounded-xl font-bold text-sm hover:bg-stone-200 transition-colors"
              >
                戻って修正する
              </button>
            </div>
          </div>
        </div>
      )}

      {activeChartData && clinicId && (
        <SimpleChartModal
          clinicId={clinicId}
          reservation={activeChartData.res}
          patientName={activeChartData.patientName}
          staffName={activeChartData.staffName}
          userProfile={userProfile}
          onClose={() => setActiveChartData(null)}
        />
      )}

      <style dangerouslySetInnerHTML={{ __html: `
        .custom-scrollbar::-webkit-scrollbar { width: 4px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.1); border-radius: 10px; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: rgba(255,255,255,0.2); }

        .animate-spin-slow {
          animation: spin 8s linear infinite;
        }
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }

        .animate-pulse-gentle {
          animation: pulse-gentle 2.5s infinite;
        }
        @keyframes pulse-gentle {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.85; }
        }

        .animate-bounce-slow {
          animation: bounce-slow 2s infinite;
        }
        @keyframes bounce-slow {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-3px); }
        }
        .animate-bounce-subtle {
          animation: bounce-subtle 2s infinite;
        }
        @keyframes bounce-subtle {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-2px); }
        }
      `}} />
    </div>
  );
};

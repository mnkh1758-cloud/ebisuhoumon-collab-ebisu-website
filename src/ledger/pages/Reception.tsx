import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useOutletContext } from 'react-router-dom';
import { db, handleFirestoreError, OperationType } from '../../firebase';
import { collection, query, where, onSnapshot, orderBy, Timestamp, doc } from 'firebase/firestore';
import { Clock, User, CheckCircle2, FileText, Printer, X, AlertCircle, ClipboardCheck, ExternalLink, AlertTriangle, CheckCircle, QrCode, Copy, Check } from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
import { ReceiptModal } from '../components/ReceiptModal';
import { SimpleChartModal } from '../components/SimpleChartModal';
import { useFeatureFlags } from '../hooks/useFeatureFlags';
import { getJapaneseHolidayName } from '../../lib/holidayUtils';
import { formatPaymentTag } from '../lib/paymentUtils';
import { safeUpdateDoc, safeAddDoc } from '../../lib/safeFirestore';
import { generateAccessToken } from '../../lib/randomUtils';

import { SimpleCheckoutModal } from '../components/SimpleCheckoutModal';
import { perf } from '@/ledger/utils/performance';

export const Reception: React.FC = () => {
  const context = useOutletContext<any>();
  const { clinicId, userProfile } = context || {};
  const flags = useFeatureFlags(clinicId);
  const [reservations, setReservations] = useState<any[]>([]);
  const [staffs, setStaffs] = useState<any[]>([]);
  const [patients, setPatients] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState<string | null>(null);
  const [settings, setSettings] = useState<any | null>(null);
  const [businessSettings, setBusinessSettings] = useState<any | null>(null);
  const [currentTime, setCurrentTime] = useState(new Date());

  console.log("[Reception] render. context:", !!context, "clinicId:", clinicId, "loading:", loading);

  const [isSaving, setIsSaving] = useState(false);

  // 1分ごとに現在時刻を更新（遅れ判定用）
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 60000);
    return () => clearInterval(timer);
  }, []);

  // 会計・領収書用ステート
  const [activePaymentRes, setActivePaymentRes] = useState<any | null>(null);
  const [receiptRes, setReceiptRes] = useState<any | null>(null);
  const [activeQRRes, setActiveQRRes] = useState<any | null>(null);
  const [activeChartData, setActiveChartData] = useState<{res: any, patientName: string, staffName: string} | null>(null);
  const [paymentData, setPaymentData] = useState({
    insuranceAmount: 0,
    selfPayTreatmentAmount: 0,
    optionAmount: 0,
    paymentMethod: 'cash',
    paymentMemo: ''
  });

  const today = useMemo(() => {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
  }, []);

  // テストデータ追加用関数
  const handleAddTestReservation = async () => {
    if (!clinicId) return;
    try {
      await safeAddDoc(clinicId, `clinics/${clinicId}/reservations`, {
        staffId: 'test-staff',
        date: today,
        startTime: '10:00',
        endTime: '11:00',
        status: 'confirmed',
        patientName: 'テスト 患者',
        visitStatus: 'not_arrived',
      }, 'reservation_create', 'テスト用の予約を追加しました');
      alert('テスト用の予約を追加しました！');
    } catch (e: any) {
      alert('追加に失敗しました: ' + e.message);
    }
  };

  // マスタデータの取得
  useEffect(() => {
    perf.start('Reception_master_load');
    console.log("[Reception] useEffect (master data). clinicId:", clinicId);
    if (!clinicId) return;
    const unsubStaff = onSnapshot(query(collection(db, `clinics/${clinicId}/staff`), where('isActive', '==', true)), (s) => {
      perf.mark('Reception_staff_loaded');
      setStaffs(s.docs.map(d => ({ id: d.id, ...d.data() })));
    });
    const unsubPatient = onSnapshot(collection(db, `clinics/${clinicId}/patients`), (s) => {
      perf.mark('Reception_patients_loaded');
      setPatients(s.docs.map(d => ({ id: d.id, ...d.data() })));
    });
    const unsubSettings = onSnapshot(doc(db, `clinics/${clinicId}/settings`, 'general'), (docSnap) => {
      if (docSnap.exists()) {
        setSettings(docSnap.data());
      }
    });
    const unsubBusinessSettings = onSnapshot(doc(db, `clinics/${clinicId}/settings`, 'business'), (docSnap) => {
      if (docSnap.exists()) {
        setBusinessSettings(docSnap.data());
      }
      perf.end('Reception_master_load');
    });
    return () => { unsubStaff(); unsubPatient(); unsubSettings(); unsubBusinessSettings(); };
  }, [clinicId]);

  // 予約データの取得
  useEffect(() => {
    perf.start('Reception_reservations_load');
    console.log("[Reception] useEffect (reservations). clinicId:", clinicId);
    if (!clinicId) {
      console.log("[Reception] clinicId is falsy, skipping reservations fetch and setting loading to false if it was true");
      setLoading(false);
      return;
    }
    setLoading(true);
    const q = query(collection(db, `clinics/${clinicId}/reservations`), where('date', '==', today), orderBy('startTime', 'asc'));
    return onSnapshot(q, (s) => {
      perf.mark('Reception_reservations_received');
      console.log("[Reception] reservations fetched successfully. count:", s.docs.length);
      setReservations(s.docs.map(d => ({ id: d.id, ...d.data() })));
      setFetchError(null);
      setLoading(false);
      perf.end('Reception_reservations_load');
    }, (e: any) => {
      console.error("[Reception] Error fetching reservations:", e);
      setFetchError(e.message || '予約データの取得に失敗しました。');
      setLoading(false);
      perf.end('Reception_reservations_load');
    });
  }, [clinicId, today]);

  // 会計入力の初期値セット
  useEffect(() => {
    if (activePaymentRes) {
      const optionTotal = (activePaymentRes.optionItems || []).reduce((sum, opt) => sum + opt.amount, 0);
      setPaymentData({
        insuranceAmount: activePaymentRes.insuranceAmount || 0,
        selfPayTreatmentAmount: activePaymentRes.selfPayTreatmentAmount || activePaymentRes.basePrice || 0,
        optionAmount: activePaymentRes.optionAmount || optionTotal,
        paymentMethod: activePaymentRes.paymentMethod || 'cash',
        paymentMemo: activePaymentRes.paymentMemo || ''
      });
    }
  }, [activePaymentRes]);

  const billingAmount = paymentData.insuranceAmount + paymentData.selfPayTreatmentAmount + paymentData.optionAmount;

  const displayData = useMemo(() => {
    const staffMap = new Map(staffs.map(s => [s.id, s.name]));
    const patientDocMap = new Map(patients.map(p => [p.id, p.name]));
    const patientIdMap = new Map(patients.map(p => [p.patientId, p.name]));

    const currentHour = currentTime.getHours();
    const currentMinute = currentTime.getMinutes();
    const currentTotalMinutes = currentHour * 60 + currentMinute;

    const items = reservations
      // 1. キャンセル済みの予約は受付リストから完全除外
      .filter(res => res.status !== 'cancelled') 
      .map(res => {
        const patientName = res.patientName || 
          (res.patientDocId ? patientDocMap.get(res.patientDocId) : null) || 
          (res.patientId ? patientIdMap.get(res.patientId) : null) || 
          '未設定';
        const staffName = staffMap.get(res.staffId) || '未割当';
        
        // 2. visitStatusの明確化とフォールバック
        // 既存の古いデータなどで visitStatus が未設定の場合は 'not_arrived' として扱う
        const visitStatus = res.visitStatus || 'not_arrived';

        // 遅れ判定
        let isLate = false;
        if (visitStatus === 'not_arrived' && res.startTime) {
          const [startHour, startMinute] = res.startTime.split(':').map(Number);
          const startTotalMinutes = startHour * 60 + startMinute;
          if (currentTotalMinutes > startTotalMinutes) {
            isLate = true;
          }
        }

        return { res, patientName, staffName, visitStatus, isLate };
      });

    // 3. visitStatus を軸に表示を完全制御・分類
    const notArrived = items.filter(i => i.visitStatus === 'not_arrived');
    
    // 遅れ患者を一番上にソート
    notArrived.sort((a, b) => {
      if (a.isLate && !b.isLate) return -1;
      if (!a.isLate && b.isLate) return 1;
      return (a.res.startTime || '').localeCompare(b.res.startTime || '');
    });

    return {
      notArrived,
      arrived: items.filter(i => i.visitStatus === 'arrived'),
      waitingForPayment: items.filter(i => i.visitStatus === 'waiting_for_payment'),
      completed: items.filter(i => i.visitStatus === 'completed'),
    };
  }, [reservations, staffs, patients, currentTime]);

  const handleStatusChange = useCallback(async (reservationId: string, newStatus: string, patientName: string) => {
    if (!clinicId || !reservationId || isSaving) return;
    setIsSaving(true);
    try {
      await safeUpdateDoc(
        clinicId,
        `clinics/${clinicId}/reservations`,
        reservationId,
        { visitStatus: newStatus },
        'reservation_update',
        `予約（${patientName}様）のステータスを「${newStatus}」に変更しました`
      );
    } catch (e: any) {
      alert(e.message || 'ステータスの更新に失敗しました。');
      // handleFirestoreError is already called within safeUpdateDoc
    } finally {
      setIsSaving(false);
    }
  }, [clinicId, isSaving]);

  const handleCompletePayment = async (checkoutData: any) => {
    if (!clinicId || !activePaymentRes || !userProfile || isSaving) return;
    setIsSaving(true);
    try {
      const { amounts, payment } = checkoutData;
      const totalAmount = amounts?.totalAmount || 0;
      
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

      await safeUpdateDoc(
        clinicId,
        `clinics/${clinicId}/reservations`,
        activePaymentRes.id,
        {
          visitStatus: 'completed',
          checkout: checkoutWithAudit,
          // 既存のフラットなフィールドも互換性のために更新
          paidAt: Timestamp.now(),
          billingAmount: totalAmount, // 領収書用
          insuranceAmount: amounts?.insuranceAmount || 0,
          selfPayTreatmentAmount: amounts?.selfPayAmount || 0,
          optionAmount: amounts?.optionAmount || 0,
          paymentMethod: payment?.paymentMethodType || 'other',
          updatedBy: userProfile.uid,
          updatedByName: userProfile.displayName || '不明'
        },
        'payment_complete',
        `予約（${activePaymentRes.patientName}様）の会計処理を完了しました`
      );
      
      const finishedRes = {
        ...activePaymentRes,
        visitStatus: 'completed',
        checkout: checkoutWithAudit,
        paidAt: Timestamp.now(),
        billingAmount: totalAmount,
        insuranceAmount: amounts?.insuranceAmount || 0,
        selfPayTreatmentAmount: amounts?.selfPayAmount || 0,
        optionAmount: amounts?.optionAmount || 0,
        paymentMethod: payment?.paymentMethodType || 'other'
      };

      setActivePaymentRes(null);
      setReceiptRes(finishedRes);
    } catch (e: any) {
      console.error('Checkout error:', e);
      alert(e.message || '会計処理に失敗しました。');
    } finally {
      setIsSaving(false);
    }
  };

  const handleOpenQuestionnaire = async (res: any) => {
    if (!clinicId || !res.id) return;

    let token = res.accessToken;
    if (!token) {
      token = generateAccessToken();
      try {
        await safeUpdateDoc(
          clinicId,
          `clinics/${clinicId}/reservations`,
          res.id,
          { accessToken: token },
          'reservation_update',
          '問診票用アクセストークンを生成しました'
        );
      } catch (e: any) {
        console.error('Failed to generate token:', e);
        alert('リンクの作成に失敗しました。');
        return;
      }
    }

    const url = res.questionnaireUrl || `${window.location.origin}/patient/questionnaire?clinicId=${clinicId}&reservationId=${res.id}&token=${token}`;
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  const handleOpenQR = async (res: any) => {
    if (!clinicId || !res.id) return;

    let token = res.accessToken;
    if (!token) {
      token = generateAccessToken();
      try {
        await safeUpdateDoc(
          clinicId,
          `clinics/${clinicId}/reservations`,
          res.id,
          { accessToken: token },
          'reservation_update',
          '問診票用アクセストークンを生成しました'
        );
      } catch (e: any) {
        console.error('Failed to generate token:', e);
        alert('QRコードの作成に失敗しました。');
        return;
      }
    }

    setActiveQRRes({ ...res, accessToken: token });
  };

  const getNextAction = (status: string) => {
    switch (status) {
      case 'not_arrived': return { label: '来院待ち', color: 'text-stone-400' };
      case 'arrived': return { label: '次：カルテ', color: 'text-blue-600' };
      case 'waiting_for_payment': return { label: '次：会計', color: 'text-red-500' };
      case 'completed': return null;
      default: return null;
    }
  };

  const SkeletonReservation = () => (
    <div className="bg-white px-3 py-4 rounded-xl shadow-sm border border-stone-100 flex flex-col gap-3 animate-pulse mb-2">
      <div className="flex justify-between">
        <div className="h-4 w-20 bg-stone-100 rounded"></div>
        <div className="h-4 w-12 bg-stone-100 rounded"></div>
      </div>
      <div className="h-6 w-32 bg-stone-100 rounded"></div>
      <div className="h-10 w-full bg-stone-50 rounded-xl mt-1"></div>
    </div>
  );

  return (
    <>
      <div className="space-y-6 h-full flex flex-col print:hidden">
        <div className="flex justify-between items-center bg-white p-4 rounded-2xl shadow-sm border border-stone-200">
          <div className="flex items-center gap-3">
            <h1 className="text-xl font-bold text-stone-800">本日の受付状況 ({today})</h1>
            <a 
              href={`/ledger/reception-board?clinicId=${clinicId}`} 
              target="_blank" 
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 px-3 py-1 bg-stone-100 text-stone-600 border border-stone-200 rounded-lg text-xs font-bold hover:bg-stone-200 transition-all shadow-sm"
              title="大画面・常時表示用ボードを別タブで開く"
            >
              <ExternalLink size={14} />
              ボード表示
            </a>
            {getJapaneseHolidayName(today) && (
              <span className={`px-2 py-1 rounded-lg text-xs font-black flex items-center gap-1 ${
                businessSettings?.closeOnNationalHolidays 
                  ? 'bg-red-600 text-white shadow-sm' 
                  : 'bg-red-100 text-red-700'
              }`}>
                <span className={`w-1.5 h-1.5 rounded-full ${businessSettings?.closeOnNationalHolidays ? 'bg-white' : 'bg-red-500'}`}></span>
                祝: {getJapaneseHolidayName(today)}
                {businessSettings?.closeOnNationalHolidays && "（休診日）"}
              </span>
            )}
          </div>
          <button 
            onClick={handleAddTestReservation} 
            className="px-4 py-2 bg-blue-100 text-blue-700 rounded-lg text-sm font-bold hover:bg-blue-200 transition-colors"
          >
            【テスト用】本日の予約を追加
          </button>
        </div>

        {/* 会計待ちアラート */}
        {displayData.waitingForPayment.length > 0 && (
          <div className="bg-orange-500 text-white p-4 rounded-xl shadow-lg flex items-center justify-between animate-bounce-subtle">
            <div className="flex items-center gap-3">
              <AlertCircle size={28} className="text-white" />
              <div>
                <h3 className="font-black text-lg">【重要】会計待ちの患者様が {displayData.waitingForPayment.length} 名います</h3>
                <p className="text-sm font-bold opacity-90">最優先で会計処理を行ってください。</p>
              </div>
            </div>
          </div>
        )}

        {/* エラー表示エリア */}
        {fetchError && (
          <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-xl shadow-sm">
            <h3 className="font-bold mb-1 flex items-center gap-2">
              <X size={18} />
              データの取得に失敗しました
            </h3>
            <p className="text-sm break-all">{fetchError}</p>
            {fetchError.includes('requires an index') && (
              <p className="text-sm mt-2 font-bold text-red-800">
                ※Firestoreの複合インデックスの作成が完了していない、または作成中です。数分待ってから画面を再読み込みしてください。
              </p>
            )}
          </div>
        )}

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 flex-1 items-start">
        {/* 未到着 */}
        <div className="bg-stone-100/50 rounded-2xl p-4 border border-stone-200 flex flex-col gap-4">
          <div className="flex justify-between items-center px-1">
            <h2 className="font-bold text-stone-600 flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-stone-400"></div>
              未到着
            </h2>
            <span className={`px-3 py-1 rounded-full text-sm font-bold shadow-sm border ${displayData.notArrived.length > 0 ? 'bg-stone-600 text-white border-stone-600' : 'bg-white text-stone-600 border-stone-200'}`}>
              {loading ? '...' : displayData.notArrived.length}
            </span>
          </div>
          <div className="space-y-2">
            {loading ? (
              Array.from({ length: 3 }).map((_, i) => <SkeletonReservation key={i} />)
            ) : displayData.notArrived.map(({ res, patientName, staffName, isLate }) => {
              const hasQuestionnaire = !!res.questionnaireId || res.questionnaireStatus === 'submitted' || !!res.questionnaire;
              if (!res) return null; // undefined対策
              return (
                <div 
                  key={res.id} 
                  className={`rounded-xl shadow-sm border border-l-4 flex flex-col gap-2 relative overflow-hidden transition-all duration-150 hover:shadow-md hover:-translate-y-[1px] px-3 py-2 mb-2 ${
                    isLate ? 'bg-red-50 border-red-200 border-l-gray-300' : 
                    !hasQuestionnaire ? 'bg-orange-50/40 border-orange-200 border-l-gray-300' : 'bg-white border-stone-200 border-l-gray-300'
                  }`}
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <div className={`text-xs flex items-center gap-1 font-bold ${isLate ? 'text-red-600' : 'text-stone-500'}`}>
                        <Clock size={12}/> {res.startTime}〜
                        {isLate && <span className="ml-1 bg-red-100 text-red-700 px-1.5 py-0.5 rounded text-[10px]">遅れ</span>}
                      </div>
                      <div className="font-bold text-lg text-stone-800 mt-1 flex items-center gap-1.5">
                        {patientName} 様
                        {res.checkout?.receivable?.isReceivable && (
                          <span className="bg-rose-600 text-white text-[9px] px-1 rounded flex items-center gap-0.5 animate-pulse">
                            <AlertTriangle size={8} /> 売掛
                          </span>
                        )}
                      </div>
                      {flags.enableQuestionnaire && (
                        hasQuestionnaire ? (
                          <div className="mt-1 flex items-center gap-1 text-[10px] font-black text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-100 w-fit">
                            <ClipboardCheck size={10} /> 問診済
                          </div>
                        ) : (
                          <div className="mt-1 flex items-center gap-1">
                            <div className="text-[10px] font-black text-orange-600 bg-orange-50 px-2 py-0.5 rounded-full border border-orange-100 w-fit">
                              未問診
                            </div>
                            <button 
                              onClick={() => handleOpenQuestionnaire(res)}
                              className="text-[10px] text-stone-400 hover:text-blue-600 flex items-center gap-0.5 underline font-bold"
                            >
                              <ExternalLink size={8} /> 問診を開く
                            </button>
                            <button 
                              onClick={() => handleOpenQR(res)}
                              className="text-[10px] text-stone-400 hover:text-emerald-600 flex items-center gap-0.5 underline font-bold"
                            >
                              <QrCode size={8} /> 問診QR
                            </button>
                            <button 
                              onClick={() => {
                                const url = res.questionnaireUrl || `${window.location.origin}/patient/questionnaire?clinicId=${clinicId}&reservationId=${res.id}&token=${res.accessToken}`;
                                navigator.clipboard.writeText(url);
                              }}
                              className="text-[10px] text-stone-400 hover:text-blue-600 flex items-center gap-0.5 underline font-bold"
                            >
                              <Copy size={8} /> コピー
                            </button>
                          </div>
                        )
                      )}
                    </div>
                    <div className="flex flex-col items-end gap-2">
                      <div className={`text-xs px-2 py-1 rounded-md font-medium ${isLate ? 'bg-red-100 text-red-700' : 'bg-stone-100 text-stone-600'}`}>{staffName}</div>
                      <div className="flex gap-1">
                        {!hasQuestionnaire && (
                          <button
                            onClick={() => handleOpenQR(res)}
                            className="flex items-center gap-1 text-[10px] font-bold text-stone-500 bg-stone-100 hover:bg-stone-200 px-2 py-1 rounded shadow-sm transition-all cursor-pointer active:scale-[0.97]"
                            title="問診QRを表示"
                          >
                            <QrCode size={12} /> QR
                          </button>
                        )}
                        <button
                          onClick={() => setActiveChartData({ res, patientName, staffName })}
                          className="flex items-center gap-1 text-[10px] font-bold text-stone-700 bg-stone-100 hover:bg-stone-200 px-2 py-1 rounded shadow-sm transition-all cursor-pointer active:scale-[0.97]"
                        >
                          <FileText size={12} /> カルテ
                        </button>
                      </div>
                    </div>
                  </div>
                  <div className="text-[11px] font-bold text-stone-400 leading-none mt-1 ml-1">来院待ち</div>
                  <button
                    onClick={() => handleStatusChange(res.id, 'arrived', patientName)}
                    disabled={isSaving}
                    className={`w-full py-3 mt-1 text-white font-bold rounded-xl shadow-sm transition-all active:scale-[0.97] flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed ${isLate ? 'bg-red-600 hover:bg-red-700' : 'bg-blue-600 hover:bg-blue-700'}`}
                  >
                    <User size={18} />
                    来院受付する
                  </button>
                </div>
              );
            })}
            {displayData.notArrived.length === 0 && (
              <div className="text-center py-8 text-stone-400 text-sm">来院待ちの患者様はいません</div>
            )}
          </div>
        </div>

        {/* 来院済 */}
        <div className="bg-blue-50/50 rounded-2xl p-4 border border-blue-100 flex flex-col gap-4">
          <div className="flex justify-between items-center px-1">
            <h2 className="font-bold text-blue-800 flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-blue-500"></div>
              来院済
            </h2>
            <span className={`px-3 py-1 rounded-full text-sm font-bold shadow-sm border ${displayData.arrived.length > 0 ? 'bg-blue-600 text-white border-blue-600' : 'bg-white text-blue-700 border-blue-200'}`}>
              {loading ? '...' : displayData.arrived.length}
            </span>
          </div>
          <div className="space-y-2">
            {loading ? (
              Array.from({ length: 2 }).map((_, i) => <SkeletonReservation key={i} />)
            ) : displayData.arrived.map(({ res, patientName, staffName }) => {
              if (!res) return null; // undefined対策
              const hasQuestionnaire = !!res.questionnaireId || res.questionnaireStatus === 'submitted' || !!res.questionnaire;
              return (
                <div key={res.id} className="bg-white px-3 py-2 rounded-xl shadow-sm border border-blue-200 border-l-4 border-l-blue-400 flex flex-col gap-2 transition-all duration-150 hover:shadow-md hover:-translate-y-[1px] mb-2">
                  <div className="flex justify-between items-start">
                    <div>
                    <div className="text-xs text-stone-500 flex items-center gap-1"><Clock size={12}/> {res.startTime}〜</div>
                    <div className="font-bold text-lg text-stone-800 mt-1 flex items-center gap-1.5">
                      {patientName} 様
                      {res.checkout?.receivable?.isReceivable && (
                        <span className="bg-rose-600 text-white text-[9px] px-1 rounded flex items-center gap-0.5 animate-pulse">
                          <AlertTriangle size={8} /> 売掛
                        </span>
                      )}
                    </div>
                    {flags.enableQuestionnaire && (
                      hasQuestionnaire ? (
                        <div className="mt-1 flex items-center gap-1 text-[10px] font-black text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-100 w-fit">
                          <ClipboardCheck size={10} /> 問診済
                        </div>
                      ) : (
                        <div className="mt-1 flex items-center gap-2">
                          <div className="text-[10px] font-black text-stone-400 bg-stone-50 px-2 py-0.5 rounded-full border border-stone-100 w-fit">
                            未問診
                          </div>
                          <button 
                            onClick={() => handleOpenQR(res)}
                            className="text-[10px] text-stone-400 hover:text-emerald-600 flex items-center gap-0.5 underline font-bold"
                          >
                            <QrCode size={8} /> 問診QR
                          </button>
                          <button 
                            onClick={() => {
                              const url = res.questionnaireUrl || `${window.location.origin}/patient/questionnaire?clinicId=${clinicId}&reservationId=${res.id}&token=${res.accessToken}`;
                              navigator.clipboard.writeText(url);
                            }}
                            className="text-[10px] text-stone-400 hover:text-blue-600 flex items-center gap-0.5 underline font-bold"
                          >
                            <Copy size={8} /> コピー
                          </button>
                        </div>
                      )
                    )}
                  </div>
                  <div className="flex flex-col items-end gap-2">
                    <div className="text-xs bg-blue-50 text-blue-700 px-2 py-1 rounded-md font-medium">{staffName}</div>
                    <div className="flex gap-1">
                      {!hasQuestionnaire && (
                        <button
                          onClick={() => handleOpenQR(res)}
                          className="flex items-center gap-1 text-[10px] font-bold text-blue-500 bg-blue-50 hover:bg-blue-100 px-2 py-1 rounded shadow-sm transition-all cursor-pointer active:scale-[0.97]"
                          title="問診QRを表示"
                        >
                          <QrCode size={12} /> QR
                        </button>
                      )}
                      <button
                        onClick={() => setActiveChartData({ res, patientName, staffName })}
                        className="flex items-center gap-1 text-[10px] font-bold text-white bg-blue-600 hover:bg-blue-700 px-3 py-1.5 rounded shadow-md transition-all cursor-pointer active:scale-[0.97] scale-[1.02] hover:shadow-lg min-w-[80px]"
                      >
                        <FileText size={12} /> カルテ
                      </button>
                    </div>
                  </div>
                </div>
                <div className="flex flex-col gap-2 mt-1">
                  <div className="text-[11px] font-bold text-blue-600 leading-none ml-1">次：カルテ</div>
                  <button
                    onClick={() => handleStatusChange(res.id, 'waiting_for_payment', patientName)}
                    disabled={isSaving}
                    className="w-full py-3 bg-stone-100 hover:bg-stone-200 text-stone-700 font-bold rounded-xl shadow-sm transition-all active:scale-[0.97] flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <CheckCircle2 size={18} />
                    施術を完了する
                  </button>
                  <button
                    onClick={() => handleStatusChange(res.id, 'not_arrived', patientName)}
                    disabled={isSaving}
                    className="text-xs text-stone-400 hover:text-stone-600 underline text-center py-1 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    1つ前の状態（未来院）に戻す
                  </button>
                </div>
              </div>
            );
          })}
            {displayData.arrived.length === 0 && (
              <div className="text-center py-8 text-blue-300 text-sm">院内に患者様はいません</div>
            )}
          </div>
        </div>

        {/* 会計待ち */}
        <div className="bg-orange-100/50 rounded-2xl p-4 border-2 border-orange-400 flex flex-col gap-4 ring-4 ring-orange-500/10">
          <div className="flex justify-between items-center px-1">
            <h2 className="font-black text-orange-800 flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-orange-500 animate-pulse"></div>
              会計待ち
            </h2>
            <span className={`px-3 py-1 rounded-full text-sm font-black shadow-md border-2 ${displayData.waitingForPayment.length > 0 ? 'bg-orange-500 text-white border-orange-600' : 'bg-white text-orange-700 border-orange-200'}`}>
              {loading ? '...' : displayData.waitingForPayment.length}
            </span>
          </div>
          <div className="space-y-2">
            {loading ? (
              Array.from({ length: 1 }).map((_, i) => <SkeletonReservation key={i} />)
            ) : displayData.waitingForPayment.map(({ res, patientName, staffName }) => {
              if (!res) return null; // undefined対策
              return (
                <div key={res.id} className="bg-orange-50 px-3 py-2 rounded-xl shadow-sm border-2 border-orange-300 border-l-4 border-l-red-400 ring-2 ring-orange-400 flex flex-col gap-2 transition-all duration-150 hover:shadow-md hover:-translate-y-[1px] mb-2">
                  <div className="flex justify-between items-start">
                    <div>
                    <div className="text-xs text-stone-500 flex items-center gap-1"><Clock size={12}/> {res.startTime}〜</div>
                    <div className="font-bold text-lg text-stone-800 mt-1 flex items-center gap-1.5">
                      {patientName} 様
                      {res.checkout?.receivable?.isReceivable && (
                        <span className="bg-rose-600 text-white text-[9px] px-1 rounded flex items-center gap-0.5 animate-pulse">
                          <AlertTriangle size={8} /> 売掛
                        </span>
                      )}
                    </div>
                    {flags.enableQuestionnaire && (
                      (res.questionnaireId || res.questionnaireStatus === 'submitted' || !!res.questionnaire) ? (
                        <div className="mt-1 flex items-center gap-1 text-[10px] font-black text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-100 w-fit">
                          <ClipboardCheck size={10} /> 問診済
                        </div>
                      ) : (
                        <div className="mt-1 flex items-center gap-1 text-[10px] font-black text-stone-400 bg-stone-50 px-2 py-0.5 rounded-full border border-stone-100 w-fit">
                          未問診
                        </div>
                      )
                    )}
                  </div>
                  <div className="flex flex-col items-end gap-2">
                    <div className="text-xs bg-orange-50 text-orange-700 px-2 py-1 rounded-md font-medium">{staffName}</div>
                    <button
                      onClick={() => setActiveChartData({ res, patientName, staffName })}
                      className="flex items-center gap-1 text-[10px] font-bold text-stone-700 bg-stone-100 hover:bg-stone-200 px-2 py-1 rounded shadow-sm transition-all cursor-pointer active:scale-[0.97]"
                    >
                      <FileText size={12} /> カルテ
                    </button>
                  </div>
                </div>
                <div className="flex flex-col gap-2 mt-1">
                  <div className="text-[11px] font-bold text-red-500 leading-none ml-1">次：会計</div>
                  <button
                    onClick={() => setActivePaymentRes(res)}
                    disabled={isSaving}
                    className="w-full py-3 bg-red-500 hover:bg-red-600 text-white font-bold rounded-xl shadow-md transition-all active:scale-[0.97] flex items-center justify-center gap-2 cursor-pointer scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed min-w-[120px]"
                  >
                    <FileText size={18} />
                    会計して完了する
                  </button>
                  <button
                    onClick={() => handleStatusChange(res.id, 'arrived', patientName)}
                    disabled={isSaving}
                    className="text-xs text-stone-400 hover:text-stone-600 underline text-center py-1 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    1つ前の状態（院内）に戻す
                  </button>
                </div>
              </div>
            );
          })}
            {displayData.waitingForPayment.length === 0 && (
              <div className="text-center py-8 text-orange-300 text-sm">会計待ちの患者様はいません</div>
            )}
          </div>
        </div>

        {/* 完了 */}
        <div className="bg-emerald-50/50 rounded-2xl p-4 border border-emerald-100 flex flex-col gap-4">
          <div className="flex justify-between items-center px-1">
            <h2 className="font-bold text-emerald-800 flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-emerald-500"></div>
              完了
            </h2>
            <span className={`px-3 py-1 rounded-full text-sm font-bold shadow-sm border ${displayData.completed.length > 0 ? 'bg-emerald-600 text-white border-emerald-600' : 'bg-white text-emerald-700 border-emerald-200'}`}>
              {loading ? '...' : displayData.completed.length}
            </span>
          </div>
          <div className="space-y-2">
            {loading ? (
              Array.from({ length: 2 }).map((_, i) => <SkeletonReservation key={i} />)
            ) : displayData.completed.map(({ res, patientName, staffName }) => {
              if (!res) return null; // undefined対策
              return (
                <div key={res.id} className="bg-white px-3 py-2 rounded-xl shadow-sm border border-emerald-100 border-l-4 border-l-emerald-400 flex flex-col gap-2 transition-all duration-150 hover:shadow-md mb-2 group">
                  <div className="flex justify-between items-start">
                    <div>
                    <div className="text-xs text-stone-500 flex items-center gap-1"><Clock size={12}/> {res.startTime}〜</div>
                    <div className="font-bold text-lg text-stone-800 mt-1 flex items-center gap-1.5">
                      {patientName} 様
                      {res.checkout?.receivable?.isReceivable && (
                        <span className="bg-rose-600 text-white text-[9px] px-1 rounded flex items-center gap-0.5 animate-pulse">
                          <AlertTriangle size={8} /> 売掛
                        </span>
                      )}
                    </div>
                    {res.checkout && (
                      <div className="mt-2">
                        {formatPaymentTag(res.checkout)}
                      </div>
                    )}
                    {flags.enableQuestionnaire && (
                      res.questionnaireId ? (
                        <div className="mt-1 flex items-center gap-1 text-[10px] font-black text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-100 w-fit">
                          <ClipboardCheck size={10} /> 問診済
                        </div>
                      ) : (
                        <div className="mt-1 flex items-center gap-1 text-[10px] font-black text-stone-400 bg-stone-50 px-2 py-0.5 rounded-full border border-stone-100 w-fit">
                          未問診
                        </div>
                      )
                    )}
                  </div>
                  <div className="flex flex-col items-end gap-2">
                    <div className="text-xs bg-emerald-50 text-emerald-700 px-2 py-1 rounded-md font-medium font-black italic">{staffName}</div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => setActiveChartData({ res, patientName, staffName })}
                        className="flex items-center gap-1 text-[10px] font-black text-stone-600 bg-stone-100 hover:bg-stone-200 px-2 py-1.5 rounded transition-all active:scale-95"
                      >
                        <FileText size={12} /> カルテ
                      </button>
                      <button
                        onClick={() => setReceiptRes(res)}
                        className="flex items-center gap-1 text-[10px] font-black text-emerald-700 bg-emerald-50 hover:bg-emerald-100 px-2 py-1.5 rounded border border-emerald-100 transition-all active:scale-95"
                      >
                        <Printer size={12} /> 領収書
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
            {displayData.completed.length === 0 && (
              <div className="text-center py-8 text-emerald-300 text-sm">完了した患者様はいません</div>
            )}
          </div>
        </div>
      </div>
    </div>
    
    {/* 会計入力モーダル (SimpleCheckoutModal) */}
    {activePaymentRes && (
      <SimpleCheckoutModal
        reservation={activePaymentRes}
        onClose={() => setActivePaymentRes(null)}
        onConfirm={handleCompletePayment}
        isSaving={isSaving}
      />
    )}

      {/* 領収書モーダル */}
      {receiptRes && (
        <ReceiptModal
          reservation={receiptRes}
          clinicName={settings?.name || '未設定クリニック'}
          directorName={'未設定院長'} // TODO: Settingsに院長名を追加するか、固定値にする
          onClose={() => setReceiptRes(null)}
        />
      )}

      {/* 簡易カルテモーダル */}
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

      {/* 問診QRモーダル */}
      {activeQRRes && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-stone-900/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white w-full max-w-sm rounded-[2rem] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="bg-emerald-600 p-6 text-white text-center">
              <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-white/30">
                <QrCode size={32} />
              </div>
              <h2 className="text-xl font-black tracking-tight">問診票はこちら</h2>
              <p className="text-emerald-100 text-xs font-bold mt-1">スマホで読み取ってください</p>
            </div>
            
            <div className="p-8 space-y-8 flex flex-col items-center">
              {/* QR Code */}
              <div className="p-4 bg-white border-4 border-emerald-50 rounded-3xl shadow-inner">
                <QRCodeSVG 
                  value={`${window.location.origin}/patient/questionnaire?clinicId=${clinicId}&reservationId=${activeQRRes.id}&token=${activeQRRes.accessToken}`}
                  size={200}
                  level="H"
                  includeMargin={true}
                />
              </div>

              <div className="w-full space-y-4">
                <div className="text-center">
                  <p className="text-stone-400 text-[10px] font-black uppercase tracking-widest mb-1">患者様</p>
                  <p className="text-lg font-black text-stone-800">{activeQRRes.patientName} 様</p>
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={() => {
                      const url = `${window.location.origin}/patient/questionnaire?clinicId=${clinicId}&reservationId=${activeQRRes.id}&token=${activeQRRes.accessToken}`;
                      navigator.clipboard.writeText(url);
                      alert('URLをコピーしました');
                    }}
                    className="flex-1 py-3 bg-stone-100 hover:bg-stone-200 text-stone-600 rounded-xl font-black text-sm transition-all flex items-center justify-center gap-2"
                  >
                    <Copy size={16} /> URLをコピー
                  </button>
                  <button
                    onClick={() => setActiveQRRes(null)}
                    className="flex-1 py-3 bg-stone-800 hover:bg-stone-900 text-white rounded-xl font-black text-sm transition-all flex items-center justify-center gap-2"
                  >
                    閉じる
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

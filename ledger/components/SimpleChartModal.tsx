import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { db, handleFirestoreError, OperationType } from '../../firebase';
import { collection, query, where, getDocs, addDoc, updateDoc, setDoc, doc, Timestamp, orderBy, limit, increment } from 'firebase/firestore';
import { X, Save, Clock, AlertCircle, Loader2, Copy, CheckCircle2, Sparkles, User, Image as ImageIcon, Printer, Plus, Trash2, ChevronDown, ChevronUp, Ticket, CreditCard, MinusCircle, PenTool, Lock, ClipboardCheck, Mic, MicOff, Maximize2, Search, QrCode, AlertTriangle, Wifi, WifiOff } from 'lucide-react';
import { SimpleChart, LearningTemplate, ProgressNote, PatientCoupon, PatientSubscription, ChartAuditLog, ClinicSettings, Questionnaire } from '../../types';
import { QRCodeSVG } from 'qrcode.react';
import { GoogleGenAI } from '@google/genai';
import { HumanBodyDrawModal } from './HumanBodyDrawModal';
import { useFeatureFlags } from '../hooks/useFeatureFlags';
import { useNetworkStatus } from '../hooks/useNetworkStatus';

interface Props {
  clinicId: string;
  reservation: any;
  patientName: string;
  staffName: string;
  userProfile?: any;
  onClose: () => void;
}

const TREATMENT_NOTE_TEMPLATES = ['筋緊張あり', '可動域制限あり', '炎症反応あり', 'マッサージ施術', '鍼施術'];

export const SimpleChartModal: React.FC<Props> = ({ clinicId, reservation, patientName, staffName, userProfile, onClose }) => {
  const flags = useFeatureFlags(clinicId);
  const navigate = useNavigate();
  const { isOnline, showBackOnline } = useNetworkStatus();
  const [chiefComplaint, setChiefComplaint] = useState('');
  const [treatmentNote, setTreatmentNote] = useState('');
  const [memo, setMemo] = useState('');
  const [bodyImage, setBodyImage] = useState<string | undefined>(undefined);

  // --- New Chart Fields ---
  const [chartMode, setChartMode] = useState<'jusei' | 'shinkyu' | 'both'>('jusei');
  const [injuryMechanism, setInjuryMechanism] = useState({
    whenText: '',
    whereText: '',
    mechanismText: '',
    narrative: ''
  });
  const [progressNotes, setProgressNotes] = useState<ProgressNote[]>([]);
  const [showSummary, setShowSummary] = useState(false);

  const [history, setHistory] = useState<SimpleChart[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const [isCopied, setIsCopied] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [questionnaireApplied, setQuestionnaireApplied] = useState(reservation.questionnaireApplied || false);

  const [initialData, setInitialData] = useState({ chiefComplaint: '', treatmentNote: '', memo: '', bodyImage: undefined as string | undefined });
  const [isDraftRestored, setIsDraftRestored] = useState(false);
  const [showCloseConfirm, setShowCloseConfirm] = useState(false);
  const [showBodyDrawModal, setShowBodyDrawModal] = useState(false);
  const [showCouponDetail, setShowCouponDetail] = useState(false);
  const [showPhotoModal, setShowPhotoModal] = useState(false);
  const [showQuestionnaireWarning, setShowQuestionnaireWarning] = useState(false);
  const [showQR, setShowQR] = useState(false);
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [lastEditedBy, setLastEditedBy] = useState<string | null>(null);
  const [lastEditedAt, setLastEditedAt] = useState<any | null>(null);
  const [hasConflict, setHasConflict] = useState(false);
  const [initialLastEditedAt] = useState(reservation.lastEditedAt);

  const getTodayDate = () => {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
  };

  const normalizeChartMode = (val: any): 'jusei' | 'shinkyu' | 'both' => {
    if (!val) return 'jusei';
    const s = String(val).trim();
    if (s === 'jusei' || s === 'ジュセイ' || s === '柔整' || s === 'じゅせい') return 'jusei';
    if (s === 'shinkyu' || s === '新九' || s === '鍼灸' || s === 'しんきゅう') return 'shinkyu';
    if (s === 'both' || s === '両方' || s === '柔整&鍼灸' || s === 'ジー' || s === '柔整 & 鍼灸') return 'both';
    return 'jusei';
  };

  // AI Draft State
  const [aiKeywords, setAiKeywords] = useState({
    symptom: '',
    when: '',
    where: '',
    memo: ''
  });
  const [isGenerating, setIsGenerating] = useState(false);
  const [aiError, setAiError] = useState<string | null>(null);
  
  // Learning Suggestions State
  const [learningSuggestions, setLearningSuggestions] = useState<LearningTemplate[]>([]);
  const [isSearchingSuggestions, setIsSearchingSuggestions] = useState(false);

  // Undo State
  const [isAiApplied, setIsAiApplied] = useState(false);
  const [preAiData, setPreAiData] = useState<{ chiefComplaint: string, treatmentNote: string, memo: string, injuryMechanism: any } | null>(null);

  // --- Timer State ---
  const [timerSeconds, setTimerSeconds] = useState(0);
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const [isFullscreenTimer, setIsFullscreenTimer] = useState(false);
  const [isTimerFinished, setIsTimerFinished] = useState(false);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isTimerRunning && timerSeconds > 0) {
      interval = setInterval(() => {
        setTimerSeconds(prev => {
          if (prev <= 1) {
            setIsTimerRunning(false);
            setIsTimerFinished(true);
            setTimeout(() => setIsTimerFinished(false), 4000); // 4秒間だけ完了通知
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isTimerRunning, timerSeconds]);

  useEffect(() => {
    // 競合検知
    if (reservation.lastEditedAt && initialLastEditedAt) {
      const current = reservation.lastEditedAt.toDate ? reservation.lastEditedAt.toDate().getTime() : new Date(reservation.lastEditedAt).getTime();
      const initial = initialLastEditedAt.toDate ? initialLastEditedAt.toDate().getTime() : new Date(initialLastEditedAt).getTime();
      
      if (current > initial) {
        setHasConflict(true);
      }
    }
  }, [reservation.lastEditedAt, initialLastEditedAt]);

  useEffect(() => {
    // 未問診警告のチェック
    if (reservation.questionnaireStatus !== 'submitted' && !reservation.questionnaireApplied) {
      const sessionKey = `warned_questionnaire_${reservation.id}`;
      const alreadyWarned = sessionStorage.getItem(sessionKey);
      if (!alreadyWarned) {
        setShowQuestionnaireWarning(true);
        sessionStorage.setItem(sessionKey, 'true');
      }
    }
  }, [reservation.id, reservation.questionnaireStatus, reservation.questionnaireApplied]);

  // 監査ログ追加ヘルパー
  const addAuditLog = useCallback(async (type: string, details?: string) => {
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
  }, [clinicId, reservation.id, reservation.auditLogs, userProfile?.uid]);

  const handleTimerAdd = (minutes: number) => {
    setTimerSeconds(prev => prev + minutes * 60);
    setIsTimerRunning(true);
    setIsTimerFinished(false);
  };

  const handleTimerToggle = () => {
    if (timerSeconds > 0) {
      setIsTimerRunning(!isTimerRunning);
    }
  };

  const handleTimerReset = () => {
    setTimerSeconds(0);
    setIsTimerRunning(false);
    setIsTimerFinished(false);
  };

  const handleUnlockSignature = async () => {
    if (!signature?.locked || signature?.mode !== 'strict') return;
    const isAdmin = userProfile?.role === 'admin' || userProfile?.isAdmin === true;
    if (!isAdmin) return;

    if (!window.confirm("ロックを解除しますか？この操作は履歴に残ります")) return;

    try {
      const now = Timestamp.now();
      const deviceId = typeof navigator !== 'undefined' ? (navigator.userAgent || 'unknown') : 'unknown';
      
      const newAuditLog: ChartAuditLog = {
        action: 'unlock',
        createdAt: now,
        deviceId: deviceId,
        staffId: userProfile?.uid || 'unknown',
        details: `Signature unlocked by admin ${userProfile?.displayName || userProfile?.uid}`
      };

      const prevLogs = Array.isArray(auditLogs) ? auditLogs : [];
      const nextLogs = [...prevLogs, newAuditLog].slice(-50);

      const updatePayload: any = {
        signatureInfo: signatureInfo ? {
          ...signatureInfo,
          isLocked: false
        } : null,
        signature: signature ? {
          ...signature,
          locked: false
        } : null,
        updatedAt: now,
        auditLogs: nextLogs
      };

      // Firestore 保存
      const chartsRef = collection(db, `clinics/${clinicId}/charts`);
      const q = query(chartsRef, where('reservationId', '==', reservation.id), limit(1));
      const snap = await getDocs(q);

      if (!snap.empty) {
        await setDoc(doc(db, `clinics/${clinicId}/charts`, snap.docs[0].id), updatePayload, { merge: true });
      } else {
        await setDoc(doc(db, `clinics/${clinicId}/charts`, reservation.id), updatePayload, { merge: true });
      }

      // 予約ドキュメントも更新
      await setDoc(doc(db, `clinics/${clinicId}/reservations`, reservation.id), {
        signature: updatePayload.signature,
        updatedAt: now
      }, { merge: true });

      // State 更新
      setSignatureInfo(prev => prev ? { ...prev, isLocked: false } : undefined);
      setSignature(prev => prev ? { ...prev, locked: false } : undefined);
      setAuditLogs(nextLogs);
    } catch (err) {
      console.error("Failed to unlock signature:", err);
      alert("ロック解除に失敗しました");
    }
  };

  const formatTime = (totalSeconds: number) => {
    const m = Math.floor(totalSeconds / 60);
    const s = totalSeconds % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const getTimerStyles = (seconds: number, isRunning: boolean, isFinished: boolean) => {
    if (isFinished) return {
      text: 'text-rose-600',
      bg: 'bg-rose-50/50',
      border: 'border-rose-400',
      ring: 'ring-4 ring-rose-400/30 animate-pulse',
      icon: 'text-rose-500 animate-bounce'
    };
    if (seconds === 0) return {
      text: 'text-stone-300',
      bg: 'bg-white',
      border: 'border-stone-200',
      ring: '',
      icon: 'text-stone-400'
    };
    if (seconds <= 60) return { // 1分以下
      text: 'text-rose-600 font-bold',
      bg: isRunning ? 'bg-rose-50/30' : 'bg-stone-50',
      border: isRunning ? 'border-rose-400' : 'border-stone-300 border-dashed',
      ring: isRunning ? 'ring-4 ring-rose-400/10' : '',
      icon: isRunning ? 'text-rose-500 animate-pulse' : 'text-stone-400'
    };
    if (seconds <= 300) return { // 5分以下
      text: 'text-amber-500 font-bold',
      bg: isRunning ? 'bg-amber-50/30' : 'bg-stone-50',
      border: isRunning ? 'border-amber-400' : 'border-stone-300 border-dashed',
      ring: isRunning ? 'ring-4 ring-amber-400/10' : '',
      icon: isRunning ? 'text-amber-500 animate-pulse' : 'text-stone-400'
    };
    return { // 5分超
      text: 'text-teal-600 font-bold',
      bg: isRunning ? 'bg-teal-50/10' : 'bg-stone-50',
      border: isRunning ? 'border-teal-400' : 'border-stone-300 border-dashed',
      ring: isRunning ? 'ring-4 ring-teal-400/10' : '',
      icon: isRunning ? 'text-teal-500 animate-pulse' : 'text-stone-400'
    };
  };

  const timerStyles = getTimerStyles(timerSeconds, isTimerRunning, isTimerFinished);

  // --- Coupons & Subscriptions ---
  const [coupons, setCoupons] = useState<PatientCoupon[]>([]);
  const [subscriptions, setSubscriptions] = useState<PatientSubscription[]>([]);
  const [loadingAssets, setLoadingAssets] = useState(false);
  const [selectedCoupon, setSelectedCoupon] = useState<PatientCoupon | null>(null);
  const [selectedSubscription, setSelectedSubscription] = useState<PatientSubscription | null>(null);
  const [isConsuming, setIsConsuming] = useState<string | null>(null);
  const [consumeSuccess, setConsumeSuccess] = useState<string | null>(null);

  // --- Signature & Evidence ---
  const [showSignatureModal, setShowSignatureModal] = useState(false);
  const [signatureInfo, setSignatureInfo] = useState<SimpleChart['signatureInfo']>(undefined);
  const [signature, setSignature] = useState<SimpleChart['signature']>(undefined);
  const [auditLogs, setAuditLogs] = useState<ChartAuditLog[]>([]);
  const [isSavingSignature, setIsSavingSignature] = useState(false);
  const [signatureMode, setSignatureMode] = useState<'light' | 'standard' | 'strict'>('light');
  const [clinicSettings, setClinicSettings] = useState<ClinicSettings | null>(null);
  const [patientData, setPatientData] = useState<any>(null);
  const [questionnaire, setQuestionnaire] = useState<Questionnaire | null>(null);
  const [loadingQuestionnaire, setLoadingQuestionnaire] = useState(false);
  const [showQuestionnaireDetail, setShowQuestionnaireDetail] = useState(false);
  const [showReflectConfirm, setShowReflectConfirm] = useState(false);
  const [reflectChoices, setReflectChoices] = useState({ chiefComplaint: true, injuryMechanism: true, memo: true });
  const [highlightedFields, setHighlightedFields] = useState<Set<string>>(new Set());
  const [isListening, setIsListening] = useState<string | null>(null);
  const recognitionRef = useRef<any>(null);
  const longPressTimerRef = useRef<any>(null);
  const isLongPressRef = useRef(false);

  useEffect(() => {
    const fetchClinicBaseData = async () => {
      if (!clinicId) return;
      try {
        console.log("Fetching clinic settings for clinicId:", clinicId);
        const settingsRef = collection(db, `clinics/${clinicId}/settings`);
        const q = query(settingsRef);
        const snap = await getDocs(q);
        const settingsDoc = snap.docs.find(d => d.id === 'clinic' || d.id === 'general');
        if (settingsDoc) {
          const data = settingsDoc.data() as ClinicSettings;
          setClinicSettings(data);
          const mode = data.signatureMode;
          if (mode === 'light' || mode === 'standard' || mode === 'strict') {
            setSignatureMode(mode);
            console.log("signatureMode:", mode);
          } else {
            console.warn("Invalid signatureMode value, falling back to light:", mode);
            setSignatureMode('light');
          }
        } else {
          console.log("No settings document found, using default light mode");
          setSignatureMode('light');
        }
      } catch (err) {
        console.error("Failed to fetch clinic base data:", err);
        setSignatureMode('light');
      }
    };
    fetchClinicBaseData();
  }, [clinicId]);

  const getDeviceId = () => {
    return typeof navigator !== 'undefined' ? (navigator.userAgent || 'unknown') : 'server';
  };

  const getRemainingCountColor = (count: number) => {
    if (count <= 1) return 'text-red-600';
    if (count <= 3) return 'text-amber-500';
    return 'text-orange-600';
  };

  const getExpiryStatus = (expiryDate?: string) => {
    if (!expiryDate) return { label: '期限なし', color: 'text-stone-400' };
    
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const expiry = new Date(expiryDate);
    expiry.setHours(0, 0, 0, 0);
    
    const diffTime = expiry.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays < 0) return { label: '期限切れ', color: 'text-red-600 font-bold' };
    if (diffDays <= 7) return { label: `あと${diffDays}日`, color: 'text-amber-600 font-bold' };
    return { label: `期限: ${expiryDate}`, color: 'text-stone-400' };
  };

  const handleConsumeCoupon = async (coupon: PatientCoupon, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    if (isConsuming || coupon.remainingCount <= 0) return;
    
    if (!window.confirm(`${coupon.name}を1回分消費しますか？`)) return;

    setIsConsuming(coupon.id);
    try {
      const couponRef = doc(db, `clinics/${clinicId}/patients/${reservation.patientId}/coupons`, coupon.id);
      
      await updateDoc(couponRef, {
        usedCount: increment(1),
        remainingCount: increment(-1),
        updatedAt: Timestamp.now()
      });

      const updatedCoupons = coupons.map(c => 
        c.id === coupon.id 
          ? { ...c, usedCount: c.usedCount + 1, remainingCount: c.remainingCount - 1 } 
          : c
      );
      setCoupons(updatedCoupons);
      
      if (selectedCoupon?.id === coupon.id) {
        setSelectedCoupon({
          ...selectedCoupon,
          usedCount: selectedCoupon.usedCount + 1,
          remainingCount: selectedCoupon.remainingCount - 1
        });
      }

      setConsumeSuccess("1回消費しました");
      setTimeout(() => setConsumeSuccess(null), 2000);
    } catch (err) {
      console.error("Failed to consume coupon:", err);
      alert("回数券の消費に失敗しました。");
    } finally {
      setIsConsuming(null);
    }
  };

  const handleSaveSignature = async (signatureImage: string) => {
    if (isSavingSignature || !reservation.id) {
      console.warn("Signature save blocked: isSavingSignature=", isSavingSignature, "reservation.id=", reservation?.id);
      return;
    }
    
    setIsSavingSignature(true);
    
    try {
      const deviceId = getDeviceId();
      const now = Timestamp.now();
      const mode = signatureMode;
      
      if (!signatureImage || signatureImage.length < 100) {
        throw new Error("署名データが正しく生成されていません。再度サインしてください。");
      }

      let signatureData: any = {
        image: signatureImage,
        signedAt: now,
        isLocked: true
      };

      const newAuditLog: ChartAuditLog = {
        action: 'sign',
        createdAt: now,
        deviceId: deviceId,
        staffId: userProfile?.uid || 'unknown',
        details: `Signature added (${mode} mode) for reservation ${reservation.id}.`
      };

      const prevLogs = Array.isArray(auditLogs) ? auditLogs : [];
      const nextLogs = [...prevLogs, newAuditLog].slice(-50);
      console.log(`auditLogs length: ${nextLogs.length}`);

      const updatePayload: any = {
        signatureInfo: signatureData,
        signature: {
          image: signatureImage || null,
          signedAt: now || null,
          signedBy: userProfile?.displayName || null,
          deviceId: deviceId || null,
          locked: signatureMode !== 'light',
          mode: signatureMode
        },
        updatedAt: now,
        lastEditedBy: userProfile?.displayName || userProfile?.uid || 'unknown',
        lastEditedAt: now,
        auditLogs: nextLogs
      };

      if (mode === 'strict') {
        const snapshotPayload = {
          chiefComplaint: chiefComplaint || "",
          treatmentNote: treatmentNote || "",
          memo: memo || "",
          visitDate: reservation.date || "",
          patientName: patientName || "",
          staffName: staffName || "",
          chartMode: normalizeChartMode(chartMode),
          injuryMechanism: JSON.parse(JSON.stringify(injuryMechanism || {})),
          progressNotes: JSON.parse(JSON.stringify(progressNotes || [])),
          savedAt: now
        };
        console.log("snapshot keys:", Object.keys(snapshotPayload));
        
        const snapshotData = {
          karteData: snapshotPayload,
          savedAt: now
        };
        signatureData.deviceId = deviceId;
        signatureData.signatureSnapshot = snapshotData.karteData; // Match legacy field if needed
        updatePayload.snapshot = snapshotData;
        updatePayload.signature.snapshot = snapshotData;
      }
      console.log("signatureMode:", signatureMode);

      // まず既存のカルテドキュメントを検索する
      const chartsRef = collection(db, `clinics/${clinicId}/charts`);
      const q = query(chartsRef, where('reservationId', '==', reservation.id), limit(1));
      const snap = await getDocs(q);

      let chartRef;

      // Fully eliminate undefined from top-level
      const sanitizedPayload = Object.keys(updatePayload).reduce((acc: any, key) => {
        const val = updatePayload[key];
        acc[key] = val === undefined ? null : val;
        return acc;
      }, {});

      if (!snap.empty) {
        const existingDocId = snap.docs[0].id;
        chartRef = doc(db, `clinics/${clinicId}/charts`, existingDocId);
        await setDoc(chartRef, sanitizedPayload, { merge: true });
      } else {
        // カルテが存在しない場合は新規作成（reservation.id を使用）
        chartRef = doc(db, `clinics/${clinicId}/charts`, reservation.id);
        const newChartData = {
          reservationId: reservation.id,
          patientId: reservation.patientId || null,
          patientName,
          visitDate: reservation.date,
          staffName,
          staffId: reservation.staffId || null,
          chiefComplaint,
          treatmentNote,
          memo,
          bodyImage,
          chartMode: normalizeChartMode(chartMode),
          injuryMechanism,
          progressNotes,
          createdAt: now,
          updatedAt: now,
          ...sanitizedPayload
        };
        
        // Sanitize final creation data
        const sanitizedData = Object.keys(newChartData).reduce((acc: any, key) => {
          (acc as any)[key] = (newChartData as any)[key] === undefined ? null : (newChartData as any)[key];
          return acc;
        }, {});

        await setDoc(chartRef, sanitizedData, { merge: true });
      }

      // Update signature in reservation as well
      if (clinicId && reservation?.id) {
        try {
          const resUpdate: any = {
            signature: sanitizedPayload.signature,
            updatedAt: now
          };
          
          // 会計導線接続: arrived/not_arrived の場合のみ waiting_for_payment へ
          const currentVisitStatus = reservation?.visitStatus;
          if (currentVisitStatus === 'arrived' || currentVisitStatus === 'not_arrived') {
            resUpdate.visitStatus = 'waiting_for_payment';
          }
          
          await setDoc(doc(db, `clinics/${clinicId}/reservations`, reservation.id), resUpdate, { merge: true });
        } catch (resErr) {
          console.error("Failed to update reservation in handleSaveSignature:", resErr);
        }
      }

      // Update patient's lastSignedMonth if frequency is monthly or monthly_plus
      if (reservation.patientDocId) {
        const currentMonth = new Date().toISOString().slice(0, 7); // "YYYY-MM"
        const patientRef = doc(db, `clinics/${clinicId}/patients`, reservation.patientDocId);
        await updateDoc(patientRef, {
          lastSignedMonth: currentMonth,
          updatedAt: now
        });
        if (patientData) {
          setPatientData({ ...patientData, lastSignedMonth: currentMonth });
        }
      }

      setSignatureInfo(signatureData);
      setSignature(updatePayload.signature);
      setAuditLogs([newAuditLog, ...auditLogs]);
      setLastEditedBy(updatePayload.lastEditedBy);
      setLastEditedAt(updatePayload.lastEditedAt);
      setShowSignatureModal(false);
    } catch (err: any) {
      console.error("Failed to save signature:", err);
      alert(`署名の保存に失敗しました。原因: ${err?.message || '不明なエラー'}`);
    } finally {
      setIsSavingSignature(false);
    }
  };

  // TODO:
  // 症状別テンプレ分岐（腰・肩・膝）
  // 動作別文章分岐（起床時・歩行時など）
  // 類似度検索強化
  // staff別学習
  // 傷病分類連動
  // 書類別テンプレ分離
  useEffect(() => {
    const searchTimer = setTimeout(() => {
      searchLearningTemplates();
    }, 300);
    return () => clearTimeout(searchTimer);
  }, [aiKeywords.symptom, aiKeywords.when, aiKeywords.where, aiKeywords.memo]);

  const normalizeText = (text: string) => {
    if (!text) return '';
    let normalized = text;
    // 症状
    normalized = normalized.replace(/首の痛み/g, '首痛');
    normalized = normalized.replace(/頚部痛/g, '首痛');
    normalized = normalized.replace(/腰の痛み/g, '腰痛');
    // 補足語
    normalized = normalized.replace(/運動痛/g, '運動時に疼痛');
    normalized = normalized.replace(/腫れ/g, '腫脹を認める');
    normalized = normalized.replace(/熱感/g, '熱感を認める');
    return normalized;
  };

  const searchLearningTemplates = async () => {
    if (!aiKeywords.symptom && !aiKeywords.when && !aiKeywords.where && !aiKeywords.memo) {
      setLearningSuggestions([]);
      return;
    }
    
    setIsSearchingSuggestions(true);
    try {
      const templatesRef = collection(db, `clinics/${clinicId}/learning_templates`);
      let q = query(templatesRef);
      if (aiKeywords.symptom) {
        // 症状で完全一致検索
        q = query(templatesRef, where('symptom', '==', aiKeywords.symptom));
      }
      
      const snap = await getDocs(q);
      let templates: LearningTemplate[] = [];
      snap.forEach(doc => {
        templates.push({ id: doc.id, ...doc.data() } as LearningTemplate);
      });

      const normalizedWhen = normalizeText(aiKeywords.when);

      // スコアリング
      // ① symptom＋trigger の強一致
      // ② symptom の一致
      // ③ usageCount高い順
      // ④ updatedAt新しい順
      templates.sort((a, b) => {
        let scoreA = 0;
        let scoreB = 0;
        
        // ① symptom＋trigger の強一致
        if (a.symptom === aiKeywords.symptom && a.triggerText && normalizedWhen && (a.triggerText.includes(normalizedWhen) || normalizedWhen.includes(a.triggerText))) scoreA += 100;
        if (b.symptom === aiKeywords.symptom && b.triggerText && normalizedWhen && (b.triggerText.includes(normalizedWhen) || normalizedWhen.includes(b.triggerText))) scoreB += 100;
        
        // ② symptom の一致
        if (a.symptom === aiKeywords.symptom) scoreA += 50;
        if (b.symptom === aiKeywords.symptom) scoreB += 50;

        if (scoreA !== scoreB) return scoreB - scoreA;
        
        // ③ usageCount高い順
        if (b.usageCount !== a.usageCount) return (b.usageCount || 0) - (a.usageCount || 0);
        
        // ④ updatedAt新しい順
        return (b.updatedAt?.toMillis() || 0) - (a.updatedAt?.toMillis() || 0);
      });

      setLearningSuggestions(templates.slice(0, 3));
    } catch (err) {
      console.error("Failed to search learning templates", err);
    } finally {
      setIsSearchingSuggestions(false);
    }
  };

  const saveLearningTemplate = async () => {
    if (!aiKeywords.symptom) return;

    try {
      const templatesRef = collection(db, `clinics/${clinicId}/learning_templates`);
      // symptom一致を最優先で取得
      const q = query(templatesRef, where('symptom', '==', aiKeywords.symptom));
      const snap = await getDocs(q);
      
      let bestMatchId: string | null = null;
      let maxScore = -1;
      let currentUsageCount = 0;

      const normalizedSymptom = normalizeText(aiKeywords.symptom);
      const normalizedWhen = normalizeText(aiKeywords.when);
      const normalizedWhere = normalizeText(aiKeywords.where);
      const normalizedMemo = normalizeText(aiKeywords.memo);

      snap.forEach(doc => {
        const data = doc.data() as LearningTemplate;
        let score = 0;
        
        // triggerTextの部分一致を加点
        if (data.triggerText && normalizedWhen && (data.triggerText.includes(normalizedWhen) || normalizedWhen.includes(data.triggerText))) score += 5;
        
        // whereTextの部分一致を加点
        if (data.whereText && normalizedWhere && (data.whereText.includes(normalizedWhere) || normalizedWhere.includes(data.whereText))) score += 3;

        // normalizedKeysがあれば加点に使用
        if (data.normalizedKeys && data.normalizedKeys.length > 0) {
          const keys = [normalizedSymptom, normalizedWhen, normalizedWhere, normalizedMemo].filter(Boolean);
          keys.forEach(key => {
            if (data.normalizedKeys.some(k => k.includes(key) || key.includes(k))) {
              score += 1;
            }
          });
        }

        if (score > maxScore) {
          maxScore = score;
          bestMatchId = doc.id;
          currentUsageCount = data.usageCount || 0;
        }
      });
      
      if (bestMatchId && maxScore >= 0) { // 何らかの一致があれば
        const docRef = doc(db, `clinics/${clinicId}/learning_templates`, bestMatchId);
        await updateDoc(docRef, {
          usageCount: currentUsageCount + 1,
          updatedAt: Timestamp.now()
        });
      } else {
        const normalizedKeys = [normalizedSymptom, normalizedWhen, normalizedWhere, normalizedMemo].filter(Boolean);
        await addDoc(templatesRef, {
          symptom: aiKeywords.symptom,
          whenText: aiKeywords.when,
          whereText: aiKeywords.where,
          triggerText: aiKeywords.when, // triggerTextはwhenをベースにする
          noteText: aiKeywords.memo,
          normalizedKeys,
          chiefComplaint,
          usageCount: 1,
          staffId: reservation.staffId || null,
          createdAt: Timestamp.now(),
          updatedAt: Timestamp.now()
        });
      }
    } catch (err) {
      console.error("Failed to save learning template", err);
    }
  };

  const generateNaturalTemplate = (input: { symptom: string, when: string, where: string, memo: string }) => {
    // 日付変換 (例: 4/1 -> R8年4月1日)
    let dateStr = '最近';
    if (input.when) {
      const match = input.when.match(/(\d+)\/(\d+)/);
      if (match) {
        dateStr = `R8年${match[1]}月${match[2]}日`;
      } else {
        dateStr = input.when;
      }
    }

    // 症状→部位変換
    let bodyPart = input.symptom || '患部';
    if (bodyPart.includes('首痛')) bodyPart = bodyPart.replace('首痛', '首部');
    if (bodyPart.includes('腰痛')) bodyPart = bodyPart.replace('腰痛', '腰部');
    if (bodyPart.includes('肩こり')) bodyPart = bodyPart.replace('肩こり', '肩部');
    if (bodyPart.includes('膝痛')) bodyPart = bodyPart.replace('膝痛', '膝部');

    // 補足→文章変換
    let condition = input.memo || '症状';
    if (condition.includes('運動痛')) condition = condition.replace('運動痛', '運動時に疼痛');
    if (condition.includes('熱感あり')) condition = condition.replace('熱感あり', '熱感を認める');
    if (condition.includes('腫れ')) condition = condition.replace('腫れ', '腫脹を認める');

    const place = input.where || '某所';
    const action = input.when && !input.when.match(/(\d+)\/(\d+)/) ? input.when : '動作'; // 日付以外なら動作として扱う簡易処理

    const chiefComplaint = `${dateStr}、${place}にて${action}を契機に${bodyPart}に痛みが出現。その後、${condition}を認める。`;
    const treatmentNote = '症状の確認を行い、状態に応じた施術を実施。';
    const memo = `${place}での動作時に${input.memo || '特記事項なし'}あり。`;

    return { chiefComplaint, treatmentNote, memo };
  };

  useEffect(() => {
    const fetchData = async () => {
      if (!clinicId || !reservation) return;
      try {
        const chartsRef = collection(db, `clinics/${clinicId}/charts`);

        // Fetch Patient Data
        if (reservation.patientDocId) {
          const patientRef = doc(db, `clinics/${clinicId}/patients`, reservation.patientDocId);
          const patientSnap = await getDocs(query(collection(db, `clinics/${clinicId}/patients`), where('__name__', '==', reservation.patientDocId)));
          if (!patientSnap.empty) {
            setPatientData(patientSnap.docs[0].data());
          }
        }

        // 1. Fetch current chart if exists
        const currentQ = query(chartsRef, where('reservationId', '==', reservation.id), limit(1));
        const currentSnap = await getDocs(currentQ);
        
        let fetchedData = { 
          chiefComplaint: '', 
          treatmentNote: '', 
          memo: '', 
          bodyImage: undefined as string | undefined,
          chartMode: 'jusei' as 'jusei' | 'shinkyu' | 'both',
          injuryMechanism: { whenText: '', whereText: '', mechanismText: '', narrative: '' },
          progressNotes: [] as ProgressNote[]
        };
        if (!currentSnap.empty) {
          const data = currentSnap.docs[0].data() as SimpleChart;
          fetchedData = {
            chiefComplaint: data.chiefComplaint || '',
            treatmentNote: data.treatmentNote || '',
            memo: data.memo || '',
            bodyImage: data.bodyImage,
            chartMode: normalizeChartMode(data.chartMode),
            injuryMechanism: {
              whenText: data.injuryMechanism?.whenText || '',
              whereText: data.injuryMechanism?.whereText || '',
              mechanismText: data.injuryMechanism?.mechanismText || '',
              narrative: data.injuryMechanism?.narrative || ''
            },
            progressNotes: data.progressNotes || []
          };
          setSignatureInfo(data.signatureInfo);
          setSignature(data.signature);
          setAuditLogs(data.auditLogs || []);
          setLastEditedBy(data.lastEditedBy || null);
          setLastEditedAt(data.lastEditedAt || null);
        }
        setInitialData({
          chiefComplaint: fetchedData.chiefComplaint,
          treatmentNote: fetchedData.treatmentNote,
          memo: fetchedData.memo,
          bodyImage: fetchedData.bodyImage
        });

        // Check localStorage for draft
        const draftKey = `simpleChartDraft:${clinicId}:${reservation.id}`;
        const draftStr = localStorage.getItem(draftKey);
        if (draftStr) {
          try {
            const draft = JSON.parse(draftStr);
            // If draft is different from fetched data, restore it
            if (draft.chiefComplaint !== fetchedData.chiefComplaint || 
                draft.treatmentNote !== fetchedData.treatmentNote || 
                draft.memo !== fetchedData.memo ||
                draft.bodyImage !== fetchedData.bodyImage ||
                draft.chartMode !== fetchedData.chartMode) {
              setChiefComplaint(draft.chiefComplaint || '');
              setTreatmentNote(draft.treatmentNote || '');
              setMemo(draft.memo || '');
              setBodyImage(draft.bodyImage);
              setChartMode(normalizeChartMode(draft.chartMode || fetchedData.chartMode));
              setInjuryMechanism({
                whenText: draft.injuryMechanism?.whenText || fetchedData.injuryMechanism.whenText,
                whereText: draft.injuryMechanism?.whereText || fetchedData.injuryMechanism.whereText,
                mechanismText: draft.injuryMechanism?.mechanismText || fetchedData.injuryMechanism.mechanismText,
                narrative: draft.injuryMechanism?.narrative || fetchedData.injuryMechanism.narrative
              });
              setProgressNotes(draft.progressNotes || fetchedData.progressNotes);
              setIsDraftRestored(true);
            } else {
              setChiefComplaint(fetchedData.chiefComplaint);
              setTreatmentNote(fetchedData.treatmentNote);
              setMemo(fetchedData.memo);
              setBodyImage(fetchedData.bodyImage);
              setChartMode(fetchedData.chartMode);
              setInjuryMechanism(fetchedData.injuryMechanism);
              setProgressNotes(fetchedData.progressNotes);
            }
          } catch (e) {
            setChiefComplaint(fetchedData.chiefComplaint);
            setTreatmentNote(fetchedData.treatmentNote);
            setMemo(fetchedData.memo);
            setBodyImage(fetchedData.bodyImage);
            setChartMode(fetchedData.chartMode);
            setInjuryMechanism(fetchedData.injuryMechanism);
            setProgressNotes(fetchedData.progressNotes);
          }
        } else {
          setChiefComplaint(fetchedData.chiefComplaint);
          setTreatmentNote(fetchedData.treatmentNote);
          setMemo(fetchedData.memo);
          setBodyImage(fetchedData.bodyImage);
          setChartMode(fetchedData.chartMode);
          setInjuryMechanism(fetchedData.injuryMechanism);
          setProgressNotes(fetchedData.progressNotes);
        }

        // 2. Fetch history (if patientId exists)
        if (reservation.patientId) {
          const historyQ = query(
            chartsRef,
            where('patientId', '==', reservation.patientId),
            orderBy('visitDate', 'desc'),
            limit(4) // Fetch 4 to safely exclude current if it's in there
          );
          const historySnap = await getDocs(historyQ);
          const historyData = historySnap.docs
            .map(d => ({ id: d.id, ...d.data() } as SimpleChart))
            .filter(d => d.reservationId !== reservation.id) // Exclude current
            .slice(0, 3); // Keep only top 3
          setHistory(historyData);
        }

        // 3. Fetch Coupons & Subscriptions
        if (reservation.patientId) {
          setLoadingAssets(true);
          try {
            const couponsRef = collection(db, `clinics/${clinicId}/patients/${reservation.patientId}/coupons`);
            const subsRef = collection(db, `clinics/${clinicId}/patients/${reservation.patientId}/subscriptions`);
            
            const [couponsSnap, subsSnap] = await Promise.all([
              getDocs(query(couponsRef, where('status', '==', 'active'))),
              getDocs(query(subsRef, where('status', '==', 'active')))
            ]);

            setCoupons(couponsSnap.docs.map(d => ({ id: d.id, ...d.data() } as PatientCoupon)));
            setSubscriptions(subsSnap.docs.map(d => ({ id: d.id, ...d.data() } as PatientSubscription)));
          } catch (assetErr) {
            console.error("Failed to fetch coupons/subscriptions:", assetErr);
          } finally {
            setLoadingAssets(false);
          }
        }

        // 4. Fetch Questionnaire
        if (reservation.questionnaire) {
          // If already in reservation, use it
          setQuestionnaire({
            id: 'legacy',
            symptom: (reservation.questionnaire as any).bodyPart || (reservation.questionnaire as any).symptom || '',
            whenText: (reservation.questionnaire as any).sinceWhen || (reservation.questionnaire as any).whenText || '',
            whereText: (reservation.questionnaire as any).trigger || (reservation.questionnaire as any).whereText || '',
            triggerText: (reservation.questionnaire as any).trigger || (reservation.questionnaire as any).triggerText || '',
            freeText: (reservation.questionnaire as any).memo || (reservation.questionnaire as any).freeText || '',
            status: 'submitted',
            aiGenerated: (reservation.questionnaire as any).aiGenerated || undefined
          } as any);
        } else if (reservation.questionnaireId) {
          setLoadingQuestionnaire(true);
          try {
            const qRef = collection(db, `clinics/${clinicId}/questionnaires`);
            // By reservationId
            const qSnap = await getDocs(query(qRef, where('reservationId', '==', reservation.id)));
            if (!qSnap.empty) {
              setQuestionnaire({ id: qSnap.docs[0].id, ...qSnap.docs[0].data() } as Questionnaire);
            } else {
              // Try by questionnaireId directly
              const qSnapById = await getDocs(query(qRef, where('__name__', '==', reservation.questionnaireId)));
              if (!qSnapById.empty) {
                setQuestionnaire({ id: qSnapById.docs[0].id, ...qSnapById.docs[0].data() } as Questionnaire);
              }
            }
          } catch (e) {
            console.error("Error fetching questionnaire:", e);
          } finally {
            setLoadingQuestionnaire(false);
          }
        }
      } catch (err: any) {
        console.error("Failed to fetch chart data:", err);
        setError("データの取得に失敗しました。");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [clinicId, reservation]);

  // Auto-save to localStorage
  useEffect(() => {
    if (loading) return; // Don't save while loading initial data
    
    const timer = setTimeout(() => {
      const draftKey = `simpleChartDraft:${clinicId}:${reservation.id}`;
      const draft = { chiefComplaint, treatmentNote, memo, bodyImage, chartMode, injuryMechanism, progressNotes };
      localStorage.setItem(draftKey, JSON.stringify(draft));
    }, 500); // 500ms debounce
    
    return () => clearTimeout(timer);
  }, [chiefComplaint, treatmentNote, memo, bodyImage, clinicId, reservation.id, loading]);


  const handleCopyFromHistory = () => {
    if (history.length > 0) {
      const latest = history[0];
      setChiefComplaint(latest.chiefComplaint || '');
      setTreatmentNote(latest.treatmentNote || '');
      setMemo(latest.memo || '');
      setBodyImage(latest.bodyImage);
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 1000);
    }
  };

  const appendText = (setter: React.Dispatch<React.SetStateAction<string>>, text: string) => {
    setter(prev => prev ? `${prev} ${text}` : text);
  };

  const handleSave = async () => {
    if (saving || isSuccess) return;

    // ⑤ 編集制御 (strict モード)
    if (signature?.locked && signature?.mode === 'strict') {
      alert("このカルテはロックされています（編集不可）");
      return;
    }

    // ⑥ standard モードの警告
    if (signature?.locked && signature?.mode === 'standard') {
      console.warn("ロック済カルテを編集します (standard モード)");
    }

    setSaving(true);
    setError(null);
    try {
      // TODO:
      // 外販時は tenantごとの保存容量制限、画像件数制限、人体図保存上限も設定可能にする
      // feature_flags で人体図機能ON/OFF、画像比較ON/OFFを切替できる設計へ拡張予定
      const chartsRef = collection(db, `clinics/${clinicId}/charts`);
      const q = query(chartsRef, where('reservationId', '==', reservation.id), limit(1));
      const snap = await getDocs(q);

      const chartData: any = {
        reservationId: reservation.id,
        patientId: reservation.patientId || null,
        patientName,
        visitDate: reservation.date,
        staffName,
        staffId: reservation.staffId || null,
        chiefComplaint,
        treatmentNote,
        memo,
        bodyImage,
        chartMode: normalizeChartMode(chartMode),
        injuryMechanism,
        progressNotes,
        updatedAt: Timestamp.now(),
        lastEditedBy: userProfile?.displayName || userProfile?.uid || 'unknown',
        lastEditedAt: Timestamp.now()
      };

      // 署名情報がすでにある場合は含める
      if (signatureInfo) {
        chartData.signatureInfo = signatureInfo;
      }

      // Foundation for 3-tier signature mode
      chartData.signature = {
        image: signature?.image || signatureInfo?.image || null,
        signedAt: signature?.signedAt || signatureInfo?.signedAt || null,
        signedBy: signature?.signedBy || (signatureInfo as any)?.signedBy || (signatureInfo ? userProfile?.displayName : null) || null,
        deviceId: signature?.deviceId || signatureInfo?.deviceId || (signatureInfo ? getDeviceId() : null) || null,
        locked: signature?.locked ?? (signatureMode !== 'light'),
        mode: signature?.mode || signatureMode,
        snapshot: signature?.snapshot || undefined
      };

      // Fully eliminate undefined from top-level
      const sanitizedData = Object.keys(chartData).reduce((acc: any, key) => {
        const val = chartData[key];
        acc[key] = val === undefined ? null : val;
        return acc;
      }, {});

      // Sanitize inner objects as well
      if (sanitizedData.signature) {
        sanitizedData.signature = Object.keys(sanitizedData.signature).reduce((acc: any, key) => {
          const val = (sanitizedData.signature as any)[key];
          acc[key] = val === undefined ? null : val;
          return acc;
        }, {});
      }

      if (!snap.empty) {
        await setDoc(doc(db, `clinics/${clinicId}/charts`, snap.docs[0].id), sanitizedData, { merge: true });
      } else {
        // 新規作成時は reservation.id をドキュメントIDとして使用し、整合性を保つ
        const chartRef = doc(db, `clinics/${clinicId}/charts`, reservation.id);
        await setDoc(chartRef, {
          ...sanitizedData,
          createdAt: Timestamp.now()
        }, { merge: true });
      }
      
      // 学習データの保存処理 (非同期で実行し、エラーを無視)
      if (chiefComplaint) {
        saveLearningTemplate().catch(err => console.error("Learning template save failed", err));
      }

      // Update reservation with signature foundation and status transition
      const currentStatus = reservation?.visitStatus;
      if (clinicId && reservation?.id) {
        try {
          const resUpdate: any = {
            updatedAt: Timestamp.now(),
            updatedBy: userProfile?.uid || null,
            updatedByName: userProfile?.displayName || null,
            lastEditedBy: userProfile?.displayName || userProfile?.uid || 'unknown',
            lastEditedAt: Timestamp.now(),
            // Add signature foundation to reservation
            signature: sanitizedData.signature
          };
          
          if (currentStatus === 'arrived' || currentStatus === 'not_arrived') {
            resUpdate.visitStatus = 'waiting_for_payment';
          }

          await setDoc(doc(db, `clinics/${clinicId}/reservations`, reservation.id), resUpdate, { merge: true });
        } catch (statusErr) {
          console.error("Reservation save/update with signature foundation failed:", statusErr);
        }
      }

      setIsSuccess(true);
      setLastEditedBy(sanitizedData.lastEditedBy);
      setLastEditedAt(sanitizedData.lastEditedAt);
      setSaving(false);
      setHasConflict(false); // 保存成功したら競合状態はリセット
      // Clear draft on successful save
      localStorage.removeItem(`simpleChartDraft:${clinicId}:${reservation.id}`);
      
      // One-tap signature workflow: if signature is needed, show modal after a short delay
      if (sigReq.needed && sigReq.showButton) {
        setTimeout(() => {
          setShowSignatureModal(true);
        }, 1000);
      } else {
        setTimeout(() => {
          onClose();
        }, 800);
      }
    } catch (err: any) {
      console.error("Failed to save chart:", err);
      let errorMsg = "保存に失敗しました";
      if (err.message?.includes('offline') || err.message?.includes('network')) {
        errorMsg = "保存失敗：通信エラー";
      } else if (err.message?.includes('permission')) {
        errorMsg = "保存失敗：権限エラー";
      }
      setError(errorMsg);
      alert(errorMsg);
      handleFirestoreError(err, 'write' as any, `clinics/${clinicId}/charts`);
      setSaving(false);
    }
  };

  const handleClose = () => {
    const hasChanged = 
      chiefComplaint !== initialData.chiefComplaint ||
      treatmentNote !== initialData.treatmentNote ||
      memo !== initialData.memo ||
      bodyImage !== initialData.bodyImage;

    if (hasChanged && !isSuccess) {
      setShowCloseConfirm(true);
    } else {
      onClose();
    }
  };

  const handleProceedToPayment = async () => {
    if (!clinicId || !reservation?.id) {
      alert("予約情報が見つかりません");
      return;
    }
    
    try {
      // 1. カルテ保存
      await handleSave();
      
      // 2. ステータスを「会計待ち」に変更
      const resRef = doc(db, `clinics/${clinicId}/reservations`, reservation.id);
      await updateDoc(resRef, {
        visitStatus: 'waiting_for_payment',
        updatedAt: Timestamp.now()
      });
      
      // handleSave が onClose を呼ばない経路（署名が必要な場合など）を考慮しつつ
      // 会計へ進む場合は基本閉じる
      onClose();
    } catch (err) {
      console.error("Proceed to payment error:", err);
    }
  };

  const handleNextAppointment = () => {
    if (!clinicId) return;
    // 既存のAdminDashboard（予約表）へ遷移
    navigate(`/admin/${clinicId}`);
    onClose();
  };

  const applyDraftToForm = (draft: { chiefComplaint: string, treatmentNote: string, memo: string }) => {
    setPreAiData({ chiefComplaint, treatmentNote, memo, injuryMechanism });
    setChiefComplaint(draft.chiefComplaint);
    setTreatmentNote(draft.treatmentNote);
    setMemo(draft.memo);
    setIsAiApplied(true);
  };

  const handleUndoAi = async () => {
    if (preAiData) {
      setChiefComplaint(preAiData.chiefComplaint);
      setTreatmentNote(preAiData.treatmentNote);
      setMemo(preAiData.memo);
      if (preAiData.injuryMechanism) {
        setInjuryMechanism(preAiData.injuryMechanism);
      }
      setIsAiApplied(false);
      setPreAiData(null);
      setHighlightedFields(new Set());
      
      // 状態戻す
      setQuestionnaireApplied(false);
      if (clinicId && reservation.id) {
        await setDoc(doc(db, `clinics/${clinicId}/reservations`, reservation.id), {
          questionnaireApplied: false,
          updatedAt: Timestamp.now()
        }, { merge: true });
      }
    }
  };

  const addProgressNote = () => {
    const newNote: ProgressNote = {
      id: Math.random().toString(36).substr(2, 9),
      date: getTodayDate(),
      treatmentSummary: '',
      progressText: '',
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now()
    };
    setProgressNotes([newNote, ...progressNotes]);
  };

  const updateProgressNote = (id: string, data: Partial<ProgressNote>) => {
    setProgressNotes(progressNotes.map(n => n.id === id ? { ...n, ...data, updatedAt: Timestamp.now() } : n));
  };

  const removeProgressNote = (id: string) => {
    setProgressNotes(progressNotes.filter(n => n.id !== id));
  };

  const generateInjuryMechanismNarrative = () => {
    const { whenText, whereText, mechanismText } = injuryMechanism;
    if (!whenText && !whereText && !mechanismText) return;

    let dateStr = whenText || '先日';
    const match = whenText.match(/(\d+)\/(\d+)/);
    if (match) {
      dateStr = `R8年${match[1]}月${match[2]}日`;
    }

    const narrative = `${dateStr}、${whereText || '某所'}にて${mechanismText || '動作'}を契機に負傷。`;
    setInjuryMechanism({ ...injuryMechanism, narrative });
  };

  const generateProgressDraft = (id: string) => {
    const note = progressNotes.find(n => n.id === id);
    if (!note) return;

    const draft = `${note.treatmentSummary || '施術'}を実施。経過は良好。`;
    updateProgressNote(id, { progressText: draft });
  };

  const copyPreviousProgressNote = () => {
    if (history.length === 0) return;
    const previousChart = history[0];
    if (!previousChart.progressNotes || previousChart.progressNotes.length === 0) return;

    // 最新の経過記録を取得（配列の先頭が最新と仮定）
    const latestPrevNote = previousChart.progressNotes[0];
    
    const newNote: ProgressNote = {
      id: Math.random().toString(36).substr(2, 9),
      date: getTodayDate(),
      treatmentSummary: latestPrevNote.treatmentSummary || '',
      progressText: latestPrevNote.progressText || '',
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now()
    };
    setProgressNotes([newNote, ...progressNotes]);
  };

  const handleClearAi = () => {
    setIsAiApplied(false);
    setPreAiData(null);
  };

  const handleGenerateDraft = async () => {
    if (!process.env.GEMINI_API_KEY) {
      setAiError("AI機能が設定されていません。簡易下書きを適用しました。");
      applyDraftToForm(generateNaturalTemplate(aiKeywords));
      return;
    }

    if (!aiKeywords.symptom && !aiKeywords.when && !aiKeywords.where && !aiKeywords.memo) {
      setAiError("キーワードを1つ以上入力してください。");
      return;
    }

    setIsGenerating(true);
    setAiError(null);

    try {
      const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
      
      const prompt = `
あなたは整骨院・鍼灸院の優秀なアシスタントです。
以下のキーワードから、カルテの「主訴」「施術内容」「社内メモ」のたたき台を作成してください。

【入力キーワード】
傷病・症状: ${aiKeywords.symptom || 'なし'}
日付・動作: ${aiKeywords.when || 'なし'}
場所: ${aiKeywords.where || 'なし'}
補足: ${aiKeywords.memo || 'なし'}

【ルール】
- 以下の基本構造に沿って自然文を作成すること。
  「R8年{月日}、{場所}にて{動作}を契機に{部位}に痛みが出現。その後、{補足}を認める。」
- 日付は「R8年○月○日」の形式にすること。
- 症状は部位に変換すること（例：首痛→首部、腰痛→腰部）。
- 補足は文章に変換すること（例：運動痛→運動時に疼痛、熱感あり→熱感を認める）。
- 「外力が加わり負傷」「損傷した」「骨折した」などの表現は絶対に使用せず、「痛みが出現」「症状を認める」に統一すること。
- 医師の診断のような断定表現は避けること。
- 施術内容は「症状の確認を行い、状態に応じた施術を実施。」で固定すること。
- メモは「{場所}での動作時に{補足}あり。」の構造にすること。
- 以下のJSON形式で出力してください。他の文章は含めないでください。

{
  "chiefComplaint": "主訴の文章",
  "treatmentNote": "施術内容の文章",
  "memo": "社内メモの文章"
}
`;

      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
        config: {
          responseMimeType: "application/json",
        }
      });

      if (response.text) {
        const result = JSON.parse(response.text);
        applyDraftToForm({
          chiefComplaint: result.chiefComplaint || '',
          treatmentNote: result.treatmentNote || '',
          memo: result.memo || ''
        });
      } else {
        throw new Error("AIからの応答が空でした");
      }
    } catch (err) {
      console.error("AI Draft Generation Error:", err);
      // エラー表示は出さない
      // setAiError("AI生成に失敗しました。簡易下書きを適用しました。");
      
      const fallbackChiefComplaint = `${aiKeywords.symptom || '症状'}あり。${aiKeywords.when || aiKeywords.where || '特定状況'}にて症状を認める。`;
      applyDraftToForm({
        chiefComplaint: fallbackChiefComplaint,
        treatmentNote: '症状の確認を行い、状態に応じた施術を実施。',
        memo: `${aiKeywords.where || '某所'}での動作時に${aiKeywords.memo || '特記事項なし'}あり。`
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const isMonthlySigned = () => {
    if (!patientData?.lastSignedMonth) return false;
    const currentMonth = new Date().toISOString().slice(0, 7);
    return patientData.lastSignedMonth === currentMonth;
  };

  const getSignatureRequirement = () => {
    const freq = clinicSettings?.signatureFrequency || 'every_visit';
    if (freq === 'none') return { needed: false, label: '不要', showButton: false };
    if (freq === 'every_visit') {
      const isSigned = !!signatureInfo?.isLocked;
      return { 
        needed: !isSigned, 
        label: isSigned ? '署名済み' : '未署名',
        showButton: true,
        isUrgent: !isSigned
      };
    }
    if (freq === 'monthly' || freq === 'monthly_plus') {
      const signed = isMonthlySigned();
      return {
        needed: !signed,
        label: signed ? '今月署名済み' : '今月未署名',
        showButton: freq === 'monthly_plus' || !signed,
        isUrgent: !signed,
        canAddExtra: freq === 'monthly_plus' && signed
      };
    }
    return { needed: false, label: '', showButton: false };
  };

  const sigReq = getSignatureRequirement();

  const handleReflectQuestionnaire = async () => {
    if (!questionnaire) return;
    
    // バックアップ用スナップショット
    setPreAiData({ chiefComplaint, treatmentNote, memo, injuryMechanism });

    const newHighlights = new Set<string>();

    // AI生成データがある場合はそちらを優先（ただし空欄のみ）
    if (questionnaire.aiGenerated) {
      if (reflectChoices.chiefComplaint && !chiefComplaint) {
        setChiefComplaint(questionnaire.aiGenerated.chiefComplaint);
        newHighlights.add('chiefComplaint');
      }
      if (reflectChoices.injuryMechanism && !injuryMechanism.narrative) {
        setInjuryMechanism(prev => ({
          ...prev,
          narrative: questionnaire.aiGenerated!.injuryMechanism
        }));
        newHighlights.add('injuryMechanism');
      }
    } else {
      // 生データを反映
      if (reflectChoices.chiefComplaint) {
        if (!chiefComplaint) {
          setChiefComplaint(questionnaire.symptom || '');
          newHighlights.add('chiefComplaint');
        } else if (questionnaire.symptom && !chiefComplaint.includes(questionnaire.symptom)) {
          // 追記モード
          setChiefComplaint(prev => `${prev}（問診：${questionnaire.symptom}）`);
          newHighlights.add('chiefComplaint');
        }
      }

      if (reflectChoices.injuryMechanism) {
        const qNarrative = `問診回答：[症状]${questionnaire.symptom || '-'} [時期]${questionnaire.whenText || '-'} [場所]${questionnaire.whereText || '-'} [きっかけ]${questionnaire.triggerText || '-'} [備考]${questionnaire.freeText || '-'}`;
        
        if (!injuryMechanism.narrative) {
          setInjuryMechanism(prev => ({ ...prev, narrative: qNarrative }));
          newHighlights.add('injuryMechanism');
        } else {
          setInjuryMechanism(prev => ({ ...prev, narrative: `${prev.narrative}\n\n${qNarrative}` }));
          newHighlights.add('injuryMechanism');
        }
      }
    }

    if (reflectChoices.memo && questionnaire.freeText) {
      if (!memo) {
        setMemo(questionnaire.freeText);
        newHighlights.add('memo');
      } else if (!memo.includes(questionnaire.freeText)) {
        setMemo(prev => `${prev}\n(問診メモ: ${questionnaire.freeText})`);
        newHighlights.add('memo');
      }
    }

    setIsAiApplied(true);
    setShowReflectConfirm(false);
    setHighlightedFields(newHighlights);
    
    // 状態保存
    setQuestionnaireApplied(true);
    if (clinicId && reservation.id) {
      // 監査ログ追加
      addAuditLog('questionnaire_applied', '問診をカルテに反映しました');

      await setDoc(doc(db, `clinics/${clinicId}/reservations`, reservation.id), {
        questionnaireApplied: true,
        updatedAt: Timestamp.now()
      }, { merge: true });
    }

    // 3秒後に強調表示を解除
    setTimeout(() => {
      setHighlightedFields(new Set());
    }, 3000);
  };

  const stopListening = () => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
      recognitionRef.current = null;
    }
    setIsListening(null);
  };

  const startListening = (fieldId: string, setter: (val: string) => void) => {
    if (isListening) {
      stopListening();
      return;
    }

    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert("お使いのブラウザは音声入力に対応していません。");
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.lang = 'ja-JP';
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;

    recognition.onstart = () => {
      setIsListening(fieldId);
    };

    recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript;
      setter(transcript);
    };

    recognition.onerror = (event: any) => {
      console.error("Speech recognition error:", event.error);
      setIsListening(null);
      recognitionRef.current = null;
    };

    recognition.onend = () => {
      setIsListening(null);
      recognitionRef.current = null;
    };

    recognitionRef.current = recognition;
    recognition.start();
  };

  const handleMicMouseDown = (fieldId: string, setter: (val: string) => void) => {
    isLongPressRef.current = false;
    longPressTimerRef.current = setTimeout(() => {
      isLongPressRef.current = true;
      startListening(fieldId, setter);
    }, 400); // 400ms以上で長押し判定
  };

  const handleMicMouseUp = () => {
    clearTimeout(longPressTimerRef.current);
    if (isLongPressRef.current) {
      stopListening();
    }
  };

  const handleMicClick = (fieldId: string, setter: (val: string) => void) => {
    if (!isLongPressRef.current) {
      startListening(fieldId, setter);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-5xl max-h-[90vh] flex flex-col overflow-hidden relative">
        {/* ネットワーク状態バー */}
        {!isOnline && (
          <div className="bg-amber-500 text-white px-4 py-1 flex items-center justify-center gap-2 text-[10px] font-bold z-[60]">
            <WifiOff size={12} className="animate-pulse" />
            <span>オフライン中：保存に失敗する場合があります。ネット接続を確認してください</span>
          </div>
        )}
        {showBackOnline && (
          <div className="bg-emerald-500 text-white px-4 py-1 flex items-center justify-center gap-2 text-[10px] font-bold z-[60]">
            <Wifi size={12} />
            <span>オンラインに復帰しました</span>
          </div>
        )}

        {/* Header */}
        <div className="p-4 border-b border-stone-200 flex justify-between items-center bg-stone-50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold">
              {reservation.patientId || '?'}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-3">
                <h2 className="text-lg font-bold text-stone-800 truncate">{patientName} 様</h2>
                <div className="flex items-center gap-2">
                  {saving && (
                    <span className="flex items-center gap-1 text-[10px] font-bold text-blue-500 animate-pulse bg-blue-50 px-2 py-0.5 rounded-full">
                      <Loader2 size={10} className="animate-spin" /> 保存中...
                    </span>
                  )}
                  {isSuccess && (
                    <span className="flex items-center gap-1 text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full animate-in fade-in zoom-in duration-300">
                      <CheckCircle2 size={10} /> 保存しました
                    </span>
                  )}
                  {error && (
                    <span className="flex items-center gap-1 text-[10px] font-bold text-rose-600 bg-rose-50 px-2 py-0.5 rounded-full">
                      <AlertCircle size={10} /> {error}
                    </span>
                  )}
                  {hasConflict && !isSuccess && (
                    <span className="flex items-center gap-1 text-[10px] font-bold text-amber-600 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200 animate-bounce-subtle">
                      <AlertTriangle size={10} /> 他の端末で更新されています
                    </span>
                  )}
                </div>
              </div>
              <div className="text-xs text-stone-500 flex items-center gap-3">
                <span>来院日: {reservation.date}</span>
                <span>担当: {staffName}</span>
                {lastEditedBy && lastEditedAt && (
                  <span className="text-[10px] text-stone-400 bg-stone-100 px-2 py-0.5 rounded-md flex items-center gap-1">
                    <Clock size={10} />
                    最終更新: {lastEditedBy} / 
                    {(() => {
                      const date = lastEditedAt.toDate ? lastEditedAt.toDate() : new Date(lastEditedAt);
                      const now = new Date();
                      const diffMs = now.getTime() - date.getTime();
                      const diffMins = Math.floor(diffMs / 60000);
                      if (diffMins < 1) return "たった今";
                      if (diffMins < 60) return `${diffMins}分前`;
                      const diffHours = Math.floor(diffMins / 60);
                      if (diffHours < 24) return `${diffHours}時間前`;
                      return date.toLocaleDateString();
                    })()}
                  </span>
                )}
                <span className="text-[10px] text-stone-300 font-normal ml-auto">サインモード: {signatureMode}</span>
              </div>
            </div>
          </div>
          
          {consumeSuccess && (
            <div className="absolute top-16 left-1/2 -translate-x-1/2 bg-emerald-600 text-white px-4 py-2 rounded-full text-sm font-bold shadow-lg animate-bounce z-[60]">
              <CheckCircle2 size={16} className="inline mr-1" /> {consumeSuccess}
            </div>
          )}

          <div className="flex bg-white rounded-lg border border-stone-200 p-1 shadow-sm">
            <button
              onClick={() => setChartMode('jusei')}
              className={`px-3 py-1.5 text-xs font-bold rounded-md transition-colors ${chartMode === 'jusei' ? 'bg-blue-600 text-white shadow-sm' : 'text-stone-600 hover:bg-stone-100'}`}
            >
              柔整
            </button>
            <button
              onClick={() => setChartMode('shinkyu')}
              className={`px-3 py-1.5 text-xs font-bold rounded-md transition-colors ${chartMode === 'shinkyu' ? 'bg-orange-500 text-white shadow-sm' : 'text-stone-600 hover:bg-stone-100'}`}
            >
              鍼灸
            </button>
            <button
              onClick={() => setChartMode('both')}
              className={`px-3 py-1.5 text-xs font-bold rounded-md transition-colors ${chartMode === 'both' ? 'bg-purple-600 text-white shadow-sm' : 'text-stone-600 hover:bg-stone-100'}`}
            >
              両方
            </button>
          </div>

          <div className="flex items-center gap-3 ml-4">
            <span className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-black border shadow-sm transition-all cursor-default ${
              !signature?.locked ? 'bg-stone-100 text-stone-600 border-stone-300' : 'opacity-40 grayscale'
            }`}>
              <div className={`w-2.5 h-2.5 rounded-full ${!signature?.locked ? 'bg-stone-400 animate-pulse' : 'bg-stone-300'}`} />
              DRAFT
            </span>
            
            {signature?.locked && signature?.mode === 'strict' ? (
              <span className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-red-50 text-red-700 text-xs font-black border border-red-200 shadow-sm transition-all hover:bg-red-100 cursor-default">
                <Lock size={14} className="text-red-500" />
                ロック済
              </span>
            ) : signature?.locked && signature?.mode === 'standard' ? (
              <span className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-blue-50 text-blue-700 text-xs font-black border border-blue-200 shadow-sm transition-all hover:bg-blue-100 cursor-default">
                <ClipboardCheck size={14} className="text-blue-500" />
                サイン済
              </span>
            ) : signature?.locked && signature?.mode === 'light' ? (
              <span className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-stone-50 text-stone-500 text-xs font-black border border-stone-200 shadow-sm transition-all cursor-default opacity-60">
                <CheckCircle2 size={14} />
                サイン受領
              </span>
            ) : (
              <span className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-blue-50 text-blue-700 text-xs font-black border border-blue-200 shadow-sm transition-all hover:bg-blue-100 cursor-default">
                <div className="w-2.5 h-2.5 rounded-full bg-blue-500" />
                COMPLETED
              </span>
            )}
          </div>

          <button onClick={handleClose} className="p-2 text-stone-400 hover:text-stone-600 hover:bg-stone-200 rounded-full transition-colors ml-auto">
            <X size={24} />
          </button>
        </div>

        {/* 次にやることバー */}
        <div className={`px-6 py-2 border-b flex items-center justify-between transition-colors ${
          !chiefComplaint ? 'bg-amber-50 border-amber-200' : 
          (!treatmentNote && progressNotes.length === 0) ? 'bg-amber-50 border-amber-200' : 
          'bg-emerald-50 border-emerald-200'
        }`}>
          <div className="flex items-center gap-2">
            <div className={`w-2 h-2 rounded-full animate-pulse ${
              !chiefComplaint ? 'bg-amber-500' : 
              (!treatmentNote && progressNotes.length === 0) ? 'bg-amber-500' : 
              'bg-emerald-500'
            }`} />
            <span className={`text-xs font-bold ${
              !chiefComplaint ? 'text-amber-700' : 
              (!treatmentNote && progressNotes.length === 0) ? 'text-amber-700' : 
              'text-emerald-700'
            }`}>
              {!chiefComplaint ? '次：主訴を入力してください' : 
               (!treatmentNote && progressNotes.length === 0) ? '次：経過を入力してください' : 
               '完了：会計へ進めます'}
            </span>
          </div>
          <div className="text-[10px] text-stone-400 font-medium">
            入力状況に応じて自動更新されます
          </div>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-hidden flex flex-col md:flex-row">
          {/* Left: History */}
          <div className="w-full md:w-1/3 bg-stone-50 border-r border-stone-200 p-4 overflow-y-auto">
            <h3 className="font-bold text-stone-700 mb-4 flex items-center gap-2">
              <Clock size={16} /> 過去の履歴 (直近3件)
            </h3>
            {loading ? (
              <div className="flex justify-center py-8"><Loader2 className="animate-spin text-stone-400" /></div>
            ) : history.length > 0 ? (
              <div className="space-y-4">
                {history.map(h => (
                  <div key={h.id} className="bg-stone-50/30 p-3 rounded-xl border border-stone-100 shadow-sm">
                    <div className="flex justify-between items-center mb-2">
                      <span className="font-bold text-sm text-stone-600">{h.visitDate}</span>
                      <span className="text-[10px] text-stone-400 bg-stone-100 px-2 py-0.5 rounded">{h.staffName}</span>
                    </div>
                    <div className="space-y-2">
                      <div>
                        <div className="text-[10px] font-bold text-stone-300 uppercase tracking-wider">主訴</div>
                        <div className="text-xs text-stone-500 line-clamp-2">{h.chiefComplaint || '-'}</div>
                      </div>
                      <div>
                        <div className="text-[10px] font-bold text-stone-300 uppercase tracking-wider">施術内容</div>
                        <div className="text-xs text-stone-500 line-clamp-2">{h.treatmentNote || '-'}</div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-stone-400 text-sm">過去の履歴はありません</div>
            )}

            {/* Coupons & Subscriptions Section */}
            {(coupons.length > 0 || subscriptions.length > 0 || loadingAssets) && (
              <div className="mt-8 pt-6 border-t border-stone-200">
                <h3 className="font-bold text-stone-700 mb-4 flex items-center gap-2">
                  <Ticket size={16} className="text-orange-500" /> 保有チケット・サブスク
                </h3>
                
                {loadingAssets ? (
                  <div className="flex justify-center py-4"><Loader2 className="animate-spin text-stone-400" size={16} /></div>
                ) : (
                  <div className="space-y-3">
                    {/* Coupons */}
                    {coupons.map(coupon => {
                      const expiry = getExpiryStatus(coupon.expiryDate);
                      const countColor = getRemainingCountColor(coupon.remainingCount);
                      const isUsedUp = coupon.remainingCount <= 0;
                      
                      return (
                        <div 
                          key={coupon.id} 
                          onClick={() => setSelectedCoupon(coupon)}
                          className={`p-3 rounded-xl border shadow-sm cursor-pointer transition-all group relative overflow-hidden ${
                            isUsedUp ? 'bg-stone-50 border-stone-200 opacity-60' : 'bg-white border-orange-100 hover:border-orange-300'
                          }`}
                        >
                          <div className="flex justify-between items-start mb-1">
                            <span className={`font-bold text-xs transition-colors ${isUsedUp ? 'text-stone-400' : 'text-stone-800 group-hover:text-orange-600'}`}>
                              {coupon.name}
                            </span>
                            <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
                              isUsedUp ? 'bg-stone-200 text-stone-500' : 'bg-orange-50 text-orange-600'
                            }`}>
                              {isUsedUp ? '使用済' : '回数券'}
                            </span>
                          </div>
                          <div className="flex justify-between items-end">
                            <div className="text-xs text-stone-500">
                              <div>残り <span className={`font-bold text-sm ${isUsedUp ? 'text-stone-400' : countColor}`}>{coupon.remainingCount}</span> 回</div>
                              <div className={`text-[10px] ${isUsedUp ? 'text-stone-400' : expiry.color}`}>{expiry.label}</div>
                            </div>
                            <div className="flex flex-col items-end gap-1">
                              <div className="text-[9px] text-stone-400">
                                次回: {coupon.nextPlannedUse || 'なし'}
                              </div>
                              <button
                                onClick={(e) => handleConsumeCoupon(coupon, e)}
                                disabled={!!isConsuming || isUsedUp}
                                className="flex items-center gap-1 bg-orange-600 text-white text-[10px] font-bold px-2 py-1 rounded-lg hover:bg-orange-700 transition-colors disabled:opacity-50 disabled:bg-stone-300"
                              >
                                {isConsuming === coupon.id ? <Loader2 size={10} className="animate-spin" /> : <MinusCircle size={10} />}
                                1回消費
                              </button>
                            </div>
                          </div>
                        </div>
                      );
                    })}

                    {/* Subscriptions */}
                    {subscriptions.map(sub => {
                      const renewalStatus = getExpiryStatus(sub.renewalDate);
                      
                      return (
                        <div 
                          key={sub.id} 
                          onClick={() => setSelectedSubscription(sub)}
                          className="bg-white p-3 rounded-xl border border-blue-100 shadow-sm cursor-pointer hover:border-blue-300 transition-all group"
                        >
                          <div className="flex justify-between items-start mb-1">
                            <span className="font-bold text-xs text-stone-800 group-hover:text-blue-600 transition-colors">{sub.name}</span>
                            <span className="text-[10px] font-bold bg-blue-50 text-blue-600 px-1.5 py-0.5 rounded">サブスク</span>
                          </div>
                          <div className="flex justify-between items-end">
                            <div className="text-xs text-stone-500">
                              <div className="text-blue-600 font-medium">{sub.status === 'active' ? '有効' : sub.status}</div>
                              <div className={`text-[10px] ${renewalStatus.color}`}>更新: {sub.renewalDate || '未設定'}</div>
                            </div>
                            <div className="text-[9px] text-stone-400 text-right italic">
                              {sub.planName}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            )}

            {/* Electronic Signature Section */}
            {flags.enableSignature && (
              <div className="mt-8 pt-6 border-t border-stone-200">
                <h3 className="font-bold text-stone-700 mb-4 flex items-center gap-2">
                  <PenTool size={16} className="text-blue-500" /> レセプト電子サイン (証拠)
                </h3>
                
                {sigReq.isUrgent && (
                  <div className="mb-3 p-3 bg-orange-50 border border-orange-200 rounded-xl flex items-center gap-2 text-orange-700 text-xs font-bold animate-pulse">
                    <AlertCircle size={14} />
                    {clinicSettings?.signatureFrequency === 'every_visit' ? '本日の署名が未完了です' : '今月の署名が未完了です'}
                  </div>
                )}

                {signatureInfo?.isLocked ? (
                  <div className="bg-emerald-50 border border-emerald-100 p-4 rounded-xl mb-3">
                    <div className="flex justify-between items-center mb-2">
                      <div className="flex items-center gap-2 text-emerald-700 font-bold text-sm">
                        <CheckCircle2 size={16} /> {sigReq.label}
                      </div>
                      {(userProfile?.role === 'admin' || userProfile?.isAdmin === true) && signature?.mode === 'strict' && (
                        <button 
                          onClick={handleUnlockSignature}
                          className="text-xs text-red-600 underline hover:text-red-700 font-medium"
                        >
                          ロック解除
                        </button>
                      )}
                    </div>
                    <div className="bg-white p-2 rounded border border-emerald-100 mb-2">
                      <img src={signatureInfo.image} alt="Signature" className="h-16 mx-auto object-contain" />
                    </div>
                    <div className="text-[10px] text-emerald-600 space-y-0.5">
                      <div>日時: {signatureInfo.signedAt?.toDate ? signatureInfo.signedAt.toDate().toLocaleString() : '不明'}</div>
                      {signatureInfo.deviceId && <div>端末ID: {signatureInfo.deviceId}</div>}
                    </div>
                  </div>
                ) : (
                  <div className="mb-3 text-xs font-bold text-stone-400 px-1">
                    ステータス: <span className={sigReq.isUrgent ? 'text-orange-600' : 'text-stone-500'}>{sigReq.label}</span>
                  </div>
                )}

                {sigReq.showButton && (
                  <button
                    onClick={() => {
                      if (reservation.questionnaireStatus === 'submitted' && !questionnaireApplied) {
                        if (!window.confirm("問診がカルテに反映されていません。このまま署名を行いますか？")) {
                          return;
                        }
                      }
                      setShowSignatureModal(true);
                    }}
                    className={`w-full py-3 rounded-xl transition-all flex flex-col items-center justify-center gap-1 border-2 border-dashed active:scale-97 ${
                      sigReq.isUrgent 
                        ? 'bg-orange-50 border-orange-300 text-orange-600 hover:bg-orange-100 hover:border-orange-400 shadow-sm' 
                        : 'bg-white border-stone-300 text-stone-400 hover:border-blue-300 hover:text-blue-500 hover:bg-blue-50'
                    }`}
                  >
                    <PenTool size={20} />
                    <span className="text-xs font-bold">
                      {sigReq.canAddExtra ? '追加署名を行う' : '電子署名を行う'}
                    </span>
                    <span className="text-[9px] opacity-70">
                      {clinicSettings?.signatureMode === 'strict' ? '※厳格証拠モードで保存されます' : '※署名後は変更できません'}
                    </span>
                  </button>
                )}
              </div>
            )}
          </div>

          {/* Right: Form */}
          <div className={`w-full md:w-2/3 p-6 overflow-y-auto flex flex-col gap-6 transition-colors duration-300 ${
            chartMode === 'jusei' ? 'bg-blue-50/30' : 
            chartMode === 'shinkyu' ? 'bg-orange-50/30' : 
            'bg-purple-50/30'
          }`}>
            {error && (
              <div className="bg-red-50 text-red-700 p-3 rounded-xl text-sm flex items-center gap-2">
                <AlertCircle size={16} /> {error}
              </div>
            )}

            {/* 施術タイマー */}
            <div className={`border rounded-2xl p-5 shadow-sm transition-all duration-300 ${timerStyles.bg} ${timerStyles.border} ${timerStyles.ring}`}>
              <div className="flex justify-between items-center mb-4">
                <div className="flex flex-col">
                  <h3 className="text-sm font-bold text-stone-800 flex items-center gap-2">
                    <Clock size={16} className={timerStyles.icon} />
                    施術タイマー
                  </h3>
                  {isTimerFinished && <span className="text-[10px] font-black text-rose-500 mt-0.5">時間になりました</span>}
                </div>
                <div className="flex items-center gap-2">
                  <div className={`text-4xl tracking-widest font-black font-mono tabular-nums w-32 text-center transition-colors ${timerStyles.text}`}>
                    {formatTime(timerSeconds)}
                  </div>
                  <div className="flex flex-col gap-1 ml-2">
                    <div className="flex gap-1">
                      <button 
                        onClick={() => setIsFullscreenTimer(true)}
                        className="p-1.5 rounded-lg text-slate-500 hover:bg-slate-200 transition-colors bg-white border border-slate-200 shadow-sm"
                        title="全画面表示"
                      >
                        <Maximize2 size={16} />
                      </button>
                      <button 
                        onClick={() => handleTimerAdd(5)}
                        disabled={timerSeconds === 0 && !isTimerRunning && !isTimerFinished}
                        className="px-2 py-1.5 rounded-lg text-xs font-black bg-white border border-stone-200 shadow-sm text-stone-700 hover:bg-stone-50 active:scale-95 disabled:opacity-50 transition-all flex items-center gap-1"
                      >
                        +5分
                      </button>
                    </div>
                    <div className="flex gap-1">
                      <button 
                        onClick={handleTimerToggle}
                        disabled={timerSeconds === 0}
                        className={`px-3 py-2 rounded-lg text-xs font-bold transition-all shadow-sm disabled:opacity-50 flex-1 ${isTimerRunning ? 'bg-amber-100 text-amber-700 hover:bg-amber-200 border border-amber-200' : 'bg-teal-500 text-white hover:bg-teal-600 border border-teal-600'}`}
                      >
                        {isTimerRunning ? '一時停止' : '再開'}
                      </button>
                      <button 
                        onClick={handleTimerReset}
                        disabled={timerSeconds === 0 && !isTimerFinished}
                        className="px-3 py-2 rounded-lg text-xs font-bold bg-white text-stone-600 border border-stone-200 shadow-sm hover:bg-stone-100 transition-all disabled:opacity-50"
                      >
                        リセット
                      </button>
                    </div>
                  </div>
                </div>
              </div>
              <div className="flex flex-wrap gap-2 pt-2 border-t border-stone-200/50">
                {[5, 10, 15, 20, 30, 60, 90, 120].map(m => (
                  <button
                    key={m}
                    onClick={() => handleTimerAdd(m)}
                    className="flex-1 min-w-[36px] py-2 bg-white border border-stone-200 shadow-sm rounded-xl text-stone-600 text-xs font-bold hover:bg-teal-50 hover:border-teal-200 hover:text-teal-700 active:scale-95 transition-all outline-none"
                  >
                    {m}分
                  </button>
                ))}
              </div>
            </div>

            {/* カレンダーエリア（当月） */}
            <div className="bg-white border border-stone-100 rounded-2xl p-5 shadow-sm">
              <h3 className="text-sm font-semibold text-stone-800 mb-3 flex items-center gap-2">
                <Clock size={16} className="text-stone-400" />
                来院カレンダー（当月）
              </h3>
              <div className="grid grid-cols-7 gap-1 text-center">
                {['日', '月', '火', '水', '木', '金', '土'].map(d => (
                  <div key={d} className="text-[10px] font-bold text-stone-400 pb-1">{d}</div>
                ))}
                {Array.from({ length: 31 }).map((_, i) => {
                  const day = i + 1;
                  const isToday = day === new Date().getDate();
                  const hasVisit = history.some(h => h.visitDate && parseInt(h.visitDate.split('-')[2]) === day);
                  return (
                    <div 
                      key={i} 
                      className={`aspect-square flex flex-col items-center justify-center rounded-lg text-[10px] relative ${
                        isToday ? 'bg-blue-50 text-blue-600 font-bold border border-blue-100' : 'text-stone-500'
                      }`}
                    >
                      {day}
                      {hasVisit && (
                        <div className="w-1 h-1 bg-emerald-500 rounded-full absolute bottom-1" />
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* メイン入力エリア：主訴セクション枠 */}
            <div className="bg-blue-50/30 border-2 border-blue-400 rounded-2xl p-6 shadow-md flex flex-col gap-4 ring-4 ring-blue-400/5">
              <div className="flex items-center justify-between border-b border-blue-100 pb-2">
                <h3 className="text-sm font-bold text-blue-800 flex items-center gap-2">
                  <Sparkles size={16} className="text-blue-500" />
                  主訴・受傷機序
                </h3>
                <span className="text-[10px] font-bold text-blue-500 bg-blue-100 px-2 py-0.5 rounded">最優先入力</span>
              </div>

              {/* 前回との差分表示エリア */}
              <div className="bg-blue-50 border border-blue-200 rounded-xl p-5 shadow-sm">
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-1.5 h-5 bg-blue-500 rounded-full" />
                  <span className="text-[13px] font-black text-blue-900 uppercase tracking-widest">前回との差分 (AI解析)</span>
                </div>
                <div className="grid grid-cols-1 gap-2.5">
                  <div className="flex items-center gap-3 text-xs text-stone-700 bg-white p-2.5 rounded-xl border border-blue-100 shadow-sm">
                    <span className="flex items-center justify-center w-6 h-6 bg-blue-100 text-blue-600 rounded-lg font-black text-sm">+</span>
                    <span className="font-medium">肩の症状が追加（右肩甲骨付近の違和感）</span>
                  </div>
                  <div className="flex items-center gap-3 text-xs text-stone-700 bg-white p-2.5 rounded-xl border border-blue-100 shadow-sm">
                    <span className="flex items-center justify-center w-6 h-6 bg-stone-100 text-stone-500 rounded-lg font-black text-sm">→</span>
                    <span className="font-medium">腰の痛みは継続（前回よりやや軽減）</span>
                  </div>
                  <div className="flex items-center gap-3 text-xs text-stone-400 bg-white/60 p-2.5 rounded-xl border border-blue-50 italic">
                    <span className="flex items-center justify-center w-6 h-6 bg-red-50 text-red-300 rounded-lg font-black text-sm">−</span>
                    <span>首の重だるさは消失</span>
                  </div>
                </div>
              </div>

            {/* Questionnaire Section */}
            {flags.enableQuestionnaire && questionnaire && (
              <div className="bg-emerald-50 border-2 border-emerald-200 rounded-2xl p-5 shadow-md mb-6 relative overflow-hidden">
                <div className="absolute top-0 right-0 bg-emerald-200 text-emerald-800 text-[10px] font-black px-3 py-1 rounded-bl-xl shadow-sm">
                  事前問診AI
                </div>
                <div className="flex justify-between items-center mb-4">
                  <h3 className="font-bold text-emerald-800 flex items-center gap-2">
                    <ClipboardCheck size={18} />
                    事前問診データ
                  </h3>
                  <div className="flex gap-2">
                    {questionnaireApplied ? (
                      <span className="text-[10px] font-black text-emerald-600 bg-emerald-100 flex items-center gap-1 px-3 py-2 rounded-xl border border-emerald-200 shadow-sm">
                        <CheckCircle2 size={12} /> 反映済み
                      </span>
                    ) : (
                      <>
                        <button
                          onClick={() => setShowQuestionnaireDetail(true)}
                          className="text-xs font-bold text-emerald-700 bg-white border border-emerald-200 hover:bg-emerald-50 px-3 py-2 rounded-xl transition-all shadow-sm active:scale-95 flex items-center gap-1"
                        >
                          <Search size={14} /> 問診詳細
                        </button>
                        <button
                          onClick={() => setShowReflectConfirm(true)}
                          className="text-xs font-black text-white bg-emerald-600 hover:bg-emerald-700 px-4 py-2 rounded-xl transition-all shadow-sm active:scale-95 flex items-center gap-1"
                        >
                          <Sparkles size={14} /> 問診から反映
                        </button>
                      </>
                    )}
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div className="bg-white/80 p-3 rounded-xl border border-emerald-100">
                    <div className="text-[10px] font-bold text-emerald-600 mb-1">症状</div>
                    <div className="text-sm font-bold text-stone-800">{questionnaire.symptom}</div>
                  </div>
                  <div className="bg-white/80 p-3 rounded-xl border border-emerald-100">
                    <div className="text-[10px] font-bold text-emerald-600 mb-1">いつ</div>
                    <div className="text-sm font-bold text-stone-800">{questionnaire.whenText}</div>
                  </div>
                  <div className="bg-white/80 p-3 rounded-xl border border-emerald-100">
                    <div className="text-[10px] font-bold text-emerald-600 mb-1">どこで</div>
                    <div className="text-sm font-bold text-stone-800">{questionnaire.whereText}</div>
                  </div>
                  <div className="bg-white/80 p-3 rounded-xl border border-emerald-100">
                    <div className="text-[10px] font-bold text-emerald-600 mb-1">きっかけ</div>
                    <div className="text-sm font-bold text-stone-800">{questionnaire.triggerText}</div>
                  </div>
                </div>

                {questionnaire.freeText && (
                  <div className="bg-white/80 p-3 rounded-xl mb-4 border border-emerald-100">
                    <div className="text-[10px] font-bold text-emerald-600 mb-1">一言メモ</div>
                    <div className="text-sm text-stone-700 leading-relaxed">{questionnaire.freeText}</div>
                  </div>
                )}

                <div className="border-t border-emerald-200 pt-4 bg-white/40 -mx-5 -mb-5 px-5 pb-5">
                  <div className="text-[10px] font-bold text-emerald-600 mb-2 flex items-center gap-1">
                    <Sparkles size={12} /> AI生成プレビュー
                  </div>
                  <div className="space-y-3">
                    <div className="p-3 bg-white/90 rounded-xl border border-emerald-100 shadow-sm">
                      <div className="text-[10px] font-bold text-stone-400 mb-1">主訴</div>
                      <div className="text-sm text-stone-800 font-medium">{questionnaire.aiGenerated?.chiefComplaint}</div>
                    </div>
                    <div className="p-3 bg-white/90 rounded-xl border border-emerald-100 shadow-sm">
                      <div className="text-[10px] font-bold text-stone-400 mb-1">受傷機序</div>
                      <div className="text-sm text-stone-800 leading-relaxed">{questionnaire.aiGenerated?.injuryMechanism}</div>
                    </div>
                  </div>
                  <button
                    onClick={handleReflectQuestionnaire}
                    className="w-full mt-4 py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold text-sm shadow-md transition-all active:scale-95 flex items-center justify-center gap-2"
                  >
                    <ClipboardCheck size={18} />
                    この内容をカルテに反映する
                  </button>
                </div>
              </div>
            )}

            {/* AI Draft Section */}
            {flags.enableAI && (
              <div className="bg-purple-50 border border-purple-100 rounded-xl p-4">
                <div className="flex items-center gap-2 mb-3 text-purple-800 font-bold">
                  <Sparkles size={18} />
                  <h3>AI下書き作成</h3>
                </div>
                
                {aiError && (
                  <div className="bg-red-50 text-red-700 p-2 rounded-lg text-xs flex items-center gap-1 mb-3">
                    <AlertCircle size={14} /> {aiError}
                  </div>
                )}

                <div className="grid grid-cols-2 gap-3 mb-3">
                  <div>
                    <label className="block text-[10px] font-bold text-purple-600 mb-1">傷病・症状</label>
                    <input 
                      type="text" 
                      value={aiKeywords.symptom}
                      onChange={e => setAiKeywords({...aiKeywords, symptom: e.target.value})}
                      placeholder="例: 腰痛" 
                      className="w-full p-2 border border-purple-200 rounded-lg text-xs focus:ring-2 focus:ring-purple-400 outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-purple-600 mb-1">日付・動作</label>
                    <input 
                      type="text" 
                      value={aiKeywords.when}
                      onChange={e => setAiKeywords({...aiKeywords, when: e.target.value})}
                      placeholder="例: 4/1 起床時" 
                      className="w-full p-2 border border-purple-200 rounded-lg text-xs focus:ring-2 focus:ring-purple-400 outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-purple-600 mb-1">場所</label>
                    <input 
                      type="text" 
                      value={aiKeywords.where}
                      onChange={e => setAiKeywords({...aiKeywords, where: e.target.value})}
                      placeholder="例: 自宅" 
                      className="w-full p-2 border border-purple-200 rounded-lg text-xs focus:ring-2 focus:ring-purple-400 outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-purple-600 mb-1">補足</label>
                    <input 
                      type="text" 
                      value={aiKeywords.memo}
                      onChange={e => setAiKeywords({...aiKeywords, memo: e.target.value})}
                      placeholder="例: 運動痛" 
                      className="w-full p-2 border border-purple-200 rounded-lg text-xs focus:ring-2 focus:ring-purple-400 outline-none"
                    />
                  </div>
                </div>

                <div className="flex justify-end">
                  <button 
                    onClick={handleGenerateDraft}
                    disabled={isGenerating}
                    className="flex items-center gap-1.5 bg-purple-100 hover:bg-purple-200 text-purple-700 px-4 py-2 rounded-lg text-sm font-bold transition-colors disabled:opacity-50"
                  >
                    {isGenerating ? <Loader2 size={16} className="animate-spin" /> : <Sparkles size={16} />}
                    {isGenerating ? '生成中...' : 'AI下書きを作成'}
                  </button>
                </div>
              </div>
            )}

            {isDraftRestored && (
              <div className="bg-blue-50 text-blue-700 p-3 rounded-xl text-sm flex items-center justify-between gap-2 border border-blue-100">
                <div className="flex items-center gap-2">
                  <AlertCircle size={16} /> 
                  <span>前回の入力途中データを復元しました</span>
                </div>
                <button 
                  onClick={() => {
                    setChiefComplaint(initialData.chiefComplaint);
                    setTreatmentNote(initialData.treatmentNote);
                    setMemo(initialData.memo);
                    setBodyImage(initialData.bodyImage);
                    setIsDraftRestored(false);
                  }}
                  className="text-xs bg-white px-3 py-1.5 rounded-lg border border-blue-200 hover:bg-blue-50 font-bold transition-colors"
                >
                  保存済み内容に戻す
                </button>
              </div>
            )}
            
            {/* 受傷機序 (Initial Visit) */}
            <div className="bg-white border border-stone-200 rounded-2xl p-5 shadow-sm">
              <div className="flex justify-between items-center mb-4">
                <div>
                  <h3 className="font-bold text-stone-800 flex items-center gap-2">
                    <AlertCircle size={18} className="text-blue-500" />
                    受傷機序 (初回・負傷時)
                  </h3>
                  <p className="text-[10px] text-stone-400 ml-7">原因・きっかけを記録します</p>
                </div>
                <div className="flex items-center gap-2">
                  {flags.enableVoiceInput && (
                    <button 
                      onMouseDown={() => handleMicMouseDown('injuryNarrative', (val) => setInjuryMechanism(prev => ({ ...prev, narrative: val })))}
                      onMouseUp={handleMicMouseUp}
                      onTouchStart={() => handleMicMouseDown('injuryNarrative', (val) => setInjuryMechanism(prev => ({ ...prev, narrative: val })))}
                      onTouchEnd={handleMicMouseUp}
                      onClick={() => handleMicClick('injuryNarrative', (val) => setInjuryMechanism(prev => ({ ...prev, narrative: val })))}
                      className={`p-2 rounded-full transition-colors relative ${isListening === 'injuryNarrative' ? 'bg-red-500 text-white animate-pulse' : 'text-stone-400 hover:bg-stone-100'}`}
                      title="音声入力（長押しで録音）"
                    >
                      {isListening === 'injuryNarrative' ? <MicOff size={16} /> : <Mic size={16} />}
                      {isListening === 'injuryNarrative' && isLongPressRef.current && (
                        <span className="absolute -top-8 left-1/2 -translate-x-1/2 bg-red-500 text-white text-[10px] px-2 py-0.5 rounded whitespace-nowrap">録音中</span>
                      )}
                    </button>
                  )}
                  {flags.enableAI && (
                    <button
                      onClick={generateInjuryMechanismNarrative}
                      className="text-xs font-bold text-blue-600 hover:text-blue-700 flex items-center gap-1 bg-blue-50 px-3 py-1.5 rounded-lg transition-colors"
                    >
                      <Sparkles size={14} /> AI文章化
                    </button>
                  )}
                </div>
              </div>
              <div className="grid grid-cols-3 gap-3 mb-4">
                <div>
                  <label className="block text-[10px] font-bold text-stone-500 mb-1">いつ</label>
                  <input 
                    type="text" 
                    value={injuryMechanism.whenText}
                    onChange={e => setInjuryMechanism({...injuryMechanism, whenText: e.target.value})}
                    placeholder="例: 4/10 朝" 
                    className="w-full p-2.5 border border-stone-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-400 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-stone-500 mb-1">どこで</label>
                  <input 
                    type="text" 
                    value={injuryMechanism.whereText}
                    onChange={e => setInjuryMechanism({...injuryMechanism, whereText: e.target.value})}
                    placeholder="例: 自宅の階段" 
                    className="w-full p-2.5 border border-stone-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-400 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-stone-500 mb-1">どのように</label>
                  <input 
                    type="text" 
                    value={injuryMechanism.mechanismText}
                    onChange={e => setInjuryMechanism({...injuryMechanism, mechanismText: e.target.value})}
                    placeholder="例: 踏み外して捻った" 
                    className="w-full p-2.5 border border-stone-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-400 outline-none"
                  />
                </div>
              </div>
              <textarea
                value={injuryMechanism.narrative}
                onChange={e => setInjuryMechanism({...injuryMechanism, narrative: e.target.value})}
                placeholder="受傷機序の本文（AI文章化ボタンで自動生成できます）"
                className={`w-full p-3 border rounded-xl text-sm focus:ring-2 focus:ring-blue-400 outline-none min-h-[80px] transition-colors duration-500 ${highlightedFields.has('injuryMechanism') ? 'bg-blue-50 border-blue-300' : 'border-stone-200'}`}
              />
              <p className="text-[10px] text-stone-400 mt-2">※初回訪問時や新患の場合に入力してください。</p>
            </div>

            <div>
              <div className="flex justify-between items-end mb-1">
              <div className="flex justify-between items-center mb-1">
                <label className="block text-sm font-bold text-stone-600">主訴 (Chief Complaint)</label>
                <div className="flex items-center gap-2">
                  {history.length > 0 && (
                    <button
                      onClick={handleCopyFromHistory}
                      className={`flex items-center gap-1.5 px-3 py-1 rounded-lg text-[11px] font-bold transition-all shadow-sm ${
                        isCopied 
                          ? 'bg-emerald-100 text-emerald-700 border border-emerald-200' 
                          : 'bg-stone-50 text-stone-600 border border-stone-200 hover:bg-stone-100'
                      }`}
                    >
                      {isCopied ? <CheckCircle2 size={12} /> : <Copy size={12} />}
                      {isCopied ? 'コピー完了' : '前回をコピー'}
                    </button>
                  )}
                  {flags.enableVoiceInput && (
                    <button 
                      onMouseDown={() => handleMicMouseDown('chiefComplaint', setChiefComplaint)}
                      onMouseUp={handleMicMouseUp}
                      onTouchStart={() => handleMicMouseDown('chiefComplaint', setChiefComplaint)}
                      onTouchEnd={handleMicMouseUp}
                      onClick={() => handleMicClick('chiefComplaint', setChiefComplaint)}
                      className={`p-1 rounded-full transition-colors relative ${isListening === 'chiefComplaint' ? 'bg-red-500 text-white animate-pulse' : 'text-stone-400 hover:bg-stone-100'}`}
                      title="音声入力（長押しで録音）"
                    >
                      {isListening === 'chiefComplaint' ? <MicOff size={14} /> : <Mic size={14} />}
                      {isListening === 'chiefComplaint' && isLongPressRef.current && (
                        <span className="absolute -top-6 left-1/2 -translate-x-1/2 bg-red-500 text-white text-[8px] px-1 rounded whitespace-nowrap">録音中</span>
                      )}
                    </button>
                  )}
                </div>
              </div>
              <p className="text-[10px] text-stone-400 mb-1">症状・患者の訴えを記録します</p>
                {isAiApplied && (
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-purple-600 bg-purple-100 px-2 py-0.5 rounded flex items-center gap-1">
                      <Sparkles size={12} /> AI下書きを適用中
                    </span>
                    <button onClick={handleUndoAi} className="text-xs text-stone-500 hover:text-stone-700 underline">元に戻す</button>
                    <button onClick={handleClearAi} className="text-xs text-stone-500 hover:text-stone-700 underline">削除</button>
                  </div>
                )}
              </div>
              <textarea
                value={chiefComplaint}
                onChange={e => setChiefComplaint(e.target.value)}
                placeholder="本日の症状や患者の訴え"
                className={`w-full p-3 border rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none resize-none h-20 text-sm transition-colors duration-500 ${highlightedFields.has('chiefComplaint') ? 'bg-blue-50 border-blue-300' : isAiApplied ? 'border-purple-300 bg-purple-50/30' : 'border-stone-200'}`}
              />
            </div>

            </div> {/* 主訴セクション終了 */}

            {/* メイン入力エリア：経過セクション枠 */}
            <div className="bg-white border border-stone-300 rounded-2xl p-6 shadow-sm flex flex-col gap-4">
              <div className="flex items-center justify-between border-b border-stone-100 pb-2">
                <h3 className="text-sm font-semibold text-stone-800 flex items-center gap-2">
                  <Clock size={16} className="text-emerald-500" />
                  経過・施術内容
                </h3>
              </div>

            {/* 学習候補 */}
            {/* 
              // TODO:
              // よく使う候補の固定ピン留め
              // 候補のカテゴリ分岐（首・腰・肩など）
              // 人体図の描画部位と候補連動
              // staff別によく使う候補表示
              // 候補タップ履歴による並び最適化
            */}
            {flags.enableAiLearning && learningSuggestions.length > 0 && (
              <div className="mb-4">
                <div className="text-xs font-bold text-stone-500 mb-2 flex items-center gap-1">
                  <Sparkles size={12} className="text-emerald-500" /> よく使う主訴候補
                </div>
                <div className="flex flex-col gap-2">
                  {learningSuggestions.map((suggestion, idx) => {
                    const isTop = idx === 0;
                    return (
                      <button
                        key={idx}
                        onClick={() => {
                          setPreAiData({ chiefComplaint, treatmentNote, memo, injuryMechanism });
                          setChiefComplaint(suggestion.chiefComplaint);
                          setIsAiApplied(true);
                        }}
                        className={`w-full text-left p-3 sm:p-4 rounded-xl border transition-all active:scale-[0.99] active:bg-stone-100 ${
                          isTop 
                            ? 'border-emerald-300 bg-emerald-50/50 hover:bg-emerald-50 shadow-sm' 
                            : 'border-stone-200 bg-white hover:bg-stone-50 shadow-sm'
                        }`}
                      >
                        <div className="flex items-center gap-2 mb-1.5">
                          {isTop && (
                            <span className="bg-emerald-500 text-white text-[10px] px-2 py-0.5 rounded-md font-bold shadow-sm">
                              最適
                            </span>
                          )}
                          <div className={`font-bold text-sm ${isTop ? 'text-emerald-800' : 'text-stone-700'}`}>
                            {suggestion.symptom} {suggestion.triggerText && <span className="text-xs font-normal text-stone-500 ml-1">({suggestion.triggerText})</span>}
                          </div>
                        </div>
                        <div className="line-clamp-2 text-sm text-stone-600 leading-relaxed">
                          {suggestion.chiefComplaint}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* 経過カルテ (Progress Notes) */}
            <div className="bg-white border border-stone-200 rounded-2xl p-5 shadow-sm">
              <div className="flex justify-between items-center mb-4">
                <h3 className="font-bold text-stone-800 flex items-center gap-2">
                  <Clock size={18} className="text-emerald-500" />
                  経過カルテ (通院記録)
                </h3>
                <div className="flex gap-2">
                  <button
                    onClick={() => setShowSummary(true)}
                    className="text-xs font-bold text-stone-600 hover:text-stone-700 flex items-center gap-1 bg-stone-100 px-3 py-1.5 rounded-lg transition-colors"
                  >
                    <Printer size={14} /> 30日まとめ
                  </button>
                  {history.length > 0 && history[0].progressNotes && history[0].progressNotes.length > 0 && (
                    <button
                      onClick={copyPreviousProgressNote}
                      className="text-xs font-bold text-blue-600 hover:text-blue-700 flex items-center gap-1 bg-blue-50 px-3 py-1.5 rounded-lg transition-colors"
                    >
                      <Copy size={14} /> 前回コピー
                    </button>
                  )}
                  <button
                    onClick={addProgressNote}
                    className="text-xs font-bold text-emerald-600 hover:text-emerald-700 flex items-center gap-1 bg-emerald-50 px-3 py-1.5 rounded-lg transition-colors"
                  >
                    <Plus size={14} /> 追加
                  </button>
                </div>
              </div>

              {progressNotes.length > 0 ? (
                <div className="space-y-4">
                  {progressNotes.map((note) => (
                    <div key={note.id} className="p-4 border border-stone-100 bg-stone-50/50 rounded-xl relative group">
                      <button 
                        onClick={() => removeProgressNote(note.id)}
                        className="absolute top-2 right-2 p-1.5 text-stone-300 hover:text-red-500 hover:bg-red-50 rounded-lg opacity-0 group-hover:opacity-100 transition-all"
                      >
                        <Trash2 size={14} />
                      </button>
                      <div className="grid grid-cols-2 gap-3 mb-3">
                        <div>
                          <label className="block text-[10px] font-bold text-stone-400 mb-1">日付</label>
                          <input 
                            type="date" 
                            value={note.date}
                            onChange={e => updateProgressNote(note.id, { date: e.target.value })}
                            className="w-full p-2 border border-stone-200 rounded-lg text-xs focus:ring-2 focus:ring-emerald-400 outline-none bg-white"
                          />
                        </div>
                        <div>
                          <label className="block text-[10px] font-bold text-stone-400 mb-1">施術内容</label>
                          <input 
                            type="text" 
                            value={note.treatmentSummary}
                            onChange={e => updateProgressNote(note.id, { treatmentSummary: e.target.value })}
                            placeholder="例: 腰部マッサージ"
                            className="w-full p-2 border border-stone-200 rounded-lg text-xs focus:ring-2 focus:ring-emerald-400 outline-none bg-white"
                          />
                        </div>
                      </div>
                      <div className="flex justify-between items-center mb-1">
                        <label className="block text-[10px] font-bold text-stone-400">経過メモ</label>
                        {flags.enableVoiceInput && (
                          <button 
                            onMouseDown={() => handleMicMouseDown(`progress-${note.id}`, (val) => updateProgressNote(note.id, { progressText: val }))}
                            onMouseUp={handleMicMouseUp}
                            onTouchStart={() => handleMicMouseDown(`progress-${note.id}`, (val) => updateProgressNote(note.id, { progressText: val }))}
                            onTouchEnd={handleMicMouseUp}
                            onClick={() => handleMicClick(`progress-${note.id}`, (val) => updateProgressNote(note.id, { progressText: val }))}
                            className={`p-1 rounded-full transition-colors relative ${isListening === `progress-${note.id}` ? 'bg-red-500 text-white animate-pulse' : 'text-stone-400 hover:bg-stone-100'}`}
                            title="音声入力（長押しで録音）"
                          >
                            {isListening === `progress-${note.id}` ? <MicOff size={12} /> : <Mic size={12} />}
                            {isListening === `progress-${note.id}` && isLongPressRef.current && (
                              <span className="absolute -top-6 left-1/2 -translate-x-1/2 bg-red-500 text-white text-[8px] px-1 rounded whitespace-nowrap">録音中</span>
                            )}
                          </button>
                        )}
                      </div>
                      <div className="relative">
                        <textarea
                          value={note.progressText}
                          onChange={e => updateProgressNote(note.id, { progressText: e.target.value })}
                          placeholder="患者の経過・状態"
                          className="w-full p-2.5 border border-stone-200 rounded-lg text-xs focus:ring-2 focus:ring-emerald-400 outline-none min-h-[60px] bg-white"
                        />
                        <button
                          onClick={() => generateProgressDraft(note.id)}
                          className="absolute bottom-2 right-2 text-[10px] font-bold text-emerald-600 hover:text-emerald-700 flex items-center gap-1 bg-emerald-50 px-2 py-1 rounded transition-colors"
                        >
                          <Sparkles size={10} /> AI下書き
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 border-2 border-dashed border-stone-100 rounded-xl">
                  <p className="text-xs text-stone-400">経過カルテがありません。「追加」ボタンで作成してください。</p>
                </div>
              )}
              <p className="text-[10px] text-stone-400 mt-3">※通院ごとの経過を記録します。30日まとめ印刷に反映されます。</p>
            </div>

            <div>
              <div className="flex justify-between items-center mb-1">
                <label className="block text-sm font-bold text-stone-600">施術内容 (Treatment Note)</label>
                {flags.enableVoiceInput && (
                  <button 
                    onMouseDown={() => handleMicMouseDown('treatmentNote', setTreatmentNote)}
                    onMouseUp={handleMicMouseUp}
                    onTouchStart={() => handleMicMouseDown('treatmentNote', setTreatmentNote)}
                    onTouchEnd={handleMicMouseUp}
                    onClick={() => handleMicClick('treatmentNote', setTreatmentNote)}
                    className={`p-1 rounded-full transition-colors relative ${isListening === 'treatmentNote' ? 'bg-red-500 text-white animate-pulse' : 'text-stone-400 hover:bg-stone-100'}`}
                    title="音声入力（長押しで録音）"
                  >
                    {isListening === 'treatmentNote' ? <MicOff size={14} /> : <Mic size={14} />}
                    {isListening === 'treatmentNote' && isLongPressRef.current && (
                      <span className="absolute -top-6 left-1/2 -translate-x-1/2 bg-red-500 text-white text-[8px] px-1 rounded whitespace-nowrap">録音中</span>
                    )}
                  </button>
                )}
              </div>
              <textarea
                value={treatmentNote}
                onChange={e => setTreatmentNote(e.target.value)}
                placeholder="実施した施術内容、指導内容など"
                className="w-full p-3 border border-stone-200 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none resize-none h-24 text-sm"
              />
            </div>

            <div>
              <div className="flex justify-between items-center mb-1">
                <label className="block text-sm font-bold text-stone-600">社内メモ (Memo)</label>
                {flags.enableVoiceInput && (
                  <button 
                    onMouseDown={() => handleMicMouseDown('memo', setMemo)}
                    onMouseUp={handleMicMouseUp}
                    onTouchStart={() => handleMicMouseDown('memo', setMemo)}
                    onTouchEnd={handleMicMouseUp}
                    onClick={() => handleMicClick('memo', setMemo)}
                    className={`p-1 rounded-full transition-colors relative ${isListening === 'memo' ? 'bg-red-500 text-white animate-pulse' : 'text-stone-400 hover:bg-stone-100'}`}
                    title="音声入力（長押しで録音）"
                  >
                    {isListening === 'memo' ? <MicOff size={14} /> : <Mic size={14} />}
                    {isListening === 'memo' && isLongPressRef.current && (
                      <span className="absolute -top-6 left-1/2 -translate-x-1/2 bg-red-500 text-white text-[8px] px-1 rounded whitespace-nowrap">録音中</span>
                    )}
                  </button>
                )}
              </div>
              <textarea
                value={memo}
                onChange={e => setMemo(e.target.value)}
                placeholder="スタッフ間での共有事項など"
                className={`w-full p-3 border rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none resize-none h-16 text-sm transition-colors duration-500 ${highlightedFields.has('memo') ? 'bg-blue-50 border-blue-300' : 'bg-yellow-50 border-stone-200'}`}
              />
              <div className="flex flex-wrap gap-2 mt-2">
                {TREATMENT_NOTE_TEMPLATES.map(t => (
                  <button
                    key={t}
                    onClick={() => appendText(setMemo, t)}
                    className="px-3 py-2 bg-stone-100 hover:bg-stone-200 text-stone-700 text-xs font-bold rounded-lg transition-colors min-h-[44px] flex items-center justify-center"
                  >
                    {t}
                  </button>
                ))}
              </div>
            </div>
            </div> {/* 経過セクション終了 */}

            {/* メディアエリア */}
            <div className="bg-white border border-stone-200 rounded-2xl p-5 shadow-sm transition-all hover:shadow-md">
              <h3 className="text-sm font-bold text-stone-800 mb-4 flex items-center gap-2">
                <ImageIcon size={18} className="text-blue-500" />
                メディア・資料
              </h3>
              <div className="grid grid-cols-2 gap-3">
                <button 
                  onClick={() => setShowPhotoModal(true)}
                  className="flex flex-col items-center justify-center gap-2 p-4 bg-stone-50 border border-stone-200 rounded-2xl group transition-all hover:bg-white hover:border-blue-400 hover:shadow-lg active:scale-95"
                >
                  <div className="w-10 h-10 rounded-full bg-blue-50 text-blue-500 flex items-center justify-center transition-transform group-hover:scale-110">
                    <ImageIcon size={20} />
                  </div>
                  <div className="text-center">
                    <div className="text-xs font-black text-stone-800">写真ギャラリー</div>
                    <div className="text-[9px] text-stone-400 font-bold mt-0.5 whitespace-nowrap">患部写真・経過比較</div>
                  </div>
                </button>

                <button 
                  onClick={() => setShowBodyDrawModal(true)}
                  className="flex flex-col items-center justify-center gap-2 p-4 bg-stone-50 border border-stone-200 rounded-2xl group transition-all hover:bg-white hover:border-emerald-400 hover:shadow-lg active:scale-95"
                >
                  <div className="w-10 h-10 rounded-full bg-emerald-50 text-emerald-500 flex items-center justify-center transition-transform group-hover:scale-110">
                    <User size={20} />
                  </div>
                  <div className="text-center">
                    <div className="text-xs font-black text-stone-800">人体図メモ</div>
                    <div className="text-[9px] text-stone-400 font-bold mt-0.5 whitespace-nowrap">部位メモ・記録</div>
                  </div>
                </button>
              </div>
              
              <div className="mt-3 flex gap-2">
                <button
                  onClick={() => {
                    if (reservation.patientId) {
                      navigate(`/ledger/gallery/${clinicId}/${reservation.patientId}/${reservation.id}`);
                    }
                  }}
                  disabled={!reservation.patientId}
                  className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs font-bold bg-white text-stone-600 border border-stone-200 hover:bg-stone-50 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
                >
                  <ImageIcon size={14} />
                  過去の全画像を表示
                </button>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* 回数券 */}
              <div className="bg-white border border-stone-200 rounded-xl p-5 shadow-sm">
                <div className="flex justify-between items-center mb-3">
                  <h3 className="text-sm font-bold text-stone-800 flex items-center gap-2">
                    <Ticket size={16} className="text-orange-500" />
                    回数券
                  </h3>
                  <span className="flex items-baseline gap-1 bg-orange-50 px-3 py-1 rounded-full border border-orange-200 shadow-sm">
                    <span className="text-[10px] font-bold text-orange-400 uppercase">残り</span>
                    <span className="text-xl font-black text-orange-600 leading-none">5</span>
                    <span className="text-[10px] font-bold text-orange-600">回</span>
                  </span>
                </div>
                <div 
                  onClick={() => setShowCouponDetail(!showCouponDetail)}
                  className={`p-4 rounded-xl border transition-all cursor-pointer group mb-4 ${
                    showCouponDetail 
                      ? 'bg-white border-orange-300 shadow-inner' 
                      : 'bg-stone-50 border-stone-100 hover:bg-white hover:border-orange-200 hover:shadow-md'
                  }`}
                >
                  <div className="flex justify-between items-start">
                    <div className="text-sm font-black text-stone-800 mb-1.5 uppercase tracking-wide">鍼灸回数券 10回</div>
                    {showCouponDetail ? <ChevronUp size={16} className="text-orange-500" /> : <ChevronDown size={14} className="text-stone-400" />}
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="text-[10px] text-stone-400 font-medium opacity-60">有効期限: 2026/12/31</div>
                    {!showCouponDetail && <div className="text-[9px] bg-orange-100 text-orange-600 px-1.5 py-0.5 rounded font-bold">クリックで詳細</div>}
                  </div>
                  
                  {showCouponDetail && (
                    <div className="mt-4 pt-4 border-t border-stone-100 space-y-3 animate-in fade-in slide-in-from-top-2 duration-300">
                      <div className="flex justify-between items-center text-[11px] px-1">
                        <span className="text-stone-400 font-bold">購入日</span>
                        <span className="text-stone-800 font-black">2026/01/15</span>
                      </div>
                      <div className="flex justify-between items-center text-[11px] px-1">
                        <span className="text-stone-400 font-bold">担当スタッフ</span>
                        <span className="text-stone-800 font-black">山田 太郎</span>
                      </div>
                      <div className="bg-orange-50/30 p-3 rounded-xl border border-orange-100 shadow-sm mt-3">
                        <div className="text-[9px] font-black text-orange-400 uppercase mb-1">施設メモ</div>
                        <div className="text-[11px] text-stone-700 leading-relaxed font-medium">
                          肩こり改善コース用。週1回のペースで集中施術を推奨しています。
                        </div>
                      </div>
                    </div>
                  )}
                </div>
                <div className="flex gap-2 pt-1">
                  <button className="flex-1 flex items-center justify-center gap-2 py-3.5 bg-red-600 text-white rounded-2xl text-base font-black hover:brightness-110 hover:shadow-xl transition-all active:scale-95 active:bg-red-800 active:shadow-inner border-b-4 border-red-800 active:border-b-0">
                    <MinusCircle size={22} /> 1回消費する
                  </button>
                </div>
              </div>

              {/* サブスク */}
              <div className="bg-white border border-stone-200 rounded-xl p-5 shadow-sm">
                <h3 className="text-sm font-bold text-stone-800 mb-3 flex items-center gap-2">
                  <Sparkles size={16} className="text-purple-500" />
                  サブスクリプション
                </h3>
                <div className="p-3 bg-purple-50/50 rounded-lg border border-purple-100 mb-3">
                  <div className="text-xs font-bold text-purple-800 mb-1">月額通い放題プラン</div>
                  <div className="text-[10px] text-purple-400">ステータス: 有効</div>
                </div>
                <button className="w-full py-2 bg-white text-purple-600 border border-purple-200 rounded-lg text-xs font-bold hover:bg-purple-50 transition-colors active:scale-95">
                  詳細を見る
                </button>
              </div>

              {/* 自費履歴 */}
              <div className="bg-white border border-stone-200 rounded-2xl p-5 shadow-sm md:col-span-2 transition-all hover:shadow-md">
                <h3 className="text-sm font-bold text-stone-800 mb-4 flex items-center gap-2">
                  <CreditCard size={18} className="text-emerald-500" />
                  自費履歴 (直近3件)
                </h3>
                <div className="grid grid-cols-1 gap-2.5">
                  {[
                    { date: '2026/04/10', item: '特別鍼灸施術', price: '¥5,500' },
                    { date: '2026/04/03', item: '骨盤矯正', price: '¥3,300' },
                    { date: '2026/03/27', item: '特別鍼灸施術', price: '¥5,500' }
                  ].map((item, idx) => (
                    <div key={idx} className="flex justify-between items-center p-3.5 bg-emerald-50/30 rounded-2xl border border-emerald-100 transition-all hover:bg-emerald-50 hover:shadow-sm group">
                      <div className="flex flex-col gap-0.5">
                        <span className="text-xs font-black text-stone-800 tracking-tight group-hover:text-emerald-700 transition-colors">{item.item}</span>
                        <div className="flex items-center gap-1.5">
                          <span className="text-[9px] text-stone-400 font-bold uppercase tracking-wider">{item.date}</span>
                          <span className="w-1 h-1 bg-emerald-200 rounded-full" />
                          <span className="text-[8px] text-emerald-600 font-black uppercase tracking-tighter">SUCCESS</span>
                        </div>
                      </div>
                      <div className="text-right flex flex-col items-end">
                        <span className="text-base font-black text-emerald-700 leading-none">{item.price}</span>
                        <span className="text-[8px] text-emerald-600/40 font-black mt-1 uppercase">PAID</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* 次回施術内容 */}
              <div className="bg-white border border-stone-200 rounded-xl p-4 shadow-sm md:col-span-2">
                <h3 className="text-sm font-semibold text-stone-800 mb-2">次回施術内容</h3>
                <div className="h-20 border-2 border-dashed border-stone-200 rounded-lg flex items-center justify-center text-stone-400 text-sm bg-stone-50">
                  次回施術内容枠
                </div>
              </div>
            </div>

          </div>
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-stone-200 bg-white flex justify-between items-center shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)]">
          <div className="flex gap-4 items-center">
            <button
              onClick={handleProceedToPayment}
              disabled={saving || isSuccess}
              className="flex items-center justify-center gap-3 px-10 py-3 bg-orange-500 text-white border-b-4 border-orange-700 rounded-2xl font-black hover:bg-orange-600 hover:border-orange-800 transition-all active:translate-y-0.5 active:border-b-2 min-h-[52px] shadow-lg shadow-orange-200 disabled:opacity-50"
            >
              <CreditCard size={22} />
              <span className="text-lg">会計へ進む</span>
            </button>
            <button
              onClick={handleNextAppointment}
              className="flex items-center justify-center gap-2 px-8 py-3 bg-white text-blue-600 border-2 border-blue-400 rounded-2xl font-black hover:bg-blue-50 transition-all active:scale-[0.98] min-h-[52px]"
            >
              <Clock size={18} />
              <span className="text-sm">次回予約へ</span>
            </button>
          </div>
          <div className="flex gap-3">
            <button
              onClick={handleClose}
              disabled={saving || isSuccess}
              className="px-4 py-2 text-stone-600 font-bold hover:bg-stone-100 rounded-xl transition-colors min-h-[44px]"
            >
              キャンセル
            </button>
            <button
              onClick={handleSave}
              disabled={saving || isSuccess}
              className={`flex items-center gap-2 px-6 py-2 rounded-xl font-bold transition-colors min-h-[44px] disabled:opacity-50 ${
                isSuccess 
                  ? 'bg-emerald-100 text-emerald-700' 
                  : 'bg-emerald-600 text-white hover:bg-emerald-700'
              }`}
            >
              {isSuccess ? (
                <><CheckCircle2 size={18} /> 保存しました</>
              ) : saving ? (
                <><Loader2 size={18} className="animate-spin" /> 保存中...</>
              ) : (
                <><Save size={18} /> 保存して閉じる</>
              )}
            </button>
          </div>
        </div>

        {/* 30-Day Summary Modal */}
        {showSummary && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-md z-[60] flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl max-h-[85vh] flex flex-col overflow-hidden">
              <div className="p-4 border-b border-stone-200 flex justify-between items-center bg-stone-50">
                <h3 className="font-bold text-stone-800 flex items-center gap-2">
                  <Printer size={20} className="text-stone-600" />
                  経過カルテ 30日まとめ (印刷プレビュー)
                </h3>
                <button onClick={() => setShowSummary(false)} className="p-2 text-stone-400 hover:text-stone-600 rounded-full">
                  <X size={24} />
                </button>
              </div>
              <div className="flex-1 overflow-y-auto p-8 bg-stone-50">
                {/* Printable Area */}
                <div id="printable-summary" className="bg-white shadow-sm border border-stone-200 p-10 min-h-[297mm] w-full mx-auto text-stone-800 font-sans">
                  <div className="border-b-2 border-stone-800 pb-4 mb-8 flex justify-between items-end">
                    <div>
                      <h1 className="text-2xl font-bold tracking-tight mb-1">経過記録（30日分）</h1>
                      <p className="text-sm text-stone-500">対象期間: 直近30日間</p>
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-bold">{patientName} 様</p>
                      <p className="text-xs text-stone-500">ID: {reservation.patientId || '-'}</p>
                    </div>
                  </div>

                  <div className="space-y-8">
                    {progressNotes.length > 0 ? (
                      progressNotes
                        .filter(n => {
                          const noteDate = new Date(n.date);
                          const thirtyDaysAgo = new Date();
                          thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
                          return noteDate >= thirtyDaysAgo;
                        })
                        .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
                        .map((note) => (
                          <div key={note.id} className="border-l-4 border-stone-200 pl-6 py-1">
                            <div className="flex items-center gap-3 mb-2">
                              <span className="font-bold text-lg">{note.date}</span>
                              <span className="text-sm bg-stone-100 px-2 py-0.5 rounded font-medium text-stone-600">{note.treatmentSummary || '施術実施'}</span>
                            </div>
                            <p className="text-sm leading-relaxed text-stone-700 whitespace-pre-wrap">
                              {note.progressText || '経過良好。'}
                            </p>
                          </div>
                        ))
                    ) : (
                      <p className="text-center py-20 text-stone-400 italic">該当期間の経過記録はありません。</p>
                    )}
                  </div>

                  <div className="mt-20 pt-8 border-t border-stone-200 text-right">
                    <p className="text-sm font-bold">{staffName}</p>
                    <p className="text-xs text-stone-400">作成日: {new Date().toLocaleDateString('ja-JP')}</p>
                  </div>
                </div>
              </div>
              <div className="p-4 border-t border-stone-200 bg-stone-50 flex justify-end gap-3">
                <button 
                  onClick={() => setShowSummary(false)}
                  className="px-6 py-2.5 rounded-xl text-sm font-bold text-stone-600 hover:bg-stone-200 transition-colors"
                >
                  閉じる
                </button>
                <button 
                  onClick={() => window.print()}
                  className="px-8 py-2.5 rounded-xl text-sm font-bold bg-stone-800 text-white hover:bg-stone-900 shadow-lg flex items-center gap-2 transition-all active:scale-95"
                >
                  <Printer size={18} /> 印刷する
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Close Confirmation Dialog */}
        {showCloseConfirm && (
          <div className="absolute inset-0 bg-white/90 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl shadow-xl border border-stone-200 p-6 max-w-md w-full">
              <h3 className="text-lg font-bold text-stone-800 mb-2 flex items-center gap-2">
                <AlertCircle className="text-orange-500" /> 保存されていません
              </h3>
              <p className="text-sm text-stone-600 mb-6">
                保存はまだ完了していません。入力途中の内容はこの端末に一時保存されています。閉じますか？
              </p>
              <div className="flex flex-col gap-2">
                <button
                  onClick={() => {
                    setShowCloseConfirm(false);
                    handleSave();
                  }}
                  className="w-full py-3 bg-emerald-600 text-white font-bold rounded-xl hover:bg-emerald-700 transition-colors flex items-center justify-center gap-2"
                >
                  <Save size={18} /> 保存して閉じる
                </button>
                <button
                  onClick={() => setShowCloseConfirm(false)}
                  className="w-full py-3 bg-stone-100 text-stone-700 font-bold rounded-xl hover:bg-stone-200 transition-colors"
                >
                  戻る（編集継続）
                </button>
                <button
                  onClick={onClose}
                  className="w-full py-3 text-red-600 font-bold rounded-xl hover:bg-red-50 transition-colors"
                >
                  閉じる（下書きを残したまま閉じる）
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Human Body Draw Modal */}
        {showBodyDrawModal && (
          <HumanBodyDrawModal
            initialImage={bodyImage}
            onSave={(img) => {
              setBodyImage(img);
              setShowBodyDrawModal(false);
            }}
            onClose={() => setShowBodyDrawModal(false)}
          />
        )}

        {/* Coupon Detail Modal */}
        {selectedCoupon && (
          <div className="fixed inset-0 z-[60] bg-black/40 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm overflow-hidden animate-in fade-in zoom-in duration-200">
              <div className="p-4 border-b border-stone-100 flex justify-between items-center bg-orange-50/50">
                <h3 className="font-bold text-stone-800 flex items-center gap-2">
                  <Ticket size={18} className="text-orange-500" /> 回数券詳細
                </h3>
                <button onClick={() => setSelectedCoupon(null)} className="p-1 text-stone-400 hover:text-stone-600 rounded-full hover:bg-stone-200">
                  <X size={20} />
                </button>
              </div>
              <div className="p-6 space-y-4">
                <div>
                  <div className="text-[10px] font-bold text-stone-400 uppercase tracking-wider">回数券名</div>
                  <div className="font-bold text-lg text-stone-800">{selectedCoupon.name}</div>
                </div>
                <div className="grid grid-cols-3 gap-4 py-4 border-y border-stone-50">
                  <div className="text-center">
                    <div className="text-[9px] font-bold text-stone-400">総回数</div>
                    <div className="font-bold text-stone-700">{selectedCoupon.totalCount}回</div>
                  </div>
                  <div className="text-center">
                    <div className="text-[9px] font-bold text-stone-400">使用済</div>
                    <div className="font-bold text-stone-700">{selectedCoupon.usedCount}回</div>
                  </div>
                  <div className="text-center">
                    <div className="text-[9px] font-bold text-stone-400">残り</div>
                    <div className={`font-bold text-xl ${getRemainingCountColor(selectedCoupon.remainingCount)}`}>{selectedCoupon.remainingCount}回</div>
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-stone-500">有効期限</span>
                    <span className={`font-bold ${getExpiryStatus(selectedCoupon.expiryDate).color}`}>
                      {selectedCoupon.expiryDate || 'なし'}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-stone-500">次回消費予定</span>
                    <span className="font-bold text-stone-700">{selectedCoupon.nextPlannedUse || 'なし'}</span>
                  </div>
                  {selectedCoupon.targetMenu && (
                    <div className="flex justify-between text-sm">
                      <span className="text-stone-500">対象メニュー</span>
                      <span className="font-bold text-stone-700">{selectedCoupon.targetMenu}</span>
                    </div>
                  )}
                </div>
                {selectedCoupon.notes && (
                  <div className="bg-stone-50 p-3 rounded-xl text-xs text-stone-600 leading-relaxed">
                    <div className="font-bold mb-1 text-stone-400">備考</div>
                    {selectedCoupon.notes}
                  </div>
                )}
              </div>
              <div className="p-4 bg-stone-50 border-t border-stone-100 flex justify-end gap-3">
                <button 
                  onClick={() => handleConsumeCoupon(selectedCoupon)}
                  disabled={!!isConsuming || selectedCoupon.remainingCount <= 0}
                  className="flex-1 py-2 bg-orange-600 text-white font-bold rounded-xl hover:bg-orange-700 transition-colors shadow-sm flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {isConsuming === selectedCoupon.id ? <Loader2 size={18} className="animate-spin" /> : <MinusCircle size={18} />}
                  1回分を今すぐ消費
                </button>
                <button 
                  onClick={() => setSelectedCoupon(null)}
                  className="px-6 py-2 bg-white border border-stone-200 text-stone-600 font-bold rounded-xl hover:bg-stone-100 transition-colors shadow-sm"
                >
                  閉じる
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Subscription Detail Modal */}
        {selectedSubscription && (
          <div className="fixed inset-0 z-[60] bg-black/40 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm overflow-hidden animate-in fade-in zoom-in duration-200">
              <div className="p-4 border-b border-stone-100 flex justify-between items-center bg-blue-50/50">
                <h3 className="font-bold text-stone-800 flex items-center gap-2">
                  <CreditCard size={18} className="text-blue-500" /> サブスク詳細
                </h3>
                <button onClick={() => setSelectedSubscription(null)} className="p-1 text-stone-400 hover:text-stone-600 rounded-full hover:bg-stone-200">
                  <X size={20} />
                </button>
              </div>
              <div className="p-6 space-y-4">
                <div>
                  <div className="text-[10px] font-bold text-stone-400 uppercase tracking-wider">サブスク名</div>
                  <div className="font-bold text-lg text-stone-800">{selectedSubscription.name}</div>
                  <div className="text-xs text-stone-500">{selectedSubscription.planName}</div>
                </div>
                <div className="flex items-center gap-2 py-2">
                  <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                    selectedSubscription.status === 'active' ? 'bg-emerald-100 text-emerald-700' : 'bg-stone-100 text-stone-600'
                  }`}>
                    {selectedSubscription.status === 'active' ? '有効' : selectedSubscription.status}
                  </span>
                </div>
                <div className="space-y-2 border-t border-stone-50 pt-4">
                  <div className="flex justify-between text-sm">
                    <span className="text-stone-500">開始日</span>
                    <span className="font-bold text-stone-700">{selectedSubscription.startDate}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-stone-500">更新日</span>
                    <span className="font-bold text-stone-700">{selectedSubscription.renewalDate}</span>
                  </div>
                  {selectedSubscription.nextBillingDate && (
                    <div className="flex justify-between text-sm">
                      <span className="text-stone-500">次回請求日</span>
                      <span className="font-bold text-stone-700">{selectedSubscription.nextBillingDate}</span>
                    </div>
                  )}
                </div>
                {selectedSubscription.includedContent && (
                  <div className="bg-stone-50 p-3 rounded-xl text-xs text-stone-600 leading-relaxed">
                    <div className="font-bold mb-1 text-stone-400">含まれる内容</div>
                    {selectedSubscription.includedContent}
                  </div>
                )}
                {selectedSubscription.notes && (
                  <div className="bg-stone-50 p-3 rounded-xl text-xs text-stone-600 leading-relaxed">
                    <div className="font-bold mb-1 text-stone-400">備考</div>
                    {selectedSubscription.notes}
                  </div>
                )}
              </div>
              <div className="p-4 bg-stone-50 border-t border-stone-100 flex justify-end">
                <button 
                  onClick={() => setSelectedSubscription(null)}
                  className="px-6 py-2 bg-white border border-stone-200 text-stone-600 font-bold rounded-xl hover:bg-stone-100 transition-colors shadow-sm"
                >
                  閉じる
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Signature Modal */}
        {showSignatureModal && (
          <SignatureModal 
            onClose={() => setShowSignatureModal(false)} 
            onSave={handleSaveSignature}
            isSaving={isSavingSignature}
            mode={clinicSettings?.signatureMode || 'strict'}
          />
        )}

        {/* 写真モーダル（簡易） */}
        {showPhotoModal && (
          <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[80] flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden animate-in zoom-in-95 duration-200">
              <div className="p-4 border-b border-stone-100 flex justify-between items-center bg-stone-50">
                <h3 className="font-bold text-stone-800 flex items-center gap-2">
                  <ImageIcon size={18} className="text-blue-500" />
                  患者写真ギャラリー
                </h3>
                <button onClick={() => setShowPhotoModal(false)} className="p-1 text-stone-400 hover:text-stone-600 rounded-full">
                  <X size={20} />
                </button>
              </div>
              <div className="p-8 text-center space-y-4">
                <div className="w-20 h-20 bg-stone-100 rounded-full flex items-center justify-center mx-auto text-stone-300">
                  <ImageIcon size={40} />
                </div>
                <div>
                  <p className="text-stone-800 font-bold">写真データがありません</p>
                  <p className="text-stone-400 text-xs mt-1">カメラで撮影した写真がここに表示されます</p>
                </div>
                <button 
                  onClick={() => navigate(`/clinics/${clinicId}/patients/${reservation.patientId}/gallery`)}
                  className="px-6 py-2 bg-blue-600 text-white rounded-xl font-bold text-sm hover:bg-blue-700 transition-colors"
                >
                  ギャラリーページへ移動
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Fullscreen Timer Overlay */}
        {isFullscreenTimer && (
          <div className={`fixed inset-0 z-[100] transition-colors duration-500 bg-stone-900 border-[16px] ${
            isTimerFinished ? 'border-rose-500 animate-pulse bg-rose-950/80 text-rose-50' : 
            timerSeconds <= 60 && timerSeconds > 0 ? 'border-rose-500 text-stone-100 bg-rose-950/40' :
            timerSeconds <= 300 && timerSeconds > 0 ? 'border-amber-500 text-stone-100 bg-amber-950/40' :
            timerSeconds === 0 ? 'border-stone-700 text-stone-100' :
            'border-teal-500 text-stone-100 bg-teal-950/40'
          }`}>
            {/* Header / Close (Top Info) */}
            <div className="absolute top-8 left-8 right-8 flex justify-between items-start z-10">
              <div className={`flex items-center gap-4 ${isTimerFinished ? 'text-rose-400' : 'text-white/50'}`}>
                <Clock size={32} className={isTimerFinished || isTimerRunning ? 'animate-pulse' : ''} />
                <span className="text-2xl font-black tracking-widest font-sans uppercase">Treatment Timer</span>
              </div>
              <button 
                onClick={() => setIsFullscreenTimer(false)}
                className="p-4 bg-white/10 hover:bg-white/20 rounded-2xl text-white transition-colors"
                title="閉じる"
              >
                <X size={40} />
              </button>
            </div>
            
            {/* Main Timer (Absolute Center) */}
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <div className={`text-[25vw] md:text-[320px] leading-none font-black font-mono tabular-nums tracking-tighter transition-colors duration-500 ${
                isTimerFinished ? 'text-rose-500 drop-shadow-[0_0_120px_rgba(244,63,94,0.8)] animate-pulse' : 
                timerSeconds <= 60 && timerSeconds > 0 ? 'text-rose-500 drop-shadow-[0_0_80px_rgba(244,63,94,0.5)]' :
                timerSeconds <= 300 && timerSeconds > 0 ? 'text-amber-500 drop-shadow-[0_0_80px_rgba(245,158,11,0.5)]' :
                timerSeconds === 0 ? 'text-stone-600' :
                'text-teal-400 drop-shadow-[0_0_80px_rgba(45,212,191,0.5)]'
              }`}>
                {formatTime(timerSeconds)}
              </div>
            </div>
            
            {/* Footer Controls (Bottom) */}
            <div className="absolute bottom-12 left-0 right-0 flex items-center justify-center z-10 px-8">
              <div className="flex items-center justify-center gap-4 w-full max-w-4xl">
                <button 
                  onClick={handleTimerToggle}
                  disabled={timerSeconds === 0}
                  className={`flex-1 py-6 rounded-3xl text-3xl font-black transition-all shadow-2xl disabled:opacity-30 ${isTimerRunning ? 'bg-amber-500/20 text-amber-400 hover:bg-amber-500/30 border-2 border-amber-500/50' : 'bg-teal-500 text-white hover:bg-teal-400 border-2 border-teal-400'}`}
                >
                  {isTimerRunning ? '一 時 停 止' : 'スタート'}
                </button>
                <button 
                  onClick={() => handleTimerAdd(5)}
                  disabled={timerSeconds === 0 && !isTimerRunning && !isTimerFinished}
                  className="flex-1 max-w-[240px] py-6 rounded-3xl text-3xl font-black bg-white/10 text-white hover:bg-white/20 border-2 border-white/20 transition-all shadow-2xl disabled:opacity-30"
                >
                  + 5 分
                </button>
                <button 
                  onClick={handleTimerReset}
                  disabled={timerSeconds === 0 && !isTimerFinished}
                  className="py-6 px-10 rounded-3xl text-2xl font-black bg-stone-800/80 backdrop-blur text-stone-400 hover:text-white hover:bg-stone-700 transition-all disabled:opacity-30 border-2 border-stone-700"
                >
                  リセット
                </button>
              </div>
            </div>
          </div>
        )}

        {/* 問診詳細モーダル */}
        {showQuestionnaireDetail && questionnaire && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[80] flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden animate-in zoom-in-95 duration-200">
              <div className="p-4 border-b border-stone-100 flex justify-between items-center bg-emerald-50">
                <h3 className="font-bold text-emerald-800 flex items-center gap-2">
                  <ClipboardCheck size={18} />
                  事前問診の詳細
                </h3>
                <button onClick={() => setShowQuestionnaireDetail(false)} className="p-1 text-emerald-400 hover:text-emerald-600 rounded-full">
                  <X size={20} />
                </button>
              </div>
              <div className="p-6 space-y-6 max-h-[70vh] overflow-y-auto">
                <div>
                  <label className="text-[10px] font-bold text-emerald-600 block mb-1">主訴・気になるところ</label>
                  <div className="p-3 bg-stone-50 rounded-xl border border-stone-100 text-stone-800 font-bold">{questionnaire.symptom || '-'}</div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-[10px] font-bold text-emerald-600 block mb-1">いつから</label>
                    <div className="p-3 bg-stone-50 rounded-xl border border-stone-100 text-sm">{questionnaire.whenText || '-'}</div>
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-emerald-600 block mb-1">どこで・場面</label>
                    <div className="p-3 bg-stone-50 rounded-xl border border-stone-100 text-sm">{questionnaire.whereText || '-'}</div>
                  </div>
                </div>
                <div>
                  <label className="text-[10px] font-bold text-emerald-600 block mb-1">きっかけ・原因</label>
                  <div className="p-3 bg-stone-50 rounded-xl border border-stone-100 text-sm">{questionnaire.triggerText || '-'}</div>
                </div>
                {questionnaire.freeText && (
                  <div>
                    <label className="text-[10px] font-bold text-emerald-600 block mb-1">備考・一言</label>
                    <div className="p-3 bg-stone-50 rounded-xl border border-stone-100 text-sm leading-relaxed">{questionnaire.freeText}</div>
                  </div>
                )}
                
                {questionnaire.aiGenerated && (
                  <div className="mt-6 pt-6 border-t border-stone-100 italic">
                    <label className="text-[10px] font-bold text-blue-600 flex items-center gap-1 mb-2">
                      <Sparkles size={12} /> AI生成テキスト
                    </label>
                    <div className="space-y-3">
                      <div className="p-3 bg-blue-50/50 rounded-xl border border-blue-100 text-xs text-stone-700">
                        <span className="font-bold text-blue-700">[主訴]</span> {questionnaire.aiGenerated.chiefComplaint}
                      </div>
                      <div className="p-3 bg-blue-50/50 rounded-xl border border-blue-100 text-xs text-stone-700 leading-relaxed">
                        <span className="font-bold text-blue-700">[受傷機序]</span> {questionnaire.aiGenerated.injuryMechanism}
                      </div>
                    </div>
                  </div>
                )}
              </div>
              <div className="p-4 bg-stone-50 border-t border-stone-100 flex justify-end gap-3">
                <button 
                  onClick={() => setShowQuestionnaireDetail(false)}
                  className="px-6 py-2.5 bg-white border border-stone-200 text-stone-600 font-bold rounded-xl hover:bg-stone-100 transition-colors shadow-sm text-sm"
                >
                  閉じる
                </button>
                <button 
                  onClick={() => {
                    setShowQuestionnaireDetail(false);
                    setShowReflectConfirm(true);
                  }}
                  className="px-6 py-2.5 bg-emerald-600 text-white font-black rounded-xl hover:bg-emerald-700 transition-all shadow-md active:scale-95 text-sm flex items-center gap-2"
                >
                  <Sparkles size={16} /> カルテに反映
                </button>
              </div>
            </div>
          </div>
        )}

        {/* 問診反映確認モーダル */}
        {showReflectConfirm && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[90] flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm overflow-hidden animate-in slide-in-from-bottom-4 duration-300">
              <div className="p-6 text-center space-y-4">
                <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto">
                  <Sparkles size={32} />
                </div>
                <div>
                  <h3 className="text-lg font-black text-stone-800">問診内容をカルテに反映しますか？</h3>
                  <p className="text-xs text-stone-500 mt-2 leading-relaxed">
                    既存の入力がある場合は消さずに追記します。<br/>
                    反映後、画面上の「元に戻す」で取り消し可能です。
                  </p>
                </div>

                <div className="bg-stone-50 p-4 rounded-xl border border-stone-200 text-left space-y-3">
                  <div className="text-[10px] font-bold text-stone-400 uppercase tracking-widest mb-1">反映項目の選択</div>
                  <label className="flex items-center gap-3 cursor-pointer group">
                    <input 
                      type="checkbox" 
                      checked={reflectChoices.chiefComplaint}
                      onChange={e => setReflectChoices({...reflectChoices, chiefComplaint: e.target.checked})}
                      className="w-4 h-4 rounded text-emerald-600 focus:ring-emerald-500"
                    />
                    <span className="text-sm font-bold text-stone-700 group-hover:text-emerald-600 transition-colors">主訴 (症状)</span>
                  </label>
                  <label className="flex items-center gap-3 cursor-pointer group">
                    <input 
                      type="checkbox" 
                      checked={reflectChoices.injuryMechanism}
                      onChange={e => setReflectChoices({...reflectChoices, injuryMechanism: e.target.checked})}
                      className="w-4 h-4 rounded text-emerald-600 focus:ring-emerald-500"
                    />
                    <span className="text-sm font-bold text-stone-700 group-hover:text-emerald-600 transition-colors">原因 (受傷機序)</span>
                  </label>
                  <label className="flex items-center gap-3 cursor-pointer group">
                    <input 
                      type="checkbox" 
                      checked={reflectChoices.memo}
                      onChange={e => setReflectChoices({...reflectChoices, memo: e.target.checked})}
                      className="w-4 h-4 rounded text-emerald-600 focus:ring-emerald-500"
                    />
                    <span className="text-sm font-bold text-stone-700 group-hover:text-emerald-600 transition-colors">備考メモ</span>
                  </label>
                </div>
              </div>
              <div className="p-4 bg-stone-50 border-t border-stone-100 grid grid-cols-2 gap-3">
                <button 
                  onClick={() => setShowReflectConfirm(false)}
                  className="py-3 bg-white border border-stone-200 text-stone-600 font-bold rounded-xl hover:bg-stone-100 transition-colors shadow-sm text-sm"
                >
                  キャンセル
                </button>
                <button 
                  onClick={handleReflectQuestionnaire}
                  className="py-3 bg-emerald-600 text-white font-black rounded-xl hover:bg-emerald-700 transition-all shadow-md active:scale-95 text-sm"
                >
                  反映する
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Modals integrated for display */}
        {showQuestionnaireWarning && (
          <div className="fixed inset-0 z-[70] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-white rounded-3xl shadow-2xl max-w-md w-full overflow-hidden animate-in zoom-in-95 duration-300">
              <div className="bg-amber-500 p-6 text-white flex items-center gap-4">
                <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center">
                  <AlertCircle size={32} />
                </div>
                <div>
                  <h3 className="text-xl font-black italic">ALERT: NO INTERVIEW</h3>
                  <p className="text-sm font-bold text-amber-100">まだ問診表が入力されていません</p>
                </div>
              </div>
              <div className="p-8 space-y-6">
                <p className="text-stone-600 font-bold leading-relaxed">
                  この患者様はまだ問診を入力していません。<br/>
                  現場でQRコードを案内して入力を促してください。
                </p>
                <div className="flex flex-col gap-3">
                  <button 
                    onClick={async () => {
                      // QR表示処理
                      let token = reservation.accessToken;
                      if (!token) {
                        token = Math.random().toString(36).substring(2, 10);
                        setAccessToken(token);
                        // トークンを保存
                        await updateDoc(doc(db, `clinics/${clinicId}/reservations`, reservation.id), {
                          accessToken: token
                        });
                      } else {
                        setAccessToken(token);
                      }
                      addAuditLog('qr_shown', '未問診警告からQRを表示しました');
                      setShowQR(true);
                      setShowQuestionnaireWarning(false);
                    }}
                    className="w-full py-4 bg-blue-600 text-white rounded-2xl font-black text-lg flex items-center justify-center gap-2 shadow-xl shadow-blue-500/20 active:scale-95 transition-all"
                  >
                    <QrCode size={24} />
                    QRコードを表示する
                  </button>
                  <button 
                    onClick={() => setShowQuestionnaireWarning(false)}
                    className="w-full py-3 bg-stone-100 text-stone-500 rounded-2xl font-bold hover:bg-stone-200"
                  >
                    そのままカルテを開く
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {showQR && (
          <div className="fixed inset-0 z-[80] bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
            <div className="bg-white rounded-[2.5rem] shadow-2xl max-w-sm w-full overflow-hidden p-8 flex flex-col items-center animate-in zoom-in-95 duration-500">
              <div className="w-full flex justify-between items-center mb-6">
                <h3 className="font-black text-stone-800 text-lg flex items-center gap-2">
                  <QrCode className="text-emerald-500" /> 問診URL QR
                </h3>
                <button onClick={() => setShowQR(false)} className="p-2 hover:bg-stone-100 rounded-full text-stone-400">
                  <X size={24} />
                </button>
              </div>

              <div className="bg-white p-6 rounded-3xl shadow-inner border border-stone-100 mb-6">
                <QRCodeSVG 
                  value={`${window.location.origin}/patient/questionnaire?clinicId=${clinicId}&reservationId=${reservation.id}&token=${accessToken || reservation.accessToken}`}
                  size={200}
                  level="H"
                  includeMargin={true}
                />
              </div>

              <p className="text-center font-black text-stone-800 text-lg mb-2">{patientName} 様</p>
              <p className="text-center text-xs text-stone-400 mb-8 font-bold">スマホのカメラで読み取ってください</p>

              <button 
                onClick={() => setShowQR(false)}
                className="w-full py-4 bg-stone-900 text-white rounded-2xl font-black text-lg shadow-xl active:scale-95 transition-all"
              >
                閉じる
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

// --- Signature Modal Component ---
interface SignatureModalProps {
  onClose: () => void;
  onSave: (image: string) => void;
  isSaving: boolean;
  mode: 'light' | 'standard' | 'strict';
}

const SignatureModal: React.FC<SignatureModalProps> = ({ onClose, onSave, isSaving, mode }) => {
  const { isOnline } = useNetworkStatus();
  const canvasRef = React.useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = React.useState(false);
  const [hasSignature, setHasSignature] = React.useState(false);
  const [isChecked, setIsChecked] = React.useState(mode !== 'light');

  React.useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.strokeStyle = '#1e293b';
    ctx.lineWidth = 3;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
  }, []);

  const startDrawing = (e: React.MouseEvent | React.TouchEvent) => {
    setIsDrawing(true);
    draw(e);
  };

  const stopDrawing = () => {
    setIsDrawing(false);
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    ctx?.beginPath();
  };

  const draw = (e: React.MouseEvent | React.TouchEvent) => {
    if (!isDrawing) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    const x = ('touches' in e) ? e.touches[0].clientX - rect.left : e.clientX - rect.left;
    const y = ('touches' in e) ? e.touches[0].clientY - rect.top : e.clientY - rect.top;

    ctx.lineTo(x, y);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(x, y);
    setHasSignature(true);
  };

  const clear = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    ctx?.clearRect(0, 0, canvas.width, canvas.height);
    setHasSignature(false);
  };

  const handleSave = () => {
    if (!hasSignature || !isChecked) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    onSave(canvas.toDataURL('image/png'));
  };

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-md z-[70] flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-300">
        <div className="p-4 border-b border-stone-100 bg-stone-50 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <PenTool size={20} className="text-blue-600" />
            <h3 className="font-bold text-stone-800">レセプト確認・電子署名</h3>
          </div>
          <button onClick={onClose} className="p-1 text-stone-400 hover:text-stone-600 rounded-full">
            <X size={20} />
          </button>
        </div>
        
        <div className="p-6">
          <div className="mb-4 p-4 bg-blue-50 rounded-xl border border-blue-100 text-sm text-blue-800">
            <p className="font-bold mb-1">【署名にあたっての確認】</p>
            <p className="text-xs leading-relaxed">
              本日実施した施術内容および会計金額に相違ないことを確認しました。
              この署名は医療証拠として保存され、保存後は修正できません。
            </p>
          </div>

          <div className="relative bg-stone-50 border-2 border-stone-200 rounded-xl overflow-hidden touch-none mb-6">
            <canvas
              ref={canvasRef}
              width={600}
              height={300}
              onMouseDown={startDrawing}
              onMouseMove={draw}
              onMouseUp={stopDrawing}
              onMouseOut={stopDrawing}
              onTouchStart={startDrawing}
              onTouchMove={draw}
              onTouchEnd={stopDrawing}
              className="w-full h-[300px] cursor-crosshair"
            />
            {!hasSignature && (
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none text-stone-300 font-bold">
                ここに署名してください
              </div>
            )}
          </div>

          {mode !== 'light' && (
            <div 
              className={`mb-6 flex items-center gap-3 p-4 rounded-xl border transition-all cursor-pointer ${
                isChecked ? 'bg-blue-50 border-blue-200' : 'bg-stone-50 border-stone-200 hover:bg-stone-100'
              }`}
              onClick={() => setIsChecked(!isChecked)}
            >
              <input 
                type="checkbox" 
                checked={isChecked} 
                onChange={(e) => setIsChecked(e.target.checked)}
                className="w-5 h-5 rounded border-stone-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
                onClick={(e) => e.stopPropagation()}
              />
              <span className={`text-sm font-bold ${isChecked ? 'text-blue-700' : 'text-stone-700'}`}>
                施術内容・請求内容を確認しました
              </span>
            </div>
          )}

          <div className="flex justify-between mt-4">
            <button
              onClick={clear}
              className="px-4 py-2 text-stone-500 hover:text-stone-700 font-bold text-sm transition-colors"
            >
              クリア
            </button>
            <div className="flex gap-3">
              {!isOnline && (
                <div className="flex flex-col items-end justify-center mr-2">
                  <span className="text-[10px] font-bold text-amber-600 flex items-center gap-1 animate-bounce-subtle">
                    <AlertTriangle size={10} /> ネット未接続
                  </span>
                </div>
              )}
              <button
                onClick={onClose}
                className="px-6 py-2 bg-white border border-stone-200 text-stone-600 font-bold rounded-xl hover:bg-stone-100 transition-colors"
              >
                キャンセル
              </button>
              <button
                onClick={handleSave}
                disabled={!hasSignature || !isChecked || isSaving}
                className="px-8 py-2 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 transition-colors shadow-md disabled:opacity-50 flex items-center gap-2"
              >
                {isSaving ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />}
                署名を保存してロック
              </button>
            </div>
          </div>
        </div>
        
        <div className="p-3 bg-stone-50 border-t border-stone-100 text-[9px] text-stone-400 text-center">
          // TODO: 再署名申請フロー / 権限者のみ解除可能にする / 署名取消理由の記録 / 電子サイン履歴の複数版管理
        </div>

        <style dangerouslySetInnerHTML={{ __html: `
          .animate-bounce-subtle {
            animation: bounce-subtle 2s infinite;
          }
          @keyframes bounce-subtle {
            0%, 100% { transform: translateY(0); }
            50% { transform: translateY(-2px); }
          }
        `}} />
      </div>
    </div>
  );
};

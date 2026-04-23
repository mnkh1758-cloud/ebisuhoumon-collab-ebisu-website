import { LucideIcon } from 'lucide-react';

export enum BodyPart {
  HEAD_NECK = '首・頭',
  SHOULDER_BACK = '肩・背中',
  WAIST_HIP = '腰・骨盤',
  ARM_HAND = '腕・手',
  LEG_FOOT = '脚・足',
  OTHER = 'その他・全身',
}

export interface SubConditionType {
  title: string;
  description: string;
  imageUrl?: string;
}

export interface SubCondition {
  title: string;
  description: string;
  cause?: string;
  imageUrl?: string;
  types?: SubConditionType[];
}

export interface SatisfactionData {
  title: string;
  percentage: number;
  description: string;
}

export interface Symptom {
  id: string;
  title: string; // Displayed on card
  description: string; // Short description for card
  bodyPart: BodyPart;
  icon: LucideIcon;
  imageUrl: string;
  // Detailed content fields
  detailedTitle?: string; // e.g. "頭の痛み"
  detailImage?: string; // Image to be displayed in the detail modal
  mainSymptomsList?: string[]; // Bullet points of symptoms
  treatmentConcept?: string; // e.g. "頭の痛みを根本から治療する..."
  treatmentDescription?: string;
  subConditions?: SubCondition[]; // e.g. Headaches, Dizziness, Whiplash details
  recommendedFor?: string[]; // "Such people are recommended" list
  satisfactionData?: SatisfactionData[]; // Satisfaction index data
}

export interface Service {
  id: string;
  title: string;
  description: string;
  price: string;
  duration: string;
  features: string[];
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'model';
  text: string;
  timestamp: Date;
}

export enum LoadingState {
  IDLE = 'IDLE',
  LOADING = 'LOADING',
  SUCCESS = 'SUCCESS',
  ERROR = 'ERROR',
}

export interface AdminStaff {
  id: string;
  name: string;
  role?: string;
  photoURL?: string;
  color: string;
  order: number;
  isActive: boolean;
  schedule?: StaffSchedule;
}

export interface DailySchedule {
  isWorking: boolean;
  start: string;      // "09:00"
  end: string;        // "18:00"
  breakStart: string; // "13:00" or ""
  breakEnd: string;   // "14:00" or ""
}

export type StaffSchedule = Record<DayOfWeek, DailySchedule>;

export interface Patient {
  id: string; // Firestore document ID
  patientId: number; // 1〜100000
  name: string;
  phoneNumber?: string; // 電話番号
  age?: number;
  gender?: 'male' | 'female' | 'other' | 'unanswered';
  notes: string;
  handoverMemo?: string; // スタッフ間共有メモ
  visitHistory: string[];
  contraindications: string;
  lastVisit: any; // Firestore Timestamp
  treatmentTrends?: string;
  lastSignedMonth?: string; // "YYYY-MM"
  createdAt: any;
  updatedAt: any;
}

export interface RecordImage {
  url: string;
  createdAt: any; // Firestore Timestamp
  isProtected: boolean;
}

export interface ImageGroup {
  id: string;
  label: string;
  images: RecordImage[];
}

export interface MedicalRecord {
  id: string;
  date: string; // YYYY-MM-DD
  staffId?: string;
  staffName?: string;
  categories?: string[]; // '柔整', '鍼灸', '訪問鍼灸' など
  chiefComplaint: string; // 主訴
  injuryMechanism?: string; // 受傷機序 (New)
  s: string; // Subjective
  o: string; // Objective
  a: string; // Assessment
  p: string; // Plan
  menu: string; // 施術メニュー
  images: RecordImage[]; // 後方互換性のため残す
  imageGroups?: ImageGroup[]; // 項目ごとの画像
  aiPromptData?: {
    bodyParts: string[];
    keywords: string;
    categories: string[];
  }; // 学習用データ
  questionnaireId?: string; // 連動用 (New)
  createdAt: any; // Firestore Timestamp
  updatedAt: any; // Firestore Timestamp
}

export interface Reservation {
  id: string;
  staffId: string;
  date: string; // YYYY-MM-DD
  startTime: string; // HH:mm
  endTime: string; // HH:mm
  status: 'confirmed' | 'provisional' | 'cancelled';
  patientId?: number;
  patientDocId?: string; // Firestore document ID of the patient
  patientName?: string;
  menu?: string;
  memo?: string;
  // Smart Ledger1 Reception Fields
  visitStatus?: 'not_arrived' | 'arrived' | 'waiting_for_payment' | 'completed';
  questionnaireStatus?: 'not_submitted' | 'submitted';
  questionnaireApplied?: boolean;
  questionnaire?: {
    chiefComplaint: string;
    sinceWhen: string;
    bodyPart: string;
    trigger: string;
    memo: string;
    submittedAt: any; // Firestore Timestamp
    submittedBy: 'patient' | 'staff';
    status: 'submitted' | 'draft';
  };
  selfMenus?: string[];
  selfTotal?: number;
  grandTotal?: number;
  paymentMethod?: 'cash' | 'credit' | 'emoney' | 'credit_sale';
  category?: 'jusei' | 'shinkyu';
  questionnaireUrl?: string;
  questionnaireId?: string;
  
  // 会計・領収書用追加
  optionItems?: { name: string; price: number; qty: number; amount: number }[];
  basePrice?: number;
  paymentMemo?: string;
  insuranceAmount?: number;
  selfPayTreatmentAmount?: number;
  optionAmount?: number;
  billingAmount?: number;
  paidAt?: any; // Firestore Timestamp
  
  checkout?: Checkout; // New structured checkout data
  accessToken?: string | null; // 問診用アクセストークン

  lastEditedBy?: string | null;
  lastEditedAt?: any | null; 

  createdAt: any; // Firestore Timestamp
  updatedAt: any; // Firestore Timestamp
}

export interface Checkout {
  checkoutStatus: 'completed' | 'pending';
  clearedAt: any; // Firestore Timestamp
  clearedBy: string;
  clearedByName: string;
  amounts: {
    insuranceAmount: number;
    selfPayAmount: number;
    optionAmount: number;
    totalAmount: number;
  };
  payment: {
    paymentMethodType: string;
    paymentMethodDetail: string;
    paymentMemo: string;
  };
  receivable: {
    isReceivable: boolean;
    receivableAmount: number;
    receivableMemo: string;
  };
  audit: {
    createdAt: any;
    updatedAt: any;
    createdBy: string;
    createdByName: string;
  };
}

export interface AuditLog {
  id: string;
  type: 'reservation_create' | 'reservation_update' | 'reservation_delete' | 'status_change' | 'medical_record_save' | 'settings_update' | 'staff_update' | 'saas_settings_update' | 'feature_flags_update' | 'payment_complete';
  userId: string;
  userName: string;
  clinicId: string;
  details: string;
  timestamp: any; // Firestore Timestamp
}

export interface Questionnaire {
  id: string;
  patientId?: string;
  reservationId?: string;
  
  // 爆速問診用フィールド
  symptom: string;         // 例：首痛
  whenText: string;        // 例：今日・昨日・1週間前
  whereText: string;       // 例：自宅・職場
  triggerText: string;     // 例：起床時・運動時
  freeText: string;        // 一言入力
  
  status: 'draft' | 'submitted';
  
  // AI生成結果（プレビュー用）
  aiGenerated?: {
    chiefComplaint: string;
    injuryMechanism: string;
  };

  // 既存互換用（必要に応じて残す）
  name?: string;
  kana?: string;
  birthday?: string;
  phoneNumber?: string;
  
  createdAt: any;
  updatedAt: any;
}

export type DayOfWeek = 'monday' | 'tuesday' | 'wednesday' | 'thursday' | 'friday' | 'saturday' | 'sunday';

export interface DailyHours {
  isOpen: boolean;
  start: string; // "09:00"
  end: string;   // "20:00"
}

export type BusinessHours = Record<DayOfWeek, DailyHours>;

export type PlanType = 'starter' | 'standard' | 'pro';

export type BillingStatus = 'active' | 'trial' | 'past_due' | 'canceled';

export interface FeatureFlags {
  canUseChart: boolean;
  canUseQuestionnaire: boolean;
  canUseAnalytics: boolean;
  canManageReservations: boolean;
  maxStaffCount?: number;

  // --- 外販SaaS向け拡張フラグ ---
  enableAI?: boolean;
  enableSignature?: boolean;
  enableQuestionnaire?: boolean;
  enableHumanBodyDraw?: boolean;
  enableImageComparison?: boolean;
  enableAiLearning?: boolean;
  enableReceipt?: boolean;
  enableAccountingDetails?: boolean;
  enableVoiceInput?: boolean;
}

export interface Contract {
  id: string;
  clinicId: string;
  plan: 'starter' | 'standard' | 'pro';
  status: 'active' | 'inactive';
  startDate: any; // Firestore Timestamp
  endDate: any; // Firestore Timestamp
}

export interface License {
  id: string;
  clinicId: string;
  features: {
    ai: boolean;
    signature: boolean;
    questionnaire: boolean;
  };
}

// TODO: 外販SaaS化に向けたテナント（院）ごとの設定拡張ポイント
// 将来的に clinics/{clinicId}/settings などのドキュメントで管理し、
// contracts / licenses コレクションと連動して段階提供（Free/Standard/Pro）を制御する想定
export interface TenantConfig {
  // branding: {
  //   logoUrl?: string;
  //   themeColor?: string;
  // };
  // limits: {
  //   maxImagesPerPatient?: number; // 画像容量制限（例: 1患者あたり50枚まで）
  //   maxBodyDrawings?: number; // 人体図保存上限
  //   maxStorageBytes?: number; // テナントごとの保存容量制限
  //   maxReservationsPerMonth?: number; // 予約数上限
  // };
  // reservationRules: {
  //   allowDoubleBooking?: boolean;
  //   slotIntervalMinutes?: number;
  // };
}

export interface Clinic {
  id: string;
  name: string;
  plan: PlanType;
  billingStatus: BillingStatus;
  trialEndsAt?: any; // Firestore Timestamp
  stripeCustomerId?: string;
  stripeSubscriptionId?: string;
  address?: string;
  phoneNumber?: string;
  businessHours: BusinessHours;
  holidays: string[]; // ["YYYY-MM-DD"]
  createdAt: any;
  updatedAt: any;
}

export interface UserProfile {
  uid: string;
  email: string;
  displayName: string;
  role: 'admin' | 'staff';
  clinicId: string;
  createdAt: any;
  updatedAt: any;
}

export interface ProgressNote {
  id: string;
  date: string; // YYYY-MM-DD
  treatmentSummary: string;
  progressText: string;
  createdAt: any;
  updatedAt: any;
}

export interface ChartAuditLog {
  action: string;
  createdAt: any;
  deviceId: string;
  staffId?: string;
  details?: string;
}

export interface SimpleChart {
  id: string;
  reservationId: string;
  patientId: number | null;
  patientName: string;
  visitDate: string;
  staffName: string;
  staffId?: string | null;
  chiefComplaint: string;
  treatmentNote: string;
  memo: string;
  bodyImage?: string; // Base64 encoded image
  
  // --- New Fields ---
  chartMode?: 'jusei' | 'shinkyu' | 'both';
  injuryMechanism?: {
    whenText?: string;
    whereText?: string;
    mechanismText?: string;
    narrative?: string;
  };
  progressNotes?: ProgressNote[];

  // --- Signature & Evidence ---
  signatureInfo?: {
    image: string;
    signedAt: any;
    deviceId: string;
    isLocked: boolean;
    signatureSnapshot?: {
      patientId: number | null;
      patientName: string;
      reservationId: string;
      clinicId: string;
      signedAt: any;
      chartMode: string;
      chiefComplaint: string;
      treatmentNote: string;
      progressNotes: ProgressNote[];
      billingAmount?: number;
      paymentMethod?: string;
    };
  };
  signature?: {
    image: string | null;
    signedAt: any | null;
    signedBy: string | null;
    deviceId: string | null;
    locked: boolean;
    mode: 'light' | 'standard' | 'strict';
    snapshot?: {
      karteData: any;
      savedAt: any;
    };
  };
  snapshot?: {
    karteData: any;
    savedAt: any;
  };
  auditLogs?: ChartAuditLog[];
  
  lastEditedBy?: string | null;
  lastEditedAt?: any | null;

  createdAt: any; // Firestore Timestamp
  updatedAt: any; // Firestore Timestamp
}

export interface LearningTemplate {
  id?: string;
  symptom: string;
  whenText: string;
  whereText: string;
  triggerText: string;
  noteText: string;
  normalizedKeys: string[];
  chiefComplaint: string;
  usageCount: number;
  staffId?: string;
  createdAt: any;
  updatedAt: any;
}

export interface PatientCoupon {
  id: string;
  name: string;
  totalCount: number;
  usedCount: number;
  remainingCount: number;
  expiryDate: string; // YYYY-MM-DD
  nextPlannedUse?: string; // "あり" | "なし" | "次回来院時"
  notes?: string;
  targetMenu?: string;
  status: 'active' | 'expired' | 'used_up';
  createdAt: any;
  updatedAt: any;
}

export interface PatientSubscription {
  id: string;
  name: string;
  planName: string;
  status: 'active' | 'expired' | 'paused';
  startDate: string; // YYYY-MM-DD
  renewalDate: string; // YYYY-MM-DD
  nextBillingDate?: string; // YYYY-MM-DD
  notes?: string;
  includedContent?: string;
  createdAt: any;
  updatedAt: any;
}

export interface PaymentOptions {
  cardBrands: string[]; // ['visa', 'mastercard', 'jcb', ...]
  eMoneyBrands: string[]; // ['paypay', 'rakuten_pay', ...]
  otherPaymentLabels: string[]; // ['銀行振込', '回数券', ...]
}

export interface ClinicSettings {
  name: string;
  photoURL?: string;
  businessHours: BusinessHours;
  holidays: string[]; // ["YYYY-MM-DD"]
  signatureMode?: 'light' | 'standard' | 'strict';
  signatureFrequency?: 'every_visit' | 'monthly' | 'none' | 'monthly_plus';
  closeOnNationalHolidays?: boolean;
  paymentOptions?: PaymentOptions;
}

// --- Future-Ready Fee Master (Foundation) ---

export interface FeeMasterItem {
  code: string;
  label: string;
  amount: number;
  category?: string; // 柔整、あはき等
  note?: string;
  enabled: boolean;
}

export interface FeeMaster {
  id: string; // Document ID (versin-major-minor)
  schemaVersion: string; // "1.0"
  category: 'jusei' | 'ahaki' | 'other';
  effectiveFrom: string; // YYYY-MM-DD
  effectiveTo?: string; // YYYY-MM-DD
  isActive: boolean;
  status: 'draft' | 'active' | 'archived';
  items: FeeMasterItem[];
  updatedAt: any;
  updatedBy: string;
}

// --- CSV Import (STEP 1 Foundation) ---
export interface CsvPreviewRow {
  [key: string]: string;
}

export interface CsvPreviewResult {
  fileName: string;
  rowCount: number;
  headers: string[];
  previewRows: CsvPreviewRow[];
}

export type CsvImportMode = 'auto' | 'manual';

export interface CsvMapping {
  [header: string]: string; // CSV Header -> Patient Field
}

export interface MappedPatientData {
  patientName?: string;
  patientNameKana?: string;
  phone?: string;
  birthDate?: string;
  gender?: string;
  postalCode?: string;
  prefecture?: string;
  city?: string;
  town?: string;
  addressDetail?: string;
  addressText?: string;
  email?: string;
  patientCode?: string;
  insurerName?: string;
  insurerNumber?: string;
  memo?: string;
  
  // Validation status
  status?: 'valid_new' | 'exact_match' | 'duplicate_high' | 'duplicate_low' | 'missing_required' | 'invalid_row' | 'skipped_by_risk' | 'success' | 'failed';
  riskFlags?: string[];
  matchReason?: string;
  originalRowIndex: number;
}

export interface PatientImportLog {
  id: string;
  importBatchId: string;
  importedAt: any; // Firestore Timestamp
  importedBy: string;
  sourceType: 'csv';
  fileName: string;
  totalRows: number;
  savedCount: number;
  exactMatchCount: number;
  duplicateCount: number;
  missingRequiredCount: number;
  invalidCount: number;
  skippedCount: number;
  mappingSummary: CsvMapping;
  riskFlags: string[];
  status: 'completed' | 'partial' | 'failed';
}

export interface ImportSummary {
  totalRows: number;
  emptyRows: number;
  validRows: number;
  missingRequiredRows: number;
  newCandidates: number;
  duplicateCandidates: number;
  completeMatches: number;
}

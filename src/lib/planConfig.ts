import { PlanType, FeatureFlags } from '../types';

export const PLAN_CONFIG: Record<PlanType, FeatureFlags> = {
  starter: {
    canUseChart: true,
    canUseQuestionnaire: true,
    canUseAnalytics: false,
    canManageReservations: true,
    maxStaffCount: 3,
    enableAI: false,
    enableSignature: false,
    enableQuestionnaire: true,
    enableHumanBodyDraw: false,
    enableImageComparison: false,
    enableAiLearning: false,
    enableReceipt: false,
    enableAccountingDetails: false,
    enableVoiceInput: false,
  },
  standard: {
    canUseChart: true,
    canUseQuestionnaire: true,
    canUseAnalytics: true,
    canManageReservations: true,
    maxStaffCount: 10,
    enableAI: true,
    enableSignature: true,
    enableQuestionnaire: true,
    enableHumanBodyDraw: true,
    enableImageComparison: true,
    enableAiLearning: true,
    enableReceipt: true,
    enableAccountingDetails: true,
    enableVoiceInput: true,
  },
  pro: {
    canUseChart: true,
    canUseQuestionnaire: true,
    canUseAnalytics: true,
    canManageReservations: true,
    maxStaffCount: Infinity,
    enableAI: true,
    enableSignature: true,
    enableQuestionnaire: true,
    enableHumanBodyDraw: true,
    enableImageComparison: true,
    enableAiLearning: true,
    enableReceipt: true,
    enableAccountingDetails: true,
    enableVoiceInput: true,
  }
};

export const getFeatureFlags = (plan: PlanType): FeatureFlags => {
  return PLAN_CONFIG[plan] || PLAN_CONFIG.starter;
};

export const PLAN_NAMES: Record<PlanType, string> = {
  starter: 'スタータープラン',
  standard: 'スタンダードプラン',
  pro: 'プロプラン',
};

export const PLAN_PRICES: Record<PlanType, number> = {
  starter: 0,
  standard: 14800,
  pro: 29800,
};

export const PLAN_PRICES_ANNUAL: Record<PlanType, number> = {
  starter: 0,
  standard: 11800, // 約20% OFF
  pro: 23800,    // 約20% OFF
};

export const PLAN_DESCRIPTIONS: Record<PlanType, string> = {
  starter: '個人院・開業準備中向け。基本機能（予約・カルテ・問診）を無料で開始。',
  standard: '一般院向け。AIアシスタント・電子サイン・会計機能で業務を効率化。',
  pro: '多店舗・大型院向け。全ての機能と無制限のスタッフ登録が可能。',
};

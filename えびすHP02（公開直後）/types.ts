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
}

export interface SubCondition {
  title: string;
  description: string;
  cause?: string;
  types?: SubConditionType[];
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
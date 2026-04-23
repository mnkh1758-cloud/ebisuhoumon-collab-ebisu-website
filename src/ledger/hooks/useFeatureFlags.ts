import { useState, useEffect } from 'react';
import { db } from '../../firebase';
import { doc, onSnapshot } from 'firebase/firestore';
import { FeatureFlags } from '../../types';

export const useFeatureFlags = (clinicId: string | undefined) => {
  const [flags, setFlags] = useState<FeatureFlags>({
    canUseChart: true,
    canUseQuestionnaire: true,
    canUseAnalytics: true,
    canManageReservations: true,
    
    // 外販SaaS向け拡張フラグ
    enableAI: true,
    enableSignature: true,
    enableQuestionnaire: true,
    enableHumanBodyDraw: true,
    enableImageComparison: true,
    enableAiLearning: true,
    enableReceipt: true,
    enableAccountingDetails: true,
    enableVoiceInput: true,
  });

  useEffect(() => {
    if (!clinicId) return;
    
    const unsub = onSnapshot(doc(db, `clinics/${clinicId}/feature_flags`, 'current'), (snap) => {
      if (snap.exists()) {
        setFlags(prev => ({ ...prev, ...snap.data() }));
      }
    });

    return () => unsub();
  }, [clinicId]);

  return flags;
};

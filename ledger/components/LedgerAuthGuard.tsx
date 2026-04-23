import React, { useEffect } from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useSaaS } from '../../src/hooks/useSaaS';
import { perf } from '@/ledger/utils/performance';

export const LedgerAuthGuard: React.FC = () => {
  const { userProfile, clinic, featureFlags, trialDaysLeft, loading, clinicId } = useSaaS();

  useEffect(() => {
    perf.start('LedgerAuthGuard_mount');
  }, []);

  useEffect(() => {
    if (!loading) {
      perf.end('LedgerAuthGuard_mount');
      perf.mark('LedgerAuthGuard_resolved', { hasProfile: !!userProfile });
    }
  }, [loading, userProfile]);

  console.log("[LedgerAuthGuard] render. loading:", loading, "userProfile:", !!userProfile, "clinicId:", clinicId);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-stone-50">
        <div className="text-stone-500 font-medium animate-pulse">認証状態を確認中...</div>
      </div>
    );
  }

  if (!userProfile) {
    console.log("[LedgerAuthGuard] !userProfile -> Navigate to /ledger/login");
    return <Navigate to="/ledger/login" replace />;
  }

  console.log("[LedgerAuthGuard] passing context to Outlet. clinicId:", clinicId);
  return <Outlet context={{ userProfile, clinic, featureFlags, trialDaysLeft, clinicId }} />;
};

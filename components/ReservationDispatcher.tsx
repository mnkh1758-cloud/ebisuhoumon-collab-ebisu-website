import React from 'react';
import { useSearchParams } from 'react-router-dom';
import { ReservationPage } from './ReservationPage';
import { DaitoReservationPage } from './reservation/DaitoReservationPage';
import { HaikiReservationPage } from './reservation/HaikiReservationPage';
import { YamineReservationPage } from './reservation/YamineReservationPage';

export const ReservationDispatcher: React.FC = () => {
  const [searchParams] = useSearchParams();
  const clinicId = searchParams.get('clinicId');

  console.log('ReservationDispatcher - clinicId:', clinicId);

  if (!clinicId) {
    return <ReservationPage />;
  }

  const id = clinicId.toLowerCase();
  
  // Mapping of clinicId to components directly for better reliability
  if (id === 'daito' || id === 'daitou') {
    return <DaitoReservationPage />;
  }
  if (id === 'haiki' || id === 'hayaki') {
    return <HaikiReservationPage />;
  }
  if (id === 'yamine') {
    return <YamineReservationPage />;
  }

  // Fallback
  console.log('ReservationDispatcher - No match for clinicId, returning ReservationPage');
  return <ReservationPage />;
};

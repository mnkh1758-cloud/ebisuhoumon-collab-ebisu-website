import React from 'react';
import { useOutletContext } from 'react-router-dom';
import { PatientList } from '../../components/admin/PatientList';

export const Patients: React.FC = () => {
  const { clinicId } = useOutletContext<{ clinicId: string }>();

  return <PatientList clinicId={clinicId} />;
};

import React from 'react';
import { HashRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Header } from './components/Header';
import { Footer } from './components/Footer';
import { AIConsultant } from './components/AIConsultant';
import { Home } from './components/Home';
import { StaffList } from './components/StaffList';
import { HomeVisitPage } from './components/HomeVisitPage';
import { TrafficAccidentPage } from './components/TrafficAccidentPage';
import { DaitoReservationPage } from './components/reservation/DaitoReservationPage';
import { HaikiReservationPage } from './components/reservation/HaikiReservationPage';
import { YamineReservationPage } from './components/reservation/YamineReservationPage';
import { InfertilityPage } from './components/InfertilityPage';
import { BeautyAcupuncturePage } from './components/BeautyAcupuncturePage';
import { OxygenRoomPage } from './components/OxygenRoomPage';
import { AutonomicImbalancePage } from './components/AutonomicImbalancePage';
import { LumbagoPage } from './components/LumbagoPage';
import { PelvicCorrectionPage } from './components/PelvicCorrectionPage';
import { NoukousokuPage } from './components/symptoms/NoukousokuPage';
import { ParkinsonPage } from './components/symptoms/ParkinsonPage';
import { KousyukuPage } from './components/symptoms/KousyukuPage';
import { ShinkeitsuuPage } from './components/symptoms/ShinkeitsuuPage';
import { MukumiPage } from './components/symptoms/MukumiPage';
import { HizakansetsuPage } from './components/symptoms/HizakansetsuPage';
import { KokansetsuPage } from './components/symptoms/KokansetsuPage';
import { NetakiriPage } from './components/symptoms/NetakiriPage';
import { KinishukuPage } from './components/symptoms/KinishukuPage';
import { RyumachiPage } from './components/symptoms/RyumachiPage';
import { KeitsuisyouPage } from './components/symptoms/KeitsuisyouPage';
import { ManseiyoutsuPage } from './components/symptoms/ManseiyoutsuPage';
import { NinchishouPage } from './components/symptoms/NinchishouPage';
import { ShisetsuPage } from './components/symptoms/ShisetsuPage';
import { TaiinPage } from './components/symptoms/TaiinPage';
import { ReservationPage } from './components/ReservationPage';
import { ReservationDispatcher } from './components/ReservationDispatcher';

import { AdminLayout } from './components/admin/AdminLayout';
import { AdminDashboard } from './components/admin/AdminDashboard';
import { ReservationList } from './components/admin/ReservationList';
import { PatientList } from './components/admin/PatientList';
import { StaffManagement } from './components/admin/StaffManagement';
import { Settings } from './components/admin/Settings';
import { Notifications } from './components/admin/Notifications';
import { PatientDetail } from './components/admin/PatientDetail';
import { MedicalRecordForm } from './components/admin/MedicalRecordForm';

import { ErrorBoundary } from './components/ErrorBoundary';
import { PrivateGate } from './components/PrivateGate';

// Ledger Imports
import { LedgerLayout } from './ledger/components/LedgerLayout';
import { LedgerAuthGuard } from './ledger/components/LedgerAuthGuard';
import { Login as LedgerLogin } from './ledger/pages/Login';
import { PublicQuestionnaire } from './ledger/pages/PublicQuestionnaire';
import { Dashboard as LedgerDashboard } from './ledger/pages/Dashboard';
import { Patients as LedgerPatients } from './ledger/pages/Patients';
import { Records as LedgerRecords } from './ledger/pages/Records';
import { Reception as LedgerReception } from './ledger/pages/Reception';
import { ReceptionBoard as LedgerReceptionBoard } from './ledger/pages/ReceptionBoard';
import { Settings as LedgerSettings } from './ledger/pages/Settings';
import { SettingsPaymentMethods as LedgerPaymentSettings } from './ledger/pages/SettingsPaymentMethods';
import { Summary as LedgerSummary } from './ledger/pages/Summary';
import { ImageGalleryPage } from './ledger/pages/ImageGalleryPage';
import { PatientQuestionnaire as LedgerPatientQuestionnaire } from './ledger/pages/patient/Questionnaire';
import { PatientHub as LedgerPatientHub } from './ledger/pages/patient/Hub';
import { SaaSAdminDashboard } from './src/pages/SaaSAdminDashboard';
import { SaaSLandingPage } from './src/pages/SaaSLandingPage';

const App: React.FC = () => {
  return (
    <ErrorBoundary>
      <Router>
        <PrivateGate>
          <div className="min-h-screen bg-stone-50 font-sans text-stone-800">
            <Routes>
          {/* Patient Routes (Publicly Accessible) */}
          <Route path="/patient/questionnaire" element={<LedgerPatientQuestionnaire />} />
          <Route path="/patient/hub" element={<LedgerPatientHub />} />
          <Route path="/patient/booking" element={<div>Web Booking (Coming Soon)</div>} />

          {/* Legacy Redirects for compatibility */}
          <Route path="/ledger/questionnaire" element={<Navigate to="/patient/questionnaire" replace />} />
          <Route path="/ledger/web-booking" element={<Navigate to="/patient/booking" replace />} />

          {/* Ledger Staff Routes (Managed/Internal) */}
          <Route path="/ledger/login" element={<LedgerLogin />} />
          <Route path="/ledger/lp" element={<SaaSLandingPage />} />
          
          <Route path="/ledger" element={<LedgerAuthGuard />}>
            <Route element={<LedgerLayout />}>
              <Route index element={<LedgerDashboard />} />
              <Route path="reception" element={<LedgerReception />} />
              <Route path="dashboard" element={<LedgerDashboard />} />
              <Route path="patients" element={<LedgerPatients />} />
              <Route path="records" element={<LedgerRecords />} />
              <Route path="summary" element={<LedgerSummary />} />
              <Route path="settings" element={<LedgerSettings />} />
              <Route path="settings/payment-methods" element={<LedgerPaymentSettings />} />
              <Route path="gallery/:clinicId/:patientId/:reservationId" element={<ImageGalleryPage />} />
            </Route>
            <Route path="reception-board" element={<LedgerReceptionBoard />} />
          </Route>

          <Route path="/saas-admin" element={<SaaSAdminDashboard />} />

          {/* Admin Routes */}
          <Route path="/admin/:clinicId" element={<AdminLayout />}>
            <Route index element={<AdminDashboard />} />
            <Route path="reservations" element={<ReservationList />} />
            <Route path="patients" element={<PatientList />} />
            <Route path="staff" element={<StaffManagement />} />
            <Route path="hours" element={<Settings />} />
            <Route path="holidays" element={<Settings />} />
            <Route path="notifications" element={<Notifications />} />
            <Route path="patient/:patientId" element={<PatientDetail />} />
          </Route>

          {/* Public Routes */}
          <Route path="/*" element={
            <>
              <Header />
              <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/予約" element={<ReservationPage />} />
                <Route path="/reservation" element={<ReservationDispatcher />} />
                <Route path="/施術予約" element={<ReservationPage />} />
                <Route path="/予約/大塔院" element={<DaitoReservationPage />} />
                <Route path="/予約/早岐院" element={<HaikiReservationPage />} />
                <Route path="/予約/矢峰院" element={<YamineReservationPage />} />
                <Route path="/home-visit" element={<HomeVisitPage />} />
                <Route path="/traffic-accident" element={<TrafficAccidentPage />} />
                <Route path="/infertility" element={<InfertilityPage />} />
                <Route path="/beauty-acupuncture" element={<BeautyAcupuncturePage />} />
                <Route path="/oxygen-room" element={<OxygenRoomPage />} />
                <Route path="/autonomic-imbalance" element={<AutonomicImbalancePage />} />
                <Route path="/lumbago" element={<LumbagoPage />} />
                <Route path="/pelvic-correction" element={<PelvicCorrectionPage />} />
                <Route path="/symptoms/noukousoku" element={<NoukousokuPage />} />
                <Route path="/symptoms/parkinson" element={<ParkinsonPage />} />
                <Route path="/symptoms/kousyuku" element={<KousyukuPage />} />
                <Route path="/symptoms/shinkeitsuu" element={<ShinkeitsuuPage />} />
                <Route path="/symptoms/mukumi" element={<MukumiPage />} />
                <Route path="/symptoms/hizakansetsu" element={<HizakansetsuPage />} />
                <Route path="/symptoms/kokansetsu" element={<KokansetsuPage />} />
                <Route path="/symptoms/netakiri" element={<NetakiriPage />} />
                <Route path="/symptoms/kinishuku" element={<KinishukuPage />} />
                <Route path="/symptoms/ryumachi" element={<RyumachiPage />} />
                <Route path="/symptoms/keitsuisyou" element={<KeitsuisyouPage />} />
                <Route path="/symptoms/manseiyoutsu" element={<ManseiyoutsuPage />} />
                <Route path="/symptoms/ninchishou" element={<NinchishouPage />} />
                <Route path="/symptoms/shisetsu" element={<ShisetsuPage />} />
                <Route path="/symptoms/taiin" element={<TaiinPage />} />
                <Route path="/staff/:clinicId" element={<StaffList />} />
              </Routes>
              <Footer />
              <AIConsultant />
            </>
          } />
        </Routes>
      </div>
     </PrivateGate>
    </Router>
    </ErrorBoundary>
  );
};

export default App;
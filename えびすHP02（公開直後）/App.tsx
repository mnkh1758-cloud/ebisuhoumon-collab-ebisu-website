import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Header } from './components/Header';
import { Footer } from './components/Footer';
import { AIConsultant } from './components/AIConsultant';
import { Home } from './components/Home';
import { StaffSelect } from './components/StaffSelect';
import { StaffList } from './components/StaffList';

const App: React.FC = () => {
  return (
    <Router>
      <div className="min-h-screen bg-stone-50 font-sans text-stone-800">
        <Header />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/staff" element={<StaffSelect />} />
          <Route path="/staff/:clinicId" element={<StaffList />} />
        </Routes>
        <Footer />
        <AIConsultant />
      </div>
    </Router>
  );
};

export default App;
import React, { useState, useEffect } from 'react';
import { Link, Outlet, useLocation, useNavigate, useOutletContext } from 'react-router-dom';
import { auth, logout, db } from '../../firebase';
import { doc, getDoc } from 'firebase/firestore';
import { LogOut, Calendar, Users, FileText, Settings, UserCircle, ListTodo, LayoutDashboard, ChevronDown, Zap, BarChart3 } from 'lucide-react';
import { UserProfile, Clinic, FeatureFlags } from '../../types';

export const LedgerLayout: React.FC = () => {
  const { userProfile, clinic, featureFlags, trialDaysLeft } = useOutletContext<{ 
    userProfile: UserProfile, 
    clinic: Clinic, 
    featureFlags: FeatureFlags,
    trialDaysLeft: number | null
  }>();
  const location = useLocation();
  const navigate = useNavigate();
  const user = auth.currentUser;

  const [clinicName, setClinicName] = useState(clinic?.name || '読み込み中...');
  const clinicId = userProfile.clinicId;

  useEffect(() => {
    if (clinic?.name) {
      setClinicName(clinic.name);
    }
  }, [clinic]);

  const navItems = [
    { name: '来院リスト', path: '/ledger/reception', icon: <ListTodo size={20} /> },
    { name: 'ダッシュボード', path: '/ledger/dashboard', icon: <LayoutDashboard size={20} />, hidden: !featureFlags.canUseAnalytics },
    { name: '予約管理', path: `/admin/${clinicId}/reservations`, icon: <Calendar size={20} />, external: true },
    { name: '患者管理', path: '/ledger/patients', icon: <Users size={20} /> },
    { name: 'カルテ管理', path: '/ledger/records', icon: <FileText size={20} />, hidden: !featureFlags.canUseChart },
    { name: 'スタッフ管理', path: `/admin/${clinicId}/staff`, icon: <UserCircle size={20} />, external: true },
    { name: '集計管理', path: '/ledger/summary', icon: <BarChart3 size={20} /> },
    { name: '院設定', path: '/ledger/settings', icon: <Settings size={20} /> },
  ].filter(item => !item.hidden);

  const handleLogout = async () => {
    await logout();
    navigate('/ledger/login');
  };

  return (
    <div className="min-h-screen bg-stone-100 flex">
      {/* Sidebar */}
      <aside className="w-64 bg-white border-r border-stone-200 flex flex-col hidden md:flex">
        <div className="p-6 border-b border-stone-200">
          <div className="flex items-center gap-2 mb-1">
            <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
            <h1 className="text-sm font-black text-stone-400 uppercase tracking-widest">Smart Ledger1</h1>
          </div>
          <div className="mt-2">
            <div className="flex items-center justify-between w-full bg-stone-50 border border-stone-200 rounded-xl px-4 py-3 font-black text-stone-800">
              <div className="truncate">{clinicName}</div>
            </div>
          </div>
        </div>
        <nav className="flex-1 p-4 space-y-2">
          {trialDaysLeft !== null && (
            <div className="mx-2 mb-4 p-4 bg-amber-50 border border-amber-100 rounded-2xl animate-in slide-in-from-left-2">
              <div className="flex items-center gap-2 text-amber-800 font-black text-xs mb-1">
                <Zap size={14} className="fill-amber-500" /> トライアル期間中
              </div>
              <p className="text-[10px] text-amber-700 font-bold leading-tight">残り <span className="text-sm">{trialDaysLeft}</span> 日です。全ての機能をお試しいただけます。</p>
              <Link 
                to="/ledger/settings" 
                className="mt-3 block text-center py-2 bg-amber-600 text-white text-[10px] font-black rounded-lg hover:bg-amber-700 transition-all shadow-sm shadow-amber-100"
              >
                プランをアップグレード
              </Link>
            </div>
          )}
          {navItems.map((item) => (
            item.external ? (
              <a
                key={item.name}
                href={item.path}
                className="flex items-center gap-3 px-4 py-3 rounded-xl transition-colors text-stone-600 hover:bg-stone-50"
              >
                {item.icon}
                {item.name}
              </a>
            ) : (
              <Link
                key={item.name}
                to={item.path}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-colors ${
                  location.pathname === item.path
                    ? 'bg-emerald-50 text-emerald-700 font-bold'
                    : 'text-stone-600 hover:bg-stone-50'
                }`}
              >
                {item.icon}
                {item.name}
              </Link>
            )
          ))}
        </nav>
        <div className="p-4 border-t border-stone-200">
          <div className="flex items-center gap-3 mb-4 px-4">
            {user?.photoURL ? (
              <img src={user.photoURL} alt="User" className="w-8 h-8 rounded-full" />
            ) : (
              <div className="w-8 h-8 rounded-full bg-stone-200 flex items-center justify-center">
                <UserCircle size={20} className="text-stone-500" />
              </div>
            )}
            <div className="text-sm truncate font-medium">{user?.displayName || 'ユーザー'}</div>
          </div>
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 text-stone-500 hover:text-red-600 transition-colors px-4 py-2 w-full"
          >
            <LogOut size={18} />
            <span>ログアウト</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col h-screen overflow-hidden">
        {/* Top Header (Mobile & Actions) */}
        <header className="bg-white border-b border-stone-200 p-4 flex items-center justify-between md:hidden">
          <div className="font-bold text-emerald-600">Smart Ledger1</div>
        </header>

        {/* Page Content */}
        <div className="flex-1 overflow-auto p-4 md:p-6">
          <Outlet context={{ clinicId, userProfile, clinic, featureFlags, trialDaysLeft }} />
        </div>
      </main>
    </div>
  );
};

import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate, Outlet, useLocation } from 'react-router-dom';
import { auth, loginWithGoogle, logout } from '../../firebase';
import { onAuthStateChanged, User } from 'firebase/auth';
import { LogOut, Calendar, Users, Settings, Clock, ExternalLink, Bell, List } from 'lucide-react';
import { perf } from '@/ledger/utils/performance';

export const AdminLayout: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [loginError, setLoginError] = useState<string | null>(null);
  const { clinicId } = useParams<{ clinicId: string }>();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    perf.start('AdminLayout_auth_check');
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      perf.mark('AdminLayout_auth_resolved');
      setUser(currentUser);
      setLoading(false);
      perf.end('AdminLayout_auth_check');
    });
    return () => unsubscribe();
  }, []);

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center bg-stone-50 animate-pulse text-stone-400">Loading Dashboard...</div>;
  }

  const handleLogin = async () => {
    setLoginError(null);
    try {
      await loginWithGoogle();
    } catch (error: any) {
      console.error("Login error:", error);
      if (error.code === 'auth/network-request-failed') {
        setLoginError("ネットワークエラーが発生しました。通信環境を確認するか、ブラウザの広告ブロック機能（AdBlock等）やトラッキング防止機能（Braveブラウザ等）を一時的にオフにしてお試しください。");
      } else {
        setLoginError(error.message || "ログインに失敗しました。設定をご確認ください。");
      }
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-stone-50">
        <div className="bg-white p-8 rounded-2xl shadow-md text-center max-w-md w-full">
          <h1 className="text-2xl font-bold mb-6">予約管理システム</h1>
          <p className="text-stone-600 mb-8">管理画面にアクセスするにはログインしてください。</p>
          
          {loginError && (
            <div className="mb-6 p-4 bg-red-50 text-red-700 rounded-xl text-sm text-left border border-red-200">
              <p className="font-bold mb-1">ログインエラー</p>
              <p>{loginError}</p>
              <p className="mt-2 text-xs">※ポップアップが一瞬で消えてしまう場合は、ブラウザのポップアップブロックやセキュリティ設定が原因です。下の「別タブで開いてログイン」ボタンをお試しください。</p>
            </div>
          )}

          <div className="space-y-3">
            <button
              onClick={handleLogin}
              className="w-full bg-blue-600 text-white py-3 rounded-xl font-bold hover:bg-blue-700 transition-colors"
            >
              Googleでログイン
            </button>
            
            {loginError && (
              <button
                onClick={() => window.open(window.location.href, '_blank')}
                className="w-full bg-stone-100 text-stone-700 py-3 rounded-xl font-bold hover:bg-stone-200 transition-colors border border-stone-300 flex items-center justify-center gap-2"
              >
                <ExternalLink size={18} />
                別タブで開いてログイン（推奨）
              </button>
            )}
          </div>
        </div>
      </div>
    );
  }

  const clinicName = clinicId === 'daitou' ? '大塔院' : clinicId === 'haiki' ? '早岐院' : '矢峰院';

  const navItems = [
    { name: '予約タイムライン', path: `/admin/${clinicId}`, icon: <Calendar size={20} /> },
    { name: '予約一覧', path: `/admin/${clinicId}/reservations`, icon: <List size={20} /> },
    { name: '患者管理', path: `/admin/${clinicId}/patients`, icon: <Users size={20} /> },
    { name: 'スタッフ管理', path: `/admin/${clinicId}/staff`, icon: <Users size={20} /> },
    { name: '営業時間設定', path: `/admin/${clinicId}/hours`, icon: <Clock size={20} /> },
    { name: '休診日設定', path: `/admin/${clinicId}/holidays`, icon: <Settings size={20} /> },
    { name: '通知設定', path: `/admin/${clinicId}/notifications`, icon: <Bell size={20} /> },
  ];

  const handleOpenNewWindow = () => {
    window.open(`${location.pathname}?standalone=true`, '_blank', 'width=1200,height=900');
  };

  const searchParams = new URLSearchParams(location.search);
  const isStandalone = searchParams.get('standalone') === 'true';

  return (
    <div className="min-h-screen bg-stone-100 flex">
      {/* Sidebar */}
      {!isStandalone && (
        <aside className="w-64 bg-white border-r border-stone-200 flex flex-col hidden md:flex">
          <div className="p-6 border-b border-stone-200">
            <h1 className="text-xl font-bold text-stone-800">えびす鍼灸整骨院</h1>
            <div className="text-sm font-medium text-emerald-600 mt-1">{clinicName} 管理画面</div>
          </div>
          <nav className="flex-1 p-4 space-y-2">
            {navItems.map((item) => (
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
            ))}
          </nav>
          <div className="p-4 border-t border-stone-200">
            <div className="flex items-center gap-3 mb-4 px-4">
              <img src={user.photoURL || ''} alt="User" className="w-8 h-8 rounded-full" />
              <div className="text-sm truncate font-medium">{user.displayName}</div>
            </div>
            <button
              onClick={logout}
              className="flex items-center gap-2 text-stone-500 hover:text-red-600 transition-colors px-4 py-2 w-full"
            >
              <LogOut size={18} />
              <span>ログアウト</span>
            </button>
          </div>
        </aside>
      )}

      {/* Main Content */}
      <main className="flex-1 flex flex-col h-screen overflow-hidden">
        {/* Top Header (Mobile & Actions) */}
        {!isStandalone && (
          <header className="bg-white border-b border-stone-200 p-4 flex items-center justify-between md:justify-end">
            <div className="md:hidden font-bold text-emerald-600">{clinicName} 管理</div>
            <div className="flex items-center gap-4">
              <button
                onClick={handleOpenNewWindow}
                className="flex items-center gap-2 text-sm text-stone-600 hover:text-stone-900 bg-stone-100 px-3 py-1.5 rounded-lg transition-colors"
                title="独立ウィンドウで開く"
              >
                <ExternalLink size={16} />
                <span className="hidden sm:inline">別ウィンドウで開く</span>
              </button>
            </div>
          </header>
        )}

        {/* Page Content */}
        <div className="flex-1 overflow-auto p-4 md:p-6">
          <Outlet />
        </div>
      </main>
    </div>
  );
};

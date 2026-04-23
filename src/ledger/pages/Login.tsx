import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { loginWithGoogle } from '../../firebase';
import { ExternalLink } from 'lucide-react';

export const Login: React.FC = () => {
  const [loginError, setLoginError] = useState<string | null>(null);
  const navigate = useNavigate();
  const location = useLocation();

  const from = location.state?.from?.pathname || '/ledger/dashboard';

  const handleLogin = async () => {
    setLoginError(null);
    try {
      await loginWithGoogle();
      navigate(from, { replace: true });
    } catch (error: any) {
      console.error("Login error:", error);
      if (error.code === 'auth/network-request-failed') {
        setLoginError("ネットワークエラーが発生しました。通信環境を確認するか、ブラウザの広告ブロック機能やトラッキング防止機能を一時的にオフにしてお試しください。");
      } else {
        setLoginError(error.message || "ログインに失敗しました。設定をご確認ください。");
      }
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-stone-50">
      <div className="bg-white p-8 rounded-2xl shadow-md text-center max-w-md w-full">
        <h1 className="text-2xl font-bold mb-6">Smart Ledger1</h1>
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
};

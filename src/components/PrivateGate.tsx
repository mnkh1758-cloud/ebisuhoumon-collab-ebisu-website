import React, { useState, useEffect } from 'react';

interface PrivateGateProps {
  children: React.ReactNode;
}

export const PrivateGate: React.FC<PrivateGateProps> = ({ children }) => {
  const [password, setPassword] = useState('');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [error, setError] = useState(false);

  // 一度認証されたらセッション中（またはブラウザを閉じるまで）保持する
  useEffect(() => {
    const authStatus = sessionStorage.getItem('site_auth');
    if (authStatus === 'true') {
      setIsAuthenticated(true);
    }
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // 暫定パスワード: ebisu3390
    // 必要に応じて変更してください
    if (password === 'ebisu3390') {
      setIsAuthenticated(true);
      sessionStorage.setItem('site_auth', 'true');
      setError(false);
    } else {
      setError(true);
      setPassword('');
    }
  };

  if (isAuthenticated) {
    return <>{children}</>;
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-stone-100 font-sans">
      <div className="max-w-md w-full p-8 bg-white rounded-2xl shadow-xl border border-stone-200">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-stone-100 rounded-full mb-4">
            <svg className="w-8 h-8 text-stone-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-stone-800 mb-2">限定公開モード</h2>
          <p className="text-stone-500 text-sm">
            このサイトは現在制作中のため制限されています。<br />
            閲覧するにはパスワードを入力してください。
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="パスワードを入力"
              className={`w-full px-4 py-3 rounded-lg border focus:outline-none focus:ring-2 transition-all ${
                error 
                  ? 'border-red-300 focus:ring-red-100' 
                  : 'border-stone-200 focus:ring-stone-100 focus:border-stone-400'
              }`}
              autoFocus
            />
            {error && (
              <p className="text-red-500 text-xs mt-2 text-center">
                パスワードが正しくありません。
              </p>
            )}
          </div>
          <button
            type="submit"
            className="w-full bg-stone-800 hover:bg-stone-900 text-white font-medium py-3 rounded-lg transition-colors shadow-sm"
          >
            サイトにアクセス
          </button>
        </form>

        <div className="mt-8 pt-6 border-t border-stone-100 text-center">
          <p className="text-stone-400 text-xs">
            © 2026 えびす鍼灸整骨院グループ
          </p>
        </div>
      </div>
    </div>
  );
};

import React, { Component, ErrorInfo } from 'react';

interface Props {
  children: React.ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught error:', error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      let errorMessage = "予期せぬエラーが発生しました。";
      let errorDetails = "";

      if (this.state.error) {
        try {
          const parsedError = JSON.parse(this.state.error.message);
          if (parsedError.error) {
            errorMessage = "データベースへのアクセス権限がありません。";
            errorDetails = `操作: ${parsedError.operationType}, パス: ${parsedError.path}, 詳細: ${parsedError.error}`;
          }
        } catch (e) {
          errorMessage = this.state.error.message;
        }
      }

      return (
        <div className="min-h-screen flex items-center justify-center bg-stone-50 p-4">
          <div className="bg-white p-8 rounded-2xl shadow-md max-w-lg w-full">
            <h1 className="text-2xl font-bold text-red-600 mb-4">エラーが発生しました</h1>
            <p className="text-stone-700 mb-4 font-bold">{errorMessage}</p>
            {errorDetails && (
              <div className="bg-stone-100 p-4 rounded-xl text-sm text-stone-600 font-mono break-all">
                {errorDetails}
              </div>
            )}
            <button
              onClick={() => window.location.reload()}
              className="mt-6 w-full bg-stone-800 text-white py-3 rounded-xl font-bold hover:bg-stone-900 transition-colors"
            >
              再読み込み
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

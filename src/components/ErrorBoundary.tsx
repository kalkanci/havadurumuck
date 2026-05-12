import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';

interface Props {
  children?: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false
  };

  public static getDerivedStateFromError(error: Error): State {
    // Update state so the next render will show the fallback UI.
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught error:', error, errorInfo);
  }

  private handleReload = () => {
    window.location.reload();
  };

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-[#020617] text-white flex items-center justify-center p-6 selection:bg-blue-500/30">
          <div className="w-full max-w-md bg-slate-900/95 backdrop-blur-xl border border-white/10 rounded-3xl p-8 shadow-2xl flex flex-col items-center text-center animate-fade-in-up">
            <div className="w-20 h-20 bg-red-500/20 rounded-full flex items-center justify-center mb-6">
              <AlertTriangle size={40} className="text-red-400" />
            </div>

            <h1 className="text-2xl font-bold mb-3 tracking-tight">Beklenmeyen Bir Hata Oluştu</h1>
            <p className="text-slate-400 text-sm mb-8 leading-relaxed">
              Uygulama çalışırken bir sorunla karşılaştık. Lütfen sayfayı yenilemeyi deneyin.
            </p>

            <button
              onClick={this.handleReload}
              className="flex items-center justify-center gap-2 w-full py-4 bg-blue-600 hover:bg-blue-500 active:bg-blue-700 text-white font-bold rounded-2xl shadow-lg shadow-blue-500/25 transition-all duration-200"
            >
              <RefreshCw size={20} />
              Sayfayı Yenile
            </button>

            {process.env.NODE_ENV === 'development' && this.state.error && (
              <div className="mt-6 p-4 bg-black/50 rounded-xl text-left overflow-auto w-full max-h-40 border border-white/5">
                <p className="text-red-400 text-xs font-mono mb-2">{this.state.error.toString()}</p>
                <p className="text-slate-500 text-[10px] font-mono whitespace-pre-wrap">{this.state.error.stack}</p>
              </div>
            )}
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;

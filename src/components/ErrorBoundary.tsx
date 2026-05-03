import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null
  };

  public static getDerivedStateFromError(error: Error): State {
    // Update state so the next render will show the fallback UI.
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught error in ErrorBoundary:', error, errorInfo);
  }

  private handleReset = () => {
    this.setState({ hasError: false, error: null });
    // Reload the page to ensure clean state
    window.location.reload();
  };

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-black flex flex-col items-center justify-center p-6 text-white text-center">
          <div className="bg-red-500/20 p-6 rounded-full mb-6">
            <AlertTriangle size={64} className="text-red-500 animate-pulse" />
          </div>
          <h1 className="text-3xl font-bold mb-4">Beklenmeyen Bir Hata Oluştu</h1>
          <p className="text-zinc-400 mb-8 max-w-md">
            Uygulama çalışırken bir sorunla karşılaştık. Bu durum için özür dileriz.
            {this.state.error && (
              <span className="block mt-2 text-sm text-red-400 font-mono bg-red-900/30 p-2 rounded">
                {this.state.error.message}
              </span>
            )}
          </p>
          <button
            onClick={this.handleReset}
            className="flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-500 rounded-xl font-bold transition-all active:scale-95"
          >
            <RefreshCw size={20} />
            <span>Sayfayı Yenile</span>
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;

import React, { Component, ErrorInfo, ReactNode } from 'react';

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
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught error:', error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      return (
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: '100vh',
          padding: '20px',
          textAlign: 'center',
          backgroundColor: '#1a1a2e',
          color: '#ffffff',
          fontFamily: 'system-ui, -apple-system, sans-serif'
        }}>
          <h1 style={{ marginBottom: '10px' }}>Beklenmeyen Bir Hata Oluştu</h1>
          <p style={{ marginBottom: '20px', color: '#a0a0b0' }}>
            Uygulama çalışırken bir sorunla karşılaştı. Lütfen sayfayı yenileyin.
          </p>
          <button
            onClick={() => window.location.reload()}
            style={{
              padding: '10px 20px',
              backgroundColor: '#4a4a8a',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              cursor: 'pointer',
              fontWeight: 'bold'
            }}
          >
            Sayfayı Yenile
          </button>
          {this.state.error && (
            <div style={{ marginTop: '30px', padding: '15px', backgroundColor: '#2a2a3e', borderRadius: '8px', textAlign: 'left', maxWidth: '80%' }}>
              <p style={{ fontFamily: 'monospace', fontSize: '12px', margin: 0, color: '#ff6b6b' }}>
                {this.state.error.toString()}
              </p>
            </div>
          )}
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;

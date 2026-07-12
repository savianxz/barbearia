import React, { Component, ErrorInfo, ReactNode } from 'react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
    errorInfo: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error, errorInfo: null };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught error:', error, errorInfo);
    this.setState({ errorInfo });
  }

  public render() {
    if (this.state.hasError) {
      return (
        <div style={{ padding: '2rem', backgroundColor: '#111', color: 'white', minHeight: '100vh', fontFamily: 'sans-serif' }}>
          <h1 style={{ color: '#ff5555' }}>Algo deu errado na aplicação.</h1>
          <p style={{ fontSize: '1.2rem', marginBottom: '1rem' }}>{this.state.error?.message}</p>

          <div style={{ backgroundColor: '#222', padding: '1rem', borderRadius: '8px', overflowX: 'auto', marginBottom: '1rem' }}>
            <pre style={{ color: '#ffaaaa', fontSize: '14px', margin: 0 }}>
              {this.state.error?.stack}
            </pre>
          </div>

          {this.state.errorInfo && (
            <div style={{ backgroundColor: '#222', padding: '1rem', borderRadius: '8px', overflowX: 'auto', marginBottom: '1rem' }}>
              <pre style={{ color: '#aaaaff', fontSize: '14px', margin: 0 }}>
                {this.state.errorInfo.componentStack}
              </pre>
            </div>
          )}

          <button
            onClick={() => window.location.reload()}
            style={{ padding: '0.75rem 1.5rem', backgroundColor: '#D4AF37', color: 'black', border: 'none', borderRadius: '4px', fontWeight: 'bold', cursor: 'pointer' }}
          >
            Recarregar Página
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}

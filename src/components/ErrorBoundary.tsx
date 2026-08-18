import { Component } from 'react';
import type { ErrorInfo, ReactNode } from 'react';

interface ErrorBoundaryProps {
  readonly children: ReactNode;
  readonly fallbackTitle?: string;
}

interface ErrorBoundaryState {
  readonly error: Error | null;
}

/**
 * Barriera d'errore: un livello mal formato non deve mai far crollare l'app.
 */
export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  public override state: ErrorBoundaryState = { error: null };

  public static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { error };
  }

  public override componentDidCatch(error: Error, info: ErrorInfo): void {
    console.error('[Tessera] errore non gestito', error, info.componentStack);
  }

  private readonly handleRetry = (): void => {
    this.setState({ error: null });
  };

  public override render(): ReactNode {
    const { error } = this.state;
    const { children, fallbackTitle = 'Il tavolo si è rovesciato' } = this.props;

    if (error === null) return children;

    return (
      <div role="alert" style={fallbackStyle}>
        <h2 style={{ fontFamily: 'var(--font-display)', margin: 0 }}>{fallbackTitle}</h2>
        <p style={{ opacity: 0.8, maxWidth: '40ch' }}>{error.message}</p>
        <button type="button" onClick={this.handleRetry} style={retryStyle}>
          Rimetti a posto
        </button>
      </div>
    );
  }
}

const fallbackStyle: React.CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  gap: '1rem',
  minHeight: '100vh',
  padding: '2rem',
  textAlign: 'center',
};

const retryStyle: React.CSSProperties = {
  padding: '0.7rem 1.4rem',
  borderRadius: 'var(--radius-md)',
  background: 'var(--brass-200)',
  color: 'var(--ink)',
  fontWeight: 700,
};

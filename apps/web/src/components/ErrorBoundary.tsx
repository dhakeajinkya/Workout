import { Component, type ReactNode } from 'react';

interface Props {
  children: ReactNode;
}

interface State {
  error: Error | null;
}

export default class ErrorBoundary extends Component<Props, State> {
  state: State = { error: null };

  static getDerivedStateFromError(error: Error) {
    return { error };
  }

  render() {
    if (this.state.error) {
      const isChunkError = this.state.error.message?.includes('Failed to fetch dynamically imported module')
        || this.state.error.message?.includes('Loading chunk');
      return (
        <div style={{ padding: '2rem' }}>
          <h2 style={{ color: '#ef5350', marginBottom: '0.5rem' }}>
            {isChunkError ? 'Update available' : 'Something went wrong'}
          </h2>
          <p style={{ fontSize: '0.85rem', color: 'rgba(255,255,255,0.6)', marginBottom: '1rem' }}>
            {isChunkError
              ? 'A new version was deployed. Reload to get the latest.'
              : this.state.error.message}
          </p>
          <div style={{ display: 'flex', gap: '0.75rem' }}>
            {isChunkError ? (
              <button
                onClick={() => window.location.reload()}
                style={{
                  padding: '0.5rem 1rem',
                  background: '#7986cb',
                  color: '#fff',
                  border: 'none',
                  borderRadius: '8px',
                  cursor: 'pointer',
                }}
              >
                Reload
              </button>
            ) : (
              <button
                onClick={() => this.setState({ error: null })}
                style={{
                  padding: '0.5rem 1rem',
                  background: '#7986cb',
                  color: '#fff',
                  border: 'none',
                  borderRadius: '8px',
                  cursor: 'pointer',
                }}
              >
                Try again
              </button>
            )}
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

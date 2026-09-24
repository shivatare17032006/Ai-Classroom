import React from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';

export class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error("Uncaught React Error:", error, errorInfo);
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null });
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      return (
        <div style={{
          minHeight: '100vh',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          background: '#0f172a',
          color: '#f8fafc',
          padding: '2rem',
          textAlign: 'center'
        }}>
          <div style={{ background: 'rgba(239, 68, 68, 0.15)', padding: '1.25rem', borderRadius: '50%', color: '#ef4444', marginBottom: '1rem' }}>
            <AlertTriangle size={48} />
          </div>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 800, marginBottom: '0.5rem' }}>Application Render Issue Caught</h2>
          <p style={{ fontSize: '0.9rem', color: '#94a3b8', maxWidth: '500px', marginBottom: '1.5rem', lineHeight: '1.5' }}>
            An unexpected error occurred while rendering the page. Click below to reload and restore clean session state.
          </p>
          <div style={{ background: '#1e293b', padding: '1rem', borderRadius: '8px', fontSize: '0.8rem', color: '#ef4444', fontFamily: 'monospace', maxWidth: '600px', overflowX: 'auto', marginBottom: '1.5rem' }}>
            {this.state.error?.toString() || 'Unknown Error'}
          </div>
          <button onClick={this.handleReset} className="btn btn-primary" style={{ gap: '0.5rem' }}>
            <RefreshCw size={16} /> Reload Academic Portal
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}

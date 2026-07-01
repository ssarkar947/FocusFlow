import { Component } from 'react';
import type { ErrorInfo, ReactNode } from 'react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public override state: State = {
    hasError: false,
    error: null,
    errorInfo: null
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error, errorInfo: null };
  }

  public override componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    this.setState({ error, errorInfo });
    console.error('Uncaught error:', error, errorInfo);
  }

  public override render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-stone-900 text-stone-100 flex items-center justify-center p-6 font-sans">
          <div className="max-w-2xl w-full bg-stone-800 border border-red-500/30 rounded-3xl p-8 shadow-2xl space-y-6">
            <div className="flex items-center gap-3 text-red-500">
              <span className="text-4xl">⚠️</span>
              <div>
                <h1 className="text-2xl font-bold tracking-tight">Application Render Error</h1>
                <p className="text-xs text-stone-400">FocusFlow crashed during render.</p>
              </div>
            </div>
            
            <div className="bg-stone-950 rounded-2xl p-5 overflow-auto text-xs font-mono border border-stone-800 max-h-96 text-red-400">
              <div className="font-bold text-sm text-red-500 mb-2">
                {this.state.error?.toString()}
              </div>
              <pre className="whitespace-pre-wrap leading-relaxed text-stone-300">
                {this.state.errorInfo?.componentStack || this.state.error?.stack}
              </pre>
            </div>

            <div className="flex justify-end gap-3 pt-2">
              <button
                onClick={() => {
                  localStorage.clear();
                  window.location.reload();
                }}
                className="px-5 py-2.5 bg-red-600/20 hover:bg-red-600/30 border border-red-500/20 text-red-400 rounded-xl font-medium transition-all text-sm"
              >
                Reset Storage & Reload
              </button>
              <button
                onClick={() => window.location.reload()}
                className="px-5 py-2.5 bg-stone-700 hover:bg-stone-600 text-stone-200 rounded-xl font-medium transition-all text-sm"
              >
                Reload Page
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

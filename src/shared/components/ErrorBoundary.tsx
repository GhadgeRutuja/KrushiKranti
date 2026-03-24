import { Component, type ErrorInfo, type ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { AlertTriangle, Home, RefreshCw } from 'lucide-react';

interface Props {
    children?: ReactNode;
}

interface State {
    hasError: boolean;
}

export class ErrorBoundary extends Component<Props, State> {
    public state: State = {
        hasError: false
    };

    public static getDerivedStateFromError(_: Error): State {
        return { hasError: true };
    }

    public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
        console.error('Uncaught error:', error, errorInfo);
    }

    public render() {
        if (this.state.hasError) {
            return (
                <div className="min-h-screen flex items-center justify-center bg-soft-bg dark:bg-gray-950 px-4">
                    <div className="max-w-md w-full text-center">
                        <div className="w-16 h-16 bg-red-50 dark:bg-red-900/10 rounded-full flex items-center justify-center mx-auto mb-6">
                            <AlertTriangle className="text-red-600" size={32} />
                        </div>
                        <h1 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">Unexpected application error</h1>
                        <p className="text-slate-500 dark:text-slate-400 mb-8 text-sm">
                            We encountered an unexpected error. Please try refreshing the page or return home.
                        </p>
                        <div className="flex flex-col sm:flex-row gap-4 justify-center">
                            <button
                                onClick={() => window.location.reload()}
                                className="btn-primary flex items-center justify-center gap-2 py-2.5 px-6 text-xs uppercase tracking-widest"
                            >
                                <RefreshCw size={14} />
                                Refresh Page
                            </button>
                            <Link
                                to="/"
                                className="btn-secondary flex items-center justify-center gap-2 py-2.5 px-6 text-xs uppercase tracking-widest"
                                onClick={() => this.setState({ hasError: false })}
                            >
                                <Home size={14} />
                                Go Home
                            </Link>
                        </div>
                    </div>
                </div>
            );
        }

        return this.props.children;
    }
}

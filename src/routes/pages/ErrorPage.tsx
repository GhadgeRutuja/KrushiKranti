import { Link, useRouteError, isRouteErrorResponse } from 'react-router-dom';
import { AlertTriangle, Home, RefreshCw } from 'lucide-react';

export function ErrorPage() {
    const error = useRouteError();
    console.error('Route error:', error);

    let title = 'Unexpected page error';
    let message = 'We encountered an unexpected error. Please try refreshing the page or return home.';

    if (isRouteErrorResponse(error)) {
        if (error.status === 404) {
            title = '404 - Not Found';
            message = "The page you're looking for doesn't exist.";
        } else if (error.status === 401) {
            title = '401 - Unauthorized';
            message = 'Please log in to access this page.';
        } else if (error.status === 403) {
            title = '403 - Forbidden';
            message = "You don't have permission to view this content.";
        } else if (error.status === 503) {
            title = '503 - Service Unavailable';
            message = "Looks like our API is down. We'll be back soon!";
        }
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-soft-bg dark:bg-gray-950 px-4">
            <div className="max-w-md w-full text-center">
                <div className="w-16 h-16 bg-red-50 dark:bg-red-900/10 rounded-full flex items-center justify-center mx-auto mb-6">
                    <AlertTriangle className="text-red-600" size={32} />
                </div>
                <h1 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">{title}</h1>
                <p className="text-slate-500 dark:text-slate-400 mb-8 text-sm">
                    {message}
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
                    >
                        <Home size={14} />
                        Go Home
                    </Link>
                </div>
            </div>
        </div>
    );
}

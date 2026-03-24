import { Link } from 'react-router-dom';
import { Home, ArrowLeft } from 'lucide-react';

export function NotFoundPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-[#F8FAFC] dark:bg-gray-950 px-4">
      <div className="text-center max-w-md">
        <h1 className="text-9xl font-black text-slate-200 dark:text-slate-800">404</h1>
        <div className="-mt-12">
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">
            Page Not Found
          </h2>
          <p className="text-slate-500 dark:text-slate-400 mb-8 text-sm leading-relaxed">
            The page you're looking for doesn't exist or has been moved to a different location.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to="/"
              className="btn-primary flex items-center justify-center gap-2 py-2.5 px-6 text-xs uppercase tracking-widest"
            >
              <Home size={14} />
              Go Home
            </Link>
            <button
              onClick={() => window.history.back()}
              className="px-6 py-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 font-bold text-xs uppercase tracking-widest rounded-lg flex items-center justify-center gap-2"
            >
              <ArrowLeft size={14} />
              Go Back
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

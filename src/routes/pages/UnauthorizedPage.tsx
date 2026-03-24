import { Link } from 'react-router-dom';
import { ShieldX, Home } from 'lucide-react';

export function UnauthorizedPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-[#F8FAFC] dark:bg-gray-950 px-4">
      <div className="text-center max-w-md">
        <div className="w-16 h-16 bg-red-50 dark:bg-red-900/10 rounded-full flex items-center justify-center mx-auto mb-6">
          <ShieldX className="text-red-600" size={32} />
        </div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">
          Access Denied
        </h1>
        <p className="text-slate-500 dark:text-slate-400 mb-8 text-sm leading-relaxed">
          You don't have the required permissions to view this content. Please contact support if you believe this is an error.
        </p>
        <Link
          to="/"
          className="btn-primary inline-flex items-center gap-2 py-2.5 px-8 text-xs uppercase tracking-widest"
        >
          <Home size={14} />
          Go to Home
        </Link>
      </div>
    </div>
  );
}

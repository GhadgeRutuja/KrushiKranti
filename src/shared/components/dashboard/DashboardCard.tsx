import React from 'react';

interface DashboardCardProps {
    children: React.ReactNode;
    className?: string;
    title?: string;
}

export function DashboardCard({ children, className = '', title }: DashboardCardProps) {
    return (
        <div className={`bg-white dark:bg-gray-900 border border-slate-200 dark:border-slate-800 rounded-lg p-6 ${className}`}>
            {title && <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">{title}</h3>}
            {children}
        </div>
    );
}

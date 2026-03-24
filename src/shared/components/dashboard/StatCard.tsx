import type { LucideIcon } from 'lucide-react';

interface StatCardProps {
    title: string;
    value: string | number;
    icon: LucideIcon;
    subtitle?: string;
    iconColor?: string;
    iconBg?: string;
}

export function StatCard({
    title,
    value,
    icon: Icon,
    subtitle,
    iconColor = 'text-slate-600',
    iconBg = 'bg-slate-100 dark:bg-slate-800'
}: StatCardProps) {
    return (
        <div className="bg-white dark:bg-gray-900 border border-slate-200 dark:border-slate-800 rounded-lg p-6 flex items-center gap-4 shadow-none">
            <div className={`w-10 h-10 rounded-lg flex items-center justify-center shrink-0 ${iconBg}`}>
                <Icon size={20} className={iconColor} />
            </div>
            <div className="min-w-0">
                <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">{title}</p>
                <h3 className="text-xl font-bold text-slate-900 dark:text-white mt-1 tabular-nums truncate">{value}</h3>
                {subtitle && <p className="text-[10px] text-slate-400 dark:text-slate-500 mt-1 truncate">{subtitle}</p>}
            </div>
        </div>
    );
}

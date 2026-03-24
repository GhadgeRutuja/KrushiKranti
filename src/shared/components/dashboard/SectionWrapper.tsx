import React from 'react';

interface SectionWrapperProps {
    children: React.ReactNode;
    title?: string;
    description?: string;
    className?: string;
}

export function SectionWrapper({ children, title, description, className = '' }: SectionWrapperProps) {
    return (
        <section className={`space-y-4 ${className}`}>
            {(title || description) && (
                <div className="mb-6">
                    {title && <h2 className="text-xl font-bold text-slate-900 dark:text-white">{title}</h2>}
                    {description && <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">{description}</p>}
                </div>
            )}
            {children}
        </section>
    );
}

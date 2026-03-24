import type { ReactNode } from "react";

interface SkeletonProps {
  className?: string;
}

export function Skeleton({ className = "" }: SkeletonProps) {
  return <div className={`animate-pulse rounded-lg bg-slate-200 dark:bg-slate-800 ${className}`} />;
}

export function ProductCardSkeleton() {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-gray-900">
      <Skeleton className="h-44 w-full rounded-xl" />
      <div className="mt-4 space-y-2">
        <Skeleton className="h-4 w-3/4" />
        <Skeleton className="h-4 w-1/2" />
      </div>
      <div className="mt-4 flex items-center justify-between">
        <Skeleton className="h-5 w-24" />
        <Skeleton className="h-6 w-16 rounded-full" />
      </div>
      <Skeleton className="mt-4 h-10 w-full rounded-xl" />
    </div>
  );
}

export function TableRowSkeleton({ columns = 4 }: { columns?: number }) {
  return (
    <tr>
      {Array.from({ length: columns }).map((_, idx) => (
        <td key={idx} className="px-5 py-4">
          <Skeleton className="h-4 w-full" />
        </td>
      ))}
    </tr>
  );
}

export function MessageSkeleton() {
  return (
    <div className="space-y-3">
      <div className="flex justify-start">
        <Skeleton className="h-12 w-56 rounded-2xl" />
      </div>
      <div className="flex justify-end">
        <Skeleton className="h-12 w-48 rounded-2xl" />
      </div>
      <div className="flex justify-start">
        <Skeleton className="h-12 w-64 rounded-2xl" />
      </div>
    </div>
  );
}

export function SkeletonBlock({ children }: { children: ReactNode }) {
  return <div className="animate-pulse">{children}</div>;
}

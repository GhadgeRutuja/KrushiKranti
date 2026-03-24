export function ProductCardSkeleton() {
  return (
    <div className="bg-white dark:bg-gray-900 rounded-lg border border-slate-200 dark:border-slate-800 overflow-hidden animate-pulse">
      {/* Image skeleton */}
      <div className="h-44 bg-slate-100 dark:bg-slate-800" />

      {/* Content skeleton */}
      <div className="p-4 space-y-2">
        <div className="h-3 bg-slate-100 dark:bg-slate-800 rounded w-1/4" />
        <div className="h-4 bg-slate-100 dark:bg-slate-800 rounded w-3/4" />
        <div className="h-3 bg-slate-100 dark:bg-slate-800 rounded w-1/2" />
        <div className="h-3 bg-slate-100 dark:bg-slate-800 rounded w-1/3" />
        <div className="pt-2 flex items-end justify-between">
          <div className="space-y-1">
            <div className="h-5 bg-slate-100 dark:bg-slate-800 rounded w-20" />
            <div className="h-3 bg-slate-100 dark:bg-slate-800 rounded w-28" />
          </div>
          <div className="h-4 bg-slate-100 dark:bg-slate-800 rounded w-16" />
        </div>
        <div className="h-9 bg-slate-100 dark:bg-slate-800 rounded mt-3" />
      </div>
    </div>
  );
}

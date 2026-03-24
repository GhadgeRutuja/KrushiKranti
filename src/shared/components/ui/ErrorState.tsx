import { RiAlarmWarningLine, RiRefreshLine } from "react-icons/ri";

interface ErrorStateProps {
    message?: string;
    onRetry?: () => void;
}

export function ErrorState({ message, onRetry }: ErrorStateProps) {
    return (
        <div className="rounded-2xl border border-red-200 bg-red-50 p-6 text-center dark:border-red-800 dark:bg-red-900/20">
            <RiAlarmWarningLine className="mx-auto mb-3 text-red-600 dark:text-red-400" size={28} />
            <h3 className="text-base font-semibold text-red-700 dark:text-red-300">Unable to load this section</h3>
            <p className="mt-1 text-sm text-red-600/90 dark:text-red-400/90">
                {message || "Please try again later."}
            </p>
            {onRetry && (
                <button
                    type="button"
                    onClick={onRetry}
                    className="mt-4 inline-flex items-center gap-2 rounded-xl bg-red-600 px-4 py-2 text-sm font-semibold text-white hover:bg-red-700"
                >
                    <RiRefreshLine size={16} /> Retry
                </button>
            )}
        </div>
    );
}

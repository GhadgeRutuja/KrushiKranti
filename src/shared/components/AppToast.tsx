import { AlertTriangle, CheckCircle, X, XCircle } from "lucide-react";
import { toast as hotToast, resolveValue, type Toast } from "react-hot-toast";

interface AppToastProps {
  toastData: Toast;
  darkMode: boolean;
}

export function AppToast({ toastData, darkMode }: AppToastProps) {
  const type =
    toastData.type === "success" || toastData.type === "error"
      ? toastData.type
      : "loading";

  const tone = {
    success: {
      icon: CheckCircle,
      iconClass: "text-green-500",
      borderClass: "border-green-500/20",
      title: "Success",
    },
    error: {
      icon: XCircle,
      iconClass: "text-red-500",
      borderClass: "border-red-500/20",
      title: "Error",
    },
    loading: {
      icon: AlertTriangle,
      iconClass: "text-yellow-500",
      borderClass: "border-yellow-500/20",
      title: "Notice",
    },
  }[type];

  const Icon = tone.icon;
  const body = resolveValue(toastData.message, toastData);

  return (
    <div
      className={`flex items-start gap-2.5 p-3 rounded-xl min-w-[260px] max-w-sm border shadow-lg backdrop-blur-md transition-all duration-300 ease-out ${
        darkMode
          ? `bg-gray-900/90 text-white ${tone.borderClass} shadow-black/30`
          : `bg-white/95 text-slate-900 ${tone.borderClass} shadow-slate-200/80`
      } ${toastData.visible ? "translate-y-0 opacity-100" : "translate-y-2 opacity-0"}`}
      role="status"
      aria-live="polite"
    >
      <div className="mt-0.5 shrink-0">
        <Icon className={`w-4 h-4 ${tone.iconClass}`} />
      </div>

      <div className="flex-1 min-w-0 pr-1">
        <p className="text-sm font-semibold leading-5">{tone.title}</p>
        <p className={`text-xs mt-1 leading-4 break-words ${darkMode ? "text-gray-300" : "text-slate-600"}`}>
          {body}
        </p>
      </div>

      <button
        type="button"
        onClick={() => hotToast.dismiss(toastData.id)}
        aria-label="Dismiss notification"
        className={`shrink-0 rounded-md p-1 transition-colors ${
          darkMode
            ? "text-gray-400 hover:text-white hover:bg-gray-800"
            : "text-slate-500 hover:text-slate-900 hover:bg-slate-100"
        }`}
      >
        <X className="w-3.5 h-3.5" />
      </button>
    </div>
  );
}

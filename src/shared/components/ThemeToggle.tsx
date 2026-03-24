import { Moon, Sun } from "lucide-react";

interface ThemeToggleProps {
  isDark: boolean;
  onToggle: () => void;
  title?: string;
  className?: string;
}

export function ThemeToggle({ isDark, onToggle, title, className = "" }: ThemeToggleProps) {
  return (
    <button
      type="button"
      onClick={onToggle}
      title={title}
      aria-label={title || "Toggle theme"}
      aria-pressed={isDark}
      className={`relative w-14 h-8 flex items-center rounded-full cursor-pointer transition-colors duration-300 active:scale-95 ${
        isDark
          ? "bg-gray-700 shadow-inner"
          : "bg-yellow-400 shadow-yellow-300/60 shadow-sm"
      } ${className}`}
    >
      <Sun className="absolute left-2 w-4 h-4 text-yellow-700" />
      <Moon className="absolute right-2 w-4 h-4 text-gray-200" />
      <span
        className={`absolute top-1 left-1 w-6 h-6 bg-white rounded-full shadow-md transform transition-transform duration-300 ${
          isDark ? "translate-x-6" : "translate-x-0"
        }`}
      />
    </button>
  );
}

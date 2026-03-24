import { useTranslation } from "react-i18next";
import { RiTranslate2 } from "react-icons/ri";
import { useState, useRef, useEffect } from "react";
import { useAppDispatch, useAppSelector } from "../hooks";
import { setLanguage } from "../../app/uiSlice";

export function LanguageSwitcher() {
  const { i18n } = useTranslation();
  const dispatch = useAppDispatch();
  const { language } = useAppSelector((state) => state.ui);
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const languages = [
    { code: "en", label: "English" },
    { code: "hi", label: "हिन्दी" },
    { code: "mr", label: "मराठी" },
  ];

  const currentLanguage =
    languages.find((l) => l.code === language) || languages[0];

  useEffect(() => {
    if (i18n.language !== language) {
      i18n.changeLanguage(language);
    }
  }, [language, i18n]);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="p-1.5 rounded-lg text-slate-500 transition-none flex items-center gap-1.5"
        title="Change Language"
      >
        <RiTranslate2 size={18} />
        <span className="text-[10px] font-bold uppercase tracking-widest hidden sm:inline">
          {currentLanguage.code}
        </span>
      </button>
      {isOpen && (
        <div className="absolute right-0 mt-2 w-32 bg-white dark:bg-gray-900 rounded-lg shadow-lg border border-slate-200 dark:border-slate-800 py-1.5 z-[100]">
          {languages.map((lang) => (
            <button
              key={lang.code}
              onClick={() => {
                dispatch(setLanguage(lang.code));
                setIsOpen(false);
              }}
              className={`w-full text-left px-4 py-2 text-xs font-bold transition-none flex items-center justify-between
                ${i18n.language === lang.code ? "text-primary-600 bg-slate-50 dark:bg-slate-800" : "text-slate-500 dark:text-slate-400"}`}
            >
              {lang.label}
              {i18n.language === lang.code && (
                <div className="w-1 h-1 rounded-full bg-primary-600" />
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import './i18n/config';
// Swiper CSS styles
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';
import App from './App';

// ─── Apply dark mode BEFORE React renders to prevent flash ───
// This runs synchronously, so the class is on <html> before any paint.
(function applyTheme() {
  try {
    const stored = localStorage.getItem('darkMode');
    let isDark: boolean;
    if (stored !== null) {
      isDark = JSON.parse(stored);
    } else {
      isDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    }
    if (isDark) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  } catch {
    // localStorage may be unavailable in private mode — no-op
  }
})();

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>
);

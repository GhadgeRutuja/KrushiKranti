import { createSlice, type PayloadAction } from '@reduxjs/toolkit';

interface UiState {
  darkMode: boolean;
  sidebarOpen: boolean;
  language: string;
}

const getInitialDarkMode = (): boolean => {
  if (typeof window !== "undefined") {
    const stored = localStorage.getItem("darkMode");
    if (stored !== null) {
      return JSON.parse(stored);
    }
    return window.matchMedia("(prefers-color-scheme: dark)").matches;
  }
  return false;
};

const getInitialLanguage = (): string => {
  if (typeof window !== "undefined") {
    const stored = localStorage.getItem("i18nextLng");
    return stored || "en";
  }
  return "en";
};

const initialState: UiState = {
  darkMode: getInitialDarkMode(),
  sidebarOpen: false,
  language: getInitialLanguage(),
};

const uiSlice = createSlice({
  name: "ui",
  initialState,
  reducers: {
    toggleDarkMode: (state) => {
      state.darkMode = !state.darkMode;
      localStorage.setItem("darkMode", JSON.stringify(state.darkMode));
      if (state.darkMode) {
        document.documentElement.classList.add("dark");
      } else {
        document.documentElement.classList.remove("dark");
      }
    },
    setDarkMode: (state, action: PayloadAction<boolean>) => {
      state.darkMode = action.payload;
      localStorage.setItem("darkMode", JSON.stringify(state.darkMode));
      if (state.darkMode) {
        document.documentElement.classList.add("dark");
      } else {
        document.documentElement.classList.remove("dark");
      }
    },
    toggleSidebar: (state) => {
      state.sidebarOpen = !state.sidebarOpen;
    },
    setSidebarOpen: (state, action: PayloadAction<boolean>) => {
      state.sidebarOpen = action.payload;
    },
    setLanguage: (state, action: PayloadAction<string>) => {
      state.language = action.payload;
      localStorage.setItem("i18nextLng", action.payload);
    },
  },
});

export const { toggleDarkMode, setDarkMode, toggleSidebar, setSidebarOpen, setLanguage } =
  uiSlice.actions;
export default uiSlice.reducer;

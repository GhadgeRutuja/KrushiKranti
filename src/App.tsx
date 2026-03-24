import { useEffect } from 'react';
import { Provider } from 'react-redux';
import { Toaster } from 'react-hot-toast';
import toast from 'react-hot-toast';
import { store } from './app/store';
import { AppRouter } from './routes';
import { useAppDispatch, useAppSelector } from './shared/hooks';
import { useWebSocket } from './shared/hooks/useWebSocket';
import { API_ERROR_EVENT } from './services/api';
import { getErrorMessage } from './utils/errorHandler';
import { authService } from './modules/auth/authService';
import { setToken, setUser } from './modules/auth/authSlice';
import type { Role } from './modules/auth/types';
import { AppToast } from './shared/components/AppToast';


function DarkModeInitializer() {
  const { darkMode } = useAppSelector((state) => state.ui);

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [darkMode]);

  return null;
}

function WebSocketInitializer() {
  // Initialize WebSocket connection based on auth state
  useWebSocket();
  return null;
}

function AppContent() {
  const dispatch = useAppDispatch();
  const { darkMode } = useAppSelector((state) => state.ui);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const oauthStatus = params.get('oauth2');

    if (!oauthStatus) {
      return;
    }

    if (oauthStatus === 'error') {
      const message = params.get('message') || 'Google login failed';
      toast.error(message);
      window.history.replaceState({}, document.title, window.location.pathname);
      return;
    }

    const token = params.get('token');
    const userId = params.get('userId');
    const email = params.get('email');
    const firstName = params.get('firstName');
    const lastName = params.get('lastName');
    const role = params.get('role');

    if (!token || !email || !role) {
      toast.error('Google login response is incomplete');
      window.history.replaceState({}, document.title, window.location.pathname);
      return;
    }

    const roleRaw = role.toUpperCase();
    const normalizedRole: Role = roleRaw.includes('ADMIN')
      ? 'admin'
      : roleRaw.includes('FARMER')
        ? 'farmer'
        : roleRaw.includes('WHOLESALER') || roleRaw.includes('WHOLESELLER')
          ? 'wholesaler'
          : roleRaw.includes('DELIVERY')
            ? 'delivery'
            : 'user';

    const user = {
      id: userId || '',
      email,
      firstName: firstName || '',
      lastName: lastName || '',
      name: `${firstName || ''} ${lastName || ''}`.trim() || email,
      role: normalizedRole,
    };

    authService.setAuthData(token, user);
    dispatch(setToken(token));
    dispatch(setUser(user));

    window.history.replaceState({}, document.title, window.location.pathname);

    if (normalizedRole === 'admin') {
      window.location.replace('/admin/dashboard');
      return;
    }
    if (normalizedRole === 'farmer') {
      window.location.replace('/farmer/dashboard');
      return;
    }
    if (normalizedRole === 'wholesaler') {
      window.location.replace('/wholesaler/dashboard');
      return;
    }

    window.location.replace('/dashboard');
  }, [dispatch]);

  useEffect(() => {
    const onApiError = (event: Event) => {
      const customEvent = event as CustomEvent<{ status?: number; message?: string }>;
      const message = customEvent.detail?.message || getErrorMessage(undefined);
      toast.error(message);
    };

    window.addEventListener(API_ERROR_EVENT, onApiError as EventListener);
    return () => window.removeEventListener(API_ERROR_EVENT, onApiError as EventListener);
  }, []);

  return (
    <>
      <DarkModeInitializer />
      <WebSocketInitializer />
      <AppRouter />
      <Toaster
        position="bottom-right"
        reverseOrder={false}
        gutter={12}
        containerStyle={{ bottom: 20, right: 20 }}
        toastOptions={{
          duration: 3600,
        }}
      >
        {(t) => <AppToast toastData={t} darkMode={darkMode} />}
      </Toaster>
    </>
  );
}

import { GoogleOAuthProvider } from '@react-oauth/google';

const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID || '';

function App() {
  return (
    <Provider store={store}>
      <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
        <AppContent />
      </GoogleOAuthProvider>
    </Provider>
  );
}

export default App;

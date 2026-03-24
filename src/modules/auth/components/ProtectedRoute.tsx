import { Navigate, useLocation } from 'react-router-dom';
import { useAppSelector } from '../../../shared/hooks';
import type { Role } from '../types';

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles?: Role[];
}

export function ProtectedRoute({ children, allowedRoles }: ProtectedRouteProps) {
  const { isAuthenticated, user, role: stateRole, token } = useAppSelector((state) => state.auth);
  const location = useLocation();
  const currentRole = stateRole || user?.role;
  
  // Also check localStorage token for persistence across page reloads
  const localStorageToken = localStorage.getItem('token');
  const hasValidToken = Boolean(token || localStorageToken);
  // Check both isAuthenticated state AND token existence
  const isUserAuthenticated = isAuthenticated && hasValidToken;

  if (!isUserAuthenticated) {
    // Redirect to login for any protected path
    const privatePrefixes = ['/admin', '/farmer', '/wholesaler'];
    const privateExactPaths = [
      '/dashboard', '/orders', '/wishlist', '/chat',
      '/profile', '/checkout',
    ];

    const isPrivatePath =
      privatePrefixes.some((prefix) => location.pathname.startsWith(prefix)) ||
      privateExactPaths.some((p) => location.pathname === p || location.pathname.startsWith(p + '/'));

    if (isPrivatePath) {
      return <Navigate to="/login" state={{ from: location }} replace />;
    }

    // Public route wrapped in ProtectedRoute — allow through
    return <>{children}</>;
  }

  if (allowedRoles && currentRole && !allowedRoles.includes(currentRole as Role)) {
    return <Navigate to="/unauthorized" replace />;
  }

  return <>{children}</>;
}

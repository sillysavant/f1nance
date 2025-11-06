import { Navigate, useLocation } from 'react-router-dom';
import { getCookie } from '@/lib/cookie';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

export const ProtectedRoute = ({ children }: ProtectedRouteProps) => {
  const location = useLocation();
  const token = getCookie('token');

  if (!token) {
    // Save the attempted URL for redirecting after login
    return <Navigate to={`/auth?redirect=${encodeURIComponent(location.pathname)}`} replace />;
  }

  return <>{children}</>;
};

import { Navigate, Outlet, useLocation } from 'react-router-dom';

export const isAuthenticated = (): boolean => {
  return !!localStorage.getItem('authToken');
};

export function ProtectedRoute() {
  const location = useLocation();

  if (!isAuthenticated()) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  return <Outlet />;
}

export function GuestRoute() {
  if (isAuthenticated()) {
    return <Navigate to="/" replace />;
  }

  return <Outlet />;
}

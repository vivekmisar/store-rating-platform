import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';

export default function ProtectedRoute({ roles }) {
  const { isAuthenticated, user } = useAuth();
  const location = useLocation();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  }

  if (roles && !roles.includes(user.role)) {
    const fallback = user.role === 'ADMIN'
      ? '/admin/dashboard'
      : user.role === 'STORE_OWNER'
        ? '/owner/dashboard'
        : '/stores';
    return <Navigate to={fallback} replace />;
  }

  return <Outlet />;
}

import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

const ProtectedRoute = () => {
  const location = useLocation();
  const { loading, isAuthenticated, canAccessModelDashboard } = useAuth();

  if (loading) {
    return (
      <div className="app-loader-shell">
        <div className="loader-card">
          <div className="loader-spinner" />
        </div>
      </div>
    );
  }

  if (!isAuthenticated || !canAccessModelDashboard) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  return <Outlet />;
};

export default ProtectedRoute;

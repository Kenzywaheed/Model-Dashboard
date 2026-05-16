import { useEffect } from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { useLanguage } from '../hooks/useLanguage';
import { getBrandDashboardUrl } from '../services/api';

const BrandDashboardRedirect = () => {
  const { t } = useLanguage();

  useEffect(() => {
    window.location.assign(getBrandDashboardUrl());
  }, []);

  return (
    <div className="app-loader-shell">
      <div className="loader-card redirect-card">
        <div className="loader-spinner" />
        <p>{t.auth.brandRedirect}</p>
      </div>
    </div>
  );
};

const ProtectedRoute = ({ requireModelDashboard = false, requireOnboarding = false }) => {
  const location = useLocation();
  const {
    loading,
    isAuthenticated,
    canAccessModelDashboard,
    isModelOnboarding,
    userDashboard,
  } = useAuth();

  if (loading) {
    return (
      <div className="app-loader-shell">
        <div className="loader-card">
          <div className="loader-spinner" />
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  if (userDashboard === 'BRAND') {
    return <BrandDashboardRedirect />;
  }

  if (requireModelDashboard && !canAccessModelDashboard) {
    return <Navigate to="/onboarding/model-profile" replace state={{ from: location }} />;
  }

  if (requireOnboarding && !isModelOnboarding) {
    return <Navigate to={canAccessModelDashboard ? '/dashboard' : '/setup/palette'} replace state={{ from: location }} />;
  }

  return <Outlet />;
};

export default ProtectedRoute;

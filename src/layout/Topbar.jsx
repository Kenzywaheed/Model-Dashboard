import { useEffect, useMemo, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../hooks/useAuth';
import { useLanguage } from '../hooks/useLanguage';
import { modelApi, readCachedModelProfile } from '../services/api';
import { BellIcon, GlobeIcon, LogoutIcon, MenuIcon, PanelIcon } from '../components/Icons';

const Topbar = ({ isSidebarCollapsed, onOpenSidebar, onToggleCollapse }) => {
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const { language, setLanguage, t } = useLanguage();
  const { isDark, toggleTheme } = useTheme();
  const [unreadCount, setUnreadCount] = useState(0);
  const cachedProfile = readCachedModelProfile();
  const displayName = cachedProfile?.modelName || user?.name || 'Model User';
  const displayEmail = cachedProfile?.modelEmail || user?.email || '';

  useEffect(() => {
    let active = true;

    const loadStats = async () => {
      try {
        const data = await modelApi.getNotificationStats();

        if (active) {
          setUnreadCount(Number(data?.unread || 0));
        }
      } catch {
        if (active) {
          setUnreadCount(0);
        }
      }
    };

    loadStats();

    return () => {
      active = false;
    };
  }, [pathname]);

  const pageTitle = useMemo(() => {
    const map = {
      '/dashboard': t.nav.dashboard,
      '/requests': t.nav.requests,
      '/agreements': t.nav.agreements,
      '/reviews': t.nav.reviews,
      '/notifications': t.nav.notifications,
    };

    return map[pathname] || t.common.appName;
  }, [pathname, t]);

  return (
    <header className="topbar">
      <div className="topbar-left">
        <button type="button" className="icon-button mobile-only" onClick={onOpenSidebar}>
          <MenuIcon className="icon-sm" />
        </button>

        <button type="button" className="icon-button desktop-only" onClick={onToggleCollapse}>
          <PanelIcon className={`icon-sm ${isSidebarCollapsed ? 'collapsed-icon' : ''}`} />
        </button>

        <div>
          <p className="topbar-label">{t.common.workspace}</p>
          <h1 className="topbar-title">{pageTitle}</h1>
        </div>
      </div>

      <div className="topbar-right">
        <Link to="/notifications" className="icon-button notification-button">
          <BellIcon className="icon-sm" />
          {unreadCount > 0 ? <span className="notification-count">{unreadCount}</span> : null}
        </Link>

        <button type="button" className="topbar-chip" onClick={toggleTheme}>
          <span>{isDark ? t.common.lightMode : t.common.darkMode}</span>
        </button>

        <button
          type="button"
          className="topbar-chip"
          onClick={() => setLanguage(language === 'en' ? 'ar' : 'en')}
        >
          <GlobeIcon className="icon-sm" />
          <span>{language === 'en' ? 'AR' : 'EN'}</span>
        </button>

        <div className="topbar-user">
          <div className="user-avatar">
            {String(displayName || displayEmail || 'M').charAt(0).toUpperCase()}
          </div>
          <div className="user-copy">
            <strong>{displayName}</strong>
            <span>{displayEmail}</span>
          </div>
        </div>

        <button
          type="button"
          className="icon-button"
          onClick={() => {
            logout();
            navigate('/login', { replace: true });
          }}
        >
          <LogoutIcon className="icon-sm" />
        </button>
      </div>
    </header>
  );
};

export default Topbar;

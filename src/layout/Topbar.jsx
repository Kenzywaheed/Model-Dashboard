import { useEffect, useMemo, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { useLanguage } from '../hooks/useLanguage';
import { usePalette } from '../hooks/usePalette';
import { modelApi } from '../services/api';
import { BellIcon, GlobeIcon, LogoutIcon, MenuIcon, PanelIcon, PaletteIcon } from '../components/Icons';

const Topbar = ({ isSidebarCollapsed, onOpenSidebar, onToggleCollapse }) => {
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const { language, setLanguage, t } = useLanguage();
  const { palette } = usePalette();
  const [unreadCount, setUnreadCount] = useState(0);

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
      '/model-setup': t.nav.modelSetup,
      '/requests': t.nav.requests,
      '/agreements': t.nav.agreements,
      '/reviews': t.nav.reviews,
      '/notifications': t.nav.notifications,
      '/setup/palette': t.nav.palette,
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

        <Link to="/setup/palette" className="palette-pill">
          <PaletteIcon className="icon-sm" />
          <span
            className="palette-swatch"
            style={{ background: `linear-gradient(135deg, ${palette.primary}, ${palette.primaryDark})` }}
          />
        </Link>

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
            {String(user?.name || user?.email || 'M').charAt(0).toUpperCase()}
          </div>
          <div className="user-copy">
            <strong>{user?.name || 'Model User'}</strong>
            <span>{user?.email || ''}</span>
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

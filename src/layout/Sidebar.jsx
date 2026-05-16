import { NavLink } from 'react-router-dom';
import { useLanguage } from '../hooks/useLanguage';
import {
  AgreementIcon,
  DashboardIcon,
  RequestIcon,
  ReviewIcon,
  BellIcon,
  CloseIcon,
} from '../components/Icons';

const Sidebar = ({ isOpen, isCollapsed, onClose }) => {
  const { t } = useLanguage();

  const navItems = [
    { path: '/dashboard', label: t.nav.dashboard, icon: DashboardIcon },
    { path: '/requests', label: t.nav.requests, icon: RequestIcon },
    { path: '/agreements', label: t.nav.agreements, icon: AgreementIcon },
    { path: '/reviews', label: t.nav.reviews, icon: ReviewIcon },
    { path: '/notifications', label: t.nav.notifications, icon: BellIcon },
  ];

  return (
    <>
      <div className={`sidebar-overlay ${isOpen ? 'show' : ''}`} onClick={onClose} aria-hidden="true" />
      <aside className={`sidebar ${isOpen ? 'open' : ''} ${isCollapsed ? 'collapsed' : ''}`}>
        <div className="sidebar-brand">
          <div className="brand-mark">MD</div>
          <div className="brand-copy">
            <strong>{t.common.appName}</strong>
            <span>{t.common.modelWorkspace}</span>
          </div>
          <button type="button" className="icon-button sidebar-close" onClick={onClose}>
            <CloseIcon className="icon-sm" />
          </button>
        </div>

        <nav className="sidebar-nav">
          {navItems.map(({ path, label, icon: Icon }) => (
            <NavLink
              key={path}
              to={path}
              onClick={onClose}
              className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}
            >
              <Icon className="icon-sm" />
              <span>{label}</span>
            </NavLink>
          ))}
        </nav>
      </aside>
    </>
  );
};

export default Sidebar;

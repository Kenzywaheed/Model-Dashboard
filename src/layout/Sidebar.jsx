import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useTheme } from '../context/ThemeContext';
import './Sidebar.css';

const navItems = [
  { path: '/', label: 'Dashboard', icon: '📊' },
  { path: '/candidates', label: 'Candidates', icon: '👥' },
  { path: '/chats', label: 'Chats', icon: '💬' },
  { path: '/calendar', label: 'Calendar', icon: '📅' },
  { path: '/profile', label: 'Profile', icon: '👤' },
];

const Sidebar = ({ isOpen, toggleSidebar }) => {
  const { isDark, toggleTheme } = useTheme();
  const location = useLocation();
  
  return (
    <>
      {/* Mobile overlay */}
      {isOpen && <div className="sidebar-overlay" onClick={toggleSidebar}></div>}
      
      <aside className={`sidebar ${isOpen ? 'open' : ''}`}>
        <div className="sidebar-header">
          <div className="logo-container">
            <div className="logo-icon">MD</div>
            <h1 className="logo-text">Model Dashboard</h1>
          </div>
          <button className="close-btn d-lg-none" onClick={toggleSidebar}>×</button>
        </div>
        
        <nav className="sidebar-nav">
          <ul className="nav-list">
            {navItems.map((item) => {
              const isActive = location.pathname === item.path;
              return (
                <li key={item.path} className="nav-item">
                  <Link to={item.path} className={`nav-link ${isActive ? 'active' : ''}`}>
                    <span className="nav-icon">{item.icon}</span>
                    <span className="nav-label">{item.label}</span>
                    {isActive && <div className="active-indicator"></div>}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>
        
        <div className="sidebar-footer">
          <div className="theme-toggle-container">
            <button className="theme-toggle-btn" onClick={toggleTheme}>
              <div className="theme-toggle-info">
                <span className="theme-icon">{isDark ? '🌙' : '☀️'}</span>
                <span className="theme-label">{isDark ? 'Dark Mode' : 'Light Mode'}</span>
              </div>
              <div className={`toggle-switch ${isDark ? 'active' : ''}`}>
                <div className="toggle-thumb"></div>
              </div>
            </button>
          </div>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;

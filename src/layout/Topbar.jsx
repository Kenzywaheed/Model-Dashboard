import React, { useState, useRef, useEffect } from 'react';
import NotificationsDropdown from '../components/NotificationsDropdown';
import './Topbar.css';

const Topbar = ({ toggleSidebar }) => {
  const [showNotifications, setShowNotifications] = useState(false);
  const [notifications, setNotifications] = useState([
    { id: 1, text: 'New candidate applied for UI Designer', time: '5m ago', icon: '👤', unread: true },
    { id: 2, text: 'System update completed successfully', time: '1h ago', icon: '⚙️', unread: true },
    { id: 3, text: 'Meeting with the design team in 30 mins', time: '2h ago', icon: '📅', unread: false },
  ]);
  
  const notifRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (notifRef.current && !notifRef.current.contains(event.target)) {
        setShowNotifications(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleMarkAllRead = () => {
    setNotifications(notifications.map(n => ({ ...n, unread: false })));
  };

  const hasUnread = notifications.some(n => n.unread);

  return (
    <header className="topbar">
      <div className="topbar-left">
        <button className="menu-btn d-lg-none" onClick={toggleSidebar}>
          ☰
        </button>
        <div className="search-container">
          <span className="search-icon">🔍</span>
          <input type="text" placeholder="Search..." className="search-input" />
        </div>
      </div>
      
      <div className="topbar-right">
        <div className="notification-wrapper" ref={notifRef} style={{ position: 'relative' }}>
          <button 
            className="topbar-btn" 
            onClick={() => setShowNotifications(!showNotifications)}
          >
            <span className="icon">🔔</span>
            {hasUnread && <span className="badge-indicator"></span>}
          </button>
          
          {showNotifications && (
            <NotificationsDropdown 
              notifications={notifications} 
              onClose={() => setShowNotifications(false)}
              onMarkAllRead={handleMarkAllRead}
            />
          )}
        </div>
        
        <div className="user-profile">
          <img 
            src="https://ui-avatars.com/api/?name=Admin&background=4f46e5&color=fff" 
            alt="User" 
            className="avatar" 
          />
        </div>
      </div>
    </header>
  );
};

export default Topbar;

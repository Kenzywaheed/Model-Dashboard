import React from 'react';
import './NotificationsDropdown.css';

const NotificationsDropdown = ({ notifications, onClose, onMarkAllRead }) => {
  return (
    <div className="notifications-dropdown card">
      <div className="notifications-header">
        <h3 className="h3">Notifications</h3>
        {notifications.length > 0 && (
          <button className="btn-text" onClick={onMarkAllRead}>
            Mark all read
          </button>
        )}
      </div>
      
      <div className="notifications-body">
        {notifications.length === 0 ? (
          <div className="empty-notifications">
            <span className="empty-icon">🔔</span>
            <p className="text-muted text-sm">No new notifications</p>
          </div>
        ) : (
          <ul className="notifications-list">
            {notifications.map((notif) => (
              <li key={notif.id} className={`notification-item ${notif.unread ? 'unread' : ''}`}>
                <div className="notification-icon">{notif.icon}</div>
                <div className="notification-content">
                  <p className="notification-text">{notif.text}</p>
                  <span className="notification-time">{notif.time}</span>
                </div>
                {notif.unread && <div className="unread-dot"></div>}
              </li>
            ))}
          </ul>
        )}
      </div>
      
      <div className="notifications-footer">
        <button className="btn-text full-width" onClick={onClose}>
          View All Notifications
        </button>
      </div>
    </div>
  );
};

export default NotificationsDropdown;

// src/components/NotificationBell.jsx
import React, { useState } from 'react';
import { useNotifications } from '../context/NotificationContext';
import { markNotificationAsRead } from '../api/notificationApi';
import './NotificationBell.css';

const NotificationBell = () => {
  const { notifications, unreadCount, setUnreadCount } = useNotifications();
  const [showDropdown, setShowDropdown] = useState(false);

  const handleNotificationClick = async (notificationId) => {
    await markNotificationAsRead(notificationId);
    setUnreadCount(prev => prev - 1);
  };

  return (
    <div className="notification-bell">
      <button onClick={() => setShowDropdown(!showDropdown)} className="bell-button">
        🔔
        {unreadCount > 0 && <span className="badge">{unreadCount}</span>}
      </button>
      
      {showDropdown && (
        <div className="notification-dropdown">
          <div className="dropdown-header">
            <h3>Notifications</h3>
            <span className="count">{unreadCount} unread</span>
          </div>
          
          <div className="notification-list">
            {notifications.length === 0 ? (
              <p className="no-notifications">No notifications</p>
            ) : (
              notifications.map(notif => (
                <div 
                  key={notif.id} 
                  className={`notification-item ${!notif.read ? 'unread' : ''}`}
                  onClick={() => handleNotificationClick(notif.id)}
                >
                  <span className="notif-icon">{notif.icon || '🔔'}</span>
                  <div className="notif-content">
                    <p className="notif-message">{notif.message}</p>
                    <span className="notif-time">
                      {new Date(notif.created_at).toLocaleTimeString()}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default NotificationBell;

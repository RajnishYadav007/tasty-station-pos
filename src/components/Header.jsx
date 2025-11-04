// src/components/Header.jsx

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getNotifications } from '../api/notificationApi';
import { Search, Bell, ChevronDown, LogOut, X, Trash2, ShoppingCart, CheckCircle, Clock } from 'lucide-react';
import './Header.css';

const Header = () => {
  const navigate = useNavigate();
  const { currentUser, logout } = useAuth();
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [notifications, setNotifications] = useState([]);

  // ✅ FIXED: Load notifications with auto-refresh
  useEffect(() => {
    const loadNotifications = async () => {
      try {
        const notif = await getNotifications();
        setNotifications(notif);
      } catch (error) {
        setNotifications([]);
      }
    };

    loadNotifications();
    const interval = setInterval(loadNotifications, 2000);
    return () => clearInterval(interval);
  }, []);

  // ✅ REMOVED: Auto-save useEffect that was overwriting notifications
  // Only manual actions (mark read, clear) will save to localStorage

  // ✅ Filter notifications by visibleTo field
  const getFilteredNotifications = () => {
    if (!currentUser) return [];
    
    const userRole = currentUser.role.toLowerCase();
    
    // Customer sees nothing
    if (userRole === 'customer') {
      return [];
    }
    
    // Owner, Chef, Waiter see notifications where they are in visibleTo array
    return notifications.filter(notification => {
      // Check if notification has visibleTo field
      if (notification.visibleTo && Array.isArray(notification.visibleTo)) {
        return notification.visibleTo.includes(userRole);
      }
      
      // Fallback: if no visibleTo field, show to everyone except customer
      return userRole !== 'customer';
    });
  };

  // Get unread count (filtered by role)
  const getUnreadCount = () => {
    const filtered = getFilteredNotifications();
    return filtered.filter(n => !n.read).length;
  };

  // Add notification (expose globally) - for same-session updates
  useEffect(() => {
    window.addNotification = (type, message, orderData = {}) => {
      const newNotif = {
        id: `NOTIF-${Date.now()}`,
        type,
        message,
        timestamp: new Date().toISOString(),
        read: false,
        visibleTo: ['owner', 'chef', 'waiter'],
        ...orderData
      };
      setNotifications(prev => [newNotif, ...prev]);
    };
  }, []);

  // Mark as read - SAVE TO LOCALSTORAGE
  const markAsRead = (id) => {
    const updated = notifications.map(n => 
      n.id === id ? { ...n, read: true } : n
    );
    setNotifications(updated);
    localStorage.setItem('simpleNotifications', JSON.stringify(updated)); // ✅ Save
  };

  // Mark all as read - SAVE TO LOCALSTORAGE
  const markAllAsRead = () => {
    const filteredIds = getFilteredNotifications().map(n => n.id);
    const updated = notifications.map(n =>
      filteredIds.includes(n.id) ? { ...n, read: true } : n
    );
    setNotifications(updated);
    localStorage.setItem('simpleNotifications', JSON.stringify(updated)); // ✅ Save
  };

  // Clear all - SAVE TO LOCALSTORAGE
  const clearAll = () => {
    const filteredIds = getFilteredNotifications().map(n => n.id);
    const updated = notifications.filter(n => !filteredIds.includes(n.id));
    setNotifications(updated);
    localStorage.setItem('simpleNotifications', JSON.stringify(updated)); // ✅ Save
  };

  // Get time ago
  const getTimeAgo = (timestamp) => {
    const now = new Date();
    const time = new Date(timestamp);
    const diff = Math.floor((now - time) / 1000);
    
    if (diff < 60) return 'Just now';
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
    return time.toLocaleDateString();
  };

  // Get icon
  const getIcon = (type) => {
    switch(type) {
      case 'new-order':
        return <ShoppingCart size={20} />;
      case 'ready':
        return <CheckCircle size={20} />;
      default:
        return <Bell size={20} />;
    }
  };

  // Handle logout
  const handleLogout = () => {
    setShowProfileMenu(false);
    if (window.confirm('Are you sure you want to logout?')) {
      logout();
      navigate('/login');
    }
  };

  // Get role color
  const getRoleColor = () => {
    if (!currentUser) return '#14B8A6';
    return currentUser.color || '#14B8A6';
  };

  if (!currentUser) return null;

  const unreadCount = getUnreadCount();
  const filteredNotifications = getFilteredNotifications();

  // ✅ Hide notification button for customers
  const showNotificationButton = currentUser.role.toLowerCase() !== 'customer';

  return (
    <>
      <div className="header">
        <div className="search-bar">
          <Search size={20} color="#9CA3AF" />
          <input 
            type="text" 
            placeholder="Search menu, orders and more" 
            className="search-input"
          />
        </div>
        
        <div className="header-right">
          <div className="role-badge" style={{ background: `${getRoleColor()}20`, color: getRoleColor() }}>
            {currentUser.icon} {currentUser.role}
          </div>

          {/* ✅ Only show notification button if not customer */}
          {showNotificationButton && (
            <button 
              className="notification-btn"
              onClick={() => {
                setShowNotifications(!showNotifications);
                setShowProfileMenu(false);
              }}
            >
              <Bell size={22} />
              {unreadCount > 0 && (
                <span className="notification-badge">{unreadCount}</span>
              )}
            </button>
          )}
          
          {/* User Profile with Dropdown */}
          <div className="user-profile-container">
            <div 
              className="user-profile" 
              onClick={() => {
                setShowProfileMenu(!showProfileMenu);
                setShowNotifications(false);
              }}
            >
              <div 
                className="user-avatar"
                style={{ background: getRoleColor() }}
              >
                {currentUser.avatar}
              </div>
              <div className="user-info">
                <h4>{currentUser.name}</h4>
                <p>{currentUser.role}</p>
              </div>
              <ChevronDown 
                size={18} 
                className={`dropdown-icon ${showProfileMenu ? 'rotate' : ''}`}
              />
            </div>

            {/* Profile Dropdown */}
            {showProfileMenu && (
              <div className="profile-dropdown">
                <div className="dropdown-header">
                  <div 
                    className="user-avatar-large"
                    style={{ background: getRoleColor() }}
                  >
                    {currentUser.avatar}
                  </div>
                  <div className="user-details">
                    <h4>{currentUser.name}</h4>
                    <p>
                      <span className="role-icon">{currentUser.icon}</span>
                      {currentUser.role}
                    </p>
                    <span className="user-email">{currentUser.email}</span>
                  </div>
                </div>

                <div className="dropdown-footer">
                  <button className="logout-btn" onClick={handleLogout}>
                    <LogOut size={16} />
                    Logout
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Overlay */}
        {showProfileMenu && (
          <div 
            className="dropdown-overlay" 
            onClick={() => setShowProfileMenu(false)}
          />
        )}
      </div>

      {/* Notification Panel */}
      {showNotifications && (
        <>
          <div 
            style={{
              position: 'fixed',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              background: 'rgba(0, 0, 0, 0.3)',
              zIndex: 999
            }}
            onClick={() => setShowNotifications(false)} 
          />
          <div style={{
            position: 'fixed',
            top: '70px',
            right: '20px',
            width: '400px',
            maxHeight: '600px',
            background: 'white',
            borderRadius: '16px',
            boxShadow: '0 20px 40px rgba(0, 0, 0, 0.15)',
            zIndex: 1000,
            display: 'flex',
            flexDirection: 'column'
          }}>
            {/* Header */}
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              padding: '20px',
              borderBottom: '1px solid #E5E7EB'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <Bell size={20} />
                <h3 style={{ margin: 0, fontSize: '18px', fontWeight: 700 }}>Notifications</h3>
                {unreadCount > 0 && (
                  <span style={{
                    background: '#EF4444',
                    color: 'white',
                    padding: '2px 8px',
                    borderRadius: '12px',
                    fontSize: '12px',
                    fontWeight: 600
                  }}>
                    {unreadCount}
                  </span>
                )}
              </div>
              <div style={{ display: 'flex', gap: '10px' }}>
                {filteredNotifications.length > 0 && (
                  <button 
                    onClick={markAllAsRead}
                    style={{
                      padding: '6px 12px',
                      background: '#F3F4F6',
                      border: 'none',
                      borderRadius: '8px',
                      fontSize: '13px',
                      cursor: 'pointer'
                    }}
                  >
                    Mark all read
                  </button>
                )}
                <button 
                  onClick={() => setShowNotifications(false)}
                  style={{
                    background: 'transparent',
                    border: 'none',
                    cursor: 'pointer',
                    padding: '4px'
                  }}
                >
                  <X size={20} />
                </button>
              </div>
            </div>

            {/* Body */}
            <div style={{
              flex: 1,
              overflowY: 'auto',
              maxHeight: '450px'
            }}>
              {filteredNotifications.length === 0 ? (
                <div style={{
                  textAlign: 'center',
                  padding: '60px 20px',
                  color: '#9CA3AF'
                }}>
                  <Bell size={48} style={{ marginBottom: '12px', opacity: 0.4 }} />
                  <p style={{ fontSize: '16px', fontWeight: 600, margin: 0 }}>No notifications</p>
                  <span style={{ fontSize: '14px' }}>You're all caught up!</span>
                </div>
              ) : (
                filteredNotifications.map(notification => (
                  <div 
                    key={notification.id}
                    onClick={() => markAsRead(notification.id)}
                    style={{
                      display: 'flex',
                      alignItems: 'flex-start',
                      gap: '12px',
                      padding: '16px 20px',
                      cursor: 'pointer',
                      borderBottom: '1px solid #F3F4F6',
                      background: !notification.read ? '#F0F9FF' : 'white'
                    }}
                  >
                    <div style={{
                      width: '40px',
                      height: '40px',
                      borderRadius: '10px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      background: notification.type === 'new-order' ? '#DBEAFE' : '#D1FAE5',
                      color: notification.type === 'new-order' ? '#2563EB' : '#059669'
                    }}>
                      {getIcon(notification.type)}
                    </div>
                    <div style={{ flex: 1 }}>
                      <p style={{
                        fontSize: '14px',
                        margin: '0 0 4px 0',
                        fontWeight: 500
                      }}>
                        {notification.message}
                      </p>
                      <span style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '4px',
                        fontSize: '12px',
                        color: '#6B7280'
                      }}>
                        <Clock size={12} />
                        {getTimeAgo(notification.timestamp)}
                      </span>
                    </div>
                    {!notification.read && (
                      <div style={{
                        width: '8px',
                        height: '8px',
                        background: '#3B82F6',
                        borderRadius: '50%',
                        marginTop: '6px'
                      }} />
                    )}
                  </div>
                ))
              )}
            </div>

            {/* Footer */}
            {filteredNotifications.length > 0 && (
              <div style={{
                padding: '16px 20px',
                borderTop: '1px solid #E5E7EB'
              }}>
                <button 
                  onClick={() => { clearAll(); setShowNotifications(false); }}
                  style={{
                    width: '100%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '8px',
                    padding: '10px',
                    background: '#FEE2E2',
                    color: '#DC2626',
                    border: 'none',
                    borderRadius: '8px',
                    fontSize: '14px',
                    fontWeight: 600,
                    cursor: 'pointer'
                  }}
                >
                  <Trash2 size={16} />
                  Clear All
                </button>
              </div>
            )}
          </div>
        </>
      )}
    </>
  );
};

export default Header;

// src/components/Header.jsx - ✅ FINAL VERSION WITH NOTIFICATIONS + SOUND

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { 
  getNotifications, 
  markAllAsRead, 
  deleteOldNotifications,
  markNotificationAsRead,
  requestNotificationPermission,
  showBrowserNotification
} from '../api/notificationApi';
import { toast } from 'react-toastify';
import { 
  Search, 
  Bell, 
  ChevronDown, 
  LogOut, 
  X, 
  Trash2, 
  ShoppingCart, 
  CheckCircle, 
  Clock,
  Users,
  CreditCard,
  Calendar,
  Check
} from 'lucide-react';
import './Header.css';

const Header = () => {
  const navigate = useNavigate();
  const { currentUser, logout } = useAuth();
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [lastNotificationId, setLastNotificationId] = useState(null);

  // ✅ REQUEST NOTIFICATION PERMISSION ON MOUNT
  useEffect(() => {
    const setupNotifications = async () => {
      const granted = await requestNotificationPermission();
      if (granted) {
        console.log('✅ Browser notifications enabled');
      } else {
        console.warn('⚠️ Browser notifications denied');
      }
    };
    
    setupNotifications();
  }, []);

  // ✅ LOAD NOTIFICATIONS WITH AUTO-REFRESH + SOUND
  useEffect(() => {
    const loadNotifications = async () => {
      try {
        const notif = await getNotifications();
        
        // ✅ Check for new notifications and play sound
        if (notif && notif.length > 0) {
          const latestNotif = notif[0];
          
          // If this is a new notification (different ID than last one)
          if (lastNotificationId && latestNotif.id !== lastNotificationId) {
            console.log('🔔 New notification detected:', latestNotif.message);
            
            // Show browser notification
            showBrowserNotification(
              'Tasty Station',
              latestNotif.message,
              getNotificationIcon(latestNotif.type)
            );
          }
          
          setLastNotificationId(latestNotif.id);
        }
        
        setNotifications(notif || []);
      } catch (error) {
        console.error('Error loading notifications:', error);
        setNotifications([]);
      }
    };

    loadNotifications();
    const interval = setInterval(loadNotifications, 3000); // Check every 3 seconds
    return () => clearInterval(interval);
  }, [lastNotificationId]);

  // ✅ GET NOTIFICATION ICON EMOJI
  const getNotificationIcon = (type) => {
    const icons = {
      'new-order': '🛒',
      'order-ready': '✅',
      'table-occupied': '🪑',
      'payment-ready': '💳',
      'reservation': '📅'
    };
    return icons[type] || '🔔';
  };

  // ✅ FILTER NOTIFICATIONS BY ROLE
  const getFilteredNotifications = () => {
    if (!currentUser) return [];
    
    const userRole = currentUser.role?.toLowerCase();
    
    if (userRole === 'customer') {
      return [];
    }
    
    // Filter by target_role
    return notifications.filter(notification => {
      // If no target_role specified, show to all staff
      if (!notification.target_role) {
        return userRole !== 'customer';
      }
      
      // Show to specific role
      return notification.target_role.toLowerCase() === userRole;
    });
  };

  // ✅ GET UNREAD COUNT
  const getUnreadCount = () => {
    const filtered = getFilteredNotifications();
    return filtered.filter(n => !n.read).length;
  };

  // ✅ MARK SINGLE AS READ
  const markAsRead = async (id) => {
    try {
      await markNotificationAsRead(id);
      
      const updated = notifications.map(n => 
        n.id === id ? { ...n, read: true } : n
      );
      setNotifications(updated);
      
      console.log('✅ Marked as read:', id);
    } catch (error) {
      console.error('Error marking as read:', error);
    }
  };

  // ✅ MARK ALL AS READ
  const handleMarkAllRead = async () => {
    try {
      await markAllAsRead();
      
      const updated = notifications.map(n => ({ ...n, read: true }));
      setNotifications(updated);
      
      toast.success('✅ All marked as read!', {
        position: 'bottom-right',
        autoClose: 2000
      });
    } catch (error) {
      console.error('Error marking all as read:', error);
      toast.error('❌ Error marking as read', {
        position: 'bottom-right',
        autoClose: 2000
      });
    }
  };

  // ✅ CLEAR ALL
  const clearAll = async () => {
    try {
      await deleteOldNotifications(0); // Delete all
      
      setNotifications([]);
      setShowNotifications(false);
      
      toast.success('✅ All notifications cleared!', {
        position: 'bottom-right',
        autoClose: 2000
      });
    } catch (error) {
      console.error('Error clearing notifications:', error);
      toast.error('❌ Error clearing notifications', {
        position: 'bottom-right',
        autoClose: 2000
      });
    }
  };

// ✅ FIXED GET TIME AGO
const getTimeAgo = (timestamp) => {
  if (!timestamp) return 'Just now';
  
  try {
    const now = new Date();
    const time = new Date(timestamp);
    
    // Check if date is valid
    if (isNaN(time.getTime())) {
      console.warn('Invalid timestamp:', timestamp);
      return 'Just now';
    }
    
    const diff = Math.floor((now - time) / 1000);
    
    if (diff < 60) return 'Just now';
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
    if (diff < 604800) return `${Math.floor(diff / 86400)}d ago`;
    
    return time.toLocaleDateString('en-IN', { 
      month: 'short', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  } catch (error) {
    console.error('Error parsing time:', error);
    return 'Just now';
  }
};


  // ✅ GET ICON BY TYPE
  const getIcon = (type) => {
    switch(type) {
      case 'new-order':
        return <ShoppingCart size={20} />;
      case 'order-ready':
        return <CheckCircle size={20} />;
      case 'table-occupied':
        return <Users size={20} />;
      case 'payment-ready':
        return <CreditCard size={20} />;
      case 'reservation':
        return <Calendar size={20} />;
      default:
        return <Bell size={20} />;
    }
  };

  // ✅ GET BACKGROUND COLOR BY TYPE
  const getNotificationColor = (type) => {
    switch(type) {
      case 'new-order':
        return { bg: '#DBEAFE', color: '#2563EB' };
      case 'order-ready':
        return { bg: '#D1FAE5', color: '#059669' };
      case 'table-occupied':
        return { bg: '#FEF3C7', color: '#D97706' };
      case 'payment-ready':
        return { bg: '#E9D5FF', color: '#9333EA' };
      case 'reservation':
        return { bg: '#FECACA', color: '#DC2626' };
      default:
        return { bg: '#F3F4F6', color: '#6B7280' };
    }
  };

  // ✅ HANDLE LOGOUT
  const handleLogout = () => {
    setShowProfileMenu(false);
    if (window.confirm('Are you sure you want to logout?')) {
      logout();
      navigate('/login');
    }
  };

  // ✅ GET USER ICON
  const getUserIcon = () => {
    if (!currentUser) return '👤';
    return currentUser.icon || currentUser.avatar || '👤';
  };

  // ✅ GET ROLE COLOR
  const getRoleColor = () => {
    if (!currentUser) return '#14B8A6';
    return currentUser.color || '#14B8A6';
  };

  if (!currentUser) return null;

  const unreadCount = getUnreadCount();
  const filteredNotifications = getFilteredNotifications();
  const showNotificationButton = currentUser.role?.toLowerCase() !== 'customer';

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
          {/* Role Badge with Icon */}
          <div className="role-badge" style={{ background: `${getRoleColor()}20`, color: getRoleColor() }}>
            <span className="role-icon">{getUserIcon()}</span>
            <span>{currentUser.role}</span>
          </div>

          {/* ✅ Notification Button */}
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
          
          {/* User Profile */}
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
                {getUserIcon()}
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
                    {getUserIcon()}
                  </div>
                  <div className="user-details">
                    <h4>{currentUser.name}</h4>
                    <p>
                      <span className="role-icon">{getUserIcon()}</span>
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

        {showProfileMenu && (
          <div 
            className="dropdown-overlay" 
            onClick={() => setShowProfileMenu(false)}
          />
        )}
      </div>

      {/* ✅ NOTIFICATION PANEL */}
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
                    onClick={handleMarkAllRead}
                    style={{
                      padding: '6px 12px',
                      background: '#F3F4F6',
                      border: 'none',
                      borderRadius: '8px',
                      fontSize: '13px',
                      cursor: 'pointer',
                      fontWeight: 500,
                      transition: 'all 0.2s'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.background = '#DBEAFE';
                      e.currentTarget.style.color = '#2563EB';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background = '#F3F4F6';
                      e.currentTarget.style.color = '#000';
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
                filteredNotifications.map(notification => {
                  const colors = getNotificationColor(notification.type);
                  return (
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
                        background: !notification.read ? '#F0F9FF' : 'white',
                        transition: 'background 0.2s'
                      }}
                      onMouseEnter={(e) => e.currentTarget.style.background = '#F9FAFB'}
                      onMouseLeave={(e) => e.currentTarget.style.background = !notification.read ? '#F0F9FF' : 'white'}
                    >
                      {/* Icon */}
                      <div style={{
                        width: '40px',
                        height: '40px',
                        borderRadius: '10px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        background: colors.bg,
                        color: colors.color,
                        flexShrink: 0
                      }}>
                        {getIcon(notification.type)}
                      </div>

                      <div style={{ flex: 1 }}>
                        <p style={{
                          fontSize: '14px',
                          margin: '0 0 4px 0',
                          fontWeight: 500,
                          color: '#111827'
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
                          {getTimeAgo(notification.created_at)}
                        </span>
                      </div>

                      {/* Unread indicator */}
                      {!notification.read && (
                        <div style={{
                          width: '8px',
                          height: '8px',
                          background: '#3B82F6',
                          borderRadius: '50%',
                          marginTop: '6px',
                          flexShrink: 0
                        }} />
                      )}
                    </div>
                  );
                })
              )}
            </div>

            {/* Footer */}
            {filteredNotifications.length > 0 && (
              <div style={{
                padding: '16px 20px',
                borderTop: '1px solid #E5E7EB',
                display: 'flex',
                gap: '10px'
              }}>
                <button 
                  onClick={handleMarkAllRead}
                  style={{
                    flex: 1,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '8px',
                    padding: '10px',
                    background: '#DBEAFE',
                    color: '#2563EB',
                    border: 'none',
                    borderRadius: '8px',
                    fontSize: '14px',
                    fontWeight: '600',
                    cursor: 'pointer',
                    transition: 'all 0.2s'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = '#2563EB';
                    e.currentTarget.style.color = 'white';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = '#DBEAFE';
                    e.currentTarget.style.color = '#2563EB';
                  }}
                >
                  <Check size={16} />
                  Mark All
                </button>

                <button 
                  onClick={clearAll}
                  style={{
                    flex: 1,
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
                    fontWeight: '600',
                    cursor: 'pointer',
                    transition: 'all 0.2s'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = '#DC2626';
                    e.currentTarget.style.color = 'white';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = '#FEE2E2';
                    e.currentTarget.style.color = '#DC2626';
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

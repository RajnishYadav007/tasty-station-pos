// src/context/NotificationContext.jsx - ✅ ENHANCED VERSION

import React, { createContext, useContext, useState, useEffect } from 'react';
import { 
  subscribeToNotifications, 
  getNotifications,
  requestNotificationPermission,
  showBrowserNotification
} from '../api/notificationApi';
import { useAuth } from './AuthContext';

const NotificationContext = createContext();

export const NotificationProvider = ({ children }) => {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!user) {
      setNotifications([]);
      setUnreadCount(0);
      setLoading(false);
      return;
    }

    let mounted = true;
    let unsubscribe = null;

    // ✅ Request browser notification permission on mount
    const initNotifications = async () => {
      const granted = await requestNotificationPermission();
      if (granted) {
        console.log('✅ Browser notifications enabled for user:', user.name);
      } else {
        console.warn('⚠️ Browser notifications denied');
      }
    };
    initNotifications();

    // ✅ Fetch initial notifications
    const fetchNotifications = async () => {
      try {
        setLoading(true);
        setError(null);
        
        console.log('📥 Fetching notifications for user:', user.name);
        const data = await getNotifications();
        
        if (mounted) {
          console.log('✅ Loaded notifications:', data?.length || 0);
          setNotifications(data || []);
          setUnreadCount(data?.filter(n => !n.read).length || 0);
        }
      } catch (error) {
        console.error('❌ Error fetching notifications:', error);
        if (mounted) {
          setError('Failed to load notifications');
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };

    fetchNotifications();

    // ✅ Subscribe to real-time updates
    try {
      console.log('🔔 Subscribing to real-time notifications...');
      
      unsubscribe = subscribeToNotifications((newNotification) => {
        if (!mounted) return;

        console.log('🔥 New notification received:', newNotification);
        
        // ✅ Add to state
        setNotifications(prev => [newNotification, ...prev]);
        setUnreadCount(prev => prev + 1);
        
        // ✅ Show browser notification using API function
        try {
          showBrowserNotification(
            'Tasty Station',
            newNotification.message,
            newNotification.icon || '🔔'
          );
        } catch (notifError) {
          console.error('❌ Browser notification error:', notifError);
        }
      });
      
      console.log('✅ Subscribed to real-time notifications');
      
    } catch (error) {
      console.error('❌ Subscription error:', error);
      if (mounted) {
        setError('Failed to connect to real-time notifications');
      }
    }

    // ✅ Cleanup function
    return () => {
      console.log('🛑 Cleaning up notification context...');
      mounted = false;
      if (unsubscribe) {
        unsubscribe();
      }
    };
  }, [user]);

  // ✅ Mark as read
  const markAsRead = (notificationId) => {
    console.log('✓ Marking notification as read:', notificationId);
    setNotifications(prev =>
      prev.map(n => n.id === notificationId ? { ...n, read: true } : n)
    );
    setUnreadCount(prev => Math.max(0, prev - 1));
  };

  // ✅ Clear all notifications
  const clearAllNotifications = () => {
    console.log('🗑️ Clearing all notifications');
    setNotifications([]);
    setUnreadCount(0);
  };

  // ✅ Retry fetch
  const retryFetch = async () => {
    if (!user) return;
    console.log('🔄 Retrying notification fetch...');
    
    try {
      setLoading(true);
      setError(null);
      const data = await getNotifications();
      setNotifications(data || []);
      setUnreadCount(data?.filter(n => !n.read).length || 0);
      console.log('✅ Retry successful');
    } catch (error) {
      console.error('❌ Retry failed:', error);
      setError('Failed to load notifications');
    } finally {
      setLoading(false);
    }
  };

  const value = {
    notifications,
    unreadCount,
    loading,
    error,
    setNotifications,
    setUnreadCount,
    markAsRead,
    clearAllNotifications,
    retryFetch
  };

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
};

// ✅ Custom hook with error checking
export const useNotifications = () => {
  const context = useContext(NotificationContext);
  
  if (!context) {
    throw new Error('useNotifications must be used within NotificationProvider');
  }
  
  return context;
};

export default NotificationContext;

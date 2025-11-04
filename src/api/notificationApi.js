import { supabase } from './supabaseClient';

// Get all notifications
export async function getNotifications() {
  const { data, error } = await supabase
    .from('Notification')
    .select('*')
    .order('created_at', { ascending: false });
  
  if (error) {
    console.error('Error fetching notifications:', error);
    throw error;
  }
  return data;
}

// Get unread notifications count
export async function getUnreadCount() {
  const { count, error } = await supabase
    .from('Notification')
    .select('*', { count: 'exact', head: true })
    .eq('is_read', false);
  
  if (error) {
    console.error('Error fetching unread count:', error);
    throw error;
  }
  return count;
}

// Get notifications by user ID
export async function getNotificationsByUser(userId) {
  const { data, error } = await supabase
    .from('Notification')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });
  
  if (error) {
    console.error('Error fetching user notifications:', error);
    throw error;
  }
  return data;
}

// Get unread notifications only
export async function getUnreadNotifications() {
  const { data, error } = await supabase
    .from('Notification')
    .select('*')
    .eq('is_read', false)
    .order('created_at', { ascending: false });
  
  if (error) {
    console.error('Error fetching unread notifications:', error);
    throw error;
  }
  return data;
}

// Add new notification
export async function addNotification(notificationData) {
  const { data, error } = await supabase
    .from('Notification')
    .insert([{
      title: notificationData.title,
      message: notificationData.message,
      type: notificationData.type || 'info',
      user_id: notificationData.user_id || null,
      is_read: false
    }])
    .select();
  
  if (error) {
    console.error('Error adding notification:', error);
    throw error;
  }
  return data;
}

// Mark notification as read
export async function markAsRead(notificationId) {
  const { data, error } = await supabase
    .from('Notification')
    .update({ is_read: true })
    .eq('notification_id', notificationId)
    .select();
  
  if (error) {
    console.error('Error marking notification as read:', error);
    throw error;
  }
  return data;
}

// Mark all notifications as read
export async function markAllAsRead() {
  const { data, error } = await supabase
    .from('Notification')
    .update({ is_read: true })
    .eq('is_read', false)
    .select();
  
  if (error) {
    console.error('Error marking all as read:', error);
    throw error;
  }
  return data;
}

// Delete notification
export async function deleteNotification(notificationId) {
  const { data, error } = await supabase
    .from('Notification')
    .delete()
    .eq('notification_id', notificationId);
  
  if (error) {
    console.error('Error deleting notification:', error);
    throw error;
  }
  return data;
}

// Delete old notifications (older than 30 days)
export async function deleteOldNotifications() {
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
  
  const { data, error } = await supabase
    .from('Notification')
    .delete()
    .lt('created_at', thirtyDaysAgo.toISOString());
  
  if (error) {
    console.error('Error deleting old notifications:', error);
    throw error;
  }
  return data;
}

// Subscribe to real-time notifications (Supabase Realtime)
export function subscribeToNotifications(callback) {
  const subscription = supabase
    .channel('notifications')
    .on('postgres_changes', 
      { 
        event: 'INSERT', 
        schema: 'public', 
        table: 'Notification' 
      }, 
      (payload) => {
        callback(payload.new);
      }
    )
    .subscribe();

  return subscription;
}

// Unsubscribe from notifications
export function unsubscribeFromNotifications(subscription) {
  supabase.removeChannel(subscription);
}

// src/api/notificationApi.js - ✅ COMPLETE WITH ALL 8 FUNCTIONS

import { supabase } from './supabaseClient';

// ✅ GET FROM SUPABASE
export const getNotifications = async () => {
  try {
    const { data, error } = await supabase
      .from('notifications')
      .select('*')
      .order('timestamp', { ascending: false })
      .limit(50);

    if (error) throw error;
    
    return data.map(notif => ({
      id: notif.notification_id,
      type: notif.type,
      message: notif.message,
      timestamp: notif.timestamp,
      read: notif.read,
      visibleTo: notif.visible_to,
      icon: notif.icon
    })) || [];
  } catch (error) {
    console.error('Error getting notifications:', error);
    // ✅ FALLBACK TO LOCALSTORAGE
    const stored = localStorage.getItem('simpleNotifications');
    return stored ? JSON.parse(stored) : [];
  }
};

// ✅ SAVE TO SUPABASE
export const saveNotifications = async (notifications) => {
  try {
    for (const notif of notifications) {
      const { error } = await supabase
        .from('notifications')
        .upsert({
          notification_id: notif.id,
          type: notif.type,
          message: notif.message,
          timestamp: notif.timestamp,
          read: notif.read,
          visible_to: notif.visibleTo,
          icon: notif.icon
        }, { onConflict: 'notification_id' });

      if (error) console.error('Error saving notification:', error);
    }
  } catch (error) {
    console.error('Error saving notifications:', error);
  }
};

// ✅ TABLE OCCUPIED
export const sendTableOccupiedNotification = async (tableNumber, guestName) => {
  const notification = {
    notification_id: `TABLE-${Date.now()}`,
    type: 'table-occupied',
    message: `🪑 Table #${tableNumber} occupied by ${guestName}`,
    timestamp: new Date().toISOString(),
    read: false,
    visible_to: ['owner', 'waiter'],
    icon: '🪑'
  };

  try {
    // ✅ SAVE TO SUPABASE
    const { error } = await supabase
      .from('notifications')
      .insert([notification]);

    if (error) throw error;

    // ✅ TRIGGER WINDOW EVENT
    if (window.addNotification) {
      window.addNotification('table-occupied', `🪑 Table #${tableNumber} occupied by ${guestName}`);
    }
  } catch (error) {
    console.error('Error sending notification:', error);
  }
};

// ✅ ORDER READY
export const sendOrderReadyNotification = async (orderId, tableNumber) => {
  const notification = {
    notification_id: `READY-${Date.now()}`,
    type: 'order-ready',
    message: `✅ Order #${orderId} ready! Table #${tableNumber}`,
    timestamp: new Date().toISOString(),
    read: false,
    visible_to: ['owner', 'waiter', 'chef'],
    icon: '✅'
  };

  try {
    const { error } = await supabase
      .from('notifications')
      .insert([notification]);

    if (error) throw error;

    if (window.addNotification) {
      window.addNotification('order-ready', `✅ Order #${orderId} ready! Table #${tableNumber}`);
    }
  } catch (error) {
    console.error('Error sending notification:', error);
  }
};

// ✅ PAYMENT READY NOTIFICATION (MISSING #1)
export const sendPaymentReadyNotification = async (billId, amount, tableNumber) => {
  const notification = {
    notification_id: `PAYMENT-${Date.now()}`,
    type: 'payment-ready',
    message: `💳 Payment Paid! Bill #${billId} - ₹${amount} - Table #${tableNumber}`,
    timestamp: new Date().toISOString(),
    read: false,
    visible_to: ['owner', 'waiter'],
    icon: '💳'
  };

  try {
    const { error } = await supabase
      .from('notifications')
      .insert([notification]);

    if (error) throw error;

    if (window.addNotification) {
      window.addNotification('payment-ready', `💳 Bill #${billId} - ₹${amount} ready for payment`);
    }
  } catch (error) {
    console.error('Error sending payment notification:', error);
  }
};

// ✅ NEW ORDER NOTIFICATION (MISSING #2)
export const sendNewOrderNotification = async (orderId, tableNumber, itemCount) => {
  const notification = {
    notification_id: `ORDER-${Date.now()}`,
    type: 'new-order',
    message: `🛒 New Order #${orderId} - Table #${tableNumber} (${itemCount} items)`,
    timestamp: new Date().toISOString(),
    read: false,
    visible_to: ['owner', 'chef', 'waiter'],
    icon: '🛒'
  };

  try {
    const { error } = await supabase
      .from('notifications')
      .insert([notification]);

    if (error) throw error;

    if (window.addNotification) {
      window.addNotification('new-order', `🛒 New Order #${orderId} placed`);
    }
  } catch (error) {
    console.error('Error sending order notification:', error);
  }
};

// ✅ RESERVATION NOTIFICATION (MISSING #3)
export const sendReservationNotification = async (guestName, reservationTime, tableNumber) => {
  const notification = {
    notification_id: `RESERVATION-${Date.now()}`,
    type: 'reservation',
    message: `📅 Reservation: ${guestName} at ${reservationTime} - Table #${tableNumber}`,
    timestamp: new Date().toISOString(),
    read: false,
    visible_to: ['owner', 'waiter'],
    icon: '📅'
  };

  try {
    const { error } = await supabase
      .from('notifications')
      .insert([notification]);

    if (error) throw error;

    if (window.addNotification) {
      window.addNotification('reservation', `📅 Reservation: ${guestName} at ${reservationTime}`);
    }
  } catch (error) {
    console.error('Error sending reservation notification:', error);
  }
};

// ✅ MARK AS READ
export const markNotificationAsRead = async (notificationId) => {
  try {
    const { error } = await supabase
      .from('notifications')
      .update({ read: true })
      .eq('notification_id', notificationId);

    if (error) throw error;
  } catch (error) {
    console.error('Error marking notification as read:', error);
  }
};

// ✅ DELETE NOTIFICATION
export const deleteNotification = async (notificationId) => {
  try {
    const { error } = await supabase
      .from('notifications')
      .delete()
      .eq('notification_id', notificationId);

    if (error) throw error;
  } catch (error) {
    console.error('Error deleting notification:', error);
  }
};

// ✅ MARK ALL AS READ (BONUS)
export const markAllAsRead = async () => {
  try {
    const { error } = await supabase
      .from('notifications')
      .update({ read: true })
      .eq('read', false);

    if (error) throw error;
  } catch (error) {
    console.error('Error marking all as read:', error);
  }
};

// ✅ DELETE ALL OLD NOTIFICATIONS (BONUS)
export const deleteOldNotifications = async (daysOld = 7) => {
  try {
    const date = new Date();
    date.setDate(date.getDate() - daysOld);
    
    const { error } = await supabase
      .from('notifications')
      .delete()
      .lt('timestamp', date.toISOString());

    if (error) throw error;
  } catch (error) {
    console.error('Error deleting old notifications:', error);
  }
};

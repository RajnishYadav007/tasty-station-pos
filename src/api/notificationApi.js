// src/api/notificationApi.js - ✅ WITH SIMPLE BEEP SOUND

import { supabase } from './supabaseClient';

// =====================================
// HELPER - EXTRACT NUMERIC ID
// =====================================
const extractNumericId = (id) => {
  if (!id) return null;
  
  // Already numeric
  if (typeof id === 'number') return id;
  
  // String with prefix (e.g., "ORD-227" → 227)
  if (typeof id === 'string') {
    if (id.includes('-')) {
      const parts = id.split('-');
      const numeric = parseInt(parts[parts.length - 1]);
      return isNaN(numeric) ? null : numeric;
    }
    // String without prefix (e.g., "227" → 227)
    const numeric = parseInt(id);
    return isNaN(numeric) ? null : numeric;
  }
  
  return null;
};

// =====================================
// REAL-TIME SUBSCRIPTION
// =====================================
export const subscribeToNotifications = (callback) => {
  console.log('🔔 Starting real-time subscription...');
  
  const channel = supabase
    .channel('notifications-channel')
    .on(
      'postgres_changes',
      {
        event: 'INSERT',
        schema: 'public',
        table: 'notifications'
      },
      (payload) => {
        console.log('🔥 New notification:', payload.new);
        callback(payload.new);
        
        // Show browser notification
        showBrowserNotification(
          'Tasty Station',
          payload.new.message,
          payload.new.icon
        );
      }
    )
    .subscribe((status) => {
      console.log('📡 Subscription status:', status);
    });

  return () => {
    console.log('🛑 Unsubscribing...');
    supabase.removeChannel(channel);
  };
};

// =====================================
// BROWSER NOTIFICATIONS
// =====================================
export const requestNotificationPermission = async () => {
  if (!('Notification' in window)) {
    console.warn('⚠️ Browser does not support notifications');
    return false;
  }

  if (Notification.permission === 'granted') return true;

  if (Notification.permission !== 'denied') {
    const permission = await Notification.requestPermission();
    return permission === 'granted';
  }

  return false;
};

export const showBrowserNotification = (title, message, icon = '🔔') => {
  if (Notification.permission === 'granted') {
    // ✅ SIMPLE BEEP SOUND (NO FILE NEEDED - WORKS EVERYWHERE)
    const beep = new Audio('data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBTGH0fPTgjMGHm7A7+OZURE');
    beep.volume = 0.5;  // Adjust volume (0.0 to 1.0)
    beep.play().catch(e => console.log('🔇 Audio play failed'));

    const notification = new Notification(title, {
      body: message,
      icon: '/logo192.png',
      badge: '/logo192.png',
      tag: 'tasty-station',
      requireInteraction: true,
      vibrate: [200, 100, 200],
    });

    notification.onclick = () => {
      window.focus();
      notification.close();
    };

    return notification;
  }
};

// =====================================
// GET NOTIFICATIONS
// =====================================
export const getNotifications = async () => {
  try {
    const { data, error } = await supabase
      .from('notifications')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(50);

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('❌ Error getting notifications:', error);
    return [];
  }
};

export const getUnreadNotificationsForChef = async (chefUserId = null) => {
  try {
    let query = supabase
      .from('notifications')
      .select('*')
      .eq('read', false)
      .eq('type', 'new-order');

    if (chefUserId) {
      query = query.or(`target_user_id.eq.${chefUserId},target_role.eq.chef`);
    }

    const { data, error } = await query
      .order('created_at', { ascending: false })
      .limit(20);

    if (error) throw error;
    console.log('✅ Chef notifications:', data?.length || 0);
    return data || [];
  } catch (error) {
    console.error('❌ Error getting chef notifications:', error);
    return [];
  }
};

export const getUnreadNotificationsForWaiter = async (waiterUserId = null) => {
  try {
    let query = supabase
      .from('notifications')
      .select('*')
      .eq('read', false)
      .eq('type', 'order-ready');

    if (waiterUserId) {
      query = query.or(`target_user_id.eq.${waiterUserId},target_role.eq.waiter`);
    }

    const { data, error } = await query
      .order('created_at', { ascending: false })
      .limit(20);

    if (error) throw error;
    console.log('✅ Waiter notifications:', data?.length || 0);
    return data || [];
  } catch (error) {
    console.error('❌ Error getting waiter notifications:', error);
    return [];
  }
};

// =====================================
// SEND NOTIFICATIONS
// =====================================

// ✅ NEW ORDER NOTIFICATION - WITH OWNER SUPPORT
export const sendNewOrderNotification = async (orderId, tableNumber, itemCount, tableId, targetUserId = null) => {
  console.log('\n🔔 SENDING NEW ORDER NOTIFICATION');
  console.log('─────────────────────────────────────');
  console.log('Order ID (raw):', orderId);
  
  // ✅ CONVERT TO NUMERIC
  const numericOrderId = extractNumericId(orderId);
  
  if (!numericOrderId) {
    console.error('❌ Invalid order_id:', orderId);
    return { success: false, error: 'Invalid order_id' };
  }
  
  console.log('Order ID (numeric):', numericOrderId);
  console.log('Table Number:', tableNumber);
  console.log('Table ID:', tableId);

  // ✅ CREATE TWO NOTIFICATIONS: CHEF + OWNER
  const notifications = [
    // Chef notification
    {
      type: 'new-order',
      message: `🛒 NEW ORDER #${numericOrderId} - Table #${tableNumber} (${itemCount} items)`,
      read: false,
      icon: '🛒',
      table_id: tableId || tableNumber,
      target_user_id: targetUserId,
      target_role: 'chef',
      order_id: numericOrderId,
      table_number: tableNumber,
      created_at: new Date().toISOString()
    },
    // ✅ Owner notification (NEW)
    {
      type: 'new-order',
      message: `🛒 NEW ORDER #${numericOrderId} - Table #${tableNumber} (${itemCount} items)`,
      read: false,
      icon: '🛒',
      table_id: tableId || tableNumber,
      target_user_id: null,
      target_role: 'owner',
      order_id: numericOrderId,
      table_number: tableNumber,
      created_at: new Date().toISOString()
    }
  ];

  try {
    const { data, error } = await supabase
      .from('notifications')
      .insert(notifications)  // ✅ Insert array
      .select();

    if (error) throw error;

    console.log('✅ Notifications saved (Chef + Owner):', data?.length);
    console.log('─────────────────────────────────────\n');
    
    return { success: true, data };
  } catch (error) {
    console.error('❌ Error:', error);
    return { success: false, error: error.message };
  }
};

// ✅ ORDER READY NOTIFICATION - WITH OWNER SUPPORT + DISH NAME
export const sendOrderReadyNotification = async (
  orderId, 
  tableNumber, 
  dishName,
  quantity,
  tableId, 
  waiterUserId = null
) => {
  console.log('\n✅ SENDING ORDER READY NOTIFICATION');
  console.log('─────────────────────────────────────');
  console.log('Order ID (raw):', orderId);
  console.log('Dish Name:', dishName);
  console.log('Quantity:', quantity);
  
  // ✅ CONVERT TO NUMERIC
  const numericOrderId = extractNumericId(orderId);
  
  if (!numericOrderId) {
    console.error('❌ Invalid order_id:', orderId);
    return { success: false, error: 'Invalid order_id' };
  }
  
  console.log('Order ID (numeric):', numericOrderId);
  console.log('Table Number:', tableNumber);
  console.log('Table ID:', tableId);

  // ✅ CREATE MESSAGE WITH DISH NAME
  const message = quantity > 1
    ? `✅ ${quantity}x ${dishName} READY! Table #${tableNumber}`
    : `✅ ${dishName} READY! Table #${tableNumber}`;

  // ✅ CREATE TWO NOTIFICATIONS: WAITER + OWNER
  const notifications = [
    // Waiter notification
    {
      type: 'order-ready',
      message: message,
      read: false,
      icon: '✅',
      table_id: tableId || tableNumber,
      target_user_id: waiterUserId,
      target_role: 'waiter',
      order_id: numericOrderId,
      table_number: tableNumber,
      created_at: new Date().toISOString()
    },
    // ✅ Owner notification (NEW)
    {
      type: 'order-ready',
      message: message,
      read: false,
      icon: '✅',
      table_id: tableId || tableNumber,
      target_user_id: null,
      target_role: 'owner',
      order_id: numericOrderId,
      table_number: tableNumber,
      created_at: new Date().toISOString()
    }
  ];

  try {
    const { data, error } = await supabase
      .from('notifications')
      .insert(notifications)  // ✅ Insert array
      .select();

    if (error) throw error;

    console.log('✅ Notifications saved (Waiter + Owner):', data?.length);
    console.log('─────────────────────────────────────\n');
    
    return { success: true, data };
  } catch (error) {
    console.error('❌ Error:', error);
    return { success: false, error: error.message };
  }
};

// ✅ TABLE OCCUPIED NOTIFICATION
export const sendTableOccupiedNotification = async (tableNumber, guestName, tableId) => {
  const notification = {
    type: 'table-occupied',
    message: `🪑 Table #${tableNumber} occupied by ${guestName}`,
    read: false,
    icon: '🪑',
    table_id: tableId || tableNumber,
    target_role: 'waiter',
    table_number: tableNumber,
    created_at: new Date().toISOString()
  };

  try {
    const { data, error } = await supabase
      .from('notifications')
      .insert([notification])
      .select();

    if (error) throw error;
    console.log('✅ Table occupied notification sent');
    return { success: true, data };
  } catch (error) {
    console.error('❌ Error:', error);
    return { success: false, error: error.message };
  }
};

// ✅ PAYMENT READY NOTIFICATION - WITH NUMERIC ID CONVERSION
export const sendPaymentReadyNotification = async (billId, amount, tableNumber, tableId) => {
  console.log('💰 Payment ready:', billId);
  
  // ✅ CONVERT TO NUMERIC
  const numericBillId = extractNumericId(billId);
  
  if (!numericBillId) {
    console.error('❌ Invalid bill_id:', billId);
    return { success: false, error: 'Invalid bill_id' };
  }

  const notification = {
    type: 'payment-ready',
    message: `💳 Payment Ready! Bill #${numericBillId} - ₹${amount.toFixed(2)} - Table #${tableNumber}`,
    read: false,
    icon: '💳',
    table_id: tableId || tableNumber,
    target_role: 'owner',
    bill_id: numericBillId,
    table_number: tableNumber,
    created_at: new Date().toISOString()
  };

  try {
    const { data, error } = await supabase
      .from('notifications')
      .insert([notification])
      .select();

    if (error) throw error;
    console.log('✅ Payment notification sent');
    return { success: true, data };
  } catch (error) {
    console.error('❌ Error:', error);
    return { success: false, error: error.message };
  }
};

// ✅ RESERVATION NOTIFICATION
export const sendReservationNotification = async (guestName, reservationTime, tableNumber, tableId) => {
  const notification = {
    type: 'reservation',
    message: `📅 Reservation: ${guestName} at ${reservationTime} - Table #${tableNumber}`,
    read: false,
    icon: '📅',
    table_id: tableId || tableNumber,
    target_role: 'waiter',
    table_number: tableNumber,
    created_at: new Date().toISOString()
  };

  try {
    const { data, error } = await supabase
      .from('notifications')
      .insert([notification])
      .select();

    if (error) throw error;
    console.log('✅ Reservation notification sent');
    return { success: true, data };
  } catch (error) {
    console.error('❌ Error:', error);
    return { success: false, error: error.message };
  }
};

// =====================================
// UPDATE NOTIFICATIONS
// =====================================
export const markNotificationAsRead = async (notificationId) => {
  try {
    const { error } = await supabase
      .from('notifications')
      .update({ read: true })
      .eq('id', notificationId);

    if (error) throw error;
    console.log('✅ Marked as read:', notificationId);
  } catch (error) {
    console.error('❌ Error:', error);
  }
};

export const markAllAsRead = async () => {
  try {
    const { error } = await supabase
      .from('notifications')
      .update({ read: true })
      .eq('read', false);

    if (error) throw error;
    console.log('✅ All marked as read');
  } catch (error) {
    console.error('❌ Error:', error);
  }
};

// =====================================
// DELETE NOTIFICATIONS
// =====================================
export const deleteNotification = async (notificationId) => {
  try {
    const { error } = await supabase
      .from('notifications')
      .delete()
      .eq('id', notificationId);

    if (error) throw error;
    console.log('✅ Notification deleted');
  } catch (error) {
    console.error('❌ Error:', error);
  }
};

export const deleteOldNotifications = async (daysOld = 7) => {
  try {
    const date = new Date();
    date.setDate(date.getDate() - daysOld);
    
    const { error } = await supabase
      .from('notifications')
      .delete()
      .lt('created_at', date.toISOString());

    if (error) throw error;
    console.log('✅ Old notifications deleted');
  } catch (error) {
    console.error('❌ Error:', error);
  }
};

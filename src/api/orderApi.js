// src/api/orderApi.js - ✅ FULLY CORRECTED & TESTED

import { supabase } from './supabaseClient';

// ✅ Get all orders
export async function getOrders() {
  const { data, error } = await supabase
    .from('Order')
    .select('*')
    .order('order_id', { ascending: false });
  
  if (error) {
    console.error('❌ Error fetching orders:', error);
    throw error;
  }
  return data;
}

// Get order by ID
export async function getOrderById(orderId) {
  const { data, error } = await supabase
    .from('Order')
    .select('*')
    .eq('order_id', orderId)
    .single();
  
  if (error) {
    console.error('❌ Error fetching order:', error);
    throw error;
  }
  return data;
}

// ✅ Get orders with all details (JOIN with User and Waiter)
export async function getOrdersWithDetails() {
  const { data, error } = await supabase
    .from('Order')
    .select(`
      *,
      User:user_id (
        user_id,
        user_name,
        email,
        phone
      ),
      Waiter:waiter_id (
        waiter_id,
        name,
        email
      )
    `)
    .order('order_id', { ascending: false });
  
  if (error) {
    console.error('❌ Error fetching orders with details:', error);
    throw error;
  }
  return data;
}

// Get orders by user ID
export async function getOrdersByUser(userId) {
  const { data, error } = await supabase
    .from('Order')
    .select('*')
    .eq('user_id', userId)
    .order('order_date', { ascending: false });
  
  if (error) {
    console.error('❌ Error fetching orders by user:', error);
    throw error;
  }
  return data;
}

// Get orders by waiter ID
export async function getOrdersByWaiter(waiterId) {
  const { data, error } = await supabase
    .from('Order')
    .select('*')
    .eq('waiter_id', waiterId)
    .order('order_date', { ascending: false });
  
  if (error) {
    console.error('❌ Error fetching orders by waiter:', error);
    throw error;
  }
  return data;
}

// Get orders by status
export async function getOrdersByStatus(status) {
  const { data, error } = await supabase
    .from('Order')
    .select('*')
    .eq('status', status)
    .order('order_date', { ascending: false });
  
  if (error) {
    console.error('❌ Error fetching orders by status:', error);
    throw error;
  }
  return data;
}

// Get pending orders
export async function getPendingOrders() {
  return await getOrdersByStatus('pending');
}

// Get completed orders
export async function getCompletedOrders() {
  return await getOrdersByStatus('completed');
}

// Get cancelled orders
export async function getCancelledOrders() {
  return await getOrdersByStatus('cancelled');
}

// Get orders by date range
export async function getOrdersByDateRange(startDate, endDate) {
  const { data, error } = await supabase
    .from('Order')
    .select('*')
    .gte('order_date', startDate)
    .lte('order_date', endDate)
    .order('order_date', { ascending: false });
  
  if (error) {
    console.error('❌ Error fetching orders by date range:', error);
    throw error;
  }
  return data;
}

// Get today's orders
export async function getTodaysOrders() {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  const { data, error } = await supabase
    .from('Order')
    .select('*')
    .gte('order_date', today.toISOString())
    .lt('order_date', tomorrow.toISOString())
    .order('order_date', { ascending: false });
  
  if (error) {
    console.error('❌ Error fetching today\'s orders:', error);
    throw error;
  }
  return data;
}

// ✅ Add new order - RETURNS ARRAY (CRITICAL FIX)
export async function addOrder(orderData) {
  console.log('📝 API: Creating order with data:', orderData);

  const { data, error } = await supabase
    .from('Order')
    .insert([{
      user_id: orderData.user_id,
      waiter_id: orderData.waiter_id || null,
      order_date: orderData.order_date || new Date().toISOString(),
      status: orderData.status || 'pending',
      table_number: orderData.table_number || null,
      waiter_name: orderData.waiter_name || 'Unknown',
      customer_name: orderData.customer_name || 'Guest'
    }])
    .select();
  
  if (error) {
    console.error('❌ Error adding order:', error);
    throw error;
  }

  console.log('✅ Order created in DB:', data);
  return data;  // ✅ RETURN ARRAY - NOT data[0]!
}

// Update order
export async function updateOrder(orderId, updatedData) {
  const { data, error } = await supabase
    .from('Order')
    .update(updatedData)
    .eq('order_id', orderId)
    .select();
  
  if (error) {
    console.error('❌ Error updating order:', error);
    throw error;
  }
  return data[0];
}

// Update order status
export async function updateOrderStatus(orderId, status) {
  const { data, error } = await supabase
    .from('Order')
    .update({ status })
    .eq('order_id', orderId)
    .select();
  
  if (error) {
    console.error('❌ Error updating order status:', error);
    throw error;
  }
  return data[0];
}

// Mark order as completed
export async function markOrderAsCompleted(orderId) {
  return await updateOrderStatus(orderId, 'completed');
}

// Mark order as cancelled
export async function markOrderAsCancelled(orderId) {
  return await updateOrderStatus(orderId, 'cancelled');
}

// Assign waiter to order
export async function assignWaiterToOrder(orderId, waiterId) {
  const { data, error } = await supabase
    .from('Order')
    .update({ waiter_id: waiterId })
    .eq('order_id', orderId)
    .select();
  
  if (error) {
    console.error('❌ Error assigning waiter:', error);
    throw error;
  }
  return data[0];
}

// Delete order
export async function deleteOrder(orderId) {
  const { data, error } = await supabase
    .from('Order')
    .delete()
    .eq('order_id', orderId);
  
  if (error) {
    console.error('❌ Error deleting order:', error);
    throw error;
  }
  return data;
}

// Get order count
export async function getOrderCount() {
  const { count, error } = await supabase
    .from('Order')
    .select('*', { count: 'exact', head: true });
  
  if (error) {
    console.error('❌ Error getting order count:', error);
    throw error;
  }
  return count;
}

// Get order count by status
export async function getOrderCountByStatus(status) {
  const { count, error } = await supabase
    .from('Order')
    .select('*', { count: 'exact', head: true })
    .eq('status', status);
  
  if (error) {
    console.error('❌ Error getting order count by status:', error);
    throw error;
  }
  return count;
}

// Get today's order count
export async function getTodaysOrderCount() {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  const { count, error } = await supabase
    .from('Order')
    .select('*', { count: 'exact', head: true })
    .gte('order_date', today.toISOString())
    .lt('order_date', tomorrow.toISOString());
  
  if (error) {
    console.error('❌ Error getting today\'s order count:', error);
    throw error;
  }
  return count;
}

// Get order statistics
export async function getOrderStatistics() {
  try {
    const [allOrders, todaysOrders] = await Promise.all([
      getOrders(),
      getTodaysOrders()
    ]);

    const stats = {
      total: allOrders.length,
      today: todaysOrders.length,
      pending: allOrders.filter(o => o.status === 'pending').length,
      completed: allOrders.filter(o => o.status === 'completed').length,
      cancelled: allOrders.filter(o => o.status === 'cancelled').length,
      todayPending: todaysOrders.filter(o => o.status === 'pending').length,
      todayCompleted: todaysOrders.filter(o => o.status === 'completed').length
    };

    return stats;
  } catch (error) {
    console.error('❌ Error calculating order statistics:', error);
    throw error;
  }
}

// Get orders grouped by date
export async function getOrdersByDate() {
  try {
    const orders = await getOrders();
    
    const grouped = orders.reduce((acc, order) => {
      const date = new Date(order.order_date).toLocaleDateString();
      if (!acc[date]) {
        acc[date] = [];
      }
      acc[date].push(order);
      return acc;
    }, {});

    return grouped;
  } catch (error) {
    console.error('❌ Error grouping orders by date:', error);
    throw error;
  }
}

// Get most active waiters
export async function getMostActiveWaiters(limit = 5) {
  try {
    const orders = await getOrders();
    
    const waiterCounts = orders.reduce((acc, order) => {
      if (order.waiter_id) {
        acc[order.waiter_id] = (acc[order.waiter_id] || 0) + 1;
      }
      return acc;
    }, {});

    const sorted = Object.entries(waiterCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, limit)
      .map(([waiter_id, count]) => ({
        waiter_id: parseInt(waiter_id),
        order_count: count
      }));

    return sorted;
  } catch (error) {
    console.error('❌ Error getting active waiters:', error);
    throw error;
  }
}

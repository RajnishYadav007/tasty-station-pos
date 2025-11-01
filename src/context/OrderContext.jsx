// src/context/OrderContext.jsx

import React, { createContext, useContext, useState, useEffect } from 'react';

const OrderContext = createContext();

export const useOrders = () => {
  const context = useContext(OrderContext);
  if (!context) {
    throw new Error('useOrders must be used within OrderProvider');
  }
  return context;
};

export const OrderProvider = ({ children }) => {
  const [orders, setOrders] = useState([]);

  // Load orders from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('restaurantOrders');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setOrders(parsed);
        console.log('📦 Loaded orders:', parsed.length);
      } catch (error) {
        console.error('❌ Load error:', error);
      }
    }
  }, []);

  // Save orders to localStorage
  useEffect(() => {
    if (orders.length > 0) {
      localStorage.setItem('restaurantOrders', JSON.stringify(orders));
      console.log('💾 Saved orders:', orders.length);
    }
  }, [orders]);

  // ✅ Save notification - visible to Owner, Chef, Waiter (NOT Customer)
  const saveNotificationToStorage = (type, message, orderData = {}) => {
    try {
      // Get existing notifications
      const saved = localStorage.getItem('simpleNotifications');
      const existingNotifications = saved ? JSON.parse(saved) : [];
      
      // Create new notification
      const newNotification = {
        id: `NOTIF-${Date.now()}`,
        type,
        message,
        timestamp: new Date().toISOString(),
        read: false,
        visibleTo: ['owner', 'chef', 'waiter'], // ✅ Visible to all except customer
        ...orderData // Include waiter name, table, etc.
      };
      
      // Add to beginning of array
      const updatedNotifications = [newNotification, ...existingNotifications];
      
      // Save back to localStorage
      localStorage.setItem('simpleNotifications', JSON.stringify(updatedNotifications));
      
      console.log('🔔 Notification saved:', message);
      console.log('👥 Visible to: Owner, Chef, Waiter');
      
      // Also trigger window function if available (for current session)
      if (window.addNotification) {
        window.addNotification(type, message, orderData);
      }
    } catch (error) {
      console.error('❌ Notification save error:', error);
    }
  };

  // Add order with notification
  const addOrder = (orderData) => {
    const newOrder = {
      ...orderData,
      id: `ORD-${Date.now()}`,
      items: (orderData.items || []).map(item => ({
        ...item,
        status: 'in-kitchen'
      })),
      createdAt: new Date().toISOString(),
      status: 'in-kitchen'
    };
    
    setOrders(prev => [newOrder, ...prev]);
    
    // ✅ Send notification to Owner, Chef, Waiter
    saveNotificationToStorage(
      'new-order',
      `🆕 New Order: Table ${orderData.tableNumber || '?'} - ${orderData.items?.length || 0} items (Waiter: ${orderData.waiterName || 'Unknown'})`,
      {
        tableNumber: orderData.tableNumber,
        waiterName: orderData.waiterName,
        itemCount: orderData.items?.length || 0
      }
    );
    
    console.log('➕ Order added:', newOrder.id);
    return newOrder;
  };

  // Update order status
  const updateOrderStatus = (orderId, newStatus) => {
    setOrders(prevOrders =>
      prevOrders.map(order =>
        order.id === orderId ? { ...order, status: newStatus } : order
      )
    );
    console.log('🔄 Order status updated:', orderId, newStatus);
  };

  // ✅ Update item status with notification
  const updateItemStatus = (orderId, itemIndex, newStatus) => {
    console.log('🔥 updateItemStatus:', { orderId, itemIndex, newStatus });
    
    setOrders(prevOrders =>
      prevOrders.map(order => {
        if (order.id === orderId) {
          const item = order.items[itemIndex];
          
          // Create new items array
          const updatedItems = order.items.map((item, idx) => {
            if (idx === itemIndex) {
              return { ...item, status: newStatus };
            }
            return item;
          });
          
          // ✅ Send notification to Owner, Chef, Waiter when item ready
          if (newStatus === 'ready' && item) {
            saveNotificationToStorage(
              'ready',
              `✅ Item Ready: ${item.name} for Table ${order.tableNumber || '?'} (Waiter: ${order.waiterName || 'Unknown'})`,
              {
                itemName: item.name,
                tableNumber: order.tableNumber,
                waiterName: order.waiterName,
                orderId: orderId
              }
            );
          }
          
          console.log('✅ Updated item:', updatedItems[itemIndex]);
          return { ...order, items: updatedItems };
        }
        return order;
      })
    );
  };

  // Get orders by status
  const getOrdersByStatus = (status) => {
    return orders.filter(order => order.status === status);
  };

  // Calculate elapsed time
  const calculateElapsedTime = (createdAt) => {
    if (!createdAt) return '';
    const now = new Date();
    const created = new Date(createdAt);
    const diff = Math.floor((now - created) / 1000);
    
    if (diff < 60) return `${diff}s`;
    if (diff < 3600) return `${Math.floor(diff / 60)}m`;
    return `${Math.floor(diff / 3600)}h ${Math.floor((diff % 3600) / 60)}m`;
  };

  const value = {
    orders,
    addOrder,
    updateOrderStatus,
    updateItemStatus,
    getOrdersByStatus,
    calculateElapsedTime
  };

  return (
    <OrderContext.Provider value={value}>
      {children}
    </OrderContext.Provider>
  );
};

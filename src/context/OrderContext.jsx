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
  // Initially empty - Chef will see empty state
  const [orders, setOrders] = useState([]);

  // Load orders from localStorage on mount
  useEffect(() => {
    const savedOrders = localStorage.getItem('restaurantOrders');
    if (savedOrders) {
      setOrders(JSON.parse(savedOrders));
    }
  }, []);

  // Save orders to localStorage whenever they change
  useEffect(() => {
    if (orders.length > 0) {
      localStorage.setItem('restaurantOrders', JSON.stringify(orders));
    }
  }, [orders]);

  // Calculate time elapsed since order creation
  const calculateElapsedTime = (createdAt) => {
    const now = new Date();
    const created = new Date(createdAt);
    const diffMinutes = Math.floor((now - created) / 60000);
    
    if (diffMinutes < 1) return 'Just now';
    if (diffMinutes === 1) return '1 min';
    if (diffMinutes < 60) return `${diffMinutes} min`;
    
    const diffHours = Math.floor(diffMinutes / 60);
    if (diffHours === 1) return '1 hour';
    return `${diffHours} hours`;
  };

  // Add new order (Called from ManageTable/Waiter)
 const addOrder = (orderData) => {
  const newOrder = {
    id: `ORD-${Date.now()}`,
    tableNumber: orderData.tableNumber,
    customerName: orderData.customerName || `Table ${orderData.tableNumber}`, // ✅ Add customer name
    items: orderData.items || [],
    status: 'in-kitchen',
    priority: orderData.priority || 'medium',
    waiter: orderData.waiterName || 'Waiter',
    createdAt: new Date().toISOString(),
    notes: orderData.notes || '',
    ...orderData
  };

  setOrders(prevOrders => [newOrder, ...prevOrders]);

    // Show browser notification (if permission granted)
  if (window.Notification && Notification.permission === 'granted') {
    new Notification('🔔 New Order Received!', {
      body: `${newOrder.customerName} - Table ${orderData.tableNumber}`,
      icon: '🍽️'
    });
  }

    // Play notification sound (optional)
    try {
      const audio = new Audio('/notification.mp3');
      audio.play().catch(err => console.log('Audio play failed:', err));
    } catch (err) {
      console.log('Notification sound not available');
    }

    console.log('✅ New order added:', newOrder);
    return newOrder;
  };

  // Update order status (Move to next stage)
  const updateOrderStatus = (orderId, newStatus) => {
    setOrders(prevOrders =>
      prevOrders.map(order =>
        order.id === orderId 
          ? { ...order, status: newStatus, updatedAt: new Date().toISOString() } 
          : order
      )
    );
    console.log(`✅ Order ${orderId} status changed to: ${newStatus}`);
  };

  // Update entire order
  const updateOrder = (orderId, updates) => {
    setOrders(prevOrders =>
      prevOrders.map(order =>
        order.id === orderId 
          ? { ...order, ...updates, updatedAt: new Date().toISOString() } 
          : order
      )
    );
  };

  // Delete/Complete order
  const deleteOrder = (orderId) => {
    setOrders(prevOrders => prevOrders.filter(order => order.id !== orderId));
    console.log(`✅ Order ${orderId} deleted`);
  };

  // Get orders by status
  const getOrdersByStatus = (status) => {
    return orders.filter(order => order.status === status);
  };

  // Get orders by table number
  const getOrdersByTable = (tableNumber) => {
    return orders.filter(order => order.tableNumber === tableNumber);
  };

  // Get order by ID
  const getOrderById = (orderId) => {
    return orders.find(order => order.id === orderId);
  };

  // Get status counts
  const getStatusCounts = () => {
    return {
      inKitchen: orders.filter(o => o.status === 'in-kitchen').length,
      wait: orders.filter(o => o.status === 'wait').length,
      ready: orders.filter(o => o.status === 'ready').length,
      served: orders.filter(o => o.status === 'served').length,
      total: orders.length
    };
  };

  // Clear all orders (for testing)
  const clearAllOrders = () => {
    setOrders([]);
    localStorage.removeItem('restaurantOrders');
    console.log('✅ All orders cleared');
  };

  // Add item to existing order
  const addItemToOrder = (orderId, newItem) => {
    setOrders(prevOrders =>
      prevOrders.map(order =>
        order.id === orderId
          ? {
              ...order,
              items: [...order.items, newItem],
              updatedAt: new Date().toISOString()
            }
          : order
      )
    );
  };

  // Remove item from order
  const removeItemFromOrder = (orderId, itemIndex) => {
    setOrders(prevOrders =>
      prevOrders.map(order =>
        order.id === orderId
          ? {
              ...order,
              items: order.items.filter((_, index) => index !== itemIndex),
              updatedAt: new Date().toISOString()
            }
          : order
      )
    );
  };

  // Calculate order total
  const calculateOrderTotal = (orderId) => {
    const order = getOrderById(orderId);
    if (!order || !order.items) return 0;

    return order.items.reduce((total, item) => {
      const price = parseFloat(item.price) || 0;
      const quantity = parseInt(item.quantity) || 1;
      return total + (price * quantity);
    }, 0);
  };

  const value = {
    orders,
    addOrder,
    updateOrderStatus,
    updateOrder,
    deleteOrder,
    getOrdersByStatus,
    getOrdersByTable,
    getOrderById,
    getStatusCounts,
    clearAllOrders,
    addItemToOrder,
    removeItemFromOrder,
    calculateOrderTotal,
    calculateElapsedTime
  };

  return (
    <OrderContext.Provider value={value}>
      {children}
    </OrderContext.Provider>
  );
};

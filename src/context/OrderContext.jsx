// src/context/OrderContext.jsx

import React, { createContext, useContext, useState } from 'react';

const OrderContext = createContext();

export const useOrders = () => {
  const context = useContext(OrderContext);
  if (!context) {
    throw new Error('useOrders must be used within OrderProvider');
  }
  return context;
};

export const OrderProvider = ({ children }) => {
  const [orders, setOrders] = useState([
    // Your existing orders...
  ]);

  const addOrder = (order) => {
    const newOrder = {
      ...order,
      id: `#${Math.random().toString(36).substr(2, 9).toUpperCase()}`,
      createdAt: new Date(),
      status: 'in-kitchen'
    };
    setOrders(prev => [...prev, newOrder]);
  };

  const updateOrderStatus = (orderId, newStatus) => {
    setOrders(prevOrders =>
      prevOrders.map(order =>
        order.id === orderId ? { ...order, status: newStatus } : order
      )
    );
  };

  // ✅ NEW: Update individual item status
  const updateItemStatus = (orderId, itemIndex, newStatus) => {
    setOrders(prevOrders =>
      prevOrders.map(order => {
        if (order.id === orderId) {
          const updatedItems = [...order.items];
          updatedItems[itemIndex] = {
            ...updatedItems[itemIndex],
            status: newStatus
          };
          return { ...order, items: updatedItems };
        }
        return order;
      })
    );
  };

  const getOrdersByStatus = (status) => {
    return orders.filter(order => order.status === status);
  };

  const calculateElapsedTime = (createdAt) => {
    if (!createdAt) return '';
    const now = new Date();
    const diff = Math.floor((now - new Date(createdAt)) / 1000);
    
    if (diff < 60) return `${diff}s`;
    if (diff < 3600) return `${Math.floor(diff / 60)}m`;
    return `${Math.floor(diff / 3600)}h ${Math.floor((diff % 3600) / 60)}m`;
  };

  const value = {
    orders,
    addOrder,
    updateOrderStatus,
    updateItemStatus,  // ✅ Add this
    getOrdersByStatus,
    calculateElapsedTime
  };

  return (
    <OrderContext.Provider value={value}>
      {children}
    </OrderContext.Provider>
  );
};

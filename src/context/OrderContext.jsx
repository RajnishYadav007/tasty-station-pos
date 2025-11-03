// src/context/OrderContext.jsx - ✅ WITH SUPABASE STATUS UPDATE

import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import { getAllOrderDetailsWithOrders } from '../api/orderDetailsApi';
import { updateOrderDetailStatus } from '../api/orderDetailsApi';

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
  const [loading, setLoading] = useState(true);
  const isUpdatingRef = useRef(false);

  // ✅ Load from Supabase on mount
  useEffect(() => {
    loadOrdersFromSupabase();
    
    // Auto-refresh every 5 seconds ONLY if not updating
    const interval = setInterval(() => {
      if (!isUpdatingRef.current) {
        loadOrdersFromSupabase();
      }
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  // ✅ Load from Supabase
  const loadOrdersFromSupabase = async () => {
    try {
      setLoading(true);
      console.log('🔄 Loading from Supabase...');
      
      const data = await getAllOrderDetailsWithOrders();
      
      // Save to localStorage as backup
      localStorage.setItem('restaurantOrders', JSON.stringify(data));
      
      setOrders(data);
      console.log('✅ Loaded:', data.length, 'orders');
    } catch (error) {
      console.error('❌ Error loading from Supabase:', error);
      
      // Fallback to localStorage
      try {
        const saved = localStorage.getItem('restaurantOrders');
        if (saved) {
          const parsed = JSON.parse(saved);
          setOrders(parsed);
          console.log('📦 Fallback to localStorage:', parsed.length);
        }
      } catch (e) {
        console.error('❌ Fallback error:', e);
      }
    } finally {
      setLoading(false);
    }
  };

  // ✅ Update item status - WITH SUPABASE UPDATE
  const updateItemStatus = async (orderId, itemIndex, newStatus) => {
    console.log('🔥 Updating:', { orderId, itemIndex, newStatus });

    try {
      // ✅ STOP AUTO-REFRESH
      isUpdatingRef.current = true;

      // Find the order detail ID from current state
      const order = orders.find(o => o.id === orderId);
      if (!order || !order.items || !order.items[itemIndex]) {
        throw new Error('Order or item not found');
      }

      const orderDetailId = order.items[itemIndex].order_detail_id;
      console.log('📝 Updating order_detail_id:', orderDetailId);

      // ✅ UPDATE IN SUPABASE FIRST
      await updateOrderDetailStatus(orderDetailId, newStatus);
      console.log('✅ Updated in Supabase');

      // Update in state immediately (optimistic update)
      setOrders(prevOrders =>
        prevOrders.map(o => {
          if (o.id === orderId && o.items) {
            const updatedItems = o.items.map((item, idx) => {
              if (idx === itemIndex) {
                console.log('✅ Item updated:', { name: item.name, newStatus });
                return { ...item, status: newStatus };
              }
              return item;
            });
            return { ...o, items: updatedItems };
          }
          return o;
        })
      );

      // Save to localStorage
      const updated = orders.map(o => {
        if (o.id === orderId && o.items) {
          return {
            ...o,
            items: o.items.map((item, idx) => {
              if (idx === itemIndex) {
                return { ...item, status: newStatus };
              }
              return item;
            })
          };
        }
        return o;
      });

      localStorage.setItem('restaurantOrders', JSON.stringify(updated));
      console.log('💾 Saved to localStorage');

      // ✅ Wait 2 seconds then allow refresh again
      setTimeout(() => {
        isUpdatingRef.current = false;
        console.log('✅ Update complete, refresh enabled');
      }, 2000);

    } catch (error) {
      console.error('❌ Error updating item:', error);
      isUpdatingRef.current = false; // Re-enable on error
      throw error;
    }
  };

  // ✅ Calculate elapsed time
  const calculateElapsedTime = (createdAt) => {
    if (!createdAt) return '';
    const now = new Date();
    const created = new Date(createdAt);
    const diff = Math.floor((now - created) / 1000);

    if (diff < 60) return `${diff}s`;
    if (diff < 3600) return `${Math.floor(diff / 60)}m`;
    return `${Math.floor(diff / 3600)}h`;
  };

  const value = {
    orders,
    loading,
    updateItemStatus,
    calculateElapsedTime,
    refreshOrders: loadOrdersFromSupabase
  };

  return (
    <OrderContext.Provider value={value}>
      {children}
    </OrderContext.Provider>
  );
};

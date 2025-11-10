// src/context/OrderContext.jsx - ✅ FULLY OPTIMIZED WITH CACHING

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
  const [orderDetails, setOrderDetails] = useState({});
  
  // ✅ ADD: Refs to prevent infinite loops
  const isLoadingRef = useRef(false);
  const dataLoadedRef = useRef(false);
  const isUpdatingRef = useRef(false);
  const autoRefreshInterval = useRef(null);

  // ✅ OPTIMIZED: Load from Supabase ONCE on mount
  useEffect(() => {
    if (!dataLoadedRef.current) {
      loadOrdersFromSupabase();
    }

    // Cleanup on unmount
    return () => {
      if (autoRefreshInterval.current) {
        clearInterval(autoRefreshInterval.current);
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ✅ OPTIMIZED: Load from Supabase with caching
  const loadOrdersFromSupabase = async () => {
    // Prevent duplicate calls
    if (isLoadingRef.current) {
      console.log('⏳ Already loading orders, skipping...');
      return;
    }

    isLoadingRef.current = true;
    setLoading(true);

    try {
      console.log('🔄 Loading from Supabase...');
      
      const data = await getAllOrderDetailsWithOrders();
      
      // Save to localStorage as backup
      localStorage.setItem('restaurantOrders', JSON.stringify(data));
      
      setOrders(data);
      console.log('✅ Loaded:', data.length, 'orders');

      // Process order details with dish names
      const details = {};
      data.forEach(order => {
        if (order.items && order.items.length > 0) {
          details[order.id] = order.items.map(item => ({
            dish_id: item.dish_id,
            dish_name: item.dish_name || 'Unknown',
            price: item.price,
            quantity: item.quantity,
            status: item.status,
            order_detail_id: item.order_detail_id
          }));
        }
      });
      
      setOrderDetails(details);
      localStorage.setItem('orderDetails', JSON.stringify(details));
      console.log('✅ Order details loaded with dish names');

      // Mark as loaded
      dataLoadedRef.current = true;

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

        const savedDetails = localStorage.getItem('orderDetails');
        if (savedDetails) {
          const parsedDetails = JSON.parse(savedDetails);
          setOrderDetails(parsedDetails);
        }
      } catch (e) {
        console.error('❌ Fallback error:', e);
      }
    } finally {
      setLoading(false);
      isLoadingRef.current = false;
    }
  };

  // ✅ NEW: Enable auto-refresh (call this explicitly when needed)
  const enableAutoRefresh = () => {
    // Clear any existing interval
    if (autoRefreshInterval.current) {
      clearInterval(autoRefreshInterval.current);
    }

    // Auto-refresh every 10 seconds (not 5, to reduce load)
    autoRefreshInterval.current = setInterval(() => {
      if (!isUpdatingRef.current && !isLoadingRef.current) {
        console.log('🔄 Auto-refreshing orders...');
        dataLoadedRef.current = false; // Reset to allow refresh
        loadOrdersFromSupabase();
      }
    }, 10000); // 10 seconds

    console.log('✅ Auto-refresh enabled (10s interval)');
  };

  // ✅ NEW: Disable auto-refresh
  const disableAutoRefresh = () => {
    if (autoRefreshInterval.current) {
      clearInterval(autoRefreshInterval.current);
      autoRefreshInterval.current = null;
      console.log('⏸️ Auto-refresh disabled');
    }
  };

  // ✅ Manual refresh function
  const refreshOrders = async () => {
    console.log('🔄 Manual refresh triggered');
    dataLoadedRef.current = false; // Reset cache
    await loadOrdersFromSupabase();
  };

  // ✅ Update item status - WITH SUPABASE UPDATE
  const updateItemStatus = async (orderId, itemIndex, newStatus) => {
    console.log('🔥 Updating:', { orderId, itemIndex, newStatus });

    try {
      // ✅ STOP AUTO-REFRESH during update
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

      // ✅ Wait 2 seconds then reload data and re-enable refresh
      setTimeout(async () => {
        dataLoadedRef.current = false;
        await loadOrdersFromSupabase();
        isUpdatingRef.current = false;
        console.log('✅ Update complete, data refreshed');
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
    orderDetails,
    setOrderDetails,
    updateItemStatus,
    calculateElapsedTime,
    refreshOrders,           // ✅ Manual refresh
    enableAutoRefresh,       // ✅ Enable auto-refresh
    disableAutoRefresh       // ✅ Disable auto-refresh
  };

  return (
    <OrderContext.Provider value={value}>
      {children}
    </OrderContext.Provider>
  );
};

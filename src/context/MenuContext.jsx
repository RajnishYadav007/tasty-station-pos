// src/context/MenuContext.jsx - ✅ FULLY OPTIMIZED WITH CACHING

import React, { createContext, useContext, useState, useEffect, useRef } from 'react';

// Import APIs
import { getDishes } from '../api/dishApi';
import { getCategoriesWithDishCount } from '../api/categoryApi';

const MenuContext = createContext();

export const useMenu = () => {
  const context = useContext(MenuContext);
  if (!context) {
    throw new Error('useMenu must be used within MenuProvider');
  }
  return context;
};

export const MenuProvider = ({ children }) => {
  // State for dishes and categories
  const [dishes, setDishes] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // ✅ ADD: Refs to prevent infinite loops
  const isLoadingRef = useRef(false);
  const dataLoadedRef = useRef(false);
  const autoRefreshInterval = useRef(null);

  // ✅ OPTIMIZED: Load menu data with caching
  const loadMenuData = async () => {
    // Prevent duplicate calls
    if (isLoadingRef.current) {
      console.log('⏳ Already loading menu, skipping...');
      return;
    }

    isLoadingRef.current = true;
    setLoading(true);
    setError(null);

    try {
      console.log('📋 Loading menu from database...');

      // Fetch dishes and categories in parallel
      const [dishesData, categoriesData] = await Promise.all([
        getDishes(),
        getCategoriesWithDishCount()
      ]);

      // Add "All Dishes" category manually with icon
      const allCategories = [
        {
          category_id: 0,
          category_name: 'All Dishes',
          dish_count: dishesData.length,
          icon: '🍽️',
        },
        ...categoriesData.map(cat => ({
          ...cat,
          icon: getCategoryIcon(cat.category_name)
        }))
      ];

      setDishes(dishesData);
      setCategories(allCategories);

      // Save to localStorage as fallback
      localStorage.setItem('restaurantDishes', JSON.stringify(dishesData));
      localStorage.setItem('restaurantCategories', JSON.stringify(allCategories));

      console.log('✅ Menu loaded from database:', dishesData.length, 'dishes');
      
      // Mark as loaded
      dataLoadedRef.current = true;

    } catch (err) {
      console.error('❌ Error loading menu from database:', err);
      setError(err.message);

      // Fallback to localStorage data if API fails
      const savedDishes = localStorage.getItem('restaurantDishes');
      const savedCategories = localStorage.getItem('restaurantCategories');

      if (savedDishes) {
        const parsed = JSON.parse(savedDishes);
        setDishes(parsed);
        console.log('✅ Menu loaded from localStorage:', parsed.length, 'dishes');
      }

      if (savedCategories) {
        const parsed = JSON.parse(savedCategories);
        setCategories(parsed);
      }
    } finally {
      setLoading(false);
      isLoadingRef.current = false;
    }
  };

  // ✅ OPTIMIZED: Load ONCE on mount
  useEffect(() => {
    if (!dataLoadedRef.current) {
      loadMenuData();
    }

    // Cleanup on unmount
    return () => {
      if (autoRefreshInterval.current) {
        clearInterval(autoRefreshInterval.current);
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ✅ NEW: Enable auto-refresh (optional - use in admin panel)
  const enableAutoRefresh = () => {
    // Clear any existing interval
    if (autoRefreshInterval.current) {
      clearInterval(autoRefreshInterval.current);
    }

    // Auto-refresh every 30 seconds
    autoRefreshInterval.current = setInterval(() => {
      if (!isLoadingRef.current) {
        console.log('🔄 Auto-refreshing menu...');
        dataLoadedRef.current = false; // Reset to allow refresh
        loadMenuData();
      }
    }, 30000); // 30 seconds

    console.log('✅ Auto-refresh enabled (30s interval)');
  };

  // ✅ NEW: Disable auto-refresh
  const disableAutoRefresh = () => {
    if (autoRefreshInterval.current) {
      clearInterval(autoRefreshInterval.current);
      autoRefreshInterval.current = null;
      console.log('⏸️ Auto-refresh disabled');
    }
  };

  // ✅ Manual refresh to reload menu data
  const refreshMenu = async () => {
    console.log('🔄 Manual refresh triggered');
    dataLoadedRef.current = false; // Reset cache
    await loadMenuData();
  };

  // Get category icon by name
  const getCategoryIcon = (categoryName) => {
    const iconMap = {
      'Breakfast': '🍳',
      'Beef Dishes': '🥩',
      'Biryani': '🍛',
      'Chicken Dishes': '🍗',
      'Desserts': '🍰',
      'Dinner': '🍽️',
      'Drinks': '🥤',
      'Fast Foods': '🍔',
      'Lunch': '🍱',
      'Platters': '🍱',
      'Salads': '🥗',
      'Side Dishes': '🍟',
      'Soups': '🍲'
    };
    return iconMap[categoryName] || '🍽️';
  };

  // Get dishes filtered by category name
  const getDishesByCategory = (categoryName) => {
    if (categoryName === 'All Dishes') return dishes;

    const category = categories.find(c => c.category_name === categoryName);
    if (!category) return [];

    return dishes.filter(dish => dish.category_id === category.category_id);
  };

  // Get all category names list
  const getCategoryNames = () => {
    return categories.map(cat => cat.category_name);
  };

  // Get categories with counts
  const getCategoriesWithCounts = () => {
    return categories;
  };

  // Search dishes by name (case-insensitive)
  const searchDishes = (searchTerm) => {
    if (!searchTerm) return dishes;

    return dishes.filter(dish =>
      dish.dish_name.toLowerCase().includes(searchTerm.toLowerCase())
    );
  };

  // Filter dishes by price range
  const getDishesByPriceRange = (minPrice, maxPrice) => {
    return dishes.filter(dish => {
      const price = parseFloat(dish.price);
      return price >= minPrice && price <= maxPrice;
    });
  };

  // Get dishes which are available
  const getAvailableDishes = () => {
    return dishes.filter(dish => dish.availability_status === true);
  };

  // Value provided to context consumers
  const value = {
    dishes,
    categories,
    loading,
    error,
    getDishesByCategory,
    getCategoryNames,
    getCategoriesWithCounts,
    searchDishes,
    getDishesByPriceRange,
    getAvailableDishes,
    refreshMenu,           // ✅ Manual refresh
    enableAutoRefresh,     // ✅ Enable auto-refresh
    disableAutoRefresh     // ✅ Disable auto-refresh
  };

  return (
    <MenuContext.Provider value={value}>
      {children}
    </MenuContext.Provider>
  );
};

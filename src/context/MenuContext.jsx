import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';

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

  // Wrap loadMenuData in useCallback to stabilize reference
  const loadMenuData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

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
    }
  }, []); // Empty dependency array to avoid infinite loop

  // useEffect to load menu initially and every 30 seconds
  useEffect(() => {
    loadMenuData();

    const interval = setInterval(loadMenuData, 30000);
    return () => clearInterval(interval);
  }, [loadMenuData]);

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

  // Manual refresh to reload menu data
  const refreshMenu = async () => {
    await loadMenuData();
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
    refreshMenu
  };

  return (
    <MenuContext.Provider value={value}>
      {children}
    </MenuContext.Provider>
  );
};

// src/context/MenuContext.jsx

import React, { createContext, useContext, useState, useEffect } from 'react';

const MenuContext = createContext();

export const useMenu = () => {
  const context = useContext(MenuContext);
  if (!context) {
    throw new Error('useMenu must be used within MenuProvider');
  }
  return context;
};

export const MenuProvider = ({ children }) => {
  // Load dishes from localStorage (synced with ManageDishes)
  const [dishes, setDishes] = useState(() => {
    const savedDishes = localStorage.getItem('restaurantDishes');
    if (savedDishes) {
      return JSON.parse(savedDishes);
    }
    return [];
  });

  // Listen for changes in localStorage
  useEffect(() => {
    const handleStorageChange = () => {
      const savedDishes = localStorage.getItem('restaurantDishes');
      if (savedDishes) {
        setDishes(JSON.parse(savedDishes));
      }
    };

    // Polling every second to sync changes
    const interval = setInterval(() => {
      handleStorageChange();
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  // Get dishes by category
  const getDishesByCategory = (category) => {
    if (category === 'All Dishes') return dishes;
    return dishes.filter(dish => dish.category === category);
  };

  // Get all categories
  const getCategories = () => {
    const categories = ['All Dishes'];
    const uniqueCategories = [...new Set(dishes.map(dish => dish.category))];
    return [...categories, ...uniqueCategories];
  };

  return (
    <MenuContext.Provider value={{ 
      dishes, 
      getDishesByCategory,
      getCategories
    }}>
      {children}
    </MenuContext.Provider>
  );
};

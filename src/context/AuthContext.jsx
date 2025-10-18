// src/context/AuthContext.jsx

import React, { createContext, useState, useContext, useEffect } from 'react';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);

  // User roles database - ONLY 4 ROLES
  const userRoles = [
    {
      id: 1,
      name: 'John Doe',
      role: 'Owner',
      avatar: 'JD',
      icon: '👨‍💼',
      color: '#14B8A6',
      email: 'john@tastystation.com',
      password: 'owner123',
      permissions: ['all'],
      defaultRoute: '/dashboard' 
    },
    {
      id: 2,
      name: 'John Smith',
      role: 'Waiter',
      avatar: 'JS',
      icon: '🍽️',
      color: '#3B82F6',
      email: 'johnsmith@tastystation.com',
      password: 'waiter123',
      permissions: ['tables'],
      defaultRoute: '/manage-table'
    },
    {
      id: 3,
      name: 'Maria Garcia',
      role: 'Chef',
      avatar: 'MG',
      icon: '👨‍🍳',
      color: '#F59E0B',
      email: 'maria@tastystation.com',
      password: 'chef123',
      permissions: ['orderline'],  // ✅ Fixed - changed from 'order' to 'orderline'
      defaultRoute: '/orderline'
    },
    {
      id: 4,
      name: 'Guest Customer',
      role: 'Customer',
      avatar: 'GC',
      icon: '👤',
      color: '#EC4899',
      email: 'customer@tastystation.com',
      password: 'customer123',
      permissions: ['menu'],
      defaultRoute: '/menu'
    }
  ];

  useEffect(() => {
    const savedUser = localStorage.getItem('currentUser');
    if (savedUser) {
      setCurrentUser(JSON.parse(savedUser));
      setIsAuthenticated(true);
    }
    setLoading(false);
  }, []);

  const login = (email, password) => {
    const user = userRoles.find(
      (u) => u.email === email && u.password === password
    );

    if (user) {
      const userWithoutPassword = { ...user };
      delete userWithoutPassword.password;
      
      setCurrentUser(userWithoutPassword);
      setIsAuthenticated(true);
      localStorage.setItem('currentUser', JSON.stringify(userWithoutPassword));
      return { success: true, user: userWithoutPassword };
    }

    return { success: false, message: 'Invalid email or password' };
  };

  const switchRole = (userId) => {
    const user = userRoles.find((u) => u.id === userId);
    if (user) {
      const userWithoutPassword = { ...user };
      delete userWithoutPassword.password;
      
      setCurrentUser(userWithoutPassword);
      localStorage.setItem('currentUser', JSON.stringify(userWithoutPassword));
      return true;
    }
    return false;
  };

  const logout = () => {
    setCurrentUser(null);
    setIsAuthenticated(false);
    localStorage.removeItem('currentUser');
  };

  const hasPermission = (permission) => {
    if (!currentUser) return false;
    if (currentUser.permissions.includes('all')) return true;
    return currentUser.permissions.includes(permission);
  };

  const value = {
    currentUser,
    isAuthenticated,
    loading,
    userRoles,
    login,
    logout,
    switchRole,
    hasPermission
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

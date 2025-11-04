// src/context/AuthContext.jsx - ✅ COMPLETE WITH isOwner

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
      permissions: ['orderline'],
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
      try {
        const parsedUser = JSON.parse(savedUser);
        setCurrentUser(parsedUser);
        setIsAuthenticated(true);
      } catch (error) {
        console.error('Error parsing saved user:', error);
        localStorage.removeItem('currentUser');
      }
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
      console.log('✅ Login successful:', userWithoutPassword.name, '-', userWithoutPassword.role);
      return { success: true, user: userWithoutPassword };
    }

    console.error('❌ Login failed - Invalid credentials');
    return { success: false, message: 'Invalid email or password' };
  };

  const switchRole = (userId) => {
    const user = userRoles.find((u) => u.id === userId);
    if (user) {
      const userWithoutPassword = { ...user };
      delete userWithoutPassword.password;
      
      setCurrentUser(userWithoutPassword);
      localStorage.setItem('currentUser', JSON.stringify(userWithoutPassword));
      console.log('✅ Role switched to:', userWithoutPassword.role);
      return true;
    }
    return false;
  };

  const logout = () => {
    setCurrentUser(null);
    setIsAuthenticated(false);
    localStorage.removeItem('currentUser');
    console.log('✅ Logged out successfully');
  };

  const hasPermission = (permission) => {
    if (!currentUser) return false;
    if (currentUser.permissions.includes('all')) return true;
    return currentUser.permissions.includes(permission);
  };

  // ✅ NEW - Check if user is Owner
  const isOwner = currentUser?.role === 'Owner';

  // ✅ NEW - Check if user is Chef
  const isChef = currentUser?.role === 'Chef';

  // ✅ NEW - Check if user is Waiter
  const isWaiter = currentUser?.role === 'Waiter';

  // ✅ NEW - Check if user is Customer
  const isCustomer = currentUser?.role === 'Customer';

  const value = {
    currentUser,
    isAuthenticated,
    loading,
    userRoles,
    isOwner,      // ✅ ADD THIS
    isChef,       // ✅ ADD THIS
    isWaiter,     // ✅ ADD THIS
    isCustomer,   // ✅ ADD THIS
    login,
    logout,
    switchRole,
    hasPermission
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

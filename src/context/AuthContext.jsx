// src/context/AuthContext.jsx - ✅ COMPLETE FIXED VERSION

import React, { createContext, useState, useContext, useEffect } from 'react';
import { toast } from 'react-toastify';
import { adminAPI } from '../api/adminApi';
import { waiterAPI, createWaiter, getAllWaiters, deleteWaiter } from '../api/waiterApi';
import { chefAPI, createChef, getAllChefs, deleteChef } from '../api/chefApi';
import { 
  loginUser,
  signupUser,
  getUsers,
  promoteCustomerToWaiter,
  promoteCustomerToChef
} from '../api/userApi';

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

  // ✅ Quick login users (for testing - from database)
  const userRoles = [
    {
      id: 1,
      name: 'Anjali Gupta',
      role: 'Owner',
      icon: '👨‍💼',
      color: '#14B8A6',
      email: 'anjali@example.com',
      password: 'gupta@123',
      permissions: ['all'],
      defaultRoute: '/dashboard' 
    },
    {
      id: 2,
      name: 'Waiter',
      role: 'Waiter',
      icon: '🍽️',
      color: '#3B82F6',
      email: 'waiter@example.com',
      password: 'waiter123',
      permissions: ['tables', 'orders'],
      defaultRoute: '/manage-table'
    },
    {
      id: 3,
      name: 'Chef',
      role: 'Chef',
      icon: '👨‍🍳',
      color: '#F59E0B',
      email: 'chef@example.com',
      password: 'chef123',
      permissions: ['orderline', 'kitchen'],
      defaultRoute: '/orderline'
    },
    {
      id: 4,
      name: 'Aman',
      role: 'Customer',
      icon: '👤',
      color: '#EC4899',
      email: 'amna@example.com',
      password: 'customer123',
      permissions: ['menu'],
      defaultRoute: '/menu'
    }
  ];

  // ✅ Load user from localStorage
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

  // ✅ LOGIN WITH API - TRY ALL TABLES
  const login = async (email, password) => {
    try {
      console.log('🔐 Login attempt:', email);

      // 1️⃣ Try Admin login
      let result = await adminAPI.login(email, password);
      if (result.success) {
        setCurrentUser(result.user);
        setIsAuthenticated(true);
        localStorage.setItem('currentUser', JSON.stringify(result.user));
        toast.success(`✅ Welcome ${result.user.name}!`, {
          position: 'top-right',
          autoClose: 2000,
        });
        return { success: true, user: result.user };
      }

      // 2️⃣ Try Waiter login
      result = await waiterAPI.login(email, password);
      if (result.success) {
        setCurrentUser(result.user);
        setIsAuthenticated(true);
        localStorage.setItem('currentUser', JSON.stringify(result.user));
        toast.success(`✅ Welcome ${result.user.name}!`, {
          position: 'top-right',
          autoClose: 2000,
        });
        return { success: true, user: result.user };
      }

      // 3️⃣ Try Chef login
      result = await chefAPI.login(email, password);
      if (result.success) {
        setCurrentUser(result.user);
        setIsAuthenticated(true);
        localStorage.setItem('currentUser', JSON.stringify(result.user));
        toast.success(`✅ Welcome ${result.user.name}!`, {
          position: 'top-right',
          autoClose: 2000,
        });
        return { success: true, user: result.user };
      }

      // 4️⃣ Try Customer login (from User table)
      result = await loginUser(email, password);
      if (result.success) {
        // ✅ ENSURE /menu ROUTE + ONLY MENU PERMISSION
        const customerUser = {
          ...result.user,
          role: 'Customer',
          permissions: ['menu'],
          defaultRoute: '/menu'
        };
        
        setCurrentUser(customerUser);
        setIsAuthenticated(true);
        localStorage.setItem('currentUser', JSON.stringify(customerUser));
        toast.success(`✅ Welcome ${result.user.name}!`, {
          position: 'top-right',
          autoClose: 2000,
        });
        return { success: true, user: customerUser };
      }

      // ❌ No match found
      console.error('❌ Login failed');
      toast.error('❌ Invalid credentials', {
        position: 'top-right',
        autoClose: 2000,
      });
      return { success: false, message: '❌ Invalid email or password' };
    } catch (error) {
      console.error('❌ Login error:', error);
      toast.error('❌ Login error: ' + error.message, {
        position: 'top-right',
        autoClose: 2000,
      });
      return { success: false, message: error.message };
    }
  };

  // ✅ SIGNUP - CUSTOMER ONLY
  const signup = async (userData) => {
    try {
      const result = await signupUser(userData);
      if (result.success) {
        toast.success('✅ Account created! Please login.', {
          position: 'top-right',
          autoClose: 2000,
        });
        return { success: true };
      } else {
        toast.error(result.message, {
          position: 'top-right',
          autoClose: 2000,
        });
        return { success: false, message: result.message };
      }
    } catch (error) {
      console.error('❌ Signup error:', error);
      toast.error('❌ Signup error: ' + error.message, {
        position: 'top-right',
        autoClose: 2000,
      });
      return { success: false, message: error.message };
    }
  };

  // ✅ LOGOUT
  const logout = () => {
    setCurrentUser(null);
    setIsAuthenticated(false);
    localStorage.removeItem('currentUser');
    console.log('✅ Logged out');
    toast.info('👋 Logged out successfully', {
      position: 'top-right',
      autoClose: 1500,
    });
  };

  // ✅ SWITCH ROLE (Quick login)
  const switchRole = (userId) => {
    const user = userRoles.find((u) => u.id === userId);
    if (user) {
      setCurrentUser(user);
      setIsAuthenticated(true);
      localStorage.setItem('currentUser', JSON.stringify(user));
      console.log('✅ Switched to:', user.role);
      toast.info(`🔄 Switched to ${user.role}`, {
        position: 'bottom-right',
        autoClose: 1500,
      });
      return true;
    }
    return false;
  };

  // ✅ HAS PERMISSION
  const hasPermission = (permission) => {
    if (!currentUser) return false;
    if (currentUser.permissions?.includes('all')) return true;
    return currentUser.permissions?.includes(permission);
  };

  // ✅ ROLE CHECKERS
  const isOwner = currentUser?.role === 'Owner';
  const isChef = currentUser?.role === 'Chef';
  const isWaiter = currentUser?.role === 'Waiter';
  const isCustomer = currentUser?.role === 'Customer';

  // ✅ STAFF MANAGEMENT FUNCTIONS
  const staffManagement = {
    // Create Staff
    createWaiter: async (waiterData) => await createWaiter(waiterData),
    createChef: async (chefData) => await createChef(chefData),
    
    // Get All Staff
    getAllWaiters: async () => await getAllWaiters(),
    getAllChefs: async () => await getAllChefs(),
    getAllCustomers: async () => await getUsers(),
    
    // Delete Staff
    deleteWaiter: async (waiterId) => await deleteWaiter(waiterId),
    deleteChef: async (chefId) => await deleteChef(chefId),
    
    // Promote Customers
    promoteCustomerToWaiter: async (userId, waiterData) => 
      await promoteCustomerToWaiter(userId, waiterData),
    promoteCustomerToChef: async (userId, chefData) => 
      await promoteCustomerToChef(userId, chefData),
  };

  const value = {
    currentUser,
    isAuthenticated,
    loading,
    userRoles,
    isOwner,
    isChef,
    isWaiter,
    isCustomer,
    login,
    signup,
    logout,
    switchRole,
    hasPermission,
    staffManagement
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

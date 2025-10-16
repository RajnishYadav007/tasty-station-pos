// src/components/Sidebar.jsx

import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { 
  LayoutDashboard,  // ✅ Import back
  ShoppingCart, 
  Grid3x3, 
  Utensils, 
  Users, 
  Settings, 
  HelpCircle, 
  LogOut
} from 'lucide-react';
import './Sidebar.css';

const Sidebar = () => {
  const navigate = useNavigate();
  const { currentUser, logout } = useAuth();

  const handleLogout = () => {
    if (window.confirm('Are you sure you want to logout?')) {
      logout();
      navigate('/login');
    }
  };

  // Get navigation items based on role
  const getNavigationItems = () => {
    if (!currentUser) return [];

    const role = currentUser.role;

    // Owner - Full Access (WITH DASHBOARD)
    if (role === 'Owner') {
      return [
        { path: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },  // ✅ ADDED BACK
        { path: '/order-line', icon: ShoppingCart, label: 'Order Line' },
        { path: '/manage-table', icon: Grid3x3, label: 'Manage Table' },
        { path: '/manage-dishes', icon: Utensils, label: 'Manage Dishes' },
        { path: '/customers', icon: Users, label: 'Customers' }
      ];
    }

    // Waiter - Table & Orders
    if (role === 'Waiter') {
      return [
        { path: '/manage-table', icon: Grid3x3, label: 'Manage Table' },
        { path: '/order-line', icon: ShoppingCart, label: 'Take Order' }
      ];
    }

    // Chef - ONLY Manage Dishes
    if (role === 'Chef') {
      return [
        { path: '/manage-dishes', icon: Utensils, label: 'Manage Dishes' }
      ];
    }

    // Customer - Order Only
    if (role === 'Customer') {
      return [
        { path: '/order-line', icon: ShoppingCart, label: 'Place Order' }
      ];
    }

    return [];
  };

  const navigationItems = getNavigationItems();

  if (!currentUser) return null;

  return (
    <div className="sidebar">
      <div className="sidebar-header">
        <div className="logo">🍽️</div>
        <div className="brand-info">
          <h2>Tasty</h2>
          <h2>Station</h2>
        </div>
      </div>

      {/* Role Badge */}
      <div className="sidebar-role-badge">
        <span>{currentUser.icon}</span>
        <span>{currentUser.role}</span>
      </div>

      <nav className="sidebar-nav">
        {navigationItems.map((item) => {
          const Icon = item.icon;
          
          return (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                `nav-item ${isActive ? 'active' : ''}`
              }
            >
              <Icon size={20} />
              <span>{item.label}</span>
            </NavLink>
          );
        })}
      </nav>

      <div className="sidebar-footer">
        {currentUser.role !== 'Customer' && (
          <>
            <NavLink to="/settings" className="nav-item">
              <Settings size={20} />
              <span>Settings</span>
            </NavLink>

            <NavLink to="/help" className="nav-item">
              <HelpCircle size={20} />
              <span>Help Center</span>
            </NavLink>
          </>
        )}

        <button className="nav-item logout-item" onClick={handleLogout}>
          <LogOut size={20} />
          <span>Logout</span>
        </button>
      </div>
    </div>
  );
};

export default Sidebar;

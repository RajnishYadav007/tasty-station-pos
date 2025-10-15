import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { LayoutDashboard, ShoppingCart, Users, UtensilsCrossed, Settings, HelpCircle, LogOut } from 'lucide-react';
import './Sidebar.css';

const Sidebar = () => {
  const location = useLocation();

  const menuItems = [
    { path: '/dashboard', icon: <LayoutDashboard size={20} />, label: 'Dashboard' },
    { path: '/order-line', icon: <ShoppingCart size={20} />, label: 'Order Line' },
    { path: '/manage-table', icon: <LayoutDashboard size={20} />, label: 'Manage Table' },
    { path: '/manage-dishes', icon: <UtensilsCrossed size={20} />, label: 'Manage Dishes' },
    { path: '/customers', icon: <Users size={20} />, label: 'Customers' },
  ];

  return (
    <div className="sidebar">
      <div className="sidebar-logo">
        <div className="logo-icon">🍽️</div>
        <h2>Tasty<br/>Station</h2>
      </div>
      
      <nav className="sidebar-nav">
        {menuItems.map((item) => (
          <Link
            key={item.path}
            to={item.path}
            className={`nav-item ${location.pathname === item.path ? 'active' : ''}`}
          >
            {item.icon}
            <span>{item.label}</span>
          </Link>
        ))}
      </nav>

      <div className="sidebar-footer">
        <div className="nav-item">
          <Settings size={20} />
          <span>Settings</span>
        </div>
        <div className="nav-item">
          <HelpCircle size={20} />
          <span>Help Center</span>
        </div>
        <div className="nav-item">
          <LogOut size={20} />
          <span>Logout</span>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;

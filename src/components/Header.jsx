// src/components/Header.jsx

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Search, Bell, ChevronDown, LogOut } from 'lucide-react';
import './Header.css';

const Header = () => {
  const navigate = useNavigate();
  const { currentUser, logout } = useAuth();
  const [showProfileMenu, setShowProfileMenu] = useState(false);

  // Handle logout
  const handleLogout = () => {
    setShowProfileMenu(false);
    if (window.confirm('Are you sure you want to logout?')) {
      logout();
      navigate('/login');
    }
  };

  // Get role color
  const getRoleColor = () => {
    if (!currentUser) return '#14B8A6';
    return currentUser.color || '#14B8A6';
  };

  if (!currentUser) return null;

  return (
    <div className="header">
      <div className="search-bar">
        <Search size={20} color="#9CA3AF" />
        <input 
          type="text" 
          placeholder="Search menu, orders and more" 
          className="search-input"
        />
      </div>
      
      <div className="header-right">
        {/* Current Role Badge */}
        <div className="role-badge" style={{ background: `${getRoleColor()}20`, color: getRoleColor() }}>
          {currentUser.icon} {currentUser.role}
        </div>

        {/* Notifications */}
        <button className="notification-btn">
          <Bell size={22} />
          <span className="notification-badge">3</span>
        </button>
        
        {/* User Profile with Dropdown */}
        <div className="user-profile-container">
          <div 
            className="user-profile" 
            onClick={() => setShowProfileMenu(!showProfileMenu)}
          >
            <div 
              className="user-avatar"
              style={{ background: getRoleColor() }}
            >
              {currentUser.avatar}
            </div>
            <div className="user-info">
              <h4>{currentUser.name}</h4>
              <p>{currentUser.role}</p>
            </div>
            <ChevronDown 
              size={18} 
              className={`dropdown-icon ${showProfileMenu ? 'rotate' : ''}`}
            />
          </div>

          {/* Profile Dropdown - Only Logout */}
          {showProfileMenu && (
            <div className="profile-dropdown">
              <div className="dropdown-header">
                <div 
                  className="user-avatar-large"
                  style={{ background: getRoleColor() }}
                >
                  {currentUser.avatar}
                </div>
                <div className="user-details">
                  <h4>{currentUser.name}</h4>
                  <p>
                    <span className="role-icon">{currentUser.icon}</span>
                    {currentUser.role}
                  </p>
                  <span className="user-email">{currentUser.email}</span>
                </div>
              </div>

              <div className="dropdown-footer">
                <button className="logout-btn" onClick={handleLogout}>
                  <LogOut size={16} />
                  Logout
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Overlay */}
      {showProfileMenu && (
        <div 
          className="dropdown-overlay" 
          onClick={() => setShowProfileMenu(false)}
        />
      )}
    </div>
  );
};

export default Header;

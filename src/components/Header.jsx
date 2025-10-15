import React from 'react';
import { Search, Bell } from 'lucide-react';
import './Header.css';

const Header = () => {
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
        <button className="notification-btn">
          <Bell size={22} />
          <span className="notification-badge">3</span>
        </button>
        
        <div className="user-profile">
          <div className="user-avatar">IK</div>
          <div className="user-info">
            <h4>Ibrahim Kadri</h4>
            <p>Admin</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Header;

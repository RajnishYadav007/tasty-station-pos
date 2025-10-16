// src/pages/Dashboard/Dashboard.jsx

import React, { useState, useEffect } from 'react';
import { 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  ShoppingCart, 
  Users, 
  Calendar,
  ArrowUpRight,
  ArrowDownRight,
  MoreVertical,
  Clock,
  CheckCircle,
  AlertCircle,
  RefreshCw
} from 'lucide-react';
import './Dashboard.css';

const Dashboard = () => {
  const [currentTime, setCurrentTime] = useState(new Date());
  const [refreshing, setRefreshing] = useState(false);

  // Update time every minute
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 60000);
    return () => clearInterval(timer);
  }, []);

  // Stats data with more details
  const statsData = [
    { 
      id: 1, 
      title: 'Total Revenue', 
      value: '$45,231', 
      change: '+20.1%', 
      trending: 'up', 
      icon: DollarSign, 
      bgColor: '#F0FDFA',
      iconColor: '#14B8A6',
      description: 'vs last month'
    },
    { 
      id: 2, 
      title: 'Total Orders', 
      value: '1,234', 
      change: '+15.3%', 
      trending: 'up', 
      icon: ShoppingCart, 
      bgColor: '#EFF6FF',
      iconColor: '#3B82F6',
      description: '128 today'
    },
    { 
      id: 3, 
      title: 'Total Customers', 
      value: '856', 
      change: '-2.5%', 
      trending: 'down', 
      icon: Users, 
      bgColor: '#FEF2F2',
      iconColor: '#EF4444',
      description: '45 active now'
    },
    { 
      id: 4, 
      title: 'Total Reservations', 
      value: '145', 
      change: '+8.2%', 
      trending: 'up', 
      icon: Calendar, 
      bgColor: '#F5F3FF',
      iconColor: '#A855F7',
      description: '12 upcoming'
    }
  ];

  // Recent orders with more details
  const recentOrders = [
    { 
      id: 'F0030', 
      table: '04', 
      items: 5, 
      amount: 72.00, 
      status: 'Completed', 
      time: '2 mins ago',
      customer: 'John Doe',
      paymentMethod: 'Card'
    },
    { 
      id: 'F0029', 
      table: '07', 
      items: 3, 
      amount: 45.00, 
      status: 'In Progress', 
      time: '5 mins ago',
      customer: 'Sarah Smith',
      paymentMethod: 'Cash'
    },
    { 
      id: 'F0028', 
      table: '12', 
      items: 8, 
      amount: 125.00, 
      status: 'Completed', 
      time: '12 mins ago',
      customer: 'Mike Johnson',
      paymentMethod: 'Card'
    },
    { 
      id: 'F0027', 
      table: '03', 
      items: 4, 
      amount: 58.00, 
      status: 'Pending', 
      time: '18 mins ago',
      customer: 'Emily Davis',
      paymentMethod: 'Card'
    },
    { 
      id: 'F0026', 
      table: '15', 
      items: 6, 
      amount: 95.00, 
      status: 'Completed', 
      time: '25 mins ago',
      customer: 'Robert Brown',
      paymentMethod: 'Cash'
    },
  ];

  // Quick actions
  const quickActions = [
    { id: 1, title: 'New Order', icon: '➕', color: '#14B8A6' },
    { id: 2, title: 'View Tables', icon: '🪑', color: '#3B82F6' },
    { id: 3, title: 'Add Customer', icon: '👤', color: '#A855F7' },
    { id: 4, title: 'Reports', icon: '📊', color: '#F59E0B' }
  ];

  // Top selling items
  const topItems = [
    { id: 1, name: 'Grilled Salmon', orders: 45, revenue: 675, trend: 'up' },
    { id: 2, name: 'Beef Steak', orders: 38, revenue: 1140, trend: 'up' },
    { id: 3, name: 'Pasta Carbonara', orders: 32, revenue: 384, trend: 'down' },
    { id: 4, name: 'Caesar Salad', orders: 28, revenue: 252, trend: 'up' },
  ];

  // Handle refresh
  const handleRefresh = () => {
    setRefreshing(true);
    setTimeout(() => {
      setRefreshing(false);
    }, 1000);
  };

  // Get status badge class
  const getStatusClass = (status) => {
    switch(status.toLowerCase()) {
      case 'completed':
        return 'status-completed';
      case 'in progress':
        return 'status-in-progress';
      case 'pending':
        return 'status-pending';
      default:
        return '';
    }
  };

  return (
    <div className="dashboard-container">
      {/* Header Section */}
      <div className="dashboard-header">
        <div className="header-left">
          <h1>Dashboard</h1>
          <p className="welcome-text">
            Welcome back! Here's what's happening today.
            <span className="current-time">
              <Clock size={14} />
              {currentTime.toLocaleTimeString('en-US', { 
                hour: '2-digit', 
                minute: '2-digit',
                hour12: true 
              })}
            </span>
          </p>
        </div>
        <div className="header-right">
          <button 
            className={`refresh-btn ${refreshing ? 'refreshing' : ''}`}
            onClick={handleRefresh}
          >
            <RefreshCw size={18} />
            Refresh
          </button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="stats-grid">
        {statsData.map(stat => {
          const Icon = stat.icon;
          const TrendIcon = stat.trending === 'up' ? ArrowUpRight : ArrowDownRight;
          
          return (
            <div key={stat.id} className="stat-card">
              <div className="stat-card-header">
                <div 
                  className="stat-icon" 
                  style={{ 
                    backgroundColor: stat.bgColor,
                    color: stat.iconColor 
                  }}
                >
                  <Icon size={24} />
                </div>
                <button className="stat-more-btn">
                  <MoreVertical size={18} />
                </button>
              </div>
              
              <div className="stat-content">
                <h3 className="stat-value">{stat.value}</h3>
                <p className="stat-title">{stat.title}</p>
                
                <div className="stat-footer">
                  <span className={`stat-change ${stat.trending}`}>
                    <TrendIcon size={16} />
                    {stat.change}
                  </span>
                  <span className="stat-description">{stat.description}</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Quick Actions */}
      <div className="quick-actions-section">
        <h2>Quick Actions</h2>
        <div className="quick-actions-grid">
          {quickActions.map(action => (
            <button 
              key={action.id} 
              className="quick-action-btn"
              style={{ borderColor: action.color }}
            >
              <span className="action-icon" style={{ color: action.color }}>
                {action.icon}
              </span>
              <span>{action.title}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="dashboard-content-grid">
        {/* Recent Orders */}
        <div className="dashboard-card recent-orders-card">
          <div className="card-header">
            <h2>Recent Orders</h2>
            <button className="view-all-btn">View All</button>
          </div>
          
          <div className="orders-table-container">
            <table className="orders-table">
              <thead>
                <tr>
                  <th>Order ID</th>
                  <th>Customer</th>
                  <th>Table</th>
                  <th>Items</th>
                  <th>Amount</th>
                  <th>Status</th>
                  <th>Time</th>
                </tr>
              </thead>
              <tbody>
                {recentOrders.map(order => (
                  <tr key={order.id} className="order-row">
                    <td className="order-id">#{order.id}</td>
                    <td className="customer-name">{order.customer}</td>
                    <td>Table {order.table}</td>
                    <td>{order.items}</td>
                    <td className="amount">${order.amount.toFixed(2)}</td>
                    <td>
                      <span className={`status-badge ${getStatusClass(order.status)}`}>
                        {order.status}
                      </span>
                    </td>
                    <td className="time">{order.time}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Top Selling Items */}
        <div className="dashboard-card top-items-card">
          <div className="card-header">
            <h2>Top Selling Items</h2>
            <button className="view-all-btn">View All</button>
          </div>
          
          <div className="top-items-list">
            {topItems.map((item, index) => (
              <div key={item.id} className="top-item">
                <div className="item-rank">#{index + 1}</div>
                <div className="item-details">
                  <h4>{item.name}</h4>
                  <p>{item.orders} orders • ${item.revenue}</p>
                </div>
                <div className={`item-trend ${item.trend}`}>
                  {item.trend === 'up' ? (
                    <TrendingUp size={16} />
                  ) : (
                    <TrendingDown size={16} />
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Performance Summary */}
      <div className="performance-summary">
        <div className="summary-card">
          <CheckCircle size={24} className="summary-icon success" />
          <div>
            <h3>98.5%</h3>
            <p>Order Success Rate</p>
          </div>
        </div>
        
        <div className="summary-card">
          <Clock size={24} className="summary-icon warning" />
          <div>
            <h3>18 mins</h3>
            <p>Avg. Preparation Time</p>
          </div>
        </div>
        
        <div className="summary-card">
          <Users size={24} className="summary-icon info" />
          <div>
            <h3>4.8/5.0</h3>
            <p>Customer Satisfaction</p>
          </div>
        </div>
        
        <div className="summary-card">
          <AlertCircle size={24} className="summary-icon error" />
          <div>
            <h3>3</h3>
            <p>Pending Actions</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;

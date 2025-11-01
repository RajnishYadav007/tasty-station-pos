// src/pages/Dashboard/Dashboard.jsx

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
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
  RefreshCw,
  Plus,
  Eye,
  UserPlus,
  BarChart3
} from 'lucide-react';
import { useOrders } from '../context/OrderContext';
import './Dashboard.css';

const Dashboard = () => {
  const navigate = useNavigate();
  const { orders } = useOrders();
  const [currentTime, setCurrentTime] = useState(new Date());
  const [refreshing, setRefreshing] = useState(false);

  // Update time every second
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // ✅ Calculate real statistics from orders
  const calculateStats = () => {
    const today = new Date().toDateString();
    
    // Filter today's orders
    const todayOrders = orders.filter(order =>
      new Date(order.createdAt).toDateString() === today
    );

    // Calculate total revenue (with tax)
    const calculateRevenue = (orderList) => {
      return orderList.reduce((sum, order) => {
        if (!order.items) return sum;
        const orderTotal = order.items.reduce((itemSum, item) => {
          return itemSum + (item.price * item.quantity);
        }, 0);
        return sum + (orderTotal * 1.18); // Include 18% tax
      }, 0);
    };

    const totalRevenue = calculateRevenue(orders);
    const todayRevenue = calculateRevenue(todayOrders);

    // Unique customers count
    const uniqueCustomers = new Set(orders.map(o => o.customerName)).size;

    // Active customers now (orders in progress today)
    const activeNow = todayOrders.filter(order =>
      order.items?.some(item => ['in-kitchen', 'wait', 'ready'].includes(item.status))
    ).length;

    // Pending actions count
    const pendingActions = orders.filter(order =>
      order.items?.some(item => ['in-kitchen', 'wait', 'ready'].includes(item.status))
    ).length;

    return {
      totalRevenue,
      todayRevenue,
      totalOrders: orders.length,
      todayOrders: todayOrders.length,
      uniqueCustomers,
      activeNow,
      pendingActions
    };
  };

  const stats = calculateStats();

  // ✅ Stats data with real values - Only 3 cards
  const statsData = [
    { 
      id: 1, 
      title: 'Total Revenue', 
      value: `₹${Math.round(stats.totalRevenue).toLocaleString()}`, 
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
      value: stats.totalOrders.toLocaleString(), 
      change: '+15.3%', 
      trending: 'up', 
      icon: ShoppingCart, 
      bgColor: '#EFF6FF',
      iconColor: '#3B82F6',
      description: `${stats.todayOrders} today`
    },
    { 
      id: 3, 
      title: 'Total Customers', 
      value: stats.uniqueCustomers, 
      change: '-2.5%', 
      trending: 'down', 
      icon: Users, 
      bgColor: '#FEF2F2',
      iconColor: '#EF4444',
      description: `${stats.activeNow} active now`
    }
  ];

  // ✅ Get real recent orders (last 5)
  const recentOrders = orders
    .slice()
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
    .slice(0, 5)
    .map(order => {
      const total = order.items.reduce((sum, item) => 
        sum + (item.price * item.quantity), 0
      );
      
      // Determine status
      let status = 'Pending';
      if (order.items.every(item => item.status === 'served')) {
        status = 'Completed';
      } else if (order.items.some(item => item.status === 'ready')) {
        status = 'In Progress';
      } else if (order.items.some(item => ['wait', 'in-kitchen'].includes(item.status))) {
        status = 'In Progress';
      }

      // Calculate time ago
      const now = new Date();
      const created = new Date(order.createdAt);
      const diffMinutes = Math.floor((now - created) / 60000);
      let timeAgo = 'Just now';
      
      if (diffMinutes >= 1 && diffMinutes < 60) {
        timeAgo = `${diffMinutes} mins ago`;
      } else if (diffMinutes >= 60) {
        const hours = Math.floor(diffMinutes / 60);
        timeAgo = `${hours} hour${hours > 1 ? 's' : ''} ago`;
      }

      return {
        id: order.id.slice(-5),
        table: order.tableNumber,
        items: order.items.length,
        amount: total,
        status,
        time: timeAgo,
        customer: order.customerName
      };
    });

  // ✅ Calculate real top selling items
  const getTopSellingItems = () => {
    const itemCounts = {};
    
    orders.forEach(order => {
      order.items?.forEach(item => {
        if (itemCounts[item.name]) {
          itemCounts[item.name].count += item.quantity;
          itemCounts[item.name].revenue += item.price * item.quantity;
        } else {
          itemCounts[item.name] = {
            name: item.name,
            count: item.quantity,
            revenue: item.price * item.quantity
          };
        }
      });
    });

    return Object.values(itemCounts)
      .sort((a, b) => b.count - a.count)
      .slice(0, 4)
      .map(item => ({
        id: item.name,
        name: item.name,
        orders: item.count,
        revenue: Math.round(item.revenue),
        trend: 'up'
      }));
  };

  const topItems = getTopSellingItems();

  // Quick actions with navigation
  const quickActions = [
    { 
      id: 1, 
      title: 'New Order', 
      icon: Plus, 
      color: '#14B8A6',
      action: () => navigate('/manage-table')
    },
    { 
      id: 2, 
      title: 'View Tables', 
      icon: Eye, 
      color: '#3B82F6',
      action: () => navigate('/manage-table')
    },
    { 
      id: 3, 
      title: 'Add Customer', 
      icon: UserPlus, 
      color: '#A855F7',
      action: () => navigate('/customers')
    },
    { 
      id: 4, 
      title: 'Reports', 
      icon: BarChart3, 
      color: '#F59E0B',
      action: () => navigate('/customers')
    }
  ];

  // ✅ Calculate performance metrics
  const getSuccessRate = () => {
    if (orders.length === 0) return 0;
    const completed = orders.filter(order =>
      order.items?.every(item => item.status === 'served')
    ).length;
    return ((completed / orders.length) * 100).toFixed(1);
  };

  const getAvgPrepTime = () => {
    const completedOrders = orders.filter(order =>
      order.items?.every(item => item.status === 'served')
    );
    
    if (completedOrders.length === 0) return 0;
    
    const totalMinutes = completedOrders.reduce((sum, order) => {
      const created = new Date(order.createdAt);
      const updated = new Date(order.updatedAt || order.createdAt);
      return sum + Math.floor((updated - created) / 60000);
    }, 0);
    
    return Math.floor(totalMinutes / completedOrders.length);
  };

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
          {quickActions.map(action => {
            const ActionIcon = action.icon;
            return (
              <button 
                key={action.id} 
                className="quick-action-btn"
                style={{ borderColor: action.color }}
                onClick={action.action}
              >
                <ActionIcon size={20} style={{ color: action.color }} />
                <span>{action.title}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="dashboard-content-grid">
        {/* Recent Orders */}
        <div className="dashboard-card recent-orders-card">
          <div className="card-header">
            <h2>Recent Orders</h2>
            <button className="view-all-btn" onClick={() => navigate('/manage-table')}>
              View All
            </button>
          </div>
          
          <div className="orders-table-container">
            {recentOrders.length === 0 ? (
              <div className="empty-state">
                <ShoppingCart size={48} />
                <p>No orders yet</p>
                <span>Orders will appear here once created</span>
              </div>
            ) : (
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
                      <td className="amount">₹{order.amount.toFixed(2)}</td>
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
            )}
          </div>
        </div>

        {/* Top Selling Items */}
        <div className="dashboard-card top-items-card">
          <div className="card-header">
            <h2>Top Selling Items</h2>
            <button className="view-all-btn" onClick={() => navigate('/menu')}>
              View All
            </button>
          </div>
          
          <div className="top-items-list">
            {topItems.length === 0 ? (
              <div className="empty-state">
                <BarChart3 size={48} />
                <p>No data yet</p>
                <span>Top items will appear after orders</span>
              </div>
            ) : (
              topItems.map((item, index) => (
                <div key={item.id} className="top-item">
                  <div className="item-rank">#{index + 1}</div>
                  <div className="item-details">
                    <h4>{item.name}</h4>
                    <p>{item.orders} orders • ₹{item.revenue}</p>
                  </div>
                  <div className={`item-trend ${item.trend}`}>
                    {item.trend === 'up' ? (
                      <TrendingUp size={16} />
                    ) : (
                      <TrendingDown size={16} />
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Performance Summary */}
      <div className="performance-summary">
        <div className="summary-card">
          <CheckCircle size={24} className="summary-icon success" />
          <div>
            <h3>{getSuccessRate()}%</h3>
            <p>Order Success Rate</p>
          </div>
        </div>
        
        <div className="summary-card">
          <Clock size={24} className="summary-icon warning" />
          <div>
            <h3>{getAvgPrepTime()} mins</h3>
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
            <h3>{stats.pendingActions}</h3>
            <p>Pending Actions</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;

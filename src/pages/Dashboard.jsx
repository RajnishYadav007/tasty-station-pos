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

// ✅ Import APIs
import { getOrders, getOrderStatistics, getTodaysOrders } from '../api/orderApi';
import { getTotalRevenue, getTodaysRevenue, getBillStatistics } from '../api/billApi';
import { getDishes } from '../api/dishApi';
import { getUsers } from '../api/userApi';
import { getOrderDetailsByOrderId } from '../api/orderDetailsApi';

import './Dashboard.css';

const Dashboard = () => {
  const navigate = useNavigate();
  const [currentTime, setCurrentTime] = useState(new Date());
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);
  
  // ✅ State for API data
  const [stats, setStats] = useState({
    totalRevenue: 0,
    todayRevenue: 0,
    totalOrders: 0,
    todayOrders: 0,
    uniqueCustomers: 0,
    activeNow: 0,
    pendingActions: 0
  });
  const [recentOrders, setRecentOrders] = useState([]);
  const [topItems, setTopItems] = useState([]);

  // Update time every second
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // ✅ Load all dashboard data
  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      
      // Fetch all data in parallel
      const [
        ordersData,
        orderStats,
        todaysOrdersData,
        totalRevenue,
        todayRevenue,
        usersData,
        dishesData
      ] = await Promise.all([
        getOrders(),
        getOrderStatistics(),
        getTodaysOrders(),
        getTotalRevenue(),
        getTodaysRevenue(),
        getUsers(),
        getDishes()
      ]);

      // Calculate statistics
      const calculatedStats = {
        totalRevenue: totalRevenue || 0,
        todayRevenue: todayRevenue || 0,
        totalOrders: ordersData.length,
        todayOrders: todaysOrdersData.length,
        uniqueCustomers: usersData.length,
        activeNow: todaysOrdersData.filter(o => o.status === 'pending').length,
        pendingActions: orderStats.pending || 0
      };

      setStats(calculatedStats);

      // Process recent orders
      await processRecentOrders(ordersData.slice(0, 5));

      // Calculate top selling items
      await calculateTopItems(ordersData);

    } catch (error) {
      console.error('Error loading dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  // ✅ Process recent orders with details
  const processRecentOrders = async (orders) => {
    try {
      const processedOrders = await Promise.all(
        orders.map(async (order) => {
          try {
            // Get order details
            const details = await getOrderDetailsByOrderId(order.order_id);
            
            // Calculate total
            const total = details.reduce((sum, item) => 
              sum + (parseFloat(item.price) * parseInt(item.quantity)), 0
            );

            // Calculate time ago
            const now = new Date();
            const created = new Date(order.order_date);
            const diffMinutes = Math.floor((now - created) / 60000);
            let timeAgo = 'Just now';
            
            if (diffMinutes >= 1 && diffMinutes < 60) {
              timeAgo = `${diffMinutes} mins ago`;
            } else if (diffMinutes >= 60) {
              const hours = Math.floor(diffMinutes / 60);
              timeAgo = `${hours} hour${hours > 1 ? 's' : ''} ago`;
            }

            return {
              id: order.order_id.toString().slice(-5),
              table: 'Table 1', // You can link with table data if needed
              items: details.length,
              amount: total,
              status: order.status === 'completed' ? 'Completed' : order.status === 'pending' ? 'Pending' : 'In Progress',
              time: timeAgo,
              customer: `Guest - Table ${order.order_id}`
            };
          } catch (err) {
            console.error('Error processing order:', err);
            return null;
          }
        })
      );

      setRecentOrders(processedOrders.filter(o => o !== null));
    } catch (error) {
      console.error('Error processing recent orders:', error);
    }
  };

  // ✅ Calculate top selling items from orders
  const calculateTopItems = async (orders) => {
    try {
      const itemCounts = {};
      
      // Fetch order details for all orders
      await Promise.all(
        orders.map(async (order) => {
          try {
            const details = await getOrderDetailsByOrderId(order.order_id);
            
            details.forEach(item => {
              const dishId = item.dish_id;
              if (!itemCounts[dishId]) {
                itemCounts[dishId] = {
                  id: dishId,
                  name: `Dish #${dishId}`, // You can fetch dish name from Dish table
                  count: 0,
                  revenue: 0
                };
              }
              itemCounts[dishId].count += parseInt(item.quantity);
              itemCounts[dishId].revenue += parseFloat(item.price) * parseInt(item.quantity);
            });
          } catch (err) {
            console.error('Error fetching order details:', err);
          }
        })
      );

      // Sort and get top 4
      const topItemsArray = Object.values(itemCounts)
        .sort((a, b) => b.count - a.count)
        .slice(0, 4)
        .map(item => ({
          id: item.id,
          name: item.name,
          orders: item.count,
          revenue: Math.round(item.revenue),
          trend: 'up'
        }));

      setTopItems(topItemsArray);
    } catch (error) {
      console.error('Error calculating top items:', error);
    }
  };

  // ✅ Stats data with real values
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

  // Handle refresh
  const handleRefresh = async () => {
    setRefreshing(true);
    await loadDashboardData();
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

  if (loading) {
    return (
      <div className="dashboard-container">
        <div style={{ textAlign: 'center', padding: '60px', color: '#666' }}>
          Loading dashboard...
        </div>
      </div>
    );
  }

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
                      <td>{order.table}</td>
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
                    <TrendingUp size={16} />
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
            <h3>100.0%</h3>
            <p>Order Success Rate</p>
          </div>
        </div>
        
        <div className="summary-card">
          <Clock size={24} className="summary-icon warning" />
          <div>
            <h3>10 mins</h3>
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

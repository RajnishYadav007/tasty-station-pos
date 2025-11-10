// src/pages/Dashboard/Dashboard.jsx - ✅ FULLY OPTIMIZED
import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-toastify';
import { 
  TrendingUp, 
  DollarSign, 
  ShoppingCart, 
  Users, 
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
  BarChart3,
  LogOut,
  Trash2,
  Mail,
  Phone
} from 'lucide-react';

import { getOrders, getOrderStatistics, getTodaysOrders } from '../api/orderApi';
import { getTotalRevenue, getTodaysRevenue, getLastMonthRevenue } from '../api/billApi';
import { getDishes } from '../api/dishApi';
import { getUsers } from '../api/userApi';
import { getOrderDetailsByOrderId } from '../api/orderDetailsApi';
import { supabase } from '../api/supabaseClient';

import './Dashboard.css';

const Dashboard = () => {
  const navigate = useNavigate();
  const { currentUser, isOwner, logout, staffManagement } = useAuth();

  const [currentTime, setCurrentTime] = useState(new Date());
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');

  const [stats, setStats] = useState({
    totalRevenue: 0,
    todayRevenue: 0,
    totalOrders: 0,
    todayOrders: 0,
    uniqueCustomers: 0,
    activeNow: 0,
    pendingActions: 0,
    revenueChange: 0,
    revenuePercentage: '+0%'
  });

  const [recentOrders, setRecentOrders] = useState([]);
  const [topItems, setTopItems] = useState([]);

  const [staffData, setStaffData] = useState({
    waiters: [],
    chefs: []
  });

  const [staffFormData, setStaffFormData] = useState({
    name: '',
    email: '',
    password: '',
    phone: '',
    specialization: ''
  });
  const [staffType, setStaffType] = useState('waiter');
  const [staffLoading, setStaffLoading] = useState(false);

  // ✅ ADD: Refs to track if data has been loaded
  const overviewDataLoaded = useRef(false);
  const staffDataLoaded = useRef(false);
  const isLoadingRef = useRef(false);

  // Update time every second
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // ✅ OPTIMIZED: Load dashboard data with caching
  const loadDashboardData = async () => {
    // Prevent duplicate calls
    if (isLoadingRef.current) {
      console.log('⏳ Already loading, skipping...');
      return;
    }

    isLoadingRef.current = true;
    setLoading(true);

    try {
      console.log('📊 Loading dashboard data...');
      
      const [
        ordersData,
        orderStats,
        todaysOrdersData,
        totalRevenue,
        todayRevenue,
        usersData,
        lastMonthRevenue
      ] = await Promise.all([
        getOrders(),
        getOrderStatistics(),
        getTodaysOrders(),
        getTotalRevenue(),
        getTodaysRevenue(),
        getUsers(),
        getDishes(),
        getLastMonthRevenue()
      ]);

      let changePercentage = '+0%';
      let isTrendingUp = true;

      if (lastMonthRevenue > 0) {
        const change = ((totalRevenue - lastMonthRevenue) / lastMonthRevenue) * 100;
        changePercentage = `${change >= 0 ? '+' : ''}${change.toFixed(1)}%`;
        isTrendingUp = change >= 0;
      } else if (totalRevenue > 0) {
        changePercentage = '+100%';
        isTrendingUp = true;
      }

      const calculatedStats = {
        totalRevenue: totalRevenue || 0,
        todayRevenue: todayRevenue || 0,
        totalOrders: ordersData.length,
        todayOrders: todaysOrdersData.length,
        uniqueCustomers: usersData.length,
        activeNow: todaysOrdersData.filter(o => o.status === 'in-kitchen').length,
        pendingActions: orderStats.pending || 0,
        revenueChange: isTrendingUp,
        revenuePercentage: changePercentage
      };

      setStats(calculatedStats);
      await processRecentOrders(ordersData.slice(0, 5));
      await calculateTopItems();
      
      // ✅ Mark as loaded
      overviewDataLoaded.current = true;
      console.log('✅ Dashboard data loaded successfully');
      
    } catch (error) {
      console.error('❌ Error loading dashboard data:', error);
      toast.error('❌ Error loading dashboard data');
    } finally {
      setLoading(false);
      isLoadingRef.current = false;
    }
  };

  // ✅ OPTIMIZED: Load staff data with caching
  const loadStaffData = async () => {
    if (!isOwner) return;
    
    // Prevent duplicate calls
    if (isLoadingRef.current) {
      console.log('⏳ Already loading, skipping...');
      return;
    }

    isLoadingRef.current = true;
    setLoading(true);

    try {
      console.log('👥 Loading staff data...');
      
      const waiters = await staffManagement.getAllWaiters();
      const chefs = await staffManagement.getAllChefs();
      
      setStaffData({
        waiters: waiters || [],
        chefs: chefs || []
      });
      
      // ✅ Mark as loaded
      staffDataLoaded.current = true;
      console.log('✅ Staff data loaded successfully');
      
    } catch (error) {
      console.error('❌ Error loading staff data:', error);
      toast.error('❌ Error loading staff data');
    } finally {
      setLoading(false);
      isLoadingRef.current = false;
    }
  };

  // ✅ OPTIMIZED: Load data only ONCE per tab
  useEffect(() => {
    if (activeTab === 'overview' && !overviewDataLoaded.current) {
      loadDashboardData();
    } else if (activeTab === 'staff' && isOwner && !staffDataLoaded.current) {
      loadStaffData();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTab, isOwner]);

  const processRecentOrders = async (orders) => {
    try {
      const processedOrders = await Promise.all(
        orders.map(async (order) => {
          try {
            const details = await getOrderDetailsByOrderId(order.order_id);
            const total = details.reduce((sum, item) =>
              sum + (parseFloat(item.price) * parseInt(item.quantity)), 0
            );
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

            let statusText = 'In Kitchen';
            if (order.status === 'completed') statusText = 'Completed';
            else if (order.status === 'in-kitchen') statusText = 'In Kitchen';
            else if (order.status === 'ready') statusText = 'Ready';
            else if (order.status === 'served') statusText = 'Served';

            return {
              id: order.order_id.toString().slice(-5),
              table: `Table ${order.table_number || 1}`,
              items: details.length,
              amount: total,
              status: statusText,
              time: timeAgo,
              customer: order.customer_name || `Guest - Table ${order.order_id}`
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

  const calculateTopItems = async () => {
    try {
      const { data: orderDetails, error } = await supabase
        .from('Order_Details')
        .select(`
          dish_id,
          quantity,
          price,
          Dish (
            dish_id,
            dish_name
          )
        `);

      if (error) {
        console.error('❌ Supabase Error:', error);
        setTopItems([]);
        return;
      }

      if (!orderDetails || orderDetails.length === 0) {
        setTopItems([]);
        return;
      }

      const dishStats = {};

      orderDetails.forEach(item => {
        const dishId = item.dish_id;
        const dishName = item.Dish?.dish_name || `Dish #${dishId}`;
        if (!dishStats[dishId]) {
          dishStats[dishId] = {
            id: dishId,
            name: dishName,
            orders: 0,
            revenue: 0
          };
        }
        dishStats[dishId].orders += parseInt(item.quantity) || 1;
        dishStats[dishId].revenue += (parseFloat(item.price) || 0) * (parseInt(item.quantity) || 1);
      });

      const topItemsArray = Object.values(dishStats)
        .sort((a, b) => b.orders - a.orders)
        .slice(0, 4)
        .map(item => ({
          ...item,
          revenue: Math.round(item.revenue),
          trend: 'up'
        }));

      setTopItems(topItemsArray);
    } catch (error) {
      console.error('❌ Error calculating top items:', error);
      setTopItems([]);
    }
  };

  const handleCreateStaff = async (e) => {
    e.preventDefault();
    
    if (!staffFormData.name || !staffFormData.email || !staffFormData.password || !staffFormData.phone) {
      toast.warning('⚠️ Please fill in all fields');
      return;
    }

    setStaffLoading(true);

    try {
      let result;
      
      if (staffType === 'waiter') {
        result = await staffManagement.createWaiter(staffFormData);
      } else if (staffType === 'chef') {
        result = await staffManagement.createChef(staffFormData);
      }

      if (result.success) {
        toast.success(`✅ ${staffType} created successfully!`);
        setStaffFormData({ name: '', email: '', password: '', phone: '', specialization: '' });
        
        // ✅ Reload staff data after creating new staff
        staffDataLoaded.current = false;
        loadStaffData();
      } else {
        toast.error(result.message);
      }
    } catch (error) {
      console.error('Error creating staff:', error);
      toast.error('❌ Error creating staff');
    } finally {
      setStaffLoading(false);
    }
  };

  const handleDeleteWaiter = async (waiterId) => {
    if (window.confirm('Are you sure you want to delete this waiter?')) {
      try {
        const result = await staffManagement.deleteWaiter(waiterId);
        if (result.success) {
          toast.success('✅ Waiter deleted successfully!');
          
          // ✅ Reload staff data after deletion
          staffDataLoaded.current = false;
          loadStaffData();
        } else {
          toast.error(result.message);
        }
      } catch (error) {
        console.error('Error deleting waiter:', error);
        toast.error('❌ Error deleting waiter');
      }
    }
  };

  const handleDeleteChef = async (chefId) => {
    if (window.confirm('Are you sure you want to delete this chef?')) {
      try {
        const result = await staffManagement.deleteChef(chefId);
        if (result.success) {
          toast.success('✅ Chef deleted successfully!');
          
          // ✅ Reload staff data after deletion
          staffDataLoaded.current = false;
          loadStaffData();
        } else {
          toast.error(result.message);
        }
      } catch (error) {
        console.error('Error deleting chef:', error);
        toast.error('❌ Error deleting chef');
      }
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  // ✅ REFRESH: Manually reload data
  const handleRefresh = async () => {
    setRefreshing(true);
    
    // Reset cache flags
    if (activeTab === 'overview') {
      overviewDataLoaded.current = false;
      await loadDashboardData();
    } else if (activeTab === 'staff') {
      staffDataLoaded.current = false;
      await loadStaffData();
    }
    
    setTimeout(() => {
      setRefreshing(false);
      toast.success('✅ Data refreshed!');
    }, 500);
  };

  const getStatusClass = (status) => {
    switch(status.toLowerCase()) {
      case 'completed':
        return 'status-completed';
      case 'in kitchen':
        return 'status-in-progress';
      case 'ready':
        return 'status-ready';
      case 'served':
        return 'status-served';
      default:
        return '';
    }
  };

  // ✅ DYNAMIC STATS DATA
  const statsData = [
    { 
      id: 1, 
      title: 'Total Revenue', 
      value: `₹${Math.round(stats.totalRevenue).toLocaleString()}`, 
      change: stats.revenuePercentage,
      trending: stats.revenueChange ? 'up' : 'down',
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

  if (!isOwner) {
    return (
      <div className="dashboard-container">
        <div style={{ textAlign: 'center', padding: '60px', color: '#666' }}>
          ⛔ Access Denied! Only Admin can access Dashboard.
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="dashboard-container">
        <div style={{ textAlign: 'center', padding: '60px', color: '#666' }}>
          <div className="spinner"></div>
          Loading dashboard...
        </div>
      </div>
    );
  }

  return (
    <div className="dashboard-container">
      {/* Header */}
      <div className="dashboard-header">
        <div className="header-left">
          <h1>🏨 Admin Dashboard</h1>
          <p className="welcome-text">
            Welcome back, {currentUser?.name}! 
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
            disabled={refreshing}
          >
            <RefreshCw size={18} />
            Refresh
          </button>
          
          <button 
            className="logout-btn"
            onClick={handleLogout}
            title="Logout"
          >
            <LogOut size={18} />
          </button>
        </div>
      </div>

      {/* TAB NAVIGATION */}
      <div className="dashboard-tabs">
        <button 
          className={`tab-btn ${activeTab === 'overview' ? 'active' : ''}`}
          onClick={() => setActiveTab('overview')}
        >
          <BarChart3 size={18} />
          Overview
        </button>
        
        <button 
          className={`tab-btn ${activeTab === 'staff' ? 'active' : ''}`}
          onClick={() => setActiveTab('staff')}
        >
          <Users size={18} />
          Staff Management
        </button>
      </div>

      {/* OVERVIEW TAB */}
      {activeTab === 'overview' && (
        <div className="tab-content">
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

          {/* Main Content */}
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
      )}

      {/* STAFF MANAGEMENT TAB */}
      {activeTab === 'staff' && (
        <div className="tab-content staff-management-content">
          <div className="staff-management-grid">
            {/* Create New Staff */}
            <div className="dashboard-card create-staff-card">
              <div className="card-header">
                <h2>➕ Create New Staff</h2>
              </div>

              <form onSubmit={handleCreateStaff} className="staff-form">
                <div className="form-group">
                  <label>Staff Type</label>
                  <select 
                    value={staffType} 
                    onChange={(e) => setStaffType(e.target.value)}
                    className="form-input"
                  >
                    <option value="waiter">Waiter 🍽️</option>
                    <option value="chef">Chef 👨‍🍳</option>
                  </select>
                </div>

                <div className="form-group">
                  <label>Full Name</label>
                  <input
                    type="text"
                    placeholder="Enter name"
                    value={staffFormData.name}
                    onChange={(e) => setStaffFormData({...staffFormData, name: e.target.value})}
                    className="form-input"
                    required
                  />
                </div>

                <div className="form-group">
                  <label>Email</label>
                  <input
                    type="email"
                    placeholder="Enter email"
                    value={staffFormData.email}
                    onChange={(e) => setStaffFormData({...staffFormData, email: e.target.value})}
                    className="form-input"
                    required
                  />
                </div>

                <div className="form-group">
                  <label>Password</label>
                  <input
                    type="text"
                    placeholder="Enter password"
                    value={staffFormData.password}
                    onChange={(e) => setStaffFormData({...staffFormData, password: e.target.value})}
                    className="form-input"
                    required
                  />
                </div>

                <div className="form-group">
                  <label>Phone</label>
                  <input
                    type="tel"
                    placeholder="Enter phone"
                    value={staffFormData.phone}
                    onChange={(e) => setStaffFormData({...staffFormData, phone: e.target.value})}
                    className="form-input"
                    required
                  />
                </div>

                {staffType === 'chef' && (
                  <div className="form-group">
                    <label>Specialization</label>
                    <input
                      type="text"
                      placeholder="e.g., Indian, Chinese"
                      value={staffFormData.specialization}
                      onChange={(e) => setStaffFormData({...staffFormData, specialization: e.target.value})}
                      className="form-input"
                    />
                  </div>
                )}

                <button 
                  type="submit" 
                  className="btn-primary"
                  disabled={staffLoading}
                >
                  {staffLoading ? 'Creating...' : `Create ${staffType}`}
                </button>
              </form>
            </div>

            {/* Staff Overview */}
            <div className="dashboard-card staff-count-card">
              <div className="card-header">
                <h2>👥 Staff Overview</h2>
              </div>

              {/* Summary Cards */}
              <div className="staff-count-container">
                <div className="staff-count-item">
                  <div className="staff-count-icon waiter-icon">🍽️</div>
                  <div className="staff-count-info">
                    <h3 className="staff-count-number">{staffData.waiters.length}</h3>
                    <p className="staff-count-label">Waiters</p>
                  </div>
                </div>

                <div className="staff-count-item">
                  <div className="staff-count-icon chef-icon">👨‍🍳</div>
                  <div className="staff-count-info">
                    <h3 className="staff-count-number">{staffData.chefs.length}</h3>
                    <p className="staff-count-label">Chefs</p>
                  </div>
                </div>

                <div className="staff-count-item total">
                  <div className="staff-count-icon total-icon">👥</div>
                  <div className="staff-count-info">
                    <h3 className="staff-count-number">{staffData.waiters.length + staffData.chefs.length}</h3>
                    <p className="staff-count-label">Total Staff</p>
                  </div>
                </div>
              </div>

              {/* Waiters List */}
              {staffData.waiters.length > 0 && (
                <div className="staff-list-section">
                  <h3 className="staff-list-title">🍽️ Waiters</h3>
                  <div className="staff-list">
                    {staffData.waiters.map(waiter => (
                      <div key={waiter.waiter_id} className="staff-item">
                        <div className="staff-avatar">🍽️</div>
                        <div className="staff-item-info">
                          <h4>{waiter.waiter_name}</h4>
                          <div className="staff-detail">
                            <Mail size={14} /> {waiter.email}
                          </div>
                          {waiter.phone && (
                            <div className="staff-detail">
                              <Phone size={14} /> {waiter.phone}
                            </div>
                          )}
                        </div>
                        <button 
                          className="btn-delete-staff"
                          onClick={() => handleDeleteWaiter(waiter.waiter_id)}
                          title="Delete waiter"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Chefs List */}
              {staffData.chefs.length > 0 && (
                <div className="staff-list-section">
                  <h3 className="staff-list-title">👨‍🍳 Chefs</h3>
                  <div className="staff-list">
                    {staffData.chefs.map(chef => (
                      <div key={chef.chef_id} className="staff-item">
                        <div className="staff-avatar">👨‍🍳</div>
                        <div className="staff-item-info">
                          <h4>{chef.chef_name}</h4>
                          <div className="staff-detail">
                            <Mail size={14} /> {chef.email}
                          </div>
                          {chef.phone && (
                            <div className="staff-detail">
                              <Phone size={14} /> {chef.phone}
                            </div>
                          )}
                          {chef.specialization && (
                            <div className="staff-detail">
                              <span className="badge">{chef.specialization}</span>
                            </div>
                          )}
                        </div>
                        <button 
                          className="btn-delete-staff"
                          onClick={() => handleDeleteChef(chef.chef_id)}
                          title="Delete chef"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {staffData.waiters.length === 0 && staffData.chefs.length === 0 && (
                <div style={{ textAlign: 'center', padding: '40px 20px', color: '#999' }}>
                  <Users size={48} style={{ marginBottom: '12px', opacity: 0.3 }} />
                  <p>No staff members yet</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;

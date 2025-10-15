import React from 'react';
import { TrendingUp, TrendingDown, DollarSign, ShoppingCart, Users, Calendar } from 'lucide-react';
import './Dashboard.css';

const Dashboard = () => {
  const statsData = [
    { id: 1, title: 'Total Revenue', value: '$45,231', change: '+20.1%', trending: 'up', icon: DollarSign, bgColor: '#D4F4DD' },
    { id: 2, title: 'Total Orders', value: '1,234', change: '+15.3%', trending: 'up', icon: ShoppingCart, bgColor: '#DBEAFE' },
    { id: 3, title: 'Total Customers', value: '856', change: '-2.5%', trending: 'down', icon: Users, bgColor: '#FFE4E4' },
    { id: 4, title: 'Total Reservations', value: '145', change: '+8.2%', trending: 'up', icon: Calendar, bgColor: '#E8D4F4' }
  ];

  const recentOrders = [
    { id: 'F0030', table: '04', items: 5, amount: 72.00, status: 'Completed', time: '2 mins ago' },
    { id: 'F0029', table: '07', items: 3, amount: 45.00, status: 'In Progress', time: '5 mins ago' },
    { id: 'F0028', table: '12', items: 8, amount: 125.00, status: 'Completed', time: '12 mins ago' },
  ];

  return (
    <div className="dashboard-container">
      <div className="dashboard-header">
        <div>
          <h1>Dashboard</h1>
          <p>Welcome back! Here's what's happening today.</p>
        </div>
      </div>

      <div className="stats-grid">
        {statsData.map(stat => {
          const Icon = stat.icon;
          return (
            <div key={stat.id} className="stat-card" style={{ backgroundColor: stat.bgColor }}>
              <div className="stat-icon">
                <Icon size={24} />
              </div>
              <h3>{stat.value}</h3>
              <p>{stat.title}</p>
              <span className={stat.trending}>{stat.change}</span>
            </div>
          );
        })}
      </div>

      <div className="recent-orders">
        <h2>Recent Orders</h2>
        <table>
          <thead>
            <tr>
              <th>Order ID</th>
              <th>Table</th>
              <th>Items</th>
              <th>Amount</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {recentOrders.map(order => (
              <tr key={order.id}>
                <td>#{order.id}</td>
                <td>Table {order.table}</td>
                <td>{order.items}</td>
                <td>${order.amount}</td>
                <td><span className="status">{order.status}</span></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Dashboard;

// src/pages/Customers/Customers.jsx

import React, { useState } from 'react';
import { 
  Search, 
  Plus, 
  Edit2, 
  Trash2, 
  Phone, 
  Mail, 
  MapPin,
  Calendar,
  DollarSign,
  ShoppingBag,
  X,
  Check,
  Eye,
  Filter,
  Download,
  TrendingUp,
  Star,
  Users
} from 'lucide-react';
import './Customers.css';

const Customers = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFilter, setSelectedFilter] = useState('All');
  const [showAddModal, setShowAddModal] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState(null);

  const [customers, setCustomers] = useState([
    {
      id: 1,
      name: 'Sarah Johnson',
      email: 'sarah.j@email.com',
      phone: '+1 (555) 123-4567',
      address: '123 Main St, New York, NY',
      joinDate: '2024-01-15',
      totalOrders: 24,
      totalSpent: 1450.00,
      status: 'VIP',
      lastVisit: '2 days ago',
      avatar: '👩‍💼'
    },
    {
      id: 2,
      name: 'Michael Chen',
      email: 'mchen@email.com',
      phone: '+1 (555) 234-5678',
      address: '456 Oak Ave, Los Angeles, CA',
      joinDate: '2024-02-20',
      totalOrders: 18,
      totalSpent: 980.50,
      status: 'Regular',
      lastVisit: '1 week ago',
      avatar: '👨‍💼'
    },
    {
      id: 3,
      name: 'Emily Rodriguez',
      email: 'emily.r@email.com',
      phone: '+1 (555) 345-6789',
      address: '789 Pine Rd, Chicago, IL',
      joinDate: '2024-03-10',
      totalOrders: 35,
      totalSpent: 2100.75,
      status: 'VIP',
      lastVisit: 'Today',
      avatar: '👩‍🦱'
    },
    {
      id: 4,
      name: 'David Kim',
      email: 'david.kim@email.com',
      phone: '+1 (555) 456-7890',
      address: '321 Elm St, Houston, TX',
      joinDate: '2024-01-05',
      totalOrders: 12,
      totalSpent: 650.00,
      status: 'Regular',
      lastVisit: '3 days ago',
      avatar: '👨‍💻'
    },
    {
      id: 5,
      name: 'Jessica Williams',
      email: 'jwilliams@email.com',
      phone: '+1 (555) 567-8901',
      address: '654 Maple Dr, Phoenix, AZ',
      joinDate: '2024-04-12',
      totalOrders: 8,
      totalSpent: 420.00,
      status: 'New',
      lastVisit: 'Yesterday',
      avatar: '👩‍🎨'
    },
    {
      id: 6,
      name: 'Robert Taylor',
      email: 'rtaylor@email.com',
      phone: '+1 (555) 678-9012',
      address: '987 Cedar Ln, Miami, FL',
      joinDate: '2024-02-28',
      totalOrders: 28,
      totalSpent: 1680.25,
      status: 'VIP',
      lastVisit: '5 hours ago',
      avatar: '👨‍🔧'
    }
  ]);

  const [newCustomer, setNewCustomer] = useState({
    name: '',
    email: '',
    phone: '',
    address: ''
  });

  // Filter options
  const filterOptions = [
    { name: 'All', count: customers.length },
    { name: 'VIP', count: customers.filter(c => c.status === 'VIP').length },
    { name: 'Regular', count: customers.filter(c => c.status === 'Regular').length },
    { name: 'New', count: customers.filter(c => c.status === 'New').length }
  ];

  // Customer statistics
  const stats = {
    total: customers.length,
    vip: customers.filter(c => c.status === 'VIP').length,
    totalRevenue: customers.reduce((sum, c) => sum + c.totalSpent, 0),
    avgOrders: Math.round(customers.reduce((sum, c) => sum + c.totalOrders, 0) / customers.length)
  };

  // Filter customers
  const filteredCustomers = customers.filter(customer => {
    const matchesSearch = customer.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         customer.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         customer.phone.includes(searchQuery);
    
    if (selectedFilter === 'All') return matchesSearch;
    return matchesSearch && customer.status === selectedFilter;
  });

  // Get status color
  const getStatusColor = (status) => {
    switch(status) {
      case 'VIP':
        return { bg: '#FEF3C7', color: '#D97706', icon: '⭐' };
      case 'Regular':
        return { bg: '#DBEAFE', color: '#2563EB', icon: '👤' };
      case 'New':
        return { bg: '#D1FAE5', color: '#059669', icon: '✨' };
      default:
        return { bg: '#F3F4F6', color: '#6B7280', icon: '👤' };
    }
  };

  // Add customer
  const handleAddCustomer = () => {
    if (newCustomer.name && newCustomer.email && newCustomer.phone) {
      const customer = {
        id: Date.now(),
        ...newCustomer,
        joinDate: new Date().toISOString().split('T')[0],
        totalOrders: 0,
        totalSpent: 0,
        status: 'New',
        lastVisit: 'Today',
        avatar: '👤'
      };
      
      setCustomers([customer, ...customers]);
      setNewCustomer({ name: '', email: '', phone: '', address: '' });
      setShowAddModal(false);
      alert('✅ Customer added successfully!');
    } else {
      alert('Please fill in all required fields');
    }
  };

  // Delete customer
  const handleDeleteCustomer = (customerId) => {
    const customer = customers.find(c => c.id === customerId);
    if (customer && window.confirm(`Delete ${customer.name}?`)) {
      setCustomers(customers.filter(c => c.id !== customerId));
      setShowDetailsModal(false);
    }
  };

  // Export customers
  const handleExport = () => {
    const csvContent = "data:text/csv;charset=utf-8," 
      + "Name,Email,Phone,Address,Join Date,Total Orders,Total Spent,Status\n"
      + customers.map(c => 
          `${c.name},${c.email},${c.phone},${c.address},${c.joinDate},${c.totalOrders},${c.totalSpent},${c.status}`
        ).join("\n");
    
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "customers.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="customers-page">
      {/* Header */}
      <div className="customers-header">
        <div className="header-left">
          <h1>Customers</h1>
          <p>Manage your customer database</p>
        </div>
        <div className="header-actions">
          <button className="export-btn" onClick={handleExport}>
            <Download size={18} />
            Export
          </button>
          <button className="add-customer-btn" onClick={() => setShowAddModal(true)}>
            <Plus size={20} />
            Add Customer
          </button>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon" style={{ background: '#DBEAFE' }}>
            <Users size={24} style={{ color: '#2563EB' }} />
          </div>
          <div className="stat-content">
            <h3>{stats.total}</h3>
            <p>Total Customers</p>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon" style={{ background: '#FEF3C7' }}>
            <Star size={24} style={{ color: '#D97706' }} />
          </div>
          <div className="stat-content">
            <h3>{stats.vip}</h3>
            <p>VIP Customers</p>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon" style={{ background: '#D1FAE5' }}>
            <DollarSign size={24} style={{ color: '#059669' }} />
          </div>
          <div className="stat-content">
            <h3>${stats.totalRevenue.toLocaleString()}</h3>
            <p>Total Revenue</p>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon" style={{ background: '#F3E8FF' }}>
            <TrendingUp size={24} style={{ color: '#A855F7' }} />
          </div>
          <div className="stat-content">
            <h3>{stats.avgOrders}</h3>
            <p>Avg Orders</p>
          </div>
        </div>
      </div>

      {/* Filter and Search */}
      <div className="customers-controls">
        <div className="filter-tabs">
          {filterOptions.map(filter => (
            <button
              key={filter.name}
              className={`filter-tab ${selectedFilter === filter.name ? 'active' : ''}`}
              onClick={() => setSelectedFilter(filter.name)}
            >
              {filter.name}
              <span className="count-badge">{filter.count}</span>
            </button>
          ))}
        </div>

        <div className="search-container">
          <Search size={18} className="search-icon" />
          <input
            type="text"
            placeholder="Search customers by name, email or phone..."
            className="search-input"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      {/* Customers Grid */}
      <div className="customers-grid">
        {filteredCustomers.length === 0 ? (
          <div className="no-customers">
            <Users size={64} />
            <h3>No customers found</h3>
            <p>Try adjusting your search or filters</p>
          </div>
        ) : (
          filteredCustomers.map(customer => {
            const statusColor = getStatusColor(customer.status);
            
            return (
              <div key={customer.id} className="customer-card">
                <div className="customer-card-header">
                  <div className="customer-avatar">{customer.avatar}</div>
                  <span 
                    className="customer-status"
                    style={{ 
                      background: statusColor.bg, 
                      color: statusColor.color 
                    }}
                  >
                    {statusColor.icon} {customer.status}
                  </span>
                </div>

                <div className="customer-info">
                  <h3>{customer.name}</h3>
                  <div className="customer-details">
                    <div className="detail-item">
                      <Mail size={14} />
                      <span>{customer.email}</span>
                    </div>
                    <div className="detail-item">
                      <Phone size={14} />
                      <span>{customer.phone}</span>
                    </div>
                    <div className="detail-item">
                      <MapPin size={14} />
                      <span>{customer.address}</span>
                    </div>
                    <div className="detail-item">
                      <Calendar size={14} />
                      <span>Last visit: {customer.lastVisit}</span>
                    </div>
                  </div>
                </div>

                <div className="customer-stats">
                  <div className="stat-item">
                    <ShoppingBag size={16} />
                    <div>
                      <p className="stat-value">{customer.totalOrders}</p>
                      <p className="stat-label">Orders</p>
                    </div>
                  </div>
                  <div className="stat-item">
                    <DollarSign size={16} />
                    <div>
                      <p className="stat-value">${customer.totalSpent.toFixed(2)}</p>
                      <p className="stat-label">Spent</p>
                    </div>
                  </div>
                </div>

                <div className="customer-actions">
                  <button 
                    className="action-btn view-btn"
                    onClick={() => {
                      setSelectedCustomer(customer);
                      setShowDetailsModal(true);
                    }}
                  >
                    <Eye size={16} />
                    View
                  </button>
                  <button className="action-btn edit-btn">
                    <Edit2 size={16} />
                  </button>
                  <button 
                    className="action-btn delete-btn"
                    onClick={() => handleDeleteCustomer(customer.id)}
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Add Customer Modal */}
      {showAddModal && (
        <div className="modal-overlay" onClick={() => setShowAddModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <div>
                <h2>Add New Customer</h2>
                <p>Fill in customer details</p>
              </div>
              <button className="modal-close-btn" onClick={() => setShowAddModal(false)}>
                <X size={24} />
              </button>
            </div>

            <div className="modal-body">
              <div className="form-grid">
                <div className="form-group full-width">
                  <label>Full Name *</label>
                  <input
                    type="text"
                    placeholder="Enter customer name"
                    value={newCustomer.name}
                    onChange={(e) => setNewCustomer({...newCustomer, name: e.target.value})}
                  />
                </div>

                <div className="form-group">
                  <label>Email Address *</label>
                  <input
                    type="email"
                    placeholder="customer@email.com"
                    value={newCustomer.email}
                    onChange={(e) => setNewCustomer({...newCustomer, email: e.target.value})}
                  />
                </div>

                <div className="form-group">
                  <label>Phone Number *</label>
                  <input
                    type="tel"
                    placeholder="+1 (555) 123-4567"
                    value={newCustomer.phone}
                    onChange={(e) => setNewCustomer({...newCustomer, phone: e.target.value})}
                  />
                </div>

                <div className="form-group full-width">
                  <label>Address</label>
                  <textarea
                    placeholder="Enter customer address"
                    rows="3"
                    value={newCustomer.address}
                    onChange={(e) => setNewCustomer({...newCustomer, address: e.target.value})}
                  />
                </div>
              </div>
            </div>

            <div className="modal-footer">
              <button className="btn-cancel" onClick={() => setShowAddModal(false)}>
                Cancel
              </button>
              <button className="btn-confirm" onClick={handleAddCustomer}>
                <Check size={18} />
                Add Customer
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Customer Details Modal */}
      {showDetailsModal && selectedCustomer && (
        <div className="modal-overlay" onClick={() => setShowDetailsModal(false)}>
          <div className="modal-content details-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <div className="modal-header-with-avatar">
                <div className="modal-avatar">{selectedCustomer.avatar}</div>
                <div>
                  <h2>{selectedCustomer.name}</h2>
                  <p style={{ 
                    color: getStatusColor(selectedCustomer.status).color,
                    fontWeight: 600 
                  }}>
                    {getStatusColor(selectedCustomer.status).icon} {selectedCustomer.status} Customer
                  </p>
                </div>
              </div>
              <button className="modal-close-btn" onClick={() => setShowDetailsModal(false)}>
                <X size={24} />
              </button>
            </div>

            <div className="modal-body">
              <div className="details-grid">
                <div className="detail-section">
                  <h4>Contact Information</h4>
                  <div className="detail-row">
                    <Mail size={18} />
                    <div>
                      <p className="detail-label">Email</p>
                      <p className="detail-value">{selectedCustomer.email}</p>
                    </div>
                  </div>
                  <div className="detail-row">
                    <Phone size={18} />
                    <div>
                      <p className="detail-label">Phone</p>
                      <p className="detail-value">{selectedCustomer.phone}</p>
                    </div>
                  </div>
                  <div className="detail-row">
                    <MapPin size={18} />
                    <div>
                      <p className="detail-label">Address</p>
                      <p className="detail-value">{selectedCustomer.address}</p>
                    </div>
                  </div>
                </div>

                <div className="detail-section">
                  <h4>Customer Statistics</h4>
                  <div className="detail-row">
                    <Calendar size={18} />
                    <div>
                      <p className="detail-label">Join Date</p>
                      <p className="detail-value">{selectedCustomer.joinDate}</p>
                    </div>
                  </div>
                  <div className="detail-row">
                    <ShoppingBag size={18} />
                    <div>
                      <p className="detail-label">Total Orders</p>
                      <p className="detail-value">{selectedCustomer.totalOrders} orders</p>
                    </div>
                  </div>
                  <div className="detail-row">
                    <DollarSign size={18} />
                    <div>
                      <p className="detail-label">Total Spent</p>
                      <p className="detail-value">${selectedCustomer.totalSpent.toFixed(2)}</p>
                    </div>
                  </div>
                  <div className="detail-row">
                    <Calendar size={18} />
                    <div>
                      <p className="detail-label">Last Visit</p>
                      <p className="detail-value">{selectedCustomer.lastVisit}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="modal-footer">
              <button className="btn-secondary" onClick={() => setShowDetailsModal(false)}>
                Close
              </button>
              <button 
                className="btn-primary"
                onClick={() => handleDeleteCustomer(selectedCustomer.id)}
              >
                <Trash2 size={18} />
                Delete Customer
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Customers;

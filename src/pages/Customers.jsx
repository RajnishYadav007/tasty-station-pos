// src/pages/Customers/Customers.jsx

import React, { useState, useEffect } from 'react';
import { 
  Search, 
  Receipt,
  Eye,
  Download,
  Calendar,
  DollarSign,
  ShoppingBag,
  X,
  TrendingUp,
  Clock,
  CheckCircle,
  FileText
} from 'lucide-react';
import { useOrders } from '../context/OrderContext';
import './Customers.css';

const Customers = () => {
  const { orders } = useOrders();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFilter, setSelectedFilter] = useState('All');
  const [showBillModal, setShowBillModal] = useState(false);
  const [selectedBill, setSelectedBill] = useState(null);

  // ✅ Get served orders only (bills) - Check if ALL items are served
  const servedOrders = orders.filter(order => {
    if (!order.items || order.items.length === 0) return false;
    return order.items.every(item => item.status === 'served');
  });

  // Today's filter
  const today = new Date().toDateString();
  const todayOrders = servedOrders.filter(order => 
    new Date(order.createdAt).toDateString() === today
  );

  // This week filter
  const oneWeekAgo = new Date();
  oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
  const weekOrders = servedOrders.filter(order => 
    new Date(order.createdAt) >= oneWeekAgo
  );

  // Filter options
  const filterOptions = [
    { name: 'All', count: servedOrders.length },
    { name: 'Today', count: todayOrders.length },
    { name: 'This Week', count: weekOrders.length }
  ];

  // ✅ Calculate tax & total from items
  const calculateBillDetails = (order) => {
    const subtotal = order.items.reduce((sum, item) => {
      const price = parseFloat(item.price) || 0;
      const quantity = parseInt(item.quantity) || 1;
      return sum + (price * quantity);
    }, 0);
    
    const tax = subtotal * 0.18; // 18% GST
    const total = subtotal + tax;
    
    return { subtotal, tax, total };
  };

  // ✅ Statistics - Calculate from items
  const stats = {
    totalBills: servedOrders.length,
    todayBills: todayOrders.length,
    totalRevenue: servedOrders.reduce((sum, order) => {
      const { total } = calculateBillDetails(order);
      return sum + total;
    }, 0),
    avgBill: servedOrders.length > 0 
      ? servedOrders.reduce((sum, order) => {
          const { total } = calculateBillDetails(order);
          return sum + total;
        }, 0) / servedOrders.length 
      : 0
  };

  // Filter orders
  const getFilteredOrders = () => {
    let filtered = servedOrders;

    if (selectedFilter === 'Today') {
      filtered = todayOrders;
    } else if (selectedFilter === 'This Week') {
      filtered = weekOrders;
    }

    if (searchQuery) {
      filtered = filtered.filter(order => 
        order.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
        order.customerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        order.tableNumber.toString().includes(searchQuery)
      );
    }

    return filtered.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  };

  const filteredOrders = getFilteredOrders();

  // Format date
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric', 
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Print bill
  const handlePrintBill = (order) => {
    const billDetails = calculateBillDetails(order);
    
    const printContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Bill - ${order.id}</title>
        <style>
          body { font-family: Arial, sans-serif; padding: 20px; }
          .bill-header { text-align: center; margin-bottom: 20px; }
          .bill-info { margin: 20px 0; }
          table { width: 100%; border-collapse: collapse; margin: 20px 0; }
          th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
          th { background-color: #f2f2f2; }
          .total-row { font-weight: bold; font-size: 18px; }
        </style>
      </head>
      <body>
        <div class="bill-header">
          <h1>🍽️ Tasty Station</h1>
          <p>Invoice: ${order.id}</p>
        </div>
        <div class="bill-info">
          <p><strong>Date:</strong> ${formatDate(order.createdAt)}</p>
          <p><strong>Table:</strong> ${order.tableNumber}</p>
          <p><strong>Customer:</strong> ${order.customerName}</p>
          <p><strong>Waiter:</strong> ${order.waiter}</p>
        </div>
        <table>
          <thead>
            <tr>
              <th>Item</th>
              <th>Qty</th>
              <th>Price</th>
              <th>Total</th>
            </tr>
          </thead>
          <tbody>
            ${order.items.map(item => `
              <tr>
                <td>${item.name}</td>
                <td>${item.quantity}</td>
                <td>₹${item.price.toFixed(2)}</td>
                <td>₹${(item.price * item.quantity).toFixed(2)}</td>
              </tr>
            `).join('')}
            <tr>
              <td colspan="3" align="right"><strong>Subtotal:</strong></td>
              <td>₹${billDetails.subtotal.toFixed(2)}</td>
            </tr>
            <tr>
              <td colspan="3" align="right"><strong>Tax (18%):</strong></td>
              <td>₹${billDetails.tax.toFixed(2)}</td>
            </tr>
            <tr class="total-row">
              <td colspan="3" align="right"><strong>Total:</strong></td>
              <td>₹${billDetails.total.toFixed(2)}</td>
            </tr>
          </tbody>
        </table>
        <div style="text-align: center; margin-top: 30px;">
          <p>Thank you for dining with us!</p>
        </div>
      </body>
      </html>
    `;

    const printWindow = window.open('', '', 'height=600,width=800');
    printWindow.document.write(printContent);
    printWindow.document.close();
    printWindow.print();
  };

  return (
    <div className="customers-page">
      {/* Header */}
      <div className="customers-header">
        <div className="header-left">
          <h1>Bills & Orders</h1>
          <p>View completed orders and generate bills</p>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon" style={{ background: '#DBEAFE' }}>
            <Receipt size={24} style={{ color: '#2563EB' }} />
          </div>
          <div className="stat-content">
            <h3>{stats.totalBills}</h3>
            <p>Total Bills</p>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon" style={{ background: '#FEF3C7' }}>
            <Clock size={24} style={{ color: '#D97706' }} />
          </div>
          <div className="stat-content">
            <h3>{stats.todayBills}</h3>
            <p>Today's Bills</p>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon" style={{ background: '#D1FAE5' }}>
            <DollarSign size={24} style={{ color: '#059669' }} />
          </div>
          <div className="stat-content">
            <h3>₹{stats.totalRevenue.toLocaleString()}</h3>
            <p>Total Revenue</p>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon" style={{ background: '#F3E8FF' }}>
            <TrendingUp size={24} style={{ color: '#A855F7' }} />
          </div>
          <div className="stat-content">
            <h3>₹{stats.avgBill.toFixed(2)}</h3>
            <p>Avg Bill Amount</p>
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
            placeholder="Search by order ID, customer name or table..."
            className="search-input"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      {/* Bills Grid */}
      <div className="customers-grid">
        {filteredOrders.length === 0 ? (
          <div className="no-customers">
            <Receipt size={64} />
            <h3>No bills found</h3>
            <p>Complete orders will appear here once all items are served</p>
          </div>
        ) : (
          filteredOrders.map(order => {
            const billDetails = calculateBillDetails(order);
            
            return (
              <div key={order.id} className="customer-card">
                <div className="customer-card-header">
                  <div className="bill-id">
                    <Receipt size={20} />
                    <span>{order.id}</span>
                  </div>
                  <span className="bill-status">
                    <CheckCircle size={16} />
                    Completed
                  </span>
                </div>

                <div className="customer-info">
                  <h3>{order.customerName}</h3>
                  <div className="customer-details">
                    <div className="detail-item">
                      <ShoppingBag size={14} />
                      <span>Table {order.tableNumber}</span>
                    </div>
                    <div className="detail-item">
                      <Clock size={14} />
                      <span>{formatDate(order.createdAt)}</span>
                    </div>
                    <div className="detail-item">
                      <FileText size={14} />
                      <span>{order.items.length} items</span>
                    </div>
                  </div>
                </div>

                <div className="customer-stats">
                  <div className="stat-item">
                    <DollarSign size={16} />
                    <div>
                      <p className="stat-value">₹{billDetails.total.toFixed(2)}</p>
                      <p className="stat-label">Total (incl. tax)</p>
                    </div>
                  </div>
                </div>

                <div className="customer-actions">
                  <button 
                    className="action-btn view-btn"
                    onClick={() => {
                      setSelectedBill(order);
                      setShowBillModal(true);
                    }}
                  >
                    <Eye size={16} />
                    View
                  </button>
                  <button 
                    className="action-btn download-btn"
                    onClick={() => handlePrintBill(order)}
                  >
                    <Download size={16} />
                    Print
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Bill Details Modal */}
      {showBillModal && selectedBill && (
        <div className="modal-overlay" onClick={() => setShowBillModal(false)}>
          <div className="modal-content details-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <div>
                <h2>🧾 Invoice - {selectedBill.id}</h2>
                <p>Order details and billing information</p>
              </div>
              <button className="modal-close-btn" onClick={() => setShowBillModal(false)}>
                <X size={24} />
              </button>
            </div>

            <div className="modal-body">
              {/* Bill Info */}
              <div className="bill-info-section">
                <div className="info-row">
                  <span className="info-label">Date:</span>
                  <span className="info-value">{formatDate(selectedBill.createdAt)}</span>
                </div>
                <div className="info-row">
                  <span className="info-label">Table:</span>
                  <span className="info-value">Table {selectedBill.tableNumber}</span>
                </div>
                <div className="info-row">
                  <span className="info-label">Customer:</span>
                  <span className="info-value">{selectedBill.customerName}</span>
                </div>
                <div className="info-row">
                  <span className="info-label">Waiter:</span>
                  <span className="info-value">{selectedBill.waiter}</span>
                </div>
              </div>

              {/* Items Table */}
              <div className="bill-items-table">
                <h4>Order Items</h4>
                <table>
                  <thead>
                    <tr>
                      <th>Item</th>
                      <th>Qty</th>
                      <th>Price</th>
                      <th>Total</th>
                    </tr>
                  </thead>
                  <tbody>
                    {selectedBill.items.map((item, index) => (
                      <tr key={index}>
                        <td>
                          <div>
                            <strong>{item.name}</strong>
                            {item.notes && <small className="item-note">📝 {item.notes}</small>}
                          </div>
                        </td>
                        <td>{item.quantity}</td>
                        <td>₹{item.price.toFixed(2)}</td>
                        <td>₹{(item.price * item.quantity).toFixed(2)}</td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot>
                    <tr>
                      <td colSpan="3" align="right"><strong>Subtotal:</strong></td>
                      <td>₹{calculateBillDetails(selectedBill).subtotal.toFixed(2)}</td>
                    </tr>
                    <tr>
                      <td colSpan="3" align="right"><strong>Tax (18% GST):</strong></td>
                      <td>₹{calculateBillDetails(selectedBill).tax.toFixed(2)}</td>
                    </tr>
                    <tr className="total-row">
                      <td colSpan="3" align="right"><strong>Total Amount:</strong></td>
                      <td><strong>₹{calculateBillDetails(selectedBill).total.toFixed(2)}</strong></td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            </div>

            <div className="modal-footer">
              <button className="btn-secondary" onClick={() => setShowBillModal(false)}>
                Close
              </button>
              <button 
                className="btn-primary"
                onClick={() => handlePrintBill(selectedBill)}
              >
                <Download size={18} />
                Print Bill
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Customers;

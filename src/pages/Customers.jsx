

import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';  // ✅ IMPORT TOAST
import { 
  Search, 
  Receipt,
  Eye,
  Download,
  ShoppingBag,
  X,
  TrendingUp,
  Clock,
  CheckCircle,
  FileText
} from 'lucide-react';
import './Customers.css';
import { useBill } from '../context/BillContext';

const Customers = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFilter, setSelectedFilter] = useState('All');
  const [showBillModal, setShowBillModal] = useState(false);
  const [selectedBill, setSelectedBill] = useState(null);

  // ✅ Use BillContext
  const { bills, orderDetails, loading, loadBills, markBillAsPaid } = useBill();

  const [stats, setStats] = useState({
    totalBills: 0,
    todayBills: 0,
    totalRevenue: 0,
    avgBill: 0
  });

// ✅ Handle Mark as Paid - WITH TABLE CLEARING
const handleMarkAsPaid = async (billId) => {
  if (!window.confirm('Mark this bill as paid?')) return;
  
  try {
    console.log(`💰 Marking bill #${billId} as paid from Customers page...`);
    
    const updated = await markBillAsPaid(billId);
    
    if (updated) {
      console.log('✅ Bill marked as paid successfully!');
      
      // Update selected bill if viewing it
      if (selectedBill?.bill_id === billId) {
        setSelectedBill({...selectedBill, payment_status: 'Paid'});
      }
      
      // Reload bills to show updated status
      await loadBills();
      
      // ✅ SUCCESS TOAST
      toast.success('💰 Payment Received! Table cleared!', {
        position: 'top-right',
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
      });
    }
  } catch (err) {
    console.error('❌ Error marking bill as paid:', err);
    // ✅ ERROR TOAST
    toast.error('❌ Failed to mark bill as paid', {
      position: 'top-right',
      autoClose: 3000,
    });
  }
};


  // ✅ Load bills on mount - WITH TOAST
  useEffect(() => {
    try {
      loadBills();
 
    } catch (err) {
      toast.error('Failed to load bills', {
        position: 'top-right',
      });
    }
  }, [loadBills]);

  // ✅ Update stats when bills change - USE created_at
  useEffect(() => {
    if (bills.length > 0) {
      const totalRevenue = bills.reduce((sum, bill) => {
        return sum + (parseFloat(bill.final_amount || bill.total_amount) || 0);
      }, 0);

      const today = new Date().toDateString();
      const todaysBills = bills.filter(b => {
        const billDate = new Date(b.created_at || b.bill_date).toDateString();
        return billDate === today;
      });

      const avgBill = bills.length > 0 ? totalRevenue / bills.length : 0;

      setStats({
        totalBills: bills.length,
        todayBills: todaysBills.length,
        totalRevenue: totalRevenue,
        avgBill: avgBill
      });

      console.log('✅ Stats updated:', { totalBills: bills.length, totalRevenue });
    }
  }, [bills]);

  // ✅ Calculate bill details from order details
const calculateBillDetails = (bill) => {
  const items = orderDetails[bill.order_id] || [];
  
  // ✅ FETCH DISH NAMES FROM SUPABASE IF NOT PRESENT
  const itemsWithNames = items.map(item => {
    // Check if dish_name already exists
    if (item.dish_name && item.dish_name !== `Dish #${item.dish_id}`) {
      return { ...item, dish_name: item.dish_name };
    }
    // If not, you'll need to fetch from your dishes list in context
    return {
      ...item,
      dish_name: item.dish_name || item.Dish?.dish_name || `Dish #${item.dish_id}`
    };
  });

    
    const subtotal = itemsWithNames.reduce((sum, item) => {
      const price = parseFloat(item.price) || 0;
      const quantity = parseInt(item.quantity) || 1;
      return sum + (price * quantity);
    }, 0);
    
    const tax = subtotal * 0.18;
    const total = subtotal + tax;
    
    return { subtotal, tax, total, items: itemsWithNames };
  };

  // ✅ Filter bills - USE created_at
  const getFilteredBills = () => {
    let filtered = bills;

    if (selectedFilter === 'Today') {
      const today = new Date().toDateString();
      filtered = bills.filter(bill => 
        new Date(bill.created_at || bill.bill_date).toDateString() === today
      );
    } else if (selectedFilter === 'This Week') {
      const oneWeekAgo = new Date();
      oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
      filtered = bills.filter(bill => 
        new Date(bill.created_at || bill.bill_date) >= oneWeekAgo
      );
    }

    if (searchQuery) {
      filtered = filtered.filter(bill => 
        bill.bill_id.toString().includes(searchQuery) ||
        bill.order_id.toString().includes(searchQuery)
      );
    }

    return filtered.sort((a, b) => 
      new Date(b.created_at || b.bill_date) - new Date(a.created_at || a.bill_date)
    );
  };

  const filteredBills = getFilteredBills();

  const today = new Date().toDateString();
  const oneWeekAgo = new Date();
  oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);

  // ✅ Filter options - USE created_at
  const filterOptions = [
    { 
      name: 'All', 
      count: bills.length 
    },
    { 
      name: 'Today', 
      count: bills.filter(b => 
        new Date(b.created_at || b.bill_date).toDateString() === today
      ).length 
    },
    { 
      name: 'This Week', 
      count: bills.filter(b => 
        new Date(b.created_at || b.bill_date) >= oneWeekAgo
      ).length 
    }
  ];

  // ✅ Format date - proper date handling
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return 'Invalid Date';
      
      return date.toLocaleDateString('en-IN', { 
        year: 'numeric',
        month: 'short', 
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit'
      });
    } catch (err) {
      return 'Invalid Date';
    }
  };

  // ✅ Handle Print Bill - WITH TOAST
  const handlePrintBill = (bill) => {
    try {
      const billDetails = calculateBillDetails(bill);
      
      const printContent = `
        <!DOCTYPE html>
        <html>
        <head>
          <title>Bill - ${bill.bill_id}</title>
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
            <p>Invoice: #${bill.bill_id}</p>
          </div>
          <div class="bill-info">
            <p><strong>Date:</strong> ${formatDate(bill.created_at || bill.bill_date || bill.payment_date)}</p>
            <p><strong>Order ID:</strong> ${bill.order_id}</p>
            <p><strong>Payment Status:</strong> ${bill.payment_status}</p>
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
              ${billDetails.items.map(item => `
                <tr>
                  <td>${item.dish_name || `Dish #${item.dish_id}`}</td>
                  <td>${item.quantity}</td>
                  <td>₹${parseFloat(item.price).toFixed(2)}</td>
                  <td>₹${(parseFloat(item.price) * parseInt(item.quantity)).toFixed(2)}</td>
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

      // ✅ PRINT SUCCESS TOAST
      toast.success('📄 Bill sent to printer!', {
        position: 'bottom-right',
        autoClose: 2000,
      });
    } catch (err) {
      // ✅ PRINT ERROR TOAST
      toast.error('Failed to print bill', {
        position: 'top-right',
      });
    }
  };

  if (loading) {
    return (
      <div className="customers-page">
        <div style={{ textAlign: 'center', padding: '60px', color: '#666' }}>
          ⏳ Loading bills...
        </div>
      </div>
    );
  }

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
            <span style={{ fontSize: '24px', color: '#059669', fontWeight: 'bold' }}>₹</span>
          </div>
          <div className="stat-content">
            <h3>₹{Math.round(stats.totalRevenue).toLocaleString()}</h3>
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
            placeholder="Search by bill ID or order ID..."
            className="search-input"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      {/* Bills Grid */}
      <div className="customers-grid">
        {(() => {
          const uniqueBills = [];
          const seenOrderIds = new Set();
          
          const sortedBills = [...filteredBills].sort((a, b) => b.bill_id - a.bill_id);
          
          sortedBills.forEach(bill => {
            if (!seenOrderIds.has(bill.order_id)) {
              uniqueBills.push(bill);
              seenOrderIds.add(bill.order_id);
            }
          });
          
          if (uniqueBills.length === 0) {
            return (
              <div className="no-customers">
                <Receipt size={64} />
                <h3>No bills found</h3>
                <p>Complete orders will appear here once all items are served</p>
              </div>
            );
          }
          
          return uniqueBills.map(bill => {
            const billDetails = calculateBillDetails(bill);
            
            return (
              <div key={bill.bill_id} className="customer-card">
                <div className="customer-card-header">
                  <div className="bill-id">
                    <Receipt size={20} />
                    <span>ORD-{bill.order_id.toString().padStart(6, '0')}</span>
                  </div>
                  <span className={`bill-status ${bill.payment_status === 'Paid' ? 'paid' : 'pending'}`}>
                    <CheckCircle size={16} />
                    {bill.payment_status === 'Paid' ? '✅ Paid' : '⏳ Pending'}
                  </span>
                </div>

                <div className="customer-info">
                  <h3>{bill.user_name || 'Guest'} - Order #{bill.order_id}</h3>
                  <div className="customer-details">
                    <div className="detail-item">
                      <ShoppingBag size={14} />
                      <span>Bill #{bill.bill_id}</span>
                    </div>
                    <div className="detail-item">
                      <Clock size={14} />
                      <span>{formatDate(bill.created_at || bill.bill_date)}</span>
                    </div>
                    <div className="detail-item">
                      <FileText size={14} />
                      <span>{billDetails.items.length} items</span>
                    </div>
                  </div>
                </div>

                <div className="customer-stats">
                  <div className="stat-item">
                    <span style={{ fontSize: '18px', color: '#059669', fontWeight: 'bold', marginRight: '8px' }}>₹</span>
                    <div>
                      {(() => {
                        const billDetails = calculateBillDetails(bill);
                        return (
                          <>
                            <p className="stat-value">₹{billDetails.total.toFixed(2)}</p>
                            <p className="stat-label" style={{ fontSize: '11px', color: '#666' }}>
                              + GST ₹{billDetails.tax.toFixed(2)}
                            </p>
                          </>
                        );
                      })()}
                    </div>
                  </div>
                </div>

                {bill.payment_status === 'Pending' && (
                  <button 
                    className="action-btn paid-btn"
                    onClick={() => handleMarkAsPaid(bill.bill_id)}
                  >
                    ✓ Mark Paid
                  </button>
                )}

                <div className="customer-actions">
                  <button 
                    className="action-btn view-btn"
                    onClick={() => {
                      setSelectedBill(bill);
                      setShowBillModal(true);
                    }}
                  >
                    <Eye size={16} />
                    View
                  </button>
                  <button 
                    className="action-btn download-btn"
                    onClick={() => handlePrintBill(bill)}
                  >
                    <Download size={16} />
                    Print
                  </button>
                </div>
              </div>
            );
          });
        })()}
      </div>

      {/* Bill Details Modal */}
      {showBillModal && selectedBill && (() => {
        const billDetails = calculateBillDetails(selectedBill);
        
        return (
          <div className="modal-overlay" onClick={() => setShowBillModal(false)}>
            <div className="modal-content details-modal" onClick={(e) => e.stopPropagation()}>
              <div className="modal-header">
                <div>
                  <h2>🧾 Invoice - #{selectedBill.bill_id}</h2>
                  <p>Order details and billing information</p>
                </div>
                <button className="modal-close-btn" onClick={() => setShowBillModal(false)}>
                  <X size={24} />
                </button>
              </div>

              <div className="modal-body">
                <div className="bill-info-section">
                  <div className="info-row">
                    <span className="info-label">Date:</span>
                    <span className="info-value">{formatDate(selectedBill.created_at || selectedBill.bill_date)}</span>
                  </div>
                  <div className="info-row">
                    <span className="info-label">Order ID:</span>
                    <span className="info-value">#{selectedBill.order_id}</span>
                  </div>
                  <div className="info-row">
                    <span className="info-label">Payment Status:</span>
                    <span className={`info-value status-${selectedBill.payment_status.toLowerCase()}`}>
                      {selectedBill.payment_status === 'Paid' ? '✅ PAID' : '⏳ PENDING'}
                    </span>
                  </div>
                </div>

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
                      {billDetails.items.map((item, index) => (
                        <tr key={index}>
                          <td>
                            <strong>{item.dish_name || `Dish #${item.dish_id}`}</strong>
                          </td>
                          <td>{item.quantity}</td>
                          <td>₹{parseFloat(item.price).toFixed(2)}</td>
                          <td>₹{(parseFloat(item.price) * parseInt(item.quantity)).toFixed(2)}</td>
                        </tr>
                      ))}
                    </tbody>
                    <tfoot>
                      <tr>
                        <td colSpan="3" align="right"><strong>Subtotal:</strong></td>
                        <td>₹{billDetails.subtotal.toFixed(2)}</td>
                      </tr>
                      <tr>
                        <td colSpan="3" align="right"><strong>Tax (18% GST):</strong></td>
                        <td>₹{billDetails.tax.toFixed(2)}</td>
                      </tr>
                      <tr className="total-row">
                        <td colSpan="3" align="right"><strong>Total Amount:</strong></td>
                        <td><strong>₹{billDetails.total.toFixed(2)}</strong></td>
                      </tr>
                    </tfoot>
                  </table>
                </div>
              </div>

              <div className="modal-footer">
                {selectedBill.payment_status === 'Pending' && (
                  <button 
                    className="btn-paid"
                    onClick={() => {
                      handleMarkAsPaid(selectedBill.bill_id);
                      setShowBillModal(false);
                    }}
                  >
                    💰 Collect Payment
                  </button>
                )}

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
        );
      })()}
    </div>
  );
};

export default Customers;

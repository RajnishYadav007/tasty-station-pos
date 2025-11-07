// src/pages/ManageTable/ManageTable.jsx - ✅ EXACTLY LIKE CUSTOMERS.JSX

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { 
  Users, 
  X, 
  Check, 
  ShoppingCart, 
  Receipt, 
  Download,
  Eye,
  Calendar,
  FileText,
  Clock
} from 'lucide-react';
import { 
  sendTableOccupiedNotification,
  sendPaymentReadyNotification 
} from '../api/notificationApi';
import { useBill } from '../context/BillContext'; // ✅ USE BILLCONTEXT LIKE CUSTOMERS
import { usePayment } from '../context/PaymentContext';
import TakeOrderModal from '../components/TakeOrderModal';
import './ManageTable.css';

const ManageTable = () => {
  const navigate = useNavigate();
  
  // ✅ USE BILLCONTEXT (LIKE CUSTOMERS.JSX)
  const { 
    bills, 
    orderDetails, 
    loading: billsLoading,
    loadBills,
    createBill, 
    markBillAsPaid: markBillAsPaidContext 
  } = useBill();
  
  const { executePayment: processPaymentTransaction } = usePayment();
  
  const [selectedArea, setSelectedArea] = useState('Main Dining');
  const [selectedTable, setSelectedTable] = useState(null);
  const [showBillModal, setShowBillModal] = useState(false);
  const [billTable, setBillTable] = useState(null);
  const [showTakeOrderModal, setShowTakeOrderModal] = useState(false);
  const [orderTable, setOrderTable] = useState(null);
  const [showGuestModal, setShowGuestModal] = useState(false);
  const [guestCount, setGuestCount] = useState(2);
  const [tempTable, setTempTable] = useState(null);
  const [billLoading, setBillLoading] = useState(false);

  const initialTables = [
    { id: 1, number: 1, capacity: 6, status: 'available', area: 'Main Dining' },
    { id: 2, number: 2, capacity: 2, status: 'available', area: 'Main Dining' },
    { id: 3, number: 3, capacity: 2, status: 'available', area: 'Main Dining' },
    { id: 4, number: 4, capacity: 3, status: 'available', area: 'Main Dining' },
    { id: 5, number: 5, capacity: 4, status: 'available', area: 'Main Dining' },
    { id: 6, number: 6, capacity: 7, status: 'available', area: 'Main Dining' },
    { id: 7, number: 7, capacity: 10, status: 'available', area: 'Main Dining' },
    { id: 8, number: 8, capacity: 2, status: 'available', area: 'Main Dining' },
    { id: 9, number: 9, capacity: 4, status: 'available', area: 'Main Dining' },
    { id: 10, number: 10, capacity: 2, status: 'available', area: 'Main Dining' },
    { id: 11, number: 11, capacity: 2, status: 'available', area: 'Terrace' },
    { id: 12, number: 12, capacity: 8, status: 'available', area: 'Terrace' },
    { id: 13, number: 13, capacity: 4, status: 'available', area: 'Terrace' },
    { id: 14, number: 14, capacity: 6, status: 'available', area: 'Outdoor' },
    { id: 15, number: 15, capacity: 4, status: 'available', area: 'Outdoor' }
  ];

  const [tables, setTables] = useState(() => {
    const saved = localStorage.getItem('restaurantTables');
    return saved ? JSON.parse(saved) : initialTables;
  });

  useEffect(() => {
    localStorage.setItem('restaurantTables', JSON.stringify(tables));
  }, [tables]);

  // ✅ LOAD BILLS ON MOUNT (LIKE CUSTOMERS.JSX)
  useEffect(() => {
    console.log('🔄 Loading bills and orders...');
    loadBills();
  }, [loadBills]);

  // ✅ DEBUG: Monitor bills & orderDetails
  useEffect(() => {
    console.log('💰 BILLS:', bills);
    console.log('📋 ORDER DETAILS:', orderDetails);
    
    if (bills && bills.length > 0) {
      console.log('✅ Total Bills:', bills.length);
      bills.forEach(bill => {
        const items = orderDetails[bill.order_id] || [];
        console.log(`Bill ${bill.bill_id}: Order ${bill.order_id}, Items: ${items.length}`);
      });
    } else {
      console.log('⚠️ No bills data!');
    }
  }, [bills, orderDetails]);

  const areas = ['Main Dining', 'Terrace', 'Outdoor'];

  // ✅ GET TABLE BILLS (LIKE CUSTOMERS.JSX - USES orderDetails)
  const getTableBills = (tableNumber) => {
    if (!bills || bills.length === 0) {
      console.log('❌ No bills found');
      return [];
    }

    // Filter bills for this table by checking orderDetails
    const tableBills = bills.filter(bill => {
      const items = orderDetails[bill.order_id] || [];
      // Check if any order item has this table number (you might need to adjust this based on your data structure)
      return items.length > 0;
    });
    
    console.log(`📊 Table ${tableNumber} - Found ${tableBills.length} bills`);
    return tableBills.sort((a, b) => 
      new Date(b.created_at || b.bill_date) - new Date(a.created_at || a.bill_date)
    );
  };

  // ✅ GET MOST RECENT BILL FOR TABLE
  const getTableBill = (tableNumber) => {
    const tableBills = getTableBills(tableNumber);
    if (tableBills.length === 0) {
      console.log('❌ No bill found for table', tableNumber);
      return null;
    }
    
    const recentBill = tableBills[0];
    console.log('✅ Most Recent Bill:', recentBill.bill_id);
    return recentBill;
  };

  // ✅ CALCULATE BILL DETAILS (EXACTLY LIKE CUSTOMERS.JSX)
  const calculateBillDetails = (bill) => {
    if (!bill) {
      return { subtotal: 0, tax: 0, total: 0, items: [] };
    }

    const items = orderDetails[bill.order_id] || [];
    
    const itemsWithNames = items.map(item => ({
      ...item,
      dish_name: item.dish_name || `Dish #${item.dish_id}`
    }));
    
    const subtotal = itemsWithNames.reduce((sum, item) => {
      const price = parseFloat(item.price) || 0;
      const quantity = parseInt(item.quantity) || 1;
      return sum + (price * quantity);
    }, 0);
    
    const tax = subtotal * 0.18;
    const total = subtotal + tax;
    
    return { subtotal, tax, total, items: itemsWithNames };
  };

  // ✅ FORMAT DATE (LIKE CUSTOMERS.JSX)
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
        minute: '2-digit'
      });
    } catch (err) {
      return 'Invalid Date';
    }
  };

  const handleAvailableClick = (table) => {
    setTempTable(table);
    setGuestCount(2);
    setShowGuestModal(true);
  };

// ✅ NEW CODE - ADD NOTIFICATION
const handleConfirmGuests = () => {
  if (tempTable && guestCount > 0) {
    changeTableStatus(tempTable.id, 'occupied');
    setOrderTable(tempTable);
    setShowGuestModal(false);
    setShowTakeOrderModal(true);
    setTempTable(null);
    
    // 🔔 SEND NOTIFICATION
    sendTableOccupiedNotification(tempTable.number, `${guestCount} guests`);
    
    toast.success(`✅ Table #${tempTable.number} occupied with ${guestCount} guests!`, {
      position: 'top-right',
      autoClose: 2000,
    });
  }
};


  const handleOccupiedClick = (table) => {
    setOrderTable(table);
    setShowTakeOrderModal(true);
    
    toast.info(`📝 Taking order for Table #${table.number}`, {
      position: 'bottom-left',
      autoClose: 1500,
    });
  };

  const handleGenerateBill = (table) => {
    console.log('📊 BILL GENERATION - Table:', table.number);
    console.log('💰 Available Bills:', bills.length);
    
    const tableBill = getTableBill(table.number);
    
    if (!tableBill) {
      console.log('❌ No bill found!');
      toast.error(`⚠️ No bills for Table #${table.number}. Place order first!`, {
        position: 'top-right',
        autoClose: 3000,
      });
      return;
    }
    
    console.log('✅ Bill found:', tableBill.bill_id);
    setBillTable(table);
    setShowBillModal(true);
    
    toast.info(`💰 Generating bill for Table #${table.number}`, {
      position: 'bottom-left',
      autoClose: 1500,
    });
  };

  // ✅ PRINT BILL (LIKE CUSTOMERS.JSX)
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
            <p><strong>Date:</strong> ${formatDate(bill.created_at || bill.bill_date)}</p>
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
      
      toast.success(`📄 Bill printed for Table #${billTable.number}!`, {
        position: 'bottom-right',
        autoClose: 2000,
      });
    } catch (err) {
      console.error('Print error:', err);
      toast.error('Failed to print bill', { position: 'top-right' });
    }
  };

const handleBillPayment = async () => {
  if (!billTable) return;

  const tableBill = getTableBill(billTable.number);
  
  if (!tableBill) {
    toast.error('⚠️ No bill found!', {
      position: 'top-right',
      autoClose: 2000,
    });
    return;
  }

  // ✅ DECLARE loadingToast OUTSIDE try block
  let loadingToast = null;

  try {
    setBillLoading(true);
    const billDetails = calculateBillDetails(tableBill);

    console.log('💳 Processing payment for Table #' + billTable.number);

    // ✅ CREATE LOADING TOAST & STORE ID
    loadingToast = toast.loading('⏳ Processing payment...', {
      position: 'top-center',
      closeOnClick: false,
      closeButton: false,
    });

    // Mark bill as paid
    await markBillAsPaidContext(tableBill.bill_id);

    // Reload bills
    await loadBills();

    // Change table status
    changeTableStatus(billTable.id, 'available');

    // 🔔 SEND PAYMENT NOTIFICATION
sendPaymentReadyNotification(tableBill.bill_id, billDetails.total, billTable.number);
    
    // ✅ DISMISS LOADING TOAST
    if (loadingToast) {
      toast.dismiss(loadingToast);
    }
    
    // ✅ SHOW SUCCESS TOAST
    toast.success(
      `✅ Payment Successful!\n💰 Amount: ₹${billDetails.total.toFixed(2)}\n🟢 Table #${billTable.number} available!`,
      {
        position: 'top-center',
        autoClose: 3000,
      }
    );

    // Close modal
    setShowBillModal(false);
    setBillTable(null);

  } catch (error) {
    console.error('❌ Error processing payment:', error);
    
    // ✅ DISMISS LOADING TOAST IN CASE OF ERROR
    if (loadingToast) {
      toast.dismiss(loadingToast);
    }
    
    toast.error(`❌ Payment failed: ${error.message}`, {
      position: 'top-right',
      autoClose: 3000,
    });
  } finally {
    setBillLoading(false);
    
    // ✅ SAFETY: DISMISS LOADING TOAST IF STILL EXISTS
    if (loadingToast) {
      toast.dismiss(loadingToast);
    }
  }
};


  const getTableColor = (status) => {
    switch(status) {
      case 'available':
        return '#D4F4DD';
      case 'reserved':
        return '#FFE4E4';
      case 'occupied':
        return '#E8D4F4';
      default:
        return '#F3F4F6';
    }
  };

  const handleTableClick = (table) => {
    setSelectedTable(table);
  };

  const changeTableStatus = (tableId, newStatus) => {
    setTables(prevTables =>
      prevTables.map(table => 
        table.id === tableId ? { ...table, status: newStatus } : table
      )
    );
    console.log(`✅ Table ${tableId} status changed to: ${newStatus}`);
  };

  const filteredTables = tables.filter(table => table.area === selectedArea);

  // ✅ LOADING STATE (LIKE CUSTOMERS.JSX)
  if (billsLoading) {
    return (
      <div className="manage-table-page-fullwidth">
        <div style={{ textAlign: 'center', padding: '60px', color: '#666' }}>
          ⏳ Loading bills and orders...
        </div>
      </div>
    );
  }

  return (
    <div className="manage-table-page-fullwidth">
      <div className="tables-main-section-full">
        <div className="page-header-full">
          <h1>Manage Tables</h1>
          <div className="area-tabs-container">
            {areas.map(area => (
              <button
                key={area}
                className={`area-tab ${selectedArea === area ? 'active' : ''}`}
                onClick={() => setSelectedArea(area)}
              >
                {area}
              </button>
            ))}
          </div>
        </div>

        <div className="status-legend">
          <div className="legend-item">
            <div className="legend-dot available"></div>
            <span>Available</span>
          </div>
          <div className="legend-item">
            <div className="legend-dot occupied"></div>
            <span>Occupied</span>
          </div>
        </div>

        <div className="table-layout-grid">
          {filteredTables.length === 0 ? (
            <div className="no-tables-message">
              <p>No tables found in {selectedArea}</p>
            </div>
          ) : (
            filteredTables.map((table) => (
              <div
                key={table.id}
                className={`table-item ${table.status} ${selectedTable?.id === table.id ? 'selected' : ''}`}
                style={{ backgroundColor: getTableColor(table.status) }}
                onClick={() => handleTableClick(table)}
              >
                <div className="table-chairs-top">
                  <div className="chair">🪑</div>
                  <div className="chair">🪑</div>
                  <div className="chair">🪑</div>
                  {table.capacity > 3 && <div className="chair">🪑</div>}
                </div>

                <div className="table-center">
                  <div className="table-icon">
                    {table.status === 'occupied' ? '🍽️' : '🟢'}
                  </div>
                  <div className="table-info">
                    <h3>Table #{table.number}</h3>
                    <div className="capacity-info">
                      <Users size={14} />
                      <span>{table.capacity}</span>
                    </div>
                  </div>
                </div>

                <div className="table-chairs-bottom">
                  {table.capacity >= 2 && <div className="chair">🪑</div>}
                  {table.capacity >= 3 && <div className="chair">🪑</div>}
                  {table.capacity >= 4 && <div className="chair">🪑</div>}
                  {table.capacity >= 5 && <div className="chair">🪑</div>}
                </div>

                <div className="table-quick-actions">
                  {table.status === 'available' && (
                    <button 
                      className="quick-action-btn status-available"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleAvailableClick(table);
                      }}
                    >
                      <Check size={16} />
                      Available
                    </button>
                  )}
                  
                  {table.status === 'occupied' && (
                    <div className="occupied-actions">
                      <button 
                        className="quick-action-btn status-occupied"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleOccupiedClick(table);
                        }}
                      >
                        <ShoppingCart size={16} />
                        Occupied
                      </button>
                      <button 
                        className="quick-action-btn generate-bill-btn"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleGenerateBill(table);
                        }}
                      >
                        <Receipt size={16} />
                        Bill
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Guest Count Modal */}
      {showGuestModal && tempTable && (
        <div className="modal-overlay" onClick={() => setShowGuestModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>👥 Number of Guests - Table #{tempTable.number}</h2>
              <button 
                className="modal-close-btn"
                onClick={() => setShowGuestModal(false)}
              >
                <X size={24} />
              </button>
            </div>

            <div className="modal-body">
              <div className="form-group">
                <label>How many guests?</label>
                <input 
                  type="number"
                  min="1"
                  max={tempTable.capacity}
                  value={guestCount}
                  onChange={(e) => setGuestCount(parseInt(e.target.value) || 1)}
                  style={{ fontSize: '18px', textAlign: 'center' }}
                />
                <p style={{ 
                  fontSize: '13px', 
                  color: '#6B7280', 
                  marginTop: '8px',
                  textAlign: 'center'
                }}>
                  Table capacity: {tempTable.capacity} guests
                </p>
              </div>
            </div>

            <div className="modal-footer">
              <button 
                className="btn-cancel"
                onClick={() => setShowGuestModal(false)}
              >
                Cancel
              </button>
              <button 
                className="btn-confirm"
                onClick={handleConfirmGuests}
                disabled={guestCount < 1 || guestCount > tempTable.capacity}
              >
                <Check size={18} />
                Proceed to Order
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Bill Modal - LIKE CUSTOMERS.JSX */}
      {showBillModal && billTable && (
        <div className="modal-overlay" onClick={() => setShowBillModal(false)}>
          <div className="modal-content details-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <div>
                <h2>🧾 Invoice - Table #{billTable.number}</h2>
                <p>Order details and billing information</p>
              </div>
              <button 
                className="modal-close-btn"
                onClick={() => setShowBillModal(false)}
              >
                <X size={24} />
              </button>
            </div>

            <div className="modal-body">
              {(() => {
                const tableBill = getTableBill(billTable.number);
                if (!tableBill) {
                  return (
                    <div style={{ 
                      textAlign: 'center', 
                      padding: '60px 20px',
                      color: '#6B7280'
                    }}>
                      <Receipt size={64} style={{ marginBottom: '16px', opacity: 0.3 }} />
                      <h3>No Bill Found</h3>
                      <p>This table doesn't have any bills yet</p>
                    </div>
                  );
                }

                const billDetails = calculateBillDetails(tableBill);

                return (
                  <>
                    <div className="bill-info-section">
                      <div className="info-row">
                        <span className="info-label">Bill ID:</span>
                        <span className="info-value">#{tableBill.bill_id}</span>
                      </div>
                      <div className="info-row">
                        <span className="info-label">Date:</span>
                        <span className="info-value">{formatDate(tableBill.created_at || tableBill.bill_date)}</span>
                      </div>
                      <div className="info-row">
                        <span className="info-label">Order ID:</span>
                        <span className="info-value">#{tableBill.order_id}</span>
                      </div>
                      <div className="info-row">
                        <span className="info-label">Payment Status:</span>
                        <span className={`info-value status-${tableBill.payment_status.toLowerCase()}`}>
                          {tableBill.payment_status === 'Paid' ? '✅ PAID' : '⏳ PENDING'}
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
                  </>
                );
              })()}
            </div>

            <div className="modal-footer">
              <button 
                className="btn-secondary" 
                onClick={() => setShowBillModal(false)}
                disabled={billLoading}
              >
                Close
              </button>
              {(() => {
                const tableBill = getTableBill(billTable.number);
                return tableBill && (
                  <>
                    <button 
                      className="btn-primary"
                      onClick={() => handlePrintBill(tableBill)}
                      disabled={billLoading}
                    >
                      <Download size={18} />
                      Print Bill
                    </button>
                    {tableBill.payment_status === 'Pending' && (
                      <button 
                        className="btn-confirm"
                        onClick={handleBillPayment}
                        disabled={billLoading}
                      >
                        {billLoading ? (
                          <>⏳ Processing...</>
                        ) : (
                          <>
                            <Check size={18} />
                            💰 Mark as Paid
                          </>
                        )}
                      </button>
                    )}
                  </>
                );
              })()}
            </div>
          </div>
        </div>
      )}

      {/* Take Order Modal */}
      {showTakeOrderModal && orderTable && (
        <TakeOrderModal 
          table={orderTable}
          onClose={() => {
            setShowTakeOrderModal(false);
            setOrderTable(null);
          }}
          onOrderPlaced={async () => {
            console.log('🔄 Order placed! Refreshing bills...');
            await loadBills();
          }}
        />
      )}
    </div>
  );
};

export default ManageTable;

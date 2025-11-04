// src/pages/ManageTable/ManageTable.jsx - ✅ COMPLETE & FIXED

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { useOrders } from '../context/OrderContext';
import { useBill } from '../context/BillContext';
import { usePayment } from '../context/PaymentContext';
import { Users, X, Check, ShoppingCart, Receipt, Download } from 'lucide-react';
import { getBillsByOrderId } from '../api/billApi';
import TakeOrderModal from '../components/TakeOrderModal';
import './ManageTable.css';

const ManageTable = () => {
  const navigate = useNavigate();
  const { orders } = useOrders();
  const { createBill, markBillAsPaid: markBillAsPaidContext, getRevenue } = useBill();
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

  // ✅ DEBUG: Monitor orders
  useEffect(() => {
    console.log('🔄 ORDERS UPDATED:', orders);
    if (orders && orders.length > 0) {
      console.log('✅ TOTAL ORDERS:', orders.length);
      orders.forEach(order => {
        console.log(`📝 Order ID: ${order.order_id}, Table: ${order.table_number}, Items: ${order.items?.length || 0}`);
      });
    } else {
      console.log('⚠️ NO ORDERS DATA!');
    }
  }, [orders]);

  const areas = ['Main Dining', 'Terrace', 'Outdoor'];

  // ✅ FIXED: Get order for table (INCLUDES SERVED ORDERS)
  const getTableOrder = (tableNumber) => {
    if (!orders || orders.length === 0) {
      console.log('❌ No orders found');
      return null;
    }

    // 1️⃣ Filter all orders for this table
    const allOrders = orders.filter(order => 
      order.table_number === tableNumber && 
      order.items && 
      order.items.length > 0
    );
    
    console.log(`📊 Table ${tableNumber} - Found ${allOrders.length} orders`);
    
    if (allOrders.length === 0) {
      return null;
    }
    
    // 2️⃣ First: Check for active orders (not all served)
    const activeOrder = allOrders.find(order => 
      !order.items.every(item => item.status === 'served')
    );
    
    if (activeOrder) {
      console.log('✅ Active order found:', activeOrder.order_id);
      return activeOrder;
    }
    
    // 3️⃣ Second: Check for served orders (all items served)
    const servedOrders = allOrders.filter(order => 
      order.items.every(item => item.status === 'served')
    );
    
    if (servedOrders.length > 0) {
      const latestServed = servedOrders.sort((a, b) => 
        new Date(b.order_date) - new Date(a.order_date)
      )[0];
      console.log('✅ Served order found:', latestServed.order_id);
      return latestServed;
    }
    
    console.log('⚠️ No order found for table', tableNumber);
    return null;
  };

  const calculateBillDetails = (order) => {
    if (!order || !order.items) {
      return { subtotal: 0, tax: 0, total: 0 };
    }

    const subtotal = order.items.reduce((sum, item) => {
      const price = parseFloat(item.price) || 0;
      const quantity = parseInt(item.quantity) || 1;
      return sum + (price * quantity);
    }, 0);
    
    const tax = subtotal * 0.18;
    const total = subtotal + tax;
    
    return { subtotal, tax, total };
  };

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

  const handleAvailableClick = (table) => {
    setTempTable(table);
    setGuestCount(2);
    setShowGuestModal(true);
  };

  const handleConfirmGuests = () => {
    if (tempTable && guestCount > 0) {
      changeTableStatus(tempTable.id, 'occupied');
      setOrderTable(tempTable);
      setShowGuestModal(false);
      setShowTakeOrderModal(true);
      setTempTable(null);
      
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
    console.log('📊 BILL GENERATION START - Table:', table.number);
    console.log('🔍 Current Orders:', orders);
    
    const tableOrder = getTableOrder(table.number);
    
    if (!tableOrder) {
      console.log('❌ No order found!');
      toast.error(`⚠️ No orders for Table #${table.number}. Place order first!`, {
        position: 'top-right',
        autoClose: 3000,
      });
      return;
    }
    
    console.log('✅ Order found:', tableOrder);
    setBillTable(table);
    setShowBillModal(true);
    
    toast.info(`💰 Generating bill for Table #${table.number}`, {
      position: 'bottom-left',
      autoClose: 1500,
    });
  };

  const handlePrintBill = (order) => {
    try {
      const billDetails = calculateBillDetails(order);
      
      const printContent = `
        <!DOCTYPE html>
        <html>
        <head>
          <title>Bill - Table ${billTable.number}</title>
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
            <p>Invoice: ${order.order_id}</p>
          </div>
          <div class="bill-info">
            <p><strong>Date:</strong> ${formatDate(order.order_date)}</p>
            <p><strong>Table:</strong> ${order.table_number}</p>
            <p><strong>Customer:</strong> ${order.customer_name || 'Guest'}</p>
            <p><strong>Waiter:</strong> ${order.waiter_name || 'N/A'}</p>
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
                  <td>${item.dish_name || item.name}</td>
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

    const tableOrder = getTableOrder(billTable.number);
    
    if (!tableOrder || !tableOrder.items || tableOrder.items.length === 0) {
      toast.error('⚠️ No active order found!', {
        position: 'top-right',
        autoClose: 2000,
      });
      return;
    }

    try {
      setBillLoading(true);
      const billDetails = calculateBillDetails(tableOrder);

      console.log('💳 Processing payment for Table #' + billTable.number);

      toast.loading('⏳ Processing payment...', {
        position: 'center',
      });

      const newBill = await createBill({
        order_id: tableOrder.order_id,
        total_amount: billDetails.total,
        final_amount: billDetails.total,
        payment_status: 'pending'
      });

      console.log('✅ Bill created:', newBill.bill_id);

      const paymentResult = await processPaymentTransaction({
        bill_id: newBill.bill_id,
        amount: billDetails.total,
        payment_method: 'Cash'
      });

      console.log('✅ Payment processed:', paymentResult);

      await markBillAsPaidContext(newBill.bill_id);

      changeTableStatus(billTable.id, 'available');
      
      toast.success(
        `✅ Payment Successful!\n💰 Amount: ₹${billDetails.total.toFixed(2)}\n🟢 Table available!`,
        {
          position: 'top-center',
          autoClose: 3000,
        }
      );

      setShowBillModal(false);
      setBillTable(null);

    } catch (error) {
      console.error('❌ Error processing payment:', error);
      
      toast.error(`❌ Payment failed: ${error.message}`, {
        position: 'top-right',
        autoClose: 3000,
      });
    } finally {
      setBillLoading(false);
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

      {/* Bill Modal */}
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
                const tableOrder = getTableOrder(billTable.number);
                if (!tableOrder || !tableOrder.items || tableOrder.items.length === 0) {
                  return (
                    <div style={{ 
                      textAlign: 'center', 
                      padding: '60px 20px',
                      color: '#6B7280'
                    }}>
                      <Receipt size={64} style={{ marginBottom: '16px', opacity: 0.3 }} />
                      <h3>No Active Order</h3>
                      <p>This table doesn't have any active orders yet</p>
                    </div>
                  );
                }

                const billDetails = calculateBillDetails(tableOrder);

                return (
                  <>
                    <div className="bill-info-section">
                      <div className="info-row">
                        <span className="info-label">Date:</span>
                        <span className="info-value">{formatDate(tableOrder.order_date)}</span>
                      </div>
                      <div className="info-row">
                        <span className="info-label">Table:</span>
                        <span className="info-value">Table #{tableOrder.table_number}</span>
                      </div>
                      <div className="info-row">
                        <span className="info-label">Customer:</span>
                        <span className="info-value">{tableOrder.customer_name || 'Guest'}</span>
                      </div>
                      <div className="info-row">
                        <span className="info-label">Waiter:</span>
                        <span className="info-value">{tableOrder.waiter_name || 'N/A'}</span>
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
                          {tableOrder.items.map((item, index) => (
                            <tr key={index}>
                              <td>
                                <strong>{item.dish_name || item.name}</strong>
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
                const tableOrder = getTableOrder(billTable.number);
                return tableOrder && tableOrder.items && tableOrder.items.length > 0 && (
                  <>
                    <button 
                      className="btn-primary"
                      onClick={() => handlePrintBill(tableOrder)}
                      disabled={billLoading}
                    >
                      <Download size={18} />
                      Print Bill
                    </button>
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
                          💰 Collect Payment
                        </>
                      )}
                    </button>
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
        />
      )}
    </div>
  );
};

export default ManageTable;

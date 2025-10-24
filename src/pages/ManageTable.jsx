// src/pages/ManageTable/ManageTable.jsx

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useOrders } from '../context/OrderContext';
import { Users, Plus, X, Check, ShoppingCart, Receipt } from 'lucide-react';
import TakeOrderModal from '../components/TakeOrderModal';  
import './ManageTable.css';

const ManageTable = () => {
  const navigate = useNavigate();
  const { addOrder, completeOrder } = useOrders();
  
  const [selectedArea, setSelectedArea] = useState('Main Dining');
  const [selectedTable, setSelectedTable] = useState(null);
  const [showReservationModal, setShowReservationModal] = useState(false);
  const [showBillModal, setShowBillModal] = useState(false);
  const [billTable, setBillTable] = useState(null);
  const [showTakeOrderModal, setShowTakeOrderModal] = useState(false);  
  const [orderTable, setOrderTable] = useState(null);  
  const [showGuestModal, setShowGuestModal] = useState(false);
  const [guestCount, setGuestCount] = useState(2);
  const [tempTable, setTempTable] = useState(null);

  // ✅ Initial table data
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
    // ✅ Load from localStorage or use initial data
    const saved = localStorage.getItem('restaurantTables');
    return saved ? JSON.parse(saved) : initialTables;
  });

  // ✅ Save tables to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem('restaurantTables', JSON.stringify(tables));
  }, [tables]);

  const areas = ['Main Dining', 'Terrace', 'Outdoor'];

  // 🟢 Available button → Guest modal
  const handleAvailableClick = (table) => {
    setTempTable(table);
    setGuestCount(2);
    setShowGuestModal(true);
  };

  // 🟢 Confirm guests → Occupied → TakeOrder
  const handleConfirmGuests = () => {
    if (tempTable && guestCount > 0) {
      changeTableStatus(tempTable.id, 'occupied');
      setOrderTable(tempTable);
      setShowGuestModal(false);
      setShowTakeOrderModal(true);
      setTempTable(null);
    }
  };

  // 🔵 Occupied button → TakeOrder modal (add more orders)
  const handleOccupiedClick = (table) => {
    setOrderTable(table);
    setShowTakeOrderModal(true);
  };

  // 🟠 Bill button → Bill modal
  const handleGenerateBill = (table) => {
    setBillTable(table);
    setShowBillModal(true);
  };

  // 🟢 Bill Paid → Complete Order → Available
  const handleBillPayment = () => {
    if (billTable) {
      // ✅ Complete order in context (moves to completed bills)
      // Find order by table number if you're tracking it
      // completeOrder(orderId, { method: 'cash', tableNumber: billTable.number });
      
      // ✅ Change table to available
      changeTableStatus(billTable.id, 'available');
      alert(`✅ Bill paid for Table #${billTable.number}. Table is now available!`);
      setShowBillModal(false);
      setBillTable(null);
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

                {/* ✅ Button Logic */}
                <div className="table-quick-actions">
                  {/* 🟢 Available Table: Show "Available" button */}
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
                  
                  {/* 🔵 Occupied Table: Show "Occupied" + "Bill" buttons */}
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
          <div className="modal-content bill-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>🧾 Bill - Table #{billTable.number}</h2>
              <button 
                className="modal-close-btn"
                onClick={() => setShowBillModal(false)}
              >
                <X size={24} />
              </button>
            </div>

            <div className="modal-body">
              <div className="bill-summary">
                <h3>Order Summary</h3>
                <div className="bill-item">
                  <span>Subtotal:</span>
                  <span>₹850.00</span>
                </div>
                <div className="bill-item">
                  <span>Tax (18%):</span>
                  <span>₹153.00</span>
                </div>
                <div className="bill-item total">
                  <span><strong>Total:</strong></span>
                  <span><strong>₹1,003.00</strong></span>
                </div>
              </div>
            </div>

            <div className="modal-footer">
              <button 
                className="btn-cancel"
                onClick={() => setShowBillModal(false)}
              >
                Cancel
              </button>
              <button 
                className="btn-confirm"
                onClick={handleBillPayment}
              >
                <Check size={18} />
                Mark as Paid
              </button>
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

// src/pages/ManageTable/ManageTable.jsx

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useOrders } from '../context/OrderContext';
import { Users, Plus, X, Check, ShoppingCart, Receipt } from 'lucide-react';
import TakeOrderModal from '../components/TakeOrderModal';  
import './ManageTable.css';

const ManageTable = () => {
  const navigate = useNavigate();
  const { addOrder } = useOrders();
  
  const [selectedArea, setSelectedArea] = useState('Main Dining');
  const [selectedTable, setSelectedTable] = useState(null);
  const [showReservationModal, setShowReservationModal] = useState(false);
  const [showBillModal, setShowBillModal] = useState(false);
  const [billTable, setBillTable] = useState(null);
  const [showTakeOrderModal, setShowTakeOrderModal] = useState(false);  
  const [orderTable, setOrderTable] = useState(null);  

  const [tables, setTables] = useState([
    { id: 1, number: 1, capacity: 6, status: 'reserved', area: 'Main Dining' },
    { id: 2, number: 2, capacity: 2, status: 'occupied', area: 'Main Dining' },
    { id: 3, number: 3, capacity: 2, status: 'available', area: 'Main Dining' },
    { id: 4, number: 4, capacity: 3, status: 'occupied', area: 'Main Dining' },
    { id: 5, number: 5, capacity: 4, status: 'available', area: 'Main Dining' },
    { id: 6, number: 6, capacity: 7, status: 'available', area: 'Main Dining' },
    { id: 7, number: 7, capacity: 10, status: 'available', area: 'Main Dining' },
    { id: 8, number: 8, capacity: 2, status: 'reserved', area: 'Main Dining' },
    { id: 9, number: 9, capacity: 4, status: 'occupied', area: 'Main Dining' },
    { id: 10, number: 10, capacity: 2, status: 'reserved', area: 'Main Dining' },
    { id: 11, number: 11, capacity: 2, status: 'available', area: 'Terrace' },
    { id: 12, number: 12, capacity: 8, status: 'available', area: 'Terrace' },
    { id: 13, number: 13, capacity: 4, status: 'reserved', area: 'Terrace' },
    { id: 14, number: 14, capacity: 6, status: 'available', area: 'Outdoor' },
    { id: 15, number: 15, capacity: 4, status: 'occupied', area: 'Outdoor' }
  ]);

  const [newReservation, setNewReservation] = useState({
    name: '',
    time: '',
    guests: 2,
    phone: '',
    table: null
  });

  const areas = ['Main Dining', 'Terrace', 'Outdoor'];

  // ✅ Updated - Open modal instead of navigate
  const handleTakeOrder = (table) => {
    changeTableStatus(table.id, 'occupied');
    setOrderTable(table);
    setShowTakeOrderModal(true);
  };

  const handleGenerateBill = (table) => {
    setBillTable(table);
    setShowBillModal(true);
  };

  const handleBillPayment = () => {
    if (billTable) {
      changeTableStatus(billTable.id, 'available');
      alert(`Bill paid for Table #${billTable.number}. Table is now available!`);
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
    setTables(tables.map(table => 
      table.id === tableId ? { ...table, status: newStatus } : table
    ));
  };

  const filteredTables = tables.filter(table => table.area === selectedArea);

  const handleAddReservation = () => {
    if (newReservation.name && newReservation.table) {
      changeTableStatus(newReservation.table, 'reserved');
      
      setNewReservation({
        name: '',
        time: '',
        guests: 2,
        phone: '',
        table: null
      });
      
      setShowReservationModal(false);
      alert(`Reservation added for ${newReservation.name}`);
    } else {
      alert('Please fill in all required fields');
    }
  };

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
            <div className="legend-dot reserved"></div>
            <span>Reserved</span>
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
                    {table.status === 'occupied' ? '🍽️' : table.status === 'reserved' ? '🔒' : '🟢'}
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
                      className="quick-action-btn reserve"
                      onClick={(e) => {
                        e.stopPropagation();
                        setNewReservation({...newReservation, table: table.id});
                        setShowReservationModal(true);
                      }}
                    >
                      Reserve
                    </button>
                  )}
                  
                  {table.status === 'reserved' && (
                    <button 
                      className="quick-action-btn take-order"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleTakeOrder(table);
                      }}
                    >
                      <ShoppingCart size={16} />
                      Take Order
                    </button>
                  )}
                  
                  {table.status === 'occupied' && (
                    <>
                      <button 
                        className="quick-action-btn take-order"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleTakeOrder(table);
                        }}
                      >
                        <ShoppingCart size={16} />
                        Take Order
                      </button>
                      <button 
                        className="quick-action-btn generate-bill"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleGenerateBill(table);
                        }}
                      >
                        <Receipt size={16} />
                        Bill
                      </button>
                    </>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Add Reservation Modal */}
      {showReservationModal && (
        <div className="modal-overlay" onClick={() => setShowReservationModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Add New Reservation</h2>
              <button 
                className="modal-close-btn"
                onClick={() => setShowReservationModal(false)}
              >
                <X size={24} />
              </button>
            </div>

            <div className="modal-body">
              <div className="form-group">
                <label>Customer Name *</label>
                <input 
                  type="text"
                  placeholder="Enter customer name"
                  value={newReservation.name}
                  onChange={(e) => setNewReservation({...newReservation, name: e.target.value})}
                />
              </div>

              <div className="form-group">
                <label>Phone Number</label>
                <input 
                  type="tel"
                  placeholder="+84 xxx xxx xxx"
                  value={newReservation.phone}
                  onChange={(e) => setNewReservation({...newReservation, phone: e.target.value})}
                />
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Number of Guests *</label>
                  <input 
                    type="number"
                    min="1"
                    max="20"
                    value={newReservation.guests}
                    onChange={(e) => setNewReservation({...newReservation, guests: parseInt(e.target.value)})}
                  />
                </div>

                <div className="form-group">
                  <label>Table Number *</label>
                  <select 
                    value={newReservation.table || ''}
                    onChange={(e) => setNewReservation({...newReservation, table: parseInt(e.target.value)})}
                  >
                    <option value="">Select Table</option>
                    {tables.filter(t => t.status === 'available').map(table => (
                      <option key={table.id} value={table.id}>
                        Table #{table.number} ({table.capacity} seats) - {table.area}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="form-group">
                <label>Reservation Time *</label>
                <input 
                  type="time"
                  value={newReservation.time}
                  onChange={(e) => setNewReservation({...newReservation, time: e.target.value})}
                />
              </div>
            </div>

            <div className="modal-footer">
              <button 
                className="btn-cancel"
                onClick={() => setShowReservationModal(false)}
              >
                Cancel
              </button>
              <button 
                className="btn-confirm"
                onClick={handleAddReservation}
              >
                Add Reservation
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

      {/* ✅ Take Order Modal (NEW) */}
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

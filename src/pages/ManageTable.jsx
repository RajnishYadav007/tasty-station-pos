// src/pages/ManageTable/ManageTable.jsx

import React, { useState } from 'react';
import { ChevronLeft, ChevronRight, Search, Phone, Clock, Users, Plus, X, Check, Filter } from 'lucide-react';
import './ManageTable.css';

const ManageTable = () => {
  const [selectedFilter, setSelectedFilter] = useState('All');
  const [selectedArea, setSelectedArea] = useState('Main Dining');
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTable, setSelectedTable] = useState(null);
  const [showReservationModal, setShowReservationModal] = useState(false);
  
  const [reservations, setReservations] = useState([
    {
      id: 1,
      name: 'Uthman ibn Hunaif',
      time: '7:30 PM',
      table: 1,
      guests: 6,
      phone: '+84 678 890 000',
      status: 'payment',
      type: 'Dinner'
    },
    {
      id: 2,
      name: 'Bashir ibn Sa\'ad',
      time: '',
      table: 2,
      guests: 2,
      phone: '',
      status: 'on-dine',
      type: 'Dinner'
    },
    {
      id: 3,
      name: 'Ali',
      time: '8:00 PM',
      table: 3,
      guests: 2,
      phone: '+84 342 556 555',
      status: 'payment',
      type: 'Dinner'
    },
    {
      id: 4,
      name: 'Khunais ibn Hudhafa',
      time: '',
      table: 4,
      guests: 3,
      phone: '',
      status: 'on-dine',
      type: 'Dinner'
    },
    {
      id: 6,
      name: 'Mus\'ab ibn Umayr',
      time: '8:25 PM',
      table: 6,
      guests: 7,
      phone: '+84 800 563 554',
      status: 'unpaid',
      type: 'Dinner'
    },
    {
      id: 7,
      name: 'Shuja ibn Wahb',
      time: '9:00 PM',
      table: 7,
      guests: 10,
      phone: '',
      status: 'payment',
      type: 'Dinner'
    }
  ]);

  const [tables, setTables] = useState([
    { id: 1, number: 1, capacity: 6, status: 'available', area: 'Main Dining' },
    { id: 2, number: 2, capacity: 2, status: 'reserved', area: 'Main Dining' },
    { id: 3, number: 3, capacity: 2, status: 'available', area: 'Main Dining' },
    { id: 4, number: 4, capacity: 3, status: 'on-dine', area: 'Main Dining' },
    { id: 5, number: 5, capacity: 0, status: 'available', area: 'Main Dining' },
    { id: 6, number: 6, capacity: 7, status: 'available', area: 'Main Dining' },
    { id: 7, number: 7, capacity: 10, status: 'available', area: 'Main Dining' },
    { id: 8, number: 8, capacity: 2, status: 'reserved', area: 'Main Dining' },
    { id: 9, number: 9, capacity: 4, status: 'on-dine', area: 'Main Dining' },
    { id: 10, number: 10, capacity: 2, status: 'reserved', area: 'Main Dining' },
    { id: 11, number: 11, capacity: 2, status: 'available', area: 'Terrace' },
    { id: 12, number: 12, capacity: 8, status: 'available', area: 'Terrace' },
    { id: 13, number: 13, capacity: 4, status: 'reserved', area: 'Terrace' },
    { id: 14, number: 14, capacity: 6, status: 'available', area: 'Outdoor' },
    { id: 15, number: 15, capacity: 4, status: 'on-dine', area: 'Outdoor' }
  ]);

  const [newReservation, setNewReservation] = useState({
    name: '',
    time: '',
    guests: 2,
    phone: '',
    table: null
  });

  const areas = ['Main Dining', 'Terrace', 'Outdoor'];

  // Dynamic filter counts
  const getFilterCounts = () => {
    return {
      all: tables.length,
      reservation: tables.filter(t => t.status === 'reserved').length,
      onDine: tables.filter(t => t.status === 'on-dine').length
    };
  };

  const filterCounts = getFilterCounts();

  const filterOptions = [
    { name: 'All', count: filterCounts.all },
    { name: 'Reservation', count: filterCounts.reservation },
    { name: 'On Dine', count: filterCounts.onDine }
  ];

  // Format date
  const formatDate = (date) => {
    return date.toLocaleDateString('en-US', { 
      weekday: 'short', 
      day: 'numeric', 
      month: 'long', 
      year: 'numeric' 
    });
  };

  // Handle date change
  const handleDateChange = (direction) => {
    const newDate = new Date(selectedDate);
    newDate.setDate(newDate.getDate() + direction);
    setSelectedDate(newDate);
  };

  // Get table color based on status
  const getTableColor = (status) => {
    switch(status) {
      case 'available':
        return '#D4F4DD';
      case 'reserved':
        return '#FFE4E4';
      case 'on-dine':
        return '#E8D4F4';
      default:
        return '#F3F4F6';
    }
  };

  // Handle table click
  const handleTableClick = (table) => {
    setSelectedTable(table);
    console.log('Selected table:', table);
  };

  // Change table status
  const changeTableStatus = (tableId, newStatus) => {
    setTables(tables.map(table => 
      table.id === tableId ? { ...table, status: newStatus } : table
    ));
  };

  // Handle reservation click
  const handleReservationClick = (reservation) => {
    const table = tables.find(t => t.number === reservation.table);
    setSelectedTable(table);
    console.log('Selected reservation:', reservation);
  };

  // Filter reservations based on search and filter
  const filteredReservations = reservations.filter(res => {
    const matchesSearch = res.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         res.phone.includes(searchQuery);
    
    if (selectedFilter === 'All') return matchesSearch;
    if (selectedFilter === 'Reservation') return matchesSearch && res.status === 'payment';
    if (selectedFilter === 'On Dine') return matchesSearch && res.status === 'on-dine';
    
    return matchesSearch;
  });

  // Filter tables by area AND status filter
  const filteredTables = tables.filter(table => {
    const matchesArea = table.area === selectedArea;
    
    if (selectedFilter === 'All') return matchesArea;
    if (selectedFilter === 'Reservation') return matchesArea && table.status === 'reserved';
    if (selectedFilter === 'On Dine') return matchesArea && table.status === 'on-dine';
    
    return matchesArea;
  });

  // Add new reservation
  const handleAddReservation = () => {
    if (newReservation.name && newReservation.table) {
      const reservation = {
        id: Date.now(),
        name: newReservation.name,
        time: newReservation.time,
        table: newReservation.table,
        guests: newReservation.guests,
        phone: newReservation.phone,
        status: 'payment',
        type: 'Dinner'
      };
      
      setReservations([...reservations, reservation]);
      changeTableStatus(newReservation.table, 'reserved');
      
      setNewReservation({
        name: '',
        time: '',
        guests: 2,
        phone: '',
        table: null
      });
      
      setShowReservationModal(false);
      alert(`Reservation added for ${newReservation.name} at Table #${newReservation.table}`);
    } else {
      alert('Please fill in all required fields');
    }
  };

  // Delete reservation
  const handleDeleteReservation = (reservationId) => {
    const reservation = reservations.find(r => r.id === reservationId);
    if (reservation && window.confirm(`Delete reservation for ${reservation.name}?`)) {
      setReservations(reservations.filter(r => r.id !== reservationId));
      changeTableStatus(reservation.table, 'available');
    }
  };

  return (
    <div className="manage-table-page">
      {/* Left Sidebar - Reservations */}
      <div className="reservations-sidebar">
        <div className="reservations-header">
          <h1>Manage Tables</h1>
          
          {/* Filter Tabs with Dynamic Counts */}
          <div className="filter-tabs">
            {filterOptions.map(filter => (
              <button
                key={filter.name}
                className={`filter-tab ${selectedFilter === filter.name ? 'active' : ''}`}
                onClick={() => setSelectedFilter(filter.name)}
              >
                {filter.name} <span className="count-badge">{filter.count}</span>
              </button>
            ))}
          </div>

          {/* Date Navigation */}
          <div className="date-navigation">
            <button className="date-nav-btn" onClick={() => handleDateChange(-1)}>
              <ChevronLeft size={18} />
            </button>
            <span className="current-date">{formatDate(selectedDate)}</span>
            <button className="date-nav-btn" onClick={() => handleDateChange(1)}>
              <ChevronRight size={18} />
            </button>
          </div>

          {/* Search */}
          <div className="search-container">
            <Search size={18} className="search-icon" />
            <input 
              type="text" 
              placeholder="Search customers" 
              className="search-input"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <button className="filter-icon-btn">
              <Filter size={18} />
            </button>
          </div>
        </div>

        {/* Reservations List */}
        <div className="reservations-list">
          {filteredReservations.map((reservation) => (
            <div 
              key={reservation.id} 
              className={`reservation-card ${reservation.status} ${selectedTable?.number === reservation.table ? 'selected' : ''}`}
              onClick={() => handleReservationClick(reservation)}
            >
              <div className="reservation-card-header">
                <h3 className="reservation-name">{reservation.name}</h3>
                <span className="diner-badge">{reservation.type}</span>
              </div>

              <div className="reservation-details">
                <div className="detail-row">
                  <span className="detail-icon">🪑</span>
                  <span>Table {reservation.table}</span>
                </div>
                <div className="detail-row">
                  <Users size={14} />
                  <span>{reservation.guests}</span>
                </div>
              </div>

              {reservation.time && (
                <div className="reservation-time">
                  <Clock size={14} />
                  <span>{reservation.time}</span>
                </div>
              )}

              {reservation.phone && (
                <div className="reservation-phone">
                  <Phone size={14} />
                  <span>{reservation.phone}</span>
                </div>
              )}

              <div className="reservation-actions">
                {reservation.status === 'payment' && (
                  <div className="status-badge payment">
                    <Check size={14} />
                    <span>Payment</span>
                  </div>
                )}

                {reservation.status === 'on-dine' && (
                  <div className="status-badge on-dine">
                    <span>🍽️</span>
                    <span>On Dine</span>
                  </div>
                )}

                <button 
                  className="delete-reservation-btn"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDeleteReservation(reservation.id);
                  }}
                >
                  <X size={16} />
                </button>
              </div>
            </div>
          ))}

          {filteredReservations.length === 0 && (
            <div className="no-results">
              <p>No reservations found</p>
            </div>
          )}
        </div>

        {/* Add Reservation Button */}
        <button 
          className="add-reservation-btn"
          onClick={() => setShowReservationModal(true)}
        >
          <Plus size={20} />
          Add New Reservation
        </button>
      </div>

      {/* Right Section - Table Layout */}
      <div className="tables-main-section">
        {/* Area Tabs */}
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

        {/* Status Legend */}
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
            <div className="legend-dot on-dine"></div>
            <span>On Dine</span>
          </div>
        </div>

        {/* Table Grid */}
        <div className="table-layout-grid">
          {filteredTables.length === 0 ? (
            <div className="no-tables-message">
              <p>No tables found for {selectedFilter} in {selectedArea}</p>
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
                    {table.status === 'on-dine' ? '🍽️' : table.status === 'reserved' ? '🔒' : '🟢'}
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

                {/* Quick action buttons */}
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
                      className="quick-action-btn seat"
                      onClick={(e) => {
                        e.stopPropagation();
                        changeTableStatus(table.id, 'on-dine');
                      }}
                    >
                      Seat Guest
                    </button>
                  )}
                  {table.status === 'on-dine' && (
                    <button 
                      className="quick-action-btn free"
                      onClick={(e) => {
                        e.stopPropagation();
                        changeTableStatus(table.id, 'available');
                      }}
                    >
                      Free Table
                    </button>
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
    </div>
  );
};

export default ManageTable;

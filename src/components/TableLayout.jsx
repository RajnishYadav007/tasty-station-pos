// src/components/TableLayout/TableLayout.jsx

import React from 'react';
import { Users } from 'lucide-react';
import './TableLayout.css';

const TableLayout = ({ tables, onTableClick }) => {
  const getTableStatusColor = (status) => {
    switch (status) {
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

  const getTableIcon = (status) => {
    switch (status) {
      case 'available':
        return '🪑';
      case 'reserved':
        return '🔒';
      case 'on-dine':
        return '🍽️';
      default:
        return '🪑';
    }
  };

  return (
    <div className="table-layout-container">
      <div className="table-grid">
        {tables.map((table) => (
          <div
            key={table.id}
            className={`table-item ${table.status}`}
            style={{ backgroundColor: getTableStatusColor(table.status) }}
            onClick={() => onTableClick && onTableClick(table)}
          >
            <div className="table-icon">{getTableIcon(table.status)}</div>
            <div className="table-details">
              <h3 className="table-number">Table #{table.number}</h3>
              <div className="table-capacity">
                <Users size={16} />
                <span>{table.capacity}</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="table-legend">
        <div className="legend-item">
          <div className="legend-dot" style={{ backgroundColor: '#D4F4DD' }}></div>
          <span>Available</span>
        </div>
        <div className="legend-item">
          <div className="legend-dot" style={{ backgroundColor: '#FFE4E4' }}></div>
          <span>Reserved</span>
        </div>
        <div className="legend-item">
          <div className="legend-dot" style={{ backgroundColor: '#E8D4F4' }}></div>
          <span>On Dine</span>
        </div>
      </div>
    </div>
  );
};

export default TableLayout;

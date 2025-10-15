// src/components/OrderCard/OrderCard.jsx

import React from 'react';
import { Clock, ChevronRight } from 'lucide-react';
import './OrderCard.css';

const OrderCard = ({ order, onClick }) => {
  const getStatusColor = (status) => {
    switch (status.toLowerCase()) {
      case 'in kitchen':
        return '#14B8A6';
      case 'wait list':
        return '#EF4444';
      case 'ready':
        return '#A855F7';
      case 'served':
        return '#10B981';
      default:
        return '#6B7280';
    }
  };

  return (
    <div 
      className="order-card" 
      style={{ backgroundColor: order.bgColor }}
      onClick={onClick}
    >
      <div className="order-card-header">
        <div className="order-info">
          <span className="order-id">Order #{order.id}</span>
          <span className="table-badge">Table {order.tableNo}</span>
        </div>
        <ChevronRight size={20} className="chevron-icon" />
      </div>

      <div className="order-card-body">
        <div className="item-info">
          <span className="item-label">Item:</span>
          <span className="item-count">{order.items}</span>
        </div>
      </div>

      <div className="order-card-footer">
        <div className="time-info">
          <Clock size={14} />
          <span>{order.time}</span>
        </div>
        <span 
          className="order-status-badge"
          style={{ backgroundColor: getStatusColor(order.status) }}
        >
          {order.status}
        </span>
      </div>
    </div>
  );
};

export default OrderCard;

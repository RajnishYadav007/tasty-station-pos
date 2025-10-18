// src/pages/OrderLine.jsx

import React from 'react';
import { ChefHat, Clock, AlertCircle, CheckCircle, Bell } from 'lucide-react';
import './OrderLine.css';
import { useOrders } from '../context/OrderContext';  // ✅ Already imported

const OrderLine = () => {
  // ✅ Replace useState with useOrders hook
  const { orders, updateOrderStatus, getOrdersByStatus, calculateElapsedTime } = useOrders();

  // ✅ Use context function instead of local state
  const moveOrder = (orderId, newStatus) => {
    updateOrderStatus(orderId, newStatus);
  };

  // ✅ Get status counts
  const getStatusCount = (status) => {
    return orders.filter(order => order.status === status).length;
  };

  return (
    <div className="orderline-page">
      <div className="orderline-header">
        <div className="header-left">
          <ChefHat size={40} className="chef-icon" />
          <div>
            <h1>Kitchen Order Line</h1>
            <p>Track orders from preparation to serving</p>
          </div>
        </div>
        <div className="header-stats">
          <div className="stat-badge">
            <Bell size={20} />
            <span>{orders.length} Active Orders</span>
          </div>
        </div>
      </div>

      {/* Kanban Board - 4 Columns */}
      <div className="kanban-board">
        
        {/* Column 1: In Kitchen */}
        <div className="kanban-column in-kitchen">
          <div className="column-header">
            <div className="column-title">
              <ChefHat size={24} />
              <span>In Kitchen</span>
            </div>
            <span className="column-count">{getStatusCount('in-kitchen')}</span>
          </div>
          <div className="column-body">
            {getOrdersByStatus('in-kitchen').length === 0 ? (
              <div className="empty-column">
                <ChefHat size={48} />
                <p>No orders in kitchen</p>
              </div>
            ) : (
              getOrdersByStatus('in-kitchen').map(order => (
                <OrderTicket 
                  key={order.id} 
                  order={order}
                  onMove={() => moveOrder(order.id, 'wait')}
                  buttonText="Move to Wait"
                  buttonColor="#F59E0B"
                  calculateElapsedTime={calculateElapsedTime}
                />
              ))
            )}
          </div>
        </div>

        {/* Column 2: Wait */}
        <div className="kanban-column wait">
          <div className="column-header">
            <div className="column-title">
              <Clock size={24} />
              <span>Wait</span>
            </div>
            <span className="column-count">{getStatusCount('wait')}</span>
          </div>
          <div className="column-body">
            {getOrdersByStatus('wait').length === 0 ? (
              <div className="empty-column">
                <Clock size={48} />
                <p>No orders waiting</p>
              </div>
            ) : (
              getOrdersByStatus('wait').map(order => (
                <OrderTicket 
                  key={order.id} 
                  order={order}
                  onMove={() => moveOrder(order.id, 'ready')}
                  buttonText="Mark Ready"
                  buttonColor="#10B981"
                  calculateElapsedTime={calculateElapsedTime}
                />
              ))
            )}
          </div>
        </div>

        {/* Column 3: Ready */}
        <div className="kanban-column ready">
          <div className="column-header">
            <div className="column-title">
              <CheckCircle size={24} />
              <span>Ready</span>
            </div>
            <span className="column-count">{getStatusCount('ready')}</span>
          </div>
          <div className="column-body">
            {getOrdersByStatus('ready').length === 0 ? (
              <div className="empty-column">
                <CheckCircle size={48} />
                <p>Nothing ready yet</p>
              </div>
            ) : (
              getOrdersByStatus('ready').map(order => (
                <OrderTicket 
                  key={order.id} 
                  order={order}
                  onMove={() => moveOrder(order.id, 'served')}
                  buttonText="Mark Served"
                  buttonColor="#6366F1"
                  calculateElapsedTime={calculateElapsedTime}
                />
              ))
            )}
          </div>
        </div>

        {/* Column 4: Served */}
        <div className="kanban-column served">
          <div className="column-header">
            <div className="column-title">
              <AlertCircle size={24} />
              <span>Served</span>
            </div>
            <span className="column-count">{getStatusCount('served')}</span>
          </div>
          <div className="column-body">
            {getOrdersByStatus('served').length === 0 ? (
              <div className="empty-column">
                <AlertCircle size={48} />
                <p>No orders served</p>
              </div>
            ) : (
              getOrdersByStatus('served').map(order => (
                <OrderTicket 
                  key={order.id} 
                  order={order}
                  isServed={true}
                  calculateElapsedTime={calculateElapsedTime}
                />
              ))
            )}
          </div>
        </div>

      </div>
    </div>
  );
};

// Order Ticket Component
const OrderTicket = ({ order, onMove, buttonText, buttonColor, isServed, calculateElapsedTime }) => {
  return (
    <div className={`order-ticket ${order.priority}`}>
      <div className="ticket-header">
        <div className="ticket-id-section">
          <span className="ticket-id">{order.id}</span>
          <span className="table-badge">Table {order.tableNumber}</span>
        </div>
        <span className="ticket-time">
          {order.createdAt ? calculateElapsedTime(order.createdAt) : order.time}
        </span>
      </div>

      {/* ✅ Add Customer Name Section */}
      {order.customerName && (
        <div className="customer-name-section">
          <span className="customer-label">Customer:</span>
          <span className="customer-name">{order.customerName}</span>
        </div>
      )}

      <div className="ticket-items">
        {order.items && order.items.map((item, index) => (
          <div key={index} className="ticket-item">
            <span className="item-qty">{item.quantity}x</span>
            <div className="item-details">
              <span className="item-name">{item.name}</span>
              {item.notes && (
                <span className="item-notes">📝 {item.notes}</span>
              )}
            </div>
          </div>
        ))}
      </div>

      <div className="ticket-footer">
        <span className="waiter-name">👤 {order.waiter}</span>
        {!isServed && (
          <button 
            className="move-btn"
            style={{ backgroundColor: buttonColor }}
            onClick={onMove}
          >
            {buttonText}
          </button>
        )}
      </div>
    </div>
  );
};


export default OrderLine;

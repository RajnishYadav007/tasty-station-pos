import React, { useMemo, useState } from 'react';
import { ChefHat, Clock, AlertCircle, CheckCircle, Bell } from 'lucide-react';
import './OrderLine.css';
import { useOrders } from '../context/OrderContext';
import { useBill } from '../context/BillContext';  // ✅ ADD THIS


const OrderLine = () => {
  const { orders, updateItemStatus, calculateElapsedTime } = useOrders();
  const { createBill } = useBill();  // ✅ ADD THIS
  const [loadingItemId, setLoadingItemId] = useState(null);


  const getAllItems = useMemo(() => {
    const allItems = [];
    orders.forEach(order => {
      if (order.items && order.items.length > 0) {
        order.items.forEach((item, index) => {
          allItems.push({
            ...item,
            orderId: order.id,
            itemId: `${order.id}-${index}`,
            itemIndex: index,
            tableNumber: order.tableNumber,
            waiter: order.waiterName || order.waiter || 'Not Assigned',
            customerName: order.customerName || 'Guest',
            createdAt: order.createdAt,
            status: item.status || 'in-kitchen'
          });
        });
      }
    });
    return allItems;
  }, [orders]);


  const getItemsByStatusLocal = (status) => {
    return getAllItems.filter(item => item.status === status);
  };


  const getStatusCount = (status) => {
    return getItemsByStatusLocal(status).length;
  };


  // ✅ COMPLETE HANDLER WITH AUTO BILL
  const moveItem = async (orderId, itemIndex, newStatus) => {
  const itemId = `${orderId}-${itemIndex}`;
  try {
    setLoadingItemId(itemId);
    console.log('🔄 Moving:', { orderId, itemIndex, newStatus });
    
    await updateItemStatus(orderId, itemIndex, newStatus);
    console.log('✅ Item status updated');

    // ✅ AUTO BILL ON SERVED
    if (newStatus === 'served') {
      console.log('🧾 Creating bill automatically...');
      
      const order = orders.find(o => o.id === orderId || o.order_id === orderId);
      
      if (order && order.items && order.items.length > 0) {
        const billAmount = order.items.reduce((sum, item) => {
          return sum + (parseFloat(item.price) * parseInt(item.quantity));
        }, 0);
        
        const tax = billAmount * 0.18;
        
        try {
          const billData = {
            order_id: order.order_id || order.id,
            user_id: 1,
            total_amount: billAmount,
            discount_amount: 0,
            tax_amount: tax,
            final_amount: billAmount + tax,
            payment_method: 'Cash',
            payment_status: 'Pending',
            payment_date: new Date().toISOString()  // ✅ FIXED
          };
          
          const newBill = await createBill(billData);
          console.log('✅ Bill created successfully:', newBill.bill_id);
          alert(`✅ Item served!\n✅ Bill #${newBill.bill_id} created`);
          
        } catch (billError) {
          console.error('⚠️ Bill creation error (but item updated):', billError);
          alert('✅ Item served!\n⚠️ Bill error: ' + billError.message);
        }
      }
    }
    
  } catch (error) {
    console.error('❌ Error moving item:', error);
    alert('Failed to update item status: ' + error.message);
  } finally {
    setLoadingItemId(null);
  }
};



  return (
    <div className="orderline-page">
      <div className="orderline-header">
        <div className="header-left">
          <ChefHat size={40} className="chef-icon" />
          <div>
            <h1>Kitchen Order Line</h1>
            <p>Track individual items from preparation to serving</p>
          </div>
        </div>
        <div className="header-stats">
          <div className="stat-badge">
            <Bell size={20} />
            <span>{getAllItems.length} Active Items</span>
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
            {getItemsByStatusLocal('in-kitchen').length === 0 ? (
              <div className="empty-column">
                <ChefHat size={48} />
                <p>No items in kitchen</p>
              </div>
            ) : (
              getItemsByStatusLocal('in-kitchen').map(item => (
                <ItemCard 
                  key={item.itemId} 
                  item={item}
                  onMove={() => moveItem(item.orderId, item.itemIndex, 'wait')}
                  buttonText="Move to Wait"
                  buttonColor="#F59E0B"
                  isLoading={loadingItemId === `${item.orderId}-${item.itemIndex}`}
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
            {getItemsByStatusLocal('wait').length === 0 ? (
              <div className="empty-column">
                <Clock size={48} />
                <p>No items waiting</p>
              </div>
            ) : (
              getItemsByStatusLocal('wait').map(item => (
                <ItemCard 
                  key={item.itemId} 
                  item={item}
                  onMove={() => moveItem(item.orderId, item.itemIndex, 'ready')}
                  buttonText="Mark Ready"
                  buttonColor="#10B981"
                  isLoading={loadingItemId === `${item.orderId}-${item.itemIndex}`}
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
            {getItemsByStatusLocal('ready').length === 0 ? (
              <div className="empty-column">
                <CheckCircle size={48} />
                <p>Nothing ready yet</p>
              </div>
            ) : (
              getItemsByStatusLocal('ready').map(item => (
                <ItemCard 
                  key={item.itemId} 
                  item={item}
                  onMove={() => moveItem(item.orderId, item.itemIndex, 'served')}
                  buttonText="Mark Served"
                  buttonColor="#6366F1"
                  isLoading={loadingItemId === `${item.orderId}-${item.itemIndex}`}
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
            {getItemsByStatusLocal('served').length === 0 ? (
              <div className="empty-column">
                <AlertCircle size={48} />
                <p>No items served</p>
              </div>
            ) : (
              getItemsByStatusLocal('served').map(item => (
                <ItemCard 
                  key={item.itemId} 
                  item={item}
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

// ✅ Individual Item Card Component - WITH LOADING STATE
const ItemCard = ({ 
  item, 
  onMove, 
  buttonText, 
  buttonColor, 
  isServed, 
  isLoading,
  calculateElapsedTime 
}) => {
  return (
    <div className="item-card">
      <div className="item-card-header">
        <div className="item-card-top">
          <span className="table-badge-small">Table {item.tableNumber}</span>
          <span className="item-time">
            {item.createdAt ? calculateElapsedTime(item.createdAt) : ''}
          </span>
        </div>
      </div>

      {/* Item Details */}
      <div className="item-card-body">
        <div className="item-quantity-name">
          <span className="item-qty-large">{item.quantity}x</span>
          <span className="item-name-large">{item.name}</span>
        </div>
        
        {item.notes && (
          <div className="item-notes-card">
            📝 {item.notes}
          </div>
        )}
      </div>

      {/* Customer & Waiter Info */}
      <div className="item-card-footer">
        <div className="item-info-row">
          <span className="customer-name-small">👤 {item.customerName}</span>
          <span className="waiter-name-small">🍽️ {item.waiter}</span>
        </div>
        
        {!isServed && (
          <button 
            className="move-btn-item"
            style={{ 
              backgroundColor: buttonColor,
              opacity: isLoading ? 0.6 : 1,
              cursor: isLoading ? 'not-allowed' : 'pointer'
            }}
            onClick={onMove}
            disabled={isLoading}
          >
            {isLoading ? (
              <>⏳ Updating...</>
            ) : (
              buttonText
            )}
          </button>
        )}
      </div>
    </div>
  );
};

export default OrderLine;

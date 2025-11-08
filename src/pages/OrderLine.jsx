// src/pages/OrderLine/OrderLine.jsx - ✅ COMPLETE FIXED VERSION

import React, { useMemo, useState } from 'react';
import { toast } from 'react-toastify';
import { ChefHat, Clock, AlertCircle, CheckCircle, Bell } from 'lucide-react';
import './OrderLine.css';
import { useOrders } from '../context/OrderContext';
import { useBill } from '../context/BillContext';
import { 
  sendOrderReadyNotification,
  showBrowserNotification,
  requestNotificationPermission
} from '../api/notificationApi';


const OrderLine = () => {
  const { orders, updateItemStatus, calculateElapsedTime } = useOrders();
  const { createBill } = useBill();
  const [loadingItemId, setLoadingItemId] = useState(null);


  // ✅ Request notification permission on mount
  React.useEffect(() => {
    requestNotificationPermission().catch(console.error);
  }, []);


  const getAllItems = useMemo(() => {
    const allItems = [];
    orders.forEach(order => {
      if (order.items && order.items.length > 0) {
        order.items.forEach((item, index) => {
          allItems.push({
            ...item,
            orderId: order.id || order.order_id,
            itemId: `${order.id || order.order_id}-${index}`,
            itemIndex: index,
            tableNumber: order.tableNumber || order.table_number,
            tableId: order.table_id || order.tableId,
            waiter: order.waiterName || order.waiter || 'Not Assigned',
            customerName: order.customerName || order.customer_name || 'Guest',
            createdAt: order.createdAt || order.created_at,
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


  const moveItem = async (orderId, itemIndex, newStatus) => {
    const itemId = `${orderId}-${itemIndex}`;
    
    try {
      setLoadingItemId(itemId);
      console.log('🔄 Moving:', { orderId, itemIndex, newStatus });
      await updateItemStatus(orderId, itemIndex, newStatus);
      console.log('✅ Item status updated');

      toast.success(`✅ ${newStatus.replace('-', ' ')}`, {
        position: 'top-right',
        autoClose: 2000,
      });

      // ═══ NOTIFICATION - WHEN READY ═══
      if (newStatus === 'ready') {
        const order = orders.find(o => (o.id || o.order_id) === orderId);

        if (order) {
          const tableNumber = order.tableNumber || order.table_number;
          const tableId = order.table_id || order.tableId || tableNumber;

          // ✅ Get current item
          const currentItem = order.items[itemIndex];
          
          if (!currentItem) {
            console.error('❌ Item not found at index:', itemIndex);
            return;
          }

          // ✅ Extract dish name (try all possible keys)
          const dishName = 
            currentItem.dish_name || 
            currentItem.name || 
            currentItem.Dish?.dish_name || 
            currentItem.Dish?.name || 
            `Dish #${currentItem.dish_id || 'Unknown'}`;

          const quantity = parseInt(currentItem.quantity) || 1;

          console.log('🔍 SENDING NOTIFICATION WITH:');
          console.log('   - Dish Name:', dishName);
          console.log('   - Quantity:', quantity);
          console.log('   - Table:', tableNumber);

          // ✅ SEND NOTIFICATION WITH CORRECT PARAMETERS
          try {
            await sendOrderReadyNotification(
              orderId,
              tableNumber,
              dishName,    // ✅ Pass dish name
              quantity,    // ✅ Pass quantity
              tableId
            );
            
            console.log('✅ Notification sent successfully!');

            // Browser notification
            if (Notification.permission === 'granted') {
              showBrowserNotification(
                '🎉 Item Ready!',
                `Table ${tableNumber}: ${quantity}x ${dishName} is ready to serve!`,
                '✅'
              );
            }

            toast.success(`🔔 ${quantity}x ${dishName} ready!`, {
              position: 'bottom-right',
              autoClose: 2000,
            });

          } catch (notifError) {
            console.error('❌ Notification error:', notifError);
            toast.warning('⚠️ Notification failed', {
              position: 'bottom-right',
              autoClose: 2000,
            });
          }

          // ==== FULL ORDER CHECK ====
          const totalItems = order.items.length;
          const readyItems = order.items.filter(
            (itm, idx) => (idx === itemIndex ? newStatus : itm.status) === 'ready'
          ).length;

          if (readyItems === totalItems) {
            const allItemNames = order.items.map(itm => 
              itm.dish_name || itm.name || 'Item'
            ).join(', ');
            
            try {
              await sendOrderReadyNotification(
                orderId,
                tableNumber,
                `Full Order (${allItemNames})`,  // ✅ All dish names
                totalItems,                       // ✅ Total count
                tableId
              );

              if (Notification.permission === 'granted') {
                showBrowserNotification(
                  '🎉 Full Order Ready!',
                  `Table ${tableNumber}: All items ready!\n${allItemNames}`,
                  '✅'
                );
              }

              toast.info(`🟢 Full order ready!`, {
                position: 'bottom-right',
                autoClose: 3000,
              });
            } catch (err) {
              console.error('❌ Full order notification error:', err);
            }
          }
        }
      }

      // ═══ NOTIFICATION - WHEN WAIT ═══
      if (newStatus === 'wait') {
        const order = orders.find(o => (o.id || o.order_id) === orderId);
        if (order && Notification.permission === 'granted') {
          const currentItem = order.items[itemIndex];
          const dishName = 
            currentItem?.dish_name || 
            currentItem?.name || 
            'Item';
          const tableNumber = order.tableNumber || order.table_number;
          
          try {
            showBrowserNotification(
              '⏰ Item Waiting',
              `Table ${tableNumber}: ${dishName} is waiting`,
              '⏰'
            );
          } catch (err) {
            console.error('⚠️ Wait notification error:', err);
          }
        }
      }

      // ═══ AUTO BILL - WHEN SERVED ═══
      if (newStatus === 'served') {
        console.log('🧾 Creating bill automatically...');
        const order = orders.find(o => (o.id || o.order_id) === orderId);
        
        if (order && order.items && order.items.length > 0) {
          const billAmount = order.items.reduce((sum, item) => {
            return sum + (parseFloat(item.price || 0) * parseInt(item.quantity || 1));
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
              payment_date: new Date().toISOString()
            };
            
            const newBill = await createBill(billData);
            console.log('✅ Bill created:', newBill.bill_id);

            toast.success(`🧾 Bill #${newBill.bill_id} created!`, {
              position: 'bottom-right',
              autoClose: 3000,
            });

            const tableNumber = order.tableNumber || order.table_number;
            if (Notification.permission === 'granted') {
              try {
                showBrowserNotification(
                  '✅ Order Served!',
                  `Table ${tableNumber}: Bill #${newBill.bill_id} created`,
                  '✅'
                );
              } catch (err) {
                console.error('⚠️ Served notification error:', err);
              }
            }
            
          } catch (billError) {
            console.error('⚠️ Bill creation error:', billError);
            toast.warning('⚠️ Bill creation error. Order still served.', {
              position: 'bottom-right',
              autoClose: 3000,
            });
          }
        }
      }
    } catch (error) {
      console.error('❌ Error moving item:', error);
      toast.error(`❌ ${error.message || 'Error moving item'}`, {
        position: 'top-right',
        autoClose: 3000,
      });
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
            {item.createdAt ? calculateElapsedTime(item.createdAt) : '...'}
          </span>
        </div>
      </div>

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

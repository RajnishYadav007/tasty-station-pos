// src/components/TakeOrderModal/TakeOrderModal.jsx - ✅ WITH table_id PARAMETER

import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { X, Plus, Minus, ShoppingCart, Search } from 'lucide-react';
import './TakeOrderModal.css';
import { sendNewOrderNotification } from '../api/notificationApi';

import { getDishesWithCategory } from '../api/dishApi';
import { getCategoriesWithDishCount } from '../api/categoryApi';
import { addOrder } from '../api/orderApi';
import { addMultipleOrderDetails } from '../api/orderDetailsApi';
import { addOrderToBill } from '../api/billSessionApi';
import { useAuth } from '../context/AuthContext';

const TakeOrderModal = ({ table, onClose, onOrderPlaced }) => {
  const { currentUser } = useAuth();
  
  const [dishes, setDishes] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const [selectedCategory, setSelectedCategory] = useState('All Dishes');
  const [searchQuery, setSearchQuery] = useState('');
  const [cart, setCart] = useState([]);
  const [notes, setNotes] = useState({});
  const [customerName, setCustomerName] = useState('');
  const [waiterName, setWaiterName] = useState(currentUser?.name || 'Waiter 1');

  useEffect(() => {
    loadDishesData();
  }, []);

  const loadDishesData = async () => {
    try {
      setLoading(true);

      const categoriesData = await getCategoriesWithDishCount();
      
      const allCategories = [
        { 
          category_id: 0, 
          category_name: 'All Dishes',
          icon: '🍽️'
        },
        ...categoriesData.map(cat => ({
          ...cat,
          icon: getCategoryIcon(cat.category_name)
        }))
      ];
      
      setCategories(allCategories);

      const availableDishes = await getDishesWithCategory();

      const transformedDishes = availableDishes.map(dish => ({
        id: dish.dish_id,
        dish_id: dish.dish_id,
        name: dish.dish_name,
        price: parseFloat(dish.price) || 0,
        category: dish.Category?.category_name || dish.category_name || 'Other',
        category_id: dish.category_id,
        image: '🍽️',
        availability_status: dish.availability_status
      }));

      setDishes(transformedDishes);

    } catch (error) {
      console.error('❌ Error loading dishes:', error);
      
      toast.error(`Failed to load menu: ${error.message}`, {
        position: 'top-right',
        autoClose: 3000,
      });
      
      setDishes([]);
      setCategories([{ category_id: 0, category_name: 'All Dishes', icon: '🍽️' }]);
    } finally {
      setLoading(false);
    }
  };

  const getCategoryIcon = (categoryName) => {
    const iconMap = {
      'Breakfast': '🍳',
      'Beef Dishes': '🥩',
      'Biryani': '🍛',
      'Chicken Dishes': '🍗',
      'Desserts': '🍰',
      'Dinner': '🍽️',
      'Drinks': '🥤',
      'Fast Foods': '🍔',
      'Lunch': '🍱',
      'Platters': '🍱',
      'Salads': '🥗',
      'Side Dishes': '🍟',
      'Soups': '🍲'
    };
    return iconMap[categoryName] || '🍽️';
  };

  const filteredDishes = dishes.filter(dish => {
    const matchesCategory =
      selectedCategory === 'All Dishes' || dish.category === selectedCategory;

    const matchesSearch =
      !searchQuery ||
      (dish.name &&
       dish.name.toLowerCase().includes(searchQuery.toLowerCase()));

    return matchesCategory && matchesSearch;
  });

  const addToCart = (dish) => {
    const existingItem = cart.find(item => item.id === dish.id);

    if (existingItem) {
      setCart(
        cart.map(item =>
          item.id === dish.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        )
      );
    } else {
      setCart([...cart, { ...dish, quantity: 1 }]);
    }

    toast.success(`${dish.name} added!`, {
      position: 'bottom-right',
      autoClose: 1500,
    });
  };

  const removeFromCart = (dishId) => {
    const existingItem = cart.find(item => item.id === dishId);

    if (existingItem?.quantity === 1) {
      setCart(cart.filter(item => item.id !== dishId));
      const newNotes = { ...notes };
      delete newNotes[dishId];
      setNotes(newNotes);
      
      toast.info(`${existingItem.name} removed!`, {
        position: 'bottom-right',
        autoClose: 1500,
      });
    } else {
      setCart(
        cart.map(item =>
          item.id === dishId
            ? { ...item, quantity: item.quantity - 1 }
            : item
        )
      );
    }
  };

  const updateNotes = (dishId, note) => {
    setNotes({ ...notes, [dishId]: note });
  };

  const calculateTotal = () => {
    return cart.reduce((total, item) => total + item.price * item.quantity, 0);
  };

  // ✅ SUBMIT ORDER WITH table_id PARAMETER
  const handleSubmitOrder = async () => {
    if (cart.length === 0) {
      toast.warning('Please add items to cart', {
        position: 'top-right',
        autoClose: 2000,
      });
      return;
    }

    if (!customerName.trim()) {
      toast.warning('Please enter customer name', {
        position: 'top-right',
        autoClose: 2000,
      });
      return;
    }

    const tableNumber = table?.table_number || table?.number;
    const tableId = table?.table_id || table?.id;

    if (!tableNumber || !tableId) {
      toast.error('Invalid table information', {
        position: 'top-right',
        autoClose: 2000,
      });
      return;
    }

    try {
      setSubmitting(true);

      const loadingToastId = toast.loading('⏳ Sending order to kitchen...', {
        position: 'top-center',
        hideProgressBar: false,
        closeOnClick: false,
      });

      console.log('\n═══════════════════════════════════════');
      console.log('📝 SUBMITTING ORDER');
      console.log('═══════════════════════════════════════');
      console.log('Table Number:', tableNumber);
      console.log('Table ID:', tableId); // ✅ Log table_id
      console.log('Customer:', customerName);
      console.log('Waiter:', waiterName);
      console.log('Items:', cart.length);

      // ✅ STEP 1: Create order
      const orderResult = await addOrder({
        user_id: currentUser?.user_id || currentUser?.id || 1,
        waiter_id: currentUser?.user_id || currentUser?.id || 1,
        table_number: tableNumber,
        waiter_name: waiterName,
        customer_name: customerName,
        order_date: new Date().toISOString(),
        status: 'pending'
      });

      let orderId;
      if (Array.isArray(orderResult)) {
        if (orderResult.length === 0) {
          throw new Error('API returned empty array');
        }
        orderId = orderResult[0]?.order_id;
      } else if (typeof orderResult === 'object' && orderResult !== null) {
        orderId = orderResult?.order_id;
      } else {
        throw new Error(`Invalid response type: ${typeof orderResult}`);
      }

      if (!orderId) {
        throw new Error(`No order_id in response: ${JSON.stringify(orderResult)}`);
      }

      console.log('✅ Order created with ID:', orderId);

      // ✅ STEP 2: Link to bill session
      try {
        await addOrderToBill(tableId, orderId);
        console.log('✅ Order linked to bill session');
      } catch (billError) {
        console.warn('⚠️ Bill linking warning (continuing):', billError.message);
      }

      // ✅ STEP 3: Add order details
      const orderDetails = cart.map(item => ({
        order_id: orderId,
        dish_id: item.dish_id,
        quantity: item.quantity,
        price: item.price,
        discount: 0,
        status: 'in-kitchen',
        notes: notes[item.id] || ''
      }));

      await addMultipleOrderDetails(orderDetails);
      console.log('✅ Order details added');

      // ✅ STEP 4: Send notification to chef WITH table_id
      console.log('\n🔔 SENDING CHEF NOTIFICATION...');
      console.log('─────────────────────────────────────');
      
      try {
        const notificationResult = await sendNewOrderNotification(
          orderId, 
          tableNumber, 
          cart.length,
          tableId  // ✅ CRITICAL: Pass table_id
        );
        
        console.log('✅ Chef notification result:', notificationResult);
        
        if (notificationResult?.success) {
          console.log('✅ Chef notification sent successfully!');
          toast.info('🔔 Chef notified!', {
            position: 'bottom-left',
            autoClose: 2000,
          });
        } else {
          console.warn('⚠️ Notification returned success=false:', notificationResult);
        }
        
      } catch (notifError) {
        console.error('❌ CHEF NOTIFICATION ERROR:');
        console.error('  Message:', notifError.message);
        console.error('  Stack:', notifError.stack);
        
        toast.warning('⚠️ Could not notify chef (order still created)', {
          position: 'bottom-right',
          autoClose: 3000,
        });
      }
      
      console.log('─────────────────────────────────────\n');

      // ✅ Calculate totals
      const subtotal = calculateTotal();
      const tax = subtotal * 0.18;
      const total = subtotal + tax;

      toast.dismiss(loadingToastId);

      // ✅ Success toast
      toast.success(
        `🎉 Order #${orderId} sent to kitchen!\n📍 Table #${tableNumber}\n${cart.length} items • ₹${total.toFixed(2)}`,
        {
          position: 'top-right',
          autoClose: 3000,
        }
      );

      console.log('✅ ORDER COMPLETE:', {
        orderId,
        tableNumber,
        tableId,
        customer: customerName,
        items: cart.length,
        total: `₹${total.toFixed(2)}`
      });
      console.log('═══════════════════════════════════════\n');

      // ✅ STEP 5: Refresh parent
      if (onOrderPlaced) {
        try {
          await onOrderPlaced();
        } catch (callbackError) {
          console.error('⚠️ Callback error:', callbackError);
        }
      }

      // ✅ Reset form
      setCart([]);
      setNotes({});
      setCustomerName('');
      setWaiterName(currentUser?.name || 'Waiter 1');

      // ✅ Close modal
      onClose();

    } catch (error) {
      console.error('❌ ORDER SUBMISSION ERROR:', error);

      toast.error(
        `❌ Failed to submit order: ${error.message}`,
        {
          position: 'top-right',
          autoClose: 4000,
        }
      );
    } finally {
      setSubmitting(false);
    }
  };

  // Loading state (unchanged)
  if (loading) {
    return (
      <div className="modal-overlay" onClick={onClose}>
        <div className="take-order-modal" onClick={(e) => e.stopPropagation()}>
          <div style={{ 
            textAlign: 'center', 
            padding: '60px 40px', 
            color: '#666' 
          }}>
            <div className="spinner" style={{ 
              width: '40px', 
              height: '40px', 
              border: '4px solid #f3f3f3',
              borderTop: '4px solid #667eea',
              borderRadius: '50%',
              animation: 'spin 1s linear infinite',
              margin: '0 auto 20px'
            }}></div>
            <p>Loading menu...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="take-order-modal" onClick={(e) => e.stopPropagation()}>
        {/* Rest of JSX remains same - Header, Menu, Cart sections */}
        <div className="modal-header">
          <div>
            <h2>📋 Take Order - Table #{table?.table_number || table?.number || '?'}</h2>
            <p>Select items from menu</p>
          </div>
          <button className="modal-close-btn" onClick={onClose} disabled={submitting}>
            <X size={24} />
          </button>
        </div>

        <div className="modal-body-horizontal">
          {/* Left: Menu */}
          <div className="menu-section">
            <div className="customer-input-section">
              <input
                type="text"
                placeholder="👤 Customer Name *"
                className="customer-name-input"
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                disabled={submitting}
                required
              />
              <input
                type="text"
                placeholder="👨‍💼 Waiter Name"
                className="customer-name-input"
                value={waiterName}
                onChange={(e) => setWaiterName(e.target.value)}
                disabled={submitting}
              />
            </div>

            <div className="search-box">
              <Search size={18} />
              <input
                type="text"
                placeholder="Search dishes..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                disabled={submitting}
              />
            </div>

            <div className="category-tabs">
              {categories.map(category => (
                <button
                  key={category.category_id}
                  className={`category-tab ${
                    selectedCategory === category.category_name ? 'active' : ''
                  }`}
                  onClick={() => setSelectedCategory(category.category_name)}
                  disabled={submitting}
                >
                  <span style={{ marginRight: '4px' }}>{category.icon}</span>
                  {category.category_name}
                </button>
              ))}
            </div>

            <div className="dishes-grid-modal">
              {filteredDishes.length === 0 ? (
                <div className="no-dishes-modal">
                  <p>No dishes found in {selectedCategory}</p>
                </div>
              ) : (
                filteredDishes.map(dish => (
                  <div key={dish.id} className="dish-card-modal">
                    <div className="dish-image-modal">
                      <span className="dish-emoji-modal">{dish.image}</span>
                    </div>
                    <div className="dish-info-modal">
                      <h4>{dish.name}</h4>
                      <p className="dish-category-modal">{dish.category}</p>
                      <p className="dish-price-modal">
                        ₹{dish.price.toFixed(2)}
                      </p>
                    </div>
                    <button
                      className="add-dish-btn-modal"
                      onClick={() => addToCart(dish)}
                      disabled={submitting}
                    >
                      <Plus size={18} />
                      Add
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Right: Cart */}
          <div className="cart-section">
            <div className="cart-header">
              <ShoppingCart size={24} />
              <h3>Order Cart ({cart.length})</h3>
            </div>

            <div className="cart-items">
              {cart.length === 0 ? (
                <div className="empty-cart">
                  <ShoppingCart size={48} />
                  <p>No items added yet</p>
                </div>
              ) : (
                cart.map(item => (
                  <div key={item.id} className="cart-item">
                    <div className="cart-item-header">
                      <span className="item-emoji">{item.image}</span>
                      <div className="item-details">
                        <h4>{item.name}</h4>
                        <p>₹{item.price.toFixed(2)}</p>
                      </div>
                    </div>

                    <div className="quantity-controls">
                      <button
                        onClick={() => removeFromCart(item.id)}
                        disabled={submitting}
                      >
                        <Minus size={16} />
                      </button>
                      <span>{item.quantity}</span>
                      <button
                        onClick={() => addToCart(item)}
                        disabled={submitting}
                      >
                        <Plus size={16} />
                      </button>
                    </div>

                    <input
                      type="text"
                      placeholder="Special notes..."
                      className="item-notes-input"
                      value={notes[item.id] || ''}
                      onChange={(e) => updateNotes(item.id, e.target.value)}
                      disabled={submitting}
                    />

                    <div className="item-total">
                      ₹{(item.price * item.quantity).toFixed(2)}
                    </div>
                  </div>
                ))
              )}
            </div>

            {cart.length > 0 && (
              <>
                <div className="cart-total">
                  <span>Subtotal:</span>
                  <span className="total-amount">
                    ₹{calculateTotal().toFixed(2)}
                  </span>
                </div>

                <div
                  className="cart-total-tax"
                  style={{ fontSize: '12px', color: '#999' }}
                >
                  <span>Tax (18%):</span>
                  <span>₹{(calculateTotal() * 0.18).toFixed(2)}</span>
                </div>

                <div
                  className="cart-total"
                  style={{ fontSize: '14px', fontWeight: 'bold' }}
                >
                  <span>Total:</span>
                  <span>₹{(calculateTotal() * 1.18).toFixed(2)}</span>
                </div>

                <button
                  className="submit-order-btn"
                  onClick={handleSubmitOrder}
                  disabled={submitting || !customerName.trim()}
                  style={{
                    opacity: submitting || !customerName.trim() ? 0.6 : 1,
                    cursor:
                      submitting || !customerName.trim()
                        ? 'not-allowed'
                        : 'pointer'
                  }}
                >
                  <ShoppingCart size={20} />
                  {submitting ? '⏳ Submitting...' : '✅ Send to Kitchen'}
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default TakeOrderModal;

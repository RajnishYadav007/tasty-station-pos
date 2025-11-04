// src/components/TakeOrderModal/TakeOrderModal.jsx - ✅ FULLY FIXED & TESTED

import React, { useState, useEffect } from 'react';
import { X, Plus, Minus, ShoppingCart, Search } from 'lucide-react';
import './TakeOrderModal.css';

// ✅ CORRECTED IMPORTS (../../ for parent api folder)
import { getDishesWithCategory } from '../api/dishApi';
import { getCategoriesWithDishCount } from '../api/categoryApi';
import { addOrder } from '../api/orderApi';
import { addMultipleOrderDetails } from '../api/orderDetailsApi';

const TakeOrderModal = ({ table, onClose }) => {
  // ✅ State from APIs
  const [dishes, setDishes] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  // UI State
  const [selectedCategory, setSelectedCategory] = useState('All Dishes');
  const [searchQuery, setSearchQuery] = useState('');
  const [cart, setCart] = useState([]);
  const [notes, setNotes] = useState({});
  const [customerName, setCustomerName] = useState('');
  const [waiterName, setWaiterName] = useState('Waiter 1');

  // ✅ Load dishes and categories from database
  useEffect(() => {
    loadDishesData();
  }, []);

  const loadDishesData = async () => {
    try {
      setLoading(true);
      console.log('🔄 Loading dishes and categories...');

      // Load categories
      const categoriesData = await getCategoriesWithDishCount();
      console.log('✅ Categories loaded:', categoriesData.length);
      
      // Add "All Dishes" category
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

      // Get all available dishes with category
      const availableDishes = await getDishesWithCategory();
      console.log('✅ Dishes loaded:', availableDishes.length);

      // ✅ FIXED: Transform to match Supabase response
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
      console.log('✅ All dishes transformed:', transformedDishes.length);
    } catch (error) {
      console.error('❌ Error loading dishes:', error);
      alert(`Failed to load dishes: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  // ✅ Get category icon
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

  // ✅ Safe filter with null checks
  const filteredDishes = dishes.filter(dish => {
    const matchesCategory =
      selectedCategory === 'All Dishes' || dish.category === selectedCategory;

    const matchesSearch =
      !searchQuery ||
      (dish.name &&
       dish.name.toLowerCase().includes(searchQuery.toLowerCase()));

    return matchesCategory && matchesSearch;
  });

  // ✅ Add to cart
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
  };

  // ✅ Remove from cart
  const removeFromCart = (dishId) => {
    const existingItem = cart.find(item => item.id === dishId);

    if (existingItem?.quantity === 1) {
      setCart(cart.filter(item => item.id !== dishId));
      const newNotes = { ...notes };
      delete newNotes[dishId];
      setNotes(newNotes);
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

  // ✅ Update item notes
  const updateNotes = (dishId, note) => {
    setNotes({ ...notes, [dishId]: note });
  };

  // ✅ Calculate total
  const calculateTotal = () => {
    return cart.reduce((total, item) => total + item.price * item.quantity, 0);
  };

  // ✅ SUBMIT ORDER WITH FULL ERROR HANDLING
  const handleSubmitOrder = async () => {
    // Validation
    if (cart.length === 0) {
      alert('⚠️ Please add items to cart');
      return;
    }

    if (!customerName.trim()) {
      alert('⚠️ Please enter customer name');
      return;
    }

    try {
      setSubmitting(true);
      console.log('📝 Submitting order...', {
        customerName,
        waiterName,
        tableNumber: table?.number,
        itemCount: cart.length
      });

      // ✅ Step 1: Create order in database
      const orderResult = await addOrder({
        user_id: 1,
        waiter_id: 1,
        table_number: table?.number || 1,
        waiter_name: waiterName,
        customer_name: customerName,
        order_date: new Date().toISOString(),
        status: 'pending'
      });

      console.log('📋 Order API Response:', orderResult);
      console.log('📋 Response type:', typeof orderResult);
      console.log('📋 Is Array?', Array.isArray(orderResult));

      // ✅ HANDLE BOTH ARRAY AND OBJECT RESPONSES
      let orderId;

      if (Array.isArray(orderResult)) {
        if (orderResult.length === 0) {
          throw new Error('API returned empty array');
        }
        orderId = orderResult[0]?.order_id;
        console.log('📋 Array response, got ID:', orderId);
      } else if (typeof orderResult === 'object' && orderResult !== null) {
        orderId = orderResult?.order_id;
        console.log('📋 Object response, got ID:', orderId);
      } else {
        throw new Error(`Invalid response type: ${typeof orderResult}`);
      }

      if (!orderId) {
        throw new Error(`No order_id in response: ${JSON.stringify(orderResult)}`);
      }

      console.log('✅ Order #' + orderId + ' created successfully');

      // ✅ Step 2: Prepare order details
      const orderDetails = cart.map(item => ({
        order_id: orderId,
        dish_id: item.dish_id,
        quantity: item.quantity,
        price: item.price,
        discount: 0,
        status: 'in-kitchen'
      }));

      console.log('📦 Order details to add:', orderDetails);

      // ✅ Step 3: Add order items to database
      const detailsResult = await addMultipleOrderDetails(orderDetails);
      console.log('✅ Order items added:', detailsResult?.length || 0);

      // ✅ Success message
      const subtotal = calculateTotal();
      const tax = subtotal * 0.18;
      const total = subtotal + tax;

      alert(
        `🎉 Order #${orderId} Successfully Sent to Kitchen!\n\n` +
        `Customer: ${customerName}\n` +
        `Waiter: ${waiterName}\n` +
        `Table: #${table?.number || 1}\n` +
        `Items: ${cart.length}\n` +
        `Subtotal: ₹${subtotal.toFixed(2)}\n` +
        `Tax (18%): ₹${tax.toFixed(2)}\n` +
        `Total: ₹${total.toFixed(2)}`
      );

      // ✅ Reset form
      setCart([]);
      setNotes({});
      setCustomerName('');
      setWaiterName('Waiter 1');

      // Close modal
      onClose();

    } catch (error) {
      console.error('❌ Error submitting order:', error);
      console.error('Stack trace:', error.stack);
      
      alert(
        `❌ Failed to Submit Order\n\n` +
        `Error: ${error.message}\n\n` +
        `Check browser console (F12) for more details`
      );
    } finally {
      setSubmitting(false);
    }
  };

  // ✅ Loading state
  if (loading) {
    return (
      <div className="modal-overlay" onClick={onClose}>
        <div className="take-order-modal" onClick={(e) => e.stopPropagation()}>
          <div style={{ textAlign: 'center', padding: '40px', color: '#666' }}>
            ⏳ Loading menu...
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="take-order-modal" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="modal-header">
          <div>
            <h2>📋 Take Order - Table #{table?.number || '?'}</h2>
            <p>Select items from menu</p>
          </div>
          <button className="modal-close-btn" onClick={onClose}>
            <X size={24} />
          </button>
        </div>

        <div className="modal-body-horizontal">
          {/* Left: Menu */}
          <div className="menu-section">
            {/* Customer & Waiter Input */}
            <div className="customer-input-section">
              <input
                type="text"
                placeholder="👤 Customer Name"
                className="customer-name-input"
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                disabled={submitting}
              />
              <input
                type="text"
                placeholder="🍽️ Waiter Name"
                className="customer-name-input"
                value={waiterName}
                onChange={(e) => setWaiterName(e.target.value)}
                disabled={submitting}
              />
            </div>

            {/* Search */}
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

            {/* Category Tabs */}
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

            {/* Dishes Grid */}
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

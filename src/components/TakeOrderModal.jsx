// src/components/TakeOrderModal/TakeOrderModal.jsx

import React, { useState } from 'react';
import { X, Plus, Minus, ShoppingCart, Search } from 'lucide-react';
import { useMenu } from '../context/MenuContext';
import { useOrders } from '../context/OrderContext';
import { useAuth } from '../context/AuthContext';
import './TakeOrderModal.css';

const TakeOrderModal = ({ table, onClose }) => {
  const { dishes, getCategories } = useMenu();
  const { addOrder } = useOrders();
  const { currentUser } = useAuth();

  const [selectedCategory, setSelectedCategory] = useState('All Dishes');
  const [searchQuery, setSearchQuery] = useState('');
  const [cart, setCart] = useState([]);
  const [notes, setNotes] = useState({});
  const [customerName, setCustomerName] = useState(''); // ✅ CHANGE 1: Add state

  // Filter dishes
  const filteredDishes = dishes.filter(dish => {
    const matchesCategory = selectedCategory === 'All Dishes' || dish.category === selectedCategory;
    const matchesSearch = dish.name.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  // Add to cart
  const addToCart = (dish) => {
    const existingItem = cart.find(item => item.id === dish.id);
    
    if (existingItem) {
      setCart(cart.map(item =>
        item.id === dish.id
          ? { ...item, quantity: item.quantity + 1 }
          : item
      ));
    } else {
      setCart([...cart, { ...dish, quantity: 1 }]);
    }
  };

  // Remove from cart
  const removeFromCart = (dishId) => {
    const existingItem = cart.find(item => item.id === dishId);
    
    if (existingItem.quantity === 1) {
      setCart(cart.filter(item => item.id !== dishId));
      const newNotes = { ...notes };
      delete newNotes[dishId];
      setNotes(newNotes);
    } else {
      setCart(cart.map(item =>
        item.id === dishId
          ? { ...item, quantity: item.quantity - 1 }
          : item
      ));
    }
  };

  // Update item notes
  const updateNotes = (dishId, note) => {
    setNotes({ ...notes, [dishId]: note });
  };

  // Calculate total
  const calculateTotal = () => {
    return cart.reduce((total, item) => total + (item.price * item.quantity), 0);
  };

  // Submit order
  const handleSubmitOrder = () => {
    if (cart.length === 0) {
      alert('Please add items to cart');
      return;
    }

    const orderItems = cart.map(item => ({
      id: item.id,
      name: item.name,
      quantity: item.quantity,
      price: item.price,
      notes: notes[item.id] || ''
    }));

    addOrder({
      tableNumber: table.number,
      customerName: customerName || `Guest - Table ${table.number}`, // ✅ CHANGE 2: Use customer name
      waiterName: currentUser?.name || 'Waiter',
      items: orderItems,
      priority: 'medium',
      totalAmount: calculateTotal()
    });

    alert(`Order sent to kitchen for ${customerName || 'Table ' + table.number}!`);
    onClose();
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="take-order-modal" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="modal-header">
          <div>
            <h2>Take Order - Table #{table.number}</h2>
            <p>Select items from menu</p>
          </div>
          <button className="modal-close-btn" onClick={onClose}>
            <X size={24} />
          </button>
        </div>

        <div className="modal-body-horizontal">
          {/* Left: Menu */}
          <div className="menu-section">
            {/* ✅ CHANGE 3: Add Customer Name Input */}
            <div className="customer-input-section">
              <input
                type="text"
                placeholder="👤 Customer Name (Optional)"
                className="customer-name-input"
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
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
              />
            </div>

            {/* Category Tabs */}
            <div className="category-tabs">
              {getCategories().map(category => (
                <button
                  key={category}
                  className={`category-tab ${selectedCategory === category ? 'active' : ''}`}
                  onClick={() => setSelectedCategory(category)}
                >
                  {category}
                </button>
              ))}
            </div>

            {/* Dishes Grid */}
            <div className="dishes-grid-modal">
              {filteredDishes.length === 0 ? (
                <div className="no-dishes-modal">
                  <p>No dishes found</p>
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
                      <p className="dish-price-modal">₹{dish.price.toFixed(2)}</p>
                    </div>
                    <button 
                      className="add-dish-btn-modal"
                      onClick={() => addToCart(dish)}
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
                      <button onClick={() => removeFromCart(item.id)}>
                        <Minus size={16} />
                      </button>
                      <span>{item.quantity}</span>
                      <button onClick={() => addToCart(item)}>
                        <Plus size={16} />
                      </button>
                    </div>

                    <input
                      type="text"
                      placeholder="Special notes..."
                      className="item-notes-input"
                      value={notes[item.id] || ''}
                      onChange={(e) => updateNotes(item.id, e.target.value)}
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
                  <span>Total:</span>
                  <span className="total-amount">₹{calculateTotal().toFixed(2)}</span>
                </div>

                <button 
                  className="submit-order-btn"
                  onClick={handleSubmitOrder}
                >
                  <ShoppingCart size={20} />
                  Send to Kitchen
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

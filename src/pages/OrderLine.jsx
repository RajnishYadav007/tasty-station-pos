// src/pages/OrderLine/OrderLine.jsx

import React, { useState, useEffect } from 'react';
import { ChevronRight, ChevronLeft, Plus, Minus, Edit2, Trash2, Printer, X, Check, Users } from 'lucide-react';
import './OrderLine.css';

const OrderLine = () => {
  const [selectedFilter, setSelectedFilter] = useState('All');
  const [selectedCategory, setSelectedCategory] = useState('All Menu');
  const [paymentMethod, setPaymentMethod] = useState('Card');
  const [showEditTableModal, setShowEditTableModal] = useState(false);
  
  const [orders, setOrders] = useState([
    { id: 'F0027', table: '03', items: 8, status: 'In Kitchen', time: '2 mins ago', bgColor: '#D4F4DD', type: 'Dine In', timestamp: new Date() },
    { id: 'F0028', table: '07', items: 3, status: 'Wait List', time: 'Just Now', bgColor: '#FFE4E4', type: 'Wait List', timestamp: new Date() },
    { id: 'F0019', table: '09', items: 2, status: 'Ready', time: '26 mins ago', bgColor: '#E8D4F4', type: 'Dine In', timestamp: new Date(Date.now() - 26 * 60000) },
    { id: 'F0025', table: '05', items: 5, status: 'In Kitchen', time: '10 mins ago', bgColor: '#D4F4DD', type: 'Dine In', timestamp: new Date(Date.now() - 10 * 60000) },
    { id: 'F0026', table: '12', items: 1, status: 'Ready', time: '15 mins ago', bgColor: '#E8D4F4', type: 'Take Away', timestamp: new Date(Date.now() - 15 * 60000) },
    { id: 'F0024', table: '08', items: 4, status: 'Served', time: '45 mins ago', bgColor: '#E0E7FF', type: 'Served', timestamp: new Date(Date.now() - 45 * 60000) },
    { id: 'F0023', table: '06', items: 6, status: 'Served', time: '1 hour ago', bgColor: '#E0E7FF', type: 'Served', timestamp: new Date(Date.now() - 60 * 60000) },
    { id: 'F0022', table: '11', items: 2, status: 'Ready', time: '5 mins ago', bgColor: '#E8D4F4', type: 'Take Away', timestamp: new Date(Date.now() - 5 * 60000) }
  ]);

  const [cart, setCart] = useState([
    { id: 1, name: 'Pasta with Roast Beef', quantity: 2, price: 20.00 },
    { id: 2, name: 'Shrimp Rice Bowl', quantity: 2, price: 12.00 },
    { id: 3, name: 'Apple Stuffed Pancake', quantity: 1, price: 35.00 },
    { id: 4, name: 'Vegetable Shrimp', quantity: 1, price: 10.00 }
  ]);

  const [currentTable, setCurrentTable] = useState({
    number: '04',
    orderId: 'F0030',
    people: 2
  });

  const [editTableData, setEditTableData] = useState({
    number: '',
    orderId: '',
    people: 0
  });

  // All menu items with categories
  const initialMenuItems = [
    // Special Items
    { id: 1, name: 'Grilled Salmon Steak', category: 'Special', price: 15.00, image: '🐟' },
    { id: 2, name: 'Pasta with Roast Beef', category: 'Special', price: 10.00, image: '🍝' },
    { id: 3, name: 'Beef Steak', category: 'Special', price: 30.00, image: '🥩' },
    { id: 4, name: 'Truffle Pizza', category: 'Special', price: 25.00, image: '🍕' },
    { id: 5, name: 'Lobster Roll', category: 'Special', price: 35.00, image: '🦞' },
    
    // Soups
    { id: 6, name: 'Tomato Soup', category: 'Soups', price: 6.00, image: '🍲' },
    { id: 7, name: 'Mushroom Soup', category: 'Soups', price: 8.00, image: '🍲' },
    { id: 8, name: 'Chicken Soup', category: 'Soups', price: 7.00, image: '🍲' },
    
    // Desserts
    { id: 9, name: 'Apple Stuffed Pancake', category: 'Desserts', price: 35.00, image: '🥞' },
    { id: 10, name: 'Chocolate Cake', category: 'Desserts', price: 10.00, image: '🍰' },
    { id: 11, name: 'Ice Cream Sundae', category: 'Desserts', price: 8.00, image: '🍨' },
    { id: 12, name: 'Tiramisu', category: 'Desserts', price: 12.00, image: '🍰' },
    { id: 13, name: 'Cheesecake', category: 'Desserts', price: 11.00, image: '🍰' },
    { id: 14, name: 'Brownie', category: 'Desserts', price: 9.00, image: '🍫' },
    
    // Chickens
    { id: 15, name: 'Grilled Chicken', category: 'Chickens', price: 18.00, image: '🍗' },
    { id: 16, name: 'Chicken Quinoa & Herbs', category: 'Chickens', price: 12.00, image: '🍗' },
    { id: 17, name: 'Chicken Wings', category: 'Chickens', price: 14.00, image: '🍗' },
    { id: 18, name: 'Butter Chicken', category: 'Chickens', price: 16.00, image: '🍗' },
    { id: 19, name: 'Fried Chicken', category: 'Chickens', price: 15.00, image: '🍗' },
    
    // Additional items
    { id: 20, name: 'Tofu Poke Bowl', category: 'Salad', price: 7.00, image: '🥗' },
    { id: 21, name: 'Shrimp Rice Bowl', category: 'Rice', price: 6.00, image: '🍤' },
    { id: 22, name: 'Vegetable Shrimp', category: 'Salad', price: 10.00, image: '🥗' },
    { id: 23, name: 'Caesar Salad', category: 'Salad', price: 9.00, image: '🥗' }
  ];

  const [menuItems, setMenuItems] = useState(initialMenuItems);

  // Calculate dynamic filter counts
  const getFilterCounts = () => {
    return {
      all: orders.length,
      dineIn: orders.filter(o => o.type === 'Dine In').length,
      waitList: orders.filter(o => o.type === 'Wait List').length,
      takeAway: orders.filter(o => o.type === 'Take Away').length,
      served: orders.filter(o => o.type === 'Served').length
    };
  };

  const filterCounts = getFilterCounts();

  const filterTabs = [
    { name: 'All', count: filterCounts.all },
    { name: 'Dine In', count: filterCounts.dineIn },
    { name: 'Wait List', count: filterCounts.waitList },
    { name: 'Take Away', count: filterCounts.takeAway },
    { name: 'Served', count: filterCounts.served }
  ];

  // Calculate dynamic category counts
  const getCategoryCounts = () => {
    const counts = {};
    initialMenuItems.forEach(item => {
      counts[item.category] = (counts[item.category] || 0) + 1;
    });
    return counts;
  };

  const categoryCounts = getCategoryCounts();

  const menuCategories = [
    { name: 'All Menu', icon: '🍽️', count: initialMenuItems.length },
    { name: 'Special', icon: '⭐', count: categoryCounts['Special'] || 0 },
    { name: 'Soups', icon: '🍲', count: categoryCounts['Soups'] || 0 },
    { name: 'Desserts', icon: '🍰', count: categoryCounts['Desserts'] || 0 },
    { name: 'Chickens', icon: '🍗', count: categoryCounts['Chickens'] || 0 }
  ];

  // Filter orders based on selected filter
  const filteredOrders = orders.filter(order => {
    if (selectedFilter === 'All') return true;
    return order.type === selectedFilter;
  });

  // Filter menu items based on selected category
  const filteredMenuItems = menuItems.filter(item => {
    if (selectedCategory === 'All Menu') return true;
    return item.category === selectedCategory;
  });

  // Sync menu quantities with cart
  useEffect(() => {
    const updatedMenuItems = initialMenuItems.map(menuItem => {
      const cartItem = cart.find(item => item.name === menuItem.name);
      return {
        ...menuItem,
        quantity: cartItem ? cartItem.quantity : 0
      };
    });
    setMenuItems(updatedMenuItems);
  }, [cart]);

  // Calculate totals
  const subtotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const tax = 4.00;
  const donation = 1.00;
  const total = subtotal + tax + donation;

  // Update cart item quantity
  const updateCartItemQuantity = (itemId, change) => {
    setCart(prevCart => {
      return prevCart.map(item => {
        if (item.id === itemId) {
          const newQuantity = Math.max(1, item.quantity + change);
          return { ...item, quantity: newQuantity };
        }
        return item;
      });
    });
  };

  // Remove item from cart
  const removeFromCart = (itemId) => {
    if (window.confirm('Remove this item from cart?')) {
      setCart(prevCart => prevCart.filter(item => item.id !== itemId));
    }
  };

  // Update menu quantity and sync with cart
  const updateMenuQuantity = (menuItem, change) => {
    const cartItem = cart.find(item => item.name === menuItem.name);
    
    if (change > 0) {
      if (cartItem) {
        setCart(prevCart =>
          prevCart.map(item =>
            item.name === menuItem.name
              ? { ...item, quantity: item.quantity + 1 }
              : item
          )
        );
      } else {
        const newItem = {
          id: Date.now(),
          name: menuItem.name,
          quantity: 1,
          price: menuItem.price
        };
        setCart(prevCart => [...prevCart, newItem]);
      }
    } else {
      if (cartItem) {
        if (cartItem.quantity > 1) {
          setCart(prevCart =>
            prevCart.map(item =>
              item.name === menuItem.name
                ? { ...item, quantity: item.quantity - 1 }
                : item
            )
          );
        } else {
          setCart(prevCart => prevCart.filter(item => item.name !== menuItem.name));
        }
      }
    }
  };

  // Get quantity for menu item from cart
  const getMenuItemQuantity = (menuItemName) => {
    const cartItem = cart.find(item => item.name === menuItemName);
    return cartItem ? cartItem.quantity : 0;
  };

  // Handle edit table
  const handleEditTable = () => {
    setEditTableData({
      number: currentTable.number,
      orderId: currentTable.orderId,
      people: currentTable.people
    });
    setShowEditTableModal(true);
  };

  // Save edited table
  const handleSaveTable = () => {
    if (!editTableData.number || !editTableData.orderId || editTableData.people < 1) {
      alert('Please fill all fields correctly!');
      return;
    }
    
    setCurrentTable({
      number: editTableData.number,
      orderId: editTableData.orderId,
      people: editTableData.people
    });
    setShowEditTableModal(false);
    alert('Table details updated successfully!');
  };

  // Handle delete order
  const handleDeleteOrder = () => {
    if (cart.length === 0) {
      alert('No items to delete!');
      return;
    }

    if (window.confirm(`Delete entire order for Table #${currentTable.number}?\n\nThis will remove all ${cart.length} items from the cart.`)) {
      setCart([]);
      alert('Order deleted successfully!');
    }
  };

  // Place order
  const handlePlaceOrder = () => {
    if (cart.length === 0) {
      alert('Cart is empty!');
      return;
    }

    const newOrder = {
      id: currentTable.orderId,
      table: currentTable.number,
      items: cart.reduce((sum, item) => sum + item.quantity, 0),
      status: 'In Kitchen',
      time: 'Just Now',
      bgColor: '#D4F4DD',
      type: 'Dine In',
      timestamp: new Date()
    };

    setOrders([newOrder, ...orders]);

    const orderConfirmation = `Order Placed Successfully!

Table: #${currentTable.number}
Order ID: ${currentTable.orderId}
Items: ${cart.reduce((sum, item) => sum + item.quantity, 0)}
Total: $${total.toFixed(2)}
Payment: ${paymentMethod}`;

    alert(orderConfirmation);
    setCart([]);
    
    // Generate new order ID
    setCurrentTable({
      ...currentTable,
      orderId: `F${String(parseInt(currentTable.orderId.slice(1)) + 1).padStart(4, '0')}`
    });
  };

  // Print order
  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="order-line-page">
      {/* Main Content - Left Side */}
      <div className="order-main-section">
        <div className="order-header">
          <h1>Order Line</h1>
        </div>

        {/* Filter Tabs with Dynamic Counts */}
        <div className="filter-tabs-container">
          {filterTabs.map(tab => (
            <button
              key={tab.name}
              className={`filter-tab ${selectedFilter === tab.name ? 'active' : ''}`}
              onClick={() => setSelectedFilter(tab.name)}
            >
              {tab.name} <span className="count">{tab.count}</span>
            </button>
          ))}
        </div>

        {/* Filtered Order Cards */}
        <div className="order-cards-grid">
          {filteredOrders.length === 0 ? (
            <div className="no-orders-message">
              <p>No orders found for {selectedFilter}</p>
            </div>
          ) : (
            filteredOrders.map(order => (
              <div
                key={order.id}
                className="order-card"
                style={{ backgroundColor: order.bgColor }}
              >
                <div className="order-card-header">
                  <span className="order-id">Order #{order.id}</span>
                  <span className="table-no">Table {order.table}</span>
                </div>
                <div className="order-card-body">
                  <span className="item-count">Item: {order.items}X</span>
                </div>
                <div className="order-card-footer">
                  <span className="time">{order.time}</span>
                  <span className={`status ${order.status.toLowerCase().replace(' ', '-')}`}>
                    {order.status}
                  </span>
                </div>
              </div>
            ))
          )}
        </div>

        <div className="menu-section">
          <div className="menu-header">
            <h2>Foodies Menu</h2>
            <div className="nav-arrows">
              <button className="nav-arrow"><ChevronLeft size={20} /></button>
              <button className="nav-arrow"><ChevronRight size={20} /></button>
            </div>
          </div>

          {/* Category Tabs with Dynamic Counts */}
          <div className="category-tabs-scroll">
            {menuCategories.map(category => (
              <button
                key={category.name}
                className={`category-tab ${selectedCategory === category.name ? 'active' : ''}`}
                onClick={() => setSelectedCategory(category.name)}
              >
                <span className="cat-icon">{category.icon}</span>
                <div className="cat-info">
                  <div className="cat-name">{category.name}</div>
                  <div className="cat-count">{category.count} items</div>
                </div>
              </button>
            ))}
          </div>

          {/* Filtered Menu Items Grid */}
          <div className="menu-items-grid">
            {filteredMenuItems.length === 0 ? (
              <div className="no-items-message">
                <p>No items found in {selectedCategory}</p>
              </div>
            ) : (
              filteredMenuItems.map(item => {
                const currentQuantity = getMenuItemQuantity(item.name);
                
                return (
                  <div key={item.id} className="menu-item-card">
                    <div className="menu-item-image">
                      <span className="food-icon">{item.image}</span>
                    </div>
                    <div className="menu-item-content">
                      <span className="menu-category">{item.category}</span>
                      <h3 className="menu-item-name">{item.name}</h3>
                      <div className="menu-item-footer">
                        <span className="menu-price">${item.price.toFixed(2)}</span>
                        <div className="quantity-controls">
                          <button
                            className="qty-btn minus"
                            onClick={() => updateMenuQuantity(item, -1)}
                            disabled={currentQuantity === 0}
                          >
                            <Minus size={16} />
                          </button>
                          <span className="qty-value">{currentQuantity}</span>
                          <button
                            className="qty-btn plus"
                            onClick={() => updateMenuQuantity(item, 1)}
                          >
                            <Plus size={16} />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>

      {/* Right Sidebar - Cart */}
      <div className="cart-sidebar">
        <div className="cart-header">
          <div className="table-info">
            <div className="table-header-row">
              <h2>Table No #{currentTable.number}</h2>
              <div className="header-icons">
                <button className="icon-btn" onClick={handleEditTable} title="Edit Table">
                  <Edit2 size={18} />
                </button>
                <button className="icon-btn delete" onClick={handleDeleteOrder} title="Delete Order">
                  <Trash2 size={18} />
                </button>
              </div>
            </div>
            <p className="order-id-text">Order #{currentTable.orderId}</p>
            <p className="people-count">
              <Users size={14} />
              {currentTable.people} People
            </p>
          </div>
        </div>

        <div className="ordered-items-section">
          <div className="section-title">
            <h3>Ordered Items</h3>
            <span className="items-badge">
              {cart.reduce((sum, item) => sum + item.quantity, 0).toString().padStart(2, '0')}
            </span>
          </div>

          <div className="cart-items-list">
            {cart.length === 0 ? (
              <div className="empty-cart">
                <p>No items in cart</p>
              </div>
            ) : (
              cart.map(item => (
                <div key={item.id} className="cart-item">
                  <div className="cart-item-left">
                    <span className="cart-qty">{item.quantity}×</span>
                    <span className="cart-item-name">{item.name}</span>
                  </div>
                  <div className="cart-item-right">
                    <span className="cart-item-price">${(item.price * item.quantity).toFixed(2)}</span>
                    <div className="cart-item-controls">
                      <button
                        className="cart-control-btn minus"
                        onClick={() => updateCartItemQuantity(item.id, -1)}
                        title="Decrease quantity"
                      >
                        <Minus size={12} />
                      </button>
                      <button
                        className="cart-control-btn plus"
                        onClick={() => updateCartItemQuantity(item.id, 1)}
                        title="Increase quantity"
                      >
                        <Plus size={12} />
                      </button>
                      <button
                        className="cart-control-btn delete"
                        onClick={() => removeFromCart(item.id)}
                        title="Remove item"
                      >
                        <Trash2 size={12} />
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        <div className="payment-summary-section">
          <h3>Payment Summary</h3>
          <div className="summary-rows">
            <div className="summary-row">
              <span>Subtotal</span>
              <span>${subtotal.toFixed(2)}</span>
            </div>
            <div className="summary-row">
              <span>Tax</span>
              <span>${tax.toFixed(2)}</span>
            </div>
            <div className="summary-row">
              <span>Donation for Palestine</span>
              <span>${donation.toFixed(2)}</span>
            </div>
          </div>
          <div className="summary-total">
            <span>Total Payable</span>
            <span className="total-amount">${total.toFixed(2)}</span>
          </div>
        </div>

        <div className="payment-method-section">
          <h3>Payment Method</h3>
          <div className="payment-options">
            <button
              className={`payment-option ${paymentMethod === 'Cash' ? 'active' : ''}`}
              onClick={() => setPaymentMethod('Cash')}
            >
              <span className="payment-icon">💵</span>
              <span>Cash</span>
            </button>
            <button
              className={`payment-option ${paymentMethod === 'Card' ? 'active' : ''}`}
              onClick={() => setPaymentMethod('Card')}
            >
              <span className="payment-icon">💳</span>
              <span>Card</span>
            </button>
            <button
              className={`payment-option ${paymentMethod === 'Scan' ? 'active' : ''}`}
              onClick={() => setPaymentMethod('Scan')}
            >
              <span className="payment-icon">📱</span>
              <span>Scan</span>
            </button>
          </div>
        </div>

        <div className="action-buttons-section">
          <button className="print-btn" onClick={handlePrint}>
            <Printer size={18} />
            <span>Print</span>
          </button>
          <button className="place-order-btn" onClick={handlePlaceOrder}>
            <span>⏱️</span>
            <span>Place Order</span>
          </button>
        </div>
      </div>

      {/* Edit Table Modal */}
      {showEditTableModal && (
        <div className="modal-overlay" onClick={() => setShowEditTableModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Edit Table Details</h2>
              <button className="modal-close-btn" onClick={() => setShowEditTableModal(false)}>
                <X size={24} />
              </button>
            </div>

            <div className="modal-body">
              <div className="form-group">
                <label>Table Number *</label>
                <input
                  type="text"
                  placeholder="Table number"
                  value={editTableData.number}
                  onChange={(e) => setEditTableData({...editTableData, number: e.target.value})}
                />
              </div>

              <div className="form-group">
                <label>Order ID *</label>
                <input
                  type="text"
                  placeholder="Order ID"
                  value={editTableData.orderId}
                  onChange={(e) => setEditTableData({...editTableData, orderId: e.target.value})}
                />
              </div>

              <div className="form-group">
                <label>Number of People *</label>
                <input
                  type="number"
                  min="1"
                  max="20"
                  placeholder="Number of people"
                  value={editTableData.people}
                  onChange={(e) => setEditTableData({...editTableData, people: parseInt(e.target.value) || 0})}
                />
              </div>
            </div>

            <div className="modal-footer">
              <button className="btn-cancel" onClick={() => setShowEditTableModal(false)}>
                Cancel
              </button>
              <button className="btn-confirm" onClick={handleSaveTable}>
                <Check size={18} />
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default OrderLine;

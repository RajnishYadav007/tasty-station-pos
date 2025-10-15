// src/components/MenuCard/MenuCard.jsx

import React, { useState } from 'react';
import { Plus, Minus } from 'lucide-react';
import './MenuCard.css';

const MenuCard = ({ item, onAddToCart }) => {
  const [quantity, setQuantity] = useState(0);

  const handleIncrement = () => {
    const newQty = quantity + 1;
    setQuantity(newQty);
    if (onAddToCart) {
      onAddToCart(item, newQty);
    }
  };

  const handleDecrement = () => {
    if (quantity > 0) {
      const newQty = quantity - 1;
      setQuantity(newQty);
      if (onAddToCart) {
        onAddToCart(item, newQty);
      }
    }
  };

  return (
    <div className="menu-card">
      <div className="menu-card-image">
        <div className="image-placeholder">
          <span className="food-emoji">{item.emoji || '🍽️'}</span>
        </div>
      </div>
      
      <div className="menu-card-content">
        <span className="menu-card-category">{item.category}</span>
        <h3 className="menu-card-title">{item.name}</h3>
        
        <div className="menu-card-footer">
          <span className="menu-card-price">${item.price.toFixed(2)}</span>
          
          <div className="menu-card-quantity">
            <button 
              className="qty-btn minus" 
              onClick={handleDecrement}
              disabled={quantity === 0}
            >
              <Minus size={16} />
            </button>
            <span className="qty-display">{quantity}</span>
            <button className="qty-btn plus" onClick={handleIncrement}>
              <Plus size={16} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MenuCard;

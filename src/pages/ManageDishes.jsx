// src/pages/ManageDishes/ManageDishes.jsx

import React, { useState } from 'react';
import { Plus, Search, Grid, List, Filter, X, Edit2, Trash2, Check } from 'lucide-react';
import './ManageDishes.css';

const ManageDishes = () => {
  const [viewMode, setViewMode] = useState('grid');
  const [selectedCategory, setSelectedCategory] = useState('All Dishes');
  const [searchQuery, setSearchQuery] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedDishes, setSelectedDishes] = useState([]);
  const [editingDish, setEditingDish] = useState(null);

  const [categories, setCategories] = useState([
    { name: 'All Dishes', count: 154, icon: '🍽️' },
    { name: 'Breakfast', count: 12, icon: '🍳' },
    { name: 'Beef Dishes', count: 5, icon: '🥩' },
    { name: 'Biryani', count: 8, icon: '🍛' },
    { name: 'Chicken Dishes', count: 10, icon: '🍗' },
    { name: 'Desserts', count: 19, icon: '🍰' },
    { name: 'Dinner', count: 8, icon: '🍽️' },
    { name: 'Drinks', count: 15, icon: '🥤' },
    { name: 'Fast Foods', count: 25, icon: '🍔' },
    { name: 'Lunch', count: 20, icon: '🍱' },
    { name: 'Platters', count: 14, icon: '🍱' },
    { name: 'Salads', count: 8, icon: '🥗' },
    { name: 'Side Dishes', count: 4, icon: '🍟' },
    { name: 'Soups', count: 3, icon: '🍲' }
  ]);

  // Complete dishes list with all categories
  const [dishes, setDishes] = useState([
    // Desserts
    { id: 1, name: 'Cheese Syrniky Pancakes', price: 8.00, category: 'Desserts', image: '🥞' },
    { id: 2, name: 'Apple Stuffed Pancake', price: 10.00, category: 'Desserts', image: '🥞' },
    { id: 3, name: 'Terracotta Bowl', price: 12.00, category: 'Desserts', image: '🍮' },
    { id: 4, name: 'Croissant Dessert', price: 15.00, category: 'Desserts', image: '🥐' },
    { id: 5, name: 'Granola Banana & Berry', price: 10.00, category: 'Desserts', image: '🥗' },
    { id: 6, name: 'Vanilla Cherry Cupcake', price: 8.00, category: 'Desserts', image: '🧁' },
    { id: 7, name: 'Belgian Waffles', price: 20.00, category: 'Desserts', image: '🧇' },
    { id: 8, name: 'Granola with Yoghurt', price: 15.00, category: 'Desserts', image: '🥣' },
    { id: 9, name: 'Chocolate Pancake', price: 12.00, category: 'Desserts', image: '🥞' },
    { id: 10, name: 'Muesli Bowl', price: 10.00, category: 'Desserts', image: '🥗' },
    { id: 11, name: 'Waffles with ice-cream', price: 10.00, category: 'Desserts', image: '🧇' },
    { id: 12, name: 'Fruit Salad', price: 9.00, category: 'Desserts', image: '🍓' },
    { id: 13, name: 'Ice Cream Sundae', price: 11.00, category: 'Desserts', image: '🍨' },
    { id: 14, name: 'Tiramisu', price: 14.00, category: 'Desserts', image: '🍰' },
    
    // Breakfast
    { id: 15, name: 'Eggs Benedict', price: 12.00, category: 'Breakfast', image: '🍳' },
    { id: 16, name: 'French Toast', price: 10.00, category: 'Breakfast', image: '🍞' },
    { id: 17, name: 'Breakfast Burrito', price: 11.00, category: 'Breakfast', image: '🌯' },
    { id: 18, name: 'Omelette Special', price: 9.00, category: 'Breakfast', image: '🍳' },
    { id: 19, name: 'Avocado Toast', price: 8.00, category: 'Breakfast', image: '🥑' },
    
    // Beef Dishes
    { id: 20, name: 'Beef Steak', price: 30.00, category: 'Beef Dishes', image: '🥩' },
    { id: 21, name: 'Beef Burger', price: 15.00, category: 'Beef Dishes', image: '🍔' },
    { id: 22, name: 'Beef Tacos', price: 12.00, category: 'Beef Dishes', image: '🌮' },
    { id: 23, name: 'Beef Stroganoff', price: 18.00, category: 'Beef Dishes', image: '🍲' },
    { id: 24, name: 'BBQ Beef Ribs', price: 25.00, category: 'Beef Dishes', image: '🍖' },
    
    // Biryani
    { id: 25, name: 'Chicken Biryani', price: 14.00, category: 'Biryani', image: '🍛' },
    { id: 26, name: 'Mutton Biryani', price: 16.00, category: 'Biryani', image: '🍛' },
    { id: 27, name: 'Vegetable Biryani', price: 12.00, category: 'Biryani', image: '🍛' },
    { id: 28, name: 'Egg Biryani', price: 10.00, category: 'Biryani', image: '🍛' },
    
    // Chicken Dishes
    { id: 29, name: 'Grilled Chicken', price: 18.00, category: 'Chicken Dishes', image: '🍗' },
    { id: 30, name: 'Chicken Tikka', price: 15.00, category: 'Chicken Dishes', image: '🍗' },
    { id: 31, name: 'Butter Chicken', price: 16.00, category: 'Chicken Dishes', image: '🍗' },
    { id: 32, name: 'Chicken Wings', price: 12.00, category: 'Chicken Dishes', image: '🍗' },
    { id: 33, name: 'Chicken Quinoa', price: 14.00, category: 'Chicken Dishes', image: '🍗' },
    
    // Drinks
    { id: 34, name: 'Fresh Orange Juice', price: 5.00, category: 'Drinks', image: '🥤' },
    { id: 35, name: 'Mango Smoothie', price: 6.00, category: 'Drinks', image: '🥤' },
    { id: 36, name: 'Iced Coffee', price: 4.00, category: 'Drinks', image: '☕' },
    { id: 37, name: 'Green Tea', price: 3.00, category: 'Drinks', image: '🍵' },
    { id: 38, name: 'Lemonade', price: 4.00, category: 'Drinks', image: '🥤' },
    
    // Fast Foods
    { id: 39, name: 'Classic Burger', price: 10.00, category: 'Fast Foods', image: '🍔' },
    { id: 40, name: 'Cheese Pizza', price: 12.00, category: 'Fast Foods', image: '🍕' },
    { id: 41, name: 'Hot Dog', price: 8.00, category: 'Fast Foods', image: '🌭' },
    { id: 42, name: 'French Fries', price: 5.00, category: 'Fast Foods', image: '🍟' },
    { id: 43, name: 'Fried Chicken', price: 11.00, category: 'Fast Foods', image: '🍗' },
    
    // Salads
    { id: 44, name: 'Caesar Salad', price: 9.00, category: 'Salads', image: '🥗' },
    { id: 45, name: 'Greek Salad', price: 10.00, category: 'Salads', image: '🥗' },
    { id: 46, name: 'Garden Salad', price: 8.00, category: 'Salads', image: '🥗' },
    { id: 47, name: 'Chicken Salad', price: 12.00, category: 'Salads', image: '🥗' },
    
    // Soups
    { id: 48, name: 'Tomato Soup', price: 6.00, category: 'Soups', image: '🍲' },
    { id: 49, name: 'Chicken Soup', price: 7.00, category: 'Soups', image: '🍲' },
    { id: 50, name: 'Mushroom Soup', price: 8.00, category: 'Soups', image: '🍲' }
  ]);

  const [newDish, setNewDish] = useState({
    name: '',
    price: '',
    category: 'Desserts',
    image: '🍽️'
  });

  // Filter dishes based on category and search
  const filteredDishes = dishes.filter(dish => {
    const matchesCategory = selectedCategory === 'All Dishes' || dish.category === selectedCategory;
    const matchesSearch = dish.name.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  // Update category counts dynamically
  const updateCategoryCounts = () => {
    const counts = {};
    dishes.forEach(dish => {
      counts[dish.category] = (counts[dish.category] || 0) + 1;
    });
    
    setCategories(categories.map(cat => ({
      ...cat,
      count: cat.name === 'All Dishes' ? dishes.length : (counts[cat.name] || 0)
    })));
  };

  // Handle checkbox selection
  const handleSelectDish = (dishId) => {
    if (selectedDishes.includes(dishId)) {
      setSelectedDishes(selectedDishes.filter(id => id !== dishId));
    } else {
      setSelectedDishes([...selectedDishes, dishId]);
    }
  };

  // Add new dish
  const handleAddDish = () => {
    if (newDish.name && newDish.price) {
      const dish = {
        id: Date.now(),
        name: newDish.name,
        price: parseFloat(newDish.price),
        category: selectedCategory === 'All Dishes' ? 'Desserts' : selectedCategory,
        image: newDish.image || '🍽️'
      };
      
      setDishes([...dishes, dish]);
      updateCategoryCounts();
      
      setNewDish({ name: '', price: '', category: selectedCategory, image: '🍽️' });
      setShowAddModal(false);
      alert(`${dish.name} added successfully!`);
    } else {
      alert('Please fill in all required fields');
    }
  };

  // Edit dish
  const handleEditDish = () => {
    if (editingDish && editingDish.name && editingDish.price) {
      setDishes(dishes.map(dish => 
        dish.id === editingDish.id ? editingDish : dish
      ));
      setEditingDish(null);
      setShowEditModal(false);
      alert('Dish updated successfully!');
    }
  };

  // Delete dishes
  const handleDeleteDishes = () => {
    if (selectedDishes.length > 0 && window.confirm(`Delete ${selectedDishes.length} dish(es)?`)) {
      setDishes(dishes.filter(dish => !selectedDishes.includes(dish.id)));
      updateCategoryCounts();
      setSelectedDishes([]);
      alert('Selected dishes deleted!');
    }
  };

  // Open edit modal
  const openEditModal = (dish) => {
    setEditingDish({ ...dish });
    setShowEditModal(true);
  };

  // Handle category change
  const handleCategoryChange = (categoryName) => {
    setSelectedCategory(categoryName);
    setSelectedDishes([]); // Clear selections when changing category
  };

  return (
    <div className="manage-dishes-page">
      {/* Left Sidebar - Categories */}
      <div className="categories-sidebar">
        <h2 className="sidebar-title">Dishes Category</h2>
        
        <div className="categories-list">
          {categories.map(category => (
            <div
              key={category.name}
              className={`category-item ${selectedCategory === category.name ? 'active' : ''}`}
              onClick={() => handleCategoryChange(category.name)}
            >
              <span className="category-icon">{category.icon}</span>
              <span className="category-name">{category.name}</span>
              <span className="category-count">{category.count}</span>
            </div>
          ))}
        </div>

        <button className="add-category-btn">
          <Plus size={20} />
          Add New Category
        </button>
      </div>

      {/* Main Content */}
      <div className="dishes-main-content">
        {/* Header */}
        <div className="dishes-header">
          <h1>Manage Dishes</h1>
          
          <div className="header-actions">
            <div className="search-box">
              <Search size={18} />
              <input
                type="text"
                placeholder="Search dishes"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            
            <button className="add-dish-btn" onClick={() => setShowAddModal(true)}>
              <Plus size={20} />
              Add New Dishes
            </button>
          </div>
        </div>

        {/* Category Title and Controls */}
        <div className="content-controls">
          <h2 className="category-title">
            {selectedCategory} ({filteredDishes.length})
          </h2>
          
          <div className="control-buttons">
            <div className="view-toggle">
              <button
                className={`view-btn ${viewMode === 'grid' ? 'active' : ''}`}
                onClick={() => setViewMode('grid')}
              >
                <Grid size={20} />
              </button>
              <button
                className={`view-btn ${viewMode === 'list' ? 'active' : ''}`}
                onClick={() => setViewMode('list')}
              >
                <List size={20} />
              </button>
            </div>
            
            <button className="filter-btn">
              <Filter size={18} />
              Filter
            </button>
            
            {selectedDishes.length > 0 && (
              <button className="delete-selected-btn" onClick={handleDeleteDishes}>
                <Trash2 size={18} />
                Delete ({selectedDishes.length})
              </button>
            )}
          </div>
        </div>

        {/* Dishes Grid */}
        <div className={`dishes-grid ${viewMode}`}>
          {/* Add New Dish Card */}
          {selectedCategory !== 'All Dishes' && (
            <div className="add-dish-card" onClick={() => setShowAddModal(true)}>
              <div className="add-icon-circle">
                <Plus size={40} />
              </div>
              <p>Add New Dish to<br/>{selectedCategory}</p>
            </div>
          )}

          {/* Dish Cards */}
          {filteredDishes.map(dish => (
            <div key={dish.id} className="dish-card">
              <div className="dish-checkbox">
                <input
                  type="checkbox"
                  checked={selectedDishes.includes(dish.id)}
                  onChange={() => handleSelectDish(dish.id)}
                />
              </div>
              
              <div className="dish-image">
                <span className="dish-emoji">{dish.image}</span>
              </div>
              
              <div className="dish-info">
                <span className="dish-category-label">{dish.category}</span>
                <h3 className="dish-name">{dish.name}</h3>
                <p className="dish-price">${dish.price.toFixed(2)}</p>
              </div>
              
              <div className="dish-actions">
                <button
                  className="edit-dish-btn"
                  onClick={() => openEditModal(dish)}
                >
                  <Edit2 size={16} />
                </button>
                <button
                  className="delete-dish-btn"
                  onClick={() => {
                    if (window.confirm(`Delete ${dish.name}?`)) {
                      setDishes(dishes.filter(d => d.id !== dish.id));
                      updateCategoryCounts();
                    }
                  }}
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
          ))}
        </div>

        {filteredDishes.length === 0 && (
          <div className="no-dishes">
            <p>No dishes found in {selectedCategory}</p>
          </div>
        )}
      </div>

      {/* Add Dish Modal */}
      {showAddModal && (
        <div className="modal-overlay" onClick={() => setShowAddModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Add New Dish</h2>
              <button className="modal-close-btn" onClick={() => setShowAddModal(false)}>
                <X size={24} />
              </button>
            </div>

            <div className="modal-body">
              <div className="form-group">
                <label>Dish Name *</label>
                <input
                  type="text"
                  placeholder="Enter dish name"
                  value={newDish.name}
                  onChange={(e) => setNewDish({ ...newDish, name: e.target.value })}
                />
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Price *</label>
                  <input
                    type="number"
                    step="0.01"
                    placeholder="0.00"
                    value={newDish.price}
                    onChange={(e) => setNewDish({ ...newDish, price: e.target.value })}
                  />
                </div>

                <div className="form-group">
                  <label>Category</label>
                  <select
                    value={selectedCategory === 'All Dishes' ? 'Desserts' : selectedCategory}
                    onChange={(e) => setNewDish({ ...newDish, category: e.target.value })}
                  >
                    {categories.filter(c => c.name !== 'All Dishes').map(cat => (
                      <option key={cat.name} value={cat.name}>{cat.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="form-group">
                <label>Image Emoji</label>
                <input
                  type="text"
                  placeholder="🍽️"
                  value={newDish.image}
                  onChange={(e) => setNewDish({ ...newDish, image: e.target.value })}
                />
              </div>
            </div>

            <div className="modal-footer">
              <button className="btn-cancel" onClick={() => setShowAddModal(false)}>
                Cancel
              </button>
              <button className="btn-confirm" onClick={handleAddDish}>
                <Check size={18} />
                Add Dish
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Dish Modal */}
      {showEditModal && editingDish && (
        <div className="modal-overlay" onClick={() => setShowEditModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Edit Dish</h2>
              <button className="modal-close-btn" onClick={() => setShowEditModal(false)}>
                <X size={24} />
              </button>
            </div>

            <div className="modal-body">
              <div className="form-group">
                <label>Dish Name *</label>
                <input
                  type="text"
                  value={editingDish.name}
                  onChange={(e) => setEditingDish({ ...editingDish, name: e.target.value })}
                />
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Price *</label>
                  <input
                    type="number"
                    step="0.01"
                    value={editingDish.price}
                    onChange={(e) => setEditingDish({ ...editingDish, price: parseFloat(e.target.value) })}
                  />
                </div>

                <div className="form-group">
                  <label>Category</label>
                  <select
                    value={editingDish.category}
                    onChange={(e) => setEditingDish({ ...editingDish, category: e.target.value })}
                  >
                    {categories.filter(c => c.name !== 'All Dishes').map(cat => (
                      <option key={cat.name} value={cat.name}>{cat.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="form-group">
                <label>Image Emoji</label>
                <input
                  type="text"
                  value={editingDish.image}
                  onChange={(e) => setEditingDish({ ...editingDish, image: e.target.value })}
                />
              </div>
            </div>

            <div className="modal-footer">
              <button className="btn-cancel" onClick={() => setShowEditModal(false)}>
                Cancel
              </button>
              <button className="btn-confirm" onClick={handleEditDish}>
                <Check size={18} />
                Update Dish
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ManageDishes;

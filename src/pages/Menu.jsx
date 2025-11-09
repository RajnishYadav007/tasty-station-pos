// src/pages/Menu/Menu.jsx - ✅ FINAL VERSION

import React, { useState, useEffect } from 'react';
import { Plus, Search, Grid, List, Filter, Edit2, Trash2 } from 'lucide-react';
import './Menu.css';

// ✅ Import APIs
import { getCategories, getCategoriesWithDishCount } from '../api/categoryApi';
import { getDishes, getDishesWithCategory, getDishesByCategory, searchDishesByName, addDish, updateDish, deleteDish } from '../api/dishApi';

// ✅ IMPORT AUTH CONTEXT - ADD THIS LINE
import { useAuth } from '../context/AuthContext';

const Menu = () => {
  // ✅ GET isOwner FROM AUTH CONTEXT - CHANGE THIS LINE
  const { isOwner } = useAuth();

  const [viewMode, setViewMode] = useState('grid');
  const [selectedCategory, setSelectedCategory] = useState('All Dishes');
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);

  // ✅ State for API data
  const [categories, setCategories] = useState([]);
  const [dishes, setDishes] = useState([]);
  const [filteredDishes, setFilteredDishes] = useState([]);

  // ✅ Modal states
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingDish, setEditingDish] = useState(null);
  const [formData, setFormData] = useState({
    dish_name: '',
    price: '',
    category_id: '',
    availability_status: true,
    image_url: ''
  });

  // ✅ Load categories and dishes from database
  useEffect(() => {
    loadMenuData();
  }, );

  const loadMenuData = async () => {
    try {
      setLoading(true);

      // Load categories with dish counts
      const categoriesData = await getCategoriesWithDishCount();
      
      // Add "All Dishes" category
      const totalDishes = categoriesData.reduce((sum, cat) => sum + cat.dish_count, 0);
      const allCategories = [
        { 
          category_id: 0, 
          category_name: 'All Dishes', 
          dish_count: totalDishes,
          icon: '🍽️' 
        },
        ...categoriesData.map(cat => ({
          ...cat,
          icon: getCategoryIcon(cat.category_name)
        }))
      ];

      setCategories(allCategories);

      // Load all dishes with category details
      const dishesData = await getDishesWithCategory();
      setDishes(dishesData);
      setFilteredDishes(dishesData);

    } catch (error) {
      console.error('Error loading menu data:', error);
    } finally {
      setLoading(false);
    }
  };

  // ✅ Get category icon based on name
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

  // ✅ Filter dishes by category and search
  useEffect(() => {
    filterDishes();
  }, [selectedCategory, searchQuery, dishes]);

  const filterDishes = async () => {
    try {
      let filtered = [];

      // If searching, use search API
      if (searchQuery.trim()) {
        filtered = await searchDishesByName(searchQuery);
        
        // Apply category filter if not "All Dishes"
        if (selectedCategory !== 'All Dishes') {
          const category = categories.find(c => c.category_name === selectedCategory);
          if (category) {
            filtered = filtered.filter(d => d.category_id === category.category_id);
          }
        }
      } else {
        // No search, filter by category
        if (selectedCategory === 'All Dishes') {
          filtered = dishes;
        } else {
          const category = categories.find(c => c.category_name === selectedCategory);
          if (category) {
            filtered = await getDishesByCategory(category.category_id);
          }
        }
      }

      setFilteredDishes(filtered);
    } catch (error) {
      console.error('Error filtering dishes:', error);
    }
  };

  // Handle category change
  const handleCategoryChange = (categoryName) => {
    setSelectedCategory(categoryName);
  };

  // ✅ ADD Dish
  const handleAddDish = async () => {
    if (!formData.dish_name || !formData.price || !formData.category_id) {
      alert('❌ Please fill all fields');
      return;
    }

    try {
      const newDish = await addDish({
        dish_name: formData.dish_name,
        price: parseFloat(formData.price),
        category_id: parseInt(formData.category_id),
        availability_status: formData.availability_status,
        image_url: formData.image_url || null
      });

      console.log('✅ Dish added:', newDish);
      alert('✅ Dish added successfully!');
      
      // Reset form
      setFormData({
        dish_name: '',
        price: '',
        category_id: '',
        availability_status: true,
        image_url: ''
      });
      setShowAddModal(false);
      
      // Reload menu
      loadMenuData();
    } catch (error) {
      console.error('❌ Error adding dish:', error);
      alert(`❌ Failed: ${error.message}`);
    }
  };

  // ✅ EDIT Dish
  const handleEditDish = (dish) => {
    setEditingDish(dish);
    setFormData({
      dish_name: dish.dish_name,
      price: dish.price,
      category_id: dish.category_id,
      availability_status: dish.availability_status,
      image_url: dish.image_url || ''
    });
    setShowAddModal(true);
  };

  // ✅ UPDATE Dish
  const handleUpdateDish = async () => {
    try {
      await updateDish(editingDish.dish_id, {
        dish_name: formData.dish_name,
        price: parseFloat(formData.price),
        category_id: parseInt(formData.category_id),
        availability_status: formData.availability_status,
        image_url: formData.image_url || null
      });

      console.log('✅ Dish updated:', editingDish.dish_id);
      alert('✅ Dish updated successfully!');
      
      // Reset form
      setFormData({
        dish_name: '',
        price: '',
        category_id: '',
        availability_status: true,
        image_url: ''
      });
      setEditingDish(null);
      setShowAddModal(false);
      
      // Reload menu
      loadMenuData();
    } catch (error) {
      console.error('❌ Error updating dish:', error);
      alert(`❌ Failed: ${error.message}`);
    }
  };

  // ✅ DELETE Dish
  const handleDeleteDish = async (dishId) => {
    if (!window.confirm('Are you sure you want to delete this dish?')) return;

    try {
      await deleteDish(dishId);
      console.log('✅ Dish deleted:', dishId);
      alert('✅ Dish deleted successfully!');
      
      // Reload menu
      loadMenuData();
    } catch (error) {
      console.error('❌ Error deleting dish:', error);
      alert(`❌ Failed: ${error.message}`);
    }
  };

  if (loading) {
    return (
      <div className="manage-dishes-page">
        <div style={{ textAlign: 'center', padding: '60px', color: '#666' }}>
          ⏳ Loading menu...
        </div>
      </div>
    );
  }

  return (
    <div className="manage-dishes-page">
      {/* Left Sidebar - Categories */}
      <div className="categories-sidebar">
        <h2 className="sidebar-title">Dishes Category</h2>
        
        <div className="categories-list">
          {categories.map(category => (
            <div
              key={category.category_id}
              className={`category-item ${selectedCategory === category.category_name ? 'active' : ''}`}
              onClick={() => handleCategoryChange(category.category_name)}
            >
              <span className="category-icon">{category.icon}</span>
              <span className="category-name">{category.category_name}</span>
              <span className="category-count">{category.dish_count || 0}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Main Content */}
      <div className="dishes-main-content">
        <div className="dishes-header">
          <h1>Menu</h1>
          
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
            
            {/* ✅ ADD BUTTON - Only for Owner */}
            {isOwner && (
              <button 
                className="add-dish-btn"
                onClick={() => {
                  setEditingDish(null);
                  setFormData({
                    dish_name: '',
                    price: '',
                    category_id: '',
                    availability_status: true,
                    image_url: ''
                  });
                  setShowAddModal(true);
                }}
                style={{
                  padding: '8px 16px',
                  background: '#10B981',
                  color: 'white',
                  border: 'none',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  fontSize: '14px',
                  fontWeight: '600'
                }}
              >
                <Plus size={18} />
                Add Dish
              </button>
            )}
          </div>
        </div>

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
          </div>
        </div>

        <div className={`dishes-grid ${viewMode}`}>
          {filteredDishes.map(dish => (
            <div key={dish.dish_id} className="dish-card" style={{ position: 'relative' }}>
              {/* ✅ EDIT/DELETE BUTTONS - Only for Owner */}
              {isOwner && (
                <div style={{
                  position: 'absolute',
                  top: '8px',
                  right: '8px',
                  display: 'flex',
                  gap: '4px',
                  zIndex: 10
                }}>
                  <button
                    onClick={() => handleEditDish(dish)}
                    style={{
                      padding: '6px 10px',
                      background: '#3B82F6',
                      color: 'white',
                      border: 'none',
                      borderRadius: '4px',
                      cursor: 'pointer',
                      fontSize: '12px',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px'
                    }}
                    title="Edit Dish"
                  >
                    <Edit2 size={14} />
                  </button>
                  <button
                    onClick={() => handleDeleteDish(dish.dish_id)}
                    style={{
                      padding: '6px 10px',
                      background: '#EF4444',
                      color: 'white',
                      border: 'none',
                      borderRadius: '4px',
                      cursor: 'pointer',
                      fontSize: '12px',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px'
                    }}
                    title="Delete Dish"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              )}

              <div className="dish-image">
                {dish.image_url ? (
                  <img src={dish.image_url} alt={dish.dish_name} />
                ) : (
                  <span className="dish-emoji">🍽️</span>
                )}
              </div>
              
              <div className="dish-info">
                <span className="dish-category-label">
                  {dish.Category?.category_name || 'Uncategorized'}
                </span>
                <h3 className="dish-name">{dish.dish_name}</h3>
                <p className="dish-price">₹{parseFloat(dish.price).toFixed(2)}</p>
                
                {/* Availability badge */}
                <div style={{ marginTop: '8px' }}>
                  {dish.availability_status ? (
                    <span style={{
                      padding: '4px 8px',
                      background: '#D1FAE5',
                      color: '#059669',
                      borderRadius: '4px',
                      fontSize: '11px',
                      fontWeight: '600'
                    }}>
                      ✓ Available
                    </span>
                  ) : (
                    <span style={{
                      padding: '4px 8px',
                      background: '#FEE2E2',
                      color: '#DC2626',
                      borderRadius: '4px',
                      fontSize: '11px',
                      fontWeight: '600'
                    }}>
                      Out of Stock
                    </span>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>

        {filteredDishes.length === 0 && (
          <div className="no-dishes">
            <p>No dishes found in {selectedCategory}</p>
            {searchQuery && (
              <p style={{ fontSize: '14px', color: '#666', marginTop: '8px' }}>
                Try adjusting your search query
              </p>
            )}
          </div>
        )}
      </div>

      {/* ✅ ADD/EDIT MODAL - Only for Owner */}
      {isOwner && showAddModal && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0,0,0,0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000
        }}>
          <div style={{
            background: 'white',
            borderRadius: '12px',
            padding: '24px',
            width: '90%',
            maxWidth: '500px',
            maxHeight: '90vh',
            overflowY: 'auto'
          }}>
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '16px'
            }}>
              <h2>{editingDish ? '✏️ Edit Dish' : '➕ Add New Dish'}</h2>
              <button
                onClick={() => {
                  setShowAddModal(false);
                  setEditingDish(null);
                }}
                style={{
                  background: 'none',
                  border: 'none',
                  fontSize: '24px',
                  cursor: 'pointer'
                }}
              >
                ✕
              </button>
            </div>

            <form style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {/* Dish Name */}
              <div>
                <label style={{ display: 'block', marginBottom: '4px', fontWeight: '600' }}>
                  Dish Name *
                </label>
                <input
                  type="text"
                  value={formData.dish_name}
                  onChange={(e) => setFormData({ ...formData, dish_name: e.target.value })}
                  placeholder="e.g., Butter Chicken"
                  style={{
                    width: '100%',
                    padding: '8px 12px',
                    border: '1px solid #E5E7EB',
                    borderRadius: '6px',
                    fontSize: '14px',
                    boxSizing: 'border-box'
                  }}
                />
              </div>

              {/* Price */}
              <div>
                <label style={{ display: 'block', marginBottom: '4px', fontWeight: '600' }}>
                  Price (₹) *
                </label>
                <input
                  type="number"
                  value={formData.price}
                  onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                  placeholder="e.g., 250"
                  step="0.01"
                  style={{
                    width: '100%',
                    padding: '8px 12px',
                    border: '1px solid #E5E7EB',
                    borderRadius: '6px',
                    fontSize: '14px',
                    boxSizing: 'border-box'
                  }}
                />
              </div>

              {/* Category */}
              <div>
                <label style={{ display: 'block', marginBottom: '4px', fontWeight: '600' }}>
                  Category *
                </label>
                <select
                  value={formData.category_id}
                  onChange={(e) => setFormData({ ...formData, category_id: e.target.value })}
                  style={{
                    width: '100%',
                    padding: '8px 12px',
                    border: '1px solid #E5E7EB',
                    borderRadius: '6px',
                    fontSize: '14px',
                    boxSizing: 'border-box'
                  }}
                >
                  <option value="">Select Category</option>
                  {categories.slice(1).map(cat => (
                    <option key={cat.category_id} value={cat.category_id}>
                      {cat.category_name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Image URL */}
              <div>
                <label style={{ display: 'block', marginBottom: '4px', fontWeight: '600' }}>
                  Image URL (Optional)
                </label>
                <input
                  type="text"
                  value={formData.image_url}
                  onChange={(e) => setFormData({ ...formData, image_url: e.target.value })}
                  placeholder="e.g., https://..."
                  style={{
                    width: '100%',
                    padding: '8px 12px',
                    border: '1px solid #E5E7EB',
                    borderRadius: '6px',
                    fontSize: '14px',
                    boxSizing: 'border-box'
                  }}
                />
              </div>

              {/* Availability */}
              <div>
                <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: '600' }}>
                  <input
                    type="checkbox"
                    checked={formData.availability_status}
                    onChange={(e) => setFormData({ ...formData, availability_status: e.target.checked })}
                  />
                  Available
                </label>
              </div>

              {/* Buttons */}
              <div style={{ display: 'flex', gap: '8px', marginTop: '16px' }}>
                <button
                  type="button"
                  onClick={() => {
                    if (editingDish) {
                      handleUpdateDish();
                    } else {
                      handleAddDish();
                    }
                  }}
                  style={{
                    flex: 1,
                    padding: '10px 16px',
                    background: '#10B981',
                    color: 'white',
                    border: 'none',
                    borderRadius: '6px',
                    cursor: 'pointer',
                    fontWeight: '600'
                  }}
                >
                  {editingDish ? '💾 Update' : '➕ Add'}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowAddModal(false);
                    setEditingDish(null);
                  }}
                  style={{
                    flex: 1,
                    padding: '10px 16px',
                    background: '#E5E7EB',
                    color: '#374151',
                    border: 'none',
                    borderRadius: '6px',
                    cursor: 'pointer',
                    fontWeight: '600'
                  }}
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Menu;

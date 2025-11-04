import { supabase } from './supabaseClient';

// Get all dishes
export async function getDishes() {
  const { data, error } = await supabase
    .from('Dish')
    .select('*')
    .order('dish_id', { ascending: true });
  
  if (error) {
    console.error('Error fetching dishes:', error);
    throw error;
  }
  return data;
}

// Get dish by ID
export async function getDishById(dishId) {
  const { data, error } = await supabase
    .from('Dish')
    .select('*')
    .eq('dish_id', dishId)
    .single();
  
  if (error) {
    console.error('Error fetching dish:', error);
    throw error;
  }
  return data;
}

// Get dishes by category ID
export async function getDishesByCategory(categoryId) {
  const { data, error } = await supabase
    .from('Dish')
    .select('*')
    .eq('category_id', categoryId)
    .order('dish_name', { ascending: true });
  
  if (error) {
    console.error('Error fetching dishes by category:', error);
    throw error;
  }
  return data;
}

// Get available dishes (in stock)
export async function getAvailableDishes() {
  const { data, error } = await supabase
    .from('Dish')
    .select('*')
    .eq('availability_status', true)
    .order('dish_name', { ascending: true });
  
  if (error) {
    console.error('Error fetching available dishes:', error);
    throw error;
  }
  return data;
}

// Get unavailable dishes
export async function getUnavailableDishes() {
  const { data, error } = await supabase
    .from('Dish')
    .select('*')
    .eq('availability_status', false)
    .order('dish_name', { ascending: true });
  
  if (error) {
    console.error('Error fetching unavailable dishes:', error);
    throw error;
  }
  return data;
}

// Get dishes with category details (JOIN)
export async function getDishesWithCategory() {
  const { data, error } = await supabase
    .from('Dish')
    .select(`
      *,
      Category (
        category_id,
        category_name,
        description
      )
    `)
    .order('dish_name', { ascending: true });
  
  if (error) {
    console.error('Error fetching dishes with category:', error);
    throw error;
  }
  return data;
}

// Get dishes by price range
export async function getDishesByPriceRange(minPrice, maxPrice) {
  const { data, error } = await supabase
    .from('Dish')
    .select('*')
    .gte('price', minPrice)
    .lte('price', maxPrice)
    .order('price', { ascending: true });
  
  if (error) {
    console.error('Error fetching dishes by price range:', error);
    throw error;
  }
  return data;
}

// Add new dish
export async function addDish(dishData) {
  const { data, error } = await supabase
    .from('Dish')
    .insert([{
      dish_name: dishData.dish_name,
      price: dishData.price,
      category_id: dishData.category_id,
      availability_status: dishData.availability_status !== undefined ? dishData.availability_status : true,
      image_url: dishData.image_url || null
    }])
    .select();
  
  if (error) {
    console.error('Error adding dish:', error);
    throw error;
  }
  return data;
}

// Update dish
export async function updateDish(dishId, updatedData) {
  const { data, error } = await supabase
    .from('Dish')
    .update(updatedData)
    .eq('dish_id', dishId)
    .select();
  
  if (error) {
    console.error('Error updating dish:', error);
    throw error;
  }
  return data;
}

// Update dish availability
export async function updateDishAvailability(dishId, isAvailable) {
  const { data, error } = await supabase
    .from('Dish')
    .update({ availability_status: isAvailable })
    .eq('dish_id', dishId)
    .select();
  
  if (error) {
    console.error('Error updating dish availability:', error);
    throw error;
  }
  return data;
}

// Update dish price
export async function updateDishPrice(dishId, newPrice) {
  const { data, error } = await supabase
    .from('Dish')
    .update({ price: newPrice })
    .eq('dish_id', dishId)
    .select();
  
  if (error) {
    console.error('Error updating dish price:', error);
    throw error;
  }
  return data;
}

// Delete dish
export async function deleteDish(dishId) {
  const { data, error } = await supabase
    .from('Dish')
    .delete()
    .eq('dish_id', dishId);
  
  if (error) {
    console.error('Error deleting dish:', error);
    throw error;
  }
  return data;
}

// Search dishes by name
export async function searchDishesByName(searchTerm) {
  const { data, error } = await supabase
    .from('Dish')
    .select('*')
    .ilike('dish_name', `%${searchTerm}%`)
    .order('dish_name', { ascending: true });
  
  if (error) {
    console.error('Error searching dishes:', error);
    throw error;
  }
  return data;
}

// Get dish count
export async function getDishCount() {
  const { count, error } = await supabase
    .from('Dish')
    .select('*', { count: 'exact', head: true });
  
  if (error) {
    console.error('Error getting dish count:', error);
    throw error;
  }
  return count;
}

// Get available dish count
export async function getAvailableDishCount() {
  const { count, error } = await supabase
    .from('Dish')
    .select('*', { count: 'exact', head: true })
    .eq('availability_status', true);
  
  if (error) {
    console.error('Error getting available dish count:', error);
    throw error;
  }
  return count;
}

// Get most expensive dishes
export async function getMostExpensiveDishes(limit = 10) {
  const { data, error } = await supabase
    .from('Dish')
    .select('*')
    .order('price', { ascending: false })
    .limit(limit);
  
  if (error) {
    console.error('Error fetching expensive dishes:', error);
    throw error;
  }
  return data;
}

// Get cheapest dishes
export async function getCheapestDishes(limit = 10) {
  const { data, error } = await supabase
    .from('Dish')
    .select('*')
    .order('price', { ascending: true })
    .limit(limit);
  
  if (error) {
    console.error('Error fetching cheap dishes:', error);
    throw error;
  }
  return data;
}

// Bulk update availability (mark multiple dishes as available/unavailable)
export async function bulkUpdateAvailability(dishIds, isAvailable) {
  const { data, error } = await supabase
    .from('Dish')
    .update({ availability_status: isAvailable })
    .in('dish_id', dishIds)
    .select();
  
  if (error) {
    console.error('Error bulk updating availability:', error);
    throw error;
  }
  return data;
}

// Get dish statistics
export async function getDishStatistics() {
  try {
    const dishes = await getDishes();
    
    const stats = {
      total: dishes.length,
      available: dishes.filter(d => d.availability_status === true).length,
      unavailable: dishes.filter(d => d.availability_status === false).length,
      averagePrice: dishes.length > 0 
        ? dishes.reduce((sum, d) => sum + parseFloat(d.price), 0) / dishes.length 
        : 0,
      maxPrice: dishes.length > 0 
        ? Math.max(...dishes.map(d => parseFloat(d.price))) 
        : 0,
      minPrice: dishes.length > 0 
        ? Math.min(...dishes.map(d => parseFloat(d.price))) 
        : 0
    };

    return stats;
  } catch (error) {
    console.error('Error calculating dish statistics:', error);
    throw error;
  }
}

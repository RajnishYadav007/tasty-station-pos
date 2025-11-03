import { supabase } from './supabaseClient';

// Get all categories
export async function getCategories() {
  const { data, error } = await supabase
    .from('Category')
    .select('*')
    .order('category_id', { ascending: true });
  
  if (error) {
    console.error('Error fetching categories:', error);
    throw error;
  }
  return data;
}

// Get category by ID
export async function getCategoryById(categoryId) {
  const { data, error } = await supabase
    .from('Category')
    .select('*')
    .eq('category_id', categoryId)
    .single();
  
  if (error) {
    console.error('Error fetching category:', error);
    throw error;
  }
  return data;
}

// Get category by name
export async function getCategoryByName(categoryName) {
  const { data, error } = await supabase
    .from('Category')
    .select('*')
    .eq('category_name', categoryName)
    .single();
  
  if (error) {
    console.error('Error fetching category by name:', error);
    throw error;
  }
  return data;
}

// Add new category
export async function addCategory(categoryData) {
  const { data, error } = await supabase
    .from('Category')
    .insert([{
      category_name: categoryData.category_name,
      description: categoryData.description || null,
      created_at: new Date().toISOString(),
      updated_at: null
    }])
    .select();
  
  if (error) {
    console.error('Error adding category:', error);
    throw error;
  }
  return data;
}

// Update category
export async function updateCategory(categoryId, updatedData) {
  const { data, error } = await supabase
    .from('Category')
    .update({
      ...updatedData,
      updated_at: new Date().toISOString()
    })
    .eq('category_id', categoryId)
    .select();
  
  if (error) {
    console.error('Error updating category:', error);
    throw error;
  }
  return data;
}

// Delete category
export async function deleteCategory(categoryId) {
  const { data, error } = await supabase
    .from('Category')
    .delete()
    .eq('category_id', categoryId);
  
  if (error) {
    console.error('Error deleting category:', error);
    throw error;
  }
  return data;
}

// Search categories by name
export async function searchCategoriesByName(searchTerm) {
  const { data, error } = await supabase
    .from('Category')
    .select('*')
    .ilike('category_name', `%${searchTerm}%`)
    .order('category_name', { ascending: true });
  
  if (error) {
    console.error('Error searching categories:', error);
    throw error;
  }
  return data;
}

// Get category count
export async function getCategoryCount() {
  const { count, error } = await supabase
    .from('Category')
    .select('*', { count: 'exact', head: true });
  
  if (error) {
    console.error('Error getting category count:', error);
    throw error;
  }
  return count;
}

// Get categories with dish count
export async function getCategoriesWithDishCount() {
  const { data: categories, error: catError } = await supabase
    .from('Category')
    .select('*')
    .order('category_id', { ascending: true });
  
  if (catError) {
    console.error('Error fetching categories:', catError);
    throw catError;
  }

  // Get dish counts for each category
  const categoriesWithCount = await Promise.all(
    categories.map(async (category) => {
      const { count, error: countError } = await supabase
        .from('Dish')
        .select('*', { count: 'exact', head: true })
        .eq('category_id', category.category_id);
      
      if (countError) {
        console.error('Error counting dishes:', countError);
        return { ...category, dish_count: 0 };
      }
      
      return { ...category, dish_count: count };
    })
  );

  return categoriesWithCount;
}

// Check if category name exists (for validation)
export async function checkCategoryNameExists(categoryName) {
  const { data, error } = await supabase
    .from('Category')
    .select('category_id')
    .eq('category_name', categoryName)
    .single();
  
  if (error && error.code !== 'PGRST116') {
    console.error('Error checking category name:', error);
    throw error;
  }
  return !!data;
}

// Get popular categories (by dish count)
export async function getPopularCategories(limit = 5) {
  try {
    const categoriesWithCount = await getCategoriesWithDishCount();
    return categoriesWithCount
      .sort((a, b) => b.dish_count - a.dish_count)
      .slice(0, limit);
  } catch (error) {
    console.error('Error getting popular categories:', error);
    throw error;
  }
}

// Get recently added categories
export async function getRecentCategories(limit = 5) {
  const { data, error } = await supabase
    .from('Category')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(limit);
  
  if (error) {
    console.error('Error fetching recent categories:', error);
    throw error;
  }
  return data;
}

// Get recently updated categories
export async function getRecentlyUpdatedCategories(limit = 5) {
  const { data, error } = await supabase
    .from('Category')
    .select('*')
    .not('updated_at', 'is', null)
    .order('updated_at', { ascending: false })
    .limit(limit);
  
  if (error) {
    console.error('Error fetching recently updated categories:', error);
    throw error;
  }
  return data;
}

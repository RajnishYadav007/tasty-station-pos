import { supabase } from './supabaseClient';

// Get all users
export async function getUsers() {
  const { data, error } = await supabase
    .from('User')
    .select('*');
  
  if (error) {
    console.error('Error fetching users:', error);
    throw error;
  }
  return data;
}

// Get user by ID
export async function getUserById(userId) {
  const { data, error } = await supabase
    .from('User')
    .select('*')
    .eq('user_id', userId)
    .single();
  
  if (error) {
    console.error('Error fetching user:', error);
    throw error;
  }
  return data;
}

// Get user by email
export async function getUserByEmail(email) {
  const { data, error } = await supabase
    .from('User')
    .select('*')
    .eq('email', email)
    .single();
  
  if (error) {
    console.error('Error fetching user by email:', error);
    throw error;
  }
  return data;
}

// Add new user
export async function addUser(userData) {
  const { data, error } = await supabase
    .from('User')
    .insert([userData])
    .select();
  
  if (error) {
    console.error('Error adding user:', error);
    throw error;
  }
  return data;
}

// Update user
export async function updateUser(userId, updatedData) {
  const { data, error } = await supabase
    .from('User')
    .update(updatedData)
    .eq('user_id', userId)
    .select();
  
  if (error) {
    console.error('Error updating user:', error);
    throw error;
  }
  return data;
}

// Delete user
export async function deleteUser(userId) {
  const { data, error } = await supabase
    .from('User')
    .delete()
    .eq('user_id', userId);
  
  if (error) {
    console.error('Error deleting user:', error);
    throw error;
  }
  return data;
}

// Search users by name
export async function searchUsersByName(searchTerm) {
  const { data, error } = await supabase
    .from('User')
    .select('*')
    .ilike('user_name', `%${searchTerm}%`);
  
  if (error) {
    console.error('Error searching users:', error);
    throw error;
  }
  return data;
}

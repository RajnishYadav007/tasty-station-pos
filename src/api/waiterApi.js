// src/api/waiterApi.js

import { supabase } from './supabaseClient';

// Get all waiters
export async function getWaiters() {
  const { data, error } = await supabase
    .from('Waiter')
    .select('*')
    .order('waiter_id', { ascending: false });
  
  if (error) {
    console.error('Error fetching waiters:', error);
    throw error;
  }
  return data;
}

// Get waiter by ID
export async function getWaiterById(waiterId) {
  const { data, error } = await supabase
    .from('Waiter')
    .select('*')
    .eq('waiter_id', waiterId)
    .single();
  
  if (error) {
    console.error('Error fetching waiter:', error);
    throw error;
  }
  return data;
}

// Get waiter by email
export async function getWaiterByEmail(email) {
  const { data, error } = await supabase
    .from('Waiter')
    .select('*')
    .eq('email', email)
    .single();
  
  if (error) {
    console.error('Error fetching waiter:', error);
    throw error;
  }
  return data;
}

// Add waiter
export async function addWaiter(waiterData) {
  const { data, error } = await supabase
    .from('Waiter')
    .insert([waiterData])
    .select();
  
  if (error) {
    console.error('Error adding waiter:', error);
    throw error;
  }
  return data;
}

// Update waiter
export async function updateWaiter(waiterId, updatedData) {
  const { data, error } = await supabase
    .from('Waiter')
    .update(updatedData)
    .eq('waiter_id', waiterId)
    .select();
  
  if (error) {
    console.error('Error updating waiter:', error);
    throw error;
  }
  return data;
}

// Delete waiter
export async function deleteWaiter(waiterId) {
  const { data, error } = await supabase
    .from('Waiter')
    .delete()
    .eq('waiter_id', waiterId);
  
  if (error) {
    console.error('Error deleting waiter:', error);
    throw error;
  }
  return data;
}

// Get waiter count
export async function getWaiterCount() {
  const { count, error } = await supabase
    .from('Waiter')
    .select('*', { count: 'exact', head: true });
  
  if (error) {
    console.error('Error getting waiter count:', error);
    throw error;
  }
  return count;
}

// Search waiters by name
export async function searchWaitersByName(name) {
  const { data, error } = await supabase
    .from('Waiter')
    .select('*')
    .ilike('name', `%${name}%`);
  
  if (error) {
    console.error('Error searching waiters:', error);
    throw error;
  }
  return data;
}

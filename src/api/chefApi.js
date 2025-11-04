// src/api/chefApi.js

import { supabase } from './supabaseClient';

// Get all chefs
export async function getChefs() {
  const { data, error } = await supabase
    .from('Chef')
    .select('*')
    .order('chef_id', { ascending: false });
  
  if (error) {
    console.error('Error fetching chefs:', error);
    throw error;
  }
  return data;
}

// Get chef by ID
export async function getChefById(chefId) {
  const { data, error } = await supabase
    .from('Chef')
    .select('*')
    .eq('chef_id', chefId)
    .single();
  
  if (error) {
    console.error('Error fetching chef:', error);
    throw error;
  }
  return data;
}

// Get chef by email
export async function getChefByEmail(email) {
  const { data, error } = await supabase
    .from('Chef')
    .select('*')
    .eq('email', email)
    .single();
  
  if (error) {
    console.error('Error fetching chef:', error);
    throw error;
  }
  return data;
}

// Add chef
export async function addChef(chefData) {
  const { data, error } = await supabase
    .from('Chef')
    .insert([chefData])
    .select();
  
  if (error) {
    console.error('Error adding chef:', error);
    throw error;
  }
  return data;
}

// Update chef
export async function updateChef(chefId, updatedData) {
  const { data, error } = await supabase
    .from('Chef')
    .update(updatedData)
    .eq('chef_id', chefId)
    .select();
  
  if (error) {
    console.error('Error updating chef:', error);
    throw error;
  }
  return data;
}

// Delete chef
export async function deleteChef(chefId) {
  const { data, error } = await supabase
    .from('Chef')
    .delete()
    .eq('chef_id', chefId);
  
  if (error) {
    console.error('Error deleting chef:', error);
    throw error;
  }
  return data;
}

// Get chef count
export async function getChefCount() {
  const { count, error } = await supabase
    .from('Chef')
    .select('*', { count: 'exact', head: true });
  
  if (error) {
    console.error('Error getting chef count:', error);
    throw error;
  }
  return count;
}

// Search chefs by name
export async function searchChefsByName(name) {
  const { data, error } = await supabase
    .from('Chef')
    .select('*')
    .ilike('name', `%${name}%`);
  
  if (error) {
    console.error('Error searching chefs:', error);
    throw error;
  }
  return data;
}

// src/api/waiterApi.js - ✅ WITH CREATE WAITER

import { supabase } from './supabaseClient';

// ✅ EXISTING LOGIN
export const waiterAPI = {
  login: async (email, password) => {
    try {
      console.log('🍽️ Waiter login attempt:', email);
      
      const { data, error } = await supabase
        .from('Waiter')
        .select('*')
        .eq('email', email)
        .eq('password', password)
        .single();

      if (error || !data) {
        return {
          success: false,
          message: '❌ Invalid Waiter credentials'
        };
      }

      console.log('✅ Waiter login success');
      return {
        success: true,
        user: {
          id: data.waiter_id,
          name: data.name,
          email: data.email,
          phone: data.contact,
          role: 'Waiter',
          permissions: ['tables', 'orders'],
          defaultRoute: '/manage-table'
        }
      };
    } catch (error) {
      console.error('❌ Waiter login error:', error);
      return {
        success: false,
        message: '❌ Login error: ' + error.message
      };
    }
  }
};

// ✅ NEW - CREATE WAITER (by Admin)
export const createWaiter = async (waiterData) => {
  try {
    console.log('➕ Creating waiter:', waiterData.name);
    
    const { data, error } = await supabase
      .from('Waiter')
      .insert([{
        name: waiterData.name,
        email: waiterData.email,
        password: waiterData.password,
        contact: waiterData.phone,
        created_at: new Date().toISOString()
      }])
      .select()
      .single();

    if (error) throw error;
    
    console.log('✅ Waiter created successfully');
    return { success: true, data };
  } catch (error) {
    console.error('❌ Error creating waiter:', error);
    return { success: false, message: error.message };
  }
};

// ✅ GET ALL WAITERS
export const getAllWaiters = async () => {
  try {
    const { data, error } = await supabase
      .from('Waiter')
      .select('*');

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('❌ Error fetching waiters:', error);
    return [];
  }
};

// ✅ DELETE WAITER
export const deleteWaiter = async (waiterId) => {
  try {
    const { error } = await supabase
      .from('Waiter')
      .delete()
      .eq('waiter_id', waiterId);

    if (error) throw error;
    return { success: true };
  } catch (error) {
    console.error('❌ Error deleting waiter:', error);
    return { success: false, message: error.message };
  }
};

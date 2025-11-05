// src/api/userApi.js - ✅ COMPLETE WITH ALL FUNCTIONS

import { supabase } from './supabaseClient';

// ✅ LOGIN USER (Customer)
export const loginUser = async (email, password) => {
  try {
    console.log('👤 Customer login attempt:', email);
    
    const { data, error } = await supabase
      .from('User')
      .select('*')
      .eq('email', email)
      .eq('password', password)
      .single();

    if (error || !data) {
      return {
        success: false,
        message: '❌ Invalid Customer credentials'
      };
    }

    console.log('✅ Customer login success');
    return {
      success: true,
      user: {
        id: data.user_id,
        name: data.user_name,
        email: data.email,
        phone: data.phone,
        address: data.address,
        loyaltyPoints: data.loyalty_points,
        role: 'Customer',
        permissions: ['menu', 'orders'],
        defaultRoute: '/customers'
      }
    };
  } catch (error) {
    console.error('❌ Customer login error:', error);
    return {
      success: false,
      message: '❌ Login error: ' + error.message
    };
  }
};

// ✅ SIGNUP USER (Customer Only)
export const signupUser = async (userData) => {
  try {
    console.log('✍️ Customer signup attempt:', userData.email);
    
    // Check if email already exists
    const { data: existingUser } = await supabase
      .from('User')
      .select('email')
      .eq('email', userData.email)
      .single();

    if (existingUser) {
      return {
        success: false,
        message: '❌ Email already registered'
      };
    }

    // Create new customer
    const { data, error } = await supabase
      .from('User')
      .insert([{
        user_name: userData.name,
        email: userData.email,
        password: userData.password,
        phone: userData.phone,
        address: userData.address || '',
        loyalty_points: 0,
        created_at: new Date().toISOString()
      }])
      .select()
      .single();

    if (error) throw error;
    
    console.log('✅ Customer signup success');
    return { success: true, data };
  } catch (error) {
    console.error('❌ Customer signup error:', error);
    return {
      success: false,
      message: '❌ Signup error: ' + error.message
    };
  }
};

// ✅ GET ALL USERS (Customers)
export const getUsers = async () => {
  try {
    console.log('📋 Fetching all customers');
    
    const { data, error } = await supabase
      .from('User')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;
    
    console.log('✅ Customers fetched:', data?.length);
    return data || [];
  } catch (error) {
    console.error('❌ Error fetching customers:', error);
    return [];
  }
};

// ✅ GET SINGLE USER BY ID
export const getUserById = async (userId) => {
  try {
    const { data, error } = await supabase
      .from('User')
      .select('*')
      .eq('user_id', userId)
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('❌ Error fetching customer:', error);
    return null;
  }
};

// ✅ UPDATE CUSTOMER
export const updateUser = async (userId, updates) => {
  try {
    const { data, error } = await supabase
      .from('User')
      .update(updates)
      .eq('user_id', userId)
      .select()
      .single();

    if (error) throw error;
    return { success: true, data };
  } catch (error) {
    console.error('❌ Error updating customer:', error);
    return { success: false, message: error.message };
  }
};

// ✅ DELETE CUSTOMER
export const deleteUser = async (userId) => {
  try {
    const { error } = await supabase
      .from('User')
      .delete()
      .eq('user_id', userId);

    if (error) throw error;
    return { success: true };
  } catch (error) {
    console.error('❌ Error deleting customer:', error);
    return { success: false, message: error.message };
  }
};

// ✅ PROMOTE CUSTOMER TO WAITER
export const promoteCustomerToWaiter = async (userId, waiterData) => {
  try {
    console.log('🎯 Promoting customer to waiter:', userId);
    
    // Get customer details
    const { data: customer, error: fetchError } = await supabase
      .from('User')
      .select('*')
      .eq('user_id', userId)
      .single();

    if (fetchError || !customer) {
      throw new Error('Customer not found');
    }

    // Insert into Waiter table
    const { error: insertError } = await supabase
      .from('Waiter')
      .insert([{
        name: customer.user_name,
        email: customer.email,
        password: customer.password,
        contact: waiterData.phone || customer.phone,
        created_at: new Date().toISOString()
      }]);

    if (insertError) throw insertError;

    // Delete from User table
    const { error: deleteError } = await supabase
      .from('User')
      .delete()
      .eq('user_id', userId);

    if (deleteError) throw deleteError;

    console.log('✅ Customer promoted to waiter');
    return { 
      success: true, 
      message: '✅ Customer promoted to Waiter!' 
    };
  } catch (error) {
    console.error('❌ Error promoting customer:', error);
    return { 
      success: false, 
      message: error.message 
    };
  }
};

// ✅ PROMOTE CUSTOMER TO CHEF
export const promoteCustomerToChef = async (userId, chefData) => {
  try {
    console.log('🎯 Promoting customer to chef:', userId);
    
    // Get customer details
    const { data: customer, error: fetchError } = await supabase
      .from('User')
      .select('*')
      .eq('user_id', userId)
      .single();

    if (fetchError || !customer) {
      throw new Error('Customer not found');
    }

    // Insert into Chef table
    const { error: insertError } = await supabase
      .from('Chef')
      .insert([{
        name: customer.user_name,
        email: customer.email,
        password: customer.password,
        contact: chefData.phone || customer.phone,
        specialization: chefData.specialization || 'General',
        created_at: new Date().toISOString()
      }]);

    if (insertError) throw insertError;

    // Delete from User table
    const { error: deleteError } = await supabase
      .from('User')
      .delete()
      .eq('user_id', userId);

    if (deleteError) throw deleteError;

    console.log('✅ Customer promoted to chef');
    return { 
      success: true, 
      message: '✅ Customer promoted to Chef!' 
    };
  } catch (error) {
    console.error('❌ Error promoting customer:', error);
    return { 
      success: false, 
      message: error.message 
    };
  }
};

// ✅ SEARCH CUSTOMERS BY NAME/EMAIL
export const searchUsers = async (searchTerm) => {
  try {
    const { data, error } = await supabase
      .from('User')
      .select('*')
      .or(`user_name.ilike.%${searchTerm}%,email.ilike.%${searchTerm}%`);

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('❌ Error searching customers:', error);
    return [];
  }
};

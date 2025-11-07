// src/api/chefApi.js - ✅ WITH CREATE CHEF

import { supabase } from './supabaseClient';

// ✅ EXISTING LOGIN
export const chefAPI = {
  login: async (email, password) => {
    try {
      console.log('👨‍🍳 Chef login attempt:', email);
      
      const { data, error } = await supabase
        .from('Chef')
        .select('*')
        .eq('email', email)
        .eq('password', password)
        .single();

      if (error || !data) {
        return {
          success: false,
          message: '❌ Invalid Chef credentials'
        };
      }

      console.log('✅ Chef login success');
      return {
        success: true,
        user: {
          id: data.chef_id,
          name: data.name,
          email: data.email,
          phone: data.contact,
          specialization: data.specialization,
          role: 'Chef',
          permissions: ['orderline', 'kitchen'],
          defaultRoute: '/orderline'
        }
      };
    } catch (error) {
      console.error('❌ Chef login error:', error);
      return {
        success: false,
        message: '❌ Login error: ' + error.message
      };
    }
  }
};

// ✅ NEW - CREATE CHEF (by Admin)
export const createChef = async (chefData) => {
  try {
    console.log('➕ Creating chef:', chefData.name);
    
    const { data, error } = await supabase
      .from('Chef')
      .insert([{
        name: chefData.name,
        email: chefData.email,
        password: chefData.password,
        contact: chefData.phone,
        specialization: chefData.specialization || 'General',
        created_at: new Date().toISOString()
      }])
      .select()
      .single();

    if (error) throw error;
    
    console.log('✅ Chef created successfully');
    return { success: true, data };
  } catch (error) {
    console.error('❌ Error creating chef:', error);
    return { success: false, message: error.message };
  }
};

// ✅ GET ALL CHEFS
export const getAllChefs = async () => {
  try {
    const { data, error } = await supabase
      .from('Chef')
      .select('*');

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('❌ Error fetching chefs:', error);
    return [];
  }
};

// ✅ DELETE CHEF
export const deleteChef = async (chefId) => {
  try {
    const { error } = await supabase
      .from('Chef')
      .delete()
      .eq('chef_id', chefId);

    if (error) throw error;
    return { success: true };
  } catch (error) {
    console.error('❌ Error deleting chef:', error);
    return { success: false, message: error.message };
  }
};

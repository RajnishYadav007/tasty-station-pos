// src/api/adminApi.js - ✅ ADMIN/OWNER API

import { supabase } from './supabaseClient';

export const adminAPI = {
  // ✅ LOGIN - Check Admin table
  async login(email, password) {
    try {
      console.log('🔑 Admin login attempt:', email);
      
      const { data, error } = await supabase
        .from('Admin')
        .select('*')
        .eq('email', email)
        .eq('password', password)
        .single();

      if (error || !data) {
        return {
          success: false,
          message: '❌ Invalid Admin credentials'
        };
      }

      console.log('✅ Admin login success');
      return {
        success: true,
        user: {
          id: data.admin_id,
          name: data.name,
          email: data.email,
          role: 'Owner',
          permissions: ['all'],
          defaultRoute: '/dashboard'
        }
      };
    } catch (error) {
      console.error('❌ Admin login error:', error);
      return {
        success: false,
        message: '❌ Login error: ' + error.message
      };
    }
  },

  // ✅ GET ALL ADMINS
  async getAllAdmins() {
    try {
      const { data, error } = await supabase
        .from('Admin')
        .select('*');

      if (error) throw error;
      return { success: true, data };
    } catch (error) {
      console.error('❌ Error fetching admins:', error);
      return { success: false, message: error.message };
    }
  },

  // ✅ CREATE NEW ADMIN
  async createAdmin(adminData) {
    try {
      const { data, error } = await supabase
        .from('Admin')
        .insert([adminData])
        .select()
        .single();

      if (error) throw error;
      return { success: true, data };
    } catch (error) {
      console.error('❌ Error creating admin:', error);
      return { success: false, message: error.message };
    }
  },

  // ✅ UPDATE ADMIN
  async updateAdmin(adminId, updates) {
    try {
      const { data, error } = await supabase
        .from('Admin')
        .update(updates)
        .eq('admin_id', adminId)
        .select()
        .single();

      if (error) throw error;
      return { success: true, data };
    } catch (error) {
      console.error('❌ Error updating admin:', error);
      return { success: false, message: error.message };
    }
  }
};

import { supabase } from './supabaseClient';

// Get all admins
export async function getAdmins() {
  const { data, error } = await supabase
    .from('Admin')
    .select('*')
    .order('admin_id', { ascending: true });
  
  if (error) {
    console.error('Error fetching admins:', error);
    throw error;
  }
  return data;
}

// Get admin by ID
export async function getAdminById(adminId) {
  const { data, error } = await supabase
    .from('Admin')
    .select('*')
    .eq('admin_id', adminId)
    .single();
  
  if (error) {
    console.error('Error fetching admin:', error);
    throw error;
  }
  return data;
}

// Get admin by email (for login/authentication)
export async function getAdminByEmail(email) {
  const { data, error } = await supabase
    .from('Admin')
    .select('*')
    .eq('email', email)
    .single();
  
  if (error) {
    console.error('Error fetching admin by email:', error);
    throw error;
  }
  return data;
}

// Get admin by role
export async function getAdminsByRole(role) {
  const { data, error } = await supabase
    .from('Admin')
    .select('*')
    .eq('role', role)
    .order('name', { ascending: true });
  
  if (error) {
    console.error('Error fetching admins by role:', error);
    throw error;
  }
  return data;
}

// Add new admin
export async function addAdmin(adminData) {
  const { data, error } = await supabase
    .from('Admin')
    .insert([{
      name: adminData.name,
      email: adminData.email,
      password: adminData.password,
      role: adminData.role || 'user'
    }])
    .select();
  
  if (error) {
    console.error('Error adding admin:', error);
    throw error;
  }
  return data;
}

// Update admin
export async function updateAdmin(adminId, updatedData) {
  const { data, error } = await supabase
    .from('Admin')
    .update(updatedData)
    .eq('admin_id', adminId)
    .select();
  
  if (error) {
    console.error('Error updating admin:', error);
    throw error;
  }
  return data;
}

// Update admin password
export async function updateAdminPassword(adminId, newPassword) {
  const { data, error } = await supabase
    .from('Admin')
    .update({ password: newPassword })
    .eq('admin_id', adminId)
    .select();
  
  if (error) {
    console.error('Error updating password:', error);
    throw error;
  }
  return data;
}

// Delete admin
export async function deleteAdmin(adminId) {
  const { data, error } = await supabase
    .from('Admin')
    .delete()
    .eq('admin_id', adminId);
  
  if (error) {
    console.error('Error deleting admin:', error);
    throw error;
  }
  return data;
}

// Search admins by name
export async function searchAdminsByName(searchTerm) {
  const { data, error } = await supabase
    .from('Admin')
    .select('*')
    .ilike('name', `%${searchTerm}%`)
    .order('name', { ascending: true });
  
  if (error) {
    console.error('Error searching admins:', error);
    throw error;
  }
  return data;
}

// Validate admin login
export async function validateAdminLogin(email, password) {
  const { data, error } = await supabase
    .from('Admin')
    .select('*')
    .eq('email', email)
    .eq('password', password)
    .single();
  
  if (error) {
    console.error('Error validating admin login:', error);
    throw error;
  }
  return data;
}

// Check if email exists (for registration validation)
export async function checkEmailExists(email) {
  const { data, error } = await supabase
    .from('Admin')
    .select('admin_id')
    .eq('email', email)
    .single();
  
  if (error && error.code !== 'PGRST116') { // PGRST116 = no rows returned
    console.error('Error checking email:', error);
    throw error;
  }
  return !!data; // Returns true if email exists
}

// Get admin count
export async function getAdminCount() {
  const { count, error } = await supabase
    .from('Admin')
    .select('*', { count: 'exact', head: true });
  
  if (error) {
    console.error('Error getting admin count:', error);
    throw error;
  }
  return count;
}

// Get admins by multiple roles
export async function getAdminsByRoles(roles) {
  const { data, error } = await supabase
    .from('Admin')
    .select('*')
    .in('role', roles)
    .order('name', { ascending: true });
  
  if (error) {
    console.error('Error fetching admins by roles:', error);
    throw error;
  }
  return data;
}

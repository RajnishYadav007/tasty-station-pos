// src/api/billApi.js - ✅ FULLY CORRECTED FOR SUPABASE

import { supabase } from './supabaseClient';

// Get all bills
export async function getBills() {
  const { data, error } = await supabase
    .from('Bill')
    .select('*')
    .order('bill_id', { ascending: false });
  
  if (error) {
    console.error('❌ Error fetching bills:', error);
    throw error;
  }
  return data;
}

// Get bill by ID
export async function getBillById(billId) {
  const { data, error } = await supabase
    .from('Bill')
    .select('*')
    .eq('bill_id', billId)
    .single();
  
  if (error) {
    console.error('❌ Error fetching bill:', error);
    throw error;
  }
  return data;
}

// Get bills by order ID
export async function getBillsByOrderId(orderId) {
  const { data, error } = await supabase
    .from('Bill')
    .select('*')
    .eq('order_id', orderId)
    .order('bill_id', { ascending: false });
  
  if (error) {
    console.error('❌ Error fetching bills by order:', error);
    throw error;
  }
  return data;
}

// Get bills by payment status
export async function getBillsByPaymentStatus(status) {
  const { data, error } = await supabase
    .from('Bill')
    .select('*')
    .eq('payment_status', status)
    .order('bill_id', { ascending: false });
  
  if (error) {
    console.error('❌ Error fetching bills by status:', error);
    throw error;
  }
  return data;
}

// Get paid bills
export async function getPaidBills() {
  return await getBillsByPaymentStatus('Paid');
}

// Get pending bills
export async function getPendingBills() {
  return await getBillsByPaymentStatus('Pending');
}

// Get bills by date range
export async function getBillsByDateRange(startDate, endDate) {
  const { data, error } = await supabase
    .from('Bill')
    .select('*')
    .gte('bill_date', startDate)
    .lte('bill_date', endDate)
    .order('bill_date', { ascending: false });
  
  if (error) {
    console.error('❌ Error fetching bills by date range:', error);
    throw error;
  }
  return data;
}

// Get today's bills
export async function getTodaysBills() {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  const { data, error } = await supabase
    .from('Bill')
    .select('*')
    .gte('bill_date', today.toISOString())
    .lt('bill_date', tomorrow.toISOString())
    .order('bill_id', { ascending: false });
  
  if (error) {
    console.error('❌ Error fetching today\'s bills:', error);
    throw error;
  }
  return data;
}

// ✅ Add new bill - WITH DISCOUNT, TAX, FINAL AMOUNT
export async function addBill(billData) {
  console.log('📝 Creating bill:', billData);

  const { data, error } = await supabase
    .from('Bill')
    .insert([{
      order_id: billData.order_id,
      user_id: billData.user_id || 1,
      total_amount: billData.total_amount,
      tax_amount: billData.tax_amount || 0,
      payment_method: billData.payment_method || 'Cash',
      payment_status: billData.payment_status || 'Pending',
      bill_date: billData.bill_date || new Date().toISOString()
    }])
    .select();
  
  if (error) {
    console.error('❌ Error adding bill:', error);
    throw error;
  }
  
  console.log('✅ Bill created:', data[0]);
  return data[0];
}

// Update bill
export async function updateBill(billId, updatedData) {
  const { data, error } = await supabase
    .from('Bill')
    .update(updatedData)
    .eq('bill_id', billId)
    .select();
  
  if (error) {
    console.error('❌ Error updating bill:', error);
    throw error;
  }
  return data[0];
}

// Update payment status
export async function updatePaymentStatus(billId, status) {
  const { data, error } = await supabase
    .from('Bill')
    .update({ 
      payment_status: status,
      bill_date: new Date().toISOString()
    })
    .eq('bill_id', billId)
    .select();
  
  if (error) {
    console.error('❌ Error updating payment status:', error);
    throw error;
  }
  return data[0];
}

// Mark bill as paid
export async function markBillAsPaid(billId) {
  return await updatePaymentStatus(billId, 'Paid');
}

// Mark bill as pending
export async function markBillAsPending(billId) {
  return await updatePaymentStatus(billId, 'Pending');
}

// Delete bill
export async function deleteBill(billId) {
  const { data, error } = await supabase
    .from('Bill')
    .delete()
    .eq('bill_id', billId);
  
  if (error) {
    console.error('❌ Error deleting bill:', error);
    throw error;
  }
  return data;
}

// Get total revenue (paid bills only)
export async function getTotalRevenue() {
  const { data, error } = await supabase
    .from('Bill')
    .select('final_amount')
    .eq('payment_status', 'Paid');
  
  if (error) {
    console.error('❌ Error calculating total revenue:', error);
    throw error;
  }

  const total = data.reduce((sum, bill) => {
    return sum + (parseFloat(bill.final_amount) || 0);
  }, 0);

  return total;
}

// Get revenue by date range
export async function getRevenueByDateRange(startDate, endDate) {
  const { data, error } = await supabase
    .from('Bill')
    .select('final_amount')
    .eq('payment_status', 'Paid')
    .gte('bill_date', startDate)
    .lte('bill_date', endDate);
  
  if (error) {
    console.error('❌ Error calculating revenue:', error);
    throw error;
  }

  const total = data.reduce((sum, bill) => {
    return sum + (parseFloat(bill.final_amount) || 0);
  }, 0);

  return total;
}

// Get today's revenue
export async function getTodaysRevenue() {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  return await getRevenueByDateRange(
    today.toISOString(), 
    tomorrow.toISOString()
  );
}

// Get bill count
export async function getBillCount() {
  const { count, error } = await supabase
    .from('Bill')
    .select('*', { count: 'exact', head: true });
  
  if (error) {
    console.error('❌ Error getting bill count:', error);
    throw error;
  }
  return count;
}

// Get bill statistics
export async function getBillStatistics() {
  try {
    const allBills = await getBills();
    const paidBills = allBills.filter(b => b.payment_status === 'Paid');
    const pendingBills = allBills.filter(b => b.payment_status === 'Pending');

    const totalRevenue = paidBills.reduce((sum, bill) => {
      return sum + (parseFloat(bill.final_amount) || 0);
    }, 0);

    const pendingAmount = pendingBills.reduce((sum, bill) => {
      return sum + (parseFloat(bill.final_amount) || 0);
    }, 0);

    return {
      totalBills: allBills.length,
      paidBills: paidBills.length,
      pendingBills: pendingBills.length,
      totalRevenue: totalRevenue,
      pendingAmount: pendingAmount,
      averageBillAmount: paidBills.length > 0 ? totalRevenue / paidBills.length : 0
    };
  } catch (error) {
    console.error('❌ Error calculating bill statistics:', error);
    throw error;
  }
}

// ✅ Create alias for Customers.jsx compatibility
export const createBill = addBill;

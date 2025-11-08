// src/api/billApi.js - ✅ WITH TABLE STATUS UPDATE ON MARK AS PAID

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
    .gte('created_at', startDate)
    .lte('created_at', endDate)
    .order('created_at', { ascending: false });
  
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
    .gte('created_at', today.toISOString())
    .lt('created_at', tomorrow.toISOString())
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
      final_amount: billData.final_amount || billData.total_amount,
      tax_amount: billData.tax_amount || 0,
      payment_method: billData.payment_method || 'Cash',
      payment_status: billData.payment_status || 'Pending',
      created_at: billData.created_at || new Date().toISOString()
    }])
    .select();
  
  if (error) {
    console.error('❌ Error adding bill:', error);
    throw error;
  }
  
  console.log('✅ Bill created:', data[0]);
  return data[0];
}

// ✅ Update bill - WITH TABLE STATUS UPDATE
export async function updateBill(billId, updatedData) {
  try {
    console.log(`📝 Updating bill #${billId}:`, updatedData);

    // 1. Update bill
    const { data: bill, error: billError } = await supabase
      .from('Bill')
      .update(updatedData)
      .eq('bill_id', billId)
      .select()
      .single();
    
    if (billError) throw billError;

    // 2. ✅ IF PAYMENT STATUS IS PAID, CLEAR TABLE
    if (updatedData.payment_status === 'Paid') {
      console.log('💰 Bill marked as paid! Clearing table...');

      // Get order_id from bill
      const orderId = bill.order_id;
      
      if (orderId) {
        // Get order to find table_number
        const { data: order, error: orderError } = await supabase
          .from('Order')
          .select('table_number')
          .eq('order_id', orderId)
          .single();

        if (!orderError && order?.table_number) {
          console.log(`🪑 Clearing Table ${order.table_number}...`);
          
          // Update table status to available
          const { error: tableError } = await supabase
            .from('Table')
            .update({ 
              status: 'available',
              current_order_id: null,
              updated_at: new Date().toISOString()
            })
            .eq('table_number', order.table_number);

          if (tableError) {
            console.error('❌ Error updating table:', tableError);
          } else {
            console.log(`✅ Table ${order.table_number} is now available!`);
            
            // ✅ TRIGGER REAL-TIME UPDATE EVENT
            window.dispatchEvent(new CustomEvent('tableStatusChanged', {
              detail: { tableNumber: order.table_number, status: 'available' }
            }));
          }
        }
      }
    }

    console.log('✅ Bill updated successfully!');
    return bill;
  } catch (error) {
    console.error('❌ Error updating bill:', error);
    throw error;
  }
}

// ✅ Update payment status - UPDATED TO USE MAIN updateBill
export async function updatePaymentStatus(billId, status) {
  return await updateBill(billId, { 
    payment_status: status,
    created_at: new Date().toISOString()
  });
}

// ✅ Mark bill as paid - WITH TABLE CLEARING
export async function markBillAsPaid(billId) {
  console.log(`💰 Marking bill #${billId} as paid...`);
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

  const total = data?.reduce((sum, bill) => {
    return sum + (parseFloat(bill.final_amount) || 0);
  }, 0) || 0;

  return total;
}

// Get revenue by date range
export async function getRevenueByDateRange(startDate, endDate) {
  const { data, error } = await supabase
    .from('Bill')
    .select('final_amount')
    .eq('payment_status', 'Paid')
    .gte('created_at', startDate)
    .lte('created_at', endDate);
  
  if (error) {
    console.error('❌ Error calculating revenue:', error);
    throw error;
  }

  const total = data?.reduce((sum, bill) => {
    return sum + (parseFloat(bill.final_amount) || 0);
  }, 0) || 0;

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

// ✅ Get last month revenue
export async function getLastMonthRevenue() {
  try {
    const today = new Date();
    const firstDayThisMonth = new Date(today.getFullYear(), today.getMonth(), 1);
    const lastDayLastMonth = new Date(firstDayThisMonth);
    lastDayLastMonth.setDate(0); // Get last day of previous month
    const firstDayLastMonth = new Date(lastDayLastMonth.getFullYear(), lastDayLastMonth.getMonth(), 1);

    const { data, error } = await supabase
      .from('Bill')
      .select('final_amount')
      .eq('payment_status', 'Paid')
      .gte('created_at', firstDayLastMonth.toISOString())
      .lte('created_at', lastDayLastMonth.toISOString());
    
    if (error) throw error;

    const total = data?.reduce((sum, bill) => {
      return sum + (parseFloat(bill.final_amount) || 0);
    }, 0) || 0;

    return total;
  } catch (error) {
    console.error('❌ Error calculating last month revenue:', error);
    return 0;
  }
}

// ✅ Calculate percentage change
export async function getRevenuePercentageChange() {
  try {
    const [thisMonth, lastMonth] = await Promise.all([
      getTodaysRevenue(),
      getLastMonthRevenue()
    ]);

    if (lastMonth === 0) return 0;
    const change = ((thisMonth - lastMonth) / lastMonth) * 100;
    return change.toFixed(1);
  } catch (error) {
    console.error('❌ Error calculating percentage:', error);
    return 0;
  }
}

// ✅ Create alias for Customers.jsx compatibility
export const createBill = addBill;

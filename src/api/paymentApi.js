// src/api/paymentApi.js - ✅ FULLY CORRECTED FOR SUPABASE

import { supabase } from './supabaseClient';

// Get all payments
export async function getPayments() {
  const { data, error } = await supabase
    .from('Payment')
    .select('*')
    .order('payment_id', { ascending: false });
  
  if (error) {
    console.error('❌ Error fetching payments:', error);
    throw error;
  }
  return data;
}

// Get payment by ID
export async function getPaymentById(paymentId) {
  const { data, error } = await supabase
    .from('Payment')
    .select('*')
    .eq('payment_id', paymentId)
    .single();
  
  if (error) {
    console.error('❌ Error fetching payment:', error);
    throw error;
  }
  return data;
}

// Get payments by bill ID
export async function getPaymentsByBillId(billId) {
  const { data, error } = await supabase
    .from('Payment')
    .select('*')
    .eq('bill_id', billId)
    .order('payment_id', { ascending: false });
  
  if (error) {
    console.error('❌ Error fetching payments by bill:', error);
    throw error;
  }
  return data;
}

// Get payments by payment method
export async function getPaymentsByMethod(paymentMethod) {
  const { data, error } = await supabase
    .from('Payment')
    .select('*')
    .eq('payment_method', paymentMethod)
    .order('payment_id', { ascending: false });
  
  if (error) {
    console.error('❌ Error fetching payments by method:', error);
    throw error;
  }
  return data;
}

// Get payments by status
export async function getPaymentsByStatus(status) {
  const { data, error } = await supabase
    .from('Payment')
    .select('*')
    .eq('payment_status', status)
    .order('payment_id', { ascending: false });
  
  if (error) {
    console.error('❌ Error fetching payments by status:', error);
    throw error;
  }
  return data;
}

// Get successful payments
export async function getSuccessfulPayments() {
  return await getPaymentsByStatus('Completed');
}

// Get failed payments
export async function getFailedPayments() {
  return await getPaymentsByStatus('Failed');
}

// Get pending payments
export async function getPendingPayments() {
  return await getPaymentsByStatus('Pending');
}

// ✅ Add new payment
export async function addPayment(paymentData) {
  console.log('💳 Adding payment:', paymentData);

  const { data, error } = await supabase
    .from('Payment')
    .insert([{
      bill_id: paymentData.bill_id,
      amount: paymentData.amount,
      payment_method: paymentData.payment_method,
      payment_status: paymentData.payment_status || 'Completed',
      payment_date: paymentData.payment_date || new Date().toISOString()
    }])
    .select();
  
  if (error) {
    console.error('❌ Error adding payment:', error);
    throw error;
  }
  
  console.log('✅ Payment created:', data[0]);
  return data[0];
}

// Update payment
export async function updatePayment(paymentId, updatedData) {
  const { data, error } = await supabase
    .from('Payment')
    .update(updatedData)
    .eq('payment_id', paymentId)
    .select();
  
  if (error) {
    console.error('❌ Error updating payment:', error);
    throw error;
  }
  return data[0];
}

// Update payment status
export async function updatePaymentStatus(paymentId, status) {
  const { data, error } = await supabase
    .from('Payment')
    .update({ payment_status: status })
    .eq('payment_id', paymentId)
    .select();
  
  if (error) {
    console.error('❌ Error updating payment status:', error);
    throw error;
  }
  return data[0];
}

// Mark payment as successful
export async function markPaymentAsSuccess(paymentId) {
  return await updatePaymentStatus(paymentId, 'Completed');
}

// Mark payment as failed
export async function markPaymentAsFailed(paymentId) {
  return await updatePaymentStatus(paymentId, 'Failed');
}

// Delete payment
export async function deletePayment(paymentId) {
  const { data, error } = await supabase
    .from('Payment')
    .delete()
    .eq('payment_id', paymentId);
  
  if (error) {
    console.error('❌ Error deleting payment:', error);
    throw error;
  }
  return data;
}

// Get payment count
export async function getPaymentCount() {
  const { count, error } = await supabase
    .from('Payment')
    .select('*', { count: 'exact', head: true });
  
  if (error) {
    console.error('❌ Error getting payment count:', error);
    throw error;
  }
  return count;
}

// Get payment count by status
export async function getPaymentCountByStatus(status) {
  const { count, error } = await supabase
    .from('Payment')
    .select('*', { count: 'exact', head: true })
    .eq('payment_status', status);
  
  if (error) {
    console.error('❌ Error getting payment count by status:', error);
    throw error;
  }
  return count;
}

// Get total payment amount
export async function getTotalPaymentAmount() {
  const { data, error } = await supabase
    .from('Payment')
    .select('amount')
    .eq('payment_status', 'Completed');
  
  if (error) {
    console.error('❌ Error calculating total payment amount:', error);
    throw error;
  }

  const total = data.reduce((sum, payment) => {
    return sum + (parseFloat(payment.amount) || 0);
  }, 0);

  return total;
}

// Get payment statistics
export async function getPaymentStatistics() {
  try {
    const [allPayments, successPayments, failedPayments] = await Promise.all([
      getPayments(),
      getSuccessfulPayments(),
      getFailedPayments()
    ]);

    const totalAmount = successPayments.reduce((sum, p) => sum + (parseFloat(p.amount) || 0), 0);
    const failedAmount = failedPayments.reduce((sum, p) => sum + (parseFloat(p.amount) || 0), 0);

    const stats = {
      total: allPayments.length,
      success: successPayments.length,
      failed: failedPayments.length,
      totalAmount: totalAmount,
      failedAmount: failedAmount,
      averagePayment: successPayments.length > 0 ? totalAmount / successPayments.length : 0,
      successRate: allPayments.length > 0 ? (successPayments.length / allPayments.length) * 100 : 0
    };

    return stats;
  } catch (error) {
    console.error('❌ Error calculating payment statistics:', error);
    throw error;
  }
}

// ✅ Create alias for Customers.jsx compatibility

// ✅ Process payment (create payment + mark as success + update bill)
export async function processPayment(paymentData) {
  try {
    console.log('💳 Processing payment:', paymentData);

    // Add payment record
    const payment = await addPayment({
      bill_id: paymentData.bill_id,
      amount: paymentData.amount,
      payment_method: paymentData.payment_method,
      payment_status: 'Pending'
    });

    // Mark payment as successful
    await markPaymentAsSuccess(payment.payment_id);
    
    // Update bill status to Paid
    const { error: billError } = await supabase
      .from('Bill')
      .update({ payment_status: 'Paid' })
      .eq('bill_id', paymentData.bill_id);

    if (billError) throw billError;

    console.log('✅ Payment processed successfully');
    return { success: true, payment };
  } catch (error) {
    console.error('❌ Error processing payment:', error);
    throw error;
  }
}

// ✅ Refund payment
export async function refundPayment(paymentId) {
  try {
    const payment = await getPaymentById(paymentId);
    
    if (payment.payment_status !== 'Completed') {
      throw new Error('Can only refund completed payments');
    }

    // Update payment status to refunded
    await updatePaymentStatus(paymentId, 'Refunded');

    // Update bill status back to Pending
    const { error: billError } = await supabase
      .from('Bill')
      .update({ payment_status: 'Pending' })
      .eq('bill_id', payment.bill_id);

    if (billError) throw billError;

    console.log('✅ Payment refunded successfully');
    return { success: true, message: 'Payment refunded successfully' };
  } catch (error) {
    console.error('❌ Error refunding payment:', error);
    throw error;
  }
}


export const createPayment = addPayment;

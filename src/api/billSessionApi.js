// src/api/billSessionApi.js - ✅ FIXED & IMPROVED VERSION

import { supabase } from './supabaseClient';

// ✅ 1️⃣ START BILL SESSION - FIXED TYPE ISSUE
export const startBillSession = async (tableId, guestName, guestCount = 1) => {
  try {
    // ✅ CRITICAL FIX: Convert to number to prevent bigint error
    const parsedTableId = parseInt(tableId);
    const parsedGuestCount = parseInt(guestCount);

    console.log(`🏢 Starting bill session for Table #${parsedTableId}`);
    console.log('📝 Parameters:', {
      tableId: parsedTableId,
      type: typeof parsedTableId,
      guestName,
      guestCount: parsedGuestCount
    });

    // ✅ Check for existing active session
    const { data: existing, error: existingError } = await supabase
      .from('bill_sessions')
      .select('*')
      .eq('table_id', parsedTableId)
      .eq('status', 'active')
      .maybeSingle(); // ✅ Use maybeSingle() instead of single()

    if (existingError && existingError.code !== 'PGRST116') {
      throw existingError;
    }

    if (existing) {
      console.log('⚠️ Active session already exists:', existing.id);
      return existing;
    }

    // ✅ Create new session with correct types
    const { data: session, error } = await supabase
      .from('bill_sessions')
      .insert({
        table_id: parsedTableId,          // ✅ Must be number (bigint)
        guest_name: guestName,            // ✅ Must be string (text)
        guest_count: parsedGuestCount,    // ✅ Must be number (integer)
        status: 'active',
        check_in_time: new Date().toISOString()
      })
      .select()
      .single();

    if (error) {
      console.error('❌ Session creation error:', error);
      throw error;
    }

    // ✅ Update Table status
    const { error: tableError } = await supabase
      .from('Table')
      .update({ 
        current_bill_session_id: session.id,
        table_status: 'Occupied', // ✅ Match your enum exactly
        occupied_by: guestName,
        updated_at: new Date().toISOString()
      })
      .eq('table_id', parsedTableId);

    if (tableError) {
      console.error('⚠️ Table update warning:', tableError);
      // Don't throw - session is created, just log warning
    }

    console.log('✅ Session started:', session.id);
    return session;

  } catch (error) {
    console.error('❌ startBillSession error:', error);
    throw new Error(`Failed to start bill session: ${error.message}`);
  }
};

// ✅ 2️⃣ GET ACTIVE SESSION
export const getActiveBillSession = async (tableId) => {
  try {
    const parsedTableId = parseInt(tableId);

    const { data: session, error } = await supabase
      .from('bill_sessions')
      .select('*')
      .eq('table_id', parsedTableId)
      .eq('status', 'active')
      .maybeSingle(); // ✅ Use maybeSingle() to handle no results gracefully

    if (error && error.code !== 'PGRST116') {
      throw error;
    }

    return session;
  } catch (error) {
    console.error('❌ getActiveBillSession error:', error);
    return null;
  }
};

// ✅ 3️⃣ GET OR CREATE BILL
export const getOrCreateBillForSession = async (sessionId) => {
  try {
    const parsedSessionId = parseInt(sessionId);

    // ✅ Check for existing bill
    const { data: existingBill, error: billError } = await supabase
      .from('Bill')
      .select('*')
      .eq('bill_session_id', parsedSessionId)
      .eq('bill_status', 'open')
      .maybeSingle();

    if (billError && billError.code !== 'PGRST116') {
      throw billError;
    }

    if (existingBill) {
      console.log('✅ Using existing bill:', existingBill.bill_id);
      return existingBill;
    }

    // ✅ Get session data
    const { data: sessionData, error: sessionError } = await supabase
      .from('bill_sessions')
      .select('*')
      .eq('id', parsedSessionId)
      .single();

    if (sessionError) throw sessionError;

    // ✅ Create new bill
    const { data: newBill, error: createError } = await supabase
      .from('Bill')
      .insert({
        bill_session_id: parsedSessionId,
        guest_name: sessionData.guest_name,
        customer_count: sessionData.guest_count,
        total_amount: 0,
        bill_status: 'open',
        payment_status: 'Pending',
        bill_date: new Date().toISOString()
      })
      .select()
      .single();

    if (createError) throw createError;

    console.log('✅ Bill created:', newBill.bill_id);
    return newBill;

  } catch (error) {
    console.error('❌ getOrCreateBillForSession error:', error);
    throw new Error(`Failed to get/create bill: ${error.message}`);
  }
};

// ✅ 4️⃣ ADD ORDER TO BILL
export const addOrderToBill = async (tableId, orderId) => {
  try {
    const parsedTableId = parseInt(tableId);
    const parsedOrderId = parseInt(orderId);

    console.log(`🔗 Linking order #${parsedOrderId} to table #${parsedTableId}`);

    // ✅ Get active session
    const session = await getActiveBillSession(parsedTableId);
    
    if (!session) {
      throw new Error(`No active session for table #${parsedTableId}`);
    }

    // ✅ Get or create bill
    const bill = await getOrCreateBillForSession(session.id);

    // ✅ Update order with session ID
    const { error: orderError } = await supabase
      .from('Order')
      .update({
        bill_session_id: session.id
      })
      .eq('order_id', parsedOrderId);

    if (orderError) throw orderError;

    // ✅ Recalculate bill total
    await recalculateBillTotal(bill.bill_id);

    console.log('✅ Order linked to bill:', bill.bill_id);
    return bill;

  } catch (error) {
    console.error('❌ addOrderToBill error:', error);
    throw new Error(`Failed to link order: ${error.message}`);
  }
};

// ✅ 5️⃣ RECALCULATE BILL TOTAL
export const recalculateBillTotal = async (billId) => {
  try {
    const parsedBillId = parseInt(billId);

    // ✅ Get bill with all orders and details
    const { data: bill, error } = await supabase
      .from('Bill')
      .select(`
        *,
        orders:Order!Order_bill_session_id_fkey(
          *,
          order_details:Order_Details(*)
        )
      `)
      .eq('bill_id', parsedBillId)
      .single();

    if (error) throw error;

    // ✅ Calculate total
    let totalAmount = 0;
    
    if (bill.orders && Array.isArray(bill.orders)) {
      bill.orders.forEach(order => {
        if (order.order_details && Array.isArray(order.order_details)) {
          order.order_details.forEach(detail => {
            const price = parseFloat(detail.price) || 0;
            const quantity = parseInt(detail.quantity) || 1;
            const discount = parseFloat(detail.discount) || 0;
            totalAmount += (price * quantity) - discount;
          });
        }
      });
    }

    // ✅ Update bill total
    const { error: updateError } = await supabase
      .from('Bill')
      .update({ total_amount: totalAmount })
      .eq('bill_id', parsedBillId);

    if (updateError) throw updateError;

    console.log(`✅ Bill total updated: ₹${totalAmount.toFixed(2)}`);
    return totalAmount;

  } catch (error) {
    console.error('❌ recalculateBillTotal error:', error);
    return 0;
  }
};

// ✅ 6️⃣ GET BILL FOR TABLE
export const getBillForTable = async (tableId) => {
  try {
    const parsedTableId = parseInt(tableId);

    // ✅ Get active session
    const session = await getActiveBillSession(parsedTableId);
    
    if (!session) {
      console.log('⚠️ No active session for table:', parsedTableId);
      return null;
    }

    // ✅ Get bill with details
    const { data: bill, error } = await supabase
      .from('Bill')
      .select(`
        *,
        orders:Order!Order_bill_session_id_fkey(
          *,
          order_details:Order_Details(
            *,
            dish:Dish(dish_name)
          )
        )
      `)
      .eq('bill_session_id', session.id)
      .eq('bill_status', 'open')
      .maybeSingle();

    if (error && error.code !== 'PGRST116') {
      throw error;
    }

    return bill;

  } catch (error) {
    console.error('❌ getBillForTable error:', error);
    return null;
  }
};

// ✅ 7️⃣ PAY & CLOSE BILL
export const payAndCloseBill = async (billId, tableId) => {
  try {
    const parsedBillId = parseInt(billId);
    const parsedTableId = parseInt(tableId);

    console.log(`💳 Processing payment for bill #${parsedBillId}`);

    // ✅ Step 1: Update bill status
    const { error: billError } = await supabase
      .from('Bill')
      .update({
        bill_status: 'closed',
        payment_status: 'Paid',
        payment_date: new Date().toISOString()
      })
      .eq('bill_id', parsedBillId);

    if (billError) throw billError;

    // ✅ Step 2: Close bill session
    const { error: sessionError } = await supabase
      .from('bill_sessions')
      .update({
        status: 'closed',
        check_out_time: new Date().toISOString()
      })
      .eq('table_id', parsedTableId)
      .eq('status', 'active');

    if (sessionError) {
      console.warn('⚠️ Session close warning:', sessionError);
      // Don't throw - continue
    }

    // ✅ Step 3: Free up table
    const { error: tableError } = await supabase
      .from('Table')
      .update({
        table_status: 'Available',
        current_bill_session_id: null,
        occupied_by: null,
        updated_at: new Date().toISOString()
      })
      .eq('table_id', parsedTableId);

    if (tableError) throw tableError;

    console.log('✅ Payment processed successfully');
    return true;

  } catch (error) {
    console.error('❌ payAndCloseBill error:', error);
    throw new Error(`Payment failed: ${error.message}`);
  }
};

// ✅ 8️⃣ GET ALL OPEN BILLS
export const getAllOpenBills = async () => {
  try {
    const { data: bills, error } = await supabase
      .from('Bill')
      .select(`
        *,
        bill_session:bill_sessions(
          *,
          table:Table(table_number)
        ),
        orders:Order!Order_bill_session_id_fkey(
          *,
          order_details:Order_Details(
            *,
            dish:Dish(dish_name)
          )
        )
      `)
      .eq('bill_status', 'open')
      .order('created_at', { ascending: false });

    if (error) throw error;

    return bills || [];

  } catch (error) {
    console.error('❌ getAllOpenBills error:', error);
    return [];
  }
};

// ✅ 9️⃣ CANCEL BILL SESSION (BONUS)
export const cancelBillSession = async (tableId) => {
  try {
    const parsedTableId = parseInt(tableId);

    console.log(`🚫 Cancelling session for table #${parsedTableId}`);

    // ✅ Get active session
    const session = await getActiveBillSession(parsedTableId);
    
    if (!session) {
      throw new Error('No active session to cancel');
    }

    // ✅ Cancel session
    const { error: sessionError } = await supabase
      .from('bill_sessions')
      .update({
        status: 'cancelled',
        check_out_time: new Date().toISOString()
      })
      .eq('id', session.id);

    if (sessionError) throw sessionError;

    // ✅ Free table
    const { error: tableError } = await supabase
      .from('Table')
      .update({
        table_status: 'Available',
        current_bill_session_id: null,
        occupied_by: null,
        updated_at: new Date().toISOString()
      })
      .eq('table_id', parsedTableId);

    if (tableError) throw tableError;

    console.log('✅ Session cancelled');
    return true;

  } catch (error) {
    console.error('❌ cancelBillSession error:', error);
    throw new Error(`Failed to cancel session: ${error.message}`);
  }
};

const billSessionApi = {
  startBillSession,
  getActiveBillSession,
  getOrCreateBillForSession,
  addOrderToBill,
  recalculateBillTotal,
  getBillForTable,
  payAndCloseBill,
  getAllOpenBills,
  cancelBillSession
};

export default billSessionApi;

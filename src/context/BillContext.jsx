// src/context/BillContext.jsx - ✅ WITH DATE TRACKING

import React, { createContext, useContext, useState, useCallback } from 'react';
import { supabase } from '../api/supabaseClient';
import { 
  getBills, 
  getTodaysBills, 
  getTotalRevenue, 
  addBill, 
  updateBill,
  updatePaymentStatus,
  deleteBill 
} from '../api/billApi';
import { getOrderDetailsByOrderId } from '../api/orderDetailsApi';

const BillContext = createContext();

export const useBill = () => {
  const context = useContext(BillContext);
  if (!context) {
    throw new Error('useBill must be used within BillProvider');
  }
  return context;
};

export const BillProvider = ({ children }) => {
  const [bills, setBills] = useState([]);
  const [orderDetails, setOrderDetails] = useState({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // ✅ 1. LOAD ALL BILLS
  const loadBills = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const billsData = await getBills();
      const detailsMap = {};

      await Promise.all(
        billsData.map(async (bill) => {
          try {
            const details = await getOrderDetailsByOrderId(bill.order_id);
            detailsMap[bill.order_id] = details;
          } catch (err) {
            console.error(`❌ Error loading details for order ${bill.order_id}:`, err);
          }
        })
      );

      setBills(billsData);
      setOrderDetails(detailsMap);
      console.log('✅ Bills loaded from counter:', billsData.length);
    } catch (err) {
      setError(err.message);
      console.error('❌ Error loading bills:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  // ✅ 2. CREATE BILL
  const createBill = useCallback(async (billData) => {
    try {
      setLoading(true);
      console.log('📝 Creating bill at counter:', billData);

      const newBill = await addBill(billData);
      
      setBills(prev => [newBill, ...prev]);
      
      console.log('✅ Bill saved at counter:', newBill);
      setError(null);
      
      return newBill;
    } catch (err) {
      const errMsg = err.message;
      setError(errMsg);
      console.error('❌ Error creating bill:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // ✅ 3. UPDATE BILL
  const modifyBill = useCallback(async (billId, updatedData) => {
    try {
      setLoading(true);
      const updated = await updateBill(billId, updatedData);
      
      setBills(prev => 
        prev.map(b => b.bill_id === billId ? updated : b)
      );
      
      console.log('✅ Bill updated at counter:', updated);
      return updated;
    } catch (err) {
      setError(err.message);
      console.error('❌ Error updating bill:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // ✅ 4. MARK BILL AS PAID
  const markBillAsPaid = useCallback(async (billId) => {
    try {
      setLoading(true);
      const updated = await updatePaymentStatus(billId, 'Paid');
      
      setBills(prev => 
        prev.map(b => b.bill_id === billId ? updated : b)
      );
      
      console.log('✅ Bill marked as PAID:', updated);
      
      return updated;
    } catch (err) {
      setError(err.message);
      console.error('❌ Error marking bill as paid:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // ✅ 5. DELETE BILL
  const removeBill = useCallback(async (billId) => {
    try {
      setLoading(true);
      await deleteBill(billId);
      
      setBills(prev => prev.filter(b => b.bill_id !== billId));
      
      console.log('✅ Bill deleted from counter');
    } catch (err) {
      setError(err.message);
      console.error('❌ Error deleting bill:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // ✅ 6. GET TODAY'S BILLS
  const getTodayBills = useCallback(async () => {
    try {
      return await getTodaysBills();
    } catch (err) {
      console.error('❌ Error fetching today bills:', err);
      throw err;
    }
  }, []);

  // ✅ 7. GET TOTAL REVENUE
  const getRevenue = useCallback(async () => {
    try {
      return await getTotalRevenue();
    } catch (err) {
      console.error('❌ Error fetching revenue:', err);
      throw err;
    }
  }, []);

  // ✅ 8. GET REVENUE BY DATE RANGE
  const getRevenueByDate = useCallback(async (startDate, endDate) => {
    try {
      setLoading(true);
      
      const { data, error } = await supabase
        .from('Bill')
        .select('final_amount, created_at')
        .gte('created_at', startDate.toISOString())
        .lte('created_at', endDate.toISOString());

      if (error) throw error;
      
      const revenue = data.reduce((sum, bill) => {
        return sum + (parseFloat(bill.final_amount) || 0);
      }, 0);
      
      console.log(`📊 Revenue from ${startDate.toDateString()} to ${endDate.toDateString()}: ₹${revenue}`);
      return revenue;
    } catch (err) {
      setError(err.message);
      console.error('❌ Error fetching revenue by date:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // ✅ 9. GET DAILY STATISTICS
  const getDailyStats = useCallback(async () => {
    try {
      setLoading(true);
      
      const { data, error } = await supabase
        .from('Bill')
        .select('bill_id, created_at, final_amount, payment_status')
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Group by date
      const statsByDate = {};
      data.forEach(bill => {
        const date = bill.created_at 
          ? new Date(bill.created_at).toLocaleDateString('en-IN')
          : 'Unknown';
        
        if (!statsByDate[date]) {
          statsByDate[date] = {
            date,
            totalBills: 0,
            paidBills: 0,
            pendingBills: 0,
            totalRevenue: 0
          };
        }
        
        statsByDate[date].totalBills += 1;
        if (bill.payment_status === 'Paid') {
          statsByDate[date].paidBills += 1;
        } else {
          statsByDate[date].pendingBills += 1;
        }
        statsByDate[date].totalRevenue += parseFloat(bill.final_amount) || 0;
      });

      const result = Object.values(statsByDate);
      console.log('📊 Daily stats:', result);
      return result;
    } catch (err) {
      setError(err.message);
      console.error('❌ Error fetching daily stats:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const value = {
    bills,
    orderDetails,
    loading,
    error,
    loadBills,
    createBill,
    modifyBill,
    markBillAsPaid,
    removeBill,
    getTodayBills,
    getRevenue,
    getRevenueByDate,  // ✅ NEW
    getDailyStats      // ✅ NEW
  };

  return (
    <BillContext.Provider value={value}>
      {children}
    </BillContext.Provider>
  );
};

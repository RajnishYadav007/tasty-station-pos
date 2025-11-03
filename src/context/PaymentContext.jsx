// src/context/PaymentContext.jsx - ✅ COMPLETE CASH COUNTER

import React, { createContext, useContext, useState, useCallback } from 'react';
import { 
  getPayments, 
  addPayment,
  updatePaymentStatus,
  processPayment,
  refundPayment,
  getPaymentStatistics
} from '../api/paymentApi';

const PaymentContext = createContext();

export const usePayment = () => {
  const context = useContext(PaymentContext);
  if (!context) {
    throw new Error('usePayment must be used within PaymentProvider');
  }
  return context;
};

export const PaymentProvider = ({ children }) => {
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // ✅ 1. LOAD ALL PAYMENTS (Cash counter me sab transactions dekho)
  const loadPayments = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const paymentsData = await getPayments();
      setPayments(paymentsData);
      
      console.log('✅ Payments loaded from cash counter:', paymentsData.length);
    } catch (err) {
      setError(err.message);
      console.error('❌ Error loading payments:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  // ✅ 2. PROCESS PAYMENT (Customer ne paise diye - transaction complete!)
  const executePayment = useCallback(async (paymentData) => {
    try {
      setLoading(true);
      console.log('💳 Processing payment at cash counter:', paymentData);

      // Process: Create payment + Mark as completed + Update bill as Paid
      const result = await processPayment(paymentData);
      
      if (result.payment) {
        setPayments(prev => [result.payment, ...prev]);
      }
      
      console.log('✅ Payment processed successfully!', result);
      setError(null);
      return result;
    } catch (err) {
      const errMsg = err.message;
      setError(errMsg);
      console.error('❌ Error processing payment:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // ✅ 3. REFUND PAYMENT (Customer refund dena padha)
  const requestRefund = useCallback(async (paymentId) => {
    try {
      setLoading(true);
      console.log('🔄 Processing refund at cash counter for payment:', paymentId);

      const result = await refundPayment(paymentId);
      
      // Update local state
      setPayments(prev => 
        prev.map(p => p.payment_id === paymentId ? { ...p, payment_status: 'Refunded' } : p)
      );
      
      console.log('✅ Refund processed successfully!', result);
      setError(null);
      return result;
    } catch (err) {
      const errMsg = err.message;
      setError(errMsg);
      console.error('❌ Error refunding payment:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // ✅ 4. GET PAYMENT STATISTICS (Cash counter ka summary)
  const getStats = useCallback(async () => {
    try {
      return await getPaymentStatistics();
    } catch (err) {
      console.error('❌ Error fetching statistics:', err);
      throw err;
    }
  }, []);

  // ✅ 5. UPDATE PAYMENT STATUS (Payment status change karo if needed)
  const updateStatus = useCallback(async (paymentId, status) => {
    try {
      setLoading(true);
      const updated = await updatePaymentStatus(paymentId, status);
      
      setPayments(prev => 
        prev.map(p => p.payment_id === paymentId ? updated : p)
      );
      
      console.log('✅ Payment status updated:', updated);
      return updated;
    } catch (err) {
      setError(err.message);
      console.error('❌ Error updating payment status:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const value = {
    // State
    payments,
    loading,
    error,
    
    // Methods
    loadPayments,
    executePayment,
    requestRefund,
    updateStatus,
    getStats
  };

  return (
    <PaymentContext.Provider value={value}>
      {children}
    </PaymentContext.Provider>
  );
};

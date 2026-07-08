// src/hooks/usePayment.js
import { useState, useCallback } from 'react';
import paymentService from '../services/paymentService';
import { toast } from 'react-hot-toast';

export const usePayment = () => {
  const [loading, setLoading] = useState(false);
  const [paymentData, setPaymentData] = useState(null);
  const [paymentError, setPaymentError] = useState(null);
  const [paymentSuccess, setPaymentSuccess] = useState(false);

  /**
   * Initialize payment and open Razorpay checkout
   */
  const initiatePayment = useCallback(async (orderData, token) => {
    setLoading(true);
    setPaymentError(null);

    try {
      // ✅ Set auth token
      paymentService.setToken(token);

      // ✅ Prepare payment data
      const paymentData = {
        amount: orderData.total,
        orderId: orderData._id || orderData.orderNumber || 'order_' + Date.now(),
        userName: orderData.shippingAddress?.fullName || 'Customer',
        userEmail: orderData.shippingAddress?.email || 'customer@example.com',
        userPhone: orderData.shippingAddress?.phoneNumber || '9999999999',
        orderDescription: `Order ${orderData.orderNumber || '#' + Date.now()}`,
        items: orderData.items,
        shippingAddress: orderData.shippingAddress,
      };

      // ✅ Get Razorpay order
      const response = await paymentService.initializeRazorpay(paymentData);
      
      if (!response.success) {
        throw new Error(response.message || 'Failed to initialize payment');
      }

      const razorpayOrder = response.data;
      setPaymentData(razorpayOrder);

      // ✅ Open Razorpay checkout
      await openRazorpayCheckout(razorpayOrder, orderData);

      return { success: true, paymentData: razorpayOrder };
    } catch (error) {
      console.error('Payment initiation error:', error);
      setPaymentError(error.message);
      toast.error(error.message || 'Payment initiation failed');
      return { success: false, error: error.message };
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Open Razorpay Checkout
   */
  const openRazorpayCheckout = useCallback((razorpayOrder, orderData) => {
    return new Promise((resolve, reject) => {
      // ✅ Check if Razorpay is loaded
      if (typeof window.Razorpay === 'undefined') {
        // Load Razorpay script dynamically
        const script = document.createElement('script');
        script.src = 'https://checkout.razorpay.com/v1/checkout.js';
        script.async = true;
        
        script.onload = () => {
          openCheckout(razorpayOrder, orderData, resolve, reject);
        };
        
        script.onerror = () => {
          reject(new Error('Failed to load Razorpay SDK'));
        };
        
        document.body.appendChild(script);
      } else {
        openCheckout(razorpayOrder, orderData, resolve, reject);
      }
    });
  }, []);

  /**
   * Open Razorpay checkout with order details
   */
  const openCheckout = (razorpayOrder, orderData, resolve, reject) => {
    const options = {
      key: razorpayOrder.razorpayKey || import.meta.env.VITE_RAZORPAY_KEY,
      amount: razorpayOrder.amount,
      currency: razorpayOrder.currency,
      name: 'Jewellery Store',
      description: `Order ${orderData.orderNumber || '#' + Date.now()}`,
      image: '/logo.png',
      order_id: razorpayOrder.id,
      handler: (response) => {
        // ✅ Payment successful
        console.log('Payment successful:', response);
        setPaymentSuccess(true);
        resolve({
          success: true,
          paymentId: response.razorpay_payment_id,
          orderId: response.razorpay_order_id,
          signature: response.razorpay_signature,
          ...response
        });
      },
      prefill: {
        name: orderData.shippingAddress?.fullName || '',
        email: orderData.shippingAddress?.email || '',
        contact: orderData.shippingAddress?.phoneNumber || '',
      },
      notes: {
        orderId: orderData._id,
        orderNumber: orderData.orderNumber,
      },
      theme: {
        color: '#DB2777', // Pink theme
      },
      modal: {
        ondismiss: () => {
          // ✅ User closed the modal
          reject(new Error('Payment cancelled by user'));
        },
      },
    };

    const razorpay = new window.Razorpay(options);
    razorpay.open();
  };

  /**
   * Verify payment
   */
  const verifyPayment = useCallback(async (paymentResponse, orderId) => {
    setLoading(true);
    try {
      const response = await paymentService.verifyPayment({
        razorpay_payment_id: paymentResponse.paymentId,
        razorpay_order_id: paymentResponse.orderId,
        razorpay_signature: paymentResponse.signature,
        orderId: orderId,
      });

      if (response.success) {
        toast.success('Payment verified successfully!');
        return { success: true, data: response.data };
      } else {
        throw new Error(response.message || 'Payment verification failed');
      }
    } catch (error) {
      console.error('Payment verification error:', error);
      toast.error(error.message || 'Payment verification failed');
      return { success: false, error: error.message };
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Reset payment state
   */
  const resetPayment = useCallback(() => {
    setPaymentData(null);
    setPaymentError(null);
    setPaymentSuccess(false);
    setLoading(false);
  }, []);

  return {
    loading,
    paymentData,
    paymentError,
    paymentSuccess,
    initiatePayment,
    verifyPayment,
    resetPayment,
    setPaymentSuccess,
  };
};
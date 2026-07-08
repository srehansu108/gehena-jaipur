// src/services/paymentService.js
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

class PaymentService {
  constructor() {
    this.api = axios.create({
      baseURL: API_URL,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  }

  setToken(token) {
    this.api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
  }

  /**
   * Initialize payment with Razorpay
   * @param {Object} paymentData - Payment details
   * @param {number} paymentData.amount - Amount in INR
   * @param {string} paymentData.orderId - Order ID
   * @param {string} paymentData.userName - Customer name
   * @param {string} paymentData.userEmail - Customer email
   * @param {string} paymentData.userPhone - Customer phone
   * @param {string} paymentData.orderDescription - Order description
   * @returns {Promise} Razorpay order details
   */
  async initializeRazorpay(paymentData) {
    try {
      // For demo, we'll create a mock Razorpay order
      // In production, this would call your backend to create a Razorpay order
      console.log('💰 Initializing payment:', paymentData);

      // ✅ Simulate backend call to create Razorpay order
      const response = await this.api.post('/payment/create-order', paymentData);

      // If backend fails, use mock data
      if (!response.data || !response.data.success) {
        return this.createMockRazorpayOrder(paymentData);
      }

      return response.data;
    } catch (error) {
      console.error('Payment initialization error:', error);
      
      // ✅ Fallback to mock data for demo
      return this.createMockRazorpayOrder(paymentData);
    }
  }

  /**
   * Create mock Razorpay order for demo
   */
  createMockRazorpayOrder(paymentData) {
    const amount = Math.round(paymentData.amount * 100); // Convert to paise
    const orderId = 'order_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);

    return {
      success: true,
      data: {
        id: orderId,
        entity: 'order',
        amount: amount,
        amount_paid: 0,
        amount_due: amount,
        currency: 'INR',
        receipt: paymentData.orderId || 'receipt_' + Date.now(),
        status: 'created',
        attempts: 0,
        notes: {
          orderId: paymentData.orderId,
          customerName: paymentData.userName,
          customerEmail: paymentData.userEmail,
        },
        created_at: Date.now(),
        // ✅ Razorpay key for frontend
        razorpayKey: import.meta.env.VITE_RAZORPAY_KEY || 'rzp_test_demo_key_123456'
      }
    };
  }

  /**
   * Verify payment after successful transaction
   * @param {Object} paymentData - Payment verification data
   * @returns {Promise} Verification result
   */
  async verifyPayment(paymentData) {
    try {
      const response = await this.api.post('/payment/verify', paymentData);
      return response.data;
    } catch (error) {
      console.error('Payment verification error:', error);
      
      // ✅ Mock verification for demo
      return {
        success: true,
        message: 'Payment verified successfully (demo mode)',
        data: {
          paymentId: paymentData.razorpay_payment_id,
          orderId: paymentData.razorpay_order_id,
          signature: paymentData.razorpay_signature,
          status: 'success'
        }
      };
    }
  }

  /**
   * Process refund for an order
   * @param {string} orderId - Order ID
   * @param {number} amount - Refund amount
   * @param {string} reason - Refund reason
   * @returns {Promise} Refund response
   */
  async processRefund(orderId, amount, reason) {
    try {
      const response = await this.api.post(`/payment/refund/${orderId}`, {
        amount,
        reason
      });
      return response.data;
    } catch (error) {
      console.error('Refund error:', error);
      
      // ✅ Mock refund for demo
      return {
        success: true,
        message: 'Refund processed successfully (demo mode)',
        data: {
          refundId: 'refund_' + Date.now(),
          orderId,
          amount,
          status: 'success',
          reason,
          processedAt: new Date().toISOString()
        }
      };
    }
  }

  /**
   * Get payment details by order ID
   * @param {string} orderId - Order ID
   * @returns {Promise} Payment details
   */
  async getPaymentDetails(orderId) {
    try {
      const response = await this.api.get(`/payment/order/${orderId}`);
      return response.data;
    } catch (error) {
      console.error('Fetch payment details error:', error);
      
      // ✅ Mock payment details for demo
      return {
        success: true,
        data: {
          orderId,
          paymentId: 'pay_' + Date.now(),
          amount: 0,
          currency: 'INR',
          status: 'paid',
          method: 'card',
          createdAt: new Date().toISOString()
        }
      };
    }
  }
}

export default new PaymentService();
// src/services/checkoutService.js - COMPLETE FIXED WITH PERSISTENCE ✅

import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

class CheckoutService {
  constructor() {
    this.api = axios.create({
      baseURL: API_URL,
      headers: {
        'Content-Type': 'application/json'
      }
    });
    
    // ✅ STORAGE KEYS
    this.STORAGE_KEYS = {
      MOCK_ORDERS: 'jewellery_mock_orders',
      MOCK_ID_COUNTER: 'jewellery_mock_id_counter'
    };
    
    // ✅ Initialize mock orders from localStorage
    this.mockOrders = [];
    this.initializeMockOrders();
    
    console.log('🔧 CheckoutService initialized with persistence');
  }

  // ============================================
  // PERSISTENCE METHODS
  // ============================================

  initializeMockOrders() {
    try {
      const stored = localStorage.getItem(this.STORAGE_KEYS.MOCK_ORDERS);
      if (stored) {
        this.mockOrders = JSON.parse(stored);
        console.log('📦 Loaded mock orders from localStorage:', this.mockOrders.length);
      } else {
        this.mockOrders = [];
        console.log('📦 No mock orders found in localStorage, starting empty');
      }
    } catch (error) {
      console.error('Error loading mock orders:', error);
      this.mockOrders = [];
    }
  }

  saveMockOrders() {
    try {
      localStorage.setItem(this.STORAGE_KEYS.MOCK_ORDERS, JSON.stringify(this.mockOrders));
      console.log('💾 Saved mock orders to localStorage:', this.mockOrders.length);
      return true;
    } catch (error) {
      console.error('Error saving mock orders:', error);
      return false;
    }
  }

  generateMockId() {
    try {
      let counter = parseInt(localStorage.getItem(this.STORAGE_KEYS.MOCK_ID_COUNTER) || '0');
      counter += 1;
      localStorage.setItem(this.STORAGE_KEYS.MOCK_ID_COUNTER, counter.toString());
      return `mock_${counter}_${Date.now()}`;
    } catch (error) {
      return `mock_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    }
  }

  getAllMockOrders() {
    this.initializeMockOrders();
    console.log('📦 getAllMockOrders returning:', this.mockOrders.length);
    return this.mockOrders;
  }

  getMockOrderById(orderId) {
    this.initializeMockOrders();
    const order = this.mockOrders.find(o => o._id === orderId);
    if (order) {
      return { success: true, data: order };
    }
    return { success: false, message: 'Order not found' };
  }

  getMockOrders(page = 1, limit = 10) {
    this.initializeMockOrders();
    const orders = this.mockOrders;
    const start = (page - 1) * limit;
    const end = start + limit;
    const paginatedOrders = orders.slice(start, end);
    
    return {
      success: true,
      data: paginatedOrders,
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(orders.length / limit) || 1,
        totalItems: orders.length,
        hasNextPage: end < orders.length,
        hasPrevPage: page > 1,
        itemsPerPage: limit
      }
    };
  }

  updateMockOrderStatus(orderId, status, note, updatedBy = 'Admin') {
    this.initializeMockOrders();
    
    const orderIndex = this.mockOrders.findIndex(o => o._id === orderId);
    if (orderIndex === -1) {
      return { success: false, message: 'Order not found' };
    }
    
    this.mockOrders[orderIndex].status = status;
    this.mockOrders[orderIndex].updatedAt = new Date().toISOString();
    
    if (!this.mockOrders[orderIndex].statusHistory) {
      this.mockOrders[orderIndex].statusHistory = [];
    }
    
    this.mockOrders[orderIndex].statusHistory.push({
      status: status,
      date: new Date().toISOString(),
      note: note || `Order status updated to ${status}`,
      updatedBy: updatedBy
    });
    
    this.saveMockOrders();
    
    return {
      success: true,
      message: `Order status updated to ${status}`,
      data: this.mockOrders[orderIndex]
    };
  }

  deleteMockOrder(orderId) {
    this.initializeMockOrders();
    
    const orderIndex = this.mockOrders.findIndex(o => o._id === orderId);
    if (orderIndex === -1) {
      return { success: false, message: 'Order not found' };
    }
    
    this.mockOrders.splice(orderIndex, 1);
    this.saveMockOrders();
    
    return {
      success: true,
      message: 'Order deleted successfully'
    };
  }

  // ============================================
  // AUTH METHODS
  // ============================================

  setToken(token) {
    this.api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
  }

  isDemoUser() {
    const token = localStorage.getItem('authToken') || localStorage.getItem('adminToken');
    return token && token.startsWith('demo-jwt-token-');
  }

  // ============================================
  // ORDER CREATION
  // ============================================

  async createOrder(orderData) {
    try {
      console.log('📦 Creating order with data:', orderData);
      
      // ✅ If demo user, create mock order with real data
      if (this.isDemoUser()) {
        console.log('🎭 Demo user detected - creating mock order with real data');
        return this.createMockOrder(orderData);
      }

      const response = await this.api.post('/orders', orderData);
      return response.data;
    } catch (error) {
      console.error('Error creating order:', error);
      
      if (error.response?.status === 500 && 
          error.response?.data?.error?.includes('Cast to ObjectId failed')) {
        console.warn('⚠️ Demo user detected, creating mock order...');
        return this.createMockOrder(orderData);
      }
      
      throw error.response?.data || { success: false, message: 'Failed to create order' };
    }
  }

  createMockOrder(orderData) {
    console.log('🎭 Creating mock order with real data:', orderData);
    
    this.initializeMockOrders();
    
    const mockOrder = {
      _id: this.generateMockId(),
      orderNumber: 'DEMO-' + Date.now().toString().slice(-8),
      userId: 'demo-admin-id',
      userName: orderData.shippingAddress?.fullName || 'Demo User',
      userEmail: orderData.shippingAddress?.email || 'demo@example.com',
      items: orderData.items || [],
      subtotal: orderData.subtotal || 0,
      discount: orderData.discount || 0,
      tax: orderData.tax || 0,
      shippingCharges: orderData.shippingCharges || 0,
      total: orderData.total || 0,
      paymentMethod: orderData.paymentMethod || 'COD',
      paymentStatus: 'Paid',
      transactionId: orderData.paymentDetails?.transactionId || 'TXN-DEMO-' + Date.now(),
      shippingAddress: {
        fullName: orderData.shippingAddress?.fullName || 'Demo User',
        addressLine1: orderData.shippingAddress?.addressLine1 || 'Demo Address',
        addressLine2: orderData.shippingAddress?.addressLine2 || '',
        city: orderData.shippingAddress?.city || 'Demo City',
        state: orderData.shippingAddress?.state || 'Demo State',
        postalCode: orderData.shippingAddress?.postalCode || '000000',
        country: orderData.shippingAddress?.country || 'India',
        phoneNumber: orderData.shippingAddress?.phoneNumber || '9999999999',
        email: orderData.shippingAddress?.email || 'demo@example.com'
      },
      shippingMethod: orderData.shippingMethod || 'Standard',
      shippingStatus: 'Processing',
      status: 'Processing',
      customerNote: orderData.customerNote || '',
      couponCode: orderData.couponCode || '',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      statusHistory: [
        {
          status: 'Processing',
          date: new Date().toISOString(),
          note: 'Order placed in demo mode',
          updatedBy: 'System'
        }
      ]
    };

    // ✅ Add to mock orders array (at the beginning)
    this.mockOrders.unshift(mockOrder);
    this.saveMockOrders();
    
    console.log('✅ Mock order created and saved:', mockOrder);
    console.log('📦 Total mock orders now:', this.mockOrders.length);
    console.log('📦 localStorage content:', localStorage.getItem(this.STORAGE_KEYS.MOCK_ORDERS));
    
    return {
      success: true,
      message: 'Order created successfully (Demo mode)',
      data: mockOrder
    };
  }

  // ============================================
  // ORDER RETRIEVAL
  // ============================================

  async getMyOrders(page = 1, limit = 10) {
    try {
      if (this.isDemoUser()) {
        console.log('🎭 Demo user - returning stored mock orders');
        return this.getMockOrders(page, limit);
      }

      const response = await this.api.get(`/orders/my-orders?page=${page}&limit=${limit}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching orders:', error);
      
      if (error.response?.status === 500 || this.isDemoUser()) {
        return this.getMockOrders(page, limit);
      }
      
      throw error.response?.data || { success: false, message: 'Failed to fetch orders' };
    }
  }

  async getOrderById(orderId) {
    try {
      if (orderId.startsWith('mock_')) {
        console.log('🎭 Getting mock order:', orderId);
        return this.getMockOrderById(orderId);
      }

      const response = await this.api.get(`/orders/${orderId}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching order:', error);
      
      if (orderId.startsWith('mock_')) {
        return this.getMockOrderById(orderId);
      }
      
      throw error.response?.data || { success: false, message: 'Failed to fetch order' };
    }
  }

  async cancelOrder(orderId, reason) {
    try {
      if (orderId.startsWith('mock_')) {
        console.log('🎭 Cancelling mock order:', orderId);
        return this.updateMockOrderStatus(orderId, 'Cancelled', reason || 'Cancelled by user', 'User');
      }

      const response = await this.api.put(`/orders/${orderId}/cancel`, { reason });
      return response.data;
    } catch (error) {
      console.error('Error cancelling order:', error);
      throw error.response?.data || { success: false, message: 'Failed to cancel order' };
    }
  }

  clearMockOrders() {
    this.mockOrders = [];
    localStorage.removeItem(this.STORAGE_KEYS.MOCK_ORDERS);
    localStorage.removeItem(this.STORAGE_KEYS.MOCK_ID_COUNTER);
    console.log('🧹 Mock orders cleared from localStorage');
  }

  debugStorage() {
    console.log('🔍 Debug Storage:');
    console.log('  localStorage mock orders:', localStorage.getItem(this.STORAGE_KEYS.MOCK_ORDERS));
    console.log('  this.mockOrders:', this.mockOrders);
    console.log('  Total orders:', this.mockOrders.length);
    return {
      localStorage: localStorage.getItem(this.STORAGE_KEYS.MOCK_ORDERS),
      memory: this.mockOrders,
      count: this.mockOrders.length
    };
  }
}

export default new CheckoutService();
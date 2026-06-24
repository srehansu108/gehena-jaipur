// src/services/api.js
// API Service - Connects frontend to backend MongoDB

import axios from 'axios';

// Get API URL from environment variables
const API_URL = 'https://gehena-jaipur.onrender.com/api' || 'http://localhost:5000/api';

// Create axios instance with default config
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
  timeout: 15000,
  withCredentials: true,
});

// ============ REQUEST INTERCEPTOR ============
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('authToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    console.error('Request Error:', error);
    return Promise.reject(error);
  }
);

// ============ RESPONSE INTERCEPTOR ============
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response) {
      const { status, data } = error.response;
      
      console.error(`API Error [${status}]:`, data?.message || error.message);
      
      if (status === 401) {
        localStorage.removeItem('authToken');
        // window.location.href = '/login';
      }
      
      if (status === 404) {
        console.warn('Resource not found:', error.config?.url);
      }
      
      if (status >= 500) {
        console.error('Server error. Please try again later.');
      }
    } else if (error.request) {
      console.error('Network Error: Could not reach server');
    } else {
      console.error('Error:', error.message);
    }
    
    return Promise.reject(error);
  }
);

// ============ AUTH ENDPOINTS ============

/**
 * User signup/registration
 * @param {Object} userData - User registration data
 * @param {string} userData.username - Username
 * @param {string} userData.firstName - First name
 * @param {string} userData.lastName - Last name
 * @param {string} userData.mobileNumber - Mobile number
 * @param {string} userData.email - Email address
 * @param {string} userData.password - Password
 * @returns {Promise} Auth response with token and user data
 */
export const signup = async (userData) => {
  try {
    const response = await api.post('/auth/signup', userData);
    if (response.data.token) {
      localStorage.setItem('authToken', response.data.token);
    }
    return response.data;
  } catch (error) {
    console.error('Signup error:', error);
    throw error;
  }
};

/**
 * User login
 * @param {Object} credentials - Login credentials
 * @param {string} credentials.identifier - Username or email
 * @param {string} credentials.password - Password
 * @param {boolean} credentials.rememberMe - Remember me flag
 * @returns {Promise} Auth response with token and user data
 */
export const login = async (credentials) => {
  try {
    const response = await api.post('/auth/login', credentials);
    if (response.data.token) {
      localStorage.setItem('authToken', response.data.token);
      if (credentials.rememberMe) {
        localStorage.setItem('rememberMe', 'true');
      }
    }
    return response.data;
  } catch (error) {
    console.error('Login error:', error);
    throw error;
  }
};

/**
 * Get current user profile
 * @returns {Promise} User data
 */
export const getCurrentUser = async () => {
  try {
    const response = await api.get('/auth/me');
    return response.data;
  } catch (error) {
    console.error('Get current user error:', error);
    throw error;
  }
};

/**
 * User logout
 * @returns {Promise} Logout response
 */
export const logout = async () => {
  try {
    const response = await api.post('/auth/logout');
    return response.data;
  } catch (error) {
    console.error('Logout error:', error);
    throw error;
  } finally {
    localStorage.removeItem('authToken');
    localStorage.removeItem('rememberMe');
  }
};

/**
 * Forgot password - Send reset code
 * @param {string} email - User's email
 * @returns {Promise} Response with reset code
 */
export const forgotPassword = async (email) => {
  try {
    const response = await api.post('/auth/forgot-password', { email });
    return response.data;
  } catch (error) {
    console.error('Forgot password error:', error);
    throw error;
  }
};

/**
 * Reset password with code
 * @param {Object} data - Reset data
 * @param {string} data.email - User's email
 * @param {string} data.code - Reset code
 * @param {string} data.newPassword - New password
 * @returns {Promise} Reset response
 */
export const resetPassword = async (data) => {
  try {
    const response = await api.post('/auth/reset-password', data);
    return response.data;
  } catch (error) {
    console.error('Reset password error:', error);
    throw error;
  }
};

/**
 * Update user profile
 * @param {Object} userData - Updated user data
 * @returns {Promise} Updated user data
 */
export const updateProfile = async (userData) => {
  try {
    const response = await api.put('/auth/profile', userData);
    return response.data;
  } catch (error) {
    console.error('Update profile error:', error);
    throw error;
  }
};

/**
 * Change password
 * @param {Object} data - Password change data
 * @param {string} data.currentPassword - Current password
 * @param {string} data.newPassword - New password
 * @returns {Promise} Password change response
 */
export const changePassword = async (data) => {
  try {
    const response = await api.put('/auth/change-password', data);
    return response.data;
  } catch (error) {
    console.error('Change password error:', error);
    throw error;
  }
};

/**
 * Check if user is authenticated
 * @returns {boolean} True if authenticated
 */
export const isAuthenticated = () => {
  return !!localStorage.getItem('authToken');
};

/**
 * Get user from token (decoded)
 * @returns {Object|null} User data or null
 */
export const getUserFromToken = () => {
  try {
    const token = localStorage.getItem('authToken');
    if (!token) return null;
    const payload = JSON.parse(atob(token.split('.')[1]));
    return payload;
  } catch (error) {
    return null;
  }
};

// ============ PRODUCT ENDPOINTS ============

export const getProducts = async (params = {}) => {
  try {
    const response = await api.get('/products', { params });
    return response.data;
  } catch (error) {
    console.error('Error fetching products:', error);
    throw error;
  }
};

export const getProductById = async (id) => {
  try {
    console.log(`📡 Fetching product with ID: ${id}`);
    const response = await axios.get(`${API_URL}/products/${id}`);
    console.log('📦 Product API response:', response.data);
    
    if (response.data.success) {
      return {
        success: true,
        data: response.data.data,
        related: response.data.related || [],
      };
    }
    
    return {
      success: false,
      message: response.data.message || 'Failed to fetch product',
    };
  } catch (error) {
    console.error('❌ Error fetching product:', error);
    if (error.response) {
      return {
        success: false,
        message: error.response.data.message || 'Product not found',
        status: error.response.status,
      };
    }
    return {
      success: false,
      message: error.message || 'Network error',
    };
  }
};

export const getProductBySku = async (sku) => {
  try {
    const response = await api.get(`/sku/${sku}`);
    return response.data;
  } catch (error) {
    console.error(`Error fetching product by SKU ${sku}:`, error);
    throw error;
  }
};

// ============ COLLECTION ENDPOINTS ============

export const getBestsellers = async (limit = 8) => {
  try {
    const response = await api.get('/collections/bestsellers', { 
      params: { limit } 
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching bestsellers:', error);
    throw error;
  }
};

export const getNewArrivals = async (limit = 8) => {
  try {
    const response = await api.get('/collections/new-arrivals', { 
      params: { limit } 
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching new arrivals:', error);
    throw error;
  }
};

export const getSaleProducts = async (limit = 8) => {
  try {
    const response = await api.get('/collections/sale', { 
      params: { limit } 
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching sale products:', error);
    throw error;
  }
};

// ============ META ENDPOINTS ============

export const getMetals = async () => {
  try {
    const response = await api.get('/meta/metals');
    return response.data;
  } catch (error) {
    console.error('Error fetching metals:', error);
    throw error;
  }
};

export const getCategoryCounts = async () => {
  try {
    const response = await api.get('/meta/categories');
    return response.data;
  } catch (error) {
    console.error('Error fetching category counts:', error);
    throw error;
  }
};

// ============ WISHLIST ENDPOINTS ============

/**
 * Get user's wishlist
 * @returns {Promise} Wishlist data
 */
export const getWishlist = async () => {
  try {
    const response = await api.get('/wishlist');
    return response.data;
  } catch (error) {
    console.error('Error fetching wishlist:', error);
    throw error;
  }
};

/**
 * Toggle product in wishlist (add/remove)
 * @param {string} productId - Product ID
 * @returns {Promise} Updated wishlist
 */
export const toggleWishlist = async (productId) => {
  try {
    const response = await api.post(`/wishlist/${productId}`);
    return response.data;
  } catch (error) {
    console.error('Error toggling wishlist:', error);
    throw error;
  }
};

/**
 * Remove product from wishlist
 * @param {string} productId - Product ID
 * @returns {Promise} Updated wishlist
 */
export const removeFromWishlist = async (productId) => {
  try {
    const response = await api.delete(`/wishlist/${productId}`);
    return response.data;
  } catch (error) {
    console.error('Error removing from wishlist:', error);
    throw error;
  }
};

/**
 * Clear wishlist
 * @returns {Promise} Empty wishlist
 */
export const clearWishlist = async () => {
  try {
    const response = await api.delete('/wishlist');
    return response.data;
  } catch (error) {
    console.error('Error clearing wishlist:', error);
    throw error;
  }
};

/**
 * Check if product is in wishlist
 * @param {string} productId - Product ID
 * @returns {Promise} Boolean status
 */
export const checkWishlist = async (productId) => {
  try {
    const response = await api.get(`/wishlist/check/${productId}`);
    return response.data;
  } catch (error) {
    console.error('Error checking wishlist:', error);
    throw error;
  }
};
// src/services/api.js
// Add these new endpoints to your existing api.js

// ============ ACCOUNT ENDPOINTS ============

/**
 * Get user's complete account data
 * @returns {Promise} User account data with orders, reviews, cart, wishlist
 */
export const getAccountData = async () => {
  try {
    const response = await api.get('/account/dashboard');
    return response.data;
  } catch (error) {
    console.error('Error fetching account data:', error);
    throw error;
  }
};

/**
 * Get user's order history
 * @param {Object} params - Pagination params
 * @returns {Promise} Order history
 */
export const getOrderHistory = async (params = { page: 1, limit: 10 }) => {
  try {
    const response = await api.get('/account/orders', { params });
    return response.data;
  } catch (error) {
    console.error('Error fetching order history:', error);
    throw error;
  }
};

/**
 * Get user's review statistics
 * @returns {Promise} Review stats
 */
export const getReviewStats = async () => {
  try {
    const response = await api.get('/account/reviews/stats');
    return response.data;
  } catch (error) {
    console.error('Error fetching review stats:', error);
    throw error;
  }
};

/**
 * Get user's wishlist with details
 * @returns {Promise} Wishlist items
 */
export const getWishlistDetails = async () => {
  try {
    const response = await api.get('/account/wishlist');
    return response.data;
  } catch (error) {
    console.error('Error fetching wishlist:', error);
    throw error;
  }
};

/**
 * Get user's cart with details
 * @returns {Promise} Cart items
 */
export const getCartDetails = async () => {
  try {
    const response = await api.get('/account/cart');
    return response.data;
  } catch (error) {
    console.error('Error fetching cart:', error);
    throw error;
  }
};

// ============ CART ENDPOINTS ============

/**
 * Get user's cart
 * @returns {Promise} Cart data
 */
export const getCart = async () => {
  try {
    const response = await api.get('/cart');
    return response.data;
  } catch (error) {
    console.error('Error fetching cart:', error);
    throw error;
  }
};

/**
 * Add item to cart
 * @param {string} productId - Product ID
 * @param {number} quantity - Quantity
 * @returns {Promise} Updated cart
 */
export const addToCart = async (productId, quantity = 1) => {
  try {
    const response = await api.post('/cart', { productId, quantity });
    return response.data;
  } catch (error) {
    console.error('Error adding to cart:', error);
    throw error;
  }
};

/**
 * Update cart item quantity
 * @param {string} productId - Product ID
 * @param {number} quantity - New quantity
 * @returns {Promise} Updated cart
 */
export const updateCartItem = async (productId, quantity) => {
  try {
    const response = await api.put(`/cart/${productId}`, { quantity });
    return response.data;
  } catch (error) {
    console.error('Error updating cart:', error);
    throw error;
  }
};

/**
 * Remove item from cart
 * @param {string} productId - Product ID
 * @returns {Promise} Updated cart
 */
export const removeFromCart = async (productId) => {
  try {
    const response = await api.delete(`/cart/${productId}`);
    return response.data;
  } catch (error) {
    console.error('Error removing from cart:', error);
    throw error;
  }
};

/**
 * Clear cart
 * @returns {Promise} Empty cart
 */
export const clearCart = async () => {
  try {
    const response = await api.delete('/cart');
    return response.data;
  } catch (error) {
    console.error('Error clearing cart:', error);
    throw error;
  }
};

/**
 * Apply coupon to cart
 * @param {string} couponCode - Coupon code
 * @returns {Promise} Updated cart
 */
export const applyCoupon = async (couponCode) => {
  try {
    const response = await api.post('/cart/coupon', { couponCode });
    return response.data;
  } catch (error) {
    console.error('Error applying coupon:', error);
    throw error;
  }
};

/**
 * Remove coupon from cart
 * @returns {Promise} Updated cart
 */
export const removeCoupon = async () => {
  try {
    const response = await api.delete('/cart/coupon');
    return response.data;
  } catch (error) {
    console.error('Error removing coupon:', error);
    throw error;
  }
};

/**
 * Get cart item count
 * @returns {Promise} Cart count
 */
export const getCartCount = async () => {
  try {
    const response = await api.get('/cart/count');
    return response.data;
  } catch (error) {
    console.error('Error getting cart count:', error);
    throw error;
  }
};

// Export the api instance for direct use
export default api;
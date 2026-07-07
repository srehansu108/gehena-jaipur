// src/services/api.js
// API Service - Connects frontend to backend MongoDB

import axios from 'axios';

// Get API URL from environment variables
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

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

// ============ REQUEST INTERCEPTOR - FIXED ============
api.interceptors.request.use(
  (config) => {
    // ✅ Check for admin token first, then fallback to authToken
    const adminToken = localStorage.getItem('adminToken');
    const authToken = localStorage.getItem('authToken');
    
    // Use admin token if available, otherwise use auth token
    const token = adminToken || authToken;
    
    // ✅ Debug logging
    console.log('🔑 Token being sent:', token ? 'Yes (exists)' : 'No token found');
    console.log('📡 Request URL:', config.url);
    
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
      console.log('✅ Authorization header set');
    } else {
      console.warn('⚠️ No token found in localStorage');
    }
    
    return config;
  },
  (error) => {
    console.error('Request Error:', error);
    return Promise.reject(error);
  }
);

// ============ RESPONSE INTERCEPTOR - FIXED ============
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response) {
      const { status, data } = error.response;
      
      console.error(`API Error [${status}]:`, data?.message || error.message);
      
      // Handle different status codes
      switch (status) {
        case 400:
          console.warn('Bad Request:', data?.errors || data?.message);
          error.displayMessage = data?.message || 'Invalid request. Please check your input.';
          break;
          
        case 401:
          console.warn('🔒 Session expired or unauthorized');
          
          // ✅ Check if we're on admin or auth pages
          const isAdminPage = window.location.pathname.startsWith('/admin');
          const isLoginPage = window.location.pathname.includes('/login') || 
                             window.location.pathname.includes('/signup');
          
          // ✅ For admin pages, just log but don't redirect automatically
          if (isAdminPage) {
            console.warn('Admin token may be invalid. Please re-login.');
            // You can show a toast/notification here
          } else if (!isLoginPage) {
            // Only redirect for non-admin pages
            localStorage.removeItem('authToken');
            if (!window.location.pathname.includes('/login')) {
              window.location.href = '/login';
            }
          }
          
          error.displayMessage = 'Please login to continue.';
          break;
          
        case 403:
          console.error('Access Denied: Insufficient permissions');
          error.displayMessage = data?.message || 'You don\'t have permission to perform this action.';
          break;
          
        case 404:
          // Don't log 404 for admin endpoints (they might not exist yet)
          if (!error.config?.url?.includes('/admin')) {
            console.warn('Resource not found:', error.config?.url);
          }
          error.displayMessage = data?.message || 'Resource not found.';
          break;
          
        case 409:
          console.warn('Conflict:', data?.message);
          error.displayMessage = data?.message || 'Conflict detected. Duplicate entry.';
          break;
          
        case 422:
          console.warn('Validation Error:', data?.errors || data?.message);
          error.displayMessage = data?.message || 'Validation failed. Please check your input.';
          break;
          
        case 429:
          console.warn('Rate limit exceeded. Please try again later.');
          error.displayMessage = 'Too many requests. Please try again later.';
          break;
          
        case 500:
        case 502:
        case 503:
        case 504:
          console.error('Server Error:', data?.message || 'Internal server error');
          error.displayMessage = 'Server error. Please try again later.';
          break;
          
        default:
          console.warn(`Unhandled status code: ${status}`);
          error.displayMessage = data?.message || 'An unexpected error occurred.';
      }
      
    } else if (error.request) {
      console.error('Network Error: Could not reach server');
      error.displayMessage = 'Network error. Please check your internet connection.';
      
    } else {
      console.error('Error:', error.message);
      error.displayMessage = error.message || 'An error occurred while making the request.';
    }
    
    return Promise.reject(error);
  }
);

// ============ AUTH ENDPOINTS ============

/**
 * Admin Login - DEMO MODE (bypasses backend)
 * @param {Object} credentials - Login credentials
 * @param {string} credentials.email - Admin email
 * @param {string} credentials.password - Admin password
 * @param {boolean} credentials.rememberMe - Remember me flag
 * @returns {Promise} Auth response with token and user data
 */
export const adminLogin = async (credentials) => {
  // Demo credentials
  const DEMO_CREDENTIALS = {
    email: 'admin@adminportal.com',
    password: 'Admin@123',
  };

  console.log('🔐 Admin login - DEMO MODE');
  
  // Check if credentials match demo credentials
  if (credentials.email === DEMO_CREDENTIALS.email && 
      credentials.password === DEMO_CREDENTIALS.password) {
    
    // Generate a demo token
    const token = 'demo-jwt-token-' + Date.now();
    const userData = {
      id: '1',
      name: 'Super Admin',
      email: credentials.email,
      role: 'admin',  // ✅ CHANGED from 'super_admin' to 'admin' to match middleware
      permissions: ['all'],
      isAdmin: true
    };

    // Store in localStorage
    localStorage.setItem('adminToken', token);
    localStorage.setItem('adminUser', JSON.stringify(userData));
    if (credentials.rememberMe) {
      localStorage.setItem('rememberMe', 'true');
    }

    console.log('✅ Admin login successful! Token saved:', token.substring(0, 20) + '...');
    console.log('📦 User data saved:', userData);

    return {
      success: true,
      token: token,
      user: userData,
      message: 'Login successful (demo mode)'
    };
  }

  // If credentials don't match, return error
  return {
    success: false,
    message: 'Invalid email or password'
  };
};

/**
 * Admin Logout
 * @returns {Promise} Logout response
 */
export const adminLogout = async () => {
  try {
    const response = await api.post('/admin/logout');
    return response.data;
  } catch (error) {
    console.error('Admin logout error:', error);
    throw error;
  } finally {
    localStorage.removeItem('adminToken');
    localStorage.removeItem('adminUser');
    localStorage.removeItem('rememberMe');
  }
};

/**
 * Get admin profile
 * @returns {Promise} Admin user data
 */
export const getAdminProfile = async () => {
  try {
    const response = await api.get('/admin/profile');
    return response.data;
  } catch (error) {
    console.error('Get admin profile error:', error);
    throw error;
  }
};

/**
 * Update admin profile
 * @param {Object} userData - Updated admin data
 * @returns {Promise} Updated admin data
 */
export const updateAdminProfile = async (userData) => {
  try {
    const response = await api.put('/admin/profile', userData);
    return response.data;
  } catch (error) {
    console.error('Update admin profile error:', error);
    throw error;
  }
};

/**
 * Check if admin is authenticated
 * @returns {boolean} True if authenticated
 */
export const isAdminAuthenticated = () => {
  return !!localStorage.getItem('adminToken');
};

/**
 * Get admin user from storage
 * @returns {Object|null} Admin user data or null
 */
export const getAdminUser = () => {
  try {
    const user = localStorage.getItem('adminUser');
    return user ? JSON.parse(user) : null;
  } catch (error) {
    console.error('Error parsing admin user:', error);
    return null;
  }
};

/**
 * Get admin from token (decoded)
 * @returns {Object|null} Admin data or null
 */
export const getAdminFromToken = () => {
  try {
    const token = localStorage.getItem('adminToken');
    if (!token) return null;
    const payload = JSON.parse(atob(token.split('.')[1]));
    return payload;
  } catch (error) {
    return null;
  }
};

// ============ USER AUTH ENDPOINTS (for regular users) ============

/**
 * User signup/registration
 * @param {Object} userData - User registration data
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

// ============ ADMIN ENDPOINTS ============

/**
 * Get admin dashboard statistics
 * @returns {Promise} Dashboard stats with real data
 */
export const getAdminStats = async () => {
  try {
    console.log('📊 Fetching admin stats...');
    const response = await api.get('/admin/stats');
    console.log('✅ Admin stats received:', response.data);
    return response.data;
  } catch (error) {
    console.error('❌ Error fetching admin stats:', error);
    
    // Return fallback data only if API fails
    return {
      success: true,
      data: {
        totalUsers: 0,
        totalRevenue: 0,
        totalOrders: 0,
        growth: 0,
        newUsersToday: 0,
        newUsersThisWeek: 0,
        newUsersThisMonth: 0,
        pendingOrders: 0,
        processingOrders: 0,
        shippedOrders: 0,
        deliveredOrders: 0,
        cancelledOrders: 0,
        revenueToday: 0,
        revenueThisWeek: 0,
        revenueThisMonth: 0,
        averageOrderValue: 0,
        totalProducts: 0,
        lowStockProducts: 0,
        outOfStockProducts: 0,
        recentActivities: [],
        monthlyRevenue: []
      }
    };
  }
};

// ============ ADMIN USER ENDPOINTS ============

/**
 * Get all users with pagination and search
 * @param {Object} params - Query parameters
 * @returns {Promise} Users data from database
 */
export const getAdminUsers = async (params = {}) => {
  try {
    console.log('📊 Fetching admin users...', params);
    const response = await api.get('/admin/users', { params });
    console.log('✅ Admin users response:', response.data);
    
    // ✅ Handle different response structures
    if (response.data && response.data.success) {
      return {
        success: true,
        data: response.data.data || [],
        pagination: response.data.pagination || {
          page: 1,
          limit: 10,
          total: response.data.data?.length || 0,
          pages: 1
        }
      };
    }
    
    return response.data;
  } catch (error) {
    console.error('❌ Error fetching admin users:', error);
    throw error;
  }
};

/**
 * Update user role
 * @param {string} userId - User ID
 * @param {string} role - New role ('user' or 'admin')
 * @returns {Promise} Updated user data
 */
export const updateUserRole = async (userId, role) => {
  try {
    const response = await api.put(`/admin/users/${userId}/role`, { role });
    return response.data;
  } catch (error) {
    console.error('Error updating user role:', error);
    throw error;
  }
};

/**
 * Delete user
 * @param {string} userId - User ID
 * @returns {Promise} Delete response
 */
export const deleteUser = async (userId) => {
  try {
    const response = await api.delete(`/admin/users/${userId}`);
    return response.data;
  } catch (error) {
    console.error('Error deleting user:', error);
    throw error;
  }
};

// ============ ADMIN PRODUCT ENDPOINTS ============

/**
 * Get admin products with pagination and search
 * @param {Object} params - Query parameters
 * @returns {Promise} Products data from database
 */
export const getAdminProducts = async (params = {}) => {
  try {
    console.log('📊 Fetching admin products...', params);
    const response = await api.get('/products/admin/products', { params }); // ✅ CORRECT
    console.log('✅ Admin products received:', response.data);
    return response.data;
  } catch (error) {
    console.error('❌ Error fetching admin products:', error);
    throw error;
  }
};
/**
 * Create a new product (Admin)
 * @param {Object} productData - Product data
 * @returns {Promise} Created product
 */
export const createProduct = async (productData) => {
  try {
    console.log('📦 Creating product...', productData);
    const response = await api.post('/products/admin/products', productData);
    console.log('✅ Product created:', response.data);
    return response.data;
  } catch (error) {
    console.error('❌ Error creating product:', error);
    throw error;
  }
};

/**
 * Update a product (Admin)
 * @param {string} productId - Product ID
 * @param {Object} productData - Updated product data
 * @returns {Promise} Updated product
 */
export const updateProduct = async (productId, productData) => {
  try {
    console.log('📝 Updating product...', productId, productData);
    const response = await api.put(`/products/admin/products/${productId}`, productData);
    console.log('✅ Product updated:', response.data);
    return response.data;
  } catch (error) {
    console.error('❌ Error updating product:', error);
    throw error;
  }
};

/**
 * Delete a product (Admin)
 * @param {string} productId - Product ID
 * @returns {Promise} Delete response
 */
export const deleteProduct = async (productId) => {
  try {
    console.log('🗑️ Deleting product...', productId);
    const response = await api.delete(`/products/admin/products/${productId}`);
    console.log('✅ Product deleted:', response.data);
    return response.data;
  } catch (error) {
    console.error('❌ Error deleting product:', error);
    throw error;
  }
};


// ============ BULK IMPORT/EXPORT ENDPOINTS ============

/**
 * Bulk import products from CSV/JSON
 * @param {Array} products - Array of product data
 * @returns {Promise} Import response
 */
export const bulkImportProducts = async (products) => {
  try {
    console.log('📦 Bulk importing products...', products.length);
    const response = await api.post('/products/admin/products/bulk', { products });
    console.log('✅ Bulk import completed:', response.data);
    return response.data;
  } catch (error) {
    console.error('❌ Error bulk importing products:', error);
    throw error;
  }
};

/**
 * Export products as CSV
 * @param {Object} params - Query parameters for filtering
 * @returns {Promise} CSV data
 */
export const exportProductsCSV = async (params = {}) => {
  try {
    console.log('📤 Exporting products as CSV...', params);
    const response = await api.get('/products/admin/export/csv', { 
      params,
      responseType: 'blob' 
    });
    console.log('✅ CSV export completed');
    return response.data;
  } catch (error) {
    console.error('❌ Error exporting products as CSV:', error);
    throw error;
  }
};

/**
 * Export products as JSON
 * @param {Object} params - Query parameters for filtering
 * @returns {Promise} JSON data
 */
export const exportProductsJSON = async (params = {}) => {
  try {
    console.log('📤 Exporting products as JSON...', params);
    const response = await api.get('/products/admin/export/json', { params });
    console.log('✅ JSON export completed');
    return response.data;
  } catch (error) {
    console.error('❌ Error exporting products as JSON:', error);
    throw error;
  }
};

/**
 * Get sample CSV template
 * @returns {Promise} CSV template blob
 */
export const getCSVTemplate = async () => {
  try {
    console.log('📄 Getting CSV template...');
    const response = await api.get('/products/admin/export/template', {
      responseType: 'blob'
    });
    console.log('✅ CSV template received');
    return response.data;
  } catch (error) {
    console.error('❌ Error getting CSV template:', error);
    throw error;
  }
};

// ============ ANALYTICS ENDPOINTS ============

/**
 * Get analytics data for dashboard
 * @param {Object} params - Query parameters
 * @param {string} params.range - Time range (7d, 30d, 90d, 12m)
 * @returns {Promise} Analytics data
 */
export const getAnalyticsData = async (params = {}) => {
  try {
    console.log('📊 Fetching analytics data...', params);
    const response = await api.get('/admin/analytics', { params });
    console.log('✅ Analytics data received:', response.data);
    return response.data;
  } catch (error) {
    console.error('❌ Error fetching analytics:', error);
    throw error;
  }
};

// ============ REPORTS ENDPOINTS ============

/**
 * Get reports data
 * @param {Object} params - Query parameters
 * @returns {Promise} Reports data
 */
export const getReports = async (params = {}) => {
  try {
    console.log('📄 Fetching reports...', params);
    const response = await api.get('/admin/reports', { params });
    console.log('✅ Reports received:', response.data);
    return response.data;
  } catch (error) {
    console.error('❌ Error fetching reports:', error);
    throw error;
  }
};

/**
 * Download report as PDF
 * @param {Object} params - Report parameters
 * @returns {Promise} PDF blob
 */
export const downloadReportPDF = async (params = {}) => {
  try {
    const response = await api.get('/admin/reports/download/pdf', {
      params,
      responseType: 'blob'
    });
    return response.data;
  } catch (error) {
    console.error('❌ Error downloading PDF:', error);
    throw error;
  }
};

/**
 * Download report as Excel
 * @param {Object} params - Report parameters
 * @returns {Promise} Excel blob
 */
export const downloadReportExcel = async (params = {}) => {
  try {
    const response = await api.get('/admin/reports/download/excel', {
      params,
      responseType: 'blob'
    });
    return response.data;
  } catch (error) {
    console.error('❌ Error downloading Excel:', error);
    throw error;
  }
};

// Export the api instance for direct use
export default api;
// src/contexts/CartContext.jsx

import { createContext, useContext, useState, useEffect } from 'react';
import * as api from '../services/api';
import { useAuth } from './AuthContext';

const CartContext = createContext();

export function CartProvider({ children }) {
  const [cart, setCart] = useState(null);
  const [loading, setLoading] = useState(true);
  const [itemCount, setItemCount] = useState(0);
  const { isAuthenticated, token, user } = useAuth();

  // Check if we're on an admin page
  const isAdminPage = window.location.pathname.startsWith('/admin');
  // Check if user is admin
  const isAdmin = user?.isAdmin || user?.role === 'super_admin';

  // Fetch cart only when authenticated and NOT on admin pages
  useEffect(() => {
    // Only fetch cart if:
    // 1. User is authenticated
    // 2. NOT on admin page
    // 3. NOT an admin user
    if (isAuthenticated && token && !isAdminPage && !isAdmin) {
      fetchCart();
    } else {
      // Reset cart state for admin pages or unauthenticated users
      setCart(null);
      setItemCount(0);
      setLoading(false);
    }
  }, [isAuthenticated, token, isAdminPage, isAdmin]);

  // Update item count whenever cart changes
  useEffect(() => {
    if (cart && cart.items) {
      const count = cart.items.reduce((sum, item) => sum + (item.quantity || 0), 0);
      setItemCount(count);
    } else {
      setItemCount(0);
    }
  }, [cart]);

  const fetchCart = async () => {
    try {
      setLoading(true);
      const response = await api.getCart();
      if (response.success) {
        setCart(response.data);
      } else {
        setCart(null);
      }
    } catch (error) {
      // Silent fail for 401 - user is just not logged in
      if (error.response?.status !== 401) {
        console.error('Failed to fetch cart:', error);
      }
      setCart(null);
    } finally {
      setLoading(false);
    }
  };

  const addItem = async (productId, quantity = 1) => {
    try {
      const response = await api.addToCart(productId, quantity);
      if (response.success) {
        setCart(response.data);
        return { success: true };
      }
      return { success: false, message: response.message };
    } catch (error) {
      console.error('Failed to add item:', error);
      return { 
        success: false, 
        message: error.response?.data?.message || 'Failed to add item' 
      };
    }
  };

  const updateItem = async (productId, quantity) => {
    try {
      const response = await api.updateCartItem(productId, quantity);
      if (response.success) {
        setCart(response.data);
        return { success: true };
      }
      return { success: false, message: response.message };
    } catch (error) {
      console.error('Failed to update item:', error);
      return { 
        success: false, 
        message: error.response?.data?.message || 'Failed to update item' 
      };
    }
  };

  const removeItem = async (productId) => {
    try {
      const response = await api.removeFromCart(productId);
      if (response.success) {
        setCart(response.data);
        return { success: true };
      }
      return { success: false, message: response.message };
    } catch (error) {
      console.error('Failed to remove item:', error);
      return { 
        success: false, 
        message: error.response?.data?.message || 'Failed to remove item' 
      };
    }
  };

  const clearCart = async () => {
    try {
      const response = await api.clearCart();
      if (response.success) {
        setCart(response.data);
        return { success: true };
      }
      return { success: false, message: response.message };
    } catch (error) {
      console.error('Failed to clear cart:', error);
      return { 
        success: false, 
        message: error.response?.data?.message || 'Failed to clear cart' 
      };
    }
  };

  const applyCoupon = async (couponCode) => {
    try {
      const response = await api.applyCoupon(couponCode);
      if (response.success) {
        setCart(response.data);
        return { success: true, message: response.message };
      }
      return { success: false, message: response.message };
    } catch (error) {
      console.error('Failed to apply coupon:', error);
      return { 
        success: false, 
        message: error.response?.data?.message || 'Failed to apply coupon' 
      };
    }
  };

  const removeCoupon = async () => {
    try {
      const response = await api.removeCoupon();
      if (response.success) {
        setCart(response.data);
        return { success: true };
      }
      return { success: false, message: response.message };
    } catch (error) {
      console.error('Failed to remove coupon:', error);
      return { 
        success: false, 
        message: error.response?.data?.message || 'Failed to remove coupon' 
      };
    }
  };

  const value = {
    cart,
    loading,
    itemCount,
    fetchCart,
    addItem,
    updateItem,
    removeItem,
    clearCart,
    applyCoupon,
    removeCoupon,
  };

  return (
    <CartContext.Provider value={value}>
      {children}
    </CartContext.Provider>
  );
}

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};
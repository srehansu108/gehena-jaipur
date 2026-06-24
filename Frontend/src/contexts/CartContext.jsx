// src/contexts/CartContext.jsx
import { createContext, useContext, useState, useEffect } from 'react';
import * as api from '../services/api';

const CartContext = createContext();

export function CartProvider({ children }) {
  const [cart, setCart] = useState(null);
  const [loading, setLoading] = useState(true);
  const [itemCount, setItemCount] = useState(0);

  // Fetch cart on mount
  useEffect(() => {
    fetchCart();
  }, []);

  // Update item count whenever cart changes
  useEffect(() => {
    if (cart) {
      const count = cart.items.reduce((sum, item) => sum + item.quantity, 0);
      setItemCount(count);
    }
  }, [cart]);

  const fetchCart = async () => {
    try {
      setLoading(true);
      const response = await api.getCart();
      if (response.success) {
        setCart(response.data);
      }
    } catch (error) {
      console.error('Failed to fetch cart:', error);
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
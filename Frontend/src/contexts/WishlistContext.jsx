// src/contexts/WishlistContext.jsx
import { createContext, useContext, useState, useEffect } from 'react';
import * as api from '../services/api';
import { useAuth } from './AuthContext';

const WishlistContext = createContext();

export function WishlistProvider({ children }) {
  const { isAuthenticated } = useAuth();
  const [wishlist, setWishlist] = useState({
    items: [],
    products: [],
    count: 0,
  });
  const [loading, setLoading] = useState(true);
  const [wishlistIds, setWishlistIds] = useState(new Set());

  // Fetch wishlist on mount and when auth changes
  useEffect(() => {
    if (isAuthenticated) {
      fetchWishlist();
    } else {
      setWishlist({ items: [], products: [], count: 0 });
      setWishlistIds(new Set());
      setLoading(false);
    }
  }, [isAuthenticated]);

  // Fetch wishlist from API
  const fetchWishlist = async () => {
    try {
      setLoading(true);
      console.log('🔍 Fetching wishlist...');
      const response = await api.getWishlist();
      console.log('📦 Wishlist API Response:', response);
      
      if (response.success) {
        // ✅ FIX: Handle different response structures
        let items = [];
        let products = [];
        let count = 0;
        
        // Check different possible response structures
        if (response.data) {
          // Structure 1: { success: true, data: { items: [...], products: [...], count: 0 } }
          if (response.data.items && Array.isArray(response.data.items)) {
            items = response.data.items;
            products = response.data.products || [];
            count = response.data.count || items.length;
          } 
          // Structure 2: { success: true, data: { wishlist: { items: [...] } } }
          else if (response.data.wishlist && response.data.wishlist.items) {
            items = response.data.wishlist.items;
            products = response.data.wishlist.products || [];
            count = response.data.wishlist.count || items.length;
          }
          // Structure 3: { success: true, data: { items: [...], wishlistId: ... } }
          else if (response.data.wishlistId) {
            // This might be a different structure
            items = response.data.items || [];
            products = response.data.products || [];
            count = response.data.count || items.length;
          }
        }
        
        // If still no items, try direct access
        if (items.length === 0 && response.items) {
          items = response.items;
          products = response.products || [];
          count = response.count || items.length;
        }
        
        console.log('✅ Processed wishlist items:', items);
        console.log('✅ Processed products:', products);
        
        setWishlist({ items, products, count });
        
        // Create set of product IDs for quick lookup
        const ids = new Set();
        items.forEach(item => {
          // Handle different item structures
          let productId = null;
          if (item.productId) {
            productId = item.productId._id || item.productId.id || item.productId;
          } else if (item._id) {
            productId = item._id;
          } else if (item.id) {
            productId = item.id;
          }
          if (productId) {
            ids.add(productId.toString());
          }
        });
        console.log('✅ Wishlist IDs:', ids);
        setWishlistIds(ids);
      } else {
        console.warn('⚠️ Failed to fetch wishlist:', response.message);
      }
    } catch (error) {
      console.error('❌ Failed to fetch wishlist:', error);
    } finally {
      setLoading(false);
    }
  };

  // Toggle product in wishlist
  const toggleWishlist = async (productId) => {
    console.log('🔄 Toggling wishlist for product:', productId);
    
    if (!isAuthenticated) {
      console.warn('⚠️ User not authenticated');
      return { success: false, message: 'Please login to manage wishlist' };
    }

    try {
      const response = await api.toggleWishlist(productId);
      console.log('📦 Toggle response:', response);
      
      if (response.success) {
        const isInWishlist = response.data.isInWishlist;
        const productIdStr = productId.toString();
        
        console.log(`✅ Product ${productIdStr} is now ${isInWishlist ? 'in' : 'removed from'} wishlist`);
        
        // Update wishlist IDs
        setWishlistIds(prev => {
          const newSet = new Set(prev);
          if (isInWishlist) {
            newSet.add(productIdStr);
          } else {
            newSet.delete(productIdStr);
          }
          console.log('🆕 Updated wishlist IDs:', newSet);
          return newSet;
        });

        // Update wishlist items
        setWishlist(prev => {
          if (isInWishlist) {
            // Get product from response or create basic entry
            let newItem = null;
            if (response.data.wishlist) {
              // Try to find the item in the response
              const foundItem = response.data.wishlist.items?.find(
                item => {
                  const id = item.productId?._id || item.productId?.id || item.productId;
                  return id?.toString() === productIdStr;
                }
              );
              if (foundItem) {
                newItem = foundItem;
              }
            }
            
            // If we couldn't find the item, create a basic one
            if (!newItem) {
              newItem = { 
                productId: productId,
                addedAt: new Date().toISOString()
              };
            }
            
            return {
              ...prev,
              items: [...prev.items, newItem],
              count: prev.count + 1,
            };
          } else {
            // Remove from wishlist
            const updatedItems = prev.items.filter(item => {
              const id = item.productId?._id || item.productId?.id || item.productId;
              return id?.toString() !== productIdStr;
            });
            return {
              ...prev,
              items: updatedItems,
              count: Math.max(0, prev.count - 1),
            };
          }
        });

        return { success: true, isInWishlist };
      }
      
      return { success: false, message: response.message };
    } catch (error) {
      console.error('❌ Error toggling wishlist:', error);
      return { success: false, message: error.message };
    }
  };

  // Check if product is in wishlist
  const isInWishlist = (productId) => {
    if (!productId) return false;
    return wishlistIds.has(productId.toString());
  };

  // Get wishlist count
  const getWishlistCount = () => {
    return wishlist.count;
  };

  const value = {
    wishlist,
    wishlistIds,
    loading,
    fetchWishlist,
    toggleWishlist,
    isInWishlist,
    getWishlistCount,
  };

  return (
    <WishlistContext.Provider value={value}>
      {children}
    </WishlistContext.Provider>
  );
}

export const useWishlist = () => {
  const context = useContext(WishlistContext);
  if (!context) {
    throw new Error('useWishlist must be used within a WishlistProvider');
  }
  return context;
};
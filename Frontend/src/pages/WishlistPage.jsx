// src/pages/WishlistPage.jsx - PINK THEME ✅
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useWishlist } from '../contexts/WishlistContext';
import { useCart } from '../contexts/CartContext';
import { useAuth } from '../contexts/AuthContext';
import { Heart, ShoppingBag, X, Loader, Trash2, Sparkles } from 'lucide-react';
import { ProductCard } from '../components/ProductCard';

export function WishlistPage() {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const { wishlist, loading, toggleWishlist, fetchWishlist } = useWishlist();
  const { addItem } = useCart();
  
  const [addingToCart, setAddingToCart] = useState({});
  const [isAddingAll, setIsAddingAll] = useState(false);

  // Redirect if not authenticated
  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login?redirect=/wishlist');
    }
  }, [isAuthenticated, navigate]);

  // Debug: Log wishlist data
  useEffect(() => {
    console.log('📦 WishlistPage - wishlist state:', wishlist);
    console.log('📦 WishlistPage - products:', wishlist.products);
  }, [wishlist]);

  // Handle add to cart from wishlist
  const handleAddToCart = async (product, quantity = 1) => {
    const productId = product._id || product.id;
    setAddingToCart(prev => ({ ...prev, [productId]: true }));
    
    try {
      const result = await addItem(productId, quantity);
      if (result.success) {
        alert(`${product.name} added to cart!`);
      }
    } catch (error) {
      console.error('Error adding to cart:', error);
      alert('Failed to add to cart');
    } finally {
      setAddingToCart(prev => ({ ...prev, [productId]: false }));
    }
  };

  // Handle remove from wishlist
  const handleRemove = async (productId) => {
    console.log('🗑️ Removing product from wishlist:', productId);
    const result = await toggleWishlist(productId);
    if (result.success) {
      await fetchWishlist();
    }
  };

  // Handle add all to cart
  const handleAddAllToCart = async () => {
    if (wishlist.products.length === 0) return;
    
    setIsAddingAll(true);
    let successCount = 0;
    
    for (const product of wishlist.products) {
      try {
        const result = await addItem(product._id || product.id, 1);
        if (result.success) successCount++;
      } catch (error) {
        console.error('Error adding to cart:', error);
      }
    }
    
    setIsAddingAll(false);
    alert(`${successCount} items added to cart!`);
  };

  // Get products from wishlist items
  const getProducts = () => {
    if (wishlist.products && wishlist.products.length > 0) {
      return wishlist.products;
    }
    
    if (wishlist.items && wishlist.items.length > 0) {
      return wishlist.items
        .map(item => item.productId)
        .filter(product => product !== null && product !== undefined);
    }
    
    return [];
  };

  const products = getProducts();
  const count = products.length;

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center pt-20 bg-gradient-to-b from-pink-50/30 to-white">
        <div className="text-center">
          <div className="relative">
            <div className="animate-spin rounded-full h-16 w-16 border-4 border-pink-200 border-t-pink-600 mx-auto mb-4"></div>
            <Heart className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-6 h-6 text-pink-400 animate-pulse" />
          </div>
          <p className="text-gray-600 font-medium">Loading your wishlist...</p>
          <p className="text-sm text-gray-400 mt-1">🌸 Please wait a moment</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-pink-50/30 via-white to-pink-50/20 pt-20">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
          <div>
            <div className="flex items-center gap-3 mb-1">
              <div className="relative">
                <Heart className="w-10 h-10 text-pink-500 fill-pink-100" />
                <Sparkles className="absolute -top-1 -right-1 w-4 h-4 text-pink-400 animate-pulse" />
              </div>
              <h1 className="text-3xl md:text-4xl font-serif text-gray-900">
                My <span className="text-pink-gradient">Wishlist</span>
              </h1>
            </div>
            <p className="text-gray-500 mt-1 ml-14">
              {count} {count === 1 ? 'item' : 'items'} saved
              {count > 0 && (
                <span className="ml-2 text-sm text-pink-400">✨</span>
              )}
            </p>
          </div>
          
          {count > 0 && (
            <div className="flex gap-3 flex-wrap">
              <button
                onClick={handleAddAllToCart}
                disabled={isAddingAll}
                className="px-6 py-2.5 bg-gradient-to-r from-pink-500 to-rose-500 text-white rounded-xl font-semibold hover:from-pink-600 hover:to-rose-600 transition-all duration-300 flex items-center gap-2 disabled:opacity-50 shadow-md hover:shadow-pink-lg transform hover:scale-[1.02] active:scale-[0.98]"
              >
                {isAddingAll ? (
                  <Loader className="w-4 h-4 animate-spin" />
                ) : (
                  <ShoppingBag className="w-4 h-4" />
                )}
                Add All to Cart
              </button>
            </div>
          )}
        </div>

        {/* Wishlist Items */}
        {count > 0 ? (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {products.map((product) => {
                const productId = product._id || product.id;
                console.log('🔄 Rendering product:', product.name, 'ID:', productId);
                return (
                  <div key={productId} className="relative group">
                    <ProductCard
                      product={product}
                      onQuickView={() => {}}
                      onToggleWishlist={() => handleRemove(productId)}
                      isWishlisted={true}
                      viewMode="grid"
                      onAddToCart={handleAddToCart}
                      isAddingToCart={addingToCart[productId] || false}
                    />
                    {/* Remove button overlay - Pink styled */}
                    <button
                      onClick={() => handleRemove(productId)}
                      className="absolute top-2 right-2 p-1.5 bg-white/90 backdrop-blur-sm rounded-full shadow-md hover:bg-red-50 transition-all duration-300 z-10 opacity-0 group-hover:opacity-100 hover:scale-110 border border-pink-100"
                      aria-label="Remove from wishlist"
                    >
                      <X className="w-4 h-4 text-gray-600 hover:text-red-500 transition-colors" />
                    </button>
                    {/* Wishlist badge */}
                    <div className="absolute top-2 left-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                      <span className="bg-gradient-to-r from-pink-500 to-rose-500 text-white text-[10px] px-2 py-0.5 rounded-full flex items-center gap-1 shadow-md">
                        <Heart className="w-2.5 h-2.5 fill-white" />
                        Saved
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Bottom decorative divider */}
            <div className="flex items-center justify-center gap-4 mt-12">
              <span className="w-20 h-0.5 bg-gradient-to-r from-transparent to-pink-300"></span>
              <Heart className="w-4 h-4 text-pink-300 animate-pulse" />
              <span className="w-20 h-0.5 bg-gradient-to-l from-transparent to-pink-300"></span>
            </div>
          </>
        ) : (
          <div className="text-center py-20 bg-white/80 backdrop-blur-sm rounded-2xl shadow-pink-lg border border-pink-100/50">
            <div className="relative inline-block">
              <div className="text-7xl mb-4 animate-float">❤️</div>
              <Sparkles className="absolute -top-2 -right-2 w-6 h-6 text-pink-400 animate-pulse" />
            </div>
            <h3 className="text-2xl font-serif text-gray-900 mb-3">Your wishlist is <span className="text-pink-gradient">empty</span></h3>
            <p className="text-gray-500 mb-6 max-w-md mx-auto">
              Start saving your favorite jewelry pieces! Click the heart icon on any product to add it here.
            </p>
            <button
              onClick={() => navigate('/products')}
              className="bg-gradient-to-r from-pink-500 to-rose-500 text-white px-8 py-3 rounded-xl font-semibold hover:from-pink-600 hover:to-rose-600 transition-all duration-300 shadow-md hover:shadow-pink-lg transform hover:scale-[1.02] active:scale-[0.98]"
            >
              Browse Products
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default WishlistPage;
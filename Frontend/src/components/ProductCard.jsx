// src/components/ProductCard.jsx - FIXED VERSION ✅

import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Star, Eye, Heart, Gem, ShoppingBag, Loader } from 'lucide-react';
import { useWishlist } from '../contexts/WishlistContext';
import { useAuth } from '../contexts/AuthContext';

export function ProductCard({ 
  product, 
  onQuickView,
  viewMode = 'grid',
  onAddToCart,
  isAddingToCart = false
}) {
  const [isHovered, setIsHovered] = useState(false);
  const [imageError, setImageError] = useState(false);
  const [localWishlistState, setLocalWishlistState] = useState(false);
  const navigate = useNavigate();
  
  // ✅ Get wishlist context
  const { isInWishlist: contextIsInWishlist, toggleWishlist: contextToggleWishlist, fetchWishlist } = useWishlist();
  const { isAuthenticated } = useAuth();

  // ✅ Get product ID properly
  const productId = product._id || product.id;
  const productIdStr = productId?.toString();

  // ✅ Determine if product is in wishlist - USE CONTEXT
  const isWishlisted = contextIsInWishlist(productIdStr);
  
  // ✅ Sync local state with context
  useEffect(() => {
    setLocalWishlistState(isWishlisted);
  }, [isWishlisted]);

  const handleCardClick = (e) => {
    if (e.target.closest('button')) return;
    navigate(`/product/${productIdStr}`);
  };

  // Calculate discount
  const discount = product.discount || 
    (product.originalPrice ? Math.round((1 - product.price / product.originalPrice) * 100) : 0);

  const getBadgeColor = (badgeType) => {
    switch (badgeType) {
      case 'bestseller': return 'bg-gradient-to-r from-pink-500 to-rose-500';
      case 'new': return 'bg-green-600';
      case 'sale': return 'bg-red-600';
      case 'limited': return 'bg-purple-600';
      case 'exclusive': return 'bg-gradient-to-r from-pink-500 to-rose-500 shadow-md';
      default: return 'bg-gray-600';
    }
  };

  const getImageUrl = () => {
    if (imageError) return 'https://placehold.co/400x400/pink/white?text=Jewel';
    if (product.images && product.images.length > 0) {
      return product.images[0];
    }
    return 'https://placehold.co/400x400/pink/white?text=Jewel';
  };

  const formatPrice = (price) => {
    return price?.toLocaleString('en-IN') || '0';
  };

  const handleAddToCartClick = (e) => {
    e.stopPropagation();
    if (onAddToCart && product.inStock) {
      onAddToCart(product, 1);
    }
  };

  // ✅ Handle wishlist toggle - USE CONTEXT
  const handleWishlistToggle = async (e) => {
    e.stopPropagation();
    
    console.log('❤️ Wishlist button clicked for product:', productIdStr, product?.name);
    
    if (!isAuthenticated) {
      console.warn('⚠️ User not authenticated, redirecting to login');
      navigate('/login');
      return;
    }

    // Optimistic update
    setLocalWishlistState(!localWishlistState);
    
    console.log('🔄 Calling context toggleWishlist for:', productIdStr);
    const result = await contextToggleWishlist(productIdStr);
    
    console.log('📦 Toggle result:', result);
    
    if (!result.success) {
      // Revert on error
      setLocalWishlistState(!localWishlistState);
      alert(result.message || 'Failed to update wishlist');
    } else {
      // Refresh wishlist to ensure consistency
      await fetchWishlist();
      console.log('✅ Wishlist refreshed');
    }
  };

  const isThisProductAdding = isAddingToCart;
  const inStock = product.inStock === true && (product.stockCount || 0) > 0;

  return (
    <div 
      className={`group relative bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-pink-lg transition-all duration-500 cursor-pointer ${
        viewMode === 'list' ? 'flex' : ''
      }`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={handleCardClick}
    >
      {/* Image Container */}
      <div className={`relative overflow-hidden bg-gray-100 ${viewMode === 'list' ? 'w-48 flex-shrink-0' : 'h-72'}`}>
        <img 
          src={getImageUrl()} 
          alt={product.name || 'Product'}
          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
          onError={() => setImageError(true)}
          loading="lazy"
        />
        
        {/* Badge */}
        {product.badge && (
          <span className={`absolute top-3 left-3 text-white text-xs px-2 py-1 rounded-full z-10 ${getBadgeColor(product.badgeType)}`}>
            {product.badge}
          </span>
        )}

        {/* Discount Badge */}
        {discount > 0 && (
          <span className="absolute top-3 right-3 bg-gradient-to-r from-pink-500 to-rose-500 text-white text-xs px-2 py-1 rounded-full z-10 shadow-md">
            -{discount}%
          </span>
        )}

        {/* Overlay Actions */}
        <div className={`absolute inset-0 bg-black/50 flex items-center justify-center gap-3 transition-all duration-300 ${
          isHovered ? 'opacity-100' : 'opacity-0'
        }`}>
          {onQuickView && (
            <button 
              onClick={(e) => {
                e.stopPropagation();
                onQuickView(product);
              }}
              className="bg-white p-3 rounded-full hover:bg-gradient-to-r hover:from-pink-500 hover:to-rose-500 hover:text-white transition-all transform hover:scale-110 shadow-md hover:shadow-pink-lg"
              aria-label="Quick view"
            >
              <Eye className="w-5 h-5" />
            </button>
          )}
          
          {/* ✅ Wishlist Button */}
          <button 
            onClick={handleWishlistToggle}
            className="bg-white p-3 rounded-full hover:bg-gradient-to-r hover:from-pink-500 hover:to-rose-500 hover:text-white transition-all transform hover:scale-110 shadow-md hover:shadow-pink-lg"
            aria-label="Toggle wishlist"
          >
            <Heart className={`w-5 h-5 transition-colors ${localWishlistState ? 'fill-red-500 text-red-500' : ''}`} />
          </button>
        </div>

        {/* Out of Stock Overlay */}
        {!inStock && (
          <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
            <span className="bg-white text-gray-900 px-4 py-2 rounded-full font-semibold">
              Out of Stock
            </span>
          </div>
        )}
      </div>

      {/* Product Info */}
      <div className={`p-4 ${viewMode === 'list' ? 'flex-1' : ''}`}>
        <h3 className="font-semibold text-gray-900 mb-1 line-clamp-1 group-hover:text-pink-600 transition-colors">
          {product.name || 'Unnamed Product'}
        </h3>
        
        {/* Rating */}
        <div className="flex items-center gap-1 mb-2">
          <Star className="w-4 h-4 fill-pink-500 text-pink-500" />
          <span className="text-sm font-semibold">{product.rating || 0}</span>
          <span className="text-gray-400 text-sm">({product.reviews || 0})</span>
        </div>

        {/* Price */}
        <div className="flex items-center gap-2 mb-3">
          <span className="text-pink-600 font-bold text-lg">
            ₹{formatPrice(product.price)}
          </span>
          {product.originalPrice && (
            <span className="text-gray-400 line-through text-sm">
              ₹{formatPrice(product.originalPrice)}
            </span>
          )}
        </div>

        {/* Metal Info */}
        {product.metal && (
          <div className="flex items-center gap-2 text-xs text-gray-500 mb-3">
            <Gem className="w-3 h-3" />
            <span>{product.metal}</span>
            {product.weight && (
              <>
                <span className="w-1 h-1 bg-gray-300 rounded-full"></span>
                <span>{product.weight}</span>
              </>
            )}
          </div>
        )}

        {/* Add to Cart Button */}
        <button 
          onClick={handleAddToCartClick}
          disabled={!inStock || isThisProductAdding}
          className={`w-full py-2 rounded-full font-semibold transition-all flex items-center justify-center gap-2 ${
            !inStock 
              ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
              : isThisProductAdding
              ? 'bg-gray-400 text-white cursor-not-allowed'
              : 'bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600 text-white shadow-md hover:shadow-pink-lg transform hover:scale-[1.02] active:scale-[0.98]'
          }`}
        >
          {isThisProductAdding ? (
            <>
              <Loader className="w-4 h-4 animate-spin" />
              Adding...
            </>
          ) : (
            <>
              <ShoppingBag className="w-4 h-4" />
              {inStock ? 'Add to Cart' : 'Out of Stock'}
            </>
          )}
        </button>

        {/* Quick Add button for list view */}
        {viewMode === 'list' && inStock && !isThisProductAdding && (
          <button
            onClick={handleAddToCartClick}
            className="mt-2 text-xs text-amber-600 hover:text-amber-700 font-medium transition-colors"
          >
            Quick Add
          </button>
        )}
      </div>
    </div>
  );
}

export default ProductCard;
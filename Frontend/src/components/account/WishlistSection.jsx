// src/components/account/WishlistSection.jsx - PINK THEME ✅
import { useState, useEffect } from 'react';
import { Heart, Trash2, ShoppingBag, Sparkles } from 'lucide-react';
import { getWishlistDetails, toggleWishlist } from '../../services/api';

export function WishlistSection() {
  const [wishlist, setWishlist] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchWishlist();
  }, []);

  const fetchWishlist = async () => {
    try {
      setLoading(true);
      const response = await getWishlistDetails();
      setWishlist(response.data || []);
    } catch (error) {
      console.error('Error fetching wishlist:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRemove = async (productId) => {
    try {
      await toggleWishlist(productId);
      await fetchWishlist();
    } catch (error) {
      console.error('Error removing from wishlist:', error);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center py-8">
        <div className="relative">
          <div className="animate-spin rounded-full h-10 w-10 border-4 border-pink-200 border-t-pink-600"></div>
          <Heart className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-4 h-4 text-pink-400" />
        </div>
      </div>
    );
  }

  if (wishlist.length === 0) {
    return (
      <div className="text-center py-12 bg-gradient-to-br from-pink-50/30 to-rose-50/30 rounded-xl border border-pink-100">
        <div className="relative inline-block">
          <Heart size={64} className="mx-auto text-pink-300 mb-4" />
          <Sparkles className="absolute -top-2 -right-2 w-5 h-5 text-pink-400 animate-pulse" />
        </div>
        <h3 className="text-xl font-serif text-gray-700">Your Wishlist is <span className="text-pink-gradient">Empty</span></h3>
        <p className="text-gray-500 mt-2">Save your favorite products to your wishlist.</p>
        <button 
          className="mt-4 bg-gradient-to-r from-pink-500 to-rose-500 text-white px-6 py-2.5 rounded-xl hover:from-pink-600 hover:to-rose-600 transition-all duration-300 shadow-md hover:shadow-pink-lg"
        >
          Browse Products
        </button>
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center gap-2 mb-6">
        <Heart className="w-5 h-5 text-pink-500" />
        <h2 className="text-xl font-serif text-gray-900">My <span className="text-pink-gradient">Wishlist</span></h2>
        <span className="ml-auto bg-pink-100 text-pink-700 text-xs px-2.5 py-1 rounded-full font-medium">
          {wishlist.length} items
        </span>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {wishlist.map((item) => (
          <div key={item._id} className="border border-pink-100 rounded-xl overflow-hidden hover:shadow-pink-md hover:border-pink-200 transition-all duration-300 bg-white group">
            <div className="relative">
              <img 
                src={item.images?.[0] || '/placeholder-product.jpg'} 
                alt={item.name}
                className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-500"
              />
              <button
                onClick={() => handleRemove(item._id)}
                className="absolute top-2 right-2 bg-white/90 backdrop-blur-sm p-1.5 rounded-full shadow-md hover:bg-rose-50 transition-all duration-300 hover:scale-110 border border-pink-100"
              >
                <Trash2 size={16} className="text-rose-500" />
              </button>
              <div className="absolute bottom-2 left-2 bg-gradient-to-r from-pink-500 to-rose-500 text-white text-[10px] px-2 py-0.5 rounded-full">
                <Heart size={10} className="inline mr-1 fill-white" /> Saved
              </div>
            </div>
            <div className="p-4">
              <h4 className="font-medium text-gray-900 truncate group-hover:text-pink-600 transition-colors">{item.name}</h4>
              <p className="text-pink-600 font-bold mt-1">₹{item.price?.toFixed(2)}</p>
              <button className="w-full mt-3 bg-gradient-to-r from-pink-500 to-rose-500 text-white py-2 rounded-xl hover:from-pink-600 hover:to-rose-600 transition-all duration-300 flex items-center justify-center gap-2 shadow-md hover:shadow-pink-lg transform hover:scale-[1.02] active:scale-[0.98]">
                <ShoppingBag size={16} /> Add to Cart
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
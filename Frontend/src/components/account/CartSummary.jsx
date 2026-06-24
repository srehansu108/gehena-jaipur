// src/components/account/CartSummary.jsx - PINK THEME ✅
import { useState, useEffect } from 'react';
import { ShoppingCart, Trash2, Plus, Minus, ArrowRight, Sparkles } from 'lucide-react';
import { getCartDetails, updateCartItem, removeFromCart } from '../../services/api';

export function CartSummary() {
  const [cart, setCart] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchCart();
  }, []);

  const fetchCart = async () => {
    try {
      setLoading(true);
      const response = await getCartDetails();
      setCart(response.data);
    } catch (error) {
      setError('Failed to load cart');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateQuantity = async (itemId, newQuantity) => {
    if (newQuantity < 1) return;
    try {
      await updateCartItem(itemId, newQuantity);
      await fetchCart();
    } catch (error) {
      console.error('Error updating cart:', error);
    }
  };

  const handleRemoveItem = async (itemId) => {
    try {
      await removeFromCart(itemId);
      await fetchCart();
    } catch (error) {
      console.error('Error removing item:', error);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center py-8">
        <div className="relative">
          <div className="animate-spin rounded-full h-10 w-10 border-4 border-pink-200 border-t-pink-600"></div>
          <ShoppingCart className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-4 h-4 text-pink-400" />
        </div>
      </div>
    );
  }

  if (!cart || cart.items?.length === 0) {
    return (
      <div className="text-center py-12 bg-gradient-to-br from-pink-50/30 to-rose-50/30 rounded-xl border border-pink-100">
        <div className="relative inline-block">
          <ShoppingCart size={64} className="mx-auto text-pink-300 mb-4" />
          <Sparkles className="absolute -top-2 -right-2 w-5 h-5 text-pink-400 animate-pulse" />
        </div>
        <h3 className="text-xl font-serif text-gray-700">Your Cart is <span className="text-pink-gradient">Empty</span></h3>
        <p className="text-gray-500 mt-2">Browse our collection and add items to your cart.</p>
        <button 
          className="mt-4 bg-gradient-to-r from-pink-500 to-rose-500 text-white px-6 py-2.5 rounded-xl hover:from-pink-600 hover:to-rose-600 transition-all duration-300 shadow-md hover:shadow-pink-lg"
        >
          Start Shopping
        </button>
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center gap-2 mb-6">
        <ShoppingCart className="w-5 h-5 text-pink-500" />
        <h2 className="text-xl font-serif text-gray-900">Shopping <span className="text-pink-gradient">Cart</span></h2>
      </div>
      
      <div className="space-y-4">
        {cart.items.map((item) => (
          <div key={item._id} className="flex items-center gap-4 border border-pink-100 rounded-xl p-4 hover:shadow-pink-md hover:border-pink-200 transition-all duration-300 bg-white">
            <img 
              src={item.product?.images?.[0] || '/placeholder-product.jpg'} 
              alt={item.product?.name}
              className="w-20 h-20 object-cover rounded-xl border border-pink-100"
            />
            <div className="flex-1">
              <h4 className="font-medium text-gray-900">{item.product?.name}</h4>
              <p className="text-sm text-pink-600">₹{item.product?.price?.toFixed(2)} each</p>
              <div className="flex items-center gap-3 mt-2">
                <button 
                  onClick={() => handleUpdateQuantity(item._id, item.quantity - 1)}
                  className="p-1 rounded-full border border-pink-200 hover:border-pink-500 hover:bg-pink-50 transition-all duration-300 disabled:opacity-50"
                  disabled={item.quantity <= 1}
                >
                  <Minus size={16} className="text-pink-600" />
                </button>
                <span className="font-medium w-8 text-center text-gray-800">{item.quantity}</span>
                <button 
                  onClick={() => handleUpdateQuantity(item._id, item.quantity + 1)}
                  className="p-1 rounded-full border border-pink-200 hover:border-pink-500 hover:bg-pink-50 transition-all duration-300"
                >
                  <Plus size={16} className="text-pink-600" />
                </button>
              </div>
            </div>
            <div className="text-right">
              <p className="font-bold text-gray-900">₹{(item.product?.price * item.quantity).toFixed(2)}</p>
              <button 
                onClick={() => handleRemoveItem(item._id)}
                className="text-rose-500 hover:text-rose-700 text-sm flex items-center gap-1 mt-1 hover:scale-105 transition-transform"
              >
                <Trash2 size={14} /> Remove
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Cart Summary */}
      <div className="mt-6 border-t border-pink-100 pt-6">
        <div className="flex justify-between text-lg font-bold">
          <span className="text-gray-700">Total</span>
          <span className="text-pink-gradient">₹{cart.total?.toFixed(2) || '0.00'}</span>
        </div>
        <button className="w-full mt-4 bg-gradient-to-r from-pink-500 to-rose-500 text-white py-3 rounded-xl hover:from-pink-600 hover:to-rose-600 transition-all duration-300 flex items-center justify-center gap-2 shadow-md hover:shadow-pink-lg">
          Proceed to Checkout <ArrowRight size={20} />
        </button>
      </div>
    </div>
  );
}
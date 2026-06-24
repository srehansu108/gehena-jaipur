// src/pages/CartPage.jsx - PINK THEME ✅
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  ShoppingCart, Trash2, Plus, Minus, 
  ArrowLeft, CreditCard, Gift, X,
  AlertCircle, CheckCircle, Sparkles, Heart
} from 'lucide-react';
import { useCart } from '../contexts/CartContext';
import { useAuth } from '../contexts/AuthContext';

export function CartPage() {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const { 
    cart, 
    loading, 
    updateItem, 
    removeItem, 
    clearCart,
    applyCoupon,
    removeCoupon,
    itemCount,
  } = useCart();

  const [couponCode, setCouponCode] = useState('');
  const [couponError, setCouponError] = useState('');
  const [couponSuccess, setCouponSuccess] = useState('');
  const [applyingCoupon, setApplyingCoupon] = useState(false);
  const [updatingItems, setUpdatingItems] = useState({});

  // Redirect if not authenticated
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-pink-50/30 to-white flex items-center justify-center p-4">
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-pink-lg border border-pink-100/50 p-8 max-w-md w-full text-center">
          <div className="relative inline-block">
            <ShoppingCart className="w-16 h-16 text-pink-300 mx-auto mb-4" />
            <Sparkles className="absolute -top-2 -right-2 w-5 h-5 text-pink-400 animate-pulse" />
          </div>
          <h2 className="text-2xl font-serif text-gray-800 mb-2">Cart is <span className="text-pink-gradient">Empty</span></h2>
          <p className="text-gray-600 mb-6">Please login to view your cart</p>
          <Link
            to="/login"
            className="inline-block bg-gradient-to-r from-pink-500 to-rose-500 text-white px-6 py-3 rounded-xl hover:from-pink-600 hover:to-rose-600 transition-all duration-300 shadow-md hover:shadow-pink-lg transform hover:scale-[1.02] active:scale-[0.98]"
          >
            Login to Continue
          </Link>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-pink-50/30 to-white flex items-center justify-center">
        <div className="text-center">
          <div className="relative">
            <div className="animate-spin rounded-full h-16 w-16 border-4 border-pink-200 border-t-pink-600 mx-auto"></div>
            <ShoppingCart className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-6 h-6 text-pink-400 animate-pulse" />
          </div>
          <p className="mt-4 text-gray-600 font-medium">Loading your cart...</p>
          <p className="text-sm text-gray-400 mt-1">🌸 Please wait a moment</p>
        </div>
      </div>
    );
  }

  if (!cart || cart.items.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-pink-50/30 to-white flex items-center justify-center p-4">
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-pink-lg border border-pink-100/50 p-8 max-w-md w-full text-center">
          <div className="relative inline-block">
            <ShoppingCart className="w-16 h-16 text-pink-300 mx-auto mb-4" />
            <Heart className="absolute -top-2 -right-2 w-5 h-5 text-pink-400 animate-pulse" />
          </div>
          <h2 className="text-2xl font-serif text-gray-800 mb-2">Your Cart is <span className="text-pink-gradient">Empty</span></h2>
          <p className="text-gray-600 mb-6">Start adding some beautiful jewelry to your cart! ✨</p>
          <Link
            to="/"
            className="inline-block bg-gradient-to-r from-pink-500 to-rose-500 text-white px-6 py-3 rounded-xl hover:from-pink-600 hover:to-rose-600 transition-all duration-300 shadow-md hover:shadow-pink-lg transform hover:scale-[1.02] active:scale-[0.98]"
          >
            Continue Shopping
          </Link>
        </div>
      </div>
    );
  }

  const handleUpdateQuantity = async (productId, currentQuantity, change) => {
    const newQuantity = currentQuantity + change;
    if (newQuantity < 1) return;

    setUpdatingItems(prev => ({ ...prev, [productId]: true }));
    const result = await updateItem(productId, newQuantity);
    setUpdatingItems(prev => ({ ...prev, [productId]: false }));

    if (!result.success) {
      console.error('Failed to update quantity:', result.message);
    }
  };

  const handleRemoveItem = async (productId) => {
    if (window.confirm('Remove this item from your cart?')) {
      await removeItem(productId);
    }
  };

  const handleClearCart = async () => {
    if (window.confirm('Are you sure you want to clear your entire cart?')) {
      await clearCart();
    }
  };

  const handleApplyCoupon = async () => {
    if (!couponCode.trim()) {
      setCouponError('Please enter a coupon code');
      return;
    }

    setApplyingCoupon(true);
    setCouponError('');
    setCouponSuccess('');

    const result = await applyCoupon(couponCode);
    
    if (result.success) {
      setCouponSuccess(result.message);
      setCouponCode('');
    } else {
      setCouponError(result.message || 'Invalid coupon code');
    }
    
    setApplyingCoupon(false);
  };

  const handleRemoveCoupon = async () => {
    await removeCoupon();
    setCouponSuccess('');
  };

  const handleCheckout = () => {
    navigate('/checkout');
  };

  // Calculate totals
  const subtotal = cart.subtotal || 0;
  const tax = cart.tax || 0;
  const discount = cart.couponDiscount || 0;
  const total = cart.total || 0;

  return (
    <div className="min-h-screen bg-gradient-to-b from-pink-50/30 via-white to-pink-50/20 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8 flex-wrap gap-4">
          <div>
            <Link 
              to="/"
              className="inline-flex items-center text-gray-600 hover:text-pink-600 transition-colors group"
            >
              <ArrowLeft className="w-4 h-4 mr-2 group-hover:-translate-x-1 transition-transform" />
              Continue Shopping
            </Link>
            <div className="flex items-center gap-3 mt-2">
              <div className="relative">
                <ShoppingCart className="w-8 h-8 text-pink-500" />
                <Sparkles className="absolute -top-1 -right-1 w-4 h-4 text-pink-400 animate-pulse" />
              </div>
              <h1 className="text-3xl font-serif text-gray-800">
                Shopping <span className="text-pink-gradient">Cart</span>
              </h1>
            </div>
            <p className="text-gray-500 text-sm ml-11">
              {itemCount} {itemCount === 1 ? 'item' : 'items'} in your cart
              {itemCount > 0 && <span className="ml-2 text-pink-400">✨</span>}
            </p>
          </div>
          <button
            onClick={handleClearCart}
            className="text-rose-600 hover:text-rose-700 text-sm font-medium transition-all duration-300 flex items-center gap-1 hover:scale-105"
          >
            <Trash2 className="w-4 h-4" />
            Clear Cart
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Cart Items */}
          <div className="lg:col-span-2 space-y-4">
            {cart.items.map((item) => {
              const product = item.productId;
              const isUpdating = updatingItems[product._id];
              
              return (
                <div 
                  key={product._id}
                  className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-pink-md border border-pink-100/50 p-6 hover:shadow-pink-lg hover:border-pink-200 transition-all duration-300"
                >
                  <div className="flex flex-col sm:flex-row gap-4">
                    {/* Product Image */}
                    <Link to={`/product/${product._id}`} className="flex-shrink-0">
                      <div className="w-24 h-24 bg-gradient-to-br from-pink-50 to-rose-50 rounded-xl overflow-hidden border border-pink-100">
                        {product.images && product.images[0] ? (
                          <img
                            src={product.images[0]}
                            alt={product.name}
                            className="w-full h-full object-cover transition-transform duration-300 hover:scale-110"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-pink-300">
                            <ShoppingCart className="w-8 h-8" />
                          </div>
                        )}
                      </div>
                    </Link>

                    {/* Product Info */}
                    <div className="flex-1 min-w-0">
                      <Link to={`/product/${product._id}`}>
                        <h3 className="text-lg font-semibold text-gray-800 hover:text-pink-600 transition-colors truncate">
                          {product.name}
                        </h3>
                      </Link>
                      
                      <div className="flex flex-wrap items-center gap-2 mt-1 text-sm text-gray-500">
                        <span>SKU: {product.sku || 'N/A'}</span>
                        {product.metal && (
                          <>
                            <span className="text-gray-300">|</span>
                            <span>{product.metal}</span>
                          </>
                        )}
                        {product.weight && (
                          <>
                            <span className="text-gray-300">|</span>
                            <span>{product.weight} g</span>
                          </>
                        )}
                      </div>

                      <div className="flex flex-wrap items-center justify-between mt-3">
                        {/* Price */}
                        <div>
                          <span className="text-xl font-bold text-pink-600">
                            ₹{item.price.toLocaleString()}
                          </span>
                          {item.quantity > 1 && (
                            <span className="text-sm text-gray-500 ml-2">
                              ₹{item.totalPrice.toLocaleString()} total
                            </span>
                          )}
                        </div>

                        {/* Quantity Controls */}
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleUpdateQuantity(product._id, item.quantity, -1)}
                            disabled={isUpdating || item.quantity <= 1}
                            className="p-1 rounded-full border border-pink-200 hover:border-pink-500 hover:bg-pink-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 hover:scale-110"
                          >
                            <Minus className="w-4 h-4 text-pink-600" />
                          </button>
                          
                          <span className="w-10 text-center font-medium text-gray-800">
                            {isUpdating ? (
                              <span className="inline-block animate-pulse text-pink-400">...</span>
                            ) : (
                              item.quantity
                            )}
                          </span>
                          
                          <button
                            onClick={() => handleUpdateQuantity(product._id, item.quantity, 1)}
                            disabled={isUpdating}
                            className="p-1 rounded-full border border-pink-200 hover:border-pink-500 hover:bg-pink-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 hover:scale-110"
                          >
                            <Plus className="w-4 h-4 text-pink-600" />
                          </button>

                          <button
                            onClick={() => handleRemoveItem(product._id)}
                            className="ml-2 p-2 text-gray-400 hover:text-rose-500 transition-colors hover:scale-110 transform duration-300"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-pink-md border border-pink-100/50 p-6 sticky top-4 hover:shadow-pink-lg transition-all duration-300">
              <div className="flex items-center gap-2 mb-4">
                <CreditCard className="w-5 h-5 text-pink-500" />
                <h2 className="text-xl font-serif text-gray-800">
                  Order <span className="text-pink-gradient">Summary</span>
                </h2>
              </div>

              {/* Coupon Code */}
              <div className="mb-4">
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={couponCode}
                    onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                    placeholder="Enter coupon code"
                    className="flex-1 px-3 py-2 border border-pink-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent transition-all bg-white/50"
                    disabled={!!cart.couponCode}
                  />
                  <button
                    onClick={handleApplyCoupon}
                    disabled={applyingCoupon || !!cart.couponCode}
                    className="px-4 py-2 bg-gradient-to-r from-pink-500 to-rose-500 text-white rounded-xl hover:from-pink-600 hover:to-rose-600 transition-all duration-300 disabled:opacity-50 shadow-md hover:shadow-pink-lg"
                  >
                    {applyingCoupon ? (
                      <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                    ) : (
                      'Apply'
                    )}
                  </button>
                </div>

                {couponError && (
                  <p className="mt-1 text-sm text-rose-600 flex items-center gap-1">
                    <AlertCircle className="w-4 h-4" />
                    {couponError}
                  </p>
                )}

                {couponSuccess && (
                  <p className="mt-1 text-sm text-green-600 flex items-center gap-1">
                    <CheckCircle className="w-4 h-4" />
                    {couponSuccess}
                  </p>
                )}

                {cart.couponCode && (
                  <div className="mt-2 flex items-center justify-between bg-gradient-to-br from-green-50 to-emerald-50 border border-green-200 rounded-xl px-3 py-2">
                    <div className="flex items-center gap-2">
                      <Gift className="w-4 h-4 text-green-600" />
                      <span className="text-sm font-medium text-green-700">
                        {cart.couponCode}
                      </span>
                      <span className="text-xs text-green-600 font-medium">
                        -₹{cart.couponDiscount.toLocaleString()}
                      </span>
                    </div>
                    <button
                      onClick={handleRemoveCoupon}
                      className="text-gray-400 hover:text-rose-500 transition-colors hover:scale-110 transform duration-300"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                )}
              </div>

              {/* Totals */}
              <div className="space-y-2 border-t border-pink-100 pt-4">
                <div className="flex justify-between text-gray-600">
                  <span>Subtotal</span>
                  <span className="font-medium">₹{subtotal.toLocaleString()}</span>
                </div>
                
                <div className="flex justify-between text-gray-600">
                  <span>Tax (10%)</span>
                  <span className="font-medium">₹{tax.toLocaleString()}</span>
                </div>
                
                {discount > 0 && (
                  <div className="flex justify-between text-green-600">
                    <span>Discount</span>
                    <span className="font-medium">-₹{discount.toLocaleString()}</span>
                  </div>
                )}
                
                <div className="border-t border-pink-200 pt-2 mt-2">
                  <div className="flex justify-between text-xl font-bold text-gray-800">
                    <span>Total</span>
                    <span className="text-pink-gradient">₹{total.toLocaleString()}</span>
                  </div>
                </div>
              </div>

              {/* Checkout Button */}
              <button
                onClick={handleCheckout}
                className="w-full mt-6 bg-gradient-to-r from-pink-500 to-rose-500 text-white py-3.5 rounded-xl font-semibold hover:from-pink-600 hover:to-rose-600 transition-all duration-300 shadow-md hover:shadow-pink-lg flex items-center justify-center gap-2 transform hover:scale-[1.02] active:scale-[0.98]"
              >
                <CreditCard className="w-5 h-5" />
                Proceed to Checkout
              </button>

              <p className="text-xs text-gray-500 text-center mt-3 flex items-center justify-center gap-1">
                <span className="w-4 h-0.5 bg-pink-200"></span>
                Secure checkout • Free shipping on orders over ₹5000
                <span className="w-4 h-0.5 bg-pink-200"></span>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
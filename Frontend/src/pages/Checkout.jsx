// src/pages/Checkout.jsx - COMPLETE FIXED WITH CORRECT ENUMS ✅

import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { 
  ShoppingBag, 
  Truck, 
  CreditCard, 
  Wallet, 
  Building2,
  Check,
  Loader,
  MapPin,
  ChevronRight,
  Shield,
  Clock,
  Gift,
  Sparkles
} from 'lucide-react';
import { useCart } from '../contexts/CartContext';
import { useAuth } from '../contexts/AuthContext';
import checkoutService from '../services/checkoutService';
import OrderSuccessModal from '../components/OrderSuccessModal';
import CardPayment from '../components/payment/CardPayment';
import { toast } from 'react-hot-toast';

const paymentMethods = [
  { id: 'card', name: 'Credit/Debit Card', icon: CreditCard, description: 'Visa, Mastercard, Rupay' },
  { id: 'upi', name: 'UPI', icon: Wallet, description: 'Google Pay, PhonePe, Paytm' },
  { id: 'netbanking', name: 'Net Banking', icon: Building2, description: 'All major banks' },
  { id: 'cod', name: 'Cash on Delivery', icon: CreditCard, description: 'Pay when you receive' }
];

const shippingMethods = [
  { id: 'standard', name: 'Standard Delivery', days: '3-5 business days', price: 0 },
  { id: 'express', name: 'Express Delivery', days: '1-2 business days', price: 99 },
  { id: 'nextday', name: 'Next Day Delivery', days: 'Next business day', price: 199 }
];

export default function Checkout() {
  const location = useLocation();
  const navigate = useNavigate();
  const { token, user, isAuthenticated } = useAuth();
  const { items, getCartTotal, clearCart } = useCart();
  
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState(1);
  const [selectedPayment, setSelectedPayment] = useState('card');
  const [selectedShipping, setSelectedShipping] = useState('standard');
  const [orderComplete, setOrderComplete] = useState(false);
  const [createdOrder, setCreatedOrder] = useState(null);
  const [directItem, setDirectItem] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [orderError, setOrderError] = useState(null);
  
  const [showPayment, setShowPayment] = useState(false);
  const [orderToPay, setOrderToPay] = useState(null);
  const [paymentProcessing, setPaymentProcessing] = useState(false);
  
  const [formData, setFormData] = useState({
    fullName: user?.firstName + ' ' + user?.lastName || '',
    email: user?.email || '',
    phone: user?.mobileNumber || '',
    addressLine1: '',
    addressLine2: '',
    city: '',
    state: '',
    postalCode: '',
    country: 'India',
    customerNote: ''
  });

  useEffect(() => {
    console.log('📍 Checkout page mounted');
  }, []);

  useEffect(() => {
    const directPurchase = location.state?.directPurchase;
    if (directPurchase) {
      setDirectItem(directPurchase);
    }
    setIsLoading(false);
  }, [location]);

  useEffect(() => {
    if (isLoading) return;
    if (orderComplete) return;
    
    const hasItems = items.length > 0 || directItem !== null;
    if (!hasItems && !orderComplete) {
      navigate('/products');
    }
  }, [items, directItem, orderComplete, navigate, isLoading]);

  useEffect(() => {
    if (!isAuthenticated && !isLoading) {
      navigate('/login');
    }
  }, [isAuthenticated, navigate, isLoading]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const calculateTotals = () => {
    if (directItem) {
      const subtotal = directItem.price * directItem.quantity;
      const shippingCost = shippingMethods.find(s => s.id === selectedShipping)?.price || 0;
      const tax = Math.round(subtotal * 0.03);
      const total = subtotal + shippingCost + tax;
      return { subtotal, shippingCost, tax, discount: 0, total };
    }

    const subtotal = getCartTotal();
    const shippingCost = shippingMethods.find(s => s.id === selectedShipping)?.price || 0;
    const tax = Math.round(subtotal * 0.03);
    const total = subtotal + shippingCost + tax;
    return { subtotal, shippingCost, tax, discount: 0, total };
  };

  const getOrderItems = () => {
    if (directItem) {
      return [{
        productId: directItem.productId || 'direct_' + Date.now(),
        quantity: directItem.quantity || 1,
        productName: directItem.name || 'Product',
        price: directItem.price || 0,
        total: (directItem.price || 0) * (directItem.quantity || 1),
        metal: directItem.metal || '',
        category: directItem.category || '',
        image: directItem.image || directItem.imageUrl || '',
      }];
    }
    
    return items.map(item => ({
      productId: item.productId || item._id || 'cart_' + Date.now(),
      quantity: item.quantity || 1,
      productName: item.name || item.productName || 'Product',
      price: item.price || 0,
      total: (item.price || 0) * (item.quantity || 1),
      metal: item.metal || '',
      category: item.category || '',
      image: item.image || item.imageUrl || '',
    }));
  };

  // ✅ FINAL CORRECT MAPPING - Based on your Order.js model
  const getPaymentMethodValue = (method) => {
    const mapping = {
      'card': 'Card',           // ✅ EXACT value from enum: 'Card'
      'upi': 'UPI',             // ✅ EXACT value from enum: 'UPI'
      'netbanking': 'NetBanking', // ✅ EXACT value from enum: 'NetBanking'
      'cod': 'COD'              // ✅ EXACT value from enum: 'COD'
    };
    return mapping[method] || method;
  };

  // ✅ FINAL CORRECT MAPPING - Based on your Order.js model
  const getShippingMethodValue = (method) => {
    const mapping = {
      'standard': 'Standard',    // ✅ EXACT value from enum: 'Standard'
      'express': 'Express',      // ✅ EXACT value from enum: 'Express'
      'nextday': 'Next Day'      // ✅ EXACT value from enum: 'Next Day'
    };
    return mapping[method] || method;
  };

  const handlePlaceOrder = async () => {
    // Validation
    if (!formData.addressLine1 || !formData.city || !formData.state || !formData.postalCode) {
      toast.error('Please fill in all shipping address fields');
      return;
    }

    if (!formData.phone) {
      toast.error('Please provide a phone number');
      return;
    }

    if (!/^[0-9]{10}$/.test(formData.phone)) {
      toast.error('Please enter a valid 10-digit phone number');
      return;
    }

    if (!selectedPayment) {
      toast.error('Please select a payment method');
      return;
    }

    setLoading(true);
    setOrderError(null);

    try {
      const { subtotal, shippingCost, tax, discount, total } = calculateTotals();
      const orderItems = getOrderItems();

      const paymentMethodValue = getPaymentMethodValue(selectedPayment);
      const shippingMethodValue = getShippingMethodValue(selectedShipping);

      const orderData = {
        items: orderItems,
        subtotal: subtotal,
        discount: discount,
        tax: tax,
        shippingCharges: shippingCost,
        total: total,
        shippingAddress: {
          fullName: formData.fullName,
          addressLine1: formData.addressLine1,
          addressLine2: formData.addressLine2 || '',
          city: formData.city,
          state: formData.state,
          postalCode: formData.postalCode,
          country: formData.country,
          phoneNumber: formData.phone,
          email: formData.email
        },
        paymentMethod: paymentMethodValue, // ✅ Now sends 'Card'
        paymentDetails: {
          transactionId: `TXN-${Date.now()}`,
          paymentMethod: selectedPayment
        },
        shippingMethod: shippingMethodValue, // ✅ Now sends 'Standard'
        customerNote: formData.customerNote || '',
        couponCode: ''
      };

      console.log('📦 Order data being sent:', JSON.stringify(orderData, null, 2));

      checkoutService.setToken(token);
      const response = await checkoutService.createOrder(orderData);
      console.log('📦 Order response:', response);

      if (response.success && response.data) {
        console.log('✅ Order created successfully');
        
        if (selectedPayment === 'cod') {
          await completeOrderDirectly(response.data);
          return;
        }

        setOrderToPay(response.data);
        setShowPayment(true);
        setLoading(false);
        
        setTimeout(() => {
          document.getElementById('payment-section')?.scrollIntoView({ 
            behavior: 'smooth',
            block: 'center'
          });
        }, 100);
        
        toast.success('Order created! Please complete payment.');
        
      } else {
        toast.error(response.message || 'Failed to place order. Please try again.');
        setLoading(false);
      }
    } catch (error) {
      console.error('Error placing order:', error);
      
      if (error.response?.data?.error) {
        const errorMsg = error.response.data.error;
        if (errorMsg.includes('paymentMethod')) {
          toast.error(`Payment method error: ${errorMsg}`);
        } else if (errorMsg.includes('shippingMethod')) {
          toast.error(`Shipping method error: ${errorMsg}`);
        } else {
          toast.error(errorMsg);
        }
      } else {
        toast.error(error.message || 'Failed to place order.');
      }
      setLoading(false);
    }
  };

  const completeOrderDirectly = async (orderData) => {
    try {
      console.log('✅ Completing COD order directly...');
      
      let existingOrders = [];
      try {
        const stored = localStorage.getItem('jewellery_mock_orders');
        if (stored) {
          existingOrders = JSON.parse(stored);
        }
      } catch (e) {
        console.error('Error reading localStorage:', e);
      }

      const codOrder = {
        ...orderData,
        paymentStatus: 'COD',
        status: 'Processing',
        paymentCompletedAt: new Date().toISOString(),
      };

      existingOrders.unshift(codOrder);
      
      try {
        localStorage.setItem('jewellery_mock_orders', JSON.stringify(existingOrders));
        console.log('💾 COD order saved to localStorage');
      } catch (e) {
        console.error('Error saving to localStorage:', e);
      }

      checkoutService.mockOrders = existingOrders;

      setCreatedOrder(codOrder);
      setOrderComplete(true);
      if (!directItem) {
        clearCart();
      }
      window.scrollTo({ top: 0, behavior: 'smooth' });
      toast.success('Order placed successfully! 🎉');
      
    } catch (error) {
      console.error('Error completing COD order:', error);
      toast.error('Failed to complete order. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handlePaymentSuccess = (paymentData) => {
    console.log('✅ Payment successful:', paymentData);
    setPaymentProcessing(true);
    
    try {
      let existingOrders = [];
      try {
        const stored = localStorage.getItem('jewellery_mock_orders');
        if (stored) {
          existingOrders = JSON.parse(stored);
        }
      } catch (e) {
        console.error('Error reading localStorage:', e);
      }

      const updatedOrder = {
        ...orderToPay,
        paymentStatus: 'Paid',
        paymentId: paymentData.paymentId,
        paymentSignature: paymentData.signature,
        paymentCompletedAt: new Date().toISOString(),
        status: 'Processing',
      };
      
      const index = existingOrders.findIndex(o => o._id === orderToPay._id);
      if (index !== -1) {
        existingOrders[index] = updatedOrder;
      } else {
        existingOrders.unshift(updatedOrder);
      }
      
      localStorage.setItem('jewellery_mock_orders', JSON.stringify(existingOrders));
      checkoutService.mockOrders = existingOrders;
      
      setCreatedOrder(updatedOrder);
      setOrderComplete(true);
      setShowPayment(false);
      
      if (!directItem) {
        clearCart();
      }
      
      window.scrollTo({ top: 0, behavior: 'smooth' });
      toast.success('Payment successful! Order confirmed. 🎉');
      
    } catch (error) {
      console.error('Error updating order with payment:', error);
      toast.error('Payment succeeded but order update failed.');
    } finally {
      setPaymentProcessing(false);
    }
  };

  const handlePaymentCancel = () => {
    setShowPayment(false);
    setOrderToPay(null);
    toast.info('Payment cancelled. You can try again.');
  };

  const handlePaymentBack = () => {
    setShowPayment(false);
  };

  const { subtotal, shippingCost, tax, discount, total } = calculateTotals();
  const displayItems = directItem ? [directItem] : items;

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Loader className="w-12 h-12 animate-spin text-pink-600 mx-auto" />
          <p className="mt-4 text-gray-600">Loading checkout...</p>
        </div>
      </div>
    );
  }

  if (orderComplete && createdOrder) {
    return (
      <OrderSuccessModal 
        order={createdOrder}
        onClose={() => navigate('/products')}
        onViewOrder={() => navigate(`/orders/${createdOrder._id}`, { 
          state: { order: createdOrder } 
        })}
        onViewAllOrders={() => navigate('/orders')}
      />
    );
  }

  if (displayItems.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center pt-20">
        <div className="text-center max-w-md">
          <div className="text-6xl mb-4">🛒</div>
          <h2 className="text-2xl font-semibold text-gray-900 mb-2">Your cart is empty</h2>
          <p className="text-gray-600 mb-4">Add some beautiful jewellery to your cart and come back here to checkout.</p>
          <button 
            onClick={() => navigate('/products')}
            className="bg-gradient-to-r from-pink-500 to-rose-500 text-white px-6 py-2 rounded-lg hover:from-pink-600 hover:to-rose-600 transition-colors"
          >
            Browse Products
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pt-20">
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        <div className="mb-8">
          <h1 className="text-3xl font-serif text-gray-900 flex items-center gap-3">
            <ShoppingBag className="h-8 w-8 text-pink-600" />
            Checkout
          </h1>
          <p className="text-gray-600 mt-1">Complete your order with secure payment</p>
        </div>

        <div className="flex items-center justify-center mb-8">
          {[1, 2, 3].map((s) => (
            <div key={s} className="flex items-center">
              <div className={`flex items-center gap-2 ${s <= step ? 'text-pink-600' : 'text-gray-400'}`}>
                <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold ${
                  s <= step ? 'bg-pink-600 text-white' : 'bg-gray-200 text-gray-500'
                }`}>
                  {s < step ? <Check className="w-4 h-4" /> : s}
                </div>
                <span className="font-medium hidden sm:inline">
                  {s === 1 ? 'Cart' : s === 2 ? 'Shipping' : 'Payment'}
                </span>
              </div>
              {s < 3 && <ChevronRight className={`w-5 h-5 mx-2 ${s < step ? 'text-pink-600' : 'text-gray-300'}`} />}
            </div>
          ))}
        </div>

        {showPayment && orderToPay && (
          <div id="payment-section" className="mb-8 animate-fadeIn">
            <CardPayment
              order={orderToPay}
              token={token}
              onSuccess={handlePaymentSuccess}
              onCancel={handlePaymentCancel}
              onBack={handlePaymentBack}
            />
          </div>
        )}

        {!showPayment && (
          <div className="grid lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-6">
              {/* Shipping Address */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <MapPin className="w-5 h-5 text-pink-600" />
                  Shipping Address
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                    <input
                      type="text"
                      name="fullName"
                      value={formData.fullName}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent bg-gray-50"
                      disabled
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
                    <input
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                      placeholder="Enter 10-digit mobile number"
                      required
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Address Line 1</label>
                    <input
                      type="text"
                      name="addressLine1"
                      value={formData.addressLine1}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                      placeholder="House number, building, street"
                      required
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Address Line 2 (Optional)</label>
                    <input
                      type="text"
                      name="addressLine2"
                      value={formData.addressLine2}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                      placeholder="Apartment, suite, unit"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">City</label>
                    <input
                      type="text"
                      name="city"
                      value={formData.city}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">State</label>
                    <input
                      type="text"
                      name="state"
                      value={formData.state}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Postal Code</label>
                    <input
                      type="text"
                      name="postalCode"
                      value={formData.postalCode}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Country</label>
                    <input
                      type="text"
                      name="country"
                      value={formData.country}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent bg-gray-50"
                      disabled
                    />
                  </div>
                </div>
              </div>

              {/* Shipping Method */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <Truck className="w-5 h-5 text-pink-600" />
                  Shipping Method
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  {shippingMethods.map(method => (
                    <button
                      key={method.id}
                      onClick={() => setSelectedShipping(method.id)}
                      className={`p-4 border-2 rounded-lg text-left transition-all ${
                        selectedShipping === method.id
                          ? 'border-pink-500 bg-pink-50'
                          : 'border-gray-200 hover:border-pink-300'
                      }`}
                    >
                      <div className="font-medium text-gray-900">{method.name}</div>
                      <div className="text-sm text-gray-500">{method.days}</div>
                      <div className="font-semibold text-pink-600 mt-1">
                        {method.price === 0 ? 'FREE' : `₹${method.price}`}
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Payment Method */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <CreditCard className="w-5 h-5 text-pink-600" />
                  Payment Method
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {paymentMethods.map(method => (
                    <button
                      key={method.id}
                      onClick={() => setSelectedPayment(method.id)}
                      className={`p-4 border-2 rounded-lg text-left transition-all ${
                        selectedPayment === method.id
                          ? 'border-pink-500 bg-pink-50'
                          : 'border-gray-200 hover:border-pink-300'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <method.icon className="w-5 h-5 text-pink-600" />
                        <span className="font-medium text-gray-900">{method.name}</span>
                      </div>
                      <div className="text-sm text-gray-500 mt-1">{method.description}</div>
                    </button>
                  ))}
                </div>

                {selectedPayment === 'card' && (
                  <div className="mt-4 p-3 bg-blue-50 rounded-lg text-sm text-blue-700 flex items-start gap-2">
                    <Shield className="w-4 h-4 mt-0.5 flex-shrink-0" />
                    <span>You'll be redirected to secure payment gateway after placing order.</span>
                  </div>
                )}
                {selectedPayment === 'cod' && (
                  <div className="mt-4 p-3 bg-green-50 rounded-lg text-sm text-green-700 flex items-start gap-2">
                    <Check className="w-4 h-4 mt-0.5 flex-shrink-0" />
                    <span>Pay with cash when your order is delivered. No advance payment required.</span>
                  </div>
                )}
              </div>

              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">Additional Notes</h2>
                <textarea
                  name="customerNote"
                  value={formData.customerNote}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent resize-none"
                  rows="3"
                  placeholder="Special instructions, delivery preferences, or gift message..."
                />
              </div>
            </div>

            {/* Order Summary */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 sticky top-24">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">Order Summary</h2>
                
                <div className="space-y-3 max-h-60 overflow-y-auto mb-4">
                  {displayItems.map((item, index) => (
                    <div key={item.productId || index} className="flex gap-3">
                      <img 
                        src={item.image || 'https://placehold.co/60x60/pink/white?text=Jewel'} 
                        alt={item.name || 'Product'}
                        className="w-12 h-12 rounded-lg object-cover"
                        onError={(e) => {
                          e.target.src = 'https://placehold.co/60x60/pink/white?text=Jewel';
                        }}
                      />
                      <div className="flex-1">
                        <p className="text-sm font-medium text-gray-900">{item.name || 'Product'}</p>
                        <p className="text-xs text-gray-500">Qty: {item.quantity || 1}</p>
                        <p className="text-sm font-semibold text-pink-600">₹{(item.price || 0) * (item.quantity || 1)}</p>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="border-t pt-4 space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Subtotal</span>
                    <span>₹{subtotal.toLocaleString('en-IN')}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Shipping</span>
                    <span>{shippingCost === 0 ? 'FREE' : `₹${shippingCost}`}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">GST (3%)</span>
                    <span>₹{tax.toLocaleString('en-IN')}</span>
                  </div>
                  <div className="border-t pt-2 mt-2">
                    <div className="flex justify-between font-bold text-lg">
                      <span>Total</span>
                      <span className="text-pink-600">₹{total.toLocaleString('en-IN')}</span>
                    </div>
                  </div>
                </div>

                <div className="mt-4 p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center justify-around text-xs text-gray-600">
                    <div className="flex items-center gap-1">
                      <Shield className="w-4 h-4 text-green-600" />
                      Secure
                    </div>
                    <div className="flex items-center gap-1">
                      <Clock className="w-4 h-4 text-blue-600" />
                      Fast Delivery
                    </div>
                    <div className="flex items-center gap-1">
                      <Gift className="w-4 h-4 text-pink-600" />
                      Gift Ready
                    </div>
                  </div>
                </div>

                <button
                  onClick={handlePlaceOrder}
                  disabled={loading || displayItems.length === 0 || paymentProcessing}
                  className={`w-full mt-4 py-3 rounded-lg font-semibold text-white transition-all flex items-center justify-center gap-2 ${
                    loading || paymentProcessing
                      ? 'bg-gray-400 cursor-not-allowed' 
                      : 'bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600 shadow-lg hover:shadow-pink-lg'
                  }`}
                >
                  {loading || paymentProcessing ? (
                    <>
                      <Loader className="w-5 h-5 animate-spin" />
                      {paymentProcessing ? 'Processing Payment...' : 'Placing Order...'}
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-5 h-5" />
                      {selectedPayment === 'cod' ? 'Place Order (COD)' : `Pay ₹${total.toLocaleString('en-IN')}`}
                    </>
                  )}
                </button>

                <p className="text-xs text-gray-500 text-center mt-2">
                  By placing this order, you agree to our terms and conditions
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
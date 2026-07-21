// src/pages/Checkout.jsx - COMPLETE WITH QR CODE SUPPORT & VERIFICATION FORM ✅

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
  Sparkles,
  Info,
  QrCode,
  Smartphone,
  Zap,
  AlertCircle
} from 'lucide-react';
import { useCart } from '../contexts/CartContext';
import { useAuth } from '../contexts/AuthContext';
import checkoutService from '../services/checkoutService';
import paymentService from '../services/paymentService';
import OrderSuccessModal from '../components/OrderSuccessModal';
import { toast } from 'react-hot-toast';

// ========== CONFIGURATION ==========
const TAX_RATE = 0.03; // 3% GST
const BUSINESS_STATE = 'Rajasthan';

// ========== TAX COMPUTATION HELPER ==========
const computeTax = (subtotal, state, country) => {
  if (country?.toLowerCase() !== 'india') {
    return { 
      tax: 0, 
      taxBreakdown: { 
        type: 'none', 
        label: 'No tax applicable',
        details: 'International orders are tax-free' 
      } 
    };
  }

  const totalTax = Math.round(subtotal * TAX_RATE);
  const stateLower = state?.toLowerCase().trim();

  if (stateLower === 'rajasthan') {
    const cgst = Math.round(totalTax / 2);
    const sgst = totalTax - cgst;
    return {
      tax: totalTax,
      taxBreakdown: {
        type: 'cgst_sgst',
        cgst,
        sgst,
        total: totalTax,
        rate: TAX_RATE,
        label: `CGST (${(TAX_RATE/2*100).toFixed(1)}%) + SGST (${(TAX_RATE/2*100).toFixed(1)}%)`,
        description: 'Intra-state transaction'
      }
    };
  } else {
    return {
      tax: totalTax,
      taxBreakdown: {
        type: 'igst',
        igst: totalTax,
        total: totalTax,
        rate: TAX_RATE,
        label: `IGST (${(TAX_RATE*100).toFixed(1)}%)`,
        description: 'Inter-state transaction'
      }
    };
  }
};

// ========== PAYMENT METHODS CONFIGURATION ==========
const paymentMethods = [
  { 
    id: 'phonepe', 
    name: 'PhonePe', 
    icon: Smartphone, 
    description: 'UPI, Cards & NetBanking',
    poweredBy: 'PhonePe Payment Solutions',
    accepted: 'All UPI apps, Debit and Credit Cards, and NetBanking accepted',
    color: 'from-purple-500 to-indigo-600'
  },
  { 
    id: 'razorpay', 
    name: 'Razorpay', 
    icon: CreditCard, 
    description: 'Cards, UPI & NetBanking',
    poweredBy: 'Razorpay Payment Gateway',
    accepted: 'Credit Card, Debit Card, UPI & NetBanking',
    color: 'from-blue-500 to-indigo-600'
  },
  { 
    id: 'paypal', 
    name: 'PayPal', 
    icon: Zap, 
    description: 'PayPal & Credit Cards',
    poweredBy: 'PayPal Payment Gateway',
    accepted: 'PayPal balance, Credit Cards, Debit Cards',
    color: 'from-blue-600 to-sky-600'
  },
  { 
    id: 'qr', 
    name: 'UPI QR Code', 
    icon: QrCode, 
    description: 'Scan & Pay',
    poweredBy: 'UPI QR Code',
    accepted: 'Google Pay, PhonePe, Paytm & all UPI apps',
    color: 'from-green-500 to-emerald-600'
  },
  { 
    id: 'cod', 
    name: 'Cash on Delivery', 
    icon: Wallet, 
    description: 'Pay on delivery',
    poweredBy: 'COD Payment',
    accepted: 'Pay when you receive your order',
    color: 'from-orange-500 to-amber-600'
  }
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
  const [selectedPayment, setSelectedPayment] = useState('phonepe');
  const [selectedShipping, setSelectedShipping] = useState('standard');
  const [orderComplete, setOrderComplete] = useState(false);
  const [createdOrder, setCreatedOrder] = useState(null);
  const [directItem, setDirectItem] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [orderError, setOrderError] = useState(null);
  
  const [showQRCode, setShowQRCode] = useState(false);
  const [paymentProcessing, setPaymentProcessing] = useState(false);
  const [paymentMode, setPaymentMode] = useState(null);
  
  // QR Code States
  const [qrCodeImage, setQrCodeImage] = useState(null);
  const [upiId, setUpiId] = useState('jewellery@phonepe');
  const [qrProcessing, setQrProcessing] = useState(false);
  const [qrOrderId, setQrOrderId] = useState(null);
  
  // QR Verification Form States
  const [showVerificationForm, setShowVerificationForm] = useState(false);
  const [verificationData, setVerificationData] = useState({
    transactionId: '',
    upiReferenceNumber: '',
    paymentDate: '',
    paymentTime: '',
    amount: '',
    bankName: ''
  });
  const [screenshotFile, setScreenshotFile] = useState(null);
  const [screenshotPreview, setScreenshotPreview] = useState(null);
  const [isSubmittingVerification, setIsSubmittingVerification] = useState(false);
  
  const [touchedFields, setTouchedFields] = useState({});
  
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

  // Validation function
  const validateField = (name, value) => {
    switch (name) {
      case 'fullName':
        return value.trim().length >= 2 ? '' : 'Full name is required';
      case 'email':
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value) ? '' : 'Please enter a valid email';
      case 'phone':
        return /^[0-9]{10}$/.test(value) ? '' : 'Please enter a valid 10-digit phone number';
      case 'addressLine1':
        return value.trim().length >= 5 ? '' : 'Address is required';
      case 'city':
        return value.trim().length >= 2 ? '' : 'City is required';
      case 'state':
        return value.trim().length >= 2 ? '' : 'State is required';
      case 'postalCode':
        return /^[0-9]{6}$/.test(value) ? '' : 'Please enter a valid 6-digit postal code';
      default:
        return '';
    }
  };

  const getFieldError = (name) => {
    const value = formData[name];
    if (!touchedFields[name]) return '';
    return validateField(name, value);
  };

  const isFormValid = () => {
    const requiredFields = ['fullName', 'email', 'phone', 'addressLine1', 'city', 'state', 'postalCode'];
    for (const field of requiredFields) {
      const error = validateField(field, formData[field]);
      if (error) return false;
    }
    return true;
  };

  // Validation for verification form
  const validateVerificationForm = () => {
    const { transactionId, upiReferenceNumber, paymentDate, paymentTime, amount } = verificationData;
    if (!transactionId.trim()) return 'Transaction ID is required';
    if (!upiReferenceNumber.trim()) return 'UPI Reference Number is required';
    if (!paymentDate) return 'Payment date is required';
    if (!paymentTime) return 'Payment time is required';
    if (!amount || parseFloat(amount) <= 0) return 'Valid amount is required';
    if (!screenshotFile) return 'Payment screenshot is required';
    return null;
  };

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
    setTouchedFields(prev => ({ ...prev, [name]: true }));
  };

  const handleBlur = (e) => {
    const { name } = e.target;
    setTouchedFields(prev => ({ ...prev, [name]: true }));
  };

  // Handle verification form input changes
  const handleVerificationInputChange = (e) => {
    const { name, value } = e.target;
    setVerificationData(prev => ({ ...prev, [name]: value }));
  };

  // Handle screenshot upload
  const handleScreenshotUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Validate file type
      const validTypes = ['image/jpeg', 'image/png', 'image/jpg', 'image/webp'];
      if (!validTypes.includes(file.type)) {
        toast.error('Please upload a valid image (JPEG, PNG, or WEBP)');
        return;
      }
      
      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        toast.error('File size should be less than 5MB');
        return;
      }
      
      setScreenshotFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setScreenshotPreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  // src/pages/Checkout.jsx - Update the verification submission

// Update handleVerificationSubmit function
const handleVerificationSubmit = async () => {
  const error = validateVerificationForm();
  if (error) {
    toast.error(error);
    return;
  }

  setIsSubmittingVerification(true);
  toast.loading('Submitting payment details for verification...', { duration: 3000 });

  try {
    // Create form data for API request
    const formData = new FormData();
    formData.append('transactionId', verificationData.transactionId);
    formData.append('upiReferenceNumber', verificationData.upiReferenceNumber);
    formData.append('paymentDate', verificationData.paymentDate);
    formData.append('paymentTime', verificationData.paymentTime);
    formData.append('amount', verificationData.amount);
    formData.append('bankName', verificationData.bankName);
    formData.append('orderId', qrOrderId || createdOrder?._id);
    if (screenshotFile) {
      formData.append('screenshot', screenshotFile);
    }

    // Call the verification API - this will submit for admin review
    const response = await paymentService.verifyQRPayment(formData);
    
    toast.dismiss();

    if (response.success) {
      toast.success('Payment details submitted! Waiting for admin verification. 📋');
      
      // Close QR modal and show pending state
      setShowQRCode(false);
      setShowVerificationForm(false);
      
      // Update order status to show pending verification
      const orderResponse = await checkoutService.getOrderById(qrOrderId || createdOrder?._id);
      if (orderResponse.success) {
        // Show a pending verification message instead of completing order
        setCreatedOrder({
          ...orderResponse.data,
          paymentStatus: 'Pending Verification'
        });
        setOrderComplete(true);
      }
    } else {
      toast.error(response.message || 'Submission failed. Please try again.');
    }
  } catch (error) {
    console.error('❌ Verification error:', error);
    toast.dismiss();
    toast.error(error.message || 'Failed to submit payment details');
  } finally {
    setIsSubmittingVerification(false);
  }
};

  // ========== CALCULATE TOTALS WITH TAX LOGIC ==========
  const calculateTotals = () => {
    let subtotal;
    if (directItem) {
      subtotal = directItem.price * directItem.quantity;
    } else {
      subtotal = getCartTotal();
    }
    
    const shippingCost = shippingMethods.find(s => s.id === selectedShipping)?.price || 0;
    const { tax, taxBreakdown } = computeTax(subtotal, formData.state, formData.country);
    const total = subtotal + shippingCost + tax;
    
    return { subtotal, shippingCost, tax, taxBreakdown, discount: 0, total };
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
      sku: item.sku || '',
    }));
  };

  // ========== PAYMENT METHOD MAPPINGS ==========
  const getPaymentMethodValue = (method) => {
    const mapping = {
      'phonepe': 'PhonePe',
      'razorpay': 'Razorpay',
      'paypal': 'PayPal',
      'qr': 'QR',
      'cod': 'COD'
    };
    return mapping[method] || method;
  };

  const getShippingMethodValue = (method) => {
    const mapping = {
      'standard': 'Standard',
      'express': 'Express',
      'nextday': 'Next Day'
    };
    return mapping[method] || method;
  };

  // ========== QR CODE PAYMENT HANDLERS ==========
  
  // Initialize QR Payment
  const initializeQRPayment = async (order) => {
    try {
      toast.loading('Generating QR Code...', { duration: 2000 });
      
      const qrResponse = await paymentService.initQRPayment(order._id);
      console.log('📦 QR Response:', qrResponse);
      
      toast.dismiss();
      
      if (qrResponse.success) {
        setQrCodeImage(qrResponse.data.qrCodeUrl);
        setUpiId(qrResponse.data.upiId || 'jewellery@phonepe');
        setQrOrderId(order._id);
        setShowQRCode(true);
        setPaymentMode('qr');
        setLoading(false);
        toast.success('Scan QR code to complete payment');
      } else {
        toast.error(qrResponse.message || 'Failed to generate QR code');
        setLoading(false);
      }
    } catch (error) {
      console.error('❌ QR Payment error:', error);
      toast.dismiss();
      toast.error('Failed to initiate QR payment');
      setLoading(false);
    }
  };

  // Handle QR payment flow
  const handlePlaceOrderWithQR = async () => {
    // Validate all fields
    const requiredFields = ['fullName', 'email', 'phone', 'addressLine1', 'city', 'state', 'postalCode'];
    let hasError = false;
    
    const allTouched = {};
    requiredFields.forEach(field => {
      allTouched[field] = true;
    });
    setTouchedFields(allTouched);
    
    for (const field of requiredFields) {
      const error = validateField(field, formData[field]);
      if (error) {
        hasError = true;
        toast.error(error);
        const element = document.querySelector(`[name="${field}"]`);
        if (element) {
          element.focus();
          element.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
        break;
      }
    }
    
    if (hasError) return;

    setLoading(true);
    setOrderError(null);

    try {
      checkoutService.setToken(token);
      paymentService.setToken(token);
      
      const { subtotal, shippingCost, tax, taxBreakdown, discount, total } = calculateTotals();
      const orderItems = getOrderItems();

      const orderData = {
        items: orderItems,
        subtotal: subtotal,
        discount: discount,
        tax: tax,
        taxBreakdown: taxBreakdown,
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
        paymentMethod: 'QR',
        paymentDetails: {
          transactionId: `QR-${Date.now()}`,
          paymentMethod: 'qr'
        },
        shippingMethod: getShippingMethodValue(selectedShipping),
        customerNote: formData.customerNote || '',
        couponCode: ''
      };

      console.log('📦 Order data being sent:', JSON.stringify(orderData, null, 2));

      const response = await checkoutService.createOrder(orderData);
      console.log('📦 Order response:', response);

      if (response.success && response.data) {
        console.log('✅ Order created successfully');
        setCreatedOrder(response.data);
        await initializeQRPayment(response.data);
      } else {
        toast.error(response.message || 'Failed to place order. Please try again.');
        setLoading(false);
      }
    } catch (error) {
      console.error('❌ Error placing order:', error);
      toast.error(error.message || 'Failed to place order.');
      setLoading(false);
    }
  };

  // Handle QR payment complete - now shows verification form
  const handleQRPaymentComplete = async () => {
    // Show verification form instead of auto-verification
    setShowVerificationForm(true);
  };

  // ========== ✅ PHONEPE PAYMENT HANDLER ==========
  const handlePhonePePayment = async (orderData) => {
    console.log('📱 Initiating PhonePe payment...', orderData);
    console.log('📦 Order ID:', orderData._id);
    
    paymentService.setToken(token);
    
    try {
      setLoading(true);
      toast.loading('Initializing PhonePe...', { duration: 3000 });
      
      console.log('📤 Calling initPhonePe with orderId:', orderData._id);
      
      const initResponse = await paymentService.initPhonePe(orderData._id);
      console.log('📦 Init Response:', initResponse);
      
      toast.dismiss();
      
      if (!initResponse.success) {
        console.error('❌ Init failed:', initResponse.message);
        toast.error(initResponse.message || 'Failed to initialize PhonePe');
        setLoading(false);
        return;
      }

      const { transactionId, paymentUrl, amount, orderNumber, mode } = initResponse.data;
      console.log('✅ PhonePe Transaction ID:', transactionId);
      console.log('✅ Payment URL:', paymentUrl);
      console.log('✅ Amount:', amount);
      console.log('✅ Mode:', mode);

      if (mode === 'production') {
        toast.loading('Redirecting to PhonePe...', { duration: 3000 });
        window.open(paymentUrl, '_blank');
        toast.success('PhonePe payment initiated! Please complete payment on PhonePe page.');
        setLoading(false);
        startPaymentPolling(orderData._id, transactionId);
      } else {
        toast.loading('Testing Mode: Opening mock payment...', { duration: 2000 });
        window.open(paymentUrl, '_blank');
        toast.success('Mock PhonePe payment initiated!');
        setLoading(false);
        startPaymentPolling(orderData._id, transactionId);
      }
      
    } catch (error) {
      console.error('❌ PhonePe error:', error);
      toast.dismiss();
      toast.error(error.message || 'Failed to initialize PhonePe payment');
      setLoading(false);
    }
  };

  // ========== ✅ PAYMENT STATUS POLLING ==========
  const startPaymentPolling = (orderId, transactionId) => {
    console.log('🔄 Starting payment status polling...');
    
    let attempts = 0;
    const maxAttempts = 30;
    const pollInterval = setInterval(async () => {
      attempts++;
      console.log(`🔄 Checking payment status (attempt ${attempts}/${maxAttempts})...`);
      
      try {
        const statusResponse = await paymentService.getPaymentStatus(orderId);
        console.log('📊 Payment status:', statusResponse);
        
        if (statusResponse.success && statusResponse.data.paymentStatus === 'Paid') {
          console.log('✅ Payment confirmed!');
          clearInterval(pollInterval);
          toast.dismiss();
          toast.success('Payment confirmed! 🎉');
          
          const orderResponse = await checkoutService.getOrderById(orderId);
          if (orderResponse.success) {
            handlePaymentSuccess({
              paymentId: statusResponse.data.transactionId || transactionId,
              signature: 'phonepe_signature_' + Date.now(),
              order: orderResponse.data
            });
          }
          return;
        }
        
        if (statusResponse.data.paymentStatus === 'Failed') {
          console.log('❌ Payment failed');
          clearInterval(pollInterval);
          toast.dismiss();
          toast.error('Payment failed. Please try again.');
          setLoading(false);
          return;
        }
        
        if (attempts >= maxAttempts) {
          console.log('⏰ Polling timeout');
          clearInterval(pollInterval);
          toast.dismiss();
          toast.warning('Payment not confirmed. Please check your order status later.');
          setLoading(false);
        }
      } catch (error) {
        console.error('❌ Status check error:', error);
        if (attempts >= maxAttempts) {
          clearInterval(pollInterval);
          setLoading(false);
        }
      }
    }, 5000);
    
    return () => clearInterval(pollInterval);
  };

  // ✅ RAZORPAY IMPLEMENTATION
  const handleRazorpayPayment = async (orderData) => {
    console.log('💳 Initiating REAL Razorpay payment...', orderData);
    console.log('📦 Order ID:', orderData._id);
    
    paymentService.setToken(token);
    
    if (typeof window.Razorpay === 'undefined') {
      console.error('❌ Razorpay SDK not loaded!');
      toast.error('Razorpay SDK not loaded. Please refresh the page.');
      setLoading(false);
      return;
    }
    console.log('✅ Razorpay SDK loaded');

    try {
      setLoading(true);
      
      console.log('📤 Calling initRazorpay with orderId:', orderData._id);
      
      const initResponse = await paymentService.initRazorpay(orderData._id);
      console.log('📦 Init Response:', initResponse);
      
      if (!initResponse.success) {
        console.error('❌ Init failed:', initResponse.message);
        toast.error(initResponse.message || 'Failed to initialize Razorpay');
        setLoading(false);
        return;
      }

      const { razorpayOrderId, amount, currency, keyId, orderNumber } = initResponse.data;
      console.log('✅ Razorpay Order ID:', razorpayOrderId);
      console.log('✅ Amount:', amount, currency);

      const options = {
        key: keyId,
        amount: amount,
        currency: currency || 'INR',
        name: 'Jewellery Store',
        description: `Order ${orderNumber || orderData.orderNumber || ''}`,
        order_id: razorpayOrderId,
        prefill: {
          name: formData.fullName || user?.firstName + ' ' + user?.lastName || 'Customer',
          email: formData.email || user?.email || 'customer@example.com',
          contact: formData.phone || user?.mobileNumber || '9999999999'
        },
        theme: {
          color: '#DB2777'
        },
        handler: async (response) => {
          console.log('✅ Razorpay success response:', response);
          
          try {
            const verifyResponse = await paymentService.verifyRazorpay({
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
              orderId: orderData._id
            });

            console.log('📦 Verify Response:', verifyResponse);

            if (verifyResponse.success) {
              handlePaymentSuccess({
                paymentId: response.razorpay_payment_id,
                signature: response.razorpay_signature,
                order: verifyResponse.data || orderData
              });
              toast.success('Payment successful! 🎉');
            } else {
              toast.error(verifyResponse.message || 'Payment verification failed');
              setLoading(false);
            }
          } catch (error) {
            console.error('❌ Verification error:', error);
            toast.error('Payment verification failed');
            setLoading(false);
          }
        },
        modal: {
          ondismiss: function() {
            console.log('❌ Razorpay modal dismissed');
            toast('Payment cancelled', { duration: 3000 });
            setLoading(false);
          }
        }
      };

      const razorpayInstance = new window.Razorpay(options);
      razorpayInstance.open();

    } catch (error) {
      console.error('❌ Razorpay error:', error);
      toast.error(error.message || 'Failed to initialize Razorpay');
      setLoading(false);
    }
  };

  const handlePayPalPayment = (orderData) => {
    console.log('💳 Initiating PayPal payment...', orderData);
    toast.loading('Redirecting to PayPal...', { duration: 2000 });
    
    setTimeout(() => {
      toast.dismiss();
      toast.success('PayPal payment initiated!');
      handlePaymentSuccess({
        paymentId: `PAYPAL-${Date.now()}`,
        signature: 'paypal_signature_' + Date.now(),
        order: orderData
      });
    }, 2000);
  };

  // ========== COD Order Completion ==========
  const completeOrderDirectly = async (orderData) => {
    try {
      console.log('✅ Completing COD order directly...', orderData);
      
      toast.loading('Confirming COD order...', { duration: 1500 });
      
      checkoutService.setToken(token);
      paymentService.setToken(token);
      
      const codResponse = await paymentService.confirmCOD(orderData._id);
      console.log('📦 COD confirmation response:', codResponse);
      
      if (codResponse && codResponse.success) {
        const codOrder = codResponse.data || orderData;
        
        const finalOrder = {
          ...codOrder,
          _id: codOrder._id || orderData._id,
          orderNumber: codOrder.orderNumber || orderData.orderNumber,
          paymentStatus: 'COD',
          status: 'Processing',
          paymentCompletedAt: new Date().toISOString(),
          items: orderData.items || [],
          total: orderData.total || 0,
          shippingAddress: orderData.shippingAddress || {},
        };
        
        let existingOrders = [];
        try {
          const stored = localStorage.getItem('jewellery_mock_orders');
          if (stored) {
            existingOrders = JSON.parse(stored);
          }
        } catch (e) {
          console.error('Error reading localStorage:', e);
        }
        
        existingOrders.unshift(finalOrder);
        localStorage.setItem('jewellery_mock_orders', JSON.stringify(existingOrders));
        checkoutService.mockOrders = existingOrders;
        
        setCreatedOrder(finalOrder);
        setOrderComplete(true);
        
        if (!directItem) {
          clearCart();
        }
        
        window.scrollTo({ top: 0, behavior: 'smooth' });
        toast.dismiss();
        toast.success('Order placed successfully! 🎉');
        
      } else {
        throw new Error(codResponse?.message || 'COD confirmation failed');
      }
      
    } catch (error) {
      console.error('❌ Error completing COD order:', error);
      toast.dismiss();
      toast.error(error.message || 'Failed to complete COD order. Please try again.');
      setLoading(false);
    }
  };

  // ========== Payment Success Handler ==========
  const handlePaymentSuccess = (paymentData) => {
    console.log('✅ Payment successful:', paymentData);
    setPaymentProcessing(true);
    setShowQRCode(false);
    setShowVerificationForm(false);
    
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

      const orderToProcess = paymentData.order || null;
      let finalOrder;
      
      if (orderToProcess) {
        finalOrder = {
          ...orderToProcess,
          paymentStatus: 'Paid',
          paymentId: paymentData.paymentId,
          paymentSignature: paymentData.signature,
          paymentCompletedAt: new Date().toISOString(),
          status: 'Processing',
        };
        
        const index = existingOrders.findIndex(o => o._id === orderToProcess._id);
        if (index !== -1) {
          existingOrders[index] = finalOrder;
        } else {
          existingOrders.unshift(finalOrder);
        }
        
        localStorage.setItem('jewellery_mock_orders', JSON.stringify(existingOrders));
        checkoutService.mockOrders = existingOrders;
        
      } else {
        finalOrder = {
          _id: `ORD-${Date.now()}`,
          orderNumber: `JOR-${Date.now()}`,
          total: calculateTotals().total,
          items: getOrderItems(),
          shippingAddress: formData,
          paymentStatus: 'Paid',
          status: 'Processing',
          paymentId: paymentData.paymentId,
          createdAt: new Date()
        };
        existingOrders.unshift(finalOrder);
        localStorage.setItem('jewellery_mock_orders', JSON.stringify(existingOrders));
      }
      
      setCreatedOrder(finalOrder);
      setOrderComplete(true);
      setPaymentProcessing(false);
      setShowQRCode(false);
      setLoading(false);
      
      if (!directItem) {
        clearCart();
      }
      
      window.scrollTo({ top: 0, behavior: 'smooth' });
      toast.dismiss();
      toast.success('Payment successful! Order confirmed. 🎉');
      
      console.log('✅ Order state set:', { 
        orderComplete: true, 
        createdOrder: finalOrder 
      });
      
    } catch (error) {
      console.error('Error updating order with payment:', error);
      toast.dismiss();
      toast.error('Payment succeeded but order update failed.');
      setPaymentProcessing(false);
      setShowQRCode(false);
      setLoading(false);
    }
  };

  const handlePaymentCancel = () => {
    setShowQRCode(false);
    setShowVerificationForm(false);
    setPaymentMode(null);
    setQrCodeImage(null);
    setQrProcessing(false);
    setScreenshotFile(null);
    setScreenshotPreview(null);
    setVerificationData({
      transactionId: '',
      upiReferenceNumber: '',
      paymentDate: '',
      paymentTime: '',
      amount: '',
      bankName: ''
    });
    toast('Payment cancelled. You can try again.', { duration: 3000 });
  };

  // ========== MAIN PLACE ORDER HANDLER ==========
  const handlePlaceOrder = async () => {
    // Validate all fields
    const requiredFields = ['fullName', 'email', 'phone', 'addressLine1', 'city', 'state', 'postalCode'];
    let hasError = false;
    
    const allTouched = {};
    requiredFields.forEach(field => {
      allTouched[field] = true;
    });
    setTouchedFields(allTouched);
    
    for (const field of requiredFields) {
      const error = validateField(field, formData[field]);
      if (error) {
        hasError = true;
        toast.error(error);
        const element = document.querySelector(`[name="${field}"]`);
        if (element) {
          element.focus();
          element.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
        break;
      }
    }
    
    if (hasError) return;

    if (!selectedPayment) {
      toast.error('Please select a payment method');
      return;
    }

    if (selectedPayment === 'qr') {
      handlePlaceOrderWithQR();
      return;
    }

    setLoading(true);
    setOrderError(null);

    try {
      checkoutService.setToken(token);
      paymentService.setToken(token);
      
      const { subtotal, shippingCost, tax, taxBreakdown, discount, total } = calculateTotals();
      const orderItems = getOrderItems();

      const paymentMethodValue = getPaymentMethodValue(selectedPayment);
      const shippingMethodValue = getShippingMethodValue(selectedShipping);

      const orderData = {
        items: orderItems,
        subtotal: subtotal,
        discount: discount,
        tax: tax,
        taxBreakdown: taxBreakdown,
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
        paymentMethod: paymentMethodValue,
        paymentDetails: {
          transactionId: `TXN-${Date.now()}`,
          paymentMethod: selectedPayment
        },
        shippingMethod: shippingMethodValue,
        customerNote: formData.customerNote || '',
        couponCode: ''
      };

      console.log('📦 Order data being sent:', JSON.stringify(orderData, null, 2));

      const response = await checkoutService.createOrder(orderData);
      console.log('📦 Order response:', response);

      if (response.success && response.data) {
        console.log('✅ Order created successfully');
        
        if (selectedPayment === 'cod') {
          await completeOrderDirectly(response.data);
          return;
        } else if (selectedPayment === 'phonepe') {
          handlePhonePePayment(response.data);
          return;
        } else if (selectedPayment === 'razorpay') {
          handleRazorpayPayment(response.data);
          return;
        } else if (selectedPayment === 'paypal') {
          handlePayPalPayment(response.data);
          return;
        }

        setLoading(false);
        
      } else {
        toast.error(response.message || 'Failed to place order. Please try again.');
        setLoading(false);
      }
    } catch (error) {
      console.error('❌ Error placing order:', error);
      
      if (error.response?.data?.error) {
        const errorMsg = error.response.data.error;
        toast.error(errorMsg);
      } else {
        toast.error(error.message || 'Failed to place order.');
      }
      setLoading(false);
    }
  };

  const { subtotal, shippingCost, tax, taxBreakdown, discount, total } = calculateTotals();
  const displayItems = directItem ? [directItem] : items;

  // ========== LOADING STATE ==========
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

  // ========== ORDER SUCCESS MODAL ==========
  if (orderComplete && createdOrder) {
    console.log('🎉 Rendering OrderSuccessModal with order:', createdOrder);
    return (
      <div className="fixed inset-0 z-[9999]">
        <OrderSuccessModal 
          order={createdOrder}
          onClose={() => {
            setOrderComplete(false);
            navigate('/products');
          }}
          onViewOrder={() => navigate(`/orders/${createdOrder._id}`, { 
            state: { order: createdOrder } 
          })}
          onViewAllOrders={() => navigate('/orders')}
        />
      </div>
    );
  }

  // ========== EMPTY CART STATE ==========
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

  // ========== MAIN CHECKOUT UI ==========
  return (
    <div className="min-h-screen bg-gray-50 pt-20">
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        <div className="mb-8">
          <h1 className="text-3xl font-serif text-gray-900 flex items-center gap-3">
            <ShoppingBag className="h-8 w-8 text-pink-600" />
            Checkout
          </h1>
          <p className="text-gray-600 mt-1">Complete your order with secure payment</p>
          <p className="text-sm text-red-500 mt-1">* All fields are mandatory</p>
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

        {/* QR Code Modal with Verification Form */}
        {showQRCode && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 overflow-y-auto">
            <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl max-h-[90vh] overflow-y-auto">
              <div className="text-center">
                <div className="flex justify-between items-center mb-4 sticky top-0 bg-white z-10 pb-2">
                  <h3 className="text-xl font-bold text-gray-900">
                    {showVerificationForm ? 'Verify Payment' : 'Scan to Pay'}
                  </h3>
                  <button 
                    onClick={() => {
                      if (showVerificationForm) {
                        setShowVerificationForm(false);
                        setScreenshotFile(null);
                        setScreenshotPreview(null);
                      } else {
                        handlePaymentCancel();
                      }
                    }}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    ✕
                  </button>
                </div>
                
                {!showVerificationForm ? (
                  // QR Code Display
                  <>
                    <div className="bg-gray-50 p-6 rounded-xl mb-4">
                      <div className="w-56 h-56 mx-auto bg-white border-2 border-gray-200 rounded-lg flex items-center justify-center overflow-hidden">
                        {qrCodeImage ? (
                          <img 
                            src={qrCodeImage} 
                            alt="UPI QR Code - Scan to Pay" 
                            className="w-full h-full object-contain p-2"
                            onError={(e) => {
                              console.error('QR Image failed to load');
                              e.target.style.display = 'none';
                            }}
                          />
                        ) : (
                          <div className="text-center">
                            <Loader className="w-12 h-12 animate-spin text-pink-600 mx-auto" />
                            <p className="text-sm text-gray-500 mt-2">Generating QR Code...</p>
                          </div>
                        )}
                      </div>
                      <p className="text-sm text-gray-500 mt-2">Scan with any UPI app</p>
                    </div>

                    {/* Payment Details */}
                    <div className="space-y-2 text-sm text-gray-600">
                      <p>
                        <span className="font-medium">Amount:</span> 
                        ₹{total.toLocaleString('en-IN')}
                      </p>
                      <p>
                        <span className="font-medium">UPI ID:</span> 
                        {upiId || 'jewellery@phonepe'}
                      </p>
                      <div className="flex flex-wrap justify-center gap-2 mt-2">
                        <span className="px-2 py-1 bg-green-100 text-green-700 text-xs rounded-full">Google Pay</span>
                        <span className="px-2 py-1 bg-purple-100 text-purple-700 text-xs rounded-full">PhonePe</span>
                        <span className="px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded-full">Paytm</span>
                        <span className="px-2 py-1 bg-red-100 text-red-700 text-xs rounded-full">BHIM</span>
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="mt-4 space-y-2">
                      <button
                        onClick={handleQRPaymentComplete}
                        disabled={qrProcessing || !qrCodeImage}
                        className="w-full bg-gradient-to-r from-green-500 to-emerald-600 text-white py-3 rounded-lg font-semibold hover:from-green-600 hover:to-emerald-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {qrProcessing ? (
                          <>
                            <Loader className="w-5 h-5 animate-spin inline mr-2" />
                            Verifying Payment...
                          </>
                        ) : (
                          "I've Completed Payment"
                        )}
                      </button>
                      
                      <button
                        onClick={handlePaymentCancel}
                        className="w-full text-gray-500 py-2 rounded-lg hover:bg-gray-100 transition-colors text-sm"
                      >
                        Cancel Payment
                      </button>
                    </div>
                  </>
                ) : (
                  // Verification Form
                  <>
                    <div className="text-left space-y-4">
                      <p className="text-sm text-gray-600 mb-4">
                        Please provide your payment details to verify the transaction.
                      </p>

                      {/* Screenshot Upload */}
                      <div className="mb-4">
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Payment Screenshot <span className="text-red-500">*</span>
                        </label>
                        <div className="flex flex-col items-center justify-center w-full">
                          {screenshotPreview ? (
                            <div className="relative w-full">
                              <img 
                                src={screenshotPreview} 
                                alt="Payment Screenshot" 
                                className="w-full max-h-48 object-contain rounded-lg border border-gray-200"
                              />
                              <button
                                onClick={() => {
                                  setScreenshotFile(null);
                                  setScreenshotPreview(null);
                                }}
                                className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                              >
                                ✕
                              </button>
                            </div>
                          ) : (
                            <label className="w-full h-32 border-2 border-dashed border-gray-300 rounded-lg flex flex-col items-center justify-center cursor-pointer hover:border-green-500 transition-colors">
                              <svg className="w-8 h-8 text-gray-400 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                              </svg>
                              <span className="text-sm text-gray-500">Click to upload screenshot</span>
                              <span className="text-xs text-gray-400">PNG, JPG or WEBP (Max 5MB)</span>
                              <input
                                type="file"
                                accept="image/*"
                                onChange={handleScreenshotUpload}
                                className="hidden"
                              />
                            </label>
                          )}
                        </div>
                      </div>

                      {/* Transaction ID */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Transaction ID <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="text"
                          name="transactionId"
                          value={verificationData.transactionId}
                          onChange={handleVerificationInputChange}
                          placeholder="e.g., TXN123456789"
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                          required
                        />
                      </div>

                      {/* UPI Reference Number */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          UPI Reference Number <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="text"
                          name="upiReferenceNumber"
                          value={verificationData.upiReferenceNumber}
                          onChange={handleVerificationInputChange}
                          placeholder="e.g., 9123456789"
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                          required
                        />
                      </div>

                      {/* Payment Date & Time */}
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Payment Date <span className="text-red-500">*</span>
                          </label>
                          <input
                            type="date"
                            name="paymentDate"
                            value={verificationData.paymentDate}
                            onChange={handleVerificationInputChange}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                            required
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Payment Time <span className="text-red-500">*</span>
                          </label>
                          <input
                            type="time"
                            name="paymentTime"
                            value={verificationData.paymentTime}
                            onChange={handleVerificationInputChange}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                            required
                          />
                        </div>
                      </div>

                      {/* Amount */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Amount Paid <span className="text-red-500">*</span>
                        </label>
                        <div className="relative">
                          <span className="absolute left-3 top-2 text-gray-500">₹</span>
                          <input
                            type="number"
                            name="amount"
                            value={verificationData.amount}
                            onChange={handleVerificationInputChange}
                            placeholder="Enter amount"
                            className="w-full pl-8 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                            required
                            min="1"
                            step="1"
                          />
                        </div>
                      </div>

                      {/* Bank Name (Optional) */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Bank Name (Optional)
                        </label>
                        <input
                          type="text"
                          name="bankName"
                          value={verificationData.bankName}
                          onChange={handleVerificationInputChange}
                          placeholder="e.g., State Bank of India"
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                        />
                      </div>
                    </div>

                    {/* Verification Action Buttons */}
                    <div className="mt-6 space-y-2">
                      <button
                        onClick={handleVerificationSubmit}
                        disabled={isSubmittingVerification}
                        className="w-full bg-gradient-to-r from-blue-500 to-indigo-600 text-white py-3 rounded-lg font-semibold hover:from-blue-600 hover:to-indigo-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {isSubmittingVerification ? (
                          <>
                            <Loader className="w-5 h-5 animate-spin inline mr-2" />
                            Submitting Verification...
                          </>
                        ) : (
                          "Submit for Verification"
                        )}
                      </button>
                      
                      <button
                        onClick={() => {
                          setShowVerificationForm(false);
                          setScreenshotFile(null);
                          setScreenshotPreview(null);
                          setVerificationData({
                            transactionId: '',
                            upiReferenceNumber: '',
                            paymentDate: '',
                            paymentTime: '',
                            amount: '',
                            bankName: ''
                          });
                        }}
                        className="w-full text-gray-500 py-2 rounded-lg hover:bg-gray-100 transition-colors text-sm"
                      >
                        ← Back to QR Code
                      </button>
                    </div>
                  </>
                )}
                
                <p className="text-xs text-gray-400 mt-2">
                  ⚠️ Do not close this window until payment is confirmed
                </p>
              </div>
            </div>
          </div>
        )}

        {!showQRCode && (
          <div className="grid lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-6">
              {/* Shipping Address */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <MapPin className="w-5 h-5 text-pink-600" />
                  Shipping Address <span className="text-red-500 text-sm">*</span>
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Full Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      name="fullName"
                      value={formData.fullName}
                      onChange={handleInputChange}
                      onBlur={handleBlur}
                      className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent transition-all ${
                        getFieldError('fullName') ? 'border-red-500 bg-red-50' : 'border-gray-300'
                      }`}
                      placeholder="Enter your full name"
                      required
                    />
                    {getFieldError('fullName') && (
                      <p className="mt-1 text-xs text-red-500 flex items-center gap-1">
                        <AlertCircle className="w-3 h-3" />
                        {getFieldError('fullName')}
                      </p>
                    )}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Email <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      onBlur={handleBlur}
                      className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent transition-all ${
                        getFieldError('email') ? 'border-red-500 bg-red-50' : 'border-gray-300'
                      } ${user?.email ? 'bg-gray-50' : ''}`}
                      placeholder="Enter your email"
                      disabled={!!user?.email}
                      required
                    />
                    {getFieldError('email') && (
                      <p className="mt-1 text-xs text-red-500 flex items-center gap-1">
                        <AlertCircle className="w-3 h-3" />
                        {getFieldError('email')}
                      </p>
                    )}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Phone Number <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleInputChange}
                      onBlur={handleBlur}
                      className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent transition-all ${
                        getFieldError('phone') ? 'border-red-500 bg-red-50' : 'border-gray-300'
                      }`}
                      placeholder="Enter 10-digit mobile number"
                      maxLength="10"
                      required
                    />
                    {getFieldError('phone') && (
                      <p className="mt-1 text-xs text-red-500 flex items-center gap-1">
                        <AlertCircle className="w-3 h-3" />
                        {getFieldError('phone')}
                      </p>
                    )}
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Address Line 1 <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      name="addressLine1"
                      value={formData.addressLine1}
                      onChange={handleInputChange}
                      onBlur={handleBlur}
                      className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent transition-all ${
                        getFieldError('addressLine1') ? 'border-red-500 bg-red-50' : 'border-gray-300'
                      }`}
                      placeholder="House number, building, street"
                      required
                    />
                    {getFieldError('addressLine1') && (
                      <p className="mt-1 text-xs text-red-500 flex items-center gap-1">
                        <AlertCircle className="w-3 h-3" />
                        {getFieldError('addressLine1')}
                      </p>
                    )}
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
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      City <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      name="city"
                      value={formData.city}
                      onChange={handleInputChange}
                      onBlur={handleBlur}
                      className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent transition-all ${
                        getFieldError('city') ? 'border-red-500 bg-red-50' : 'border-gray-300'
                      }`}
                      placeholder="Enter your city"
                      required
                    />
                    {getFieldError('city') && (
                      <p className="mt-1 text-xs text-red-500 flex items-center gap-1">
                        <AlertCircle className="w-3 h-3" />
                        {getFieldError('city')}
                      </p>
                    )}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      State <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      name="state"
                      value={formData.state}
                      onChange={handleInputChange}
                      onBlur={handleBlur}
                      className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent transition-all ${
                        getFieldError('state') ? 'border-red-500 bg-red-50' : 'border-gray-300'
                      }`}
                      placeholder="Enter your state"
                      required
                    />
                    {getFieldError('state') && (
                      <p className="mt-1 text-xs text-red-500 flex items-center gap-1">
                        <AlertCircle className="w-3 h-3" />
                        {getFieldError('state')}
                      </p>
                    )}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Postal Code <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      name="postalCode"
                      value={formData.postalCode}
                      onChange={handleInputChange}
                      onBlur={handleBlur}
                      className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent transition-all ${
                        getFieldError('postalCode') ? 'border-red-500 bg-red-50' : 'border-gray-300'
                      }`}
                      placeholder="Enter 6-digit PIN code"
                      maxLength="6"
                      required
                    />
                    {getFieldError('postalCode') && (
                      <p className="mt-1 text-xs text-red-500 flex items-center gap-1">
                        <AlertCircle className="w-3 h-3" />
                        {getFieldError('postalCode')}
                      </p>
                    )}
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
                  Shipping Method <span className="text-red-500 text-sm">*</span>
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
                  Payment Method <span className="text-red-500 text-sm">*</span>
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {paymentMethods.map(method => (
                    <button
                      key={method.id}
                      onClick={() => setSelectedPayment(method.id)}
                      className={`p-4 border-2 rounded-lg text-left transition-all ${
                        selectedPayment === method.id
                          ? `border-pink-500 bg-gradient-to-r ${method.color} bg-opacity-5`
                          : 'border-gray-200 hover:border-pink-300'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <method.icon className={`w-5 h-5 ${selectedPayment === method.id ? 'text-pink-600' : 'text-gray-400'}`} />
                        <span className={`font-medium ${selectedPayment === method.id ? 'text-gray-900' : 'text-gray-700'}`}>
                          {method.name}
                        </span>
                        {selectedPayment === method.id && (
                          <Check className="w-4 h-4 text-pink-600 ml-auto" />
                        )}
                      </div>
                      <div className="text-sm text-gray-500 mt-1">{method.description}</div>
                      {method.poweredBy && (
                        <div className="text-xs text-gray-400 mt-1">🔹 {method.poweredBy}</div>
                      )}
                    </button>
                  ))}
                </div>

                {/* Payment Method Details */}
                {selectedPayment === 'phonepe' && (
                  <div className="mt-4 p-4 bg-purple-50 rounded-lg border border-purple-200">
                    <div className="flex items-start gap-3">
                      <Smartphone className="w-5 h-5 text-purple-600 mt-0.5 flex-shrink-0" />
                      <div>
                        <p className="text-sm font-medium text-purple-800">PhonePe Payment Solutions</p>
                        <p className="text-xs text-purple-600 mt-1">All UPI apps, Debit and Credit Cards, and NetBanking accepted</p>
                        <div className="flex flex-wrap gap-2 mt-2">
                          <span className="px-2 py-1 bg-purple-100 text-purple-700 text-xs rounded-full">UPI</span>
                          <span className="px-2 py-1 bg-purple-100 text-purple-700 text-xs rounded-full">Cards</span>
                          <span className="px-2 py-1 bg-purple-100 text-purple-700 text-xs rounded-full">NetBanking</span>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {selectedPayment === 'razorpay' && (
                  <div className="mt-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
                    <div className="flex items-start gap-3">
                      <CreditCard className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
                      <div>
                        <p className="text-sm font-medium text-blue-800">Razorpay Payment Gateway</p>
                        <p className="text-xs text-blue-600 mt-1">Pay by Credit Card, Debit Card, UPI & NetBanking</p>
                        <div className="flex flex-wrap gap-2 mt-2">
                          <span className="px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded-full">Cards</span>
                          <span className="px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded-full">UPI</span>
                          <span className="px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded-full">NetBanking</span>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {selectedPayment === 'paypal' && (
                  <div className="mt-4 p-4 bg-sky-50 rounded-lg border border-sky-200">
                    <div className="flex items-start gap-3">
                      <Zap className="w-5 h-5 text-sky-600 mt-0.5 flex-shrink-0" />
                      <div>
                        <p className="text-sm font-medium text-sky-800">PayPal Payment Gateway</p>
                        <p className="text-xs text-sky-600 mt-1">Pay with your PayPal account or Credit Card</p>
                        <div className="flex flex-wrap gap-2 mt-2">
                          <span className="px-2 py-1 bg-sky-100 text-sky-700 text-xs rounded-full">PayPal Balance</span>
                          <span className="px-2 py-1 bg-sky-100 text-sky-700 text-xs rounded-full">Credit Cards</span>
                          <span className="px-2 py-1 bg-sky-100 text-sky-700 text-xs rounded-full">Debit Cards</span>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {selectedPayment === 'qr' && (
                  <div className="mt-4 p-4 bg-green-50 rounded-lg border border-green-200">
                    <div className="flex items-start gap-3">
                      <QrCode className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                      <div>
                        <p className="text-sm font-medium text-green-800">UPI QR Code Payment</p>
                        <p className="text-xs text-green-600 mt-1">Scan QR code with any UPI app</p>
                        <div className="flex flex-wrap gap-2 mt-2">
                          <span className="px-2 py-1 bg-green-100 text-green-700 text-xs rounded-full">Google Pay</span>
                          <span className="px-2 py-1 bg-green-100 text-green-700 text-xs rounded-full">PhonePe</span>
                          <span className="px-2 py-1 bg-green-100 text-green-700 text-xs rounded-full">Paytm</span>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {selectedPayment === 'cod' && (
                  <div className="mt-4 p-4 bg-orange-50 rounded-lg border border-orange-200">
                    <div className="flex items-start gap-3">
                      <Wallet className="w-5 h-5 text-orange-600 mt-0.5 flex-shrink-0" />
                      <div>
                        <p className="text-sm font-medium text-orange-800">Cash on Delivery</p>
                        <p className="text-xs text-orange-600 mt-1">Pay when you receive your order</p>
                        <div className="flex flex-wrap gap-2 mt-2">
                          <span className="px-2 py-1 bg-orange-100 text-orange-700 text-xs rounded-full">Cash</span>
                          <span className="px-2 py-1 bg-orange-100 text-orange-700 text-xs rounded-full">No advance payment</span>
                        </div>
                      </div>
                    </div>
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
                  
                  {/* Tax Breakdown */}
                  {taxBreakdown?.type !== 'none' && (
                    <div className="border-t border-gray-100 pt-2">
                      {taxBreakdown.type === 'cgst_sgst' ? (
                        <>
                          <div className="flex justify-between text-sm">
                            <span className="text-gray-600">CGST ({(TAX_RATE/2*100).toFixed(1)}%)</span>
                            <span>₹{taxBreakdown.cgst.toLocaleString('en-IN')}</span>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span className="text-gray-600">SGST ({(TAX_RATE/2*100).toFixed(1)}%)</span>
                            <span>₹{taxBreakdown.sgst.toLocaleString('en-IN')}</span>
                          </div>
                          <div className="flex justify-between text-xs text-gray-400 mt-1">
                            <span className="flex items-center gap-1">
                              <Info className="w-3 h-3" />
                              Intra-state transaction
                            </span>
                            <span>Total GST: ₹{taxBreakdown.total.toLocaleString('en-IN')}</span>
                          </div>
                        </>
                      ) : taxBreakdown.type === 'igst' ? (
                        <>
                          <div className="flex justify-between text-sm">
                            <span className="text-gray-600">IGST ({(TAX_RATE*100).toFixed(1)}%)</span>
                            <span>₹{taxBreakdown.igst.toLocaleString('en-IN')}</span>
                          </div>
                          <div className="flex justify-between text-xs text-gray-400 mt-1">
                            <span className="flex items-center gap-1">
                              <Info className="w-3 h-3" />
                              Inter-state transaction
                            </span>
                          </div>
                        </>
                      ) : null}
                    </div>
                  )}
                  
                  {taxBreakdown?.type === 'none' && (
                    <div className="flex justify-between text-sm text-gray-500">
                      <span>Tax</span>
                      <span>₹0 (International order)</span>
                    </div>
                  )}
                  
                  <div className="border-t-2 border-gray-200 pt-2 mt-2">
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

                {/* Validation Summary */}
                {!isFormValid() && (
                  <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                    <div className="flex items-center gap-2 text-red-600 text-sm">
                      <AlertCircle className="w-4 h-4" />
                      <span>Please fill in all required fields</span>
                    </div>
                  </div>
                )}

                <button
                  onClick={handlePlaceOrder}
                  disabled={loading || displayItems.length === 0 || paymentProcessing || !isFormValid()}
                  className={`w-full mt-4 py-3 rounded-lg font-semibold text-white transition-all flex items-center justify-center gap-2 ${
                    loading || paymentProcessing || !isFormValid()
                      ? 'bg-gray-400 cursor-not-allowed' 
                      : selectedPayment === 'phonepe'
                        ? 'bg-gradient-to-r from-purple-500 to-indigo-600 hover:from-purple-600 hover:to-indigo-700 shadow-lg hover:shadow-purple-lg'
                        : selectedPayment === 'razorpay'
                          ? 'bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 shadow-lg hover:shadow-blue-lg'
                          : selectedPayment === 'paypal'
                            ? 'bg-gradient-to-r from-blue-600 to-sky-600 hover:from-blue-700 hover:to-sky-700 shadow-lg hover:shadow-blue-lg'
                            : selectedPayment === 'qr'
                              ? 'bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 shadow-lg hover:shadow-green-lg'
                              : 'bg-gradient-to-r from-orange-500 to-amber-600 hover:from-orange-600 hover:to-amber-700 shadow-lg hover:shadow-orange-lg'
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
                      {selectedPayment === 'cod' 
                        ? 'Place Order (COD)' 
                        : selectedPayment === 'qr'
                          ? 'Scan QR to Pay'
                          : `Pay ₹${total.toLocaleString('en-IN')}`}
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
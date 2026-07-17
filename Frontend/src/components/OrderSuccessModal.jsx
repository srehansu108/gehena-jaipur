// src/components/OrderSuccessModal.jsx - UPDATED WITH NAVIGATION FIXES ✅
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  CheckCircle, 
  ShoppingBag, 
  Truck, 
  Clock, 
  Mail, 
  Phone,
  MapPin,
  CreditCard,
  X,
  ExternalLink,
  Home,
  Printer,
  Download,
  Share2
} from 'lucide-react';
import confetti from 'canvas-confetti';

export default function OrderSuccessModal({ order, onClose, onViewOrder, onViewAllOrders }) {
  const navigate = useNavigate();
  const [showConfetti, setShowConfetti] = useState(true);

  useEffect(() => {
    // Trigger confetti animation
    const duration = 3 * 1000;
    const animationEnd = Date.now() + duration;
    const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 0 };

    function randomInRange(min, max) {
      return Math.random() * (max - min) + min;
    }

    const interval = setInterval(() => {
      const timeLeft = animationEnd - Date.now();

      if (timeLeft <= 0) {
        clearInterval(interval);
        return;
      }

      const particleCount = 50 * (timeLeft / duration);
      confetti({
        ...defaults,
        particleCount,
        origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 }
      });
      confetti({
        ...defaults,
        particleCount,
        origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 }
      });
    }, 250);

    // Cleanup
    return () => clearInterval(interval);
  }, []);

  const formatCurrency = (amount) => {
    return '₹' + (amount || 0).toLocaleString('en-IN');
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusColor = (status) => {
    const colors = {
      'Pending': 'text-yellow-600 bg-yellow-50 border-yellow-200',
      'Processing': 'text-blue-600 bg-blue-50 border-blue-200',
      'Shipped': 'text-purple-600 bg-purple-50 border-purple-200',
      'Delivered': 'text-green-600 bg-green-50 border-green-200',
      'Cancelled': 'text-red-600 bg-red-50 border-red-200'
    };
    return colors[status] || 'text-gray-600 bg-gray-50 border-gray-200';
  };

  const handlePrint = () => {
    window.print();
  };

  const handleDownloadInvoice = () => {
    // You can implement PDF download here
    alert('Invoice download feature coming soon!');
  };

  const handleShare = async () => {
    try {
      await navigator.share({
        title: `Order ${order.orderNumber} - Jewellery Store`,
        text: `Thank you for your order! Order #${order.orderNumber}`,
        url: window.location.href
      });
    } catch (err) {
      // User cancelled share dialog
    }
  };

  // ✅ NEW: Handle View Order Details with navigation to AccountPage
  const handleViewOrder = () => {
    // Close the modal
    if (onClose) onClose();
    
    // Navigate to account page with order ID in state
    navigate('/account', { 
      state: { 
        selectedOrderId: order._id,
        activeTab: 'orders'
      } 
    });
  };

  // ✅ NEW: Handle View All Orders with navigation to AccountPage
  const handleViewAllOrders = () => {
    // Close the modal
    if (onClose) onClose();
    
    // Navigate to account page with orders tab active
    navigate('/account', { 
      state: { 
        activeTab: 'orders'
      } 
    });
  };

  // ✅ NEW: Handle Close with navigation to products
  const handleClose = () => {
    if (onClose) onClose();
    navigate('/products');
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[9999] flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto animate-fadeIn">
        {/* Header */}
        <div className="relative bg-gradient-to-r from-green-500 to-emerald-600 p-6 rounded-t-2xl">
          <button 
            onClick={handleClose}
            className="absolute right-4 top-4 text-white/80 hover:text-white transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
          
          <div className="text-center">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-white/20 rounded-full mb-4">
              <CheckCircle className="w-12 h-12 text-white" />
            </div>
            <h2 className="text-2xl font-bold text-white">Order Placed Successfully!</h2>
            <p className="text-green-100 mt-1">Thank you for your purchase</p>
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          {/* Order Number */}
          <div className="bg-gray-50 rounded-xl p-4 mb-6 text-center">
            <p className="text-sm text-gray-500">Order Number</p>
            <p className="text-2xl font-bold text-pink-600">{order.orderNumber}</p>
            <p className="text-xs text-gray-400 mt-1">Placed on {formatDate(order.createdAt)}</p>
          </div>

          {/* Status Badge */}
          <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-full border ${getStatusColor(order.status)} mb-6`}>
            <Clock className="w-4 h-4" />
            <span className="font-medium">{order.status}</span>
          </div>

          {/* Order Items */}
          <div className="mb-6">
            <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
              <ShoppingBag className="w-5 h-5 text-pink-600" />
              Order Items
            </h3>
            <div className="space-y-3 max-h-48 overflow-y-auto">
              {order.items && order.items.length > 0 ? (
                order.items.map((item, idx) => (
                  <div key={idx} className="flex items-center gap-3 bg-gray-50 rounded-lg p-3">
                    <div className="w-16 h-16 bg-gray-200 rounded-lg flex items-center justify-center overflow-hidden">
                      {item.image ? (
                        <img src={item.image} alt={item.productName} className="w-full h-full object-cover" />
                      ) : (
                        <ShoppingBag className="w-6 h-6 text-gray-400" />
                      )}
                    </div>
                    <div className="flex-1">
                      <p className="font-medium text-gray-900">{item.productName}</p>
                      <p className="text-sm text-gray-500">Qty: {item.quantity}</p>
                      {item.metal && <p className="text-xs text-gray-400">{item.metal}</p>}
                    </div>
                    <p className="font-semibold text-pink-600">{formatCurrency(item.total)}</p>
                  </div>
                ))
              ) : (
                <p className="text-gray-500 text-center py-4">No items found</p>
              )}
            </div>
          </div>

          {/* Order Summary */}
          <div className="grid md:grid-cols-2 gap-4 mb-6">
            <div className="bg-gray-50 rounded-xl p-4">
              <h4 className="font-semibold text-gray-900 mb-2 flex items-center gap-2">
                <MapPin className="w-4 h-4 text-pink-600" />
                Shipping Address
              </h4>
              <p className="text-sm text-gray-600">
                {order.shippingAddress?.fullName || 'N/A'}<br />
                {order.shippingAddress?.addressLine1 || 'N/A'}
                {order.shippingAddress?.addressLine2 && <><br />{order.shippingAddress.addressLine2}</>}
                <br />
                {order.shippingAddress?.city || 'N/A'}, {order.shippingAddress?.state || 'N/A'} - {order.shippingAddress?.postalCode || 'N/A'}
                <br />
                {order.shippingAddress?.country || 'N/A'}
              </p>
              {order.shippingAddress?.phoneNumber && (
                <p className="text-sm text-gray-600 mt-1 flex items-center gap-1">
                  <Phone className="w-3 h-3" />
                  {order.shippingAddress.phoneNumber}
                </p>
              )}
            </div>

            <div className="bg-gray-50 rounded-xl p-4">
              <h4 className="font-semibold text-gray-900 mb-2 flex items-center gap-2">
                <CreditCard className="w-4 h-4 text-pink-600" />
                Payment Summary
              </h4>
              <div className="space-y-1 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Subtotal</span>
                  <span>{formatCurrency(order.subtotal)}</span>
                </div>
                {order.discount > 0 && (
                  <div className="flex justify-between text-green-600">
                    <span>Discount</span>
                    <span>-{formatCurrency(order.discount)}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span className="text-gray-600">Shipping</span>
                  <span>{order.shippingCharges > 0 ? formatCurrency(order.shippingCharges) : 'FREE'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Tax</span>
                  <span>{formatCurrency(order.tax)}</span>
                </div>
                <div className="border-t pt-1 mt-1">
                  <div className="flex justify-between font-bold text-pink-600">
                    <span>Total</span>
                    <span>{formatCurrency(order.total)}</span>
                  </div>
                </div>
              </div>
              <p className="text-xs text-gray-500 mt-2">Payment: {order.paymentMethod || 'N/A'}</p>
            </div>
          </div>

          {/* Actions */}
          <div className="flex flex-col sm:flex-row gap-3">
            <button
              onClick={handleViewOrder}
              className="flex-1 px-4 py-2 bg-pink-600 text-white rounded-lg hover:bg-pink-700 transition-colors flex items-center justify-center gap-2"
            >
              <ExternalLink className="w-4 h-4" />
              View Order Details
            </button>
            <button
              onClick={handleViewAllOrders}
              className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors flex items-center justify-center gap-2"
            >
              <Home className="w-4 h-4" />
              All Orders
            </button>
            <button
              onClick={handlePrint}
              className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors flex items-center justify-center gap-2"
            >
              <Printer className="w-4 h-4" />
            </button>
            <button
              onClick={handleDownloadInvoice}
              className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors flex items-center justify-center gap-2"
            >
              <Download className="w-4 h-4" />
            </button>
            <button
              onClick={handleShare}
              className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors flex items-center justify-center gap-2"
            >
              <Share2 className="w-4 h-4" />
            </button>
          </div>

          {/* Email Confirmation Message */}
          <div className="mt-4 p-3 bg-blue-50 rounded-lg flex items-center gap-2 text-blue-700 text-sm">
            <Mail className="w-4 h-4 flex-shrink-0" />
            <span>A confirmation email has been sent to your registered email address.</span>
          </div>
        </div>
      </div>
    </div>
  );
}
// src/components/payment/PaymentSuccess.jsx
import { CheckCircle, Sparkles, ArrowRight, Printer, Download } from 'lucide-react';

export default function PaymentSuccess({ order, paymentResponse, onContinue }) {
  const formatCurrency = (amount) => {
    return '₹' + (amount || 0).toLocaleString('en-IN');
  };

  return (
    <div className="min-h-[400px] flex flex-col items-center justify-center p-8 text-center animate-fadeIn">
      {/* Success Animation */}
      <div className="relative">
        <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center animate-bounce">
          <CheckCircle className="w-14 h-14 text-green-600" />
        </div>
        <div className="absolute -top-2 -right-2">
          <Sparkles className="w-8 h-8 text-yellow-400 animate-pulse" />
        </div>
      </div>

      <h3 className="text-2xl font-bold text-gray-900 mt-6">
        Payment Successful! 🎉
      </h3>
      
      <p className="text-gray-600 mt-2 max-w-sm">
        Your payment has been processed successfully. 
        Your order is now being prepared.
      </p>

      {/* Payment Details */}
      <div className="mt-6 w-full max-w-sm bg-gray-50 rounded-xl p-4 text-left">
        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-gray-600">Order Number</span>
            <span className="font-semibold text-gray-900">
              {order?.orderNumber || '#' + Date.now()}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Payment ID</span>
            <span className="font-mono text-xs text-gray-700">
              {paymentResponse?.paymentId || 'pay_' + Date.now()}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Amount Paid</span>
            <span className="font-semibold text-pink-600">
              {formatCurrency(order?.total || 0)}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Payment Method</span>
            <span className="text-gray-700">Credit/Debit Card</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Status</span>
            <span className="text-green-600 font-semibold">Completed</span>
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="mt-8 flex flex-col sm:flex-row gap-3 w-full max-w-sm">
        <button
          onClick={() => onContinue && onContinue()}
          className="flex-1 px-6 py-3 bg-gradient-to-r from-pink-600 to-rose-600 text-white rounded-xl font-semibold hover:from-pink-700 hover:to-rose-700 transition-all shadow-lg shadow-pink-200 flex items-center justify-center gap-2"
        >
          Continue to Order
          <ArrowRight className="w-5 h-5" />
        </button>
        <button
          onClick={() => window.print()}
          className="px-4 py-3 border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition-all flex items-center justify-center gap-2"
        >
          <Printer className="w-5 h-5" />
        </button>
        <button
          onClick={() => alert('Invoice download coming soon!')}
          className="px-4 py-3 border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition-all flex items-center justify-center gap-2"
        >
          <Download className="w-5 h-5" />
        </button>
      </div>

      {/* Security Badge */}
      <div className="mt-6 flex items-center gap-2 text-xs text-gray-400">
        <span>✓</span>
        <span>Payment confirmed and secure</span>
        <span className="w-1 h-1 bg-gray-300 rounded-full"></span>
        <span>✓</span>
        <span>Receipt sent to your email</span>
      </div>
    </div>
  );
}
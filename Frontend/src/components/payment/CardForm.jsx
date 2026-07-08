// src/components/payment/CardForm.jsx

import { CreditCard, Lock, User, Calendar, Shield, X } from 'lucide-react';

// ✅ Make sure order is received as a prop
export default function CardForm({ 
  cardDetails, 
  setCardDetails, 
  onSubmit, 
  loading,
  onCancel,
  order  // ✅ Add this prop
}) {
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    
    // ✅ Format card number
    if (name === 'cardNumber') {
      const formatted = value
        .replace(/\s/g, '')
        .replace(/(.{4})/g, '$1 ')
        .trim()
        .slice(0, 19);
      setCardDetails(prev => ({ ...prev, [name]: formatted }));
      return;
    }

    // ✅ Format expiry month
    if (name === 'expiryMonth') {
      const month = value.replace(/\D/g, '').slice(0, 2);
      if (month > 12) return;
      setCardDetails(prev => ({ ...prev, [name]: month }));
      return;
    }

    // ✅ Format expiry year
    if (name === 'expiryYear') {
      const year = value.replace(/\D/g, '').slice(0, 2);
      setCardDetails(prev => ({ ...prev, [name]: year }));
      return;
    }

    // ✅ Format CVV
    if (name === 'cvv') {
      const cvv = value.replace(/\D/g, '').slice(0, 3);
      setCardDetails(prev => ({ ...prev, [name]: cvv }));
      return;
    }

    setCardDetails(prev => ({ ...prev, [name]: value }));
  };

  // ✅ Detect card type from number
  const getCardType = (number) => {
    const cleaned = number.replace(/\s/g, '');
    if (cleaned.startsWith('4')) return 'Visa';
    if (cleaned.startsWith('5')) return 'Mastercard';
    if (cleaned.startsWith('6')) return 'RuPay';
    if (cleaned.startsWith('3')) return 'Amex';
    return 'Card';
  };

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      {/* Card Number */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Card Number
        </label>
        <div className="relative">
          <input
            type="text"
            name="cardNumber"
            value={cardDetails.cardNumber}
            onChange={handleInputChange}
            placeholder="1234 5678 9012 3456"
            className="w-full pl-10 pr-12 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-pink-500 focus:border-transparent transition-all"
            required
            disabled={loading}
            maxLength={19}
          />
          <CreditCard className="absolute left-3 top-3.5 w-5 h-5 text-gray-400" />
          <span className="absolute right-3 top-3 text-xs font-medium text-gray-500">
            {getCardType(cardDetails.cardNumber)}
          </span>
        </div>
      </div>

      {/* Card Holder */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Card Holder Name
        </label>
        <div className="relative">
          <input
            type="text"
            name="cardHolder"
            value={cardDetails.cardHolder}
            onChange={handleInputChange}
            placeholder="John Doe"
            className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-pink-500 focus:border-transparent transition-all"
            required
            disabled={loading}
          />
          <User className="absolute left-3 top-3.5 w-5 h-5 text-gray-400" />
        </div>
      </div>

      {/* Expiry & CVV */}
      <div className="grid grid-cols-2 gap-4">
        {/* Expiry */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Expiry Date
          </label>
          <div className="relative flex items-center">
            <input
              type="text"
              name="expiryMonth"
              value={cardDetails.expiryMonth}
              onChange={handleInputChange}
              placeholder="MM"
              className="w-1/2 pl-10 pr-2 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-pink-500 focus:border-transparent transition-all"
              required
              disabled={loading}
              maxLength={2}
            />
            <span className="mx-1 text-gray-400">/</span>
            <input
              type="text"
              name="expiryYear"
              value={cardDetails.expiryYear}
              onChange={handleInputChange}
              placeholder="YY"
              className="w-1/2 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-pink-500 focus:border-transparent transition-all"
              required
              disabled={loading}
              maxLength={2}
            />
            <Calendar className="absolute left-3 top-3.5 w-5 h-5 text-gray-400" />
          </div>
        </div>

        {/* CVV */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            CVV
            <span className="text-xs text-gray-400 ml-1">(3 digits)</span>
          </label>
          <div className="relative">
            <input
              type="password"
              name="cvv"
              value={cardDetails.cvv}
              onChange={handleInputChange}
              placeholder="•••"
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-pink-500 focus:border-transparent transition-all"
              required
              disabled={loading}
              maxLength={3}
            />
            <Lock className="absolute left-3 top-3.5 w-5 h-5 text-gray-400" />
          </div>
        </div>
      </div>

      {/* Security Badge */}
      <div className="flex items-center gap-2 text-xs text-green-600 bg-green-50 p-2 rounded-lg">
        <Shield className="w-4 h-4" />
        <span>Your payment information is encrypted and secure</span>
      </div>

      {/* Actions */}
      <div className="flex gap-3 pt-4">
        <button
          type="submit"
          disabled={loading}
          className="flex-1 px-6 py-3 bg-gradient-to-r from-pink-600 to-rose-600 text-white rounded-xl font-semibold hover:from-pink-700 hover:to-rose-700 transition-all shadow-lg shadow-pink-200 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? (
            <>
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              Processing...
            </>
          ) : (
            <>
              <Lock className="w-5 h-5" />
              {/* ✅ FIX: Use order prop safely */}
              Pay ₹{order?.total ? Math.round(order.total).toLocaleString('en-IN') : '0'}
            </>
          )}
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="px-6 py-3 border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition-all flex items-center gap-2"
          disabled={loading}
        >
          <X className="w-5 h-5" />
          Cancel
        </button>
      </div>

      {/* Accepted Cards */}
      <div className="flex items-center justify-center gap-3 pt-2">
        <img 
          src="https://upload.wikimedia.org/wikipedia/commons/thumb/5/5e/Visa_Inc._logo.svg/1200px-Visa_Inc._logo.svg.png"
          alt="Visa"
          className="h-5 w-auto opacity-60 hover:opacity-100 transition-opacity"
        />
        <img 
          src="https://upload.wikimedia.org/wikipedia/commons/thumb/2/2a/Mastercard-logo.svg/1200px-Mastercard-logo.svg.png"
          alt="Mastercard"
          className="h-5 w-auto opacity-60 hover:opacity-100 transition-opacity"
        />
        <img 
          src="https://upload.wikimedia.org/wikipedia/commons/thumb/6/63/RuPay_logo.svg/1200px-RuPay_logo.svg.png"
          alt="RuPay"
          className="h-5 w-auto opacity-60 hover:opacity-100 transition-opacity"
        />
        <img 
          src="https://upload.wikimedia.org/wikipedia/commons/thumb/3/30/American_Express_logo.svg/1200px-American_Express_logo.svg.png"
          alt="Amex"
          className="h-5 w-auto opacity-60 hover:opacity-100 transition-opacity"
        />
      </div>
    </form>
  );
}
// src/components/payment/CardPreview.jsx
import { CreditCard, Lock, Wifi } from 'lucide-react';

export default function CardPreview({ cardDetails }) {
  const { cardNumber, cardHolder, expiryMonth, expiryYear } = cardDetails;

  // Get card brand color
  const getCardBrand = (number) => {
    const cleaned = number.replace(/\s/g, '');
    if (cleaned.startsWith('4')) return { 
      name: 'Visa', 
      gradient: 'from-blue-600 to-blue-800',
      logo: '💳'
    };
    if (cleaned.startsWith('5')) return { 
      name: 'Mastercard', 
      gradient: 'from-red-600 to-orange-600',
      logo: '💳'
    };
    if (cleaned.startsWith('6')) return { 
      name: 'RuPay', 
      gradient: 'from-purple-600 to-pink-600',
      logo: '💳'
    };
    return { 
      name: 'Card', 
      gradient: 'from-gray-700 to-gray-900',
      logo: '💳'
    };
  };

  const brand = getCardBrand(cardNumber);

  return (
    <div className="bg-gradient-to-r from-gray-800 to-gray-900 rounded-2xl p-6 shadow-2xl transform perspective-1000 rotate-y-6 transition-all hover:rotate-y-0">
      <div className="flex justify-between items-start">
        <div>
          <div className="text-white/60 text-xs font-medium">Card Type</div>
          <div className="text-white font-semibold text-lg">{brand.name}</div>
        </div>
        <div className="flex items-center gap-2">
          <Wifi className="w-6 h-6 text-white/60 rotate-90" />
          <div className="text-white text-2xl">{brand.logo}</div>
        </div>
      </div>

      <div className="mt-8">
        <div className="text-white/60 text-xs font-medium">Card Number</div>
        <div className="text-white font-mono text-xl tracking-wider mt-1">
          {cardNumber || '•••• •••• •••• ••••'}
        </div>
      </div>

      <div className="mt-6 flex justify-between">
        <div>
          <div className="text-white/60 text-xs font-medium">Card Holder</div>
          <div className="text-white font-semibold uppercase mt-1">
            {cardHolder || 'YOUR NAME'}
          </div>
        </div>
        <div className="text-right">
          <div className="text-white/60 text-xs font-medium">Expires</div>
          <div className="text-white font-mono mt-1">
            {expiryMonth || 'MM'}/{expiryYear || 'YY'}
          </div>
        </div>
      </div>

      <div className="mt-6 flex justify-between items-center">
        <div className="flex gap-1">
          <div className="w-8 h-6 bg-white/20 rounded"></div>
          <div className="w-8 h-6 bg-white/20 rounded"></div>
        </div>
        <Lock className="w-4 h-4 text-white/40" />
      </div>

      {/* Card chip */}
      <div className="absolute bottom-6 right-6">
        <div className="w-10 h-8 bg-gradient-to-br from-yellow-400 to-yellow-600 rounded-md opacity-70"></div>
      </div>
    </div>
  );
}
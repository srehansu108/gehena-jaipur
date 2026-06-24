// src/components/CartBadge.jsx
import { Link } from 'react-router-dom';
import { ShoppingCart } from 'lucide-react';
import { useCart } from '../contexts/CartContext';

export function CartBadge() {
  const { itemCount } = useCart();

  return (
    <Link to="/cart" className="relative inline-block">
      <ShoppingCart className="w-6 h-6 text-gray-700 hover:text-amber-600 transition-colors" />
      {itemCount > 0 && (
        <span className="absolute -top-2 -right-2 bg-gray-100 text-gray-700 hover:bg-pink-50 hover:text-pink-600 text-xs rounded-full h-5 w-5 flex items-center justify-center font-bold">
          {itemCount > 99 ? '99+' : itemCount}
        </span>
      )}
    </Link>
  );
}
// src/components/AddToCartButton.jsx
import { useState } from 'react';
import { ShoppingCart, Check, Loader } from 'lucide-react';
import { useCart } from '../contexts/CartContext';

export function AddToCartButton({ productId, stock, className = '' }) {
  const { addItem } = useCart();
  const [isAdding, setIsAdding] = useState(false);
  const [isAdded, setIsAdded] = useState(false);

  const handleAddToCart = async () => {
    if (stock <= 0) return;
    
    setIsAdding(true);
    const result = await addItem(productId, 1);
    setIsAdding(false);

    if (result.success) {
      setIsAdded(true);
      setTimeout(() => setIsAdded(false), 2000);
    } else {
      // Show error toast
      console.error('Failed to add to cart:', result.message);
    }
  };

  return (
    <button
      onClick={handleAddToCart}
      disabled={isAdding || stock <= 0}
      className={`${className} ${isAdded ? 'bg-green-600 hover:bg-green-700' : ''}`}
    >
      {isAdding ? (
        <>
          <Loader className="w-5 h-5 animate-spin" />
          Adding...
        </>
      ) : isAdded ? (
        <>
          <Check className="w-5 h-5" />
          Added!
        </>
      ) : (
        <>
          <ShoppingCart className="w-5 h-5" />
          {stock > 0 ? 'Add to Cart' : 'Out of Stock'}
        </>
      )}
    </button>
  );
}
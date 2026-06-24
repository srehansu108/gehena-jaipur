// src/pages/NewArrivalsPage.jsx
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Sparkles, ArrowLeft } from 'lucide-react';
import { productService } from '../services/productService';
import { ProductCard } from '../components/ProductCard';

export function NewArrivalsPage() {
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Load new arrivals
    const newArrivals = productService.getNewArrivals(12);
    setProducts(newArrivals);
    setIsLoading(false);
  }, []);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="relative">
  <div className="animate-spin rounded-full h-16 w-16 border-4 border-pink-200 border-t-pink-600 mx-auto mb-4"></div>
  <div className="absolute inset-0 flex items-center justify-center">
    <div className="w-6 h-6 border-2 border-pink-300 rounded-full"></div>
  </div>
</div>
          <p className="text-gray-600">Loading new arrivals...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-purple-600 to-pink-600 text-white py-12">
        <div className="container mx-auto px-4">
          <button 
            onClick={() => navigate('/')}
            className="flex items-center gap-2 text-purple-100 hover:text-white mb-4 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            Back to Home
          </button>
          <div className="flex items-center gap-3 mb-3">
            <Sparkles className="w-10 h-10" />
            <h1 className="text-4xl md:text-5xl font-serif">New Arrivals</h1>
          </div>
          <p className="text-purple-100 max-w-2xl">
            Be the first to own our latest creations. Fresh designs, contemporary styles, 
            and the finest craftsmanship - just arrived for you.
          </p>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        {/* Features Banner */}
        <div className="bg-white rounded-xl shadow-sm p-6 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="text-3xl mb-2">✨</div>
              <h3 className="font-semibold mb-1">Latest Designs</h3>
              <p className="text-sm text-gray-500">Contemporary and trendy</p>
            </div>
            <div className="text-center">
              <div className="text-3xl mb-2">💎</div>
              <h3 className="font-semibold mb-1">Premium Quality</h3>
              <p className="text-sm text-gray-500">Certified and hallmarked</p>
            </div>
            <div className="text-center">
              <div className="text-3xl mb-2">🎁</div>
              <h3 className="font-semibold mb-1">Limited Stock</h3>
              <p className="text-sm text-gray-500">Grab before they're gone</p>
            </div>
          </div>
        </div>

        {/* Products Grid */}
        {products.length > 0 ? (
          <>
            <div className="mb-6">
              <p className="text-gray-600">
                Showing <span className="font-semibold">{products.length}</span> new arrivals
              </p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {products.map(product => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          </>
        ) : (
          <div className="text-center py-16 bg-white rounded-xl">
            <div className="text-6xl mb-4">🆕</div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No new arrivals</h3>
            <p className="text-gray-500">Check back soon for our latest collection</p>
          </div>
        )}
      </div>
    </div>
  );
}
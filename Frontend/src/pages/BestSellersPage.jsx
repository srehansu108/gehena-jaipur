// src/pages/BestSellersPage.jsx
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Star, ArrowLeft, TrendingUp } from 'lucide-react';
import { productService } from '../services/productService';
import { ProductCard } from '../components/ProductCard';

export function BestSellersPage() {
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Load best selling products
    const bestSellers = productService.getBestSellers(12);
    setProducts(bestSellers);
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
          <p className="text-gray-600">Loading best sellers...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-amber-600 to-orange-600 text-white py-12">
        <div className="container mx-auto px-4">
          <button 
            onClick={() => navigate('/')}
            className="flex items-center gap-2 text-amber-100 hover:text-white mb-4 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            Back to Home
          </button>
          <div className="flex items-center gap-3 mb-3">
            <TrendingUp className="w-10 h-10" />
            <h1 className="text-4xl md:text-5xl font-serif">Best Sellers</h1>
          </div>
          <p className="text-amber-100 max-w-2xl">
            Discover our most loved pieces - customer favorites that have captured hearts worldwide.
            These timeless treasures are celebrated for their exceptional quality and stunning design.
          </p>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        {/* Stats Banner */}
        <div className="bg-white rounded-xl shadow-sm p-6 mb-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
            <div>
              <div className="text-2xl font-bold text-amber-600">{products.length}+</div>
              <div className="text-sm text-gray-500">Best Sellers</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-amber-600">4.9</div>
              <div className="text-sm text-gray-500">Average Rating</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-amber-600">10k+</div>
              <div className="text-sm text-gray-500">Happy Customers</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-amber-600">100%</div>
              <div className="text-sm text-gray-500">Certified</div>
            </div>
          </div>
        </div>

        {/* Products Grid */}
        {products.length > 0 ? (
          <>
            <div className="mb-6">
              <p className="text-gray-600">
                Showing <span className="font-semibold">{products.length}</span> best selling products
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
            <div className="text-6xl mb-4">🏆</div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No products found</h3>
            <p className="text-gray-500">Check back later for our best sellers</p>
          </div>
        )}
      </div>
    </div>
  );
}
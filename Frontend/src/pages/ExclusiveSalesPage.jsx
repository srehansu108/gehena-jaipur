// src/pages/ExclusiveSalesPage.jsx
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Tag, ArrowLeft, Percent, Clock } from 'lucide-react';
import { productService } from '../services/productService';
import { ProductCard } from '../components/ProductCard';

export function ExclusiveSalesPage() {
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [timeLeft, setTimeLeft] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0
  });

  useEffect(() => {
    // Load exclusive sales
    const sales = productService.getExclusiveSales(12);
    setProducts(sales);
    setIsLoading(false);

    // Countdown timer (7 days from now)
    const targetDate = new Date();
    targetDate.setDate(targetDate.getDate() + 7);
    
    const timer = setInterval(() => {
      const now = new Date().getTime();
      const distance = targetDate.getTime() - now;
      
      setTimeLeft({
        days: Math.floor(distance / (1000 * 60 * 60 * 24)),
        hours: Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
        minutes: Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60)),
        seconds: Math.floor((distance % (1000 * 60)) / 1000)
      });
    }, 1000);
    
    return () => clearInterval(timer);
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
          <p className="text-gray-600">Loading exclusive sales...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-red-600 to-red-800 text-white py-12">
        <div className="container mx-auto px-4">
          <button 
            onClick={() => navigate('/')}
            className="flex items-center gap-2 text-red-100 hover:text-white mb-4 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            Back to Home
          </button>
          <div className="flex items-center gap-3 mb-3">
            <Tag className="w-10 h-10" />
            <h1 className="text-4xl md:text-5xl font-serif">Exclusive Sales</h1>
          </div>
          <p className="text-red-100 max-w-2xl">
            Limited time offers on our premium collection. Grab these exclusive deals before they're gone!
          </p>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        {/* Countdown Timer */}
        <div className="bg-gradient-to-r from-red-50 to-orange-50 rounded-xl p-6 mb-8 text-center">
          <div className="flex items-center justify-center gap-2 mb-4">
            <Clock className="w-5 h-5 text-red-600" />
            <span className="font-semibold text-red-600">Hurry Up! Sale Ends In</span>
          </div>
          <div className="flex justify-center gap-4">
            <div className="text-center">
              <div className="bg-white rounded-lg px-4 py-2 shadow-sm">
                <span className="text-2xl font-bold text-red-600">{timeLeft.days}</span>
              </div>
              <span className="text-xs text-gray-600">Days</span>
            </div>
            <div className="text-center">
              <div className="bg-white rounded-lg px-4 py-2 shadow-sm">
                <span className="text-2xl font-bold text-red-600">{timeLeft.hours}</span>
              </div>
              <span className="text-xs text-gray-600">Hours</span>
            </div>
            <div className="text-center">
              <div className="bg-white rounded-lg px-4 py-2 shadow-sm">
                <span className="text-2xl font-bold text-red-600">{timeLeft.minutes}</span>
              </div>
              <span className="text-xs text-gray-600">Minutes</span>
            </div>
            <div className="text-center">
              <div className="bg-white rounded-lg px-4 py-2 shadow-sm">
                <span className="text-2xl font-bold text-red-600">{timeLeft.seconds}</span>
              </div>
              <span className="text-xs text-gray-600">Seconds</span>
            </div>
          </div>
        </div>

        {/* Offer Highlights */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl p-4 text-center">
            <Percent className="w-6 h-6 text-green-600 mx-auto mb-2" />
            <div className="font-bold text-green-600">Up to 40% OFF</div>
            <div className="text-sm text-gray-600">On selected items</div>
          </div>
          <div className="bg-gradient-to-r from-blue-50 to-cyan-50 rounded-xl p-4 text-center">
            <Tag className="w-6 h-6 text-blue-600 mx-auto mb-2" />
            <div className="font-bold text-blue-600">Extra 10% OFF</div>
            <div className="text-sm text-gray-600">Use code: EXTRA10</div>
          </div>
          <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl p-4 text-center">
            <Clock className="w-6 h-6 text-purple-600 mx-auto mb-2" />
            <div className="font-bold text-purple-600">Free Shipping</div>
            <div className="text-sm text-gray-600">On orders above ₹25,000</div>
          </div>
        </div>

        {/* Products Grid */}
        {products.length > 0 ? (
          <>
            <div className="mb-6">
              <p className="text-gray-600">
                Showing <span className="font-semibold">{products.length}</span> exclusive deals
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
            <div className="text-6xl mb-4">🏷️</div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No active sales</h3>
            <p className="text-gray-500">Check back later for exclusive offers</p>
          </div>
        )}
      </div>
    </div>
  );
}
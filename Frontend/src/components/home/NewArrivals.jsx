// src/components/home/NewArrivals.jsx — DYNAMIC ✅
import { useEffect, useState } from 'react';
import { Clock, Sparkles, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { productApi } from '../../api/productApi';

// Fallback — shown only if API fails
/*const FALLBACK_PRODUCTS = [
  {
    _id: 'fb1',
    name: 'Modern Art Pendant',
    price: 18500,
    images: ['/images/products/pendant-1.jpg'],
    badge: 'New',
    daysLeft: 5,
  },
  {
    _id: 'fb2',
    name: 'Temple Jewellery Set',
    price: 95000,
    images: ['/images/products/set-1.jpg'],
    badge: 'Trending',
    daysLeft: 7,
  },
  {
    _id: 'fb3',
    name: 'Rose Gold Bracelet',
    price: 32000,
    images: ['/images/products/bracelet-1.jpg'],
    badge: 'Limited',
    daysLeft: 3,
  },
  {
    _id: 'fb4',
    name: 'Antique Necklace',
    price: 75000,
    images: ['/images/products/necklace-2.jpg'],
    badge: 'Exclusive',
    daysLeft: 10,
  },
];*/

const formatPrice = (n) => {
  if (n === undefined || n === null) return '';
  return Number(n).toLocaleString('en-IN');
};

// Compute "days left" from createdAt + a fixed window (e.g., 30 days)
const computeDaysLeft = (createdAt) => {
  if (!createdAt) return null;
  const created = new Date(createdAt).getTime();
  if (Number.isNaN(created)) return null;
  const daysSince = Math.floor((Date.now() - created) / (1000 * 60 * 60 * 24));
  const remaining = 30 - daysSince;
  return remaining > 0 ? remaining : 0;
};

const getBadgeColor = (badge) => {
  switch (badge) {
    case 'New':       return 'bg-gradient-to-r from-pink-500 to-rose-500';
    case 'Trending':  return 'bg-gradient-to-r from-rose-500 to-pink-400';
    case 'Limited':   return 'bg-gradient-to-r from-rose-600 to-rose-400';
    case 'Exclusive': return 'bg-gradient-to-r from-amber-500 to-pink-500';
    default:          return 'bg-gradient-to-r from-pink-500 to-rose-500';
  }
};

export function NewArrivals() {
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let alive = true;

    (async () => {
      try {
        const data = await productApi.getNewArrivals(4);
        if (!alive) return;

        if (Array.isArray(data) && data.length > 0) {
          setProducts(data);
        } else {
          console.warn('⚠️ No new arrivals returned — using fallback');
          setProducts(FALLBACK_PRODUCTS);
        }
      } catch (err) {
        console.error('❌ Failed to fetch new arrivals:', err);
        if (alive) setProducts(FALLBACK_PRODUCTS);
      } finally {
        if (alive) setLoading(false);
      }
    })();

    return () => { alive = false; };
  }, []);

  const handleProductClick = (id) => {
    if (!id || String(id).startsWith('fb')) return;
    navigate(`/product/${id}`);
  };

  if (loading) {
    return (
      <section className="py-16 bg-gradient-to-b from-pink-50/30 to-white">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <div className="h-4 w-40 bg-pink-100 rounded mx-auto mb-3 animate-pulse" />
            <div className="h-8 w-64 bg-pink-100 rounded mx-auto mb-3 animate-pulse" />
            <div className="h-4 w-72 bg-pink-100 rounded mx-auto animate-pulse" />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-96 rounded-2xl bg-pink-50 animate-pulse" />
            ))}
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="py-16 bg-gradient-to-b from-pink-50/30 to-white">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <div className="flex items-center justify-center gap-3 mb-3">
            <span className="w-12 h-0.5 bg-gradient-to-r from-pink-300 to-pink-500" />
            <Sparkles className="w-5 h-5 text-pink-500 animate-pulse" />
            <span className="text-pink-600 font-semibold text-sm tracking-wider uppercase">
              Fresh Collection
            </span>
            <span className="w-12 h-0.5 bg-gradient-to-r from-pink-500 to-pink-300" />
          </div>
          <h2 className="section-title text-gray-900">
            New <span className="text-pink-gradient">Arrivals</span>
          </h2>
          <p className="section-subtitle text-gray-500">Fresh designs just for you ✨</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {products.map((item) => {
            const imageUrl =
              Array.isArray(item.images) && item.images.length > 0
                ? item.images[0]
                : '/images/products/placeholder.jpg';

            // Prefer explicit daysLeft from API, else compute from createdAt
            const daysLeft =
              item.daysLeft ??
              computeDaysLeft(item.createdAt) ??
              30;

            const badge = item.badge || 'New';

            return (
              <div
                key={item._id}
                className="bg-white rounded-2xl overflow-hidden shadow-md hover:shadow-pink-lg transition-all duration-500 group cursor-pointer hover:-translate-y-1"
                onClick={() => handleProductClick(item._id)}
              >
                <div className="relative h-72 overflow-hidden bg-gray-100">
                  <img
                    src={imageUrl}
                    alt={item.name}
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                    onError={(e) => {
                      e.currentTarget.src = '/images/products/placeholder.jpg';
                    }}
                  />

                  {/* Badge */}
                  <div
                    className={`absolute top-3 left-3 ${getBadgeColor(badge)} text-white text-xs px-3 py-1 rounded-full shadow-md flex items-center gap-1`}
                  >
                    <Sparkles className="w-3 h-3" />
                    {badge}
                  </div>

                  {/* Days Left */}
                  {daysLeft > 0 && (
                    <div className="absolute top-3 right-3 bg-gradient-to-r from-pink-500 to-rose-500 text-white text-xs px-3 py-1 rounded-full shadow-md flex items-center gap-1">
                      <Clock className="w-3 h-3 animate-pulse" />
                      {daysLeft} days left
                    </div>
                  )}

                  {/* Quick view overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 flex items-end justify-center p-4">
                    <button className="bg-white/90 backdrop-blur-sm text-pink-600 px-6 py-2 rounded-full font-semibold text-sm hover:bg-pink-500 hover:text-white transition-all duration-300 transform hover:scale-105 shadow-lg">
                      Quick View
                    </button>
                  </div>
                </div>

                <div className="p-4">
                  <h3 className="font-semibold text-gray-900 mb-2 group-hover:text-pink-600 transition-colors duration-300 line-clamp-1">
                    {item.name}
                  </h3>
                  <div className="flex items-center justify-between">
                    <p className="text-pink-600 font-bold text-lg">
                      ₹{formatPrice(item.price)}
                    </p>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        alert(`${item.name} added to cart!`);
                      }}
                      className="text-pink-500 hover:text-pink-600 opacity-0 group-hover:opacity-100 transform translate-x-2 group-hover:translate-x-0 transition-all duration-300"
                    >
                      <ArrowRight className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* View All Button */}
        <div className="text-center mt-12">
          <button
            onClick={() => navigate('/new-arrivals')}
            className="group inline-flex items-center gap-2 px-8 py-3 border-2 border-pink-500 text-pink-600 hover:bg-gradient-to-r hover:from-pink-500 hover:to-rose-500 hover:text-white rounded-full font-semibold transition-all duration-300 shadow-md hover:shadow-pink-lg transform hover:scale-[1.02] active:scale-[0.98]"
          >
            <span>View All New Arrivals</span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform duration-300" />
          </button>
        </div>
      </div>
    </section>
  );
}
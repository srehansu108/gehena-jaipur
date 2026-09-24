import { useEffect, useState } from 'react';
import { Heart, Eye, Star } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { productApi } from '../../api/productApi';

// Fallback — only if API fails
/*const FALLBACK_PRODUCTS = [
  {
    _id: 'fb1',
    name: 'Diamond Solitaire Ring1',
    price: 45000,
    originalPrice: 55000,
    rating: 4.8,
    reviews: 234,
    images: ['/images/products/ring-1.jpg'],
    badge: 'Bestseller',
    category: 'rings',
  },
  {
    _id: 'fb2',
    name: 'Gold Temple Necklace',
    price: 85000,
    originalPrice: 105000,
    rating: 4.9,
    reviews: 189,
    images: ['/images/products/necklace-1.jpg'],
    badge: '-20%',
    category: 'necklaces',
  },
  {
    _id: 'fb3',
    name: 'Pearl Drop Earrings',
    price: 25000,
    originalPrice: 32000,
    rating: 4.7,
    reviews: 456,
    images: ['/images/products/earrings-1.jpg'],
    badge: null,
    category: 'earrings',
  },
  {
    _id: 'fb4',
    name: 'Diamond Bangles Set',
    price: 125000,
    originalPrice: 150000,
    rating: 4.9,
    reviews: 167,
    images: ['/images/products/bangles-1.jpg'],
    badge: 'Limited',
    category: 'bangles',
  },
];*/

// Helper to format ₹ with commas
const formatPrice = (n) => {
  if (n === undefined || n === null) return '';
  return Number(n).toLocaleString('en-IN');
};

export function Bestsellers() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [hoveredProduct, setHoveredProduct] = useState(null);
  const [wishlist, setWishlist] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    let alive = true;

    (async () => {
      try {
        const data = await productApi.getBestsellers(4);
        if (!alive) return;

        if (Array.isArray(data) && data.length > 0) {
          setProducts(data);
        } else {
          console.warn('⚠️ No bestsellers returned — using fallback');
          setProducts(FALLBACK_PRODUCTS);
        }
      } catch (err) {
        console.error('❌ Failed to fetch bestsellers:', err);
        if (alive) setProducts(FALLBACK_PRODUCTS);
      } finally {
        if (alive) setLoading(false);
      }
    })();

    return () => { alive = false; };
  }, []);

  const toggleWishlist = (productId) => {
    setWishlist((prev) =>
      prev.includes(productId)
        ? prev.filter((id) => id !== productId)
        : [...prev, productId]
    );
  };

  const handleProductClick = (productId) => {
    if (!productId || String(productId).startsWith('fb')) return;
    navigate(`/product/${productId}`);
  };

  const handleQuickView = (product, e) => {
    e.stopPropagation();
    alert(`Quick view: ${product.name}`);
  };

  const handleAddToCart = (product, e) => {
    e.stopPropagation();
    alert(`${product.name} added to cart!`);
  };

  if (loading) {
    return (
      <section className="py-16 bg-gradient-to-b from-white to-pink-50/30">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <div className="h-8 w-48 bg-pink-100 rounded mx-auto mb-3 animate-pulse" />
            <div className="h-4 w-72 bg-pink-100 rounded mx-auto animate-pulse" />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="space-y-3">
                <div className="h-80 rounded-lg bg-pink-50 animate-pulse" />
                <div className="h-4 w-3/4 bg-pink-50 rounded mx-auto animate-pulse" />
                <div className="h-4 w-1/2 bg-pink-50 rounded mx-auto animate-pulse" />
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="py-16 bg-gradient-to-b from-white to-pink-50/30">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="section-title text-pink-600">Bestsellers</h2>
          <p className="section-subtitle">Our most loved pieces, chosen by thousands</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {products.map((product) => {
            const productId = product._id;
            const imageUrl = Array.isArray(product.images) && product.images.length > 0
              ? product.images[0]
              : product.image || '/images/products/placeholder.jpg';

            // Auto-calculate badge for sale products
            const badge = product.badge
              || (product.originalPrice && product.price && product.originalPrice > product.price
                ? `-${Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)}%`
                : null);

            return (
              <div
                key={productId}
                className="group relative cursor-pointer"
                onMouseEnter={() => setHoveredProduct(productId)}
                onMouseLeave={() => setHoveredProduct(null)}
                onClick={() => handleProductClick(productId)}
              >
                <div className="relative h-80 rounded-lg overflow-hidden bg-gray-100">
                  <div
                    className="w-full h-full bg-cover bg-center transition-transform duration-500 group-hover:scale-105"
                    style={{ backgroundImage: `url(${imageUrl})` }}
                  />

                  {badge && (
                    <span className="absolute top-3 left-3 bg-gradient-to-r from-pink-500 to-rose-500 text-white text-xs px-2 py-1 rounded shadow-md">
                      {badge}
                    </span>
                  )}

                  {hoveredProduct === productId && (
                    <div className="absolute inset-0 bg-black/40 flex items-center justify-center gap-3 transition-all">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleWishlist(productId);
                        }}
                        className="bg-white p-2 rounded-full hover:bg-pink-500 hover:text-white transition-colors shadow-md hover:shadow-pink-lg"
                      >
                        <Heart
                          className={`w-5 h-5 ${
                            wishlist.includes(productId) ? 'fill-red-500 text-red-500' : ''
                          }`}
                        />
                      </button>
                      <button
                        onClick={(e) => handleQuickView(product, e)}
                        className="bg-white p-2 rounded-full hover:bg-pink-500 hover:text-white transition-colors shadow-md hover:shadow-pink-lg"
                      >
                        <Eye className="w-5 h-5" />
                      </button>
                    </div>
                  )}
                </div>

                <div className="mt-4 text-center">
                  <h3 className="font-semibold text-gray-900 mb-1 group-hover:text-pink-600 transition-colors line-clamp-1">
                    {product.name}
                  </h3>
                  <div className="flex items-center justify-center gap-2 mb-2">
                    <span className="text-pink-600 font-bold">₹{formatPrice(product.price)}</span>
                    {product.originalPrice && (
                      <span className="text-gray-400 line-through text-sm">
                        ₹{formatPrice(product.originalPrice)}
                      </span>
                    )}
                  </div>
                  <div className="flex items-center justify-center gap-1">
                    <Star className="w-4 h-4 fill-pink-500 text-pink-500" />
                    <span className="text-sm font-semibold">{product.rating || 0}</span>
                    <span className="text-gray-400 text-sm">({product.reviews || 0})</span>
                  </div>
                  <button
                    onClick={(e) => handleAddToCart(product, e)}
                    className="mt-3 w-full bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600 text-white py-2 rounded-full transition-all duration-300 font-semibold shadow-md hover:shadow-pink-lg transform hover:scale-[1.02] active:scale-[0.98]"
                  >
                    Add to Cart
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        <div className="text-center mt-12">
          <button
            onClick={() => navigate('/products')}
            className="border-2 border-pink-500 text-pink-600 hover:bg-gradient-to-r hover:from-pink-500 hover:to-rose-500 hover:text-white px-8 py-3 rounded-full font-semibold transition-all duration-300 shadow-md hover:shadow-pink-lg transform hover:scale-[1.02] active:scale-[0.98]"
          >
            View All Products
          </button>
        </div>
      </div>
    </section>
  );
}
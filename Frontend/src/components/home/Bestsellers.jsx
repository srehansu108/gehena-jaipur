// src/components/home/Bestsellers.jsx
import { useState } from 'react';
import { Heart, Eye, Star } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const products = [
  {
    id: 1,
    name: "Diamond Solitaire Ring",
    price: "45,000",
    originalPrice: "55,000",
    rating: 4.8,
    reviews: 234,
    image: "/images/products/ring-1.jpg",
    badge: "Bestseller",
    category: "rings"
  },
  {
    id: 2,
    name: "Gold Temple Necklace",
    price: "85,000",
    originalPrice: "1,05,000",
    rating: 4.9,
    reviews: 189,
    image: "/images/products/necklace-1.jpg",
    badge: "-20%",
    category: "necklaces"
  },
  {
    id: 3,
    name: "Pearl Drop Earrings",
    price: "25,000",
    originalPrice: "32,000",
    rating: 4.7,
    reviews: 456,
    image: "/images/products/earrings-1.jpg",
    badge: null,
    category: "earrings"
  },
  {
    id: 4,
    name: "Diamond Bangles Set",
    price: "1,25,000",
    originalPrice: "1,50,000",
    rating: 4.9,
    reviews: 167,
    image: "/images/products/bangles-1.jpg",
    badge: "Limited",
    category: "bangles"
  }
];

export function Bestsellers() {
  const [hoveredProduct, setHoveredProduct] = useState(null);
  const [wishlist, setWishlist] = useState([]);
  const navigate = useNavigate();

  const toggleWishlist = (productId) => {
    setWishlist(prev => 
      prev.includes(productId) 
        ? prev.filter(id => id !== productId)
        : [...prev, productId]
    );
  };

  const handleProductClick = (productId) => {
    navigate(`/product/${productId}`);
  };

  const handleQuickView = (product, e) => {
    e.stopPropagation();
    // You can implement a quick view modal here
    alert(`Quick view: ${product.name}`);
  };

  const handleAddToCart = (product, e) => {
    e.stopPropagation();
    alert(`${product.name} added to cart!`);
  };

  return (
    <section className="py-16 bg-gradient-to-b from-white to-pink-50/30">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="section-title text-pink-600">Bestsellers</h2>
          <p className="section-subtitle">Our most loved pieces, chosen by thousands</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {products.map((product) => (
            <div
              key={product.id}
              className="group relative cursor-pointer"
              onMouseEnter={() => setHoveredProduct(product.id)}
              onMouseLeave={() => setHoveredProduct(null)}
              onClick={() => handleProductClick(product.id)}
            >
              <div className="relative h-80 rounded-lg overflow-hidden bg-gray-100">
                <div 
                  className="w-full h-full bg-cover bg-center transition-transform duration-500 group-hover:scale-105"
                  style={{ backgroundImage: `url(${product.image})` }}
                />
                
                {product.badge && (
                  <span className="absolute top-3 left-3 bg-gradient-to-r from-pink-500 to-rose-500 text-white text-xs px-2 py-1 rounded shadow-md">
                    {product.badge}
                  </span>
                )}

                {hoveredProduct === product.id && (
                  <div className="absolute inset-0 bg-black/40 flex items-center justify-center gap-3 transition-all">
                    <button 
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleWishlist(product.id);
                      }}
                      className="bg-white p-2 rounded-full hover:bg-pink-500 hover:text-white transition-colors shadow-md hover:shadow-pink-lg"
                    >
                      <Heart className={`w-5 h-5 ${wishlist.includes(product.id) ? 'fill-red-500 text-red-500' : ''}`} />
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
                <h3 className="font-semibold text-gray-900 mb-1 group-hover:text-pink-600 transition-colors">
                  {product.name}
                </h3>
                <div className="flex items-center justify-center gap-2 mb-2">
                  <span className="text-pink-600 font-bold">₹{product.price}</span>
                  <span className="text-gray-400 line-through text-sm">₹{product.originalPrice}</span>
                </div>
                <div className="flex items-center justify-center gap-1">
                  <Star className="w-4 h-4 fill-pink-500 text-pink-500" />
                  <span className="text-sm font-semibold">{product.rating}</span>
                  <span className="text-gray-400 text-sm">({product.reviews})</span>
                </div>
                <button 
                  onClick={(e) => handleAddToCart(product, e)}
                  className="mt-3 w-full bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600 text-white py-2 rounded-full transition-all duration-300 font-semibold shadow-md hover:shadow-pink-lg transform hover:scale-[1.02] active:scale-[0.98]"
                >
                  Add to Cart
                </button>
              </div>
            </div>
          ))}
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
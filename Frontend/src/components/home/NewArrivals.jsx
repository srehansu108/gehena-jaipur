// src/components/home/NewArrivals.jsx - PINK THEME ✅
import { Clock, Sparkles, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const newArrivals = [
  {
    id: 5,
    name: "Modern Art Pendant",
    price: "18,500",
    image: "/images/products/pendant-1.jpg",
    daysLeft: 5,
    badge: "New"
  },
  {
    id: 6,
    name: "Temple Jewellery Set",
    price: "95,000",
    image: "/images/products/set-1.jpg",
    daysLeft: 7,
    badge: "Trending"
  },
  {
    id: 7,
    name: "Rose Gold Bracelet",
    price: "32,000",
    image: "/images/products/bracelet-1.jpg",
    daysLeft: 3,
    badge: "Limited"
  },
  {
    id: 8,
    name: "Antique Necklace",
    price: "75,000",
    image: "/images/products/necklace-2.jpg",
    daysLeft: 10,
    badge: "Exclusive"
  }
];

export function NewArrivals() {
  const navigate = useNavigate();

  const handleProductClick = (productId) => {
    navigate(`/product/${productId}`);
  };

  // Get badge color based on type
  const getBadgeColor = (badge) => {
    switch(badge) {
      case 'New': return 'bg-gradient-to-r from-pink-500 to-rose-500';
      case 'Trending': return 'bg-gradient-to-r from-rose-500 to-blush-500';
      case 'Limited': return 'bg-gradient-to-r from-crimson-500 to-rose-500';
      case 'Exclusive': return 'bg-gradient-to-r from-gold-500 to-pink-500';
      default: return 'bg-gradient-to-r from-pink-500 to-rose-500';
    }
  };

  return (
    <section className="py-16 bg-gradient-to-b from-pink-50/30 to-white">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <div className="flex items-center justify-center gap-3 mb-3">
            <span className="w-12 h-0.5 bg-gradient-to-r from-pink-300 to-pink-500"></span>
            <Sparkles className="w-5 h-5 text-pink-500 animate-pulse" />
            <span className="text-pink-600 font-semibold text-sm tracking-wider uppercase">Fresh Collection</span>
            <span className="w-12 h-0.5 bg-gradient-to-r from-pink-500 to-pink-300"></span>
          </div>
          <h2 className="section-title text-gray-900">
            New <span className="text-pink-gradient">Arrivals</span>
          </h2>
          <p className="section-subtitle text-gray-500">
            Fresh designs just for you ✨
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {newArrivals.map((item) => (
            <div 
              key={item.id} 
              className="bg-white rounded-2xl overflow-hidden shadow-md hover:shadow-pink-lg transition-all duration-500 group cursor-pointer hover:-translate-y-1"
              onClick={() => handleProductClick(item.id)}
            >
              <div className="relative h-72 overflow-hidden">
                <img 
                  src={item.image} 
                  alt={item.name}
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                />
                
                {/* Badge */}
                <div className={`absolute top-3 left-3 ${getBadgeColor(item.badge)} text-white text-xs px-3 py-1 rounded-full shadow-md flex items-center gap-1`}>
                  <Sparkles className="w-3 h-3" />
                  {item.badge}
                </div>

                {/* Days Left Badge - Pink themed */}
                <div className="absolute top-3 right-3 bg-gradient-to-r from-pink-500 to-rose-500 text-white text-xs px-3 py-1 rounded-full shadow-md flex items-center gap-1">
                  <Clock className="w-3 h-3 animate-pulse" />
                  {item.daysLeft} days left
                </div>

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
                  <p className="text-pink-600 font-bold text-lg">₹{item.price}</p>
                  <button 
                    onClick={(e) => {
                      e.stopPropagation();
                      alert(`${item.name} added to cart!`);
                    }}
                    className="text-pink-500 hover:text-pink-600 transition-colors duration-300 opacity-0 group-hover:opacity-100 transform translate-x-2 group-hover:translate-x-0 transition-all duration-300"
                  >
                    <ArrowRight className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </div>
          ))}
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
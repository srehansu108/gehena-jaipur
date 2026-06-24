// src/components/home/CategoryGrid.jsx - PINK THEME ✅
import { ChevronRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const categories = [
  {
    id: 1,
    name: "Rings",
    image: "/images/categories/ring.jpg",
    count: "500+ Designs",
    color: "from-pink-500",
    hoverColor: "hover:from-pink-600",
    slug: "rings"
  },
  {
    id: 2,
    name: "Necklaces",
    image: "/images/categories/necklese.jpg",
    count: "300+ Designs",
    color: "from-rose-500",
    hoverColor: "hover:from-rose-600",
    slug: "necklaces"
  },
  {
    id: 3,
    name: "Earrings",
    image: "/images/categories/earrings.jpg",
    count: "600+ Designs",
    color: "from-hotPink-500",
    hoverColor: "hover:from-hotPink-600",
    slug: "earrings"
  },
  {
    id: 4,
    name: "Bangles",
    image: "/images/categories/bangles.jpg",
    count: "400+ Designs",
    color: "from-blush-500",
    hoverColor: "hover:from-blush-600",
    slug: "bangles"
  },
  {
    id: 5,
    name: "Pendants",
    image: "/images/categories/pendents.jpg",
    count: "350+ Designs",
    color: "from-rose-400",
    hoverColor: "hover:from-rose-500",
    slug: "pendants"
  },
  {
    id: 6,
    name: "Mangalsutra",
    image: "/images/categories/mangalsutra.png",
    count: "200+ Designs",
    color: "from-crimson-500",
    hoverColor: "hover:from-crimson-600",
    slug: "mangalsutra"
  }
];

export function CategoryGrid() {
  const navigate = useNavigate();

  const handleCategoryClick = (categorySlug) => {
    navigate(`/category/${categorySlug}`);
  };

  return (
    <section className="py-16 bg-gradient-to-b from-pink-50/30 to-white">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <div className="flex items-center justify-center gap-3 mb-3">
            <span className="w-12 h-0.5 bg-gradient-to-r from-pink-300 to-pink-500"></span>
            <span className="text-pink-600 font-semibold text-sm tracking-wider uppercase">Collections</span>
            <span className="w-12 h-0.5 bg-gradient-to-r from-pink-500 to-pink-300"></span>
          </div>
          <h2 className="section-title text-gray-900">
            Shop by <span className="text-pink-gradient">Category</span>
          </h2>
          <p className="section-subtitle text-gray-500">
            Explore our exquisite collection of handcrafted jewellery
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {categories.map((category) => (
            <div
              key={category.id}
              className="group relative overflow-hidden rounded-2xl cursor-pointer shadow-md hover:shadow-pink-xl transition-all duration-500"
              onClick={() => handleCategoryClick(category.slug)}
            >
              <div 
                className="relative h-80 w-full bg-cover bg-center transition-transform duration-700 group-hover:scale-110"
                style={{ backgroundImage: `url(${category.image})` }}
              >
                {/* Gradient overlay - Pink themed */}
                <div className={`absolute inset-0 bg-gradient-to-t ${category.color} to-transparent opacity-70 group-hover:opacity-80 transition-opacity duration-500`} />
                
                {/* Shimmer effect on hover */}
                <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -skew-x-12 animate-shimmer" />
                </div>
              </div>
              
              <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
                <h3 className="text-2xl font-serif mb-1 group-hover:scale-105 transition-transform duration-300 origin-left">
                  {category.name}
                </h3>
                <p className="text-sm opacity-90 mb-3">{category.count}</p>
                <button className="flex items-center gap-2 text-sm font-semibold group-hover:gap-3 transition-all duration-300 bg-white/20 backdrop-blur-sm px-4 py-2 rounded-full hover:bg-white/30">
                  Shop Now <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform duration-300" />
                </button>
              </div>

              {/* Decorative corner accent */}
              <div className="absolute top-0 right-0 w-16 h-16 bg-gradient-to-br from-white/10 to-transparent rounded-bl-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            </div>
          ))}
        </div>

        {/* View All Categories Button */}
        <div className="text-center mt-12">
          <button 
            onClick={() => navigate('/products')}
            className="group inline-flex items-center gap-2 px-8 py-3 bg-gradient-to-r from-pink-500 to-rose-500 text-white rounded-full font-semibold transition-all duration-300 shadow-md hover:shadow-pink-lg transform hover:scale-[1.02] active:scale-[0.98]"
          >
            <span>View All Categories</span>
            <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform duration-300" />
          </button>
        </div>
      </div>
    </section>
  );
}
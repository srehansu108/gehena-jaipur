import { useEffect, useState } from 'react';
import { ChevronRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { categoryApi } from '../../api/categoryApi';

/* Fallback — shown only if API fails
const FALLBACK_CATEGORIES = [
  { _id: 'fb1', name: 'Rings',     slug: 'rings',     count: '500+ Designs', image: { url: '/images/categories/ring.jpg' },       color: 'from-pink-500',     hoverColor: 'hover:from-pink-600' },
  { _id: 'fb2', name: 'Necklaces', slug: 'necklaces', count: '300+ Designs', image: { url: '/images/categories/necklese.jpg' },   color: 'from-rose-500',     hoverColor: 'hover:from-rose-600' },
  { _id: 'fb3', name: 'Earrings',  slug: 'earrings',  count: '600+ Designs', image: { url: '/images/categories/earrings.jpg' },   color: 'from-pink-500',     hoverColor: 'hover:from-pink-600' },
  { _id: 'fb4', name: 'Bangles',   slug: 'bangles',   count: '400+ Designs', image: { url: '/images/categories/bangles.jpg' },    color: 'from-pink-400',     hoverColor: 'hover:from-pink-500' },
  { _id: 'fb5', name: 'Pendants',  slug: 'pendants',  count: '350+ Designs', image: { url: '/images/categories/pendents.jpg' },   color: 'from-rose-400',     hoverColor: 'hover:from-rose-500' },
  { _id: 'fb6', name: 'Mangalsutra', slug: 'mangalsutra', count: '200+ Designs', image: { url: '/images/categories/mangalsutra.png' }, color: 'from-rose-500', hoverColor: 'hover:from-rose-600' },
];*/

export function CategoryGrid() {
  const navigate = useNavigate();
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let alive = true;

    (async () => {
      try {
        const data = await categoryApi.getActive();
        if (!alive) return;

        if (Array.isArray(data) && data.length > 0) {
          setCategories(data);
        } else {
          console.warn('⚠️ No categories returned — using fallback');
          setCategories(FALLBACK_CATEGORIES);
        }
      } catch (err) {
        console.error('❌ Failed to fetch categories:', err);
        if (alive) setCategories(FALLBACK_CATEGORIES);
      } finally {
        if (alive) setLoading(false);
      }
    })();

    return () => { alive = false; };
  }, []);

  if (loading) {
    return (
      <section className="py-16 bg-gradient-to-b from-pink-50/30 to-white">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <div className="h-4 w-32 bg-pink-100 rounded mx-auto mb-3 animate-pulse" />
            <div className="h-8 w-64 bg-pink-100 rounded mx-auto mb-3 animate-pulse" />
            <div className="h-4 w-80 bg-pink-100 rounded mx-auto animate-pulse" />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="h-80 rounded-2xl bg-pink-50 animate-pulse" />
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
            <span className="text-pink-600 font-semibold text-sm tracking-wider uppercase">Collections</span>
            <span className="w-12 h-0.5 bg-gradient-to-r from-pink-500 to-pink-300" />
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
              key={category._id}
              className="group relative overflow-hidden rounded-2xl cursor-pointer shadow-md hover:shadow-pink-xl transition-all duration-500"
              onClick={() => navigate(`/category/${category.slug}`)}
            >
              <div
                className="relative h-80 w-full bg-cover bg-center transition-transform duration-700 group-hover:scale-110"
                style={{ backgroundImage: `url(${category.image?.url || category.image})` }}
              >
                <div className={`absolute inset-0 bg-gradient-to-t ${category.color || 'from-pink-500'} to-transparent opacity-70 group-hover:opacity-80 transition-opacity duration-500`} />

                <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -skew-x-12 animate-shimmer" />
                </div>
              </div>

              <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
                <h3 className="text-2xl font-serif mb-1 group-hover:scale-105 transition-transform duration-300 origin-left">
                  {category.name}
                </h3>
                {category.count && <p className="text-sm opacity-90 mb-3">{category.count}</p>}
                <button className="flex items-center gap-2 text-sm font-semibold group-hover:gap-3 transition-all duration-300 bg-white/20 backdrop-blur-sm px-4 py-2 rounded-full hover:bg-white/30">
                  Shop Now <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform duration-300" />
                </button>
              </div>

              <div className="absolute top-0 right-0 w-16 h-16 bg-gradient-to-br from-white/10 to-transparent rounded-bl-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            </div>
          ))}
        </div>

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
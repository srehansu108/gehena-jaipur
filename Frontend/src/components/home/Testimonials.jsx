import { useState, useEffect, useCallback } from 'react';
import { Star, ChevronLeft, ChevronRight, Quote, Sparkles, Heart } from 'lucide-react';
import { testimonialApi } from '../../api/testimonialApi';

// Fallback — shown only if API fails
/*const FALLBACK_TESTIMONIALS = [
  {
    _id: 'fb1',
    name: 'Priya Sharma',
    location: 'Mumbai, India',
    rating: 5,
    text: 'Absolutely stunning craftsmanship! The diamond necklace exceeded my expectations.',
    image: { url: '/images/testimonials/customer1.jpg' },
    piece: 'Diamond Necklace',
    date: 'December 2024',
  },
  {
    _id: 'fb2',
    name: 'Aditya Mehta',
    location: 'Delhi, India',
    rating: 5,
    text: 'Best online jewelry shopping experience ever! Highly recommended.',
    image: { url: '/images/testimonials/customer2.png' },
    piece: 'Jadau Earrings Set',
    date: 'January 2025',
  },
  {
    _id: 'fb3',
    name: 'Neha Gupta',
    location: 'Bangalore, India',
    rating: 5,
    text: 'My wedding mangalsutra from here is absolutely perfect. Thank you!',
    image: { url: '/images/testimonials/customer3.jpg' },
    piece: 'Mangalsutra',
    date: 'February 2025',
  },
];*/

export function Testimonials() {
  const [testimonials, setTestimonials] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [autoplay, setAutoplay] = useState(true);

  // ---------- Fetch from API ----------
  useEffect(() => {
    let alive = true;

    (async () => {
      try {
        const data = await testimonialApi.getActive();
        if (!alive) return;

        if (Array.isArray(data) && data.length > 0) {
          setTestimonials(data);
        } else {
          console.warn('⚠️ No testimonials returned — using fallback');
          setTestimonials(FALLBACK_TESTIMONIALS);
        }
      } catch (err) {
        console.error('❌ Failed to fetch testimonials:', err);
        if (alive) setTestimonials(FALLBACK_TESTIMONIALS);
      } finally {
        if (alive) setLoading(false);
      }
    })();

    return () => { alive = false; };
  }, []);

  const totalSlides = testimonials.length;

  // ---------- Autoplay ----------
  useEffect(() => {
    if (!autoplay || totalSlides <= 1) return;

    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % totalSlides);
    }, 5000);

    return () => clearInterval(interval);
  }, [autoplay, totalSlides]);

  // ---------- Reset index if list changes ----------
  useEffect(() => {
    if (currentIndex >= totalSlides && totalSlides > 0) {
      setCurrentIndex(0);
    }
  }, [totalSlides, currentIndex]);

  const goToPrevious = useCallback(() => {
    if (!totalSlides) return;
    setAutoplay(false);
    setCurrentIndex((prev) => (prev - 1 + totalSlides) % totalSlides);
    setTimeout(() => setAutoplay(true), 10000);
  }, [totalSlides]);

  const goToNext = useCallback(() => {
    if (!totalSlides) return;
    setAutoplay(false);
    setCurrentIndex((prev) => (prev + 1) % totalSlides);
    setTimeout(() => setAutoplay(true), 10000);
  }, [totalSlides]);

  const goToSlide = (index) => {
    setAutoplay(false);
    setCurrentIndex(index);
    setTimeout(() => setAutoplay(true), 10000);
  };

  const renderStars = (rating) => {
    return Array.from({ length: 5 }).map((_, index) => (
      <Star
        key={index}
        className={`w-4 h-4 ${index < rating ? 'fill-pink-500 text-pink-500' : 'text-gray-300'}`}
      />
    ));
  };

  // ---------- Loading skeleton ----------
  if (loading || !testimonials[currentIndex]) {
    return (
      <section className="py-16 md:py-24 bg-gradient-to-b from-pink-50/30 via-white to-pink-50/20">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <div className="h-4 w-40 bg-pink-100 rounded mx-auto mb-3 animate-pulse" />
            <div className="h-8 w-72 bg-pink-100 rounded mx-auto mb-4 animate-pulse" />
            <div className="h-4 w-96 bg-pink-100 rounded mx-auto animate-pulse" />
          </div>
          <div className="max-w-5xl mx-auto h-80 bg-pink-50 rounded-2xl animate-pulse" />
        </div>
      </section>
    );
  }

  const current = testimonials[currentIndex];
  const imageUrl = current.image?.url || current.image || '';

  return (
    <section className="py-16 md:py-24 bg-gradient-to-b from-pink-50/30 via-white to-pink-50/20">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-12 md:mb-16">
          <div className="flex items-center justify-center gap-3 mb-3">
            <span className="w-12 h-0.5 bg-gradient-to-r from-pink-300 to-pink-500" />
            <Heart className="w-5 h-5 text-pink-500 animate-pulse" />
            <span className="text-pink-600 font-semibold text-sm tracking-wider uppercase">Testimonials</span>
            <span className="w-12 h-0.5 bg-gradient-to-r from-pink-500 to-pink-300" />
          </div>
          <h2 className="section-title text-gray-900">
            What Our <span className="text-pink-gradient">Customers Say</span>
          </h2>
          <div className="w-20 h-0.5 bg-gradient-to-r from-pink-400 to-rose-400 mx-auto my-4" />
          <p className="section-subtitle text-gray-500 text-base md:text-lg">
            Real stories from our cherished customers who found their perfect jewelry pieces
          </p>
        </div>

        {/* Main Testimonial Slider */}
        <div className="relative max-w-5xl mx-auto">
          {/* Decorative quotes */}
          <div className="absolute -top-8 -left-4 md:-left-8 opacity-5 z-0">
            <Quote className="w-20 h-20 md:w-32 md:h-32 text-pink-500" />
          </div>
          <div className="absolute -bottom-8 -right-4 md:-right-8 opacity-5 z-0 transform rotate-180">
            <Quote className="w-20 h-20 md:w-32 md:h-32 text-pink-500" />
          </div>

          {/* Card */}
          <div
            key={current._id}
            className="relative z-10 bg-white/80 backdrop-blur-sm rounded-2xl shadow-pink-lg p-6 md:p-10 mx-4 md:mx-8 border border-pink-100/50 hover:border-pink-200 transition-all duration-500"
          >
            <div className="absolute top-0 left-0 w-20 h-20 bg-gradient-to-br from-pink-100/50 to-transparent rounded-tl-2xl pointer-events-none" />
            <div className="absolute bottom-0 right-0 w-20 h-20 bg-gradient-to-tl from-pink-100/50 to-transparent rounded-br-2xl pointer-events-none" />

            <div className="flex flex-col items-center text-center relative">
              {/* Avatar */}
              <div className="w-20 h-20 md:w-24 md:h-24 rounded-full bg-gradient-to-br from-pink-400 to-rose-500 p-0.5 mb-4 shadow-md hover:shadow-pink-lg transition-all duration-300">
                <div className="w-full h-full rounded-full bg-white flex items-center justify-center overflow-hidden">
                  {imageUrl ? (
                    <img
                      src={imageUrl}
                      alt={current.name}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        e.currentTarget.style.display = 'none';
                        e.currentTarget.parentElement.innerHTML =
                          `<span class="text-3xl font-serif text-pink-600">${current.name.charAt(0)}</span>`;
                      }}
                    />
                  ) : (
                    <span className="text-3xl font-serif text-pink-600">
                      {current.name.charAt(0)}
                    </span>
                  )}
                </div>
              </div>

              {/* Stars */}
              <div className="flex gap-1 mb-4">{renderStars(current.rating)}</div>

              {/* Text */}
              <p className="text-gray-700 text-base md:text-lg leading-relaxed mb-6 italic max-w-2xl">
                "{current.text}"
              </p>

              {/* Name / Location */}
              <div className="mb-2">
                <h4 className="font-serif text-xl font-semibold text-gray-900">
                  {current.name}
                </h4>
                {current.location && (
                  <p className="text-sm text-gray-500 mt-1">{current.location}</p>
                )}
              </div>

              {/* Piece + Date */}
              {(current.piece || current.date) && (
                <div className="flex flex-wrap items-center justify-center gap-3 mt-3">
                  {current.piece && (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-gradient-to-r from-pink-50 to-rose-50 text-pink-700 text-xs font-medium rounded-full border border-pink-100">
                      <span className="w-1.5 h-1.5 bg-pink-500 rounded-full animate-pulse" />
                      {current.piece}
                    </span>
                  )}
                  {current.date && (
                    <span className="text-xs text-gray-400">{current.date}</span>
                  )}
                </div>
              )}

              {/* Sparkles */}
              <Sparkles className="absolute -top-2 -right-2 w-4 h-4 text-pink-300/30 animate-float" />
              <Sparkles
                className="absolute -bottom-2 -left-2 w-3 h-3 text-pink-300/20 animate-float"
                style={{ animationDelay: '1s' }}
              />
            </div>
          </div>

          {/* Nav Buttons */}
          {totalSlides > 1 && (
            <>
              <button
                onClick={goToPrevious}
                aria-label="Previous testimonial"
                className="absolute left-0 top-1/2 -translate-y-1/2 -ml-2 md:-ml-6 w-10 h-10 bg-white/90 backdrop-blur-sm rounded-full shadow-lg flex items-center justify-center hover:bg-pink-50 hover:shadow-pink-lg hover:scale-110 transition-all duration-300 z-20 border border-pink-100"
              >
                <ChevronLeft className="w-5 h-5 text-pink-600" />
              </button>
              <button
                onClick={goToNext}
                aria-label="Next testimonial"
                className="absolute right-0 top-1/2 -translate-y-1/2 -mr-2 md:-mr-6 w-10 h-10 bg-white/90 backdrop-blur-sm rounded-full shadow-lg flex items-center justify-center hover:bg-pink-50 hover:shadow-pink-lg hover:scale-110 transition-all duration-300 z-20 border border-pink-100"
              >
                <ChevronRight className="w-5 h-5 text-pink-600" />
              </button>

              {/* Dots */}
              <div className="flex justify-center gap-2 mt-8">
                {testimonials.map((t, index) => (
                  <button
                    key={t._id}
                    onClick={() => goToSlide(index)}
                    aria-label={`Go to testimonial ${index + 1}`}
                    className={`transition-all duration-300 ${
                      currentIndex === index
                        ? 'w-8 h-2.5 bg-gradient-to-r from-pink-500 to-rose-500 rounded-full shadow-md'
                        : 'w-2.5 h-2.5 bg-gray-300 rounded-full hover:bg-pink-400'
                    }`}
                  />
                ))}
              </div>
            </>
          )}
        </div>

        {/* Trust badges — unchanged */}
        <div className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-6 max-w-4xl mx-auto">
          {/* ... keep the original trust badges block as-is ... */}
        </div>
      </div>

      {/* CSS animations — same as before */}
      <style jsx>{`
        @keyframes fadeIn { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes float { 0%, 100% { transform: translateY(0px) rotate(0deg); } 50% { transform: translateY(-5px) rotate(5deg); } }
        @keyframes pulse { 0%, 100% { transform: scale(1); } 50% { transform: scale(1.1); } }
        .animate-fadeIn { animation: fadeIn 0.5s ease-out; }
        .animate-float { animation: float 3s ease-in-out infinite; }
        .animate-pulse { animation: pulse 2s ease-in-out infinite; }
      `}</style>
    </section>
  );
}
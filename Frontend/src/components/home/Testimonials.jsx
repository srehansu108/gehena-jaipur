// src/components/Testimonials.jsx - PINK THEME ✅
import { useState, useEffect } from 'react';
import { Star, ChevronLeft, ChevronRight, Quote, Sparkles, Heart } from 'lucide-react';

export function Testimonials() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [autoplay, setAutoplay] = useState(true);

  const testimonials = [
    {
      id: 1,
      name: "Priya Sharma",
      location: "Mumbai, India",
      rating: 5,
      text: "Absolutely stunning craftsmanship! The diamond necklace I purchased exceeded my expectations. The sparkle and quality are truly exceptional. Will definitely shop here again for my wedding jewelry.",
      image: "/images/testimonials/customer1.jpg",
      piece: "Diamond Necklace",
      date: "December 2024"
    },
    {
      id: 2,
      name: "Aditya Mehta",
      location: "Delhi, India",
      rating: 5,
      text: "Best online jewelry shopping experience ever! The attention to detail in the Jadau set is remarkable. Customer service was outstanding and delivery was prompt. Highly recommended!",
      image: "/images/testimonials/customer2.png",
      piece: "Jadau Earrings Set",
      date: "January 2025"
    },
    {
      id: 3,
      name: "Neha Gupta",
      location: "Bangalore, India",
      rating: 5,
      text: "I bought my wedding mangalsutra from here and it's absolutely perfect. The gold purity is certified and the design is unique. Thank you for making my special day even more memorable.",
      image: "/images/testimonials/customer3.jpg",
      piece: "Mangalsutra",
      date: "February 2025"
    },
    {
      id: 4,
      name: "Rahul Kapoor",
      location: "Jaipur, India",
      rating: 4,
      text: "Great collection of silver jewelry. The Turkish jewelry line is fantastic. Very reasonable prices and excellent quality. Will definitely recommend to friends and family.",
      image: "/images/testimonials/customer4.jpg",
      piece: "Silver Bracelet",
      date: "March 2025"
    },
    {
      id: 5,
      name: "Anjali Singh",
      location: "Chennai, India",
      rating: 5,
      text: "The gemstone earrings I ordered are breathtaking! The colors are vibrant and the setting is secure. Shipping was faster than expected. Very happy with my purchase.",
      image: "/images/testimonials/customer5.jpg",
      piece: "Gemstone Earrings",
      date: "March 2025"
    }
  ];

  const totalSlides = testimonials.length;

  useEffect(() => {
    let interval;
    if (autoplay) {
      interval = setInterval(() => {
        setCurrentIndex((prevIndex) => (prevIndex + 1) % totalSlides);
      }, 5000);
    }
    return () => clearInterval(interval);
  }, [autoplay, totalSlides]);

  const goToPrevious = () => {
    setAutoplay(false);
    setCurrentIndex((prevIndex) => (prevIndex - 1 + totalSlides) % totalSlides);
    setTimeout(() => setAutoplay(true), 10000);
  };

  const goToNext = () => {
    setAutoplay(false);
    setCurrentIndex((prevIndex) => (prevIndex + 1) % totalSlides);
    setTimeout(() => setAutoplay(true), 10000);
  };

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

  return (
    <section className="py-16 md:py-24 bg-gradient-to-b from-pink-50/30 via-white to-pink-50/20">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-12 md:mb-16">
          <div className="flex items-center justify-center gap-3 mb-3">
            <span className="w-12 h-0.5 bg-gradient-to-r from-pink-300 to-pink-500"></span>
            <Heart className="w-5 h-5 text-pink-500 animate-pulse" />
            <span className="text-pink-600 font-semibold text-sm tracking-wider uppercase">Testimonials</span>
            <span className="w-12 h-0.5 bg-gradient-to-r from-pink-500 to-pink-300"></span>
          </div>
          <h2 className="section-title text-gray-900">
            What Our <span className="text-pink-gradient">Customers Say</span>
          </h2>
          <div className="w-20 h-0.5 bg-gradient-to-r from-pink-400 to-rose-400 mx-auto my-4"></div>
          <p className="section-subtitle text-gray-500 text-base md:text-lg">
            Real stories from our cherished customers who found their perfect jewelry pieces
          </p>
        </div>

        {/* Main Testimonial Slider */}
        <div className="relative max-w-5xl mx-auto">
          {/* Decorative Quote Icon */}
          <div className="absolute -top-8 -left-4 md:-left-8 opacity-5 z-0">
            <Quote className="w-20 h-20 md:w-32 md:h-32 text-pink-500" />
          </div>
          
          <div className="absolute -bottom-8 -right-4 md:-right-8 opacity-5 z-0 transform rotate-180">
            <Quote className="w-20 h-20 md:w-32 md:h-32 text-pink-500" />
          </div>

          {/* Testimonial Card */}
          <div className="relative z-10 bg-white/80 backdrop-blur-sm rounded-2xl shadow-pink-lg p-6 md:p-10 mx-4 md:mx-8 animate-fadeIn border border-pink-100/50 hover:border-pink-200 transition-all duration-500">
            {/* Decorative corner accents */}
            <div className="absolute top-0 left-0 w-20 h-20 bg-gradient-to-br from-pink-100/50 to-transparent rounded-tl-2xl pointer-events-none" />
            <div className="absolute bottom-0 right-0 w-20 h-20 bg-gradient-to-tl from-pink-100/50 to-transparent rounded-br-2xl pointer-events-none" />
            
            <div className="flex flex-col items-center text-center relative">
              {/* Customer Avatar with Pink Ring */}
              <div className="w-20 h-20 md:w-24 md:h-24 rounded-full bg-gradient-to-br from-pink-400 to-rose-500 p-0.5 mb-4 shadow-md hover:shadow-pink-lg transition-all duration-300">
                <div className="w-full h-full rounded-full bg-white flex items-center justify-center overflow-hidden">
                  {testimonials[currentIndex].image ? (
                    <img 
                      src={testimonials[currentIndex].image} 
                      alt={testimonials[currentIndex].name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <span className="text-3xl font-serif text-pink-600">
                      {testimonials[currentIndex].name.charAt(0)}
                    </span>
                  )}
                </div>
              </div>

              {/* Rating Stars - Pink */}
              <div className="flex gap-1 mb-4">
                {renderStars(testimonials[currentIndex].rating)}
              </div>

              {/* Testimonial Text */}
              <p className="text-gray-700 text-base md:text-lg leading-relaxed mb-6 italic max-w-2xl">
                "{testimonials[currentIndex].text}"
              </p>

              {/* Customer Info */}
              <div className="mb-2">
                <h4 className="font-serif text-xl font-semibold text-gray-900">
                  {testimonials[currentIndex].name}
                </h4>
                <p className="text-sm text-gray-500 mt-1">
                  {testimonials[currentIndex].location}
                </p>
              </div>

              {/* Jewelry Piece & Date - Pink themed */}
              <div className="flex flex-wrap items-center justify-center gap-3 mt-3">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-gradient-to-r from-pink-50 to-rose-50 text-pink-700 text-xs font-medium rounded-full border border-pink-100">
                  <span className="w-1.5 h-1.5 bg-pink-500 rounded-full animate-pulse"></span>
                  {testimonials[currentIndex].piece}
                </span>
                <span className="text-xs text-gray-400">
                  {testimonials[currentIndex].date}
                </span>
              </div>

              {/* Small sparkle decoration */}
              <Sparkles className="absolute -top-2 -right-2 w-4 h-4 text-pink-300/30 animate-float" />
              <Sparkles className="absolute -bottom-2 -left-2 w-3 h-3 text-pink-300/20 animate-float" style={{ animationDelay: '1s' }} />
            </div>
          </div>

          {/* Navigation Buttons - Pink */}
          <button
            onClick={goToPrevious}
            className="absolute left-0 top-1/2 -translate-y-1/2 -ml-2 md:-ml-6 w-10 h-10 bg-white/90 backdrop-blur-sm rounded-full shadow-lg flex items-center justify-center hover:bg-pink-50 hover:shadow-pink-lg hover:scale-110 transition-all duration-300 z-20 border border-pink-100"
          >
            <ChevronLeft className="w-5 h-5 text-pink-600" />
          </button>

          <button
            onClick={goToNext}
            className="absolute right-0 top-1/2 -translate-y-1/2 -mr-2 md:-mr-6 w-10 h-10 bg-white/90 backdrop-blur-sm rounded-full shadow-lg flex items-center justify-center hover:bg-pink-50 hover:shadow-pink-lg hover:scale-110 transition-all duration-300 z-20 border border-pink-100"
          >
            <ChevronRight className="w-5 h-5 text-pink-600" />
          </button>

          {/* Dots Indicator - Pink */}
          <div className="flex justify-center gap-2 mt-8">
            {testimonials.map((_, index) => (
              <button
                key={index}
                onClick={() => goToSlide(index)}
                className={`transition-all duration-300 ${
                  currentIndex === index
                    ? 'w-8 h-2.5 bg-gradient-to-r from-pink-500 to-rose-500 rounded-full shadow-md'
                    : 'w-2.5 h-2.5 bg-gray-300 rounded-full hover:bg-pink-400'
                }`}
              />
            ))}
          </div>
        </div>

        {/* Trust Badges - Pink Theme */}
        <div className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-6 max-w-4xl mx-auto">
          <div className="text-center p-4 rounded-xl bg-white/50 backdrop-blur-sm border border-pink-100/50 hover:border-pink-200 hover:shadow-pink-md transition-all duration-300 group">
            <div className="text-2xl mb-2 group-hover:scale-110 transition-transform duration-300">💎</div>
            <p className="text-sm font-semibold text-gray-800 group-hover:text-pink-600 transition-colors duration-300">100% Certified</p>
            <p className="text-xs text-gray-500">Hallmarked Jewelry</p>
          </div>
          <div className="text-center p-4 rounded-xl bg-white/50 backdrop-blur-sm border border-pink-100/50 hover:border-pink-200 hover:shadow-pink-md transition-all duration-300 group">
            <div className="text-2xl mb-2 group-hover:scale-110 transition-transform duration-300">🚚</div>
            <p className="text-sm font-semibold text-gray-800 group-hover:text-pink-600 transition-colors duration-300">Free Shipping</p>
            <p className="text-xs text-gray-500">On orders ₹50,000+</p>
          </div>
          <div className="text-center p-4 rounded-xl bg-white/50 backdrop-blur-sm border border-pink-100/50 hover:border-pink-200 hover:shadow-pink-md transition-all duration-300 group">
            <div className="text-2xl mb-2 group-hover:scale-110 transition-transform duration-300">⭐</div>
            <p className="text-sm font-semibold text-gray-800 group-hover:text-pink-600 transition-colors duration-300">4.8 Rating</p>
            <p className="text-xs text-gray-500">From 10,000+ reviews</p>
          </div>
          <div className="text-center p-4 rounded-xl bg-white/50 backdrop-blur-sm border border-pink-100/50 hover:border-pink-200 hover:shadow-pink-md transition-all duration-300 group">
            <div className="text-2xl mb-2 group-hover:scale-110 transition-transform duration-300">🔄</div>
            <p className="text-sm font-semibold text-gray-800 group-hover:text-pink-600 transition-colors duration-300">30-Day Returns</p>
            <p className="text-xs text-gray-500">Hassle-free exchange</p>
          </div>
        </div>
      </div>

      {/* CSS Animations */}
      <style jsx>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        @keyframes float {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          50% { transform: translateY(-5px) rotate(5deg); }
        }
        
        @keyframes pulse {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.1); }
        }
        
        .animate-fadeIn {
          animation: fadeIn 0.5s ease-out;
        }
        
        .animate-float {
          animation: float 3s ease-in-out infinite;
        }
        
        .animate-pulse {
          animation: pulse 2s ease-in-out infinite;
        }
      `}</style>
    </section>
  );
}
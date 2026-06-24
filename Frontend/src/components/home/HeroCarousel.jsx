// src/components/home/HeroCarousel.jsx - PINK THEME ✅
import { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const slides = [
  {
    id: 1,
    title: "Eternal Elegance",
    subtitle: "Discover Our Diamond Collection",
    description: "Handcrafted diamonds that tell your unique story",
    cta: "Shop Now",
    link: "/category/rings",
    image: "/images/hero/1.jpg",
    bgColor: "from-pink-50/90 to-rose-50/90",
    accentColor: "pink"
  },
  {
    id: 2,
    title: "Wedding Season",
    subtitle: "Bridal Jewellery Special",
    description: "Make your D-day unforgettable with our exclusive bridal collection",
    cta: "Explore Bridal",
    link: "/category/sets",
    image: "/images/hero/2.jpg",
    bgColor: "from-rose-50/90 to-pink-50/90",
    accentColor: "rose"
  },
  {
    id: 3,
    title: "Gold Festival",
    subtitle: "Up to 40% Off",
    description: "Exquisite gold jewellery for every occasion",
    cta: "Shop Gold",
    link: "/category/necklaces",
    image: "/images/hero/3.jpg",
    bgColor: "from-blush-50/90 to-pink-50/90",
    accentColor: "blush"
  }
];

export function HeroCarousel() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const navigate = useNavigate();

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % slides.length);
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  const prevSlide = () => {
    setCurrentIndex((prev) => (prev - 1 + slides.length) % slides.length);
  };

  const nextSlide = () => {
    setCurrentIndex((prev) => (prev + 1) % slides.length);
  };

  const handleCTAClick = (link) => {
    navigate(link);
  };

  const currentSlide = slides[currentIndex];

  // Get accent color based on slide
  const getAccentColor = (accent) => {
    switch(accent) {
      case 'pink': return 'from-pink-500 to-rose-500';
      case 'rose': return 'from-rose-500 to-pink-500';
      case 'blush': return 'from-blush-500 to-pink-500';
      default: return 'from-pink-500 to-rose-500';
    }
  };

  const getTextColor = (accent) => {
    switch(accent) {
      case 'pink': return 'text-pink-600';
      case 'rose': return 'text-rose-600';
      case 'blush': return 'text-blush-600';
      default: return 'text-pink-600';
    }
  };

  const getDotColor = (accent) => {
    switch(accent) {
      case 'pink': return 'bg-pink-500';
      case 'rose': return 'bg-rose-500';
      case 'blush': return 'bg-blush-500';
      default: return 'bg-pink-500';
    }
  };

  return (
    <section className="relative h-[70vh] md:h-[80vh] lg:h-screen overflow-hidden">
      {/* Background Image */}
      <div 
        className="absolute inset-0 bg-cover bg-center bg-no-repeat transition-transform duration-1000 scale-105 group-hover:scale-100"
        style={{ backgroundImage: `url(${currentSlide.image})` }}
      >
        {/* Pink gradient overlay */}
        <div className={`absolute inset-0 bg-gradient-to-r ${currentSlide.bgColor} backdrop-blur-sm`} />
        
        {/* Decorative pink overlay pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 right-0 w-96 h-96 bg-pink-300 rounded-full blur-3xl -mr-48 -mt-48" />
          <div className="absolute bottom-0 left-0 w-96 h-96 bg-rose-300 rounded-full blur-3xl -ml-48 -mb-48" />
        </div>
      </div>

      {/* Content */}
      <div className="relative h-full flex items-center">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-2xl text-center md:text-left">
            {/* Decorative line */}
            <div className="flex items-center gap-3 mb-4 justify-center md:justify-start">
              <span className="w-8 h-0.5 bg-gradient-to-r from-pink-500 to-rose-500"></span>
              <p className={`${getTextColor(currentSlide.accentColor)} font-semibold text-sm md:text-base uppercase tracking-wider`}>
                {currentSlide.subtitle}
              </p>
              <span className="w-8 h-0.5 bg-gradient-to-r from-rose-500 to-pink-500"></span>
            </div>
            
            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-7xl font-serif text-gray-900 mb-4 leading-tight">
              {currentSlide.title}
            </h1>
            
            <p className="text-gray-700 text-base md:text-lg mb-6 md:mb-8 leading-relaxed">
              {currentSlide.description}
            </p>
            
            <button 
              onClick={() => handleCTAClick(currentSlide.link)}
              className={`bg-gradient-to-r ${getAccentColor(currentSlide.accentColor)} hover:shadow-pink-lg text-white px-8 md:px-10 py-3 md:py-4 rounded-full font-semibold transition-all duration-300 transform hover:scale-105 hover:shadow-lg shadow-md inline-flex items-center gap-2 group`}
            >
              <span>{currentSlide.cta}</span>
              <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform duration-300" />
            </button>

            {/* Trust badge */}
            <div className="flex items-center gap-6 mt-6 justify-center md:justify-start">
              <div className="flex items-center gap-1.5 text-xs text-gray-500">
                <span className="w-1.5 h-1.5 bg-pink-400 rounded-full"></span>
                <span>100% Certified</span>
              </div>
              <div className="flex items-center gap-1.5 text-xs text-gray-500">
                <span className="w-1.5 h-1.5 bg-pink-400 rounded-full"></span>
                <span>Free Shipping</span>
              </div>
              <div className="flex items-center gap-1.5 text-xs text-gray-500">
                <span className="w-1.5 h-1.5 bg-pink-400 rounded-full"></span>
                <span>Lifetime Warranty</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Buttons */}
      <button
        onClick={prevSlide}
        className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white p-3 rounded-full shadow-lg hover:shadow-pink-lg transition-all duration-300 z-10 hover:scale-110 backdrop-blur-sm border border-pink-100"
      >
        <ChevronLeft className="w-5 h-5 text-pink-600" />
      </button>
      <button
        onClick={nextSlide}
        className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white p-3 rounded-full shadow-lg hover:shadow-pink-lg transition-all duration-300 z-10 hover:scale-110 backdrop-blur-sm border border-pink-100"
      >
        <ChevronRight className="w-5 h-5 text-pink-600" />
      </button>

      {/* Dots Indicator */}
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-2 z-10">
        {slides.map((_, index) => (
          <button
            key={index}
            onClick={() => setCurrentIndex(index)}
            className={`transition-all duration-300 ${
              index === currentIndex 
                ? `w-8 h-2.5 ${getDotColor(currentSlide.accentColor)} rounded-full shadow-md` 
                : 'w-2.5 h-2.5 bg-gray-300 hover:bg-pink-300 rounded-full'
            }`}
          />
        ))}
      </div>

      {/* Slide counter */}
      <div className="absolute bottom-6 right-6 z-10 bg-white/80 backdrop-blur-sm px-3 py-1.5 rounded-full text-xs text-gray-600 border border-pink-100">
        <span className="font-semibold text-pink-600">{currentIndex + 1}</span>
        <span className="text-gray-400"> / {slides.length}</span>
      </div>
    </section>
  );
}
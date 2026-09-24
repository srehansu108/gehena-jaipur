// src/components/home/HeroCarousel.jsx — DYNAMIC ✅
import { useState, useEffect, useCallback, useMemo } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { heroApi } from '../../api/heroApi';

const AUTOPLAY_MS = 5000;

// Fallback shown only if the API fails — keeps the site looking good
const FALLBACK_SLIDES = [
  {
    _id: 'fb1',
    title: 'Eternal Elegance TRST',
    subtitle: 'Discover Our Diamond Collection',
    description: 'Handcrafted diamonds that tell your unique story',
    cta: 'Shop Now',
    link: '/category/rings',
    image: { url: '/images/hero/1.jpg' },
    bgColor: 'from-pink-50/90 to-rose-50/90',
    accentColor: 'pink',
  },
];

// Accent → Tailwind class map (single source of truth)
const ACCENT_MAP = {
  pink:    { grad: 'from-pink-500 to-rose-500',    text: 'text-pink-600',    dot: 'bg-pink-500' },
  rose:    { grad: 'from-rose-500 to-pink-500',    text: 'text-rose-600',    dot: 'bg-rose-500' },
  blush:   { grad: 'from-pink-400 to-rose-400',    text: 'text-pink-600',    dot: 'bg-pink-400' },
  gold:    { grad: 'from-amber-500 to-yellow-500', text: 'text-amber-600',   dot: 'bg-amber-500' },
  emerald: { grad: 'from-emerald-500 to-teal-500', text: 'text-emerald-600', dot: 'bg-emerald-500' },
  indigo:  { grad: 'from-indigo-500 to-violet-500',text: 'text-indigo-600',  dot: 'bg-indigo-500' },
};

export function HeroCarousel() {
  const [slides, setSlides] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [paused, setPaused] = useState(false);
  const navigate = useNavigate();

  // ---------- Fetch slides from backend ----------
  useEffect(() => {
    let alive = true;

    (async () => {
      try {
        const data = await heroApi.getActive();
        if (!alive) return;

        if (Array.isArray(data) && data.length > 0) {
          setSlides(data);
        } else {
          console.warn('⚠️ No hero slides returned — using fallback');
          setSlides(FALLBACK_SLIDES);
        }
      } catch (err) {
        console.error('❌ Failed to fetch hero slides:', err);
        if (alive) setSlides(FALLBACK_SLIDES);
      } finally {
        if (alive) setLoading(false);
      }
    })();

    return () => { alive = false; };
  }, []);

  // ---------- Autoplay ----------
  useEffect(() => {
    if (paused || slides.length <= 1) return;

    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % slides.length);
    }, AUTOPLAY_MS);

    return () => clearInterval(timer);
  }, [paused, slides.length]);

  // ---------- Reset index if slides list changes & index out of range ----------
  useEffect(() => {
    if (currentIndex >= slides.length && slides.length > 0) {
      setCurrentIndex(0);
    }
  }, [slides.length, currentIndex]);

  const prevSlide = useCallback(() => {
    if (!slides.length) return;
    setCurrentIndex((prev) => (prev - 1 + slides.length) % slides.length);
  }, [slides.length]);

  const nextSlide = useCallback(() => {
    if (!slides.length) return;
    setCurrentIndex((prev) => (prev + 1) % slides.length);
  }, [slides.length]);

  const currentSlide = slides[currentIndex];

  // Compute accent classes for current slide
  const accent = useMemo(() => {
    const key = currentSlide?.accentColor || 'pink';
    return ACCENT_MAP[key] || ACCENT_MAP.pink;
  }, [currentSlide?.accentColor]);

  const handleCTAClick = (link) => {
    if (!link) return;
    // Track click (fire-and-forget, only if slide came from API)
    if (currentSlide?._id && !String(currentSlide._id).startsWith('fb')) {
      heroApi.trackClick(currentSlide._id);
    }
    navigate(link);
  };

  // ---------- Loading skeleton ----------
  if (loading || !currentSlide) {
    return (
      <section className="relative h-[70vh] md:h-[80vh] lg:h-screen bg-gradient-to-br from-pink-50 to-rose-50 animate-pulse" />
    );
  }

  return (
    <section
      className="relative h-[70vh] md:h-[80vh] lg:h-screen overflow-hidden group"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      {/* ---------- Background ---------- */}
      <div
        key={currentSlide._id}   /* forces re-render for smooth transition */
        className="absolute inset-0 bg-cover bg-center bg-no-repeat transition-transform duration-1000 scale-105 group-hover:scale-100"
        style={{ backgroundImage: `url(${currentSlide.image?.url})` }}
      >
        <div className={`absolute inset-0 bg-gradient-to-r ${currentSlide.bgColor} backdrop-blur-sm`} />

        {/* Decorative blobs */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 right-0 w-96 h-96 bg-pink-300 rounded-full blur-3xl -mr-48 -mt-48" />
          <div className="absolute bottom-0 left-0 w-96 h-96 bg-rose-300 rounded-full blur-3xl -ml-48 -mb-48" />
        </div>
      </div>

      {/* ---------- Content ---------- */}
      <div className="relative h-full flex items-center">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-2xl text-center md:text-left">
            {/* Decorative line + subtitle */}
            <div className="flex items-center gap-3 mb-4 justify-center md:justify-start">
              <span className="w-8 h-0.5 bg-gradient-to-r from-pink-500 to-rose-500" />
              <p className={`${accent.text} font-semibold text-sm md:text-base uppercase tracking-wider`}>
                {currentSlide.subtitle}
              </p>
              <span className="w-8 h-0.5 bg-gradient-to-r from-rose-500 to-pink-500" />
            </div>

            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-7xl font-serif text-gray-900 mb-4 leading-tight">
              {currentSlide.title}
            </h1>

            {currentSlide.description && (
              <p className="text-gray-700 text-base md:text-lg mb-6 md:mb-8 leading-relaxed">
                {currentSlide.description}
              </p>
            )}

            <button
              onClick={() => handleCTAClick(currentSlide.link)}
              className={`bg-gradient-to-r ${accent.grad} text-white px-8 md:px-10 py-3 md:py-4 rounded-full font-semibold transition-all duration-300 transform hover:scale-105 hover:shadow-lg shadow-md inline-flex items-center gap-2 group/btn`}
            >
              <span>{currentSlide.cta}</span>
              <ChevronRight className="w-4 h-4 group-hover/btn:translate-x-1 transition-transform duration-300" />
            </button>

            {/* Trust badges */}
            <div className="flex items-center gap-6 mt-6 justify-center md:justify-start">
              {['100% Certified', 'Free Shipping', 'Lifetime Warranty'].map((label) => (
                <div key={label} className="flex items-center gap-1.5 text-xs text-gray-500">
                  <span className="w-1.5 h-1.5 bg-pink-400 rounded-full" />
                  <span>{label}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* ---------- Nav buttons (only if >1 slide) ---------- */}
      {slides.length > 1 && (
        <>
          <button
            onClick={prevSlide}
            aria-label="Previous slide"
            className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white p-3 rounded-full shadow-lg transition-all duration-300 z-10 hover:scale-110 backdrop-blur-sm border border-pink-100"
          >
            <ChevronLeft className="w-5 h-5 text-pink-600" />
          </button>
          <button
            onClick={nextSlide}
            aria-label="Next slide"
            className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white p-3 rounded-full shadow-lg transition-all duration-300 z-10 hover:scale-110 backdrop-blur-sm border border-pink-100"
          >
            <ChevronRight className="w-5 h-5 text-pink-600" />
          </button>

          {/* Dots */}
          <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-2 z-10">
            {slides.map((slide, index) => (
              <button
                key={slide._id}
                onClick={() => setCurrentIndex(index)}
                aria-label={`Go to slide ${index + 1}`}
                className={`transition-all duration-300 ${
                  index === currentIndex
                    ? `w-8 h-2.5 ${accent.dot} rounded-full shadow-md`
                    : 'w-2.5 h-2.5 bg-gray-300 hover:bg-pink-300 rounded-full'
                }`}
              />
            ))}
          </div>

          {/* Counter */}
          <div className="absolute bottom-6 right-6 z-10 bg-white/80 backdrop-blur-sm px-3 py-1.5 rounded-full text-xs text-gray-600 border border-pink-100">
            <span className="font-semibold text-pink-600">{currentIndex + 1}</span>
            <span className="text-gray-400"> / {slides.length}</span>
          </div>
        </>
      )}
    </section>
  );
}
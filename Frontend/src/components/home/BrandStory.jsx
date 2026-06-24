// src/components/home/BrandStory.jsx - PINK THEME ✅
import { useRef, useEffect } from 'react';

export function BrandStory() {
  const videoRef = useRef(null);

  // Auto-play video when it comes into view
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            videoRef.current?.play();
          } else {
            videoRef.current?.pause();
          }
        });
      },
      { threshold: 0.5 } // Video plays when 50% visible
    );

    if (videoRef.current) {
      observer.observe(videoRef.current);
    }

    return () => {
      if (videoRef.current) {
        observer.unobserve(videoRef.current);
      }
    };
  }, []);

  return (
    <section className="py-20 bg-gradient-to-b from-white to-pink-50/30">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col lg:flex-row items-center gap-12">
          {/* Video Section */}
          <div className="relative lg:w-1/2">
            <div className="relative h-96 rounded-2xl overflow-hidden shadow-xl hover:shadow-pink-xl transition-all duration-500 group">
              {/* Decorative border */}
              <div className="absolute inset-0 rounded-2xl border-2 border-pink-100/50 group-hover:border-pink-300 transition-colors duration-500 pointer-events-none"></div>
              
              <video
                ref={videoRef}
                className="w-full h-full object-cover"
                autoPlay
                loop
                muted
                playsInline
                poster="/images/ads/jewellery.jpg"
              >
                <source src="/video/video1.mp4" type="video/mp4" />
              </video>
              
              {/* Video overlay gradient */}
              <div className="absolute inset-0 bg-gradient-to-t from-pink-500/10 to-transparent pointer-events-none"></div>
            </div>
          </div>

          {/* Content */}
          <div className="lg:w-1/2 text-center lg:text-left">
            <div className="flex items-center gap-3 justify-center lg:justify-start mb-3">
              <span className="w-10 h-0.5 bg-gradient-to-r from-pink-500 to-rose-500"></span>
              <p className="text-pink-600 font-semibold text-sm tracking-wider uppercase">Our Story</p>
              <span className="w-10 h-0.5 bg-gradient-to-r from-rose-500 to-pink-500"></span>
            </div>
            
            <h2 className="text-3xl md:text-4xl font-serif text-gray-900 mb-4">
              Crafting Dreams <span className="text-pink-gradient">Since 1995</span>
            </h2>
            
            <p className="text-gray-600 mb-8 leading-relaxed">
              Every piece of jewellery tells a unique story. With over 25 years of expertise, 
              we've been creating timeless pieces that celebrate life's precious moments. 
              Our master craftsmen blend traditional techniques with modern designs.
            </p>
            
            <div className="flex flex-wrap gap-8 justify-center lg:justify-start">
              <div className="group">
                <div className="text-2xl font-bold bg-gradient-to-r from-pink-500 to-rose-500 bg-clip-text text-transparent">
                  25+
                </div>
                <div className="text-sm text-gray-500 group-hover:text-pink-600 transition-colors duration-300">
                  Years of Excellence
                </div>
              </div>
              <div className="group">
                <div className="text-2xl font-bold bg-gradient-to-r from-pink-500 to-rose-500 bg-clip-text text-transparent">
                  50K+
                </div>
                <div className="text-sm text-gray-500 group-hover:text-pink-600 transition-colors duration-300">
                  Happy Customers
                </div>
              </div>
              <div className="group">
                <div className="text-2xl font-bold bg-gradient-to-r from-pink-500 to-rose-500 bg-clip-text text-transparent">
                  100%
                </div>
                <div className="text-sm text-gray-500 group-hover:text-pink-600 transition-colors duration-300">
                  Certified
                </div>
              </div>
            </div>

            {/* Optional: Add a subtle CTA */}
            <div className="mt-8">
              <button 
                onClick={() => window.location.href = '/about'}
                className="inline-flex items-center gap-2 text-pink-600 hover:text-pink-700 font-medium transition-colors duration-300 group"
              >
                <span className="border-b-2 border-pink-200 group-hover:border-pink-500 transition-colors duration-300 pb-0.5">
                  Discover Our Journey
                </span>
                <svg 
                  className="w-4 h-4 transform group-hover:translate-x-1 transition-transform duration-300" 
                  fill="none" 
                  stroke="currentColor" 
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
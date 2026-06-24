// src/components/home/OfferBanner.jsx - PINK THEME ✅
import { useNavigate } from 'react-router-dom';
import { Sparkles, Gem, ArrowRight } from 'lucide-react';

export function OfferBanner() {
  const navigate = useNavigate();

  const handleKnowMore = () => {
    navigate('/category/necklaces');
  };

  return (
    <section className="py-16 md:py-20 bg-gradient-to-br from-pink-800 via-rose-700 to-pink-800 relative overflow-hidden">
      {/* Decorative Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-pink-500/20 rounded-full blur-3xl -mr-48 -mt-48" />
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-rose-500/20 rounded-full blur-3xl -ml-48 -mb-48" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-pink-400/10 rounded-full blur-3xl" />
        
        {/* Floating Gems */}
        <Gem className="absolute top-20 left-20 w-8 h-8 text-pink-300/20 animate-float" />
        <Gem className="absolute bottom-20 right-20 w-10 h-10 text-pink-300/20 animate-float" style={{ animationDelay: '1s' }} />
        <Gem className="absolute top-1/2 left-10 w-6 h-6 text-pink-300/15 animate-float" style={{ animationDelay: '2s' }} />
        <Sparkles className="absolute top-1/3 right-16 w-5 h-5 text-rose-300/20 animate-float" style={{ animationDelay: '0.5s' }} />
        <Sparkles className="absolute bottom-1/3 left-24 w-4 h-4 text-pink-300/20 animate-float" style={{ animationDelay: '1.5s' }} />
        
        {/* Diagonal decorative lines */}
        <div className="absolute -top-40 -right-40 w-80 h-80 border border-pink-400/10 rounded-full rotate-45" />
        <div className="absolute -bottom-40 -left-40 w-80 h-80 border border-pink-400/10 rounded-full rotate-45" />
      </div>

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="flex flex-col lg:flex-row items-center justify-between gap-8">
          <div className="text-center lg:text-left text-white">
            {/* Pink badge */}
            <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm px-4 py-1.5 rounded-full mb-4 border border-white/10">
              <Sparkles className="w-4 h-4 text-pink-200 animate-pulse" />
              <span className="text-pink-200 font-semibold text-sm tracking-wider uppercase">Limited Time Offer</span>
              <Sparkles className="w-4 h-4 text-pink-200 animate-pulse" style={{ animationDelay: '0.5s' }} />
            </div>

            <h2 className="text-3xl md:text-4xl lg:text-5xl font-serif mb-4 animate-slide-up leading-tight">
              Exchange Your <span className="text-transparent bg-clip-text bg-gradient-to-r from-pink-200 to-rose-200">Old Gold</span>
            </h2>
            
            <p className="text-pink-200/90 text-lg mb-6 animate-slide-up">
              Get flat <span className="font-bold text-white">0% deduction</span>* on old gold exchange
            </p>
            
            <div className="flex flex-wrap gap-2 text-sm mb-6 justify-center lg:justify-start">
              <span className="bg-white/10 backdrop-blur-sm border border-white/10 px-3 py-1.5 rounded-full hover:bg-white/20 transition-all duration-300 cursor-default">
                💎 9 Karat & Above
              </span>
              <span className="bg-white/10 backdrop-blur-sm border border-white/10 px-3 py-1.5 rounded-full hover:bg-white/20 transition-all duration-300 cursor-default">
                🏷️ Any Jeweller
              </span>
              <span className="bg-white/10 backdrop-blur-sm border border-white/10 px-3 py-1.5 rounded-full hover:bg-white/20 transition-all duration-300 cursor-default">
                ✅ 100% Transparent
              </span>
            </div>

            <button 
              onClick={handleKnowMore}
              className="group inline-flex items-center gap-2 bg-white text-pink-700 hover:bg-gradient-to-r hover:from-pink-500 hover:to-rose-500 hover:text-white px-8 py-3 rounded-full font-semibold transition-all duration-300 transform hover:scale-105 hover:shadow-xl shadow-lg"
            >
              <span>Know More</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform duration-300" />
            </button>

            {/* Trust badge */}
            <div className="flex items-center gap-4 mt-6 justify-center lg:justify-start text-xs text-pink-300/70">
              <span className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 bg-pink-300 rounded-full"></span>
                Trusted by 50K+ customers
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 bg-pink-300 rounded-full"></span>
                25+ years of excellence
              </span>
            </div>
          </div>
          
          <div className="relative w-64 h-64 lg:w-80 lg:h-80 animate-slide-up group">
            {/* Glow behind image */}
            <div className="absolute inset-0 bg-gradient-to-br from-pink-400/20 to-rose-400/20 rounded-full blur-2xl group-hover:scale-110 transition-transform duration-500" />
            
            <img 
              src="/images/offer/gold-exchange.jpg" 
              alt="Gold Exchange Offer"
              className="relative w-full h-full object-contain drop-shadow-2xl group-hover:scale-105 transition-transform duration-500"
            />
            
            {/* Decorative ring around image */}
            <div className="absolute inset-0 rounded-full border-2 border-white/10 group-hover:border-white/20 transition-all duration-500 -z-10" />
            <div className="absolute -inset-4 rounded-full border border-white/5 group-hover:border-white/10 transition-all duration-500 -z-20" />
          </div>
        </div>

        {/* Bottom decorative line */}
        <div className="flex items-center justify-center gap-3 mt-8">
          <span className="w-20 h-0.5 bg-gradient-to-r from-transparent to-pink-400/30"></span>
          <span className="w-1.5 h-1.5 bg-pink-400/30 rounded-full animate-pulse"></span>
          <span className="w-20 h-0.5 bg-gradient-to-l from-transparent to-pink-400/30"></span>
        </div>
      </div>
    </section>
  );
}
// src/components/home/NewsletterSignup.jsx - PINK THEME ✅
import { useState } from 'react';
import { Send, Sparkles, Heart } from 'lucide-react';

export function NewsletterSignup() {
  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    // Simulate API call
    setTimeout(() => {
      console.log('Newsletter signup:', email);
      alert('Thanks for subscribing! 🎉');
      setEmail('');
      setIsSubmitting(false);
    }, 1000);
  };

  return (
    <section className="py-16 md:py-20 bg-gradient-to-br from-pink-900 via-rose-800 to-pink-900 relative overflow-hidden">
      {/* Decorative Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-pink-500/10 rounded-full blur-3xl -mr-48 -mt-48" />
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-rose-500/10 rounded-full blur-3xl -ml-48 -mb-48" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-pink-400/5 rounded-full blur-3xl" />
        
        {/* Floating sparkles */}
        <Sparkles className="absolute top-12 left-12 w-6 h-6 text-pink-300/20 animate-float" />
        <Sparkles className="absolute bottom-12 right-12 w-8 h-8 text-pink-300/20 animate-float" style={{ animationDelay: '1s' }} />
        <Sparkles className="absolute top-1/2 left-1/4 w-4 h-4 text-pink-300/15 animate-float" style={{ animationDelay: '2s' }} />
        <Sparkles className="absolute bottom-1/3 right-1/4 w-5 h-5 text-pink-300/15 animate-float" style={{ animationDelay: '0.5s' }} />
      </div>

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="text-center text-white">
          {/* Decorative hearts */}
          <div className="flex items-center justify-center gap-3 mb-4">
            <Heart className="w-5 h-5 text-pink-300 animate-pulse" />
            <Heart className="w-6 h-6 text-pink-400 animate-pulse" style={{ animationDelay: '0.5s' }} />
            <Heart className="w-5 h-5 text-pink-300 animate-pulse" style={{ animationDelay: '1s' }} />
          </div>

          <h2 className="text-3xl md:text-4xl lg:text-5xl font-serif mb-3 animate-slide-up">
            Join Our <span className="text-transparent bg-clip-text bg-gradient-to-r from-pink-200 to-rose-200">Newsletter</span>
          </h2>
          
          <p className="text-pink-200/80 mb-8 max-w-2xl mx-auto animate-slide-up text-base md:text-lg leading-relaxed">
            Subscribe to get special offers, free giveaways, and exclusive deals. 
            <br className="hidden sm:block" />
            <span className="text-pink-300/60 text-sm">✨ Be the first to know about our latest collections ✨</span>
          </p>
          
          <form onSubmit={handleSubmit} className="max-w-md mx-auto flex flex-col sm:flex-row gap-3">
            <input
              type="email"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="flex-1 px-4 py-3 rounded-full text-gray-900 focus:outline-none focus:ring-2 focus:ring-pink-400 focus:ring-offset-2 focus:ring-offset-pink-900 transition-all duration-300 bg-white/95 hover:bg-white placeholder:text-gray-400"
            />
            <button
              type="submit"
              disabled={isSubmitting}
              className="bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600 px-6 py-3 rounded-full font-semibold transition-all duration-300 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-pink-lg transform hover:scale-[1.02] active:scale-[0.98] text-white"
            >
              {isSubmitting ? (
                <>
                  <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  Subscribing...
                </>
              ) : (
                <>
                  Subscribe
                  <Send className="w-4 h-4 group-hover:translate-x-1 transition-transform duration-300" />
                </>
              )}
            </button>
          </form>
          
          <p className="text-pink-300/60 text-xs mt-4 flex items-center justify-center gap-2">
            <span className="w-4 h-0.5 bg-pink-400/30"></span>
            By subscribing, you agree to our Privacy Policy and consent to receive updates.
            <span className="w-4 h-0.5 bg-pink-400/30"></span>
          </p>
        </div>
      </div>
    </section>
  );
}
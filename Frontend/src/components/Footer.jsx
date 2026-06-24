// src/components/Footer.jsx
import { useState, useEffect } from 'react';
import { 
  Heart, 
  Facebook, 
  Instagram, 
  Linkedin, 
  Twitter, 
  Youtube,
  Mail, 
  Phone, 
  MapPin, 
  Clock, 
  Truck, 
  Shield, 
  Award,
  CreditCard,
  ChevronRight,
  ArrowUp,
  Gem,
  Sparkles
} from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';

export function Footer() {
  const navigate = useNavigate();
  const [showScrollTop, setShowScrollTop] = useState(false);
  const [email, setEmail] = useState('');
  const [isSubscribing, setIsSubscribing] = useState(false);

  // Scroll to top button visibility
  useEffect(() => {
    const handleScroll = () => {
      setShowScrollTop(window.scrollY > 500);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSubscribe = (e) => {
    e.preventDefault();
    if (!email) return;
    
    setIsSubscribing(true);
    // Simulate subscription
    setTimeout(() => {
      alert(`Thank you for subscribing with ${email}! 🌸`);
      setEmail('');
      setIsSubscribing(false);
    }, 1000);
  };

  // Footer links data
  const quickLinks = [
    { name: 'Terms & Conditions', path: '/terms' },
    { name: 'Shipping Information', path: '/shipping' },
    { name: 'Return & Refund Policy', path: '/returns' },
    { name: 'Privacy Policy', path: '/privacy' },
    { name: 'Orders Tracking', path: '/track-order' },
    { name: 'Sitemap', path: '/sitemap' },
  ];

  const informationLinks = [
    { name: 'About Us', path: '/about' },
    { name: 'Contact Us', path: '/contact' },
    { name: 'Login', path: '/login' },
    { name: 'Register', path: '/signup' },
    { name: 'My Account', path: '/account' },
  ];

  const socialLinks = [
    { name: 'Facebook', icon: Facebook, url: 'https://facebook.com', color: 'hover:bg-[#1877f2]' },
    { name: 'Instagram', icon: Instagram, url: 'https://instagram.com', color: 'hover:bg-[#e4405f]' },
    { name: 'LinkedIn', icon: Linkedin, url: 'https://linkedin.com', color: 'hover:bg-[#0a66c2]' },
    { name: 'Twitter', icon: Twitter, url: 'https://twitter.com', color: 'hover:bg-[#1da1f2]' },
    { name: 'YouTube', icon: Youtube, url: 'https://youtube.com', color: 'hover:bg-[#ff0000]' },
  ];

  const paymentIcons = [
    { name: 'Visa', icon: '💳' },
    { name: 'Mastercard', icon: '💳' },
    { name: 'UPI', icon: '📱' },
    { name: 'Paytm', icon: '🏦' },
    { name: 'Razorpay', icon: '💎' },
  ];

  return (
    <footer className="relative mt-20">
      {/* ===== SCROLL TO TOP BUTTON ===== */}
      {showScrollTop && (
        <button
          onClick={scrollToTop}
          className="fixed bottom-8 right-8 z-50 p-3 bg-gradient-to-r from-pink-500 to-rose-500 text-white rounded-full shadow-lg hover:shadow-pink-lg transition-all duration-300 transform hover:scale-110 animate-bounce-soft"
          aria-label="Scroll to top"
        >
          <ArrowUp className="w-6 h-6" />
        </button>
      )}

      {/* ===== NEWSLETTER SECTION ===== */}
      <div className="relative bg-gradient-to-r from-pink-50 via-rose-50 to-pink-50 border-y border-pink-100 py-12">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            {/* Decorative elements */}
            <div className="flex justify-center gap-3 mb-4">
              <Sparkles className="w-5 h-5 text-pink-400 animate-float" />
              <Heart className="w-5 h-5 text-pink-500 animate-float" style={{ animationDelay: '0.5s' }} />
              <Sparkles className="w-5 h-5 text-pink-400 animate-float" style={{ animationDelay: '1s' }} />
            </div>
            
            <h3 className="text-2xl md:text-3xl font-serif text-gray-800 mb-2">
              Subscribe to Our <span className="text-pink-gradient">Newsletter</span>
            </h3>
            <p className="text-gray-600 mb-6 max-w-md mx-auto">
              Get the latest updates on new arrivals, exclusive offers, and jewelry care tips! 🌸
            </p>
            
            <form onSubmit={handleSubscribe} className="flex flex-col sm:flex-row gap-3 max-w-lg mx-auto">
              <div className="flex-1 relative">
                <Mail className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-pink-400" />
                <input
                  type="email"
                  placeholder="Enter your email address"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="w-full pl-12 pr-4 py-3 bg-white border-2 border-pink-200 rounded-xl focus:border-pink-500 focus:ring-2 focus:ring-pink-200 transition-all outline-none"
                />
              </div>
              <button
                type="submit"
                disabled={isSubscribing}
                className="px-8 py-3 bg-gradient-to-r from-pink-500 to-rose-500 text-white font-semibold rounded-xl hover:from-pink-600 hover:to-rose-600 transition-all duration-300 shadow-md hover:shadow-pink-lg disabled:opacity-70"
              >
                {isSubscribing ? 'Subscribing...' : 'Subscribe'}
              </button>
            </form>
            
            <p className="text-xs text-gray-400 mt-3">
              By subscribing, you agree to our Privacy Policy and consent to receive updates.
            </p>
          </div>
        </div>
      </div>

      {/* ===== MAIN FOOTER ===== */}
      <div className="bg-white border-t border-pink-100 pt-12 pb-6">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-12">
            
            {/* ===== COLUMN 1: Brand & About ===== */}
            <div className="space-y-4">
              {/* Logo */}
              <div className="flex items-center gap-2 text-center">
                <span className="text-[32px] font-serif font-extrabold text-black leading-none">
  GEHNA<br />
  <span className="text-[20px] text-pink-500 block -mt-[2px]">JAIPUR</span>
</span>

              </div>
              
              <p className="text-gray-600 text-sm leading-relaxed">
                Discover the finest collection of handcrafted jewelry, 
                designed to celebrate your unique style and elegance. 
                Every piece tells a story of craftsmanship and passion.
              </p>
              
              {/* Trust badges */}
              <div className="flex flex-wrap gap-3 pt-2">
                <div className="flex items-center gap-1.5 text-xs text-gray-600 bg-pink-50 px-3 py-1.5 rounded-full">
                  <Shield className="w-3.5 h-3.5 text-pink-500" />
                  <span>100% Certified</span>
                </div>
                <div className="flex items-center gap-1.5 text-xs text-gray-600 bg-pink-50 px-3 py-1.5 rounded-full">
                  <Truck className="w-3.5 h-3.5 text-pink-500" />
                  <span>Free Shipping</span>
                </div>
                <div className="flex items-center gap-1.5 text-xs text-gray-600 bg-pink-50 px-3 py-1.5 rounded-full">
                  <Award className="w-3.5 h-3.5 text-pink-500" />
                  <span>Hallmarked</span>
                </div>
              </div>
              
              {/* Social Links */}
              <div className="pt-2">
                <p className="text-sm font-medium text-gray-700 mb-2">Follow Us</p>
                <div className="flex gap-2">
                  {socialLinks.map((social) => {
                    const Icon = social.icon;
                    return (
                      <a
                        key={social.name}
                        href={social.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className={`w-10 h-10 rounded-full bg-pink-50 text-gray-600 flex items-center justify-center hover:text-white transition-all duration-300 ${social.color} hover:scale-110 transform`}
                        aria-label={social.name}
                      >
                        <Icon className="w-4 h-4" />
                      </a>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* ===== COLUMN 2: Information ===== */}
            <div>
              <h4 className="text-sm font-semibold text-gray-800 uppercase tracking-wider mb-4 flex items-center gap-2">
                <span className="w-6 h-0.5 bg-gradient-to-r from-pink-500 to-rose-500"></span>
                Information
              </h4>
              <ul className="space-y-2.5">
                {informationLinks.map((link) => (
                  <li key={link.name}>
                    <Link
                      to={link.path}
                      className="text-sm text-gray-600 hover:text-pink-500 transition-colors duration-200 flex items-center gap-1.5 group"
                    >
                      <ChevronRight className="w-3.5 h-3.5 text-pink-300 group-hover:text-pink-500 transition-colors" />
                      <span className="group-hover:translate-x-0.5 transition-transform duration-200">
                        {link.name}
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* ===== COLUMN 3: Quick Links ===== */}
            <div>
              <h4 className="text-sm font-semibold text-gray-800 uppercase tracking-wider mb-4 flex items-center gap-2">
                <span className="w-6 h-0.5 bg-gradient-to-r from-pink-500 to-rose-500"></span>
                Quick Links
              </h4>
              <ul className="space-y-2.5">
                {quickLinks.map((link) => (
                  <li key={link.name}>
                    <Link
                      to={link.path}
                      className="text-sm text-gray-600 hover:text-pink-500 transition-colors duration-200 flex items-center gap-1.5 group"
                    >
                      <ChevronRight className="w-3.5 h-3.5 text-pink-300 group-hover:text-pink-500 transition-colors" />
                      <span className="group-hover:translate-x-0.5 transition-transform duration-200">
                        {link.name}
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* ===== COLUMN 4: Contact & Hours ===== */}
            <div>
              <h4 className="text-sm font-semibold text-gray-800 uppercase tracking-wider mb-4 flex items-center gap-2">
                <span className="w-6 h-0.5 bg-gradient-to-r from-pink-500 to-rose-500"></span>
                Get in Touch
              </h4>
              
              {/* Working Hours */}
              <div className="mb-4">
                <div className="flex items-center gap-2 text-sm text-gray-700 font-medium mb-2">
                  <Clock className="w-4 h-4 text-pink-500" />
                  <span>Working Hours</span>
                </div>
                <div className="space-y-1 text-sm text-gray-600 pl-6">
                  <div className="flex justify-between">
                    <span>Monday – Saturday</span>
                    <span className="font-medium">09:00 am – 07:00 pm</span>
                  </div>
                  <div className="flex justify-between text-rose-500">
                    <span>Sunday</span>
                    <span className="font-medium">Closed</span>
                  </div>
                </div>
              </div>

              {/* Contact Info */}
              <div className="space-y-2.5 text-sm">
                <div className="flex items-start gap-3">
                  <MapPin className="w-4 h-4 text-pink-500 mt-0.5 flex-shrink-0" />
                  <span className="text-gray-600">
                    Kothari Bhawan, B14, New Colony,<br />
                    Mirza Ismail Road, Jaipur – 302001,<br />
                    Rajasthan, India
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  <Phone className="w-4 h-4 text-pink-500 flex-shrink-0" />
                  <a href="tel:+911234567890" className="text-gray-600 hover:text-pink-500 transition-colors">
                    +91 123 456 7890
                  </a>
                </div>
                <div className="flex items-center gap-3">
                  <Mail className="w-4 h-4 text-pink-500 flex-shrink-0" />
                  <a href="mailto:info@gehnajaipur.com" className="text-gray-600 hover:text-pink-500 transition-colors">
                    info@gehnajaipur.com
                  </a>
                </div>
              </div>
            </div>
          </div>

          {/* ===== PAYMENT & SECURITY BADGES ===== */}
          <div className="mt-10 pt-6 border-t border-pink-100">
            <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
              <div className="flex items-center gap-4 flex-wrap justify-center">
                <span className="text-xs text-gray-500 font-medium">Secure Payment</span>
                <div className="flex gap-2">
                  {paymentIcons.map((payment, index) => (
                    <span
                      key={index}
                      className="px-3 py-1 bg-pink-50 rounded-lg text-sm text-gray-600 border border-pink-100"
                    >
                      {payment.icon} {payment.name}
                    </span>
                  ))}
                </div>
              </div>
              
              <div className="flex items-center gap-2 text-xs text-gray-500">
                <Shield className="w-4 h-4 text-pink-500" />
                <span>100% Secure &amp; Encrypted</span>
              </div>
            </div>
          </div>

          {/* ===== COPYRIGHT ===== */}
          <div className="mt-6 pt-4 border-t border-pink-50">
            <div className="flex flex-col sm:flex-row justify-between items-center gap-3 text-xs text-gray-500">
              <div className="flex items-center gap-1.5">
                <Heart className="w-3.5 h-3.5 text-pink-400" />
                <span>
                  © {new Date().getFullYear()} <span className="font-medium text-gray-700">GehnaJaipur</span>. 
                  All rights reserved.
                </span>
              </div>
              <div className="flex items-center gap-4">
                <Link to="/privacy" className="hover:text-pink-500 transition-colors">
                  Privacy Policy
                </Link>
                <Link to="/terms" className="hover:text-pink-500 transition-colors">
                  Terms of Service
                </Link>
                <Link to="/sitemap" className="hover:text-pink-500 transition-colors">
                  Sitemap
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
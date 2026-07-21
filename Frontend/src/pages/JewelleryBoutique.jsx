import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const JewelleryBoutique = () => {
  const [cart, setCart] = useState([]);
  const [activeCategory, setActiveCategory] = useState('All');
  const [hoveredProduct, setHoveredProduct] = useState(null);
  const [scrolled, setScrolled] = useState(false);
  const [sparkles, setSparkles] = useState([]);

  // Generate sparkles on scroll
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 100);
    };
    window.addEventListener('scroll', handleScroll);
    
    // Create sparkle particles
    const sparkleArray = Array.from({ length: 20 }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 100,
      size: Math.random() * 6 + 2,
      duration: Math.random() * 3 + 2,
      delay: Math.random() * 2
    }));
    setSparkles(sparkleArray);
    
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const products = [
    {
      id: 1,
      name: "Rose Gold Necklace",
      category: "Necklaces",
      price: "$299",
      originalPrice: "$399",
      image: "https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?w=400&h=400&fit=crop",
      badge: "Bestseller",
      badgeColor: "from-pink-500 to-pink-600",
      description: "Elegant rose gold chain with a delicate crystal pendant. Perfect for everyday luxury and special occasions.",
      rating: 4.9,
      reviews: 128,
      isNew: false,
      isSale: false,
      features: ["18k Rose Gold", "Crystal Pendant", "Adjustable Chain"]
    },
    {
      id: 2,
      name: "Pink Sapphire Ring",
      category: "Rings",
      price: "$499",
      originalPrice: null,
      image: "https://images.unsplash.com/photo-1605100804763-247f67b3557e?w=400&h=400&fit=crop",
      badge: "New",
      badgeColor: "from-emerald-400 to-emerald-500",
      description: "Stunning pink sapphire set in 18k white gold. A symbol of love, elegance, and timeless beauty.",
      rating: 5.0,
      reviews: 89,
      isNew: true,
      isSale: false,
      features: ["Natural Sapphire", "18k White Gold", "Signature Design"]
    },
    {
      id: 3,
      name: "Pearl Drop Earrings",
      category: "Earrings",
      price: "$199",
      originalPrice: null,
      image: "https://images.unsplash.com/photo-1588444837495-c6cfeb53f32d?w=400&h=400&fit=crop",
      badge: null,
      badgeColor: "",
      description: "Freshwater pearl drops with gold-plated hooks. Timeless elegance for any occasion.",
      rating: 4.7,
      reviews: 234,
      isNew: false,
      isSale: false,
      features: ["Freshwater Pearls", "Gold Plated", "Lightweight"]
    },
    {
      id: 4,
      name: "Diamond Tennis Bracelet",
      category: "Bracelets",
      price: "$899",
      originalPrice: "$1,199",
      image: "https://images.unsplash.com/photo-1611652022419-a9419f74343d?w=400&h=400&fit=crop",
      badge: "Luxury",
      badgeColor: "from-yellow-400 to-amber-500",
      description: "Certified diamond tennis bracelet in platinum. The ultimate statement piece for the discerning collector.",
      rating: 4.8,
      reviews: 67,
      isNew: false,
      isSale: true,
      features: ["Certified Diamonds", "Platinum", "Lifetime Warranty"]
    },
    {
      id: 5,
      name: "Blush Pink Pendant",
      category: "Necklaces",
      price: "$349",
      originalPrice: null,
      image: "https://images.unsplash.com/photo-1583947215253-24b7f6a971b6?w=400&h=400&fit=crop",
      badge: null,
      badgeColor: "",
      description: "Delicate blush pink crystal pendant on a fine silver chain. Subtle, sophisticated, and utterly charming.",
      rating: 4.6,
      reviews: 156,
      isNew: false,
      isSale: false,
      features: ["Crystal Pendant", "Silver Chain", "Adjustable"]
    },
    {
      id: 6,
      name: "Gold Hoop Earrings",
      category: "Earrings",
      price: "$159",
      originalPrice: "$229",
      image: "https://images.unsplash.com/photo-1630019852942-f89202989a59?w=400&h=400&fit=crop",
      badge: "Sale",
      badgeColor: "from-red-400 to-red-500",
      description: "Classic 14k gold hoop earrings with a modern twist. Lightweight, comfortable, and versatile.",
      rating: 4.9,
      reviews: 312,
      isNew: false,
      isSale: true,
      features: ["14k Gold", "Lightweight", "Comfort Fit"]
    }
  ];

  const categories = ['All', 'Necklaces', 'Rings', 'Earrings', 'Bracelets'];

  const filteredProducts = activeCategory === 'All' 
    ? products 
    : products.filter(p => p.category === activeCategory);

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.3
      }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        type: "spring",
        stiffness: 100,
        damping: 12
      }
    }
  };

  const floatVariants = {
    animate: {
      y: [0, -10, 0],
      transition: {
        duration: 3,
        repeat: Infinity,
        ease: "easeInOut"
      }
    }
  };

  const pulseVariants = {
    animate: {
      scale: [1, 1.05, 1],
      transition: {
        duration: 2,
        repeat: Infinity,
        ease: "easeInOut"
      }
    }
  };

  const handleAddToCart = (product) => {
    setCart([...cart, product]);
    
    // Create floating notification
    const notification = document.createElement('div');
    notification.className = 'fixed top-4 right-4 z-50';
    notification.innerHTML = `
      <div class="bg-gradient-to-r from-pink-600 to-pink-400 text-white px-6 py-4 rounded-2xl shadow-2xl transform transition-all duration-500 flex items-center gap-3 animate-slide-in-right">
        <span class="text-2xl">✨</span>
        <div>
          <p class="font-bold text-lg">Added to Wishlist!</p>
          <p class="text-sm opacity-90">${product.name}</p>
        </div>
      </div>
    `;
    document.body.appendChild(notification);
    
    setTimeout(() => {
      notification.querySelector('div').style.transform = 'translateX(100px)';
      notification.querySelector('div').style.opacity = '0';
      setTimeout(() => notification.remove(), 500);
    }, 3000);
  };

  return (
    <main className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 bg-gradient-to-b from-[#fff5f7] via-white to-[#fff5f7] min-h-screen overflow-hidden">
      
      {/* ===== Floating Sparkles ===== */}
      {sparkles.map((sparkle) => (
        <motion.div
          key={sparkle.id}
          className="absolute rounded-full bg-gradient-to-r from-pink-300 to-pink-500 opacity-30"
          style={{
            left: `${sparkle.x}%`,
            top: `${sparkle.y}%`,
            width: sparkle.size,
            height: sparkle.size,
          }}
          animate={{
            y: [0, -20, 0],
            opacity: [0.3, 0.8, 0.3],
          }}
          transition={{
            duration: sparkle.duration,
            delay: sparkle.delay,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
      ))}

      {/* ===== Hero Section ===== */}
      <motion.section 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-pink-50 via-pink-100 to-pink-200 p-8 md:p-16 mb-12 shadow-2xl"
      >
        {/* Animated Background Elements */}
        <motion.div 
          className="absolute top-0 right-0 w-96 h-96 bg-pink-300/20 rounded-full blur-3xl"
          animate={{
            scale: [1, 1.2, 1],
            x: [0, -20, 0],
            y: [0, 20, 0],
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
        <motion.div 
          className="absolute bottom-0 left-0 w-72 h-72 bg-pink-400/10 rounded-full blur-2xl"
          animate={{
            scale: [1, 1.3, 1],
            x: [0, 20, 0],
            y: [0, -20, 0],
          }}
          transition={{
            duration: 6,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 1
          }}
        />
        <motion.div 
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-pink-200/10 rounded-full blur-3xl"
          animate={{
            scale: [1, 1.5, 1],
            opacity: [0.3, 0.6, 0.3],
          }}
          transition={{
            duration: 10,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />

        <div className="relative flex flex-col md:flex-row items-center justify-between gap-10">
          <motion.div 
            className="flex-1 text-center md:text-left z-10"
            initial={{ x: -50, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            <motion.div 
              className="inline-flex items-center gap-2 bg-white/80 backdrop-blur-sm px-6 py-2 rounded-full text-sm font-semibold text-pink-600 mb-6 shadow-lg"
              animate={{
                scale: [1, 1.05, 1],
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                ease: "easeInOut"
              }}
            >
              <span className="animate-pulse">✦</span>
              New Collection 2026
              <span className="animate-pulse">✦</span>
            </motion.div>
            
            <motion.h1 
              className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold leading-tight mb-6"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
            >
              <span className="text-[#2d1b1b]">Timeless</span>
              <br />
              <motion.span 
                className="bg-gradient-to-r from-pink-600 via-pink-500 to-amber-400 bg-clip-text text-transparent inline-block"
                animate={{
                  backgroundPosition: ['0%', '100%', '0%'],
                }}
                transition={{
                  duration: 6,
                  repeat: Infinity,
                  ease: "linear"
                }}
                style={{ backgroundSize: '200%' }}
              >
                Elegance
              </motion.span>
            </motion.h1>
            
            <motion.p 
              className="text-[#5a3d3d] text-lg md:text-xl mb-8 max-w-lg mx-auto md:mx-0 leading-relaxed"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.6 }}
            >
              Discover our curated collection of handcrafted fine jewellery, 
              designed to celebrate your unique beauty and style.
            </motion.p>
            
            <motion.div 
              className="flex flex-col sm:flex-row gap-4 justify-center md:justify-start"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.8 }}
            >
              <motion.button 
                className="group bg-gradient-to-r from-pink-600 to-pink-400 text-white px-10 py-4 rounded-full text-lg font-semibold hover:shadow-2xl hover:shadow-pink-300/40 transform hover:-translate-y-1 transition-all duration-300 flex items-center gap-2"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                Explore Collection
                <motion.span 
                  className="group-hover:translate-x-1 transition-transform"
                  animate={{ x: [0, 5, 0] }}
                  transition={{ duration: 1.5, repeat: Infinity }}
                >
                  →
                </motion.span>
              </motion.button>
              <motion.button 
                className="bg-white/90 backdrop-blur-sm text-[#2d1b1b] px-10 py-4 rounded-full text-lg font-semibold hover:shadow-xl hover:bg-white transition-all duration-300 border border-pink-200"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                View Lookbook
              </motion.button>
            </motion.div>
            
            {/* Stats */}
            <motion.div 
              className="flex gap-8 mt-8 justify-center md:justify-start"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.6, delay: 1 }}
            >
              {[
                { number: '500+', label: 'Happy Clients' },
                { number: '50+', label: 'Award Winning' },
                { number: '4.9★', label: 'Average Rating' }
              ].map((stat, index) => (
                <motion.div 
                  key={index}
                  whileHover={{ scale: 1.1 }}
                  transition={{ type: "spring", stiffness: 300 }}
                >
                  <p className="text-2xl font-bold text-pink-600">{stat.number}</p>
                  <p className="text-sm text-[#5a3d3d]">{stat.label}</p>
                </motion.div>
              ))}
            </motion.div>
          </motion.div>
          
          <motion.div 
            className="flex-1 w-full relative"
            initial={{ x: 50, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.4 }}
          >
            <motion.div 
              className="relative h-64 sm:h-80 md:h-[450px] rounded-3xl overflow-hidden shadow-2xl ring-2 ring-white/50"
              whileHover={{ scale: 1.02 }}
              transition={{ type: "spring", stiffness: 300 }}
            >
              <div className="absolute inset-0 bg-gradient-to-br from-pink-200 to-pink-300 bg-[url('https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=800&h=600&fit=crop')] bg-cover bg-center"></div>
              <div className="absolute inset-0 bg-gradient-to-t from-pink-900/20 to-transparent"></div>
              
              {/* Floating Badges */}
              <motion.div 
                className="absolute top-4 right-4 bg-white/95 backdrop-blur-sm px-4 py-2 rounded-full text-sm font-bold text-pink-600 shadow-lg"
                variants={floatVariants}
                animate="animate"
              >
                ✨ 15% off
              </motion.div>
              <motion.div 
                className="absolute bottom-4 left-4 bg-black/30 backdrop-blur-sm px-4 py-2 rounded-full text-sm text-white font-medium"
                whileHover={{ scale: 1.1 }}
              >
                📸 2.5k+ likes
              </motion.div>
            </motion.div>
          </motion.div>
        </div>
      </motion.section>

      {/* ===== Category Filters ===== */}
      <motion.div 
        className="flex flex-wrap justify-center gap-3 py-6 mb-4"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.2 }}
      >
        {categories.map((category, index) => (
          <motion.button
            key={category}
            onClick={() => setActiveCategory(category)}
            className={`px-7 py-3 rounded-full font-medium transition-all duration-300 ${
              activeCategory === category
                ? 'bg-gradient-to-r from-pink-600 to-pink-400 text-white shadow-xl shadow-pink-300/30 scale-105'
                : 'bg-white/80 backdrop-blur-sm border-2 border-pink-200 text-[#4a2c2c] hover:bg-pink-50 hover:border-pink-400 hover:scale-105'
            }`}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
          >
            {category}
            {category !== 'All' && (
              <span className="ml-2 text-xs opacity-70">
                ({products.filter(p => p.category === category).length})
              </span>
            )}
          </motion.button>
        ))}
      </motion.div>

      {/* ===== Product Grid ===== */}
      <motion.section 
        className="py-8 pb-20"
        id="collection"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        <div className="flex justify-between items-end mb-12">
          <div>
            <motion.h2 
              className="text-4xl md:text-5xl font-bold text-[#2d1b1b]"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
            >
              Our <span className="bg-gradient-to-r from-pink-600 to-pink-400 bg-clip-text text-transparent">Collection</span>
            </motion.h2>
            <motion.p 
              className="text-[#5a3d3d] mt-2 text-lg"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
            >
              {filteredProducts.length} exquisite pieces waiting for you
            </motion.p>
          </div>
          <motion.button 
            className="text-pink-600 font-semibold hover:text-pink-700 transition-colors hidden sm:block"
            whileHover={{ x: 5 }}
          >
            View All →
          </motion.button>
        </div>
        
        <motion.div 
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8"
          variants={containerVariants}
        >
          <AnimatePresence>
            {filteredProducts.map((product, index) => (
              <motion.div 
                key={product.id}
                variants={itemVariants}
                layout
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                transition={{ 
                  type: "spring",
                  stiffness: 260,
                  damping: 20,
                  delay: index * 0.05 
                }}
                className="group bg-white rounded-3xl overflow-hidden shadow-lg hover:shadow-2xl hover:shadow-pink-200/50 transition-all duration-500 transform hover:-translate-y-3 relative"
                onMouseEnter={() => setHoveredProduct(product.id)}
                onMouseLeave={() => setHoveredProduct(null)}
                whileHover={{ y: -10 }}
              >
                {/* Image Section */}
                <div className="relative overflow-hidden h-80 bg-gradient-to-br from-pink-50 to-pink-100">
                  {/* Badges */}
                  <div className="absolute top-4 left-4 z-10 flex flex-col gap-2">
                    {product.badge && (
                      <motion.span 
                        className={`px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider bg-gradient-to-r ${product.badgeColor} text-white shadow-lg`}
                        initial={{ x: -50, opacity: 0 }}
                        animate={{ x: 0, opacity: 1 }}
                        transition={{ delay: 0.2 }}
                      >
                        {product.badge}
                      </motion.span>
                    )}
                    {product.isNew && (
                      <motion.span 
                        className="bg-gradient-to-r from-emerald-400 to-emerald-500 px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider text-white shadow-lg"
                        initial={{ x: -50, opacity: 0 }}
                        animate={{ x: 0, opacity: 1 }}
                        transition={{ delay: 0.3 }}
                      >
                        ✨ Just In
                      </motion.span>
                    )}
                    {product.isSale && (
                      <motion.span 
                        className="bg-gradient-to-r from-red-400 to-red-500 px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider text-white shadow-lg animate-pulse"
                        initial={{ x: -50, opacity: 0 }}
                        animate={{ x: 0, opacity: 1 }}
                        transition={{ delay: 0.4 }}
                      >
                        🔥 Sale
                      </motion.span>
                    )}
                  </div>
                  
                  {/* Wishlist Button */}
                  <motion.button 
                    className="absolute top-4 right-4 z-10 w-10 h-10 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center hover:bg-pink-50 transition-all duration-300 shadow-lg"
                    whileHover={{ scale: 1.2, rotate: 10 }}
                    whileTap={{ scale: 0.9 }}
                  >
                    <span className="text-xl">♡</span>
                  </motion.button>
                  
                  {/* Product Image */}
                  <motion.img 
                    src={product.image} 
                    alt={product.name}
                    className="w-full h-full object-cover"
                    whileHover={{ scale: 1.1 }}
                    transition={{ duration: 0.6 }}
                  />
                  
                  {/* Overlay on Hover */}
                  <motion.div 
                    className={`absolute inset-0 bg-gradient-to-t from-pink-900/40 via-transparent to-transparent transition-opacity duration-500 flex items-end justify-center pb-6`}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: hoveredProduct === product.id ? 1 : 0 }}
                    transition={{ duration: 0.3 }}
                  >
                    <motion.button 
                      onClick={() => handleAddToCart(product)}
                      className="bg-gradient-to-r from-pink-600 to-pink-400 text-white px-8 py-3.5 rounded-full font-semibold text-sm hover:shadow-xl hover:shadow-pink-300/40 whitespace-nowrap flex items-center gap-2"
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      initial={{ y: 20, opacity: 0 }}
                      animate={{ y: 0, opacity: 1 }}
                      transition={{ type: "spring", stiffness: 300 }}
                    >
                      <span className="text-lg">+</span> Add to Wishlist
                    </motion.button>
                  </motion.div>
                </div>
                
                {/* Product Info */}
                <motion.div 
                  className="p-6"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.1 }}
                >
                  <div className="flex justify-between items-start mb-2">
                    <span className="text-xs text-pink-600 font-semibold uppercase tracking-wider bg-pink-50 px-3 py-1 rounded-full">
                      {product.category}
                    </span>
                    <motion.div 
                      className="flex items-center gap-1 text-sm text-[#5a3d3d]"
                      whileHover={{ scale: 1.1 }}
                    >
                      <span className="text-yellow-400">★</span>
                      {product.rating}
                      <span className="text-xs text-[#5a3d3d]/60">({product.reviews})</span>
                    </motion.div>
                  </div>
                  
                  <motion.h3 
                    className="text-xl font-bold text-[#2d1b1b] mt-2 group-hover:text-pink-600 transition-colors"
                    whileHover={{ x: 5 }}
                  >
                    {product.name}
                  </motion.h3>
                  
                  <motion.p 
                    className="text-[#5a3d3d]/80 text-sm mt-2 leading-relaxed line-clamp-2"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.2 }}
                  >
                    {product.description}
                  </motion.p>

                  {/* Features Tags */}
                  <div className="flex flex-wrap gap-1 mt-3">
                    {product.features.slice(0, 2).map((feature, idx) => (
                      <motion.span 
                        key={idx}
                        className="text-xs bg-pink-50 text-pink-600 px-2 py-1 rounded-full"
                        whileHover={{ scale: 1.05 }}
                      >
                        {feature}
                      </motion.span>
                    ))}
                    {product.features.length > 2 && (
                      <span className="text-xs text-[#5a3d3d]/50">+{product.features.length - 2}</span>
                    )}
                  </div>
                  
                  <div className="flex items-center gap-3 mt-4">
                    <motion.span 
                      className="text-2xl font-bold text-pink-600"
                      whileHover={{ scale: 1.1 }}
                    >
                      {product.price}
                    </motion.span>
                    {product.originalPrice && (
                      <span className="text-[#5a3d3d]/50 text-sm line-through">
                        {product.originalPrice}
                      </span>
                    )}
                    {product.originalPrice && (
                      <motion.span 
                        className="bg-green-100 text-green-700 text-xs font-bold px-2 py-1 rounded-full"
                        animate={{
                          scale: [1, 1.1, 1],
                        }}
                        transition={{
                          duration: 1.5,
                          repeat: Infinity,
                          ease: "easeInOut"
                        }}
                      >
                        Save {Math.round((1 - parseFloat(product.price.replace('$', '')) / parseFloat(product.originalPrice.replace('$', ''))) * 100)}%
                      </motion.span>
                    )}
                  </div>
                  
                  {/* Quick Actions */}
                  <div className="flex gap-2 mt-4 pt-4 border-t border-pink-50">
                    <motion.button 
                      className="flex-1 bg-gradient-to-r from-pink-600 to-pink-400 text-white px-4 py-2.5 rounded-xl font-semibold text-sm hover:shadow-lg hover:shadow-pink-300/30 transition-all duration-300"
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      Quick View
                    </motion.button>
                    <motion.button 
                      className="px-4 py-2.5 rounded-xl border-2 border-pink-200 hover:border-pink-400 hover:bg-pink-50 transition-all duration-300 text-[#2d1b1b] font-semibold text-sm"
                      whileHover={{ scale: 1.05, rotate: 10 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      🔍
                    </motion.button>
                  </div>
                </motion.div>
              </motion.div>
            ))}
          </AnimatePresence>
        </motion.div>
      </motion.section>

      {/* ===== Featured Banner ===== */}
      <motion.section 
        className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-pink-600 via-pink-500 to-amber-400 p-8 md:p-12 my-12 text-white"
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.6 }}
        whileHover={{ scale: 1.01 }}
      >
        <motion.div 
          className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl"
          animate={{
            x: [0, -20, 0],
            y: [0, 20, 0],
          }}
          transition={{
            duration: 5,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
        <motion.div 
          className="absolute bottom-0 left-0 w-48 h-48 bg-white/5 rounded-full blur-2xl"
          animate={{
            x: [0, 20, 0],
            y: [0, -20, 0],
          }}
          transition={{
            duration: 4,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 1
          }}
        />
        
        <div className="relative flex flex-col md:flex-row items-center justify-between gap-8">
          <div className="flex-1 text-center md:text-left">
            <motion.span 
              className="inline-block bg-white/20 backdrop-blur-sm px-4 py-1.5 rounded-full text-sm font-semibold mb-4"
              animate={{
                scale: [1, 1.05, 1],
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                ease: "easeInOut"
              }}
            >
              ✦ Limited Edition
            </motion.span>
            <motion.h3 
              className="text-3xl md:text-4xl font-bold mb-3"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              Exclusive Pink Collection
            </motion.h3>
            <motion.p 
              className="text-white/90 text-lg max-w-md mx-auto md:mx-0"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.4 }}
            >
              Be the first to own our limited edition rose gold collection. Only 100 pieces available.
            </motion.p>
          </div>
          <motion.button 
            className="bg-white text-pink-600 px-10 py-4 rounded-full font-bold hover:shadow-2xl transition-all duration-300 whitespace-nowrap"
            whileHover={{ scale: 1.1, rotate: -2 }}
            whileTap={{ scale: 0.95 }}
          >
            Shop Now →
          </motion.button>
        </div>
      </motion.section>

      {/* ===== Newsletter ===== */}
      <motion.section 
        className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-pink-100 via-pink-50 to-pink-100 p-8 sm:p-12 md:p-16 my-8 text-center border-2 border-white/50 shadow-xl"
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
      >
        <motion.div 
          className="absolute top-0 right-0 w-40 h-40 bg-pink-300/20 rounded-full blur-2xl"
          animate={{
            scale: [1, 1.2, 1],
          }}
          transition={{
            duration: 4,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
        <motion.div 
          className="absolute bottom-0 left-0 w-40 h-40 bg-pink-400/10 rounded-full blur-2xl"
          animate={{
            scale: [1, 1.3, 1],
          }}
          transition={{
            duration: 5,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 1
          }}
        />
        
        <div className="relative">
          <motion.div 
            className="text-6xl mb-4"
            animate={{
              rotate: [0, 10, -10, 0],
            }}
            transition={{
              duration: 4,
              repeat: Infinity,
              ease: "easeInOut"
            }}
          >
            💎
          </motion.div>
          <motion.h2 
            className="text-3xl sm:text-4xl md:text-5xl font-bold text-[#2d1b1b] mb-3"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            Join the <span className="bg-gradient-to-r from-pink-600 to-pink-400 bg-clip-text text-transparent">LUXE</span> Circle
          </motion.h2>
          <motion.p 
            className="text-[#5a3d3d] max-w-md mx-auto mb-8 text-lg"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.4 }}
          >
            Subscribe for exclusive access to new collections, private sales, and jewellery styling tips.
          </motion.p>
          <motion.div 
            className="flex flex-col sm:flex-row justify-center gap-3 max-w-lg mx-auto"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.6 }}
          >
            <motion.input 
              type="email" 
              placeholder="Enter your email address"
              className="flex-1 px-6 py-4 rounded-full border-2 border-pink-200 shadow-lg focus:ring-4 focus:ring-pink-300 outline-none text-[#2d1b1b] bg-white/80 backdrop-blur-sm"
              whileFocus={{ scale: 1.02 }}
            />
            <motion.button 
              className="bg-gradient-to-r from-pink-600 to-pink-400 text-white px-10 py-4 rounded-full font-semibold hover:shadow-2xl hover:shadow-pink-300/30 transition-all duration-300 flex items-center justify-center gap-2"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              Subscribe
              <motion.span
                animate={{ x: [0, 5, 0] }}
                transition={{ duration: 1.5, repeat: Infinity }}
              >
                →
              </motion.span>
            </motion.button>
          </motion.div>
          <motion.p 
            className="text-xs text-[#5a3d3d]/60 mt-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8 }}
          >
            ✦ No spam. Unsubscribe anytime.
          </motion.p>
        </div>
      </motion.section>

      {/* ===== CSS Animations ===== */}
      <style jsx>{`
        @keyframes slideInRight {
          from {
            transform: translateX(100px);
            opacity: 0;
          }
          to {
            transform: translateX(0);
            opacity: 1;
          }
        }
        
        .animate-slide-in-right {
          animation: slideInRight 0.5s ease-out forwards;
        }
        
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-10px); }
        }
        
        .animate-float {
          animation: float 3s ease-in-out infinite;
        }
      `}</style>
    </main>
  );
};

export default JewelleryBoutique;
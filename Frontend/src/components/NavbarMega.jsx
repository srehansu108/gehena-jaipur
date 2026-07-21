// src/components/NavbarMega.jsx - With Real Wishlist Integration
import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Search, User, Heart, ShoppingBag, MapPin, 
  ChevronDown, Menu, X, Phone, Truck, Shield, 
  Star, LogIn, UserPlus, Heart as HeartOutline,
  Gem, Sparkles, Flower2, Crown, TrendingUp,
  Clock, ArrowRight, Tag, Filter
} from 'lucide-react';
import { useWishlist } from '../contexts/WishlistContext'; // ✅ ADD THIS
import { useCart } from '../contexts/CartContext'; // ✅ ADD THIS
import { useAuth } from '../contexts/AuthContext'; // ✅ ADD THIS

export function NavbarMega() {
  const [activeDropdown, setActiveDropdown] = useState(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [mobileSubmenuOpen, setMobileSubmenuOpen] = useState(null);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [searchSuggestions, setSearchSuggestions] = useState([]);
  const [selectedSuggestion, setSelectedSuggestion] = useState(-1);
  const [scrolled, setScrolled] = useState(false);
  const [hoveredCategory, setHoveredCategory] = useState(null);
  const [hoveredSubItem, setHoveredSubItem] = useState(null);
  const [isSearching, setIsSearching] = useState(false);
  const searchRef = useRef(null);
  const searchInputRef = useRef(null);
  const navigate = useNavigate();

  // ✅ Get real counts from contexts
  const { getWishlistCount, loading: wishlistLoading } = useWishlist();
  const { itemCount: cartCount } = useCart();
  const { isAuthenticated } = useAuth();

  const logoUrl = "/images/logo/logo.jpg";

  // ✅ Get real wishlist count
  const wishlistCount = isAuthenticated ? getWishlistCount() : 0;

  // Scroll effect
  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Click outside search
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (searchRef.current && !searchRef.current.contains(e.target)) {
        setSearchOpen(false);
        setSearchResults([]);
        setSearchSuggestions([]);
        setSelectedSuggestion(-1);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (!searchOpen) return;
      
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setSelectedSuggestion(prev => 
          prev < searchSuggestions.length - 1 ? prev + 1 : prev
        );
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setSelectedSuggestion(prev => prev > 0 ? prev - 1 : -1);
      } else if (e.key === 'Enter') {
        e.preventDefault();
        if (selectedSuggestion >= 0 && selectedSuggestion < searchSuggestions.length) {
          const suggestion = searchSuggestions[selectedSuggestion];
          handleSuggestionClick(suggestion);
        } else if (searchQuery.trim()) {
          handleSearch();
        }
      } else if (e.key === 'Escape') {
        setSearchOpen(false);
        setSearchResults([]);
        setSearchSuggestions([]);
        setSelectedSuggestion(-1);
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [searchOpen, searchSuggestions, selectedSuggestion, searchQuery]);

  // Top-level navigation items
  const topNavItems = [
    { title: 'Home', slug: '/' },
    { title: 'Shop', slug: '/shop' },
    { title: 'About Us', slug: '/about' },
    { title: 'Boutiques', slug: '/botique' },
    { title: 'Contact Us', slug: '/contact' },
  ];

  // Mega menu categories with sub-item images
  const shopCategories = [
    {
      title: 'Silver Jewelry',
      slug: 'silver-jewelry',
      keywords: ['silver', 'necklace', 'earrings', 'rings', 'bracelet', 'pendants', 'turkish'],
      items: [
        { name: 'Necklace', image: 'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?w=300&h=200&fit=crop' },
        { name: 'Earrings', image: 'https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?w=300&h=200&fit=crop' },
        { name: 'Rings', image: 'https://images.unsplash.com/photo-1605100804763-247f67b3557a?w=300&h=200&fit=crop' },
        { name: 'Bracelet', image: 'https://images.unsplash.com/photo-1617038260897-41a1f14a8ca0?w=300&h=200&fit=crop' },
        { name: 'Pendants', image: 'https://images.unsplash.com/photo-1586495777744-4413f21062fa?w=300&h=200&fit=crop' },
        { name: 'Turkish Jewelry', image: 'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=300&h=200&fit=crop' },
      ],
    },
    {
      title: 'Gemstone Jewelry',
      slug: 'gemstone-jewelry',
      keywords: ['gemstone', 'necklace', 'earrings', 'bracelet', 'chains', 'beads', 'pendant'],
      items: [
        { name: 'Necklace', image: 'https://images.unsplash.com/photo-1573408301185-9146fe634ad0?w=300&h=200&fit=crop' },
        { name: 'Earrings', image: 'https://images.unsplash.com/photo-1602751584553-8ba4c1acd4c3?w=300&h=200&fit=crop' },
        { name: 'Bracelet', image: 'https://images.unsplash.com/photo-1603561591411-07134e71a2a9?w=300&h=200&fit=crop' },
        { name: 'Chains', image: 'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?w=300&h=200&fit=crop' },
        { name: 'Gemstone Beads Pendant', image: 'https://images.unsplash.com/photo-1586495777744-4413f21062fa?w=300&h=200&fit=crop' },
      ],
    },
    {
      title: 'Fashion Jewelry',
      slug: 'fashion-jewelry',
      keywords: ['fashion', 'necklace', 'earrings', 'rings', 'bracelet', 'pendants', 'accessories'],
      items: [
        { name: 'Necklace', image: 'https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?w=300&h=200&fit=crop' },
        { name: 'Earrings', image: 'https://images.unsplash.com/photo-1605100804763-247f67b3557a?w=300&h=200&fit=crop' },
        { name: 'Rings', image: 'https://images.unsplash.com/photo-1617038260897-41a1f14a8ca0?w=300&h=200&fit=crop' },
        { name: 'Bracelet', image: 'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=300&h=200&fit=crop' },
        { name: 'Pendants', image: 'https://images.unsplash.com/photo-1586495777744-4413f21062fa?w=300&h=200&fit=crop' },
        { name: 'Accessories', image: 'https://images.unsplash.com/photo-1573408301185-9146fe634ad0?w=300&h=200&fit=crop' },
      ],
    },
    {
      title: 'Tribal Jewelry',
      slug: 'tribal-jewelry',
      keywords: ['tribal', 'necklace', 'earrings', 'bracelet', 'pendant sets', 'pendants'],
      items: [
        { name: 'Necklace', image: 'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=300&h=200&fit=crop' },
        { name: 'Earrings', image: 'https://images.unsplash.com/photo-1603561591411-07134e71a2a9?w=300&h=200&fit=crop' },
        { name: 'Bracelet', image: 'https://images.unsplash.com/photo-1617038260897-41a1f14a8ca0?w=300&h=200&fit=crop' },
        { name: 'Pendant Sets', image: 'https://images.unsplash.com/photo-1586495777744-4413f21062fa?w=300&h=200&fit=crop' },
        { name: 'Pendants', image: 'https://images.unsplash.com/photo-1605100804763-247f67b3557a?w=300&h=200&fit=crop' },
      ],
    },
    {
      title: 'Jadau Jewelry',
      slug: 'jadau-jewelry',
      keywords: ['jadau', 'necklace', 'earrings', 'lac', 'traditional'],
      items: [
        { name: 'Jadau Necklace', image: 'https://images.unsplash.com/photo-1586495777744-4413f21062fa?w=300&h=200&fit=crop' },
        { name: 'Earrings', image: 'https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?w=300&h=200&fit=crop' },
        { name: 'Lac Jewelry', image: 'https://images.unsplash.com/photo-1573408301185-9146fe634ad0?w=300&h=200&fit=crop' },
      ],
    },
    {
      title: 'Pachi Jewelry',
      slug: 'pachi-jewelry',
      keywords: ['pachi', 'pacchi', 'sets', 'rings'],
      items: [
        { name: 'Pacchi Sets', image: 'https://images.unsplash.com/photo-1602751584553-8ba4c1acd4c3?w=300&h=200&fit=crop' },
        { name: 'Pacchi Rings', image: 'https://images.unsplash.com/photo-1605100804763-247f67b3557a?w=300&h=200&fit=crop' },
      ],
    },
    {
      title: 'Cubic Zirconia',
      slug: 'cubic-zirconia',
      keywords: ['cubic zirconia', 'cz', 'necklace', 'earrings', 'chains', 'bracelets'],
      items: [
        { name: 'CZ Necklace', image: 'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?w=300&h=200&fit=crop' },
        { name: 'CZ Earrings', image: 'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=300&h=200&fit=crop' },
        { name: 'CZ Chains', image: 'https://images.unsplash.com/photo-1617038260897-41a1f14a8ca0?w=300&h=200&fit=crop' },
        { name: 'CZ Bracelets', image: 'https://images.unsplash.com/photo-1603561591411-07134e71a2a9?w=300&h=200&fit=crop' },
      ],
    },
  ];

  // Quick links
  const quickLinks = [
    { title: 'New Arrivals', slug: 'new-arrivals', keywords: ['new', 'arrivals', 'latest'] },
    { title: 'Best Sellers', slug: 'best-sellers', keywords: ['best', 'sellers', 'popular', 'top'] },
    { title: 'Exclusive Sales', slug: 'exclusive-sales', keywords: ['exclusive', 'sale', 'discount'] },
  ];

  // Popular search terms
  const popularSearches = [
    'Diamond Ring',
    'Gold Necklace',
    'Silver Earrings',
    'Gemstone Bracelet',
    'Mangalsutra',
    'Wedding Set'
  ];

  // Search function (keep existing)
  const performSearch = (query) => {
    if (!query.trim()) {
      setSearchResults([]);
      setSearchSuggestions([]);
      return;
    }

    setIsSearching(true);
    const lowerQuery = query.toLowerCase().trim();
    
    const results = [];
    const suggestions = [];

    shopCategories.forEach(category => {
      const categoryMatch = 
        category.title.toLowerCase().includes(lowerQuery) ||
        category.keywords.some(k => k.toLowerCase().includes(lowerQuery));
      
      if (categoryMatch) {
        suggestions.push({
          type: 'category',
          title: category.title,
          slug: category.slug,
          image: category.items[0]?.image,
          matchType: 'Category'
        });
      }

      category.items.forEach(item => {
        const itemMatch = item.name.toLowerCase().includes(lowerQuery);
        if (itemMatch) {
          results.push({
            type: 'subitem',
            title: item.name,
            category: category.title,
            slug: category.slug,
            image: item.image,
            matchType: 'Product'
          });
          suggestions.push({
            type: 'subitem',
            title: item.name,
            category: category.title,
            slug: category.slug,
            image: item.image,
            matchType: 'Product'
          });
        }
      });
    });

    quickLinks.forEach(link => {
      const linkMatch = 
        link.title.toLowerCase().includes(lowerQuery) ||
        link.keywords.some(k => k.toLowerCase().includes(lowerQuery));
      
      if (linkMatch) {
        suggestions.push({
          type: 'quicklink',
          title: link.title,
          slug: link.slug,
          matchType: 'Quick Link'
        });
      }
    });

    popularSearches.forEach(term => {
      if (term.toLowerCase().includes(lowerQuery)) {
        suggestions.push({
          type: 'popular',
          title: term,
          matchType: 'Popular Search'
        });
      }
    });

    const uniqueSuggestions = [];
    const seen = new Set();
    suggestions.forEach(item => {
      const key = item.type + item.title;
      if (!seen.has(key)) {
        seen.add(key);
        uniqueSuggestions.push(item);
      }
    });

    setSearchSuggestions(uniqueSuggestions.slice(0, 8));
    setSearchResults(results.slice(0, 6));
    setIsSearching(false);
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      if (searchQuery) {
        performSearch(searchQuery);
      } else {
        setSearchResults([]);
        setSearchSuggestions([]);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  const handleSearch = () => {
    if (searchQuery.trim()) {
      navigate(`/products?search=${encodeURIComponent(searchQuery)}`);
      setSearchOpen(false);
      setSearchQuery('');
      setSearchResults([]);
      setSearchSuggestions([]);
      setSelectedSuggestion(-1);
    }
  };

  const handleSuggestionClick = (suggestion) => {
    if (suggestion.type === 'category') {
      navigate(`/category/${suggestion.slug}`);
    } else if (suggestion.type === 'subitem') {
      navigate(`/category/${suggestion.slug}?subcategory=${suggestion.title.toLowerCase().replace(/ /g, '-')}`);
    } else if (suggestion.type === 'quicklink') {
      navigate(`/${suggestion.slug}`);
    } else if (suggestion.type === 'popular') {
      setSearchQuery(suggestion.title);
      performSearch(suggestion.title);
    }
    setSearchOpen(false);
    setSearchQuery('');
    setSearchResults([]);
    setSearchSuggestions([]);
    setSelectedSuggestion(-1);
  };

  const handleNavigate = (path) => {
    navigate(path);
    setMobileMenuOpen(false);
    setActiveDropdown(null);
    setSearchOpen(false);
  };

  const handleCategoryClick = (categorySlug, subItem = null) => {
    if (subItem) {
      const subItemLower = subItem.toLowerCase().replace(/ /g, '-');
      const singularSubItem = subItemLower.endsWith('s') && 
                             !subItemLower.endsWith('ss') && 
                             !subItemLower.endsWith('es') 
                             ? subItemLower.slice(0, -1) 
                             : subItemLower;
      navigate(`/product-category/${categorySlug}/${singularSubItem}`);
    } else {
      navigate(`/product-category/${categorySlug}`);
    }
    setActiveDropdown(null);
    setMobileMenuOpen(false);
  };

  const getSubItemImage = (categoryTitle, subItemName) => {
    const category = shopCategories.find(c => c.title === categoryTitle);
    if (!category) return null;
    const subItem = category.items.find(item => item.name === subItemName);
    return subItem?.image || null;
  };

  const getCategoryFallbackImage = (categoryTitle) => {
    const category = shopCategories.find(c => c.title === categoryTitle);
    return category?.items[0]?.image || 'https://images.unsplash.com/photo-1605100804763-247f67b3557a?w=300&h=200&fit=crop';
  };

  const getDisplayImage = () => {
    if (hoveredSubItem) {
      const image = getSubItemImage(hoveredCategory, hoveredSubItem);
      if (image) return image;
    }
    return getCategoryFallbackImage(hoveredCategory);
  };

  return (
    <>
      {/* Top Bar */}
      <div className="hidden md:block bg-gradient-to-r from-pink-50 to-rose-50 border-b border-pink-100">
        <div className="max-w-7xl mx-auto px-4 py-1.5">
          <div className="flex flex-wrap justify-between items-center text-xs">
            <div className="flex flex-wrap items-center gap-4">
              <div className="flex items-center gap-1 text-gray-700 cursor-pointer hover:text-pink-600">
                <MapPin className="w-3 h-3" />
                <span>Find a Store</span>
              </div>
              <div className="flex items-center gap-1 text-gray-700">
                <Truck className="w-3 h-3 text-pink-500" />
                <span>Free Shipping on orders above ₹50,000</span>
              </div>
              <div className="hidden lg:flex items-center gap-1 text-gray-700">
                <Shield className="w-3 h-3 text-green-600" />
                <span>100% Certified Jewelry</span>
              </div>
            </div>
            <div className="flex flex-wrap items-center gap-4 text-gray-700">
              <span className="cursor-pointer hover:text-pink-600 hidden sm:inline">Track Order</span>
              <span className="cursor-pointer hover:text-pink-600 hidden lg:inline">Become a Partner</span>
              <span className="cursor-pointer hover:text-pink-600 flex items-center gap-1">
                <Phone className="w-3 h-3" />
                <span className="hidden sm:inline">Customer Care</span>
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Navbar */}
      <div className={`sticky top-0 z-50 transition-all duration-300 ${scrolled ? 'bg-white/95 backdrop-blur-md shadow-lg border-b border-gray-100' : 'bg-white border-b border-gray-100'}`}>
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex items-center justify-between h-16 lg:h-[72px]">

            {/* Logo */}
            <div onClick={() => handleNavigate('/')} className="flex items-center cursor-pointer shrink-0">
              <img src={logoUrl} alt="Logo" className="h-8 sm:h-10 w-auto transition-transform hover:scale-105" />
            </div>

            {/* Desktop Navigation */}
            <div className="hidden lg:flex items-center gap-6 xl:gap-8">
              {topNavItems.map((item) => {
                const isShop = item.slug === '/shop';
                return (
                  <div
                    key={item.title}
                    className="relative"
                    onMouseEnter={() => {
                      if (isShop) {
                        setActiveDropdown('shop');
                        if (!hoveredCategory) {
                          setHoveredCategory(shopCategories[0]?.title || null);
                        }
                      }
                    }}
                    onMouseLeave={() => {
                      if (isShop) {
                        setActiveDropdown(null);
                        setHoveredCategory(null);
                        setHoveredSubItem(null);
                      }
                    }}
                  >
                    <button
                      onClick={() => {
                        if (!isShop) handleNavigate(item.slug);
                      }}
                      className={`flex items-center gap-1 text-sm font-semibold text-gray-800 hover:text-pink-600 transition-colors py-2 ${isShop ? 'cursor-default' : 'cursor-pointer'}`}
                    >
                      {item.title}
                      {isShop && <ChevronDown className={`w-4 h-4 transition-transform duration-200 ${activeDropdown === 'shop' ? 'rotate-180' : ''}`} />}
                    </button>

                    {/* Mega Dropdown */}
                    {isShop && activeDropdown === 'shop' && (
                      <div 
                        className="absolute top-full left-1/2 transform -translate-x-1/2 mt-1 w-screen max-w-6xl bg-white rounded-2xl shadow-2xl border border-gray-100 p-6 animate-dropdown"
                        style={{
                          animation: 'dropdownFade 0.25s ease-out forwards',
                          transformOrigin: 'top center'
                        }}
                      >
                        <div className="grid grid-cols-5 gap-6">
                          <div className="col-span-4 grid grid-cols-4 gap-6">
                            {shopCategories.map((cat) => (
                              <div key={cat.title} className="relative">
                                <div
                                  onClick={() => handleCategoryClick(cat.slug)}
                                  className="cursor-pointer mb-2"
                                >
                                  <span className="font-semibold text-sm text-gray-900">
                                    {cat.title}
                                  </span>
                                </div>
                                <ul className="space-y-1.5">
                                  {cat.items.map((sub) => (
                                    <li key={sub.name}>
                                      <button
                                        onClick={() => handleCategoryClick(cat.slug, sub.name)}
                                        className="group/sub w-full text-left transition-colors duration-200"
                                        onMouseEnter={() => {
                                          setHoveredSubItem(sub.name);
                                          setHoveredCategory(cat.title);
                                        }}
                                        onMouseLeave={() => {
                                          setHoveredSubItem(null);
                                        }}
                                      >
                                        <span className={`text-sm transition-colors duration-200 ${hoveredSubItem === sub.name && hoveredCategory === cat.title ? 'text-pink-600 font-medium' : 'text-gray-600 group-hover/sub:text-pink-600'}`}>
                                          {sub.name}
                                        </span>
                                      </button>
                                    </li>
                                  ))}
                                </ul>
                              </div>
                            ))}
                          </div>

                          <div className="col-span-1">
                            <div className="sticky top-0">
                              <div className="bg-gradient-to-br from-pink-50 to-rose-50 rounded-xl p-4 overflow-hidden">
                                {hoveredCategory ? (
                                  <>
                                    <div className="relative h-48 rounded-lg overflow-hidden mb-3">
                                      <img 
                                        src={getDisplayImage()}
                                        alt={hoveredSubItem || hoveredCategory}
                                        className="w-full h-full object-cover transition-transform duration-500 hover:scale-110"
                                        onError={(e) => {
                                          e.target.src = 'https://images.unsplash.com/photo-1605100804763-247f67b3557a?w=300&h=200&fit=crop';
                                        }}
                                      />
                                      <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent"></div>
                                      <div className="absolute bottom-2 left-2 right-2">
                                        <p className="text-white text-xs font-semibold bg-black/40 backdrop-blur-sm px-2 py-1 rounded-full inline-block">
                                          {hoveredSubItem || hoveredCategory}
                                        </p>
                                      </div>
                                    </div>
                                    <div className="space-y-1">
                                      <p className="text-xs text-gray-600">
                                        <span className="font-semibold text-pink-600">
                                          {hoveredSubItem ? 'Selected:' : 'Category:'}
                                        </span>
                                        <span className="ml-1 font-medium">
                                          {hoveredSubItem || hoveredCategory}
                                        </span>
                                      </p>
                                      {hoveredSubItem && (
                                        <p className="text-[10px] text-gray-500">
                                          From {hoveredCategory}
                                        </p>
                                      )}
                                      <button 
                                        onClick={() => {
                                          const cat = shopCategories.find(c => c.title === hoveredCategory);
                                          if (cat) {
                                            if (hoveredSubItem) {
                                              handleCategoryClick(cat.slug, hoveredSubItem);
                                            } else {
                                              handleCategoryClick(cat.slug);
                                            }
                                          }
                                        }}
                                        className="text-xs text-pink-600 font-medium hover:text-pink-700 mt-1 block"
                                      >
                                        View {hoveredSubItem || 'All'} →
                                      </button>
                                    </div>
                                  </>
                                ) : (
                                  <div className="h-48 flex items-center justify-center">
                                    <Gem className="w-12 h-12 text-pink-300" />
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>

                        <div className="mt-4 pt-4 border-t border-gray-100 flex items-center justify-between">
                          <div className="flex items-center gap-6">
                            {quickLinks.map((link) => (
                              <button
                                key={link.title}
                                onClick={() => handleNavigate(`/${link.slug}`)}
                                className="group/quick text-xs text-gray-600 hover:text-pink-600 transition-colors font-medium"
                              >
                                <span className="transition-colors duration-200 group-hover/quick:text-pink-600">
                                  {link.title}
                                </span>
                              </button>
                            ))}
                          </div>
                          <button
                            onClick={() => handleNavigate('/product-category/all')}
                            className="text-xs bg-gradient-to-r from-pink-500 to-rose-500 text-white px-4 py-1.5 rounded-full hover:from-pink-600 hover:to-rose-600 transition-all shadow-md hover:shadow-pink-lg"
                          >
                            Explore All
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Right Icons */}
            <div className="flex items-center gap-1 sm:gap-2 lg:gap-3 shrink-0">
              {/* Search */}
              <div className="relative" ref={searchRef}>
                <button
                  onClick={() => {
                    setSearchOpen(!searchOpen);
                    if (!searchOpen) {
                      setTimeout(() => searchInputRef.current?.focus(), 100);
                    }
                  }}
                  className="p-2 rounded-xl hover:bg-pink-50 transition-all group/search"
                >
                  <Search className="w-5 h-5 text-gray-700 group-hover/search:text-pink-600 transition-colors" />
                </button>

                {searchOpen && (
                  <div className="absolute top-full right-0 mt-2 w-[480px] max-w-[90vw] bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden animate-slideDown">
                    <div className="p-4 border-b border-gray-100">
                      <div className="flex items-center gap-2 bg-gray-50 rounded-xl px-4 focus-within:bg-white focus-within:ring-2 focus-within:ring-pink-500 transition-all">
                        <Search className="w-5 h-5 text-gray-400 flex-shrink-0" />
                        <input
                          ref={searchInputRef}
                          type="text"
                          placeholder="Search for jewelry, categories, collections..."
                          value={searchQuery}
                          onChange={(e) => setSearchQuery(e.target.value)}
                          className="flex-1 py-3 bg-transparent outline-none text-sm text-gray-800 placeholder-gray-400"
                          autoFocus
                        />
                        {searchQuery && (
                          <button
                            onClick={() => {
                              setSearchQuery('');
                              setSearchResults([]);
                              setSearchSuggestions([]);
                              searchInputRef.current?.focus();
                            }}
                            className="text-gray-400 hover:text-gray-600 transition-colors"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </div>

                    {searchQuery && (
                      <div className="max-h-[400px] overflow-y-auto">
                        {searchSuggestions.length > 0 && (
                          <div className="p-3">
                            <div className="flex items-center gap-2 mb-2">
                              <TrendingUp className="w-4 h-4 text-pink-600" />
                              <span className="text-xs font-semibold text-gray-700 uppercase tracking-wider">Suggestions</span>
                            </div>
                            <div className="space-y-1">
                              {searchSuggestions.map((suggestion, index) => (
                                <button
                                  key={index}
                                  onClick={() => handleSuggestionClick(suggestion)}
                                  onMouseEnter={() => setSelectedSuggestion(index)}
                                  className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-all ${
                                  selectedSuggestion === index
                                    ? 'bg-pink-50 text-pink-600'
                                    : 'hover:bg-pink-50/30'
                                  }`}
                                >
                                  {suggestion.image && (
                                    <img 
                                      src={suggestion.image} 
                                      alt={suggestion.title}
                                      className="w-10 h-10 rounded-lg object-cover"
                                    />
                                  )}
                                  <div className="flex-1 text-left">
                                    <div className="flex items-center gap-2">
                                      <span className={`text-sm font-medium ${selectedSuggestion === index ? 'text-pink-600' : 'text-gray-800'}`}>
                                        {suggestion.title}
                                      </span>
                                      <span className="text-[10px] px-2 py-0.5 bg-gray-100 rounded-full text-gray-500">
                                        {suggestion.matchType}
                                      </span>
                                    </div>
                                    {suggestion.category && (
                                      <p className="text-xs text-gray-400">{suggestion.category}</p>
                                    )}
                                  </div>
                                  <ArrowRight className={`w-4 h-4 ${selectedSuggestion === index ? 'text-pink-600' : 'text-gray-300'}`} />
                                </button>
                              ))}
                            </div>
                          </div>
                        )}

                        {searchSuggestions.length === 0 && !isSearching && (
                          <div className="p-8 text-center">
                            <Gem className="w-12 h-12 text-pink-300 mx-auto mb-3" />
                            <p className="text-gray-600 font-medium">No results found</p>
                            <p className="text-sm text-gray-400 mt-1">Try adjusting your search terms</p>
                          </div>
                        )}
                      </div>
                    )}

                    {!searchQuery && (
                      <div className="p-4">
                        <div className="flex items-center gap-2 mb-3">
                          <Clock className="w-4 h-4 text-pink-600" />
                          <span className="text-xs font-semibold text-gray-700 uppercase tracking-wider">Popular Searches</span>
                        </div>
                        <div className="flex flex-wrap gap-2">
                          {popularSearches.map((term, index) => (
                            <button
                              key={index}
                              onClick={() => {
                                setSearchQuery(term);
                                performSearch(term);
                              }}
                              className="px-3 py-1.5 bg-gray-50 hover:bg-pink-50 hover:text-pink-600 rounded-full text-sm text-gray-600 transition-all"
                            >
                              {term}
                            </button>
                          ))}
                        </div>
                        <div className="mt-4 border-t border-gray-100 pt-4">
                          <div className="flex items-center gap-2 mb-3">
                            <Tag className="w-4 h-4 text-pink-600" />
                            <span className="text-xs font-semibold text-gray-700 uppercase tracking-wider">Quick Links</span>
                          </div>
                          <div className="grid grid-cols-3 gap-2">
                            {quickLinks.map((link) => (
                              <button
                                key={link.title}
                                onClick={() => handleNavigate(`/${link.slug}`)}
                                className="px-3 py-2 bg-gray-50 hover:bg-pink-50 hover:text-pink-600 rounded-lg text-sm text-gray-600 transition-all text-center"
                              >
                                {link.title}
                              </button>
                            ))}
                          </div>
                        </div>
                      </div>
                    )}

                    {searchQuery && searchSuggestions.length > 0 && (
                      <div className="p-3 border-t border-gray-100 bg-gray-50">
                        <button
                          onClick={handleSearch}
                          className="w-full bg-gradient-to-r from-pink-500 to-rose-500 text-white py-2.5 rounded-xl font-medium hover:from-pink-600 hover:to-rose-600 transition-all flex items-center justify-center gap-2 shadow-md hover:shadow-pink-lg"
                        >
                          <Search className="w-4 h-4" />
                          View all results for "{searchQuery}"
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* ✅ Wishlist - Now with real count */}
              <div className="relative">
                <button 
                  onClick={() => handleNavigate('/wishlist')} 
                  className="p-2 rounded-xl hover:bg-pink-50 transition-all group/wishlist relative"
                >
                  <Heart className="w-5 h-5 text-gray-700 group-hover/wishlist:text-pink-600 transition-colors" />
                  {wishlistCount > 0 && !wishlistLoading && (
                    <span className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] bg-pink-500 text-white text-[10px] rounded-full flex items-center justify-center font-bold px-1 animate-pulse">
                      {wishlistCount}
                    </span>
                  )}
                </button>
              </div>

              {/* User */}
              <button onClick={() => handleNavigate('/account')} className="p-2 rounded-xl hover:bg-pink-50 transition-all group/user">
                <User className="w-5 h-5 text-gray-700 group-hover/user:text-pink-600 transition-colors" />
              </button>

              {/* ✅ Cart - Now with real count */}
              <div className="relative">
                <button onClick={() => handleNavigate('/cart')} className="p-2 rounded-xl hover:bg-pink-50 transition-all group/cart">
                  <ShoppingBag className="w-5 h-5 text-gray-700 group-hover/cart:text-pink-600 transition-colors" />
                </button>
                {cartCount > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] bg-pink-500 text-white text-[10px] rounded-full flex items-center justify-center font-bold px-1">
                    {cartCount}
                  </span>
                )}
              </div>

              {/* Mobile Menu Toggle */}
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="lg:hidden p-2 hover:bg-pink-50 rounded-xl transition-all group/menu"
              >
                <Menu className="w-5 h-5 text-gray-700 group-hover/menu:text-pink-600 transition-colors" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Sidebar */}
      {mobileMenuOpen && (
        <>
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 lg:hidden" onClick={() => setMobileMenuOpen(false)} />
          <div className="fixed top-0 left-0 h-full w-80 sm:w-96 bg-white shadow-2xl z-50 overflow-y-auto animate-slideInLeft lg:hidden">
            <div className="bg-gradient-to-r from-pink-50 to-rose-50 p-4 border-b border-pink-100">
              <div className="flex justify-between items-center">
                <img src={logoUrl} alt="Logo" className="h-8 w-auto" />
                <button onClick={() => setMobileMenuOpen(false)} className="p-2 hover:bg-white/50 rounded-xl transition-all">
                  <X className="w-5 h-5 text-gray-700 hover:text-pink-600 transition-colors" />
                </button>
              </div>
            </div>
            <div className="p-4">
              {topNavItems.map((item) => {
                const isShop = item.slug === '/shop';
                return (
                  <div key={item.title} className="mb-1">
                    {isShop ? (
                      <>
                        <button
                          onClick={() => setMobileSubmenuOpen(mobileSubmenuOpen === 'shop' ? null : 'shop')}
                          className="flex justify-between items-center w-full py-3 px-3 rounded-xl hover:bg-pink-50 transition-all group"
                        >
                          <span className="font-semibold text-gray-800 group-hover:text-pink-600 transition-colors">Shop</span>
                          <ChevronDown className={`w-4 h-4 text-gray-400 transition-all ${mobileSubmenuOpen === 'shop' ? 'rotate-180 text-pink-600' : 'group-hover:text-pink-600'}`} />
                        </button>
                        {mobileSubmenuOpen === 'shop' && (
                          <div className="ml-4 mt-1 space-y-1">
                            {shopCategories.map((cat) => (
                              <div key={cat.title} className="mb-2">
                                <button
                                  onClick={() => handleCategoryClick(cat.slug)}
                                  className="block w-full text-left py-1.5 px-3 text-sm font-semibold text-gray-700 hover:text-pink-600 transition-colors"
                                >
                                  {cat.title}
                                </button>
                                <div className="ml-3 space-y-0.5">
                                  {cat.items.map((sub) => (
                                    <button
                                      key={sub.name}
                                      onClick={() => handleCategoryClick(cat.slug, sub.name)}
                                      className="block w-full text-left py-1 px-3 text-sm text-gray-600 hover:text-pink-600 transition-colors"
                                    >
                                      {sub.name}
                                    </button>
                                  ))}
                                </div>
                              </div>
                            ))}
                            <div className="border-t border-gray-200 my-2 pt-2">
                              {quickLinks.map((link) => (
                                <button
                                  key={link.title}
                                  onClick={() => handleNavigate(`/${link.slug}`)}
                                  className="block w-full text-left py-2 px-3 text-sm font-medium text-gray-700 hover:text-pink-600 transition-colors"
                                >
                                  {link.title}
                                </button>
                              ))}
                              <button
                                onClick={() => handleNavigate('/products')}
                                className="block w-full text-left py-2 px-3 text-sm font-bold text-pink-600 hover:text-pink-700 transition-colors"
                              >
                                View All →
                              </button>
                            </div>
                          </div>
                        )}
                      </>
                    ) : (
                      <button
                        onClick={() => handleNavigate(item.slug)}
                        className="block w-full text-left py-3 px-3 font-semibold text-gray-800 hover:text-pink-600 rounded-xl hover:bg-pink-50 transition-all"
                      >
                        {item.title}
                      </button>
                    )}
                  </div>
                );
              })}

              <div className="border-t border-gray-200 my-3 pt-3 space-y-1">
                {!isAuthenticated ? (
                  <>
                    <button onClick={() => handleNavigate('/login')} className="flex items-center gap-3 w-full py-2 px-3 rounded-xl hover:bg-pink-50 transition-all group">
                      <LogIn className="w-4 h-4 text-gray-600 group-hover:text-pink-600 transition-colors" />
                      <span className="text-gray-700 group-hover:text-pink-600 transition-colors">Login</span>
                    </button>
                    <button onClick={() => handleNavigate('/signup')} className="flex items-center gap-3 w-full py-2 px-3 rounded-xl hover:bg-pink-50 transition-all group">
                      <UserPlus className="w-4 h-4 text-gray-600 group-hover:text-pink-600 transition-colors" />
                      <span className="text-gray-700 group-hover:text-pink-600 transition-colors">Register</span>
                    </button>
                  </>
                ) : (
                  <button onClick={() => handleNavigate('/account')} className="flex items-center gap-3 w-full py-2 px-3 rounded-xl hover:bg-pink-50 transition-all group">
                    <User className="w-4 h-4 text-gray-600 group-hover:text-pink-600 transition-colors" />
                    <span className="text-gray-700 group-hover:text-pink-600 transition-colors">My Account</span>
                  </button>
                )}
                <button onClick={() => handleNavigate('/wishlist')} className="flex items-center gap-3 w-full py-2 px-3 rounded-xl hover:bg-pink-50 transition-all group">
                  <HeartOutline className="w-4 h-4 text-gray-600 group-hover:text-pink-600 transition-colors" />
                  <span className="text-gray-700 group-hover:text-pink-600 transition-colors">
                    Wishlist
                    {wishlistCount > 0 && (
                      <span className="ml-2 bg-pink-500 text-white text-xs px-2 py-0.5 rounded-full">
                        {wishlistCount}
                      </span>
                    )}
                  </span>
                </button>
              </div>
            </div>
          </div>
        </>
      )}

      {/* Animations */}
      <style jsx global>{`
        @keyframes dropdownFade {
          0% {
            opacity: 0;
            transform: translateX(-50%) scale(0.98) translateY(-8px);
          }
          100% {
            opacity: 1;
            transform: translateX(-50%) scale(1) translateY(0);
          }
        }
        
        @keyframes slideDown {
          from { opacity: 0; transform: translateY(-8px); }
          to { opacity: 1; transform: translateY(0); }
        }
        
        @keyframes slideInLeft {
          from { transform: translateX(-100%); }
          to { transform: translateX(0); }
        }
        
        .animate-dropdown {
          animation: dropdownFade 0.25s ease-out forwards;
        }
        
        .animate-slideDown {
          animation: slideDown 0.2s ease-out;
        }
        
        .animate-slideInLeft {
          animation: slideInLeft 0.3s ease-out;
        }
      `}</style>
    </>
  );
}
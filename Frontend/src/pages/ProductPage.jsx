// src/pages/ProductPage.jsx - Hierarchical SEO-Friendly URLs with Cart Integration ✅

import { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { 
  Heart, Eye, Star, Filter, ChevronDown, 
  X, ShoppingBag, Share2, Truck, Shield, 
  RotateCcw, Gem, ChevronLeft, ChevronRight,
  ArrowLeft, Search, Grid, List, Loader
} from 'lucide-react';
import productService from '../services/productService';
import { ProductCard } from '../components/ProductCard';
import { useCart } from '../contexts/CartContext'; // ✅ ADDED
import { useAuth } from '../contexts/AuthContext'; // ✅ ADDED

// ============================================
// 🔥 CATEGORY DISPLAY NAMES
// ============================================

const categoryDisplayNames = {
  'silver-jewelry': 'Silver Jewelry',
  'gemstone-jewelry': 'Gemstone Jewelry',
  'fashion-jewelry': 'Fashion Jewelry',
  'tribal-jewelry': 'Tribal Jewelry',
  'jadau-jewelry': 'Jadau Jewelry',
  'pachi-jewelry': 'Pachi Jewelry',
  'cubic-zirconia': 'Cubic Zirconia',
  'rings': 'Rings',
  'necklaces': 'Necklaces',
  'earrings': 'Earrings',
  'bracelets': 'Bracelets',
  'pendants': 'Pendants',
  'sets': 'Sets',
  'bangles': 'Bangles',
  'mangalsutra': 'Mangalsutra',
};

// ============================================
// 🔥 SUB-CATEGORY TO DATABASE CATEGORY MAPPING
// ============================================

const dbCategoryMap = {
  'necklace': 'necklaces',
  'earrings': 'earrings',
  'rings': 'rings',
  'bracelet': 'bracelets',
  'pendants': 'pendants',
  'turkish': 'turkish',
  'gemstone-necklace': 'necklaces',
  'gemstone-earrings': 'earrings',
  'gemstone-bracelet': 'bracelets',
  'chains': 'chains',
  'beads-pendant': 'pendants',
  'gemstone-beads-pendant': 'pendants',
  'fashion-necklace': 'necklaces',
  'fashion-earrings': 'earrings',
  'fashion-rings': 'rings',
  'fashion-bracelet': 'bracelets',
  'fashion-pendants': 'pendants',
  'accessories': 'accessories',
  'tribal-necklace': 'necklaces',
  'tribal-earrings': 'earrings',
  'tribal-bracelet': 'bracelets',
  'pendant-sets': 'sets',
  'tribal-pendants': 'pendants',
  'jadau-necklace': 'necklaces',
  'jadau-earrings': 'earrings',
  'lac': 'lac',
  'pacchi-sets': 'sets',
  'pacchi-rings': 'rings',
  'cz-necklace': 'necklaces',
  'cz-earrings': 'earrings',
  'cz-chains': 'chains',
  'cz-bracelets': 'bracelets',
};

// ============================================
// 🔥 CATEGORY MAPPING (Backward Compatibility)
// ============================================

const categoryMapping = {
  'silver-jewelry': 'earrings',
  'gemstone-jewelry': 'pendants',
  'fashion-jewelry': 'bracelets',
  'tribal-jewelry': 'necklaces',
  'jadau-jewelry': 'sets',
  'pachi-jewelry': 'rings',
  'cubic-zirconia': 'rings',
};

const reverseCategoryMapping = {
  'earrings': 'silver-jewelry',
  'pendants': 'gemstone-jewelry',
  'bracelets': 'fashion-jewelry',
  'necklaces': 'tribal-jewelry',
  'sets': 'jadau-jewelry',
  'rings': 'pachi-jewelry',
};

// ============================================
// 🔥 SORT OPTIONS
// ============================================

const sortOptions = [
  { value: "featured", label: "Featured" },
  { value: "price-low", label: "Price: Low to High" },
  { value: "price-high", label: "Price: High to Low" },
  { value: "rating", label: "Top Rated" },
  { value: "newest", label: "Newest First" },
  { value: "discount", label: "Biggest Savings" }
];

// ============================================
// 🔥 QUICK VIEW MODAL - UPDATED
// ============================================

const QuickViewModal = ({ product, onClose, onAddToCart, isAddingToCart }) => {
  const [currentImage, setCurrentImage] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const navigate = useNavigate();

  if (!product) return null;

  const handleViewDetails = () => {
    onClose();
    navigate(`/product/${product._id || product.id}`);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70" onClick={onClose}>
      <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
        <div className="relative p-6">
          <button 
            onClick={onClose}
            className="absolute right-4 top-4 p-2 hover:bg-gray-100 rounded-full transition-colors z-10"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="grid md:grid-cols-2 gap-8">
            {/* Image Gallery */}
            <div>
              <div className="relative h-80 rounded-lg overflow-hidden bg-gray-100">
                <img 
                  src={product.images?.[currentImage] || 'https://via.placeholder.com/400x400?text=No+Image'} 
                  alt={product.name}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    e.target.src = 'https://via.placeholder.com/400x400?text=No+Image';
                  }}
                />
                {product.images?.length > 1 && (
                  <>
                    <button 
                      onClick={() => setCurrentImage(prev => (prev - 1 + product.images.length) % product.images.length)}
                      className="absolute left-2 top-1/2 -translate-y-1/2 bg-white/80 p-1 rounded-full"
                    >
                      <ChevronLeft className="w-5 h-5" />
                    </button>
                    <button 
                      onClick={() => setCurrentImage(prev => (prev + 1) % product.images.length)}
                      className="absolute right-2 top-1/2 -translate-y-1/2 bg-white/80 p-1 rounded-full"
                    >
                      <ChevronRight className="w-5 h-5" />
                    </button>
                  </>
                )}
              </div>
              {product.images?.length > 1 && (
                <div className="flex gap-2 mt-3">
                  {product.images.map((img, idx) => (
                    <button
                      key={idx}
                      onClick={() => setCurrentImage(idx)}
                      className={`w-16 h-16 rounded-md overflow-hidden border-2 ${
                        currentImage === idx ? 'border-pink-500' : 'border-transparent'
                      }`}
                    >
                      <img src={img} alt={`View ${idx + 1}`} className="w-full h-full object-cover" />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Product Details */}
            <div>
              <h2 className="text-2xl font-serif text-gray-900 mb-2">{product.name}</h2>
              
              <div className="flex items-center gap-2 mb-4">
                <div className="flex items-center gap-1">
                  <Star className="w-4 h-4 fill-pink-500 text-pink-500" />
                  <span className="font-semibold">{product.rating || 0}</span>
                </div>
                <span className="text-gray-400">|</span>
                <span className="text-gray-500 text-sm">{product.reviews || 0} Reviews</span>
              </div>

              <div className="flex items-center gap-3 mb-4">
                selectedSize === size 
  ? 'border-pink-600 bg-pink-50 text-pink-600 shadow-md' 
  : 'border-gray-300 hover:border-pink-400 hover:bg-pink-50/30'
                {product.originalPrice && (
                  <span className="text-gray-400 line-through text-lg">₹{product.originalPrice.toLocaleString('en-IN')}</span>
                )}
                {product.discount > 0 && (
                  <span className="bg-green-100 text-green-700 px-2 py-1 rounded-full text-sm">
                    Save {product.discount}%
                  </span>
                )}
              </div>

              <p className="text-gray-600 mb-6">{product.description}</p>

              {/* Specifications */}
              <div className="border-t border-b py-4 mb-6 space-y-2">
                <div className="flex justify-between">
                  <span className="text-gray-500">Metal</span>
                  <span className="font-medium">{product.metal || 'N/A'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Weight</span>
                  <span className="font-medium">{product.weight || 'N/A'}</span>
                </div>
                {product.diamondWeight && (
                  <div className="flex justify-between">
                    <span className="text-gray-500">Diamond Weight</span>
                    <span className="font-medium">{product.diamondWeight}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span className="text-gray-500">Availability</span>
                  <span className={product.inStock ? 'text-green-600' : 'text-red-600'}>
                    {product.inStock ? 'In Stock' : 'Out of Stock'}
                  </span>
                </div>
              </div>

              {/* Quantity and Add to Cart */}
              <div className="flex flex-col gap-3 mb-6">
                <div className="flex items-center gap-4">
                  <div className="flex items-center border border-pink-200 rounded-lg">
                    <button 
                      onClick={() => setQuantity(Math.max(1, quantity - 1))}
                      className="px-3 py-2 hover:bg-gray-100"
                    >
                      -
                    </button>
                    <span className="w-12 text-center">{quantity}</span>
                    <button 
                      onClick={() => setQuantity(quantity + 1)}
                      className="px-3 py-2 hover:bg-gray-100"
                    >
                      +
                    </button>
                  </div>
                  <button 
                    onClick={() => onAddToCart(product, quantity)}
                    disabled={!product.inStock || isAddingToCart}
                    className={`flex-1 py-3 rounded-lg font-semibold transition-colors flex items-center justify-center gap-2 ${
                      !product.inStock || isAddingToCart
                        ? 'bg-gray-400 text-white cursor-not-allowed'
                        : 'bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600 text-white shadow-md hover:shadow-pink-lg'
                    }`}
                  >
                    {isAddingToCart ? (
                      <>
                        <Loader className="w-5 h-5 animate-spin" />
                        Adding...
                      </>
                    ) : (
                      'Add to Cart'
                    )}
                  </button>
                </div>
                <button 
                  onClick={handleViewDetails}
                  className="w-full border-2 border-pink-500 text-pink-600 hover:bg-gradient-to-r hover:from-pink-500 hover:to-rose-500 hover:text-white py-2 rounded-lg font-semibold transition-all duration-300 shadow-md hover:shadow-pink-lg"
                >
                  View Full Details
                </button>
              </div>

              {/* Shipping Info */}
              <div className="flex gap-4 text-sm text-gray-500">
                <div className="flex items-center gap-1">
                  <Truck className="w-4 h-4" />
                  <span>Free Shipping</span>
                </div>
                <div className="flex items-center gap-1">
                  <Shield className="w-4 h-4" />
                  <span>Certified</span>
                </div>
                <div className="flex items-center gap-1">
                  <RotateCcw className="w-4 h-4" />
                  <span>30-Day Returns</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// ============================================
// 🔥 FILTER SIDEBAR
// ============================================

const FilterSidebar = ({ filters, setFilters, onClose }) => {
  const priceRanges = [
    { min: 0, max: 25000, label: "Under ₹25,000" },
    { min: 25000, max: 50000, label: "₹25,000 - ₹50,000" },
    { min: 50000, max: 100000, label: "₹50,000 - ₹1,00,000" },
    { min: 100000, max: 200000, label: "₹1,00,000 - ₹2,00,000" },
    { min: 200000, max: Infinity, label: "Above ₹2,00,000" }
  ];

  const metals = [
    "18K Gold",
    "22K Gold", 
    "14K Gold",
    "18K White Gold",
    "14K Rose Gold"
  ];

  const ratings = [4, 3, 2];

  return (
    <div className="lg:block">
      <div className="flex justify-between items-center mb-6 lg:mb-4">
        <h3 className="font-semibold text-lg">Filters</h3>
        <button onClick={onClose} className="lg:hidden p-2 hover:bg-gray-100 rounded-full">
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Price Range */}
      <div className="mb-6">
        <h4 className="font-medium mb-3">Price Range</h4>
        <div className="space-y-2">
          {priceRanges.map((range, idx) => (
            <label key={idx} className="flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                name="priceRange"
                checked={filters.priceRange === range.label}
                onChange={() => setFilters({ ...filters, priceRange: range.label, priceMin: range.min, priceMax: range.max })}
                className="w-4 h-4 text-pink-600 focus:ring-pink-500"
              />
              <span className="text-sm text-gray-700">{range.label}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Metal Type */}
      <div className="mb-6">
        <h4 className="font-medium mb-3">Metal Type</h4>
        <div className="flex flex-wrap gap-2">
          {metals.map((metal, idx) => (
            <button
              key={idx}
              onClick={() => {
                const newMetals = filters.metals.includes(metal)
                  ? filters.metals.filter(m => m !== metal)
                  : [...filters.metals, metal];
                setFilters({ ...filters, metals: newMetals });
              }}
              className={`px-3 py-1 rounded-full text-sm transition-all ${
                filters.metals.includes(metal)
                  ? 'bg-gray-100 text-gray-700 hover:bg-pink-50 hover:text-pink-600'
                  : 'bg-gray-100 text-gray-700 hover:bg-pink-50 hover:text-pink-600'
              }`}
            >
              {metal}
            </button>
          ))}
        </div>
      </div>

      {/* Rating */}
      <div className="mb-6">
        <h4 className="font-medium mb-3">Rating</h4>
        <div className="space-y-2">
          {ratings.map(rating => (
            <label key={rating} className="flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                name="rating"
                checked={filters.rating === rating}
                onChange={() => setFilters({ ...filters, rating })}
                className="w-4 h-4 text-pink-600 focus:ring-pink-500"
              />
              <div className="flex items-center gap-1">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className={`w-4 h-4 ${i < rating ? 'fill-pink-500 text-pink-500' : 'text-gray-300'}`} />
                ))}
                <span className="text-sm text-gray-600">& Up</span>
              </div>
            </label>
          ))}
        </div>
      </div>

      {/* Availability */}
      <div className="mb-6">
        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            checked={filters.inStockOnly}
            onChange={(e) => setFilters({ ...filters, inStockOnly: e.target.checked })}
            className="w-4 h-4 text-pink-600 rounded focus:ring-pink-500"
          />
          <span className="text-sm text-gray-700">In Stock Only</span>
        </label>
      </div>

      {/* Clear Filters */}
      <button
        onClick={() => setFilters({ 
          category: filters.category || "all", 
          subcategory: '',
          navbarCategory: '',
          navbarSubcategory: '',
          priceRange: null, 
          priceMin: 0, 
          priceMax: Infinity, 
          metals: [], 
          rating: 0, 
          inStockOnly: false,
          searchQuery: '',
        })}
        className="w-full py-2 border-2 border-pink-500 text-pink-600 rounded-xl hover:bg-gradient-to-r hover:from-pink-500 hover:to-rose-500 hover:text-white transition-all duration-300 shadow-md hover:shadow-pink-lg"
      >
        Clear All Filters
      </button>
    </div>
  );
};

// ============================================
// 🔥 MAIN PRODUCT PAGE COMPONENT - UPDATED
// ============================================

export function ProductPage() {
  const { category, subcategorySlug } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  
  // ✅ Cart and Auth hooks
  const { addItem } = useCart();
  const { isAuthenticated } = useAuth();
  
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(category || "all");
  const [sortBy, setSortBy] = useState("featured");
  const [wishlist, setWishlist] = useState([]);
  const [quickViewProduct, setQuickViewProduct] = useState(null);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [searchInput, setSearchInput] = useState('');
  const [totalProducts, setTotalProducts] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [categoryCounts, setCategoryCounts] = useState({});
  const [error, setError] = useState(null);
  const [viewMode, setViewMode] = useState('grid');
  const [addingToCart, setAddingToCart] = useState({}); // ✅ Track adding state per product
  
  const [filters, setFilters] = useState({
    category: category || "all",
    subcategory: '',
    navbarCategory: '',
    navbarSubcategory: '',
    priceRange: null,
    priceMin: 0,
    priceMax: Infinity,
    metals: [],
    rating: 0,
    inStockOnly: false,
    searchQuery: '',
  });

  // Get the actual category from mapping (backward compatibility)
  const getActualCategory = (cat) => {
    if (!cat || cat === 'all') return cat;
    return categoryMapping[cat] || cat;
  };

  // Get the display category from mapping (backward compatibility)
  const getDisplayCategory = (cat) => {
    if (!cat || cat === 'all') return cat;
    const reversed = reverseCategoryMapping[cat];
    return reversed || cat;
  };

  // ============================================
  // 🔥 PARSE HIERARCHICAL SEO-FRIENDLY URL
  // ============================================
  
  useEffect(() => {
    console.log('📍 URL Params:', { category, subcategorySlug });
    
    let mappedCategory = category;
    let mappedSubcategory = '';
    let mappedNavbarCategory = '';
    let mappedNavbarSubcategory = '';
    
    if (category && subcategorySlug) {
      mappedNavbarCategory = category;
      mappedNavbarSubcategory = subcategorySlug.replace(/-/g, ' ');
      
      const dbCategory = dbCategoryMap[subcategorySlug] || subcategorySlug;
      mappedCategory = dbCategory;
      
      console.log(`📍 Hierarchical URL: ${category}/${subcategorySlug} → ${dbCategory}`);
      
      setSelectedCategory(mappedNavbarCategory);
      setFilters(prev => ({ 
        ...prev, 
        category: mappedCategory,
        subcategory: mappedNavbarSubcategory,
        navbarCategory: mappedNavbarCategory,
        navbarSubcategory: mappedNavbarSubcategory,
      }));
    } else if (category) {
      if (category.includes('-')) {
        mappedNavbarCategory = category;
        setSelectedCategory(mappedNavbarCategory);
        setFilters(prev => ({ 
          ...prev, 
          category: 'all',
          navbarCategory: mappedNavbarCategory,
          navbarSubcategory: '',
        }));
      } else {
        setSelectedCategory(category);
        setFilters(prev => ({ 
          ...prev, 
          category: category,
          subcategory: '',
          navbarCategory: '',
          navbarSubcategory: '',
        }));
      }
    } else {
      setSelectedCategory('all');
      setFilters(prev => ({ 
        ...prev, 
        category: 'all',
        navbarCategory: '',
        navbarSubcategory: '',
      }));
    }
  }, [category, subcategorySlug]);

  // ============================================
  // 🔥 FETCH PRODUCTS FROM API
  // ============================================
  
  useEffect(() => {
    const fetchProducts = async () => {
      setIsLoading(true);
      setError(null);
      
      try {
        const filterParams = {
          navbarCategory: filters.navbarCategory || undefined,
          navbarSubcategory: filters.navbarSubcategory || undefined,
          category: !filters.navbarCategory && filters.category !== 'all' ? filters.category : undefined,
          subcategory: !filters.navbarCategory && filters.subcategory || undefined,
          priceMin: filters.priceMin > 0 ? filters.priceMin : undefined,
          priceMax: filters.priceMax !== Infinity ? filters.priceMax : undefined,
          metals: filters.metals.length > 0 ? filters.metals : undefined,
          minRating: filters.rating > 0 ? filters.rating : undefined,
          inStockOnly: filters.inStockOnly || undefined,
          search: filters.searchQuery || undefined,
        };

        const options = {
          page: currentPage,
          limit: 20,
          sort: sortBy === 'featured' ? 'createdAt' : 
                sortBy === 'price-low' ? 'price' :
                sortBy === 'price-high' ? 'price' :
                sortBy === 'rating' ? 'rating' :
                sortBy === 'newest' ? 'createdAt' :
                sortBy === 'discount' ? 'discount' : 'createdAt',
          order: sortBy === 'price-high' ? 'desc' : 
                 sortBy === 'newest' ? 'desc' :
                 sortBy === 'discount' ? 'desc' : 'desc',
        };

        console.log('🔍 Fetching with filters:', filterParams);
        
        const result = await productService.filterProducts(filterParams, options);
        
        console.log('📦 API Response:', result);
        
        if (result.success) {
          let productList = result.products || [];
          
          if (productList.length === 1 && productList[0]?.products && Array.isArray(productList[0].products)) {
            productList = productList[0].products;
          }
          
          if (productList.length === 0 && result.data) {
            if (Array.isArray(result.data) && result.data.length > 0 && result.data[0]?.products) {
              productList = result.data[0].products;
            } else if (Array.isArray(result.data)) {
              productList = result.data;
            }
          }
          
          setProducts(productList);
          setFilteredProducts(productList);
          setTotalProducts(result.total || productList.length);
          setTotalPages(Math.ceil((result.total || productList.length) / options.limit));
        } else {
          setError(result.error || 'Failed to fetch products');
          setProducts([]);
          setFilteredProducts([]);
          setTotalProducts(0);
        }
      } catch (err) {
        console.error('Error fetching products:', err);
        setError('Failed to load products. Please try again.');
        setProducts([]);
        setFilteredProducts([]);
        setTotalProducts(0);
      } finally {
        setIsLoading(false);
      }
    };

    fetchProducts();
  }, [filters, sortBy, currentPage]);

  // ============================================
  // 🔥 FETCH META DATA
  // ============================================
  
  useEffect(() => {
    const fetchMeta = async () => {
      try {
        const countsResult = await productService.getCategoryCounts();
        
        if (countsResult.success) {
          let categories = countsResult.categories || {};
          
          if (Array.isArray(categories) && categories.length > 0 && categories[0]?.categories) {
            categories = categories[0].categories;
          }
          
          const filteredCategories = {};
          Object.keys(categories).forEach(key => {
            if (key && key !== 'null' && key !== 'undefined') {
              filteredCategories[key] = categories[key];
            }
          });
          
          setCategoryCounts(filteredCategories);
        }
        
        await productService.getMetals();
        
      } catch (error) {
        console.error('Error fetching meta data:', error);
      }
    };
    
    fetchMeta();
  }, []);

  // ============================================
  // 🔥 HANDLERS
  // ============================================

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchInput.trim()) {
      setFilters({ 
        ...filters, 
        searchQuery: searchInput, 
        category: 'all', 
        subcategory: '',
        navbarCategory: '',
        navbarSubcategory: '',
      });
      setSelectedCategory('all');
      setCurrentPage(1);
      navigate(`/products?search=${encodeURIComponent(searchInput)}`);
    }
  };

  const toggleWishlist = (productId) => {
    setWishlist(prev => 
      prev.includes(productId) 
        ? prev.filter(id => id !== productId)
        : [...prev, productId]
    );
  };

  // ✅ UPDATED: Handle Add to Cart with real API
  const handleAddToCart = async (product, quantity = 1) => {
    // Check authentication
    if (!isAuthenticated) {
      alert('Please login to add items to your cart');
      navigate('/login');
      return;
    }

    // Check stock
    if (product.stock <= 0) {
      alert('Sorry, this product is out of stock');
      return;
    }

    const productId = product._id || product.id;
    if (!productId) {
      console.error('Product ID is missing:', product);
      alert('Invalid product data');
      return;
    }

    // Set loading state for this product
    setAddingToCart(prev => ({ ...prev, [productId]: true }));

    try {
      console.log('🛒 Adding to cart:', { productId, quantity });
      
      const result = await addItem(productId, quantity);
      
      if (result.success) {
        alert(`${product.name} added to cart! Quantity: ${quantity}`);
        console.log('✅ Successfully added to cart');
      } else {
        console.error('❌ Failed to add to cart:', result.message);
        alert(result.message || 'Failed to add item to cart');
      }
    } catch (error) {
      console.error('❌ Error adding to cart:', error);
      alert('An unexpected error occurred. Please try again.');
    } finally {
      setAddingToCart(prev => ({ ...prev, [productId]: false }));
    }
  };

  // ============================================
  // 🔥 UI HELPERS
  // ============================================

  const getPageTitle = () => {
    if (filters.searchQuery) {
      return `Search Results for "${filters.searchQuery}"`;
    }
    if (filters.navbarSubcategory) {
      const subcategoryName = filters.navbarSubcategory
        .split('-')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ');
      
      const categoryName = categoryDisplayNames[filters.navbarCategory] || filters.navbarCategory || '';
      return `${subcategoryName} - ${categoryName}`;
    }
    if (filters.navbarCategory) {
      return categoryDisplayNames[filters.navbarCategory] || filters.navbarCategory || "Our Collection";
    }
    if (filters.category && filters.category !== 'all') {
      return categoryDisplayNames[filters.category] || filters.category || "Our Collection";
    }
    if (category) {
      return categoryDisplayNames[category] || category || "Our Collection";
    }
    return "Our Collection";
  };

  const getCategoryDisplayName = () => {
    if (filters.navbarCategory) {
      return categoryDisplayNames[filters.navbarCategory] || filters.navbarCategory;
    }
    if (filters.category === 'all') return 'All Products';
    return categoryDisplayNames[filters.category] || filters.category || 'All Products';
  };

  const getSubcategoryDisplayName = () => {
    if (filters.navbarSubcategory) {
      return filters.navbarSubcategory
        .split('-')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ');
    }
    if (!filters.subcategory) return '';
    return filters.subcategory
      .split('-')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };

  const clearSubcategory = () => {
    setFilters(prev => ({ 
      ...prev, 
      subcategory: '',
      navbarSubcategory: '',
    }));
    if (filters.navbarCategory) {
      navigate(`/product-category/${filters.navbarCategory}`);
    } else if (filters.category && filters.category !== 'all') {
      navigate(`/product-category/${filters.category}`);
    } else {
      navigate('/product-category/all');
    }
  };

  // ============================================
  // 🔥 LOADING & ERROR STATES
  // ============================================

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center pt-20">
        <div className="text-center">
          <div className="relative">
  <div className="animate-spin rounded-full h-16 w-16 border-4 border-pink-200 border-t-pink-600 mx-auto mb-4"></div>
  <div className="absolute inset-0 flex items-center justify-center">
    <div className="w-6 h-6 border-2 border-pink-300 rounded-full"></div>
  </div>
</div>
          <p className="text-gray-600">Loading products...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center pt-20">
        <div className="text-center max-w-md">
          <div className="text-6xl mb-4">😕</div>
          <h2 className="text-2xl font-semibold text-gray-900 mb-2">Something went wrong</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <button 
            onClick={() => window.location.reload()}
            className="bg-gray-100 text-gray-700 hover:bg-pink-50 hover:text-pink-600 px-6 py-2 rounded-lg hover:bg-amber-700 transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  // ============================================
  // 🔥 RENDER
  // ============================================

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Banner */}
      <div className="bg-gradient-to-r from-gray-900 to-gray-800 text-white py-12">
        <div className="container mx-auto px-4">
          <div className="flex items-center gap-4 mb-4">
            <button 
              onClick={() => navigate('/')}
              className="flex items-center gap-2 text-gray-300 hover:text-white transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
              Back to Home
            </button>
          </div>
          <h1 className="text-4xl md:text-5xl font-serif mb-3">
            {getPageTitle()}
          </h1>
          <p className="text-gray-300 max-w-2xl">
            {filters.navbarSubcategory ? (
              <>Showing <span className="font-semibold text-pink-300">{getSubcategoryDisplayName()}</span> in <span className="font-semibold">{getCategoryDisplayName()}</span></>
            ) : filters.searchQuery ? (
              <>Found {totalProducts} results for "<span className="font-semibold text-pink-300">{filters.searchQuery}</span>"</>
            ) : (
              `Discover our exquisite range of handcrafted jewellery in ${getCategoryDisplayName()}`
            )}
          </p>
          
          {/* Breadcrumb */}
          <div className="flex items-center gap-2 text-sm text-gray-400 mt-3">
            <span className="cursor-pointer hover:text-white transition-colors" onClick={() => navigate('/')}>Home</span>
            <span>/</span>
            <span className="cursor-pointer hover:text-white transition-colors" onClick={() => navigate('/product-category/all')}>Products</span>
            {filters.navbarCategory && (
              <>
                <span>/</span>
                <span 
                  className="cursor-pointer hover:text-white transition-colors"
                  onClick={() => {
                    navigate(`/product-category/${filters.navbarCategory}`);
                  }}
                >
                  {getCategoryDisplayName()}
                </span>
              </>
            )}
            {filters.navbarSubcategory && (
              <>
                <span>/</span>
                <span className="text-pink-300">{getSubcategoryDisplayName()}</span>
              </>
            )}
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        {/* Active Filters Display */}
        {(filters.navbarSubcategory || filters.searchQuery) && (
          <div className="mb-4 flex items-center gap-2 flex-wrap">
            {filters.navbarSubcategory && (
              <div className="bg-pink-100 text-pink-700 px-3 py-1.5 rounded-full text-sm flex items-center gap-2 border border-pink-200">
                <span>📂 {getSubcategoryDisplayName()}</span>
                <button 
                  onClick={clearSubcategory}
                  className="hover:text-pink-900 transition-colors"
                >
                  <X className="w-3 h-3" />
                </button>
              </div>
            )}
            {filters.searchQuery && (
              <div className="bg-blue-100 text-blue-700 px-3 py-1.5 rounded-full text-sm flex items-center gap-2">
                <span>🔍 {filters.searchQuery}</span>
                <button 
                  onClick={() => {
                    setFilters(prev => ({ ...prev, searchQuery: '' }));
                    setSearchInput('');
                    if (filters.navbarCategory) {
                      navigate(`/product-category/${filters.navbarCategory}`);
                    } else {
                      navigate('/product-category/all');
                    }
                  }}
                  className="hover:text-blue-900 transition-colors"
                >
                  <X className="w-3 h-3" />
                </button>
              </div>
            )}
            <button
              onClick={() => {
                setFilters({
                  category: "all",
                  subcategory: '',
                  navbarCategory: '',
                  navbarSubcategory: '',
                  priceRange: null,
                  priceMin: 0,
                  priceMax: Infinity,
                  metals: [],
                  rating: 0,
                  inStockOnly: false,
                  searchQuery: '',
                });
                setSearchInput('');
                navigate('/product-category/all');
              }}
              className="text-sm text-gray-500 hover:text-gray-700 underline"
            >
              Clear All
            </button>
          </div>
        )}

        {/* Search Bar */}
        <div className="mb-6">
          <form onSubmit={handleSearch} className="flex gap-2 max-w-2xl mx-auto">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search for jewellery... (e.g., diamond, gold, ring)"
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-pink-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent transition-all bg-white/50"
              />
            </div>
            <button 
              type="submit"
              className="px-6 py-3 bg-gray-100 text-gray-700 hover:bg-pink-50 hover:text-pink-600 rounded-xl hover:bg-amber-700 transition-colors font-medium"
            >
              Search
            </button>
          </form>
        </div>

        <div className="flex flex-col lg:flex-row gap-8">
          {/* Sidebar - Desktop */}
          <aside className="hidden lg:block lg:w-72 flex-shrink-0">
            <div className="sticky top-24 bg-white/80 backdrop-blur-sm rounded-2xl p-5 shadow-pink-md border border-pink-100/50 hover:shadow-pink-lg transition-all duration-300">
              <FilterSidebar filters={filters} setFilters={setFilters} onClose={() => setIsFilterOpen(false)} />
            </div>
          </aside>

          {/* Mobile Filter Drawer */}
          {isFilterOpen && (
            <div className="fixed inset-0 z-40 bg-black/50 lg:hidden" onClick={() => setIsFilterOpen(false)}>
              <div className="absolute right-0 top-0 h-full w-80 bg-white shadow-xl p-5 overflow-y-auto" onClick={(e) => e.stopPropagation()}>
                <FilterSidebar filters={filters} setFilters={setFilters} onClose={() => setIsFilterOpen(false)} />
              </div>
            </div>
          )}

          {/* Main Content */}
          <main className="flex-1">
            {/* Toolbar */}
            <div className="flex justify-between items-center mb-6 flex-wrap gap-3">
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setIsFilterOpen(true)}
                  className="lg:hidden flex items-center gap-2 px-4 py-2 bg-white rounded-xl shadow-sm hover:bg-pink-50 hover:text-pink-600 transition-all duration-300 border border-pink-100"
                >
                  <Filter className="w-4 h-4" />
                  Filters
                </button>
                <p className="text-gray-600 text-sm">
                  Showing <span className="font-semibold">{filteredProducts.length}</span> of{' '}
                  <span className="font-semibold">{totalProducts}</span> products
                  {filters.navbarSubcategory && (
                    <span className="text-pink-600 font-medium"> in "{getSubcategoryDisplayName()}"</span>
                  )}
                </p>
              </div>

              <div className="flex items-center gap-2">
                {/* View Toggle */}
                <div className="flex border rounded-lg overflow-hidden mr-2">
                  <button
                    onClick={() => setViewMode('grid')}
                    className={`p-2 ${viewMode === 'grid' ? 'bg-gray-100 text-gray-700 hover:bg-pink-50 hover:text-pink-600' : 'bg-white text-gray-600 hover:bg-gray-50'}`}
                  >
                    <Grid className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setViewMode('list')}
                    className={`p-2 ${viewMode === 'list' ? 'bg-gray-100 text-gray-700 hover:bg-pink-50 hover:text-pink-600' : 'bg-white text-gray-600 hover:bg-gray-50'}`}
                  >
                    <List className="w-4 h-4" />
                  </button>
                </div>

                <span className="text-sm text-gray-600 hidden sm:inline">Sort by:</span>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="px-3 py-2 bg-white border border-pink-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent transition-all"
                >
                  {sortOptions.map(option => (
                    <option key={option.value} value={option.value}>{option.label}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Products Grid - Updated with cart props */}
            {filteredProducts.length > 0 ? (
  <div className={`grid ${viewMode === 'grid' ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3' : 'grid-cols-1'} gap-6`}>
    {filteredProducts.map(product => (
      <ProductCard
        key={product._id || product.id}
        product={product}
        onQuickView={setQuickViewProduct}
        onAddToCart={handleAddToCart}
        isAddingToCart={addingToCart[product._id || product.id] || false}
        // ✅ Don't pass wishlist props - let ProductCard use its own context
      />
    ))}
  </div>

            ) : (
              <div className="text-center py-16 bg-white rounded-xl">
                <div className="text-6xl mb-4">🔍</div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">No products found</h3>
                <p className="text-gray-500">
                  {filters.searchQuery 
                    ? `No results found for "${filters.searchQuery}"`
                    : filters.navbarSubcategory
                    ? `No products found in "${getSubcategoryDisplayName()}"`
                    : "Try adjusting your filters or search criteria"}
                </p>
                <button
                  onClick={() => {
                    setFilters({ 
                      category: "all", 
                      subcategory: '',
                      navbarCategory: '',
                      navbarSubcategory: '',
                      priceRange: null, 
                      priceMin: 0, 
                      priceMax: Infinity, 
                      metals: [], 
                      rating: 0, 
                      inStockOnly: false,
                      searchQuery: '',
                    });
                    setSearchInput('');
                    setSelectedCategory('all');
                    setCurrentPage(1);
                    navigate('/product-category/all');
                  }}
                  className="mt-4 text-pink-600 hover:text-pink-700 font-semibold transition-colors"
                >
                  Clear all filters
                </button>
              </div>
            )}

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex justify-center gap-2 mt-8">
                <button
                  onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                  disabled={currentPage === 1}
                  className="px-4 py-2 border border-pink-200 rounded-xl hover:bg-pink-50 hover:border-pink-300 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300"
                >
                  Previous
                </button>
                <span className="px-4 py-2 bg-gray-100 text-gray-700 hover:bg-pink-50 hover:text-pink-600 rounded-lg">
                  {currentPage} / {totalPages}
                </span>
                <button
                  onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                  disabled={currentPage === totalPages}
                  className="px-4 py-2 border border-pink-200 rounded-xl hover:bg-pink-50 hover:border-pink-300 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300"
                >
                  Next
                </button>
              </div>
            )}
          </main>
        </div>
      </div>

      {/* Quick View Modal - Updated with cart props */}
      {quickViewProduct && (
        <QuickViewModal
          product={quickViewProduct}
          onClose={() => setQuickViewProduct(null)}
          onAddToCart={handleAddToCart}
          isAddingToCart={addingToCart[quickViewProduct._id || quickViewProduct.id] || false}
        />
      )}
    </div>
  );
}

export default ProductPage;
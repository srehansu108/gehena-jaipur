// src/pages/ProductDetails.jsx - Complete Version with Cart Integration ✅
// FIXED: Now correctly uses inStock and stockCount from backend

import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Star, Heart, Share2, Truck, Shield, RotateCcw, Gem,
  ChevronLeft, ChevronRight, X, Minus, Plus,
  CreditCard, Building2, Wallet, Check, Award,
  Clock, Mail, Phone, MapPin, Facebook, Instagram, Twitter,
  ShoppingBag, Zap, Gift, Sparkles, AlertCircle, Loader
} from 'lucide-react';
import productService from '../services/productService';
import { useCart } from '../contexts/CartContext';
import { useAuth } from '../contexts/AuthContext';

// Size options
const ringSizes = ["5", "6", "7", "8", "9", "10"];
const necklaceLengths = ["16 inch", "18 inch", "20 inch", "22 inch"];

// EMI Options
const emiOptions = [3, 6, 9, 12];

// Payment Methods
const paymentMethods = [
  { id: "card", name: "Credit/Debit Card", icon: CreditCard },
  { id: "upi", name: "UPI", icon: Wallet },
  { id: "netbanking", name: "Net Banking", icon: Building2 },
  { id: "cod", name: "Cash on Delivery", icon: Wallet }
];

// ============================================
// IMAGE GALLERY COMPONENT
// ============================================

const ImageGallery = ({ images, productName }) => {
  const [selectedImage, setSelectedImage] = useState(0);
  const [isZoomed, setIsZoomed] = useState(false);
  const [zoomPosition, setZoomPosition] = useState({ x: 50, y: 50 });
  const [imageErrors, setImageErrors] = useState({});

  const displayImages = images && images.length > 0 ? images : ['https://via.placeholder.com/600x600?text=No+Image'];

  const handleMouseMove = (e) => {
    if (!isZoomed) return;
    const { left, top, width, height } = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - left) / width) * 100;
    const y = ((e.clientY - top) / height) * 100;
    setZoomPosition({ x, y });
  };

  const handleImageError = (index) => {
    setImageErrors(prev => ({ ...prev, [index]: true }));
  };

  const getImageUrl = (index) => {
    if (imageErrors[index]) {
      return 'https://via.placeholder.com/600x600?text=Image+Not+Found';
    }
    return displayImages[index];
  };

  return (
    <div className="sticky top-24">
      {/* Main Image */}
      <div 
        className={`relative h-96 md:h-[500px] rounded-xl overflow-hidden bg-gray-100 ${isZoomed ? 'cursor-zoom-out' : 'cursor-zoom-in'}`}
        onMouseEnter={() => setIsZoomed(true)}
        onMouseLeave={() => setIsZoomed(false)}
        onMouseMove={handleMouseMove}
      >
        <img 
          src={getImageUrl(selectedImage)} 
          alt={`${productName} - View ${selectedImage + 1}`}
          className="w-full h-full object-cover transition-transform duration-300"
          style={{
            transform: isZoomed ? 'scale(2)' : 'scale(1)',
            transformOrigin: `${zoomPosition.x}% ${zoomPosition.y}%`
          }}
          onError={() => handleImageError(selectedImage)}
        />
        
        {displayImages.length > 1 && (
          <>
            <button 
              onClick={() => setSelectedImage(prev => (prev - 1 + displayImages.length) % displayImages.length)}
              className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white p-2 rounded-full shadow-lg transition-all"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <button 
              onClick={() => setSelectedImage(prev => (prev + 1) % displayImages.length)}
              className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white p-2 rounded-full shadow-lg transition-all"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </>
        )}

        {displayImages.length > 1 && (
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-black/60 text-white text-xs px-3 py-1 rounded-full">
            {selectedImage + 1} / {displayImages.length}
          </div>
        )}
      </div>

      {/* Thumbnails */}
      {displayImages.length > 1 && (
        <div className="flex gap-3 mt-4 overflow-x-auto pb-2">
          {displayImages.map((img, idx) => (
            <button
              key={idx}
              onClick={() => setSelectedImage(idx)}
              className={`flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden border-2 transition-all ${
                selectedImage === idx ? 'border-pink-500 shadow-md' : 'border-gray-200 hover:border-pink-300'
              }`}
            >
              <img 
                src={getImageUrl(idx)} 
                alt={`Thumbnail ${idx + 1}`} 
                className="w-full h-full object-cover"
                onError={() => handleImageError(idx)}
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

// ============================================
// RATING STARS COMPONENT
// ============================================

const RatingStars = ({ rating, reviewCount }) => {
  return (
    <div className="flex items-center gap-3">
      <div className="flex items-center gap-1">
        {[...Array(5)].map((_, i) => (
          <Star 
            key={i} 
            className={`w-5 h-5 ${i < Math.floor(rating || 0) ? 'fill-pink-500 text-pink-500' : 'text-gray-300'}`} 
          />
        ))}
      </div>
      <span className="font-semibold text-gray-900">{rating || 0}</span>
      <span className="text-gray-500">|</span>
      <button className="text-pink-600 hover:text-pink-700 font-medium">
        {reviewCount || 0} Reviews
      </button>
    </div>
  );
};

// ============================================
// QUANTITY SELECTOR COMPONENT
// ============================================

const QuantitySelector = ({ quantity, setQuantity, stockCount }) => {
  return (
    <div className="flex items-center gap-3">
      <span className="text-gray-700 font-medium">Quantity:</span>
      <div className="flex items-center border border-pink-200 rounded-lg">
        <button 
          onClick={() => setQuantity(Math.max(1, quantity - 1))}
          className="px-3 py-2 hover:bg-pink-50 hover:text-pink-600 transition-colors disabled:opacity-50"
          disabled={quantity <= 1}
        >
          <Minus className="w-4 h-4" />
        </button>
        <span className="w-12 text-center font-medium">{quantity}</span>
        <button 
          onClick={() => setQuantity(Math.min(stockCount || 10, quantity + 1))}
          className="px-3 py-2 hover:bg-pink-50 hover:text-pink-600 transition-colors disabled:opacity-50"
          disabled={quantity >= (stockCount || 10)}
        >
          <Plus className="w-4 h-4" />
        </button>
      </div>
      <span className="text-sm text-gray-500">{stockCount || 0} pieces available</span>
    </div>
  );
};

// ============================================
// EMI CALCULATOR COMPONENT
// ============================================

const EMICalculator = ({ price }) => {
  const [selectedMonths, setSelectedMonths] = useState(6);
  const interestRate = 12;
  
  const calculateEMI = () => {
    const principal = price || 0;
    const monthlyRate = interestRate / 12 / 100;
    const emi = principal * monthlyRate * Math.pow(1 + monthlyRate, selectedMonths) / (Math.pow(1 + monthlyRate, selectedMonths) - 1);
    return Math.round(emi);
  };

  if (!price) return null;

  return (
    <div className="bg-gray-50 rounded-xl p-4 mt-4">
      <div className="flex items-center gap-2 mb-3">
        <CreditCard className="w-5 h-5 text-pink-600" />
        <span className="font-semibold">EMI Available</span>
      </div>
      <div className="flex gap-2 mb-3 flex-wrap">
        {emiOptions.map(months => (
          <button
            key={months}
            onClick={() => setSelectedMonths(months)}
            className={`px-3 py-1 rounded-lg text-sm transition-all ${
              selectedMonths === months 
                ? 'bg-gray-100 text-gray-700 hover:bg-pink-50 hover:text-pink-600' 
                : 'bg-white border border-gray-200 hover:border-amber-500'
            }`}
          >
            {months} Months
          </button>
        ))}
      </div>
      <p className="text-sm text-gray-600">
        EMI starting from <span className="font-bold text-pink-600">₹{calculateEMI().toLocaleString('en-IN')}</span>/month
      </p>
      <p className="text-xs text-gray-400 mt-1">*Interest rate: {interestRate}% p.a. | No processing fee</p>
    </div>
  );
};

// ============================================
// OFFERS COMPONENT
// ============================================

const Offers = () => {
  const offers = [
    { code: "WELCOME10", discount: "10% off", minAmount: "₹5,000", description: "First purchase discount", icon: Gift },
    { code: "FREESHIP", discount: "Free Shipping", minAmount: "₹50,000", description: "Complimentary delivery", icon: Truck },
    { code: "EXCHANGE", discount: "0% deduction", minAmount: "Old gold exchange", description: "Best exchange rates", icon: RotateCcw },
    { code: "DIWALI20", discount: "20% off", minAmount: "₹25,000", description: "Festival special", icon: Zap }
  ];

  return (
    <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl p-4 mt-4">
      <div className="flex items-center gap-2 mb-3">
        <Zap className="w-5 h-5 text-green-600" />
        <span className="font-semibold text-green-800">Available Offers</span>
      </div>
      <div className="space-y-2">
        {offers.map((offer, idx) => {
          const IconComponent = offer.icon;
          return (
            <div key={idx} className="flex items-start gap-2 text-sm">
              <IconComponent className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
              <div>
                <span className="font-medium">{offer.discount}</span>
                <span className="text-gray-600"> on {offer.minAmount}</span>
                <button 
                  onClick={() => {
                    navigator.clipboard.writeText(offer.code);
                    alert(`Coupon code ${offer.code} copied!`);
                  }}
                  className="ml-2 text-pink-600 hover:text-pink-700 text-xs underline"
                >
                  Copy Code
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

// ============================================
// DELIVERY INFO COMPONENT
// ============================================

const DeliveryInfo = ({ shippingInfo }) => {
  const [pincode, setPincode] = useState('');
  const [isChecking, setIsChecking] = useState(false);
  const [deliveryStatus, setDeliveryStatus] = useState(null);

  const defaultShippingInfo = {
    free: true,
    estimatedDays: "3-5 business days",
    returnable: true,
    returnDays: 30,
    cod: true
  };

  const info = shippingInfo || defaultShippingInfo;

  const checkDelivery = () => {
    if (pincode.length !== 6) {
      alert('Please enter a valid 6-digit pincode');
      return;
    }
    
    setIsChecking(true);
    setTimeout(() => {
      setDeliveryStatus({ available: true, days: "3-4" });
      setIsChecking(false);
    }, 1000);
  };

  return (
    <div className="border-t border-b py-4 my-4">
      <div className="flex items-center gap-2 mb-3">
        <Truck className="w-5 h-5 text-pink-600" />
        <span className="font-semibold">Delivery Information</span>
      </div>
      
      <div className="space-y-2 text-sm">
        <div className="flex justify-between">
          <span className="text-gray-600">Shipping:</span>
          <span className="font-medium text-green-600">{info.free ? 'FREE' : 'Calculated at checkout'}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-600">Estimated Delivery:</span>
          <span className="font-medium">{info.estimatedDays || '3-5 business days'}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-600">Returns:</span>
          <span className="font-medium">{info.returnDays || 30} days easy returns</span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-600">COD Available:</span>
          <span className="font-medium">{info.cod ? 'Yes' : 'No'}</span>
        </div>
      </div>

      <div className="mt-3">
        <div className="flex gap-2">
          <input
            type="text"
            placeholder="Enter pincode to check delivery"
            value={pincode}
            onChange={(e) => setPincode(e.target.value.replace(/\D/g, ''))}
            className="flex-1 px-3 py-2 border border-pink-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent"
            maxLength="6"
          />
          <button
            onClick={checkDelivery}
            disabled={pincode.length !== 6 || isChecking}
            className="px-4 py-2 bg-gradient-to-r from-pink-500 to-rose-500 text-white rounded-lg text-sm font-medium hover:from-pink-600 hover:to-rose-600 shadow-md hover:shadow-pink-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300"
          >
            {isChecking ? 'Checking...' : 'Check'}
          </button>
        </div>
        {deliveryStatus && (
          <p className="text-sm text-green-600 mt-2">
            ✓ Delivery available in {deliveryStatus.days} days
          </p>
        )}
      </div>
    </div>
  );
};

// ============================================
// TRUST BADGES COMPONENT
// ============================================

const TrustBadges = () => {
  const badges = [
    { icon: Shield, text: "100% Certified", color: "text-blue-600" },
    { icon: Award, text: "Hallmarked", color: "text-pink-600" },
    { icon: Clock, text: "Lifetime Warranty", color: "text-green-600" },
    { icon: Truck, text: "Free Shipping", color: "text-purple-600" }
  ];

  return (
    <div className="grid grid-cols-2 gap-3 mt-4">
      {badges.map((badge, idx) => {
        const IconComponent = badge.icon;
        return (
          <div key={idx} className="flex items-center gap-2 p-2 bg-gray-50 rounded-lg">
            <IconComponent className={`w-4 h-4 ${badge.color}`} />
            <span className="text-xs text-gray-700">{badge.text}</span>
          </div>
        );
      })}
    </div>
  );
};

// ============================================
// REVIEWS COMPONENT
// ============================================

const Reviews = ({ reviews, rating }) => {
  const [showAll, setShowAll] = useState(false);
  
  const sampleReviews = [
    { id: 1, user: "Priya S.", rating: 5, date: "2024-01-15", comment: "Absolutely stunning piece! The quality is exceptional.", helpful: 45 },
    { id: 2, user: "Rajesh K.", rating: 4, date: "2024-01-10", comment: "Beautiful design, delivery was on time.", helpful: 32 },
    { id: 3, user: "Anita M.", rating: 5, date: "2024-01-05", comment: "Worth every rupee! Highly recommended.", helpful: 67 }
  ];

  return (
    <div className="mt-8">
      <h3 className="text-xl font-semibold mb-4">Customer Reviews</h3>
      <div className="flex items-center gap-4 mb-6">
        <div className="text-center">
          <div className="text-4xl font-bold text-gray-900">{rating || 0}</div>
          <div className="flex items-center gap-1 mt-1 justify-center">
            {[...Array(5)].map((_, i) => (
              <Star key={i} className={`w-4 h-4 ${i < Math.floor(rating || 0) ? 'fill-pink-500 text-pink-500' : 'text-gray-300'}`} />
            ))}
          </div>
          <div className="text-sm text-gray-500 mt-1">{reviews || 0} ratings</div>
        </div>
      </div>

      <div className="space-y-4">
        {(showAll ? sampleReviews : sampleReviews.slice(0, 2)).map((review) => (
          <div key={review.id} className="border-b pb-4">
            <div className="flex justify-between items-start mb-2">
              <div>
                <span className="font-semibold">{review.user}</span>
                <div className="flex items-center gap-1 mt-1">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className={`w-3 h-3 ${i < review.rating ? 'fill-pink-500 text-pink-500' : 'text-gray-300'}`} />
                  ))}
                </div>
              </div>
              <span className="text-xs text-gray-400">{review.date}</span>
            </div>
            <p className="text-gray-600 text-sm mb-2">{review.comment}</p>
            <button className="text-xs text-gray-400 hover:text-pink-600">
              {review.helpful} people found this helpful
            </button>
          </div>
        ))}
      </div>
      
      {sampleReviews.length > 2 && (
        <button 
          onClick={() => setShowAll(!showAll)}
          className="mt-4 text-pink-600 hover:text-pink-700 font-medium"
        >
          {showAll ? 'Show less' : 'Read all reviews'}
        </button>
      )}
    </div>
  );
};

// ============================================
// ✅ MAIN PRODUCT DETAILS COMPONENT - FIXED
// ============================================

export function ProductDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  
  const { addItem } = useCart();
  const { isAuthenticated } = useAuth();
  
  const [product, setProduct] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [selectedSize, setSelectedSize] = useState('');
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState('card');
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('details');
  const [relatedProducts, setRelatedProducts] = useState([]);
  const [error, setError] = useState(null);
  const [isAddingToCart, setIsAddingToCart] = useState(false);

  // ✅ Helper to check if product is in stock
  const isProductInStock = () => {
    if (!product) return false;
    return product.inStock === true && (product.stockCount || 0) > 0;
  };

  // ✅ Helper to get stock count
  const getStockCount = () => {
    return product?.stockCount || 0;
  };

  // Fetch product
  useEffect(() => {
    const fetchProduct = async () => {
      setIsLoading(true);
      setError(null);
      
      try {
        const result = await productService.getProductById(id);
        
        console.log('📦 Product fetched:', result);
        
        if (result.success) {
          setProduct(result.product);
          setRelatedProducts(result.related || []);
        } else {
          setError(result.error || 'Product not found');
        }
      } catch (err) {
        console.error('Error fetching product:', err);
        setError('Failed to load product. Please try again.');
      } finally {
        setIsLoading(false);
      }
    };

    if (id) {
      fetchProduct();
    }
  }, [id]);

  // Scroll to top
  useEffect(() => {
    if (product) {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }, [product]);

  // ✅ FIXED: Add to Cart
  const handleAddToCart = async () => {
    if (!product) return;

    if (!isAuthenticated) {
      alert('Please login to add items to your cart');
      navigate('/login');
      return;
    }

    // ✅ FIX: Use inStock and stockCount
    if (!isProductInStock()) {
      alert('Sorry, this product is out of stock');
      return;
    }

    if (product.category === 'rings' && !selectedSize) {
      alert('Please select a size');
      return;
    }

    const productId = product._id || product.id;
    setIsAddingToCart(true);

    try {
      const result = await addItem(productId, quantity);
      
      if (result.success) {
        alert(`${product.name} added to cart! Quantity: ${quantity}`);
      } else {
        alert(result.message || 'Failed to add item to cart');
      }
    } catch (error) {
      console.error('Error adding to cart:', error);
      alert('An unexpected error occurred. Please try again.');
    } finally {
      setIsAddingToCart(false);
    }
  };

  // ✅ FIXED: Buy Now
  const handleBuyNow = async () => {
    if (!product) return;

    if (!isAuthenticated) {
      alert('Please login to proceed');
      navigate('/login');
      return;
    }

    // ✅ FIX: Use inStock and stockCount
    if (!isProductInStock()) {
      alert('Sorry, this product is out of stock');
      return;
    }

    const productId = product._id || product.id;
    setIsAddingToCart(true);
    
    try {
      const result = await addItem(productId, quantity);
      
      if (result.success) {
        navigate('/checkout');
      } else {
        alert(result.message || 'Failed to add item to cart');
      }
    } catch (error) {
      console.error('Error adding to cart:', error);
      alert('An unexpected error occurred. Please try again.');
    } finally {
      setIsAddingToCart(false);
    }
  };

  const handleWishlist = () => {
    alert('Added to wishlist!');
  };

  const handleShare = async () => {
    try {
      await navigator.share({
        title: product?.name || 'Jewelry Product',
        text: product?.description || 'Check out this beautiful jewelry piece!',
        url: window.location.href,
      });
    } catch (err) {
      navigator.clipboard.writeText(window.location.href);
      alert('Link copied to clipboard!');
    }
  };

  // Loading state
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
          <p className="text-gray-600">Loading product details...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error || !product) {
    return (
      <div className="min-h-screen flex items-center justify-center pt-20">
        <div className="text-center max-w-md">
          <div className="text-6xl mb-4">🔍</div>
          <h2 className="text-2xl font-semibold text-gray-900 mb-2">
            {error || 'Product Not Found'}
          </h2>
          <p className="text-gray-600 mb-4">
            The product you're looking for doesn't exist or has been removed.
          </p>
          <button 
            onClick={() => navigate('/products')}
            className="bg-gray-100 text-gray-700 hover:bg-pink-50 hover:text-pink-600 px-6 py-2 rounded-lg hover:bg-amber-700 transition-colors"
          >
            Browse Products
          </button>
        </div>
      </div>
    );
  }

  // ✅ Calculate if product is in stock
  const inStock = isProductInStock();
  const stockCount = getStockCount();

  // Calculate pricing
  const discount = product.originalPrice ? Math.round((1 - product.price / product.originalPrice) * 100) : 0;
  const totalPrice = product.price * quantity;
  const gst = Math.round(totalPrice * 0.03);
  const finalPrice = totalPrice + gst;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Breadcrumb */}
      <div className="bg-white border-b">
        <div className="container mx-auto px-4 py-3">
          <div className="flex items-center gap-2 text-sm text-gray-500 overflow-x-auto">
            <button onClick={() => navigate('/')} className="hover:text-pink-600 whitespace-nowrap">Home</button>
            <span>/</span>
            <button onClick={() => navigate('/products')} className="hover:text-pink-600 whitespace-nowrap">Products</button>
            <span>/</span>
            <button onClick={() => navigate(`/category/${product.category}`)} className="hover:text-pink-600 capitalize whitespace-nowrap">
              {product.category || 'Category'}
            </button>
            <span>/</span>
            <span className="text-gray-900 font-medium truncate">{product.name}</span>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        {/* Product Main Section */}
        <div className="grid lg:grid-cols-2 gap-8 mb-8">
          {/* Left Column - Image Gallery */}
          <ImageGallery images={product.images} productName={product.name} />

          {/* Right Column - Product Info */}
          <div>
            {/* Badge */}
            {product.badge && (
              <span className={`inline-block px-3 py-1 rounded-full text-xs font-semibold mb-3 ${
                product.badge === "Bestseller" ? "bg-pink-100 text-pink-700" :
                product.badge === "New" ? "bg-green-100 text-green-700" :
                product.badge === "Limited" ? "bg-purple-100 text-purple-700" :
                product.badge === "Exclusive" ? "bg-gradient-to-r from-pink-100 to-rose-100 text-pink-700" :
                product.badge === "Trending" ? "bg-blue-100 text-blue-700" :
                product.badge === "Sale" ? "bg-red-100 text-red-700" :
                product.badge.includes("%") ? "bg-red-100 text-red-700" :
                "bg-gray-100 text-gray-700"
              }`}>
                {product.badge}
              </span>
            )}

            <h1 className="text-3xl md:text-4xl font-serif text-gray-900 mb-3">{product.name}</h1>
            
            <p className="text-gray-500 text-sm mb-3">
              Brand: {product.brand || 'Luxury Jewels'} | SKU: {product.sku || 'N/A'}
            </p>

            <RatingStars rating={product.rating} reviewCount={product.reviews} />

            <div className="mt-4">
              <div className="flex items-center gap-3 flex-wrap">
                {product.originalPrice && (
                  <>
                    <span className="text-gray-400 line-through text-lg">₹{product.originalPrice.toLocaleString('en-IN')}</span>
                    <span className="bg-green-100 text-green-700 px-2 py-1 rounded-full text-sm font-semibold">
                      Save {discount}%
                    </span>
                  </>
                )}
              </div>
              <p className="text-sm text-gray-500 mt-1">Inclusive of all taxes</p>
            </div>

            <EMICalculator price={product.price} />
            <Offers />

            {product.category === 'rings' && (
              <div className="mt-4">
                <label className="block text-gray-700 font-medium mb-2">Select Size</label>
                <div className="flex flex-wrap gap-2">
                  {ringSizes.map(size => (
                    <button
                      key={size}
                      onClick={() => setSelectedSize(size)}
                      className={`w-12 h-12 rounded-full border-2 transition-all ${
                        selectedSize === size 
                          ? 'border-amber-600 bg-amber-50 text-amber-600' 
                          : 'border-gray-300 hover:border-amber-400'
                      }`}
                    >
                      {size}
                    </button>
                  ))}
                </div>
                <button className="text-pink-600 text-sm mt-2 hover:underline">Size Guide →</button>
              </div>
            )}

            <div className="mt-4">
              <QuantitySelector 
                quantity={quantity} 
                setQuantity={setQuantity} 
                stockCount={stockCount}
              />
            </div>

            <DeliveryInfo shippingInfo={product.shippingInfo} />
            <TrustBadges />

            {/* ✅ FIXED: Action Buttons */}
            <div className="flex gap-3 mt-6 flex-wrap">
              <button 
                onClick={handleAddToCart}
                disabled={isAddingToCart || !inStock}
                className={`flex-1 min-w-[120px] py-3 rounded-lg font-semibold transition-all flex items-center justify-center gap-2 ${
                  isAddingToCart
                    ? 'bg-gray-400 text-white cursor-not-allowed'
                    : inStock
                    ? 'bg-white border-2 border-pink-500 text-pink-600 hover:bg-gradient-to-r hover:from-pink-500 hover:to-rose-500 hover:text-white shadow-md hover:shadow-pink-lg'
                    : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                }`}
              >
                {isAddingToCart ? (
                  <>
                    <Loader className="w-5 h-5 animate-spin" />
                    Adding...
                  </>
                ) : (
                  <>
                    <ShoppingBag className="w-5 h-5" />
                    {inStock ? 'Add to Cart' : 'Out of Stock'}
                  </>
                )}
              </button>
              
              <button 
                onClick={handleBuyNow}
                disabled={isAddingToCart || !inStock}
                className={`flex-1 min-w-[120px] py-3 rounded-lg font-semibold transition-all flex items-center justify-center gap-2 ${
                  isAddingToCart || !inStock
                    ? 'bg-gray-400 text-white cursor-not-allowed'
                    : 'bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600 text-white shadow-lg hover:shadow-pink-lg'
                }`}
              >
                <Zap className="w-5 h-5" />
                Buy Now
              </button>
              
              <button 
                onClick={handleWishlist}
                className="p-3 border border-gray-300 rounded-lg hover:border-pink-500 hover:text-pink-600 transition-all duration-300 hover:shadow-pink-md"
              >
                <Heart className="w-5 h-5" />
              </button>
              <button 
                onClick={handleShare}
                className="p-3 border border-gray-300 rounded-lg hover:border-pink-500 hover:text-pink-600 transition-all duration-300 hover:shadow-pink-md"
              >
                <Share2 className="w-5 h-5" />
              </button>
            </div>

            {/* ✅ FIXED: Stock status message */}
            {!inStock && (
              <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded-lg">
                <div className="flex items-center gap-2 text-red-600">
                  <AlertCircle className="w-5 h-5" />
                  <span className="font-medium">Out of Stock</span>
                </div>
                <p className="text-sm text-red-600 mt-1">
                  This product is currently unavailable. Please check back later.
                </p>
              </div>
            )}

            {inStock && stockCount < 10 && (
              <div className="mt-3 p-3 bg-pink-50 border border-pink-200 rounded-lg">
  <div className="flex items-center gap-2 text-pink-600">
    <Clock className="w-5 h-5" />
    <span className="font-medium">Only {stockCount} left in stock!</span>
  </div>
  <p className="text-sm text-pink-600 mt-1">
                  Hurry up! This product is selling fast.
                </p>
              </div>
            )}

            {/* Payment Methods */}
            <div className="mt-6 border rounded-xl p-4">
              <div className="flex items-center gap-2 mb-3">
                <CreditCard className="w-5 h-5 text-pink-600" />
                <span className="font-semibold">Secure Payment Options</span>
              </div>
              <div className="flex flex-wrap gap-3">
                {paymentMethods.map(method => (
                  <button
                    key={method.id}
                    onClick={() => setSelectedPaymentMethod(method.id)}
                    className={`flex items-center gap-2 px-3 py-2 rounded-lg border transition-all ${
                      selectedPaymentMethod === method.id
                        ? 'border-pink-500 bg-pink-50 shadow-pink-sm'
                        : 'border-gray-200 hover:border-pink-300 hover:bg-pink-50/30'
                    }`}
                  >
                    <method.icon className="w-4 h-4" />
                    <span className="text-sm">{method.name}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Price Breakdown */}
            <div className="mt-4 bg-gray-50 rounded-xl p-4">
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Price ({quantity} item{quantity > 1 ? 's' : ''})</span>
                  <span>₹{totalPrice.toLocaleString('en-IN')}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">GST (3%)</span>
                  <span>₹{gst.toLocaleString('en-IN')}</span>
                </div>
                <div className="border-t pt-2 mt-2">
                  <div className="flex justify-between font-bold">
                    <span>Total Amount</span>
                    <span className="text-pink-600">₹{finalPrice.toLocaleString('en-IN')}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs Section */}
        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          <div className="flex border-b overflow-x-auto">
            {['details', 'specifications', 'care', 'reviews'].map(tab => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-6 py-3 font-medium capitalize transition-all whitespace-nowrap ${
                  activeTab === tab
  ? 'text-pink-600 border-b-2 border-pink-600'
  : 'text-gray-500 hover:text-pink-600'
                }`}
              >
                {tab === 'details' ? 'Product Details' : 
                 tab === 'specifications' ? 'Specifications' :
                 tab === 'care' ? 'Care Instructions' : 'Reviews'}
              </button>
            ))}
          </div>

          <div className="p-6">
            {activeTab === 'details' && (
              <div>
                <p className="text-gray-700 leading-relaxed">{product.longDescription || product.description || 'No description available.'}</p>
                <div className="mt-6">
                  <h4 className="font-semibold mb-3">Key Features</h4>
                  <ul className="grid md:grid-cols-2 gap-2">
                    {(product.features || ['Premium quality craftsmanship', 'Certified authenticity', 'Lifetime warranty']).map((feature, idx) => (
                      <li key={idx} className="flex items-center gap-2 text-sm text-gray-600">
                        <Check className="w-4 h-4 text-green-500 flex-shrink-0" />
                        {feature}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            )}

            {activeTab === 'specifications' && (
              <div className="grid md:grid-cols-2 gap-4">
                {product.specifications && Object.keys(product.specifications).length > 0 ? (
                  Object.entries(product.specifications).map(([key, value]) => (
                    <div key={key} className="flex justify-between py-2 border-b">
                      <span className="text-gray-500">{key}</span>
                      <span className="font-medium text-gray-900">{value}</span>
                    </div>
                  ))
                ) : (
                  <p className="text-gray-500 col-span-2">No specifications available</p>
                )}
              </div>
            )}

            {activeTab === 'care' && (
              <div>
                <h4 className="font-semibold mb-3">How to Care for Your Jewellery</h4>
                <ul className="space-y-2">
                  {(product.careInstructions || [
                    'Store in the provided jewellery box',
                    'Clean with soft cloth regularly',
                    'Avoid contact with chemicals and perfumes',
                    'Remove while sleeping or exercising'
                  ]).map((instruction, idx) => (
                    <li key={idx} className="flex items-center gap-2 text-gray-600">
                      <Sparkles className="w-4 h-4 text-pink-500 flex-shrink-0" />
                      {instruction}
                    </li>
                  ))}
                </ul>
                <div className="mt-6 bg-amber-50 rounded-lg p-4">
                  <h5 className="font-semibold text-amber-800 mb-2">Warranty Information</h5>
                  <p className="text-sm text-amber-700">{product.warranty || "Standard warranty applies"}</p>
                </div>
              </div>
            )}

            {activeTab === 'reviews' && (
              <Reviews reviews={product.reviews} rating={product.rating} />
            )}
          </div>
        </div>

        {/* Related Products */}
        {relatedProducts.length > 0 && (
          <div className="mt-12">
            <h3 className="text-2xl font-serif text-gray-900 mb-6">You May Also Like</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {relatedProducts.map(relatedProduct => (
                <div 
                  key={relatedProduct._id || relatedProduct.id}
                  className="bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-lg transition-all cursor-pointer"
                  onClick={() => navigate(`/product/${relatedProduct._id || relatedProduct.id}`)}
                >
                  <div className="h-48 overflow-hidden bg-gray-100">
                    <img 
                      src={relatedProduct.images?.[0] || 'https://via.placeholder.com/300x300?text=No+Image'} 
                      alt={relatedProduct.name}
                      className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                      onError={(e) => {
                        e.target.src = 'https://via.placeholder.com/300x300?text=No+Image';
                      }}
                    />
                  </div>
                  <div className="p-4">
                    <h4 className="font-semibold text-gray-900 text-sm line-clamp-1">{relatedProduct.name}</h4>
                    <div className="flex items-center gap-1 mt-1">
                      <Star className="w-3 h-3 fill-pink-500 text-pink-500" />
                      <span className="text-xs font-semibold">{relatedProduct.rating || 0}</span>
                    </div>
                    <p className="text-pink-600 font-bold mt-2">₹{relatedProduct.price?.toLocaleString('en-IN') || 0}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Payment Button Section */}
        <div className="mt-8 bg-gradient-to-r from-pink-50 to-rose-50 rounded-xl p-6 text-center border border-pink-100">
          <h3 className="text-2xl font-serif text-gray-900 mb-2">Ready to Make This Yours?</h3>
          <p className="text-gray-600 mb-4">Secure checkout with multiple payment options</p>
          <div className="flex gap-3 justify-center flex-wrap">
            <button 
              onClick={handleBuyNow}
              disabled={isAddingToCart || !inStock}
              className={`bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600 text-white px-8 py-3 rounded-full font-semibold transition-all flex items-center gap-2 shadow-lg hover:shadow-pink-lg ${
                (isAddingToCart || !inStock) ? 'opacity-50 cursor-not-allowed' : ''
              }`}
            >
              <CreditCard className="w-5 h-5" />
              Proceed to Payment
            </button>
            <button 
              onClick={handleAddToCart}
              disabled={isAddingToCart || !inStock}
              className={`border-2 border-pink-500 text-pink-600 hover:bg-gradient-to-r hover:from-pink-500 hover:to-rose-500 hover:text-white px-8 py-3 rounded-full font-semibold transition-all duration-300 shadow-md hover:shadow-pink-lg ${
                (isAddingToCart || !inStock) ? 'opacity-50 cursor-not-allowed' : ''
              }`}
            >
              {isAddingToCart ? 'Adding...' : 'Add to Cart'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ProductDetails;
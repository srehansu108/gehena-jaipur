// src/services/productService.js - CORRECT VERSION WITH API

import { 
  getProducts as apiGetProducts,
  getProductById as apiGetProductById,
  getBestsellers as apiGetBestsellers,
  getNewArrivals as apiGetNewArrivals,
  getSaleProducts as apiGetSaleProducts,
  getMetals as apiGetMetals,
  getCategoryCounts as apiGetCategoryCounts
} from './api';

class ProductService {
  constructor() {
    // No local data - everything comes from API
    this.cache = {
      products: null,
      categories: null,
      metals: null,
    };
  }

  // ========== CORE PRODUCT METHODS ==========

  /**
   * Get all products with filters and pagination
   * @param {Object} filters - Filter parameters
   * @param {Object} options - Pagination and sorting options
   * @returns {Promise} Products data from API
   */
  async getProducts(filters = {}, options = {}) {
    try {
      const params = {
        page: options.page || 1,
        limit: options.limit || 20,
        sort: options.sort || 'createdAt',
        order: options.order || 'desc',
        ...filters
      };

      const response = await apiGetProducts(params);
      
      if (response.success) {
        return {
          products: response.data,
          pagination: response.pagination,
          total: response.pagination?.totalItems || 0,
          filters: response.filters,
          success: true
        };
      }
      
      return { products: [], total: 0, success: false, error: response.message };
    } catch (error) {
      console.error('Error fetching products:', error);
      return { products: [], total: 0, success: false, error: error.message };
    }
  }

  /**
   * Get product by ID
   * @param {string} id - Product ID (MongoDB _id)
   * @returns {Promise} Product data
   */
  async getProductById(id) {
    try {
      const response = await apiGetProductById(id);
      
      if (response.success) {
        return {
          product: response.data,
          related: response.related || [],
          success: true
        };
      }
      
      return { product: null, success: false, error: response.message };
    } catch (error) {
      console.error('Error fetching product:', error);
      return { product: null, success: false, error: error.message };
    }
  }

  // ========== COLLECTION METHODS ==========

  /**
   * Get bestseller products
   * @param {number} limit - Number of products
   * @returns {Promise} Bestseller products
   */
  async getBestsellers(limit = 8) {
    try {
      const response = await apiGetBestsellers(limit);
      
      if (response.success) {
        return { products: response.data, success: true };
      }
      
      return { products: [], success: false };
    } catch (error) {
      console.error('Error fetching bestsellers:', error);
      return { products: [], success: false };
    }
  }

  /**
   * Get new arrival products
   * @param {number} limit - Number of products
   * @returns {Promise} New arrival products
   */
  async getNewArrivals(limit = 8) {
    try {
      const response = await apiGetNewArrivals(limit);
      
      if (response.success) {
        return { products: response.data, success: true };
      }
      
      return { products: [], success: false };
    } catch (error) {
      console.error('Error fetching new arrivals:', error);
      return { products: [], success: false };
    }
  }

  /**
   * Get sale products
   * @param {number} limit - Number of products
   * @returns {Promise} Sale products
   */
  async getSaleProducts(limit = 8) {
    try {
      const response = await apiGetSaleProducts(limit);
      
      if (response.success) {
        return { products: response.data, success: true };
      }
      
      return { products: [], success: false };
    } catch (error) {
      console.error('Error fetching sale products:', error);
      return { products: [], success: false };
    }
  }

  // ========== META METHODS ==========

  /**
   * Get all unique metals
   * @returns {Promise} Metals data
   */
  async getMetals() {
    try {
      // Check cache first
      if (this.cache.metals) {
        return { metals: this.cache.metals, success: true };
      }

      const response = await apiGetMetals();
      
      if (response.success) {
        this.cache.metals = response.data;
        return { metals: response.data, success: true };
      }
      
      return { metals: [], success: false };
    } catch (error) {
      console.error('Error fetching metals:', error);
      return { metals: [], success: false };
    }
  }

  /**
   * Get category counts
   * @returns {Promise} Category counts data
   */
  async getCategoryCounts() {
    try {
      // Check cache first
      if (this.cache.categories) {
        return { categories: this.cache.categories, success: true };
      }

      const response = await apiGetCategoryCounts();
      
      if (response.success) {
        this.cache.categories = response.data;
        return { categories: response.data, success: true };
      }
      
      return { categories: {}, success: false };
    } catch (error) {
      console.error('Error fetching category counts:', error);
      return { categories: {}, success: false };
    }
  }

  // ========== FILTER & SEARCH HELPERS ==========

  /**
   * Get products by category
   * @param {string} category - Category ID
   * @param {Object} options - Pagination options
   * @returns {Promise} Products data
   */
  async getProductsByCategory(category, options = {}) {
    return this.getProducts({ category }, options);
  }

  /**
   * Get products by subcategory
   * @param {string} subcategory - Subcategory
   * @param {Object} options - Pagination options
   * @returns {Promise} Products data
   */
  async getProductsBySubcategory(subcategory, options = {}) {
    return this.getProducts({ subcategory }, options);
  }

  /**
   * Search products
   * @param {string} query - Search query
   * @param {Object} options - Pagination options
   * @returns {Promise} Products data
   */
  async searchProducts(query, options = {}) {
    return this.getProducts({ search: query }, options);
  }

  /**
   * Filter products with multiple criteria
   * @param {Object} filters - Filter criteria
   * @param {Object} options - Pagination options
   * @returns {Promise} Products data
   */
  async filterProducts(filters = {}, options = {}) {
  const filterParams = {
    // ✅ Make sure navbar filters are included
    navbarCategory: filters.navbarCategory,
    navbarSubcategory: filters.navbarSubcategory,
    category: filters.category,
    subcategory: filters.subcategory,
    minPrice: filters.priceMin,
    maxPrice: filters.priceMax,
    metals: filters.metals?.join(','),
    minRating: filters.rating,
    inStockOnly: filters.inStockOnly,
    search: filters.searchQuery,
    tags: filters.tags?.join(','),
    brand: filters.brand,
    badgeType: filters.badgeType
  };

  // Remove undefined values
  Object.keys(filterParams).forEach(key => {
    if (filterParams[key] === undefined || filterParams[key] === null || filterParams[key] === '') {
      delete filterParams[key];
    }
  });

  // Log what we're sending
  console.log('🔍 Frontend sending filters:', filterParams);

  const result = await this.getProducts(filterParams, options);
  
  return {
    ...result,
    products: result.products || [],
    success: true
  };
}

  // ========== STATIC DATA METHODS ==========

  /**
   * Get static data (from backend or local fallback)
   * These can come from API or be hardcoded
   */
  getOffers() {
    // You can fetch this from API or use local data
    return [
      { code: "WELCOME10", discount: "10% off", minAmount: "₹5,000", description: "First purchase discount" },
      { code: "FREESHIP", discount: "Free Shipping", minAmount: "₹50,000", description: "Complimentary delivery" },
      { code: "EXCHANGE", discount: "0% deduction", minAmount: "Old gold exchange", description: "Best exchange rates" },
      { code: "DIWALI20", discount: "20% off", minAmount: "₹25,000", description: "Festival special" }
    ];
  }

  getTrustBadges() {
    return [
      { icon: "Shield", text: "100% Certified", color: "text-blue-600" },
      { icon: "Award", text: "Hallmarked", color: "text-amber-600" },
      { icon: "Clock", text: "Lifetime Warranty", color: "text-green-600" },
      { icon: "Truck", text: "Free Shipping", color: "text-purple-600" }
    ];
  }

  getPaymentMethods() {
    return [
      { id: "card", name: "Credit/Debit Card", icon: "CreditCard" },
      { id: "upi", name: "UPI", icon: "Wallet" },
      { id: "netbanking", name: "Net Banking", icon: "Building2" },
      { id: "cod", name: "Cash on Delivery", icon: "Wallet" }
    ];
  }

  getSizeOptions(category) {
    const sizes = {
      rings: ["5", "6", "7", "8", "9", "10"],
      necklaces: ["16 inch", "18 inch", "20 inch", "22 inch"],
      bangles: ["2.2", "2.4", "2.6", "2.8", "3.0"],
      bracelets: ["6 inch", "7 inch", "8 inch"]
    };
    return sizes[category] || [];
  }

  getEMIOptions() {
    return [3, 6, 9, 12];
  }

  getHeroSlides() {
    // Can fetch from API or use static data
    return [
      { id: 1, title: "Exquisite Diamond Collection", subtitle: "Up to 40% off", image: "/images/hero/diamond.jpg", cta: "Shop Now" },
      { id: 2, title: "Wedding Special", subtitle: "Complete Bridal Sets", image: "/images/hero/wedding.jpg", cta: "Explore Now" },
      { id: 3, title: "Festival Offers", subtitle: "Free Shipping + Gifts", image: "/images/hero/festival.jpg", cta: "Grab Deal" }
    ];
  }

  // ========== CACHE MANAGEMENT ==========

  /**
   * Clear the cache
   */
  clearCache() {
    this.cache = {
      products: null,
      categories: null,
      metals: null,
    };
    console.log('🗑️ Product service cache cleared');
  }

  /**
   * Get cache status
   */
  getCacheStatus() {
    return {
      metals: !!this.cache.metals,
      categories: !!this.cache.categories,
    };
  }
}

// Export singleton instance
export const productService = new ProductService();
export default productService;
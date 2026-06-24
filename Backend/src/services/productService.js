// backend/services/productService.js
const Product = require('../models/Product');
const cacheService = require('./cacheService');

class ProductService {
  // ✅ Make sure this method exists and is properly defined
  async getProducts(filters = {}, options = {}) {
    try {
      console.log('🔍 ProductService.getProducts called with:', { filters, options });
      
      const {
        page = 1,
        limit = 20,
        sort = 'createdAt',
        order = 'desc',
      } = options;

      // Build filter query
      const query = this.buildFilterQuery(filters);
      console.log('📊 MongoDB Query:', JSON.stringify(query, null, 2));

      // Calculate pagination
      const skip = (page - 1) * limit;
      const sortOrder = order === 'desc' ? -1 : 1;
      const sortObject = { [sort]: sortOrder };

      // Execute queries
      const [products, totalCount] = await Promise.all([
        Product.find(query)
          .select('-__v')
          .sort(sortObject)
          .skip(skip)
          .limit(Number(limit))
          .lean()
          .exec(),
        Product.countDocuments(query)
      ]);

      console.log(`✅ Found ${products.length} products out of ${totalCount} total`);

      const result = {
        products: products || [],
        pagination: {
          currentPage: Number(page),
          totalPages: Math.ceil(totalCount / limit) || 1,
          totalItems: totalCount,
          itemsPerPage: Number(limit),
          hasNextPage: skip + products.length < totalCount,
          hasPrevPage: page > 1,
        },
      };

      return result;
    } catch (error) {
      console.error('❌ Error in getProducts:', error);
      return {
        products: [],
        pagination: {
          currentPage: 1,
          totalPages: 1,
          totalItems: 0,
          itemsPerPage: 20,
          hasNextPage: false,
          hasPrevPage: false,
        },
      };
    }
  }

  // ✅ Make sure buildFilterQuery exists
  buildFilterQuery(filters) {
    const query = {};
    console.log('🔧 Building filter query from:', filters);

    // Navbar Category filter
    if (filters.navbarCategory) {
      query.navbarCategory = filters.navbarCategory;
    }

    // Navbar Subcategory filter
    if (filters.navbarSubcategory) {
      query.navbarSubcategory = filters.navbarSubcategory;
    }

    // Category filter
    if (filters.category && filters.category !== 'all') {
      query.category = filters.category;
    }

    // Subcategory filter
    if (filters.subcategory) {
      query.subcategory = filters.subcategory;
    }

    // Price range
    if (filters.minPrice !== undefined && filters.minPrice !== null && filters.minPrice !== '') {
      query.price = query.price || {};
      query.price.$gte = Number(filters.minPrice);
    }
    if (filters.maxPrice !== undefined && filters.maxPrice !== null && filters.maxPrice !== '' && filters.maxPrice !== 'Infinity') {
      query.price = query.price || {};
      query.price.$lte = Number(filters.maxPrice);
    }

    // Metal type
    if (filters.metals && filters.metals.length > 0) {
      query.metal = { $in: filters.metals };
    }

    // Rating filter
    if (filters.minRating && Number(filters.minRating) > 0) {
      query.rating = { $gte: Number(filters.minRating) };
    }

    // In stock only
    if (filters.inStockOnly === 'true' || filters.inStockOnly === true) {
      query.inStock = true;
      query.stockCount = { $gt: 0 };
    }

    // Search query
    if (filters.search) {
      query.$text = { $search: filters.search };
    }

    // Tags filter
    if (filters.tags && filters.tags.length > 0) {
      query.tags = { $in: filters.tags };
    }

    // Brand filter
    if (filters.brand) {
      query.brand = filters.brand;
    }

    // Badge type filter
    if (filters.badgeType) {
      query.badgeType = filters.badgeType;
    }

    console.log('📊 Final query:', JSON.stringify(query, null, 2));
    return query;
  }

  // ✅ Make sure other methods exist
  async getProductById(id) {
    try {
      console.log('🔍 getProductById called with:', id);
      
      let product = null;
      
      // Try by MongoDB _id
      if (id && id.match(/^[0-9a-fA-F]{24}$/)) {
        product = await Product.findById(id).lean();
      }
      
      // Try by numeric id
      if (!product) {
        const numericId = parseInt(id);
        if (!isNaN(numericId)) {
          product = await Product.findOne({ id: numericId }).lean();
        }
      }
      
      // Try by SKU
      if (!product) {
        product = await Product.findOne({ sku: id }).lean();
      }

      return product;
    } catch (error) {
      console.error('❌ Error in getProductById:', error);
      return null;
    }
  }

  // Add other methods with console logs for debugging
  async getMetals() {
    try {
      return await Product.distinct('metal');
    } catch (error) {
      console.error('❌ Error getting metals:', error);
      return [];
    }
  }

  async getCategoryCounts() {
    try {
      const counts = await Product.aggregate([
        { $group: { _id: '$category', count: { $sum: 1 } } }
      ]);
      return counts.reduce((acc, curr) => {
        acc[curr._id] = curr.count;
        return acc;
      }, {});
    } catch (error) {
      console.error('❌ Error getting category counts:', error);
      return {};
    }
  }

  async getRelatedProducts(productId, category, limit = 4) {
    try {
      return await Product.find({
        category: category,
        _id: { $ne: productId },
        inStock: true,
      })
      .sort({ rating: -1 })
      .limit(limit)
      .lean();
    } catch (error) {
      console.error('❌ Error getting related products:', error);
      return [];
    }
  }

  async getBestsellers(limit = 8) {
    try {
      return await Product.find({
        badgeType: 'bestseller',
        inStock: true,
      })
      .sort({ rating: -1 })
      .limit(limit)
      .lean();
    } catch (error) {
      console.error('❌ Error getting bestsellers:', error);
      return [];
    }
  }

  async getNewArrivals(limit = 8) {
    try {
      return await Product.find({
        badgeType: 'new',
        inStock: true,
      })
      .sort({ createdAt: -1 })
      .limit(limit)
      .lean();
    } catch (error) {
      console.error('❌ Error getting new arrivals:', error);
      return [];
    }
  }

  async getSaleProducts(limit = 8) {
    try {
      return await Product.find({
        discount: { $gt: 15 },
        inStock: true,
      })
      .sort({ discount: -1 })
      .limit(limit)
      .lean();
    } catch (error) {
      console.error('❌ Error getting sale products:', error);
      return [];
    }
  }

  async clearCache() {
    // Implement if you have caching
    console.log('🗑️ Cache cleared');
  }
}

// ✅ ENSURE THIS EXPORT IS CORRECT
// Use module.exports = new ProductService();
// NOT module.exports = ProductService;
const productServiceInstance = new ProductService();
module.exports = productServiceInstance;

// Debug: Log what's being exported
console.log('📦 productService exported methods:', Object.keys(productServiceInstance));
// backend/controllers/productController.js
const productService = require('../services/productService');
const Product = require('../models/Product'); // ✅ ADDED THIS IMPORT

class ProductController {
  // Get all products with filters and pagination
  async getProducts(req, res) {
    try {
      console.log('📦 Incoming request query:', req.query);
      
      const {
        page = 1,
        limit = process.env.DEFAULT_PAGE_SIZE || 20,
        sort = 'createdAt',
        order = 'desc',
        category,
        subcategory,
        navbarCategory,
        navbarSubcategory,
        minPrice,
        maxPrice,
        metals,
        minRating,
        inStockOnly,
        search,
        tags,
        brand,
        badgeType,
      } = req.query;

      const filters = {
        category,
        subcategory,
        navbarCategory,
        navbarSubcategory,
        minPrice,
        maxPrice,
        metals: metals ? metals.split(',') : [],
        minRating,
        inStockOnly: inStockOnly === 'true',
        search,
        tags: tags ? tags.split(',') : [],
        brand,
        badgeType,
      };

      const options = {
        page: Number(page),
        limit: Math.min(Number(limit), Number(process.env.MAX_PAGE_SIZE || 100)),
        sort,
        order,
      };

      console.log('🔍 Filters:', filters);
      console.log('🔍 Options:', options);

      const result = await productService.getProducts(filters, options);

      res.json({
        success: true,
        data: result.products || [],
        pagination: result.pagination || {
          currentPage: 1,
          totalPages: 1,
          totalItems: 0,
          itemsPerPage: 20,
          hasNextPage: false,
          hasPrevPage: false,
        },
        filters: {
          applied: filters,
        },
      });
    } catch (error) {
      console.error('❌ Error fetching products:', error);
      res.status(500).json({
        success: false,
        message: 'Error fetching products',
        error: error.message,
      });
    }
  }
/**
 * Get products for admin panel with full control
 * @route GET /api/products/admin/products
 * @access Private (Admin only)
 */
async getAdminProducts(req, res) {
  try {
    console.log('📦 Admin fetching products...');
    
    const {
      page = 1,
      limit = 10,
      sort = 'createdAt',
      order = 'desc',
      search = '',
      category = '',
      subcategory = '',
      navbarCategory = '',
      navbarSubcategory = '',
      minPrice,
      maxPrice,
      metals,
      minRating,
      inStockOnly,
      tags,
      brand,
      badgeType,
    } = req.query;

    // Build filters
    const filters = {
      category: category || undefined,
      subcategory: subcategory || undefined,
      navbarCategory: navbarCategory || undefined,
      navbarSubcategory: navbarSubcategory || undefined,
      minPrice: minPrice || undefined,
      maxPrice: maxPrice || undefined,
      metals: metals ? metals.split(',') : [],
      minRating: minRating || undefined,
      inStockOnly: inStockOnly === 'true',
      search: search || undefined,
      tags: tags ? tags.split(',') : [],
      brand: brand || undefined,
      badgeType: badgeType || undefined,
    };

    // Remove empty filters
    Object.keys(filters).forEach(key => {
      if (filters[key] === undefined || filters[key] === null || filters[key] === '') {
        delete filters[key];
      }
      if (Array.isArray(filters[key]) && filters[key].length === 0) {
        delete filters[key];
      }
    });

    const options = {
      page: Number(page),
      limit: Math.min(Number(limit), 100),
      sort,
      order,
    };

    console.log('🔍 Admin filters:', filters);
    console.log('🔍 Admin options:', options);

    // Fetch products using service
    const result = await productService.getProducts(filters, options);

    res.json({
      success: true,
      data: result.products || [],
      pagination: result.pagination || {
        currentPage: 1,
        totalPages: 1,
        totalItems: 0,
        itemsPerPage: 10,
        hasNextPage: false,
        hasPrevPage: false,
      },
      filters: {
        applied: filters,
      },
    });
  } catch (error) {
    console.error('❌ Error in admin getProducts:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching products for admin',
      error: error.message,
    });
  }
}
  // Get single product by ID
  async getProductById(req, res) {
    try {
      const { id } = req.params;
      console.log('🔍 Controller looking for product with ID:', id);
      
      const product = await productService.getProductById(id);

      if (!product) {
        return res.status(404).json({
          success: false,
          message: `Product not found with ID: ${id}`,
        });
      }

      // Get related products
      const relatedProducts = await productService.getRelatedProducts(
        product._id,
        product.category
      );

      res.json({
        success: true,
        data: product,
        related: relatedProducts || [],
      });
    } catch (error) {
      console.error('❌ Error fetching product:', error);
      res.status(500).json({
        success: false,
        message: 'Error fetching product',
        error: error.message,
      });
    }
  }

  // Get product by SKU
  async getProductBySku(req, res) {
    try {
      const { sku } = req.params;
      console.log('🔍 Controller looking for product with SKU:', sku);
      
      const product = await productService.getProductBySku(sku);

      if (!product) {
        return res.status(404).json({
          success: false,
          message: 'Product not found',
        });
      }

      res.json({
        success: true,
        data: product,
      });
    } catch (error) {
      console.error('❌ Error fetching product by SKU:', error);
      res.status(500).json({
        success: false,
        message: 'Error fetching product',
        error: error.message,
      });
    }
  }

  // Get all unique metals
  async getMetals(req, res) {
    try {
      console.log('🔍 Fetching unique metals...');
      const metals = await productService.getMetals();
      console.log('✅ Metals found:', metals);
      
      res.json({
        success: true,
        data: metals || [],
      });
    } catch (error) {
      console.error('❌ Error fetching metals:', error);
      res.status(500).json({
        success: false,
        message: 'Error fetching metals',
        error: error.message,
      });
    }
  }

  // Get category counts
  async getCategoryCounts(req, res) {
    try {
      console.log('🔍 Fetching category counts...');
      const counts = await productService.getCategoryCounts();
      console.log('✅ Category counts:', counts);
      
      res.json({
        success: true,
        data: counts || {},
      });
    } catch (error) {
      console.error('❌ Error fetching category counts:', error);
      res.status(500).json({
        success: false,
        message: 'Error fetching category counts',
        error: error.message,
      });
    }
  }

  // Get bestsellers
  async getBestsellers(req, res) {
    try {
      const { limit = 8 } = req.query;
      console.log('🔍 Fetching bestsellers, limit:', limit);
      
      const products = await productService.getBestsellers(Number(limit));
      console.log(`✅ Found ${products.length} bestsellers`);
      
      res.json({
        success: true,
        data: products || [],
      });
    } catch (error) {
      console.error('❌ Error fetching bestsellers:', error);
      res.status(500).json({
        success: false,
        message: 'Error fetching bestsellers',
        error: error.message,
      });
    }
  }

  // Get new arrivals
  async getNewArrivals(req, res) {
    try {
      const { limit = 8 } = req.query;
      console.log('🔍 Fetching new arrivals, limit:', limit);
      
      const products = await productService.getNewArrivals(Number(limit));
      console.log(`✅ Found ${products.length} new arrivals`);
      
      res.json({
        success: true,
        data: products || [],
      });
    } catch (error) {
      console.error('❌ Error fetching new arrivals:', error);
      res.status(500).json({
        success: false,
        message: 'Error fetching new arrivals',
        error: error.message,
      });
    }
  }

  // Get sale products
  async getSaleProducts(req, res) {
    try {
      const { limit = 8 } = req.query;
      console.log('🔍 Fetching sale products, limit:', limit);
      
      const products = await productService.getSaleProducts(Number(limit));
      console.log(`✅ Found ${products.length} sale products`);
      
      res.json({
        success: true,
        data: products || [],
      });
    } catch (error) {
      console.error('❌ Error fetching sale products:', error);
      res.status(500).json({
        success: false,
        message: 'Error fetching sale products',
        error: error.message,
      });
    }
  }

  // ✅ FIXED: Create product (Admin) - Added Product import
  async createProduct(req, res) {
    try {
      const productData = req.body;
      console.log('📦 Creating product:', productData.name || 'Unnamed');
      console.log('📦 Product data:', JSON.stringify(productData, null, 2));
      
      // ✅ Use the Product model directly
      const product = await Product.create(productData);
      console.log('✅ Product created with ID:', product._id);
      
      // Clear cache
      await productService.clearCache();
      
      res.status(201).json({
        success: true,
        data: product,
        message: 'Product created successfully',
      });
    } catch (error) {
      console.error('❌ Error creating product:', error);
      
      // Handle duplicate key error
      if (error.code === 11000) {
        return res.status(400).json({
          success: false,
          message: 'Duplicate product. A product with this SKU or ID already exists.',
          error: error.message,
        });
      }
      
      // Handle validation error
      if (error.name === 'ValidationError') {
        return res.status(400).json({
          success: false,
          message: 'Validation error',
          errors: Object.values(error.errors).map(e => e.message),
        });
      }
      
      res.status(500).json({
        success: false,
        message: 'Error creating product',
        error: error.message,
      });
    }
  }

  // ✅ FIXED: Update product (Admin) - Added Product import
  async updateProduct(req, res) {
    try {
      const { id } = req.params;
      const updates = req.body;
      
      console.log('📝 Updating product:', id);
      console.log('📝 Update data:', JSON.stringify(updates, null, 2));
      
      // ✅ Use the Product model directly
      const product = await Product.findByIdAndUpdate(
        id,
        { ...updates, updatedAt: new Date() },
        { new: true, runValidators: true }
      );

      if (!product) {
        console.log('❌ Product not found with ID:', id);
        return res.status(404).json({
          success: false,
          message: 'Product not found',
        });
      }

      console.log('✅ Product updated:', product._id);
      
      // Clear cache
      await productService.clearCache();

      res.json({
        success: true,
        data: product,
        message: 'Product updated successfully',
      });
    } catch (error) {
      console.error('❌ Error updating product:', error);
      
      // Handle duplicate key error
      if (error.code === 11000) {
        return res.status(400).json({
          success: false,
          message: 'Duplicate product. A product with this SKU or ID already exists.',
          error: error.message,
        });
      }
      
      res.status(500).json({
        success: false,
        message: 'Error updating product',
        error: error.message,
      });
    }
  }

  // ✅ FIXED: Delete product (Admin) - Added Product import
  async deleteProduct(req, res) {
    try {
      const { id } = req.params;
      console.log('🗑️ Deleting product:', id);
      
      // ✅ Use the Product model directly
      const product = await Product.findByIdAndDelete(id);

      if (!product) {
        console.log('❌ Product not found with ID:', id);
        return res.status(404).json({
          success: false,
          message: 'Product not found',
        });
      }

      console.log('✅ Product deleted:', product._id);
      
      // Clear cache
      await productService.clearCache();

      res.json({
        success: true,
        message: 'Product deleted successfully',
      });
    } catch (error) {
      console.error('❌ Error deleting product:', error);
      res.status(500).json({
        success: false,
        message: 'Error deleting product',
        error: error.message,
      });
    }
  }

  // ✅ FIXED: Bulk import products (Admin) - Added Product import
  async bulkImport(req, res) {
    try {
      const products = req.body.products;
      
      if (!products || !Array.isArray(products)) {
        return res.status(400).json({
          success: false,
          message: 'Invalid data format. Expected array of products.',
        });
      }

      console.log(`📦 Bulk importing ${products.length} products...`);

      // ✅ Use the Product model directly
      const result = await Product.insertMany(products, { ordered: false });
      console.log(`✅ Successfully imported ${result.length} products`);
      
      // Clear cache
      await productService.clearCache();

      res.status(201).json({
        success: true,
        data: {
          inserted: result.length,
          total: products.length,
          failed: products.length - result.length,
        },
        message: `${result.length} products imported successfully`,
      });
    } catch (error) {
      console.error('❌ Error importing products:', error);
      
      // Handle duplicate key errors in bulk import
      if (error.code === 11000) {
        return res.status(400).json({
          success: false,
          message: 'Some products already exist. Please check for duplicate SKUs or IDs.',
          error: error.message,
          duplicateKeys: error.keyPattern,
        });
      }
      
      res.status(500).json({
        success: false,
        message: 'Error importing products',
        error: error.message,
      });
    }
  }
  /**
   * Export products as CSV
   * @route GET /api/products/admin/export/csv
   * @access Private (Admin only)
   */
  async exportCSV(req, res) {
    try {
      console.log('📤 Exporting products as CSV...');
      
      // Get products from database
      const products = await Product.find({})
        .select('-__v -updatedAt')
        .lean();

      if (!products || products.length === 0) {
        return res.status(404).json({
          success: false,
          message: 'No products found to export'
        });
      }

      // Define CSV headers based on your Product model
      const headers = [
        'id', 'name', 'category', 'subcategory', 'navbarCategory', 'navbarSubcategory',
        'tags', 'price', 'originalPrice', 'rating', 'reviews', 'metal', 'weight',
        'diamondWeight', 'diamondClarity', 'diamondColor', 'inStock', 'stockCount',
        'badge', 'badgeType', 'description', 'longDescription', 'features',
        'specifications', 'careInstructions', 'shippingInfo', 'warranty', 'brand',
        'sku', 'discount', 'images'
      ];

      // Generate CSV content
      let csvContent = headers.join(',') + '\n';

      products.forEach(product => {
        const row = headers.map(header => {
          let value = product[header];
          
          // Handle arrays and objects
          if (Array.isArray(value)) {
            value = value.join('|');
          } else if (typeof value === 'object' && value !== null) {
            value = JSON.stringify(value).replace(/,/g, ';');
          }
          
          // Handle strings with commas
          if (typeof value === 'string' && value.includes(',')) {
            value = `"${value}"`;
          }
          
          return value || '';
        });
        
        csvContent += row.join(',') + '\n';
      });

      // Set response headers for CSV download
      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', `attachment; filename=products_${Date.now()}.csv`);
      
      res.send(csvContent);
      
      console.log(`✅ CSV exported: ${products.length} products`);
    } catch (error) {
      console.error('❌ Error exporting CSV:', error);
      res.status(500).json({
        success: false,
        message: 'Error exporting products as CSV',
        error: error.message
      });
    }
  }

  /**
   * Export products as JSON
   * @route GET /api/products/admin/export/json
   * @access Private (Admin only)
   */
  async exportJSON(req, res) {
    try {
      console.log('📤 Exporting products as JSON...');
      
      const products = await Product.find({})
        .select('-__v')
        .lean();

      if (!products || products.length === 0) {
        return res.status(404).json({
          success: false,
          message: 'No products found to export'
        });
      }

      res.setHeader('Content-Type', 'application/json');
      res.setHeader('Content-Disposition', `attachment; filename=products_${Date.now()}.json`);
      
      res.json({
        success: true,
        total: products.length,
        exportedAt: new Date().toISOString(),
        data: products
      });
      
      console.log(`✅ JSON exported: ${products.length} products`);
    } catch (error) {
      console.error('❌ Error exporting JSON:', error);
      res.status(500).json({
        success: false,
        message: 'Error exporting products as JSON',
        error: error.message
      });
    }
  }

  /**
   * Get CSV template with headers
   * @route GET /api/products/admin/export/template
   * @access Private (Admin only)
   */
  async getCSVTemplate(req, res) {
    try {
      console.log('📄 Generating CSV template...');
      
      const headers = [
        'name', 'category', 'subcategory', 'price', 'originalPrice', 
        'metal', 'inStock', 'stockCount', 'sku', 'description', 
        'badgeType', 'discount', 'images', 'tags'
      ];

      // Create sample row with example data
      const sampleRow = [
        'Gold Ring', 'rings', 'Diamond Ring', '299.99', '399.99',
        'Gold', 'true', '10', 'SKU-001', 'Beautiful gold ring',
        'bestseller', '25', 'https://example.com/image.jpg', 'gold, diamond'
      ];

      let csvContent = headers.join(',') + '\n';
      csvContent += sampleRow.join(',') + '\n';

      // Add empty rows for user to fill
      for (let i = 0; i < 5; i++) {
        const emptyRow = headers.map(() => '');
        csvContent += emptyRow.join(',') + '\n';
      }

      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', 'attachment; filename=product_import_template.csv');
      
      res.send(csvContent);
      
      console.log('✅ CSV template generated');
    } catch (error) {
      console.error('❌ Error generating CSV template:', error);
      res.status(500).json({
        success: false,
        message: 'Error generating CSV template',
        error: error.message
      });
    }
  }

  /**
   * Bulk import products with validation
   * @route POST /api/products/admin/products/bulk
   * @access Private (Admin only)
   */
  async bulkImport(req, res) {
    try {
      const products = req.body.products;
      
      if (!products || !Array.isArray(products) || products.length === 0) {
        return res.status(400).json({
          success: false,
          message: 'Invalid data format. Expected array of products.',
        });
      }

      console.log(`📦 Bulk importing ${products.length} products...`);

      // Validate and sanitize each product
      const validatedProducts = products.map((product, index) => {
        // Required fields validation
        if (!product.name) {
          throw new Error(`Row ${index + 1}: Product name is required`);
        }
        if (!product.category) {
          throw new Error(`Row ${index + 1}: Category is required`);
        }
        if (!product.price) {
          throw new Error(`Row ${index + 1}: Price is required`);
        }

        // Clean up data
        const cleanProduct = {
          name: product.name.trim(),
          category: product.category.trim().toLowerCase(),
          subcategory: product.subcategory?.trim() || '',
          price: parseFloat(product.price),
          originalPrice: product.originalPrice ? parseFloat(product.originalPrice) : undefined,
          metal: product.metal?.trim() || '',
          inStock: product.inStock === 'true' || product.inStock === true || product.inStock === '1',
          stockCount: parseInt(product.stockCount) || 0,
          sku: product.sku?.trim() || `SKU-${Date.now()}-${index}`,
          description: product.description?.trim() || '',
          badgeType: product.badgeType?.trim() || '',
          discount: parseFloat(product.discount) || 0,
          images: product.images ? product.images.split('|').map(i => i.trim()) : [],
          tags: product.tags ? product.tags.split('|').map(t => t.trim()) : [],
          rating: parseFloat(product.rating) || 0,
          reviews: parseInt(product.reviews) || 0,
          weight: product.weight?.trim() || '',
        };

        return cleanProduct;
      });

      // Save products to database
      const result = await Product.insertMany(validatedProducts, { ordered: false });
      
      console.log(`✅ Successfully imported ${result.length} products`);
      
      // Clear cache if needed
      await productService.clearCache();

      res.status(201).json({
        success: true,
        data: {
          inserted: result.length,
          total: products.length,
          failed: products.length - result.length,
          products: result
        },
        message: `${result.length} products imported successfully`,
      });
    } catch (error) {
      console.error('❌ Error importing products:', error);
      
      // Handle duplicate key errors
      if (error.code === 11000) {
        return res.status(400).json({
          success: false,
          message: 'Some products already exist. Please check for duplicate SKUs.',
          error: error.message,
          duplicateKeys: error.keyPattern,
        });
      }
      
      res.status(500).json({
        success: false,
        message: 'Error importing products',
        error: error.message,
      });
    }
  }
}

module.exports = new ProductController();
const productService = require('../services/productService');

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
      console.error('Error fetching product by SKU:', error);
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
      const metals = await productService.getMetals();
      res.json({
        success: true,
        data: metals,
      });
    } catch (error) {
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
      const counts = await productService.getCategoryCounts();
      res.json({
        success: true,
        data: counts,
      });
    } catch (error) {
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
      const products = await productService.getBestsellers(Number(limit));
      res.json({
        success: true,
        data: products,
      });
    } catch (error) {
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
      const products = await productService.getNewArrivals(Number(limit));
      res.json({
        success: true,
        data: products,
      });
    } catch (error) {
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
      const products = await productService.getSaleProducts(Number(limit));
      res.json({
        success: true,
        data: products,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Error fetching sale products',
        error: error.message,
      });
    }
  }

  // Create product (Admin)
  async createProduct(req, res) {
    try {
      const productData = req.body;
      const product = await Product.create(productData);
      
      // Clear cache
      await productService.clearCache();
      
      res.status(201).json({
        success: true,
        data: product,
        message: 'Product created successfully',
      });
    } catch (error) {
      console.error('Error creating product:', error);
      res.status(500).json({
        success: false,
        message: 'Error creating product',
        error: error.message,
      });
    }
  }

  // Update product (Admin)
  async updateProduct(req, res) {
    try {
      const { id } = req.params;
      const updates = req.body;
      
      const product = await Product.findByIdAndUpdate(
        id,
        { ...updates, updatedAt: new Date() },
        { new: true, runValidators: true }
      );

      if (!product) {
        return res.status(404).json({
          success: false,
          message: 'Product not found',
        });
      }

      // Clear cache
      await productService.clearCache();

      res.json({
        success: true,
        data: product,
        message: 'Product updated successfully',
      });
    } catch (error) {
      console.error('Error updating product:', error);
      res.status(500).json({
        success: false,
        message: 'Error updating product',
        error: error.message,
      });
    }
  }

  // Delete product (Admin)
  async deleteProduct(req, res) {
    try {
      const { id } = req.params;
      const product = await Product.findByIdAndDelete(id);

      if (!product) {
        return res.status(404).json({
          success: false,
          message: 'Product not found',
        });
      }

      // Clear cache
      await productService.clearCache();

      res.json({
        success: true,
        message: 'Product deleted successfully',
      });
    } catch (error) {
      console.error('Error deleting product:', error);
      res.status(500).json({
        success: false,
        message: 'Error deleting product',
        error: error.message,
      });
    }
  }

  // Bulk import products (Admin)
  async bulkImport(req, res) {
    try {
      const products = req.body.products;
      
      if (!products || !Array.isArray(products)) {
        return res.status(400).json({
          success: false,
          message: 'Invalid data format. Expected array of products.',
        });
      }

      const result = await Product.insertMany(products, { ordered: false });
      
      // Clear cache
      await productService.clearCache();

      res.status(201).json({
        success: true,
        data: {
          inserted: result.length,
          total: products.length,
        },
        message: `${result.length} products imported successfully`,
      });
    } catch (error) {
      console.error('Error importing products:', error);
      res.status(500).json({
        success: false,
        message: 'Error importing products',
        error: error.message,
      });
    }
  }
}

module.exports = new ProductController();
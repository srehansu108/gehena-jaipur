// backend/controllers/productController.js
const Product = require('../models/Product');
const productService = require('../services/productService');

// ============================================================
// 🧹 Helper: sanitize input for create/update
// ============================================================
const sanitizeProduct = (raw = {}) => {
  const p = { ...raw };

  // Numbers
  ['price', 'originalPrice', 'rating', 'reviews', 'stockCount', 'discount'].forEach((k) => {
    if (p[k] !== undefined && p[k] !== '' && p[k] !== null) {
      const n = Number(p[k]);
      if (!Number.isNaN(n)) p[k] = n;
    }
  });

  // Booleans
  ['inStock'].forEach((k) => {
    if (typeof p[k] === 'string') p[k] = p[k].toLowerCase() === 'true';
  });

  // Arrays: accept "a|b|c" or array
  ['images', 'tags', 'features', 'careInstructions'].forEach((k) => {
    if (typeof p[k] === 'string') {
      p[k] = p[k].split('|').map((s) => s.trim()).filter(Boolean);
    }
  });

  return p;
};

// ============================================================
// PUBLIC
// ============================================================

// GET /api/products
const getProducts = async (req, res) => {
  try {
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
      filters: { applied: filters },
    });
  } catch (error) {
    console.error('❌ Error fetching products:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching products',
      error: error.message,
    });
  }
};

// GET /api/products/bestsellers
const getBestsellers = async (req, res) => {
  try {
    const limit = Math.min(Number(req.query.limit) || 8, 50);

    const products = await Product.find({
      isBestseller: true,
      inStock: true,
    })
      .sort({ bestsellerOrder: 1, createdAt: -1 })
      .limit(limit)
      .select('-longDescription -features -specifications -careInstructions -shippingInfo')
      .lean();

    res.json({ success: true, data: products });
  } catch (err) {
    console.error('❌ getBestsellers error:', err);
    res.status(500).json({ success: false, message: err.message });
  }
};

// GET /api/products/new-arrivals
const getNewArrivals = async (req, res) => {
  try {
    const limit = Math.min(Number(req.query.limit) || 8, 50);

    const products = await Product.find({
      isNewArrival: true,
      inStock: true,
    })
      .sort({ newArrivalOrder: 1, createdAt: -1 })
      .limit(limit)
      .select('-longDescription -features -specifications -careInstructions -shippingInfo')
      .lean();

    res.json({ success: true, data: products });
  } catch (err) {
    console.error('❌ getNewArrivals error:', err);
    res.status(500).json({ success: false, message: err.message });
  }
};

// GET /api/products/sale
const getSaleProducts = async (req, res) => {
  try {
    const { limit = 8 } = req.query;
    const products = await productService.getSaleProducts(Number(limit));
    res.json({ success: true, data: products || [] });
  } catch (error) {
    console.error('❌ Error fetching sale products:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching sale products',
      error: error.message,
    });
  }
};

// GET /api/products/metals
const getMetals = async (req, res) => {
  try {
    const metals = await productService.getMetals();
    res.json({ success: true, data: metals || [] });
  } catch (error) {
    console.error('❌ Error fetching metals:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching metals',
      error: error.message,
    });
  }
};

// GET /api/products/category-counts
const getCategoryCounts = async (req, res) => {
  try {
    const counts = await productService.getCategoryCounts();
    res.json({ success: true, data: counts || {} });
  } catch (error) {
    console.error('❌ Error fetching category counts:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching category counts',
      error: error.message,
    });
  }
};

// GET /api/products/sku/:sku
const getProductBySku = async (req, res) => {
  try {
    const { sku } = req.params;
    const product = await productService.getProductBySku(sku);

    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }

    res.json({ success: true, data: product });
  } catch (error) {
    console.error('❌ Error fetching product by SKU:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching product',
      error: error.message,
    });
  }
};

// GET /api/products/:id  (MUST be last among GET routes)
const getProductById = async (req, res) => {
  try {
    const { id } = req.params;
    const product = await productService.getProductById(id);

    if (!product) {
      return res.status(404).json({
        success: false,
        message: `Product not found with ID: ${id}`,
      });
    }

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
};

// ============================================================
// ADMIN
// ============================================================

// GET /api/products/admin/products
const getAdminProducts = async (req, res) => {
  try {
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

    // Strip empty filters
    Object.keys(filters).forEach((key) => {
      if (
        filters[key] === undefined ||
        filters[key] === null ||
        filters[key] === '' ||
        (Array.isArray(filters[key]) && filters[key].length === 0)
      ) {
        delete filters[key];
      }
    });

    const options = {
      page: Number(page),
      limit: Math.min(Number(limit), 100),
      sort,
      order,
    };

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
      filters: { applied: filters },
    });
  } catch (error) {
    console.error('❌ Error in admin getProducts:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching products for admin',
      error: error.message,
    });
  }
};

// POST /api/products/admin/products
const createProduct = async (req, res) => {
  try {
    const productData = sanitizeProduct(req.body);
    const product = await Product.create(productData);

    await productService.clearCache();

    res.status(201).json({
      success: true,
      data: product,
      message: 'Product created successfully',
    });
  } catch (error) {
    console.error('❌ Error creating product:', error);

    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: 'Duplicate product. A product with this SKU or ID already exists.',
        error: error.message,
      });
    }

    if (error.name === 'ValidationError') {
      return res.status(400).json({
        success: false,
        message: 'Validation error',
        errors: Object.values(error.errors).map((e) => e.message),
      });
    }

    res.status(500).json({
      success: false,
      message: 'Error creating product',
      error: error.message,
    });
  }
};

// PUT /api/products/admin/products/:id
const updateProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const updates = sanitizeProduct(req.body);

    const product = await Product.findByIdAndUpdate(
      id,
      { ...updates, updatedAt: new Date() },
      { new: true, runValidators: true }
    );

    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }

    await productService.clearCache();

    res.json({
      success: true,
      data: product,
      message: 'Product updated successfully',
    });
  } catch (error) {
    console.error('❌ Error updating product:', error);

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
};

// DELETE /api/products/admin/products/:id
const deleteProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const product = await Product.findByIdAndDelete(id);

    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }

    await productService.clearCache();

    res.json({ success: true, message: 'Product deleted successfully' });
  } catch (error) {
    console.error('❌ Error deleting product:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting product',
      error: error.message,
    });
  }
};

// ============================================================
// ADMIN — BESTSELLER / NEW ARRIVAL TOGGLES
// ============================================================

// PATCH /api/products/admin/products/:id/toggle-bestseller
const toggleBestseller = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ success: false, message: 'Not found' });

    product.isBestseller = !product.isBestseller;

    if (product.isBestseller && (!product.bestsellerOrder || product.bestsellerOrder === 0)) {
      const count = await Product.countDocuments({ isBestseller: true });
      product.bestsellerOrder = count;
    }

    await product.save();
    res.json({ success: true, data: product });
  } catch (err) {
    console.error('❌ toggleBestseller error:', err);
    res.status(400).json({ success: false, message: err.message });
  }
};

// PATCH /api/products/admin/products/:id/toggle-new-arrival
const toggleNewArrival = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ success: false, message: 'Not found' });

    product.isNewArrival = !product.isNewArrival;

    if (product.isNewArrival && (!product.newArrivalOrder || product.newArrivalOrder === 0)) {
      const count = await Product.countDocuments({ isNewArrival: true });
      product.newArrivalOrder = count;
    }

    await product.save();
    res.json({ success: true, data: product });
  } catch (err) {
    console.error('❌ toggleNewArrival error:', err);
    res.status(400).json({ success: false, message: err.message });
  }
};

// PATCH /api/products/admin/products/reorder-bestsellers
const reorderBestsellers = async (req, res) => {
  try {
    const list = Array.isArray(req.body.order) ? req.body.order : [];
    if (!list.length) {
      return res.status(400).json({ success: false, message: 'order array required' });
    }

    const bulk = list.map(({ id, order }) => ({
      updateOne: { filter: { _id: id }, update: { bestsellerOrder: Number(order) || 0 } },
    }));

    await Product.bulkWrite(bulk);
    res.json({ success: true });
  } catch (err) {
    console.error('❌ reorderBestsellers error:', err);
    res.status(400).json({ success: false, message: err.message });
  }
};

// ============================================================
// BULK IMPORT / EXPORT
// ============================================================

// POST /api/products/admin/products/bulk
const bulkImport = async (req, res) => {
  try {
    const products = req.body.products;

    if (!products || !Array.isArray(products) || products.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Invalid data format. Expected array of products.',
      });
    }

    const validatedProducts = products.map((product, index) => {
      if (!product.name) throw new Error(`Row ${index + 1}: Product name is required`);
      if (!product.category) throw new Error(`Row ${index + 1}: Category is required`);
      if (!product.price) throw new Error(`Row ${index + 1}: Price is required`);

      return {
        name: product.name.trim(),
        category: product.category.trim().toLowerCase(),
        subcategory: product.subcategory?.trim() || '',
        price: parseFloat(product.price),
        originalPrice: product.originalPrice ? parseFloat(product.originalPrice) : undefined,
        metal: product.metal?.trim() || '',
        inStock:
          product.inStock === 'true' || product.inStock === true || product.inStock === '1',
        stockCount: parseInt(product.stockCount) || 0,
        sku: product.sku?.trim() || `SKU-${Date.now()}-${index}`,
        description: product.description?.trim() || '',
        badgeType: product.badgeType?.trim() || '',
        discount: parseFloat(product.discount) || 0,
        images: product.images
          ? String(product.images).split('|').map((i) => i.trim()).filter(Boolean)
          : [],
        tags: product.tags
          ? String(product.tags).split('|').map((t) => t.trim()).filter(Boolean)
          : [],
        rating: parseFloat(product.rating) || 0,
        reviews: parseInt(product.reviews) || 0,
        weight: product.weight?.trim() || '',
      };
    });

    const result = await Product.insertMany(validatedProducts, { ordered: false });
    await productService.clearCache();

    res.status(201).json({
      success: true,
      data: {
        inserted: result.length,
        total: products.length,
        failed: products.length - result.length,
        products: result,
      },
      message: `${result.length} products imported successfully`,
    });
  } catch (error) {
    console.error('❌ Error importing products:', error);

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
};

// GET /api/products/admin/export/csv
const exportCSV = async (req, res) => {
  try {
    const products = await Product.find({}).select('-__v -updatedAt').lean();

    if (!products || products.length === 0) {
      return res.status(404).json({ success: false, message: 'No products found to export' });
    }

    const headers = [
      'id', 'name', 'category', 'subcategory', 'navbarCategory', 'navbarSubcategory',
      'tags', 'price', 'originalPrice', 'rating', 'reviews', 'metal', 'weight',
      'diamondWeight', 'diamondClarity', 'diamondColor', 'inStock', 'stockCount',
      'badge', 'badgeType', 'description', 'longDescription', 'features',
      'specifications', 'careInstructions', 'shippingInfo', 'warranty', 'brand',
      'sku', 'discount', 'images',
    ];

    let csvContent = headers.join(',') + '\n';

    products.forEach((product) => {
      const row = headers.map((header) => {
        let value = product[header];
        if (Array.isArray(value)) value = value.join('|');
        else if (typeof value === 'object' && value !== null) {
          value = JSON.stringify(value).replace(/,/g, ';');
        }
        if (typeof value === 'string' && value.includes(',')) value = `"${value}"`;
        return value || '';
      });
      csvContent += row.join(',') + '\n';
    });

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename=products_${Date.now()}.csv`);
    res.send(csvContent);
  } catch (error) {
    console.error('❌ Error exporting CSV:', error);
    res.status(500).json({
      success: false,
      message: 'Error exporting products as CSV',
      error: error.message,
    });
  }
};

// GET /api/products/admin/export/json
const exportJSON = async (req, res) => {
  try {
    const products = await Product.find({}).select('-__v').lean();

    if (!products || products.length === 0) {
      return res.status(404).json({ success: false, message: 'No products found to export' });
    }

    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Content-Disposition', `attachment; filename=products_${Date.now()}.json`);

    res.json({
      success: true,
      total: products.length,
      exportedAt: new Date().toISOString(),
      data: products,
    });
  } catch (error) {
    console.error('❌ Error exporting JSON:', error);
    res.status(500).json({
      success: false,
      message: 'Error exporting products as JSON',
      error: error.message,
    });
  }
};

// GET /api/products/admin/export/template
const getCSVTemplate = async (req, res) => {
  try {
    const headers = [
      'name', 'category', 'subcategory', 'price', 'originalPrice',
      'metal', 'inStock', 'stockCount', 'sku', 'description',
      'badgeType', 'discount', 'images', 'tags',
    ];

    const sampleRow = [
      'Gold Ring', 'rings', 'Diamond Ring', '299.99', '399.99',
      'Gold', 'true', '10', 'SKU-001', 'Beautiful gold ring',
      'bestseller', '25', 'https://example.com/image.jpg', 'gold|diamond',
    ];

    let csvContent = headers.join(',') + '\n';
    csvContent += sampleRow.join(',') + '\n';

    for (let i = 0; i < 5; i++) {
      csvContent += headers.map(() => '').join(',') + '\n';
    }

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename=product_import_template.csv');
    res.send(csvContent);
  } catch (error) {
    console.error('❌ Error generating CSV template:', error);
    res.status(500).json({
      success: false,
      message: 'Error generating CSV template',
      error: error.message,
    });
  }
};

// PATCH /api/products/admin/products/reorder-new-arrivals
const reorderNewArrivals = async (req, res) => {
  try {
    const list = Array.isArray(req.body.order) ? req.body.order : [];
    if (!list.length) {
      return res.status(400).json({ success: false, message: 'order array required' });
    }

    const bulk = list.map(({ id, order }) => ({
      updateOne: { filter: { _id: id }, update: { newArrivalOrder: Number(order) || 0 } },
    }));

    await Product.bulkWrite(bulk);
    res.json({ success: true });
  } catch (err) {
    console.error('❌ reorderNewArrivals error:', err);
    res.status(400).json({ success: false, message: err.message });
  }
};

// ============================================================
// 📦 EXPORTS
// ============================================================
module.exports = {
  // Public
  getProducts,
  getBestsellers,
  getNewArrivals,
  getSaleProducts,
  getMetals,
  getCategoryCounts,
  getProductBySku,
  getProductById,

  // Admin CRUD
  getAdminProducts,
  createProduct,
  updateProduct,
  deleteProduct,

  // Admin toggles / reorder
  toggleBestseller,
  toggleNewArrival,
  reorderBestsellers,

  // Bulk / export
  bulkImport,
  exportCSV,
  exportJSON,
  getCSVTemplate,
  reorderNewArrivals,
};
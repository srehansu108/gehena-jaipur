// backend/routes/productRoutes.js
const express = require('express');
const router = express.Router();
const productController = require('../controllers/productController');
const { authenticate, authorize } = require('../middleware/auth');

const adminOnly = authorize('admin');

// ============================================================
// ⚠️ STATIC PUBLIC ROUTES FIRST — BEFORE /:id
// ============================================================

// Collections (must come before /:id)
router.get('/collections/bestsellers', productController.getBestsellers);
router.get('/collections/new-arrivals', productController.getNewArrivals);
router.get('/collections/sale', productController.getSaleProducts);

// Also support the flat paths (in case you call /products/bestsellers)
router.get('/bestsellers', productController.getBestsellers);
router.get('/new-arrivals', productController.getNewArrivals);
router.get('/sale', productController.getSaleProducts);

// Meta / lookups (must come before /:id)
router.get('/meta/metals', productController.getMetals);
router.get('/meta/categories', productController.getCategoryCounts);
router.get('/metals', productController.getMetals);
router.get('/category-counts', productController.getCategoryCounts);

// SKU lookup (must come before /:id)
router.get('/sku/:sku', productController.getProductBySku);

// ============================================================
// ⚠️ STATIC ADMIN ROUTES — BEFORE dynamic admin :id
// ============================================================

// Admin product listing
router.get('/admin/products', authenticate, adminOnly, productController.getAdminProducts);

// Create product
router.post('/admin/products', authenticate, adminOnly, productController.createProduct);

// Bulk import
router.post('/admin/products/bulk', authenticate, adminOnly, productController.bulkImport);

// 🔥 Reorder bestsellers — MUST come before /admin/products/:id/... to avoid conflicts
router.patch(
  '/admin/products/reorder-bestsellers',
  authenticate,
  adminOnly,
  productController.reorderBestsellers
);

// Export routes
router.get('/admin/export/csv', authenticate, adminOnly, productController.exportCSV);
router.get('/admin/export/json', authenticate, adminOnly, productController.exportJSON);
router.get('/admin/export/template', authenticate, adminOnly, productController.getCSVTemplate);

// ============================================================
// ADMIN DYNAMIC ROUTES (with :id)
// ============================================================

// Toggle bestseller
router.patch(
  '/admin/products/:id/toggle-bestseller',
  authenticate,
  adminOnly,
  productController.toggleBestseller
);

// Toggle new arrival
router.patch(
  '/admin/products/:id/toggle-new-arrival',
  authenticate,
  adminOnly,
  productController.toggleNewArrival
);

// Update product
router.put('/admin/products/:id', authenticate, adminOnly, productController.updateProduct);

// Delete product
router.delete('/admin/products/:id', authenticate, adminOnly, productController.deleteProduct);

// ============================================================
// ⚠️ DYNAMIC PUBLIC ROUTES LAST — MUST be after all statics
// ============================================================
router.get('/', productController.getProducts);
router.get('/:id', productController.getProductById);
router.patch(
  '/admin/products/reorder-new-arrivals',
  authenticate,
  adminOnly,
  productController.reorderNewArrivals
);

module.exports = router;
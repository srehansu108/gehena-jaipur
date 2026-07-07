// backend/routes/productRoutes.js
const express = require('express');
const router = express.Router();
const productController = require('../controllers/productController');
const { authenticate, authorize } = require('../middleware/auth');

// ============ PUBLIC ROUTES ============
router.get('/', productController.getProducts);
router.get('/:id', productController.getProductById);
router.get('/sku/:sku', productController.getProductBySku);
router.get('/meta/metals', productController.getMetals);
router.get('/meta/categories', productController.getCategoryCounts);

// Collections
router.get('/collections/bestsellers', productController.getBestsellers);
router.get('/collections/new-arrivals', productController.getNewArrivals);
router.get('/collections/sale', productController.getSaleProducts);

// ============ ADMIN ROUTES ============
// 🔥 CRITICAL: Add this route for admin product listing
router.get('/admin/products', authenticate, authorize('admin'), productController.getAdminProducts);

// Product CRUD
router.post('/admin/products', authenticate, authorize('admin'), productController.createProduct);
router.put('/admin/products/:id', authenticate, authorize('admin'), productController.updateProduct);
router.delete('/admin/products/:id', authenticate, authorize('admin'), productController.deleteProduct);
router.post('/admin/products/bulk', authenticate, authorize('admin'), productController.bulkImport);

// Export routes
router.get('/admin/export/csv', authenticate, authorize('admin'), productController.exportCSV);
router.get('/admin/export/json', authenticate, authorize('admin'), productController.exportJSON);
router.get('/admin/export/template', authenticate, authorize('admin'), productController.getCSVTemplate);

module.exports = router;
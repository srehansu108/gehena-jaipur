// backend/routes/productRoutes.js
const express = require('express');
const router = express.Router();
const productController = require('../controllers/productController');

// ✅ FIXED: Remove '/products' from router - use '/' instead
// Because the router is already mounted at '/api/products'

// Public routes
router.get('/', productController.getProducts);  // Changed from '/products' to '/'
router.get('/:id', productController.getProductById);  // Changed from '/products/:id' to '/:id'
router.get('/sku/:sku', productController.getProductBySku);
router.get('/meta/metals', productController.getMetals);
router.get('/meta/categories', productController.getCategoryCounts);

// Featured collections
router.get('/collections/bestsellers', productController.getBestsellers);
router.get('/collections/new-arrivals', productController.getNewArrivals);
router.get('/collections/sale', productController.getSaleProducts);

// Admin routes
router.post('/admin/products', productController.createProduct);
router.put('/admin/products/:id', productController.updateProduct);
router.delete('/admin/products/:id', productController.deleteProduct);
router.post('/admin/products/bulk', productController.bulkImport);

module.exports = router;
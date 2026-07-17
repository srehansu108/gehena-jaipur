// backend/routes/orderRoutes.js

const express = require('express');
const router = express.Router();
const orderController = require('../controllers/orderController');
const paymentRoutes = require('./paymentRoutes');
const { authenticate, authorize } = require('../middleware/auth');

// ============ PAYMENT ROUTES ============
router.use('/payments', paymentRoutes);

// ============ USER ROUTES ============
router.post('/', authenticate, orderController.createOrder);
router.get('/my-orders', authenticate, orderController.getMyOrders);
router.get('/:id', authenticate, orderController.getOrderById);
router.get('/:id/payment', authenticate, orderController.getOrderWithPaymentDetails);
router.put('/:id/cancel', authenticate, orderController.cancelOrder);

// ============ ADMIN ROUTES ============
router.get('/admin/orders', authenticate, authorize('admin'), orderController.getAdminOrders);
router.get('/admin/stats', authenticate, authorize('admin'), orderController.getOrderStatsRoute);
router.get('/admin/analytics/revenue', authenticate, authorize('admin'), orderController.getRevenueAnalytics);
router.put('/admin/:id/status', authenticate, authorize('admin'), orderController.updateOrderStatus);
router.put('/admin/:id/tracking', authenticate, authorize('admin'), orderController.addTracking);
router.delete('/admin/:id', authenticate, authorize('admin'), orderController.deleteOrder);

module.exports = router;
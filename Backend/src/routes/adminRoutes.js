// backend/routes/adminRoutes.js
const express = require('express');
const router = express.Router();
const { authenticate, authorize } = require('../middleware/auth');
const adminController = require('../controllers/adminController');
const analyticsController = require('../controllers/analyticsController');

console.log('📦 Admin Controller Methods:', Object.keys(adminController));
console.log('📦 Analytics Controller Methods:', Object.keys(analyticsController));

// All admin routes require authentication and admin role
router.use(authenticate);
router.use(authorize('admin'));

// ✅ Dashboard stats
router.get('/stats', adminController.getStats);

// ✅ Analytics routes
router.get('/analytics', analyticsController.getAnalytics);

// User management
router.get('/users', adminController.getUsers);
router.get('/users/:id', adminController.getUserById);
router.put('/users/:id/role', adminController.updateUserRole);
router.delete('/users/:id', adminController.deleteUser);

module.exports = router;
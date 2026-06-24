// backend/routes/accountRoutes.js
const express = require('express');
const router = express.Router();
const { authenticate } = require('../middleware/auth');
const accountController = require('../controllers/accountController');

router.get('/dashboard', authenticate, accountController.getDashboard);
router.get('/orders', authenticate, accountController.getOrders);
router.get('/reviews/stats', authenticate, accountController.getReviewStats);
router.get('/wishlist', authenticate, accountController.getWishlist);
router.get('/cart', authenticate, accountController.getCart);
router.put('/profile', authenticate, accountController.updateProfile);
router.put('/change-password', authenticate, accountController.changePassword);

module.exports = router;
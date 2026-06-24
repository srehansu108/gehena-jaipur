// backend/routes/wishlistRoutes.js
const express = require('express');
const router = express.Router();
const { authenticate } = require('../middleware/auth');
const {
  getWishlist,
  toggleWishlist,
  removeFromWishlist,
  clearWishlist,
  checkWishlist,
} = require('../controllers/wishlistController');

// All wishlist routes require authentication
router.use(authenticate);

// Get wishlist
router.get('/', getWishlist);

// Check if product is in wishlist
router.get('/check/:productId', checkWishlist);

// Toggle product in wishlist (add/remove)
router.post('/:productId', toggleWishlist);

// Remove product from wishlist
router.delete('/:productId', removeFromWishlist);

// Clear wishlist
router.delete('/', clearWishlist);

module.exports = router;
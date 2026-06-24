// backend/routes/cartRoutes.js
const express = require('express');
const router = express.Router();
const { authenticate } = require('../middleware/auth');
const {
  getCart,
  addToCart,
  updateCartItem,
  removeFromCart,
  clearCart,
  applyCoupon,
  removeCoupon,
  getCartCount,
} = require('../controllers/cartController');

// All cart routes require authentication
router.use(authenticate);

router.get('/', getCart);
router.get('/count', getCartCount);
router.post('/', addToCart);
router.put('/:productId', updateCartItem);
router.delete('/:productId', removeFromCart);
router.delete('/', clearCart);
router.post('/coupon', applyCoupon);
router.delete('/coupon', removeCoupon);

module.exports = router;
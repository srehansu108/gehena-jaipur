// backend/routes/paymentRoutes.js

const express = require('express');
const router = express.Router();
const paymentController = require('../controllers/paymentController');
const { authenticate } = require('../middleware/auth');

// PhonePe Routes
router.post('/phonepe/init', authenticate, paymentController.initPhonePePayment);
router.post('/phonepe/callback', paymentController.handlePhonePeCallback);

// Razorpay Routes
router.post('/razorpay/init', authenticate, paymentController.initRazorpayPayment);
router.post('/razorpay/verify', authenticate, paymentController.verifyRazorpayPayment);

// COD Route
router.post('/cod/confirm', authenticate, paymentController.handleCODPayment);

// Payment Status
router.get('/status/:orderId', authenticate, paymentController.getPaymentStatus);

module.exports = router;
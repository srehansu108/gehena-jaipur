// backend/routes/paymentRoutes.js

const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const paymentController = require('../controllers/paymentController');
const { authenticate } = require('../middleware/auth');

// ============================================
// CREATE UPLOADS DIRECTORY
// ============================================
const uploadDir = path.join(__dirname, '../uploads/screenshots');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
  console.log('📁 Created uploads directory:', uploadDir);
}

// ============================================
// MULTER CONFIGURATION
// ============================================
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname);
    cb(null, 'payment-' + uniqueSuffix + ext);
  }
});

const fileFilter = (req, file, cb) => {
  const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Invalid file type. Only JPEG, PNG, and WEBP are allowed.'), false);
  }
};

const upload = multer({
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: fileFilter
});

// ============================================
// PHONEPE ROUTES
// ============================================
router.post('/phonepe/init', authenticate, paymentController.initPhonePePayment);
router.post('/phonepe/callback', paymentController.handlePhonePeCallback);

// ============================================
// RAZORPAY ROUTES
// ============================================
router.post('/razorpay/init', authenticate, paymentController.initRazorpayPayment);
router.post('/razorpay/verify', authenticate, paymentController.verifyRazorpayPayment);

// ============================================
// QR CODE ROUTES
// ============================================
router.post('/qr/init', authenticate, paymentController.initQRPayment);
router.post('/qr/verify', authenticate, upload.single('screenshot'), paymentController.verifyQRPayment);

// ============================================
// QR CODE ADMIN ROUTES ✅ - NEW
// ============================================
router.put('/admin/:orderId/qr-verify', authenticate, paymentController.adminVerifyQRPayment);
router.put('/admin/:orderId/qr-reject', authenticate, paymentController.adminRejectQRPayment);
router.put('/admin/:orderId/qr-reopen', authenticate, paymentController.adminReopenQRPayment);
// ============================================
// COD ROUTE
// ============================================
router.post('/cod/confirm', authenticate, paymentController.handleCODPayment);

// ============================================
// PAYMENT STATUS ROUTES
// ============================================
router.get('/status/:orderId', authenticate, paymentController.getPaymentStatus);
router.get('/order/:id', authenticate, paymentController.getOrderWithPaymentDetails);

// ============================================
// SERVE UPLOADED FILES
// ============================================
router.get('/screenshot/:filename', (req, res) => {
  const { filename } = req.params;
  const filePath = path.join(uploadDir, filename);
  
  const ext = path.extname(filename).toLowerCase();
  if (!['.jpg', '.jpeg', '.png', '.webp'].includes(ext)) {
    return res.status(403).json({ success: false, message: 'Invalid file type' });
  }
  
  if (fs.existsSync(filePath)) {
    res.sendFile(filePath);
  } else {
    res.status(404).json({ success: false, message: 'File not found' });
  }
});

module.exports = router;
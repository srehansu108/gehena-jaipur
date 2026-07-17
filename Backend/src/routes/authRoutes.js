// backend/routes/authRoutes.js
const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const authController = require('../controllers/authController');
const { authenticate } = require('../middleware/auth');

// ========== VALIDATION RULES ==========

// Signup validation (Personal + Business)
const signupValidation = [
  // Personal fields
  body('username')
    .isLength({ min: 3, max: 30 })
    .withMessage('Username must be 3-30 characters')
    .matches(/^[a-zA-Z0-9_]+$/)
    .withMessage('Username can only contain letters, numbers, and underscore'),
  body('firstName')
    .notEmpty()
    .withMessage('First name is required')
    .isLength({ max: 50 })
    .withMessage('First name cannot exceed 50 characters'),
  body('lastName')
    .notEmpty()
    .withMessage('Last name is required')
    .isLength({ max: 50 })
    .withMessage('Last name cannot exceed 50 characters'),
  body('mobileNumber')
    .isMobilePhone('en-IN')
    .withMessage('Please enter a valid 10-digit mobile number'),
  body('email')
    .isEmail()
    .withMessage('Please enter a valid email address')
    .normalizeEmail(),
  body('password')
    .isLength({ min: 8 })
    .withMessage('Password must be at least 8 characters')
    .matches(/(?=.*[a-z])/)
    .withMessage('Password must contain at least one lowercase letter')
    .matches(/(?=.*[A-Z])/)
    .withMessage('Password must contain at least one uppercase letter')
    .matches(/(?=.*\d)/)
    .withMessage('Password must contain at least one number')
    .matches(/(?=.*[@$!%*?&])/)
    .withMessage('Password must contain at least one special character'),
  
  // Account type
  body('accountType')
    .optional()
    .isIn(['personal', 'business'])
    .withMessage('Account type must be either "personal" or "business"'),
  
  // Business details (conditional)
  body('businessDetails')
    .optional()
    .isObject()
    .withMessage('Business details must be an object'),
  body('businessDetails.businessName')
    .if(body('accountType').equals('business'))
    .notEmpty()
    .withMessage('Business name is required for business accounts')
    .isLength({ max: 100 })
    .withMessage('Business name cannot exceed 100 characters'),
  body('businessDetails.businessType')
    .if(body('accountType').equals('business'))
    .notEmpty()
    .withMessage('Business type is required for business accounts'),
  body('businessDetails.gstNumber')
    .optional()
    .matches(/^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/)
    .withMessage('Invalid GST number format (Expected: 22AAAAA0000A1Z5)')
    .isLength({ min: 15, max: 15 })
    .withMessage('GST number must be exactly 15 characters'),
  body('businessDetails.panNumber')
    .optional()
    .matches(/^[A-Z]{5}[0-9]{4}[A-Z]{1}$/)
    .withMessage('Invalid PAN number format (Expected: ABCDE1234F)')
    .isLength({ min: 10, max: 10 })
    .withMessage('PAN number must be exactly 10 characters'),
  body('businessDetails.businessAddress')
    .if(body('accountType').equals('business'))
    .notEmpty()
    .withMessage('Business address is required for business accounts'),
  body('businessDetails.businessPhone')
    .if(body('accountType').equals('business'))
    .notEmpty()
    .withMessage('Business phone is required for business accounts')
    .isMobilePhone('en-IN')
    .withMessage('Please enter a valid 10-digit business phone number'),
  body('businessDetails.businessEmail')
    .if(body('accountType').equals('business'))
    .notEmpty()
    .withMessage('Business email is required for business accounts')
    .isEmail()
    .withMessage('Please enter a valid business email address')
    .normalizeEmail(),
  body('businessDetails.website')
    .optional()
    .isURL()
    .withMessage('Please enter a valid website URL'),
  body('businessDetails.yearsInBusiness')
    .if(body('accountType').equals('business'))
    .notEmpty()
    .withMessage('Years in business is required for business accounts')
    .isInt({ min: 0 })
    .withMessage('Years in business must be a positive number'),
];

// Login validation
const loginValidation = [
  body('identifier')
    .notEmpty()
    .withMessage('Username or email is required'),
  body('password')
    .notEmpty()
    .withMessage('Password is required'),
];

// GST verification validation
const gstValidation = [
  body('gstNumber')
    .notEmpty()
    .withMessage('GST number is required')
    .matches(/^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/)
    .withMessage('Invalid GST number format (Expected: 22AAAAA0000A1Z5)'),
];

// PAN verification validation
const panValidation = [
  body('panNumber')
    .notEmpty()
    .withMessage('PAN number is required')
    .matches(/^[A-Z]{5}[0-9]{4}[A-Z]{1}$/)
    .withMessage('Invalid PAN number format (Expected: ABCDE1234F)'),
];

// ========== ROUTES ==========

// Auth routes
router.post('/signup', signupValidation, authController.signup);
router.post('/login', loginValidation, authController.login);
router.get('/me', authenticate, authController.getMe);
router.post('/logout', authenticate, authController.logout);
router.post('/forgot-password', authController.forgotPassword);
router.post('/reset-password', authController.resetPassword);

// Business routes
router.post('/verify-gst', authenticate, gstValidation, authController.verifyGST);
router.post('/verify-pan', authenticate, panValidation, authController.verifyPAN);
router.get('/business-profile', authenticate, authController.getBusinessProfile);
router.put('/business-profile', authenticate, authController.updateBusinessProfile);

module.exports = router;
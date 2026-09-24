const express = require('express');
const multer = require('multer');
const { authenticate, authorize } = require('../middleware/auth');
const aboutPageController = require('../controllers/aboutPageController');
const contactPageController = require('../controllers/contactPageController');

const router = express.Router();
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 },
});

const adminOnly = authorize('admin');

// ─── About Page ───
router.get('/about', aboutPageController.getAboutPage);
router.get('/about/admin', authenticate, adminOnly, aboutPageController.getAboutPageAdmin);
router.put('/about', authenticate, adminOnly, aboutPageController.updateAboutPage);
router.post(
  '/about/upload',
  authenticate,
  adminOnly,
  upload.single('image'),
  aboutPageController.uploadImage
);
router.post('/about/reset', authenticate, adminOnly, aboutPageController.resetAboutPage);

// ─── Contact Page ───
router.get('/contact', contactPageController.getContactPage);
router.get('/contact/admin', authenticate, adminOnly, contactPageController.getContactPageAdmin);
router.put('/contact', authenticate, adminOnly, contactPageController.updateContactPage);
router.post('/contact/reset', authenticate, adminOnly, contactPageController.resetContactPage);

module.exports = router;
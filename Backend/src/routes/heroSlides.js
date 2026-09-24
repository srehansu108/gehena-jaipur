// src/routes/heroSlides.js
const express = require('express');
const multer = require('multer');
const { authenticate, authorize } = require('../middleware/auth');
const heroController = require('../controllers/heroController');

const router = express.Router();
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
});

const adminOnly = authorize('admin');   // ✅ now a real middleware function

// Public
router.get('/', heroController.getActiveSlides);

// Admin
router.get('/admin', authenticate, adminOnly, heroController.getAllSlides);
router.get('/admin/:id', authenticate, adminOnly, heroController.getSlideById);
router.post('/', authenticate, adminOnly, upload.single('image'), heroController.createSlide);
router.put('/:id', authenticate, adminOnly, upload.single('image'), heroController.updateSlide);
router.patch('/:id/toggle', authenticate, adminOnly, heroController.toggleActive);
router.patch('/reorder', authenticate, adminOnly, heroController.reorderSlides);
router.delete('/:id', authenticate, adminOnly, heroController.deleteSlide);

// Analytics (public)
router.post('/:id/click', heroController.trackClick);

module.exports = router;
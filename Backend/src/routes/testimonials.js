const express = require('express');
const multer = require('multer');
const { authenticate, authorize } = require('../middleware/auth');
const testimonialController = require('../controllers/testimonialController');

const router = express.Router();
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 },
});

const adminOnly = authorize('admin');

// Public
router.get('/', testimonialController.getActiveTestimonials);

// Admin
router.get('/admin', authenticate, adminOnly, testimonialController.getAllTestimonials);
router.get('/admin/:id', authenticate, adminOnly, testimonialController.getTestimonialById);
router.post('/', authenticate, adminOnly, upload.single('image'), testimonialController.createTestimonial);
router.put('/:id', authenticate, adminOnly, upload.single('image'), testimonialController.updateTestimonial);
router.patch('/:id/toggle', authenticate, adminOnly, testimonialController.toggleActive);
router.patch('/reorder', authenticate, adminOnly, testimonialController.reorderTestimonials);
router.delete('/:id', authenticate, adminOnly, testimonialController.deleteTestimonial);

module.exports = router;
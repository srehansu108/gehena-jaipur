const express = require('express');
const multer = require('multer');
const { authenticate, authorize } = require('../middleware/auth');
const categoryController = require('../controllers/categoryController');

const router = express.Router();
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 },
});

const adminOnly = authorize('admin');

// Public
router.get('/', categoryController.getActiveCategories);

// Admin
router.get('/admin', authenticate, adminOnly, categoryController.getAllCategories);
router.get('/admin/:id', authenticate, adminOnly, categoryController.getCategoryById);
router.post('/', authenticate, adminOnly, upload.single('image'), categoryController.createCategory);
router.put('/:id', authenticate, adminOnly, upload.single('image'), categoryController.updateCategory);
router.patch('/:id/toggle', authenticate, adminOnly, categoryController.toggleActive);
router.patch('/reorder', authenticate, adminOnly, categoryController.reorderCategories);
router.delete('/:id', authenticate, adminOnly, categoryController.deleteCategory);

module.exports = router;
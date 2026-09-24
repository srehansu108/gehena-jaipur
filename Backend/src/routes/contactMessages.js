const express = require('express');
const { authenticate, authorize } = require('../middleware/auth');
const controller = require('../controllers/contactMessageController');

const router = express.Router();
const adminOnly = authorize('admin');

// Public — submit form
router.post('/', controller.submitMessage);

// Admin
router.get('/admin', authenticate, adminOnly, controller.getMessages);
router.get('/admin/unread-count', authenticate, adminOnly, controller.getUnreadCount);
router.get('/admin/:id', authenticate, adminOnly, controller.getMessageById);
router.patch('/admin/:id', authenticate, adminOnly, controller.updateMessageStatus);
router.delete('/admin/:id', authenticate, adminOnly, controller.deleteMessage);

module.exports = router;
const express = require('express');
const router = express.Router();
const {
  getQuickLinks,
  getQuickLinksAdmin,
  createQuickLink,
  updateQuickLink,
  deleteQuickLink,
  bulkCreateQuickLinks,
  getProductsForSelection
} = require('../controllers/quickLink.controller');

const { protect, authorize } = require('../middlewares/auth.middleware');

// Public routes (for frontend)
router.get('/', getQuickLinks);

// Admin routes (protected)
router.get('/admin', protect, authorize('admin'), getQuickLinksAdmin);
router.post('/', protect, authorize('admin'), createQuickLink);
router.put('/:id', protect, authorize('admin'), updateQuickLink);
router.delete('/:id', protect, authorize('admin'), deleteQuickLink);
router.post('/bulk', protect, authorize('admin'), bulkCreateQuickLinks);
router.get('/products/:categoryId/:subcategoryId?', protect, authorize('admin'), getProductsForSelection);

module.exports = router;

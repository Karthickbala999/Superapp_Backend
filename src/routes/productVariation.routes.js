const express = require('express');
const router = express.Router();
const {
  getProductVariations,
  getVariationById,
  createVariation,
  updateVariation,
  deleteVariation
} = require('../controllers/productVariation.controller');
const { protect, authorize } = require('../middlewares/auth.middleware');
const upload = require('../middlewares/upload.middleware');
const { validateImage } = require('../middlewares/imageValidation.middleware');

// Public routes
router.get('/product/:productId', getProductVariations);
router.get('/:id', getVariationById);

// Protected routes (admin only)
router.post('/', protect, authorize('admin'), upload.single('variation_image'), validateImage, createVariation);
router.put('/:id', protect, authorize('admin'), upload.single('variation_image'), updateVariation);
router.delete('/:id', protect, authorize('admin'), deleteVariation);

module.exports = router; 
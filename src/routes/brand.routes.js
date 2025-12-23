const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middlewares/auth.middleware');
const upload = require('../middlewares/upload.middleware');
const { validateImage } = require('../middlewares/imageValidation.middleware');

// Import brand controller
const {
  getAllBrands,
  getBrandById,
  createBrand,
  updateBrand,
  deleteBrand,
  bulkDeleteBrands
} = require('../controllers/brand.controller');

// Public routes
router.get('/get_all_brand', getAllBrands);

router.get('/:id', getBrandById);

// Protected routes (admin and ecommerce_admin)
router.post('/save_brand', protect, authorize('admin', 'ecommerce_admin'), upload.single('brand_image'), validateImage, createBrand);
router.put('/update_brand_by_id/:id', protect, authorize('admin', 'ecommerce_admin'), upload.single('brand_image'), updateBrand);
router.delete('/delete_brand_by_id/:id', protect, authorize('admin', 'ecommerce_admin'), deleteBrand);
router.delete('/bulk_delete_brands', protect, authorize('admin', 'ecommerce_admin'), bulkDeleteBrands);

module.exports = router; 
const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middlewares/auth.middleware');
const {getAllCategories, getParentCategories, getChildrenByParentId, getCategoryById, createCategory, updateCategory, deleteCategory} = require('../controllers/category.controller');
const upload = require('../middlewares/upload.middleware');
const { validateImage } = require('../middlewares/imageValidation.middleware');


router.get('/', getAllCategories);
router.get('/parents', getParentCategories); // Get active parent categories only
router.get('/parent/:id/children', getChildrenByParentId); // Get children by parent ID
router.get('/:id', getCategoryById); 

// Protected routes (admin and ecommerce_admin)
router.post('/', protect, authorize('admin', 'ecommerce_admin'), upload.single('category_image'), validateImage, createCategory);


router.put('/:id', protect, authorize('admin', 'ecommerce_admin'), upload.single('category_image'), updateCategory);
router.delete('/:id', protect, authorize('admin', 'ecommerce_admin'), deleteCategory);
module.exports = router; 
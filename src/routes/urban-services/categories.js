const express = require('express');
const {
  getCategories,
  getCategoryById,
  createCategory,
  updateCategory,
  deleteCategory,
  getCategoryTree,
  reorderCategories
} = require('../../controllers/urban-services/serviceCategoryController');
const { protect, authorize } = require('../../middlewares/auth.middleware');

const router = express.Router();

router.route('/')
  .get(getCategories)
  .post(protect, authorize('admin'), createCategory);

router.route('/tree')
  .get(getCategoryTree);

router.route('/reorder')
  .put(protect, authorize('admin'), reorderCategories);

router.route('/:id')
  .get(getCategoryById)
  .put(protect, authorize('admin'), updateCategory)
  .delete(protect, authorize('admin'), deleteCategory);

module.exports = router;

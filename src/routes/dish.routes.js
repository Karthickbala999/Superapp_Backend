const express = require('express');
const router = express.Router();
const {
  getAllDishes,
  getDishById,
  createDish,
  updateDish,
  deleteDish
} = require('../controllers/dish.controller');
const upload = require('../middlewares/upload.middleware');
const { validateImage } = require('../middlewares/imageValidation.middleware');
const { protect, authorize } = require('../middlewares/auth.middleware');

// List all dishes (optionally filter by restaurantId)
router.get('/', getAllDishes);
// Get dish by ID
router.get('/:id', getDishById);
// Create dish
router.post('/', protect, authorize('admin', 'restaurant_admin'), upload.single('image'), validateImage, createDish);
// Update dish
router.put('/:id', protect, authorize('admin', 'restaurant_admin'), upload.single('image'), updateDish);
// Delete dish
router.delete('/:id', deleteDish);

module.exports = router; 
const express = require('express');
const router = express.Router();

const {
  getAllRestaurants,
  getRestaurantById,
  createRestaurant,
  updateRestaurant,
  deleteRestaurant,
} = require('../controllers/restaurant.controller');

const restaurantCategoryController = require('../controllers/restaurantCategory.controller');

const {
  getAllDishes,
  getDishById,
  createDish,
  updateDish,
  deleteDish,
} = require('../controllers/dish.controller');

const { protect, authorize } = require('../middlewares/auth.middleware');
const upload = require('../middlewares/upload.middleware');
const { validateImage } = require('../middlewares/imageValidation.middleware');

// -------------------- PUBLIC ROUTES -------------------- //
router.get('/', getAllRestaurants); // 🔓 Public
router.get('/dishes', getAllDishes); // 🔓 Public
router.get('/dishes/:id', getDishById); // 🔓 Public

// -------------------- CATEGORY ROUTES (protected) -------------------- //
router.get(
  '/categories',
  protect,
  authorize('admin', 'restaurant_admin'),
  restaurantCategoryController.getAll
);
router.get(
  '/categories/:id',
  protect,
  authorize('admin', 'restaurant_admin'),
  restaurantCategoryController.getById
);
router.post(
  '/categories',
  protect,
  authorize('admin', 'restaurant_admin'),
  upload.single('image'),
  restaurantCategoryController.create
);
router.put(
  '/categories/:id',
  protect,
  authorize('admin', 'restaurant_admin'),
  upload.single('image'),
  restaurantCategoryController.update
);
router.delete(
  '/categories/:id',
  protect,
  authorize('admin', 'restaurant_admin'),
  restaurantCategoryController.delete
);

// -------------------- RESTAURANT BY ID (must come after categories) -------------------- //
router.get('/:id', getRestaurantById); // 🔓 Public

// -------------------- RESTAURANT ROUTES (protected for write actions) -------------------- //
router.post(
  '/',
  protect,
  authorize('admin', 'restaurant_admin'),
  upload.single('image'),
  validateImage,
  createRestaurant
);
router.put(
  '/:id',
  protect,
  authorize('admin', 'restaurant_admin'),
  upload.single('image'),
  updateRestaurant
);
router.delete('/:id', protect, authorize('admin', 'restaurant_admin'), deleteRestaurant);

// -------------------- DISH ROUTES (protected for write actions) -------------------- //
router.post(
  '/dishes',
  protect,
  authorize('admin', 'restaurant_admin'),
  upload.single('image'),
  validateImage,
  createDish
);
router.put(
  '/dishes/:id',
  protect,
  authorize('admin', 'restaurant_admin'),
  upload.single('image'),
  updateDish
);
router.delete('/dishes/:id', protect, authorize('admin', 'restaurant_admin'), deleteDish);

module.exports = router;

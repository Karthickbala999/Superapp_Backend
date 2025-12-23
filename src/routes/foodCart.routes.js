const express = require('express');
const router = express.Router();
const {
  getFoodCart,
  addToFoodCart,
  updateFoodCartItem,
  removeFoodCartItem,
  clearFoodCart
} = require('../controllers/foodCart.controller');
const { protect } = require('../middlewares/auth.middleware');

// All food cart routes require authentication
router.use(protect);

// GET /api/food-cart - Get user's food cart
router.get('/', getFoodCart);

// POST /api/food-cart/add - Add item to food cart
router.post('/add', addToFoodCart);

// PUT /api/food-cart/items/:item_id - Update item quantity
router.put('/items/:item_id', updateFoodCartItem);

// DELETE /api/food-cart/items/:item_id - Remove item from cart
router.delete('/items/:item_id', removeFoodCartItem);

// DELETE /api/food-cart/clear - Clear entire cart
router.delete('/clear', clearFoodCart);

module.exports = router; 
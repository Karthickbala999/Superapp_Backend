const express = require('express');
const router = express.Router();
const { protect } = require('../middlewares/auth.middleware');
const {
  getUserCart,
  addToCart,
  updateCartItem,
  removeFromCart,
  clearCart
} = require('../controllers/cart.controller');

// All cart routes are protected (require authentication)
router.use(protect);

// Get user's cart
router.get('/', getUserCart);

// Add item to cart
router.post('/items', addToCart);

// Update cart item quantity
router.put('/items/:itemId', updateCartItem);

// Remove item from cart
router.delete('/items/:itemId', removeFromCart);

// Clear cart
router.delete('/', clearCart);

module.exports = router; 
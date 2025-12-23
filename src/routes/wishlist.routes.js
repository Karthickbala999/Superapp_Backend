const express = require('express');
const router = express.Router();
const { protect } = require('../middlewares/auth.middleware');
const {
  getWishlist,
  addToWishlist,
  removeFromWishlist,
  clearWishlist
} = require('../controllers/wishlist.controller');

// All wishlist routes are protected (require authentication)
router.use(protect);

// Get user's wishlist
router.get('/', getWishlist);

// Add item to wishlist
router.post('/', addToWishlist);

// Remove item from wishlist
router.delete('/:itemId', removeFromWishlist);

// Clear wishlist
router.delete('/', clearWishlist);

module.exports = router; 
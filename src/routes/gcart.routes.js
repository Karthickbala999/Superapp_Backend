const express = require('express');
const router = express.Router();
const {
  getUserGroceryCart,
  addToGroceryCart,
  updateGroceryCartItem,
  removeFromGroceryCart,
  clearGroceryCart
} = require('../controllers/gcart.controller');
const { protect } = require('../middlewares/auth.middleware');

router.get('/', protect, getUserGroceryCart);
router.post('/', protect, addToGroceryCart);
router.put('/:item_id', protect, updateGroceryCartItem);
router.delete('/:item_id', protect, removeFromGroceryCart);
router.post('/clear', protect, clearGroceryCart);

module.exports = router;


const express = require('express');
const router = express.Router();
const {
  getUserOrders,
  getOrderById,
  createOrder,
  cancelOrder,
  getOrderStatus
} = require('../controllers/order.controller');
const { protect } = require('../middlewares/auth.middleware');

// Create order
router.post('/', protect, createOrder);

// Get user's orders
router.get('/', protect, getUserOrders);

// Get specific order
router.get('/:id', protect, getOrderById);

// Get order by order number
router.get('/number/:orderNumber', protect, getOrderById);

// Cancel order
router.put('/:id/cancel', protect, cancelOrder);

module.exports = router; 
const express = require('express');
const router = express.Router();
const {
  getUserGroceryOrders,
  getGroceryOrderById,
  createGroceryOrder,
  cancelGroceryOrder,
  getGroceryOrderStatus,
  adminGetAllGroceryOrders,
  adminUpdateGroceryOrderStatus
} = require('../controllers/groceryOrder.controller');

console.log('DEBUG: adminGetAllGroceryOrders:', typeof adminGetAllGroceryOrders);
console.log('DEBUG: adminUpdateGroceryOrderStatus:', typeof adminUpdateGroceryOrderStatus);

const { protect, authorize } = require('../middlewares/auth.middleware');
const isAdmin = authorize('admin');

// ADMIN routes
router.get('/admin/all', protect, isAdmin, adminGetAllGroceryOrders);
router.put('/admin/:id/status', protect, isAdmin, adminUpdateGroceryOrderStatus);

// Protected routes (require authentication)
router.post('/', protect, createGroceryOrder);
router.get('/my-orders', protect, getUserGroceryOrders);
router.get('/:id', protect, getGroceryOrderById);
router.put('/:id/cancel', protect, cancelGroceryOrder);
router.get('/:id/status', protect, getGroceryOrderStatus);

module.exports = router;

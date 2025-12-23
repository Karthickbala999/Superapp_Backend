const express = require('express');
const router = express.Router();
const adminOrderController = require('../controllers/adminOrder.controller');
const { protect, authorize } = require('../middlewares/auth.middleware');

// All routes require authentication and admin authorization
router.use(protect);
router.use(authorize('admin', 'ecommerce_admin'));

// Get all orders with advanced filtering
router.get('/', adminOrderController.getAllOrders);

// Get order statistics for dashboard
router.get('/stats', adminOrderController.getOrderStats);

// Export orders (must come before /:id route)
router.get('/export/data', adminOrderController.exportOrders);

// Search order by order number (must come before /:id route)
router.get('/search/:orderNumber', adminOrderController.searchOrderByNumber);

// Get single order by ID (this must be last as it matches any :id)
router.get('/:id', adminOrderController.getOrderById);

// Update order status
router.put('/:id/status', adminOrderController.updateOrderStatus);

// Bulk update orders
router.put('/bulk-update', adminOrderController.bulkUpdateOrders);

module.exports = router; 
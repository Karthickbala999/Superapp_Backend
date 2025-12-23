const express = require('express');
const router = express.Router();
const {
  getUserFoodOrders,
  getFoodOrderById,
  createFoodOrder,
  cancelFoodOrder,
  getFoodOrderStatus,
  rateFoodOrder,
  getRestaurantOrders,
  updateFoodOrderStatus,
  getAllRestaurantOrders,
  getRestaurantOrderStats
} = require('../controllers/foodOrder.controller');
const { protect, authorize } = require('../middlewares/auth.middleware');

// Customer routes (require authentication)
router.use(protect);

// ✅ ADMIN ROUTES FIRST (before parameterized routes)
// Admin routes (require admin access)
router.get('/admin/all', 
  authorize('admin'), 
  getAllRestaurantOrders
);

router.get('/admin/stats', 
  authorize('admin'), 
  getRestaurantOrderStats
);

// GET /api/food-orders - Get user's food orders
router.get('/', getUserFoodOrders);

// POST /api/food-orders - Create food order from cart
router.post('/', createFoodOrder);

// Restaurant owner routes (require restaurant admin access)
router.get('/restaurant/:restaurant_id', 
  authorize('admin', 'restaurant_admin'), 
  getRestaurantOrders
);

router.put('/restaurant/orders/:order_id/status', 
  authorize('admin', 'restaurant_admin'), 
  updateFoodOrderStatus
);

// ✅ PARAMETERIZED ROUTES LAST (to avoid conflicts)
// GET /api/food-orders/:id - Get specific food order
router.get('/:id', getFoodOrderById);

// GET /api/food-orders/:id/status - Get order status/tracking
router.get('/:id/status', getFoodOrderStatus);

// PUT /api/food-orders/:id/cancel - Cancel food order
router.put('/:id/cancel', cancelFoodOrder);

// PUT /api/food-orders/:id/rate - Rate food order
router.put('/:id/rate', rateFoodOrder);

// Test endpoint to check if food orders exist
router.get('/admin/test', 
  authorize('admin'), 
  async (req, res) => {
    try {
      const { FoodOrder } = require('../models');
      const totalOrders = await FoodOrder.countDocuments({});
      const sampleOrder = await FoodOrder.findOne({}).populate('user restaurant');
      
      res.json({
        success: true,
        total_orders: totalOrders,
        sample_order: sampleOrder ? {
          id: sampleOrder._id,
          order_number: sampleOrder.order_number,
          status: sampleOrder.status,
          user: sampleOrder.user,
          restaurant: sampleOrder.restaurant
        } : null
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Test failed',
        error: error.message
      });
    }
  }
);

module.exports = router; 
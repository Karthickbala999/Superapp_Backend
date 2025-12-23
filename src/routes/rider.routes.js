const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const {
  registerRider,
  loginRider,
  getRiderProfile,
  updateRiderProfile,
  updateLocation,
  toggleOnlineStatus,
  getAvailableOrders,
  acceptOrder,
  updateOrderStatus,
  getRiderEarnings,
  getRiderOrders,
  getAllRiders,
  getRiderById,
  updateRiderStatus
} = require('../controllers/rider.controller');

// Public routes
router.post('/register', registerRider);
router.post('/login', loginRider);

// Protected routes (require rider authentication)
router.get('/profile', protectRider, getRiderProfile);
router.put('/profile', protectRider, updateRiderProfile);
router.post('/location', protectRider, updateLocation);
router.put('/online-status', protectRider, toggleOnlineStatus);

// Order management
router.get('/orders/available', protectRider, getAvailableOrders);
router.post('/orders/:orderId/accept', protectRider, acceptOrder);
router.put('/orders/:orderId/status', protectRider, updateOrderStatus);
router.get('/orders', protectRider, getRiderOrders);

// Earnings
router.get('/earnings', protectRider, getRiderEarnings);

// Admin routes (require admin authentication)
router.get('/', protectAdmin, getAllRiders);
router.get('/:id', protectAdmin, getRiderById);
router.put('/:id/status', protectAdmin, updateRiderStatus);

module.exports = router;

// Rider authentication middleware
function protectRider(req, res, next) {
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    return res.status(401).json({
      success: false,
      message: 'Not authorized to access this route'
    });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-super-secret-jwt-key');
    
    if (decoded.type !== 'rider') {
      return res.status(401).json({
        success: false,
        message: 'Invalid token type'
      });
    }

    req.rider = { id: decoded.id };
    next();
  } catch (err) {
    return res.status(401).json({
      success: false,
      message: 'Not authorized to access this route'
    });
  }
}

// Admin authentication middleware
function protectAdmin(req, res, next) {
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    return res.status(401).json({
      success: false,
      message: 'Not authorized to access this route'
    });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-super-secret-jwt-key');
    
    // Allow admin or any user token for now (since admin panel uses user tokens)
    req.user = { id: decoded.id };
    next();
  } catch (err) {
    return res.status(401).json({
      success: false,
      message: 'Not authorized to access this route'
    });
  }
}

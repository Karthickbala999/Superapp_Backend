const express = require('express');
const router = express.Router();
const {
  getAdminProfile,
  updateAdminProfile
} = require('../controllers/adminProfile.controller');
const { protect, authorize } = require('../middlewares/auth.middleware');
const upload = require('../middlewares/upload.middleware');

// Test endpoint (remove in production) - no auth required for testing
router.get('/profiles/test', async (req, res) => {
  try {
    const AdminProfile = require('../models/adminProfile');
    const count = await AdminProfile.countDocuments();
    res.json({ 
      success: true, 
      message: 'AdminProfile model is working',
      count: count 
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      error: error.message,
      stack: error.stack 
    });
  }
});

// Protect all routes - require authentication
router.use(protect);

// Get admin profile
router.get('/profiles', authorize('admin', 'ecommerce_admin', 'grocery_admin', 'taxi_admin', 'hotel_admin'), getAdminProfile);

// Update admin profile (supports both POST with _method=PUT and PUT)
router.put('/profiles/:id', authorize('admin', 'ecommerce_admin', 'grocery_admin', 'taxi_admin', 'hotel_admin'), upload.single('logo'), updateAdminProfile);
router.post('/profiles/:id', authorize('admin', 'ecommerce_admin', 'grocery_admin', 'taxi_admin', 'hotel_admin'), upload.single('logo'), updateAdminProfile);

module.exports = router;


const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middlewares/auth.middleware');
const { 
  getAllUsers, 
  getUserById, 
  createUser, 
  updateUser, 
  deleteUser, 
  updatePassword,
  updateUserProfile
} = require('../controllers/user.controller');

// All routes require authentication
router.use(protect);

// Get all users (admin only)
router.get('/', authorize('admin', 'ecommerce_admin', 'grocery_admin', 'taxi_admin', 'hotel_admin'), getAllUsers);

// Get user by ID (admin only)
router.get('/:id', authorize('admin', 'ecommerce_admin', 'grocery_admin', 'taxi_admin', 'hotel_admin'), getUserById);

// Create new user (admin only)
router.post('/', authorize('admin'), createUser);

// Update user (admin only)
router.put('/:id', authorize('admin', 'ecommerce_admin', 'grocery_admin', 'taxi_admin', 'hotel_admin'), updateUser);

// Delete user (admin only)
router.delete('/:id', authorize('admin'), deleteUser);

// Update user password (admin only)
router.put('/:id/password', authorize('admin', 'ecommerce_admin', 'grocery_admin', 'taxi_admin', 'hotel_admin'), updatePassword);

// Update user profile (admin only)
router.put('/:id/profile', authorize('admin', 'ecommerce_admin', 'grocery_admin', 'taxi_admin', 'hotel_admin'), updateUserProfile);

// Protected route - Get user profile
router.get('/me/profile', async (req, res) => {
  try {
    // req.user is set by the protect middleware
    const user = req.user;
    
    res.json({
      success: true,
      data: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        phone: user.phone
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching user profile',
      error: error.message
    });
  }
});

module.exports = router; 
const express = require('express');
const router = express.Router();
const {
  getUserProfile,
  updateUserProfile,
  deleteProfilePicture
} = require('../controllers/userProfile.controller');
const { protect } = require('../middlewares/auth.middleware');
const upload = require('../middlewares/upload.middleware');
const { validateImage } = require('../middlewares/imageValidation.middleware');

// All routes require authentication
router.use(protect);

// Get user profile
router.get('/', getUserProfile);

// Update user profile
router.put('/', upload.single('profile_picture'), updateUserProfile);

// Delete profile picture
router.delete('/picture', deleteProfilePicture);

module.exports = router; 
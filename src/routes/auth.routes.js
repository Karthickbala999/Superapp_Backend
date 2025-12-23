const express = require('express');
const router = express.Router();
const { register, login, getProfile, updateProfile } = require('../controllers/auth.controller');
const { generateOTP, verifyOTP } = require('../controllers/otp.controller');
const { protect } = require('../middlewares/auth.middleware');
const partnerAuthRoutes = require('./partnerAuth.routes');

// Health check route for /api/auth
router.get('/', (req, res) => {
  res.json({ success: true, message: 'Auth API is up' });
});

// Public routes
router.post('/register', register);
router.post('/login', login);

// OTP routes
router.post('/otp/generate', generateOTP);
router.post('/otp/verify', verifyOTP);
router.get('/otp/latest', require('../controllers/otp.controller').getLatestOTP);

// Protected routes
router.get('/profile', protect, getProfile);
router.put('/profile', protect, updateProfile);

// Partner authentication routes
router.use('/partner', partnerAuthRoutes);

module.exports = router; 
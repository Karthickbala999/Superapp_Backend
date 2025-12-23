const express = require('express');
const router = express.Router();
const otpController = require('../controllers/otp.controller');

// Generate OTP
router.post('/generate', otpController.generateOTP);

// Verify OTP
router.post('/verify', otpController.verifyOTP);

// Fetch latest OTP for a user (for dev auto-fill)
router.get('/latest', otpController.getLatestOTP);

module.exports = router; 
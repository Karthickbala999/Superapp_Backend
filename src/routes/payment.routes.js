const express = require('express');
const router = express.Router();
const {
  createOrder,
  verifyPayment,
  processWebhook,
  processRefund,
  getPaymentDetails,
  getUserPayments
} = require('../controllers/payment.controller');
const { protect, authorize } = require('../middlewares/auth.middleware');

// Public routes (no authentication required)
router.post('/webhook', processWebhook);

// Test endpoint (public)
router.get('/test', (req, res) => {
  res.json({
    success: true,
    message: 'Payment routes are working correctly',
    timestamp: new Date().toISOString(),
    endpoints: {
      createOrder: 'POST /api/payments/create-order',
      verify: 'POST /api/payments/verify',
      webhook: 'POST /api/payments/webhook',
      getPayment: 'GET /api/payments/:id',
      getUserPayments: 'GET /api/payments/user/:userId',
      refund: 'POST /api/payments/refund'
    }
  });
});

// Get Razorpay public key (public)
router.get('/razorpay-key', async (req, res) => {
  try {
    const razorpayConfig = require('../config/razorpay.config');
    const publicKey = razorpayConfig.getPublicKey();
    
    if (!publicKey) {
      return res.status(503).json({
        success: false,
        message: 'Razorpay is not configured'
      });
    }
    
    // Test Razorpay connectivity if possible
    let connectivityStatus = 'unknown';
    try {
      const Razorpay = require('razorpay');
      const razorpay = new Razorpay({
        key_id: razorpayConfig.key_id,
        key_secret: razorpayConfig.key_secret
      });
      
      // Try a simpler connectivity test - create a minimal order
      const testOrder = await razorpay.orders.create({
        amount: 100, // 1 rupee in paise
        currency: 'INR',
        receipt: 'test-connectivity-' + Date.now()
      });
      
      connectivityStatus = 'connected';
      console.log(`✅ Razorpay connectivity test successful. Test order created: ${testOrder.id}`);
      
      // Clean up test order
      try {
        await razorpay.orders.cancel(testOrder.id);
        console.log(`✅ Test order ${testOrder.id} cancelled successfully`);
      } catch (cleanupError) {
        console.warn(`⚠️ Could not cancel test order ${testOrder.id}:`, cleanupError.message);
      }
    } catch (connectivityError) {
      connectivityStatus = 'failed';
      console.error('❌ Razorpay connectivity test failed:', connectivityError.message);
      console.error('❌ Error details:', {
        code: connectivityError.error?.code,
        description: connectivityError.error?.description,
        field: connectivityError.error?.field
      });
      console.log('⚠️ This might indicate invalid API keys or network issues');
    }
    
    res.json({
      success: true,
      data: {
        key_id: publicKey,
        test_mode: razorpayConfig.isTestMode(),
        connectivity: connectivityStatus
      }
    });
  } catch (error) {
    console.error('Error in razorpay-key endpoint:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get Razorpay configuration'
    });
  }
});

// Protected routes (authentication required)
router.use(protect);

// Payment creation and verification
router.post('/create-order', createOrder);
router.post('/verify', verifyPayment);

// Payment management
router.get('/user/:userId', getUserPayments);
router.get('/:id', getPaymentDetails);

// Refund processing (admin only)
router.post('/refund', authorize('admin'), processRefund);

module.exports = router; 
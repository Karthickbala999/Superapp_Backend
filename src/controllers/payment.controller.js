const Razorpay = require('razorpay');
const crypto = require('crypto');
const asyncHandler = require('express-async-handler');
const Payment = require('../models/payment');
const Order = require('../models/order');
const FoodOrder = require('../models/foodorder');
const Booking = require('../models/booking');
const GroceryOrder = require('../models/groceryorder');
const TaxiRide = require('../models/taxiride');
const PorterBooking = require('../models/porterbooking');
const User = require('../models/user');
const razorpayConfig = require('../config/razorpay.config');

// Initialize Razorpay instance with error handling and retry logic
let razorpay;
let razorpayInitialized = false;

const initializeRazorpay = () => {
  try {
    const config = razorpayConfig.getRazorpayConfig();
    if (!config.key_id || !config.key_secret) {
      console.warn('⚠️ Razorpay keys not configured. Payment features will be disabled.');
      razorpay = null;
      razorpayInitialized = false;
      return false;
    } else {
      razorpay = new Razorpay({
        ...config,
        timeout: razorpayConfig.timeout,
        headers: {
          'User-Agent': 'SuperApp-Payment-Service/1.0'
        }
      });
      razorpayInitialized = true;
      return true;
    }
  } catch (error) {
    console.error('❌ Error initializing Razorpay:', error.message);
    razorpay = null;
    razorpayInitialized = false;
    return false;
  }
};

// Initialize on startup
initializeRazorpay();

// Retry mechanism for Razorpay operations
const retryOperation = async (operation, maxRetries = 3) => {
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await operation();
    } catch (error) {
      if (attempt === maxRetries) throw error;

      // Wait before retrying (exponential backoff)
      const delay = Math.pow(2, attempt) * 1000;
      console.log(`⚠️ Razorpay operation failed, retrying in ${delay}ms (attempt ${attempt}/${maxRetries})`);
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }
};

// @desc    Create Razorpay order
// @route   POST /api/payments/create-order
// @access  Private
const createOrder = asyncHandler(async (req, res) => {
  const { amount, currency = 'INR', order_id, order_model, description, email, contact } = req.body;

  console.log('🔍 Payment Controller: createOrder called with data:', {
    amount, currency, order_id, order_model, description, email, contact
  });

  // Validate required fields
  if (!amount || !order_id || !order_model || !email || !contact) {
    console.error('❌ Payment Controller: Missing required fields:', {
      amount: !!amount,
      order_id: !!order_id,
      order_model: !!order_model,
      email: !!email,
      contact: !!contact
    });
    res.status(400);
    throw new Error('Missing required fields: amount, order_id, order_model, email, contact');
  }

  // Validate order model
  const validOrderModels = ['Order', 'FoodOrder', 'GroceryOrder', 'Booking', 'TaxiRide', 'PorterBooking', 'ServiceBooking'];
  if (!validOrderModels.includes(order_model)) {
    console.error('❌ Payment Controller: Invalid order model:', order_model);
    res.status(400);
    throw new Error('Invalid order model');
  }

  try {
    // Check if Razorpay is initialized
    if (!razorpay || !razorpayInitialized) {
      console.warn('⚠️ Payment Controller: Razorpay not initialized, attempting to reinitialize...');
      // Try to reinitialize if not initialized
      if (!initializeRazorpay()) {
        console.error('❌ Payment Controller: Failed to initialize Razorpay');
        res.status(503);
        throw new Error('Payment service is not configured. Please contact administrator.');
      }
    }

    // Log Razorpay configuration for debugging
    console.log(`🔍 Payment Controller: Razorpay initialized: ${razorpayInitialized}`);
    console.log(`🔍 Payment Controller: Test mode: ${razorpayConfig.isTestMode()}`);
    console.log(`🔍 Payment Controller: Key ID: ${razorpayConfig.key_id ? 'Set' : 'Not set'}`);

    // Validate amount
    const amountInPaise = Math.round(amount * 100);
    console.log(`🔍 Payment Controller: Amount validation - Original: ${amount}, In Paise: ${amountInPaise}`);

    if (amountInPaise < 100) { // Minimum 1 rupee
      res.status(400);
      throw new Error('Amount must be at least 1 rupee');
    }

    // Check for test mode limits
    if (razorpayConfig.isTestMode() && amountInPaise > 500000) { // ₹5000 limit for test mode
      res.status(400);
      throw new Error('Amount exceeds test mode limit of ₹5000. Please use a smaller amount for testing.');
    }

    // Create Razorpay order with retry mechanism
    console.log(`🔍 Payment Controller: Creating Razorpay order with amount: ${amountInPaise} paise (₹${amount})`);

    const razorpayOrder = await retryOperation(async () => {
      const orderData = {
        amount: amountInPaise,
        currency: currency,
        receipt: `ORD_${Date.now()}`, // Short receipt ID for Razorpay
        notes: {
          order_id: order_id,
          order_model: order_model,
          description: description || `Payment for ${order_model}`,
          user_id: req.user.id,
          timestamp: new Date().toISOString()
        },
        partial_payment: false, // Disable partial payments
        first_payment_min_amount: amountInPaise // Minimum amount for first payment
      };

      console.log(`🔍 Payment Controller: Razorpay order data:`, orderData);
      return await razorpay.orders.create(orderData);
    }, razorpayConfig.maxRetries);

    // Create payment record in database - WITHOUT razorpay_payment_id initially
    const payment = await Payment.create({
      razorpay_order_id: razorpayOrder.id,
      order_id: order_id,
      order_model: order_model,
      amount: amount,
      currency: currency,
      user_id: req.user.id,
      description: description,
      email: email,
      contact: contact,
      status: 'pending'
      // razorpay_payment_id and razorpay_signature will be added later when payment is made
    });

    res.status(201).json({
      success: true,
      data: {
        razorpayOrder: {
          id: razorpayOrder.id,
          amount: razorpayOrder.amount,
          currency: razorpayOrder.currency
        },
        payment: {
          _id: payment._id,
          razorpay_order_id: payment.razorpay_order_id,
          order_id: payment.order_id,
          order_model: payment.order_model,
          amount: payment.amount,
          currency: payment.currency,
          status: payment.status
        }
      }
    });

  } catch (error) {
    console.error('Error creating Razorpay order:', error);
    res.status(500);
    throw new Error('Failed to create payment order');
  }
});

// @desc    Verify payment signature
// @route   POST /api/payments/verify
// @access  Private
const verifyPayment = asyncHandler(async (req, res) => {
  const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;

  console.log('🔍 Payment Controller: verifyPayment called with data:', {
    razorpay_order_id, razorpay_payment_id, razorpay_signature: razorpay_signature ? 'Present' : 'Missing'
  });

  // Validate required fields
  if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
    console.error('❌ Payment Controller: Missing payment verification fields:', {
      razorpay_order_id: !!razorpay_order_id,
      razorpay_payment_id: !!razorpay_payment_id,
      razorpay_signature: !!razorpay_signature
    });
    res.status(400);
    throw new Error('Missing required payment verification fields');
  }

  try {
    // Verify signature
    const body = razorpay_order_id + "|" + razorpay_payment_id;
    const expectedSignature = crypto
      .createHmac("sha256", razorpayConfig.key_secret)
      .update(body.toString())
      .digest("hex");

    console.log('🔍 Payment Controller: Signature verification:', {
      expected: expectedSignature.substring(0, 10) + '...',
      received: razorpay_signature.substring(0, 10) + '...',
      match: expectedSignature === razorpay_signature
    });

    if (expectedSignature === razorpay_signature) {
      // Update payment record
      const payment = await Payment.findOneAndUpdate(
        { razorpay_order_id: razorpay_order_id },
        {
          razorpay_payment_id: razorpay_payment_id,
          razorpay_signature: razorpay_signature,
          status: 'captured'
        },
        { new: true }
      );

      if (!payment) {
        console.error('❌ Payment Controller: Payment record not found for order_id:', razorpay_order_id);
        res.status(404);
        throw new Error('Payment record not found');
      }

      console.log('✅ Payment Controller: Payment record updated:', {
        payment_id: payment._id,
        order_id: payment.order_id,
        order_model: payment.order_model,
        status: payment.status
      });

      // ✅ UPDATE ORDER STATUS TO COMPLETED based on order model
      let order = null;

      if (payment.order_model === 'FoodOrder') {
        // Update FoodOrder status
        order = await FoodOrder.findByIdAndUpdate(
          payment.order_id,
          {
            status: 'confirmed', // Food orders use 'confirmed' instead of 'completed'
            payment_status: 'paid',
            updated_at: new Date()
          },
          { new: true }
        );

        if (order) {
          console.log('✅ FoodOrder status updated to confirmed:', order.order_number);
        } else {
          console.log('⚠️ FoodOrder not found for payment:', payment.order_id);
        }
      } else if (payment.order_model === 'ServiceBooking') {
        const ServiceBooking = require('../models/urban-services/serviceBooking');
        // Update ServiceBooking status
        order = await ServiceBooking.findByIdAndUpdate(
          payment.order_id,
          {
            status: 'completed', // For urban services, payment usually happens at completion
            paymentStatus: 'paid', // Note: ServiceBooking uses camelCase paymentStatus
            updatedAt: new Date()
          },
          { new: true }
        );

        if (order) {
          console.log('✅ ServiceBooking status updated to completed:', order.bookingNumber);
        } else {
          console.log('⚠️ ServiceBooking not found for payment:', payment.order_id);
        }
      } else if (payment.order_model === 'Booking') {
        // Update Booking status
        order = await Booking.findByIdAndUpdate(
          payment.order_id,
          {
            booking_status: 'confirmed', // Bookings use 'booking_status' field
            payment_status: 'paid',
            updatedAt: new Date()
          },
          { new: true }
        );

        if (order) {
          console.log('✅ Booking status updated to confirmed:', order._id);
        } else {
          console.log('⚠️ Booking not found for payment:', payment.order_id);
        }
      } else if (payment.order_model === 'GroceryOrder') {
        // Update GroceryOrder status
        order = await GroceryOrder.findByIdAndUpdate(
          payment.order_id,
          {
            status: 'confirmed', // Grocery orders use 'confirmed' status
            payment_status: 'paid',
            updatedAt: new Date()
          },
          { new: true }
        );

        if (order) {
          console.log('✅ GroceryOrder status updated to confirmed:', order.order_number);
        } else {
          console.log('⚠️ GroceryOrder not found for payment:', payment.order_id);
        }
      } else if (payment.order_model === 'TaxiRide') {
        // Update TaxiRide status
        order = await TaxiRide.findByIdAndUpdate(
          payment.order_id,
          {
            status: 'accepted', // Taxi rides use 'accepted' status after payment
            payment_status: 'paid',
            payment_method: 'razorpay',
            updatedAt: new Date()
          },
          { new: true }
        );

        if (order) {
          console.log('✅ TaxiRide status updated to accepted:', order._id);
        } else {
          console.log('⚠️ TaxiRide not found for payment:', payment.order_id);
        }
      } else if (payment.order_model === 'PorterBooking') {
        // Update PorterBooking status
        order = await PorterBooking.findByIdAndUpdate(
          payment.order_id,
          {
            status: 'assigned', // Porter bookings use 'assigned' status after payment
            payment_status: 'completed',
            payment_method: 'razorpay',
            assigned_at: new Date(), // Set assigned timestamp when payment is verified
            updatedAt: new Date()
          },
          { new: true }
        );

        if (order) {
          console.log('✅ PorterBooking status updated to assigned after payment verification:', order._id);
        } else {
          console.log('⚠️ PorterBooking not found for payment:', payment.order_id);
        }
      } else {
        // Update regular Order status
        order = await Order.findByIdAndUpdate(
          payment.order_id,
          {
            status: 'completed',
            payment_status: 'paid',
            updated_at: new Date()
          },
          { new: true }
        );

        if (order) {
          console.log('✅ Order status updated to completed:', order.order_number);
        } else {
          console.log('⚠️ Order not found for payment:', payment.order_id);
        }
      }

      res.json({
        success: true,
        message: 'Payment verified successfully',
        data: {
          payment: payment,
          order: order
        }
      });
    } else {
      res.status(400);
      throw new Error('Invalid payment signature');
    }
  } catch (error) {
    console.error('Error verifying payment:', error);
    res.status(500);
    throw new Error('Failed to verify payment');
  }
});

// @desc    Process Razorpay webhook
// @route   POST /api/payments/webhook
// @access  Public
const processWebhook = asyncHandler(async (req, res) => {
  const webhookSecret = razorpayConfig.webhook_secret;

  if (!webhookSecret) {
    console.warn('⚠️ Webhook secret not configured. Skipping signature verification.');
    return res.status(200).json({ received: true });
  }

  try {
    const signature = req.headers['x-razorpay-signature'];
    if (!signature) {
      res.status(400);
      throw new Error('Missing webhook signature');
    }

    // Verify webhook signature
    const expectedSignature = crypto
      .createHmac('sha256', webhookSecret)
      .update(JSON.stringify(req.body))
      .digest('hex');

    if (signature !== expectedSignature) {
      res.status(400);
      throw new Error('Invalid webhook signature');
    }

    // Process webhook events
    const event = req.body;
    console.log('📦 Webhook received:', event.event);

    switch (event.event) {
      case 'payment.captured':
        await handlePaymentCaptured(event.payload.payment.entity);
        break;
      case 'payment.failed':
        await handlePaymentFailed(event.payload.payment.entity);
        break;
      case 'refund.processed':
        await handleRefundProcessed(event.payload.refund.entity);
        break;
      default:
        console.log('⚠️ Unhandled webhook event:', event.event);
    }

    res.status(200).json({ received: true });
  } catch (error) {
    console.error('❌ Webhook processing error:', error);
    res.status(400).json({ error: error.message });
  }
});

// @desc    Process refund
// @route   POST /api/payments/refund
// @access  Private (Admin only)
const processRefund = asyncHandler(async (req, res) => {
  const { payment_id, amount, reason } = req.body;

  if (!payment_id) {
    res.status(400);
    throw new Error('Payment ID is required');
  }

  try {
    if (!razorpay) {
      res.status(503);
      throw new Error('Payment service is not configured');
    }

    // Get payment record
    const payment = await Payment.findById(payment_id);
    if (!payment) {
      res.status(404);
      throw new Error('Payment not found');
    }

    // Process refund through Razorpay
    const refundAmount = amount || payment.amount;
    const refund = await razorpay.payments.refund(payment.razorpay_payment_id, {
      amount: Math.round(refundAmount * 100),
      reason: reason || 'Customer request'
    });

    // Update payment record
    payment.refund_id = refund.id;
    payment.refund_amount = refundAmount;
    payment.refund_status = 'processed';
    payment.status = refundAmount >= payment.amount ? 'refunded' : 'partially_refunded';
    await payment.save();

    res.json({
      success: true,
      message: 'Refund processed successfully',
      data: {
        refund_id: refund.id,
        amount: refundAmount,
        status: payment.status
      }
    });

  } catch (error) {
    console.error('Error processing refund:', error);
    res.status(500);
    throw new Error('Failed to process refund');
  }
});

// @desc    Get payment details
// @route   GET /api/payments/:id
// @access  Private
const getPaymentDetails = asyncHandler(async (req, res) => {
  const payment = await Payment.findById(req.params.id).populate('user_id', 'name email');

  if (!payment) {
    res.status(404);
    throw new Error('Payment not found');
  }

  res.json({
    success: true,
    data: payment
  });
});

// @desc    Get user payments
// @route   GET /api/payments/user/:userId
// @access  Private
const getUserPayments = asyncHandler(async (req, res) => {
  const payments = await Payment.find({ user_id: req.params.userId })
    .populate('user_id', 'name email')
    .sort({ created_at: -1 });

  res.json({
    success: true,
    count: payments.length,
    data: payments
  });
});

// Helper functions for webhook processing
const handlePaymentCaptured = async (paymentEntity) => {
  try {
    const payment = await Payment.findOneAndUpdate(
      { razorpay_payment_id: paymentEntity.id },
      {
        status: 'captured',
        method: paymentEntity.method,
        razorpay_payment_id: paymentEntity.id
      },
      { new: true }
    );

    if (payment) {
      console.log('✅ Payment captured:', payment._id);
    }
  } catch (error) {
    console.error('❌ Error handling payment captured:', error);
  }
};

const handlePaymentFailed = async (paymentEntity) => {
  try {
    const payment = await Payment.findOneAndUpdate(
      { razorpay_order_id: paymentEntity.order_id },
      {
        status: 'failed',
        error_code: paymentEntity.error_code,
        error_description: paymentEntity.error_description
      },
      { new: true }
    );

    if (payment) {
      console.log('❌ Payment failed:', payment._id);

      // Update the associated order/booking status based on order_model
      if (payment.order_model === 'ServiceBooking') {
        const ServiceBooking = require('../models/urban-services/serviceBooking');
        await ServiceBooking.findByIdAndUpdate(
          payment.order_id,
          {
            status: 'cancelled',
            paymentStatus: 'failed',
            updatedAt: new Date()
          }
        );
        console.log('❌ ServiceBooking cancelled due to payment failure:', payment.order_id);
      } else if (payment.order_model === 'PorterBooking') {
        await PorterBooking.findByIdAndUpdate(
          payment.order_id,
          {
            status: 'cancelled',
            payment_status: 'failed',
            cancelled_at: new Date(),
            updatedAt: new Date()
          }
        );
        console.log('❌ PorterBooking cancelled due to payment failure:', payment.order_id);
      } else if (payment.order_model === 'TaxiRide') {
        await TaxiRide.findByIdAndUpdate(
          payment.order_id,
          {
            status: 'cancelled',
            payment_status: 'failed',
            cancelled_at: new Date(),
            updatedAt: new Date()
          }
        );
        console.log('❌ TaxiRide cancelled due to payment failure:', payment.order_id);
      } else if (payment.order_model === 'GroceryOrder') {
        await GroceryOrder.findByIdAndUpdate(
          payment.order_id,
          {
            status: 'cancelled',
            payment_status: 'failed',
            cancelled_at: new Date(),
            updatedAt: new Date()
          }
        );
        console.log('❌ GroceryOrder cancelled due to payment failure:', payment.order_id);
      } else if (payment.order_model === 'FoodOrder') {
        await FoodOrder.findByIdAndUpdate(
          payment.order_id,
          {
            status: 'cancelled',
            payment_status: 'failed',
            cancelled_at: new Date(),
            updated_at: new Date()
          }
        );
        console.log('❌ FoodOrder cancelled due to payment failure:', payment.order_id);
      } else if (payment.order_model === 'Booking') {
        await Booking.findByIdAndUpdate(
          payment.order_id,
          {
            booking_status: 'cancelled',
            payment_status: 'failed',
            cancelled_at: new Date(),
            updatedAt: new Date()
          }
        );
        console.log('❌ Booking cancelled due to payment failure:', payment.order_id);
      } else if (payment.order_model === 'Order') {
        await Order.findByIdAndUpdate(
          payment.order_id,
          {
            status: 'cancelled',
            payment_status: 'failed',
            cancelled_at: new Date(),
            updated_at: new Date()
          }
        );
        console.log('❌ Order cancelled due to payment failure:', payment.order_id);
      }
    }
  } catch (error) {
    console.error('❌ Error handling payment failed:', error);
  }
};

const handleRefundProcessed = async (refundEntity) => {
  try {
    const payment = await Payment.findOneAndUpdate(
      { razorpay_payment_id: refundEntity.payment_id },
      {
        refund_id: refundEntity.id,
        refund_amount: refundEntity.amount / 100,
        refund_status: 'processed',
        status: refundEntity.amount >= payment.amount ? 'refunded' : 'partially_refunded'
      },
      { new: true }
    );

    if (payment) {
      console.log('💰 Refund processed:', payment._id);
    }
  } catch (error) {
    console.error('❌ Error handling refund processed:', error);
  }
};

module.exports = {
  createOrder,
  verifyPayment,
  processWebhook,
  processRefund,
  getPaymentDetails,
  getUserPayments
}; 
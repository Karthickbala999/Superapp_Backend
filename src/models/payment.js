const mongoose = require('mongoose');

const paymentSchema = new mongoose.Schema({
  // Payment Details
  razorpay_order_id: {
    type: String,
    required: true
  },
  razorpay_payment_id: {
    type: String,
    required: false, // Will be set when payment is verified
    sparse: true // Allow multiple null values
  },
  razorpay_signature: {
    type: String,
    required: false // Will be set when payment is verified
  },
  
  // Order Details
  order_id: {
    type: String, // Changed to String to accept any order ID format
    required: true
  },
  order_model: {
    type: String,
    required: true,
    enum: ['Order', 'FoodOrder', 'GroceryOrder', 'Booking', 'TaxiRide', 'PorterBooking']
  },
  
  // Amount Details
  amount: {
    type: Number,
    required: true
  },
  currency: {
    type: String,
    default: 'INR'
  },
  
  // Payment Status
  status: {
    type: String,
    enum: ['pending', 'captured', 'failed', 'refunded', 'partially_refunded'],
    default: 'pending'
  },
  
  // Payment Method
  method: {
    type: String,
    enum: ['card', 'netbanking', 'wallet', 'upi', 'emi', 'cod'],
    required: false // Not required initially, will be set when payment is made
  },
  
  // User Details
  user_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  
  // Refund Details
  refund_id: {
    type: String
  },
  refund_amount: {
    type: Number,
    default: 0
  },
  refund_status: {
    type: String,
    enum: ['none', 'pending', 'processed', 'failed'],
    default: 'none'
  },
  
  // Additional Details
  description: {
    type: String
  },
  email: {
    type: String,
    required: true
  },
  contact: {
    type: String,
    required: true
  },
  
  // Error Details
  error_code: {
    type: String
  },
  error_description: {
    type: String
  },
  
  // Timestamps
  created_at: {
    type: Date,
    default: Date.now
  },
  updated_at: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' }
});

// Indexes for better performance - REMOVED razorpay_payment_id index
paymentSchema.index({ razorpay_order_id: 1 });
paymentSchema.index({ user_id: 1 });
paymentSchema.index({ order_id: 1 });
paymentSchema.index({ status: 1 });
paymentSchema.index({ created_at: -1 });

// Pre-save middleware to update updated_at
paymentSchema.pre('save', function(next) {
  this.updated_at = new Date();
  next();
});

module.exports = mongoose.model('Payment', paymentSchema); 
const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
  user_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'User ID is required']
  },
  order_number: {
    type: String,
    required: [true, 'Order number is required'],
    unique: true
  },
  status: {
    type: String,
    enum: ['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled', 'refunded'],
    default: 'pending'
  },
  total_amount: {
    type: Number,
    required: [true, 'Total amount is required'],
    min: [0, 'Total amount cannot be negative']
  },
  subtotal: {
    type: Number,
    required: [true, 'Subtotal is required'],
    min: [0, 'Subtotal cannot be negative']
  },
  tax_amount: {
    type: Number,
    default: 0
  },
  shipping_amount: {
    type: Number,
    default: 0
  },
  discount_amount: {
    type: Number,
    default: 0
  },
  shipping_address: {
    name: String,
    email: String,
    address_line1: String,
    address_line2: String,
    city: String,
    state: String,
    country: String,
    pincode: String,
    phone: String
  },
  billing_address: {
    name: String,
    email: String,
    address_line1: String,
    address_line2: String,
    city: String,
    state: String,
    country: String,
    pincode: String,
    phone: String
  },
  customer_name: {
    type: String,
    trim: true
  },
  customer_email: {
    type: String,
    trim: true,
    lowercase: true
  },
  customer_phone: {
    type: String,
    trim: true
  },
  payment_method: {
    type: String,
    enum: ['cod', 'card', 'upi', 'netbanking', 'razorpay', 'phonepay', 'paytm', 'amazonpay'],
    default: 'cod'
  },
  payment_status: {
    type: String,
    enum: ['pending', 'paid', 'failed', 'refunded'],
    default: 'pending'
  },
  payment_details: {
    type: mongoose.Schema.Types.Mixed
  },
  shipping_method: {
    type: String,
    default: 'standard'
  },
  tracking_number: {
    type: String
  },
  notes: {
    type: String
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Virtual for user relationship
orderSchema.virtual('user', {
  ref: 'User',
  localField: 'user_id',
  foreignField: '_id',
  justOne: true
});

// Virtual for order items
orderSchema.virtual('items', {
  ref: 'OrderItem',
  localField: '_id',
  foreignField: 'order_id'
});

// Indexes for better query performance
orderSchema.index({ user_id: 1 });
orderSchema.index({ status: 1 });
orderSchema.index({ payment_status: 1 });
orderSchema.index({ createdAt: -1 });

// Safe export pattern
module.exports = mongoose.models.Order || mongoose.model('Order', orderSchema); 
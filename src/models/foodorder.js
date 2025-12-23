const mongoose = require('mongoose');

const foodOrderSchema = new mongoose.Schema({
  user_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'User ID is required']
  },
  restaurant_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Restaurant',
    required: [true, 'Restaurant ID is required']
  },
  order_number: {
    type: String,
    required: [true, 'Order number is required'],
    unique: true
  },
  status: {
    type: String,
    enum: ['pending', 'confirmed', 'preparing', 'ready', 'out_for_delivery', 'delivered', 'cancelled', 'refunded'],
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
  delivery_fee: {
    type: Number,
    default: 0
  },
  discount_amount: {
    type: Number,
    default: 0
  },
  packaging_fee: {
    type: Number,
    default: 0
  },
  delivery_address: {
    address_line1: String,
    address_line2: String,
    city: String,
    state: String,
    country: String,
    pincode: String,
    phone: String,
    landmark: String
  },
  payment_method: {
    type: String,
    enum: ['cod', 'card', 'upi', 'netbanking', 'wallet', 'razorpay', 'phonepay', 'paytm', 'amazonpay'],
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
  delivery_method: {
    type: String,
    enum: ['delivery', 'pickup'],
    default: 'delivery'
  },
  estimated_delivery_time: {
    type: Date
  },
  actual_delivery_time: {
    type: Date
  },
  delivery_instructions: {
    type: String,
    trim: true
  },
  special_instructions: {
    type: String,
    trim: true
  },
  // Delivery tracking
  tracking_info: {
    order_confirmed_at: Date,
    preparation_started_at: Date,
    order_ready_at: Date,
    pickup_at: Date,
    delivered_at: Date
  },
  // Delivery partner info
  delivery_partner: {
    name: String,
    phone: String,
    vehicle_number: String
  },
  // Customer feedback
  rating: {
    type: Number,
    min: 1,
    max: 5
  },
  review: {
    type: String,
    trim: true
  },
  // Cancellation info
  cancellation_reason: {
    type: String,
    trim: true
  },
  cancelled_by: {
    type: String,
    enum: ['customer', 'restaurant', 'admin', 'system']
  },
  refund_amount: {
    type: Number,
    default: 0
  },
  notes: {
    type: String,
    trim: true
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
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Virtual for user relationship
foodOrderSchema.virtual('user', {
  ref: 'User',
  localField: 'user_id',
  foreignField: '_id',
  justOne: true
});

// Virtual for restaurant relationship
foodOrderSchema.virtual('restaurant', {
  ref: 'Restaurant',
  localField: 'restaurant_id',
  foreignField: '_id',
  justOne: true
});

// Virtual for order items
foodOrderSchema.virtual('items', {
  ref: 'FoodOrderItem',
  localField: '_id',
  foreignField: 'order_id'
});

// Indexes for performance
foodOrderSchema.index({ user_id: 1, createdAt: -1 });
foodOrderSchema.index({ restaurant_id: 1, createdAt: -1 });
foodOrderSchema.index({ status: 1 });
foodOrderSchema.index({ order_number: 1 });
foodOrderSchema.index({ payment_status: 1 });

const FoodOrder = mongoose.models.FoodOrder || mongoose.model('FoodOrder', foodOrderSchema);

module.exports = FoodOrder; 
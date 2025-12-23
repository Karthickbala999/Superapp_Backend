const mongoose = require('mongoose');

const foodCartSchema = new mongoose.Schema({
  user_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'User ID is required'],
    unique: true
  },
  restaurant_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Restaurant',
    required: [true, 'Restaurant ID is required']
  },
  // Food cart can only contain items from one restaurant at a time
  total_items: {
    type: Number,
    default: 0
  },
  total_amount: {
    type: Number,
    default: 0,
    min: [0, 'Total amount cannot be negative']
  },
  subtotal: {
    type: Number,
    default: 0,
    min: [0, 'Subtotal cannot be negative']
  },
  delivery_fee: {
    type: Number,
    default: 0
  },
  tax_amount: {
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
  // Applied offers/coupons
  applied_offers: [{
    offer_id: String,
    offer_title: String,
    discount_amount: Number,
    discount_type: {
      type: String,
      enum: ['percentage', 'flat']
    }
  }],
  // Special instructions for the entire order
  special_instructions: {
    type: String,
    trim: true
  },
  // Estimated delivery time
  estimated_delivery_time: {
    type: Date
  },
  // Last activity timestamp for cart cleanup
  last_activity: {
    type: Date,
    default: Date.now
  },
  status: {
    type: String,
    enum: ['active', 'abandoned', 'converted'],
    default: 'active'
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Virtual for user relationship
foodCartSchema.virtual('user', {
  ref: 'User',
  localField: 'user_id',
  foreignField: '_id',
  justOne: true
});

// Virtual for restaurant relationship
foodCartSchema.virtual('restaurant', {
  ref: 'Restaurant',
  localField: 'restaurant_id',
  foreignField: '_id',
  justOne: true
});

// Virtual for cart items
foodCartSchema.virtual('items', {
  ref: 'FoodCartItem',
  localField: '_id',
  foreignField: 'cart_id'
});

// Middleware to update last_activity on save
foodCartSchema.pre('save', function(next) {
  this.last_activity = new Date();
  next();
});

// Indexes for performance
foodCartSchema.index({ user_id: 1 });
foodCartSchema.index({ restaurant_id: 1 });
foodCartSchema.index({ status: 1 });
foodCartSchema.index({ last_activity: 1 });

const FoodCart = mongoose.model('FoodCart', foodCartSchema);

module.exports = FoodCart; 
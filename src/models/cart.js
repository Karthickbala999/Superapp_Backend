const mongoose = require('mongoose');

const cartSchema = new mongoose.Schema({
  user_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'User ID is required']
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
cartSchema.virtual('user', {
  ref: 'User',
  localField: 'user_id',
  foreignField: '_id',
  justOne: true
});

// Virtual for cart items
cartSchema.virtual('items', {
  ref: 'CartItem',
  localField: '_id',
  foreignField: 'cart_id'
});

// Indexes for better query performance
cartSchema.index({ user_id: 1 });
cartSchema.index({ status: 1 });

// Safe export pattern
module.exports = mongoose.models.Cart || mongoose.model('Cart', cartSchema);

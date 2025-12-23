const mongoose = require('mongoose');

const cartItemSchema = new mongoose.Schema({
  cart_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Cart',
    required: [true, 'Cart ID is required']
  },
  product_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: [true, 'Product ID is required']
  },
  quantity: {
    type: Number,
    required: [true, 'Quantity is required'],
    min: [1, 'Quantity must be at least 1'],
    default: 1
  },
  price: {
    type: Number,
    required: [true, 'Price is required'],
    min: [0, 'Price cannot be negative']
  },
  total_price: {
    type: Number,
    required: [true, 'Total price is required'],
    min: [0, 'Total price cannot be negative']
  },
  variation_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'ProductVariation'
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Virtual for cart relationship
cartItemSchema.virtual('cart', {
  ref: 'Cart',
  localField: 'cart_id',
  foreignField: '_id',
  justOne: true
});

// Virtual for product relationship
cartItemSchema.virtual('product', {
  ref: 'Product',
  localField: 'product_id',
  foreignField: '_id',
  justOne: true
});

// Virtual for variation relationship
cartItemSchema.virtual('variation', {
  ref: 'ProductVariation',
  localField: 'variation_id',
  foreignField: '_id',
  justOne: true
});

// Indexes for better query performance
cartItemSchema.index({ cart_id: 1 });
cartItemSchema.index({ product_id: 1 });

// Safe export pattern
module.exports = mongoose.models.CartItem || mongoose.model('CartItem', cartItemSchema); 
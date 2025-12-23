const mongoose = require('mongoose');

const orderItemSchema = new mongoose.Schema({
  order_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Order',
    required: [true, 'Order ID is required']
  },
  product_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: [true, 'Product ID is required']
  },
  variation_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'ProductVariation'
  },
  quantity: {
    type: Number,
    required: [true, 'Quantity is required'],
    min: [1, 'Quantity must be at least 1']
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
  // Product snapshot for historical reference
  product_snapshot: {
    name: String,
    sku: String,
    image: String,
    brand: String,
    category: String
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Virtual for order relationship
orderItemSchema.virtual('order', {
  ref: 'Order',
  localField: 'order_id',
  foreignField: '_id',
  justOne: true
});

// Virtual for product relationship
orderItemSchema.virtual('product', {
  ref: 'Product',
  localField: 'product_id',
  foreignField: '_id',
  justOne: true
});

// Virtual for variation relationship
orderItemSchema.virtual('variation', {
  ref: 'ProductVariation',
  localField: 'variation_id',
  foreignField: '_id',
  justOne: true
});

// Indexes for better query performance
orderItemSchema.index({ order_id: 1 });
orderItemSchema.index({ product_id: 1 });

// Safe export pattern
module.exports = mongoose.models.OrderItem || mongoose.model('OrderItem', orderItemSchema); 
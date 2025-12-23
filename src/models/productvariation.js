const mongoose = require('mongoose');

const productVariationSchema = new mongoose.Schema({
  product_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: [true, 'Product ID is required']
  },
  name: {
    type: String,
    required: [true, 'Variation name is required'],
    trim: true
  },
  sku: {
    type: String,
    required: [true, 'Variation SKU is required'],
    unique: true,
    trim: true
  },
  price: {
    type: Number,
    required: [true, 'Variation price is required'],
    min: [0, 'Price cannot be negative']
  },
  sale_price: {
    type: Number,
    min: [0, 'Sale price cannot be negative']
  },
  stock: {
    type: Number,
    required: [true, 'Variation stock is required'],
    min: [0, 'Stock cannot be negative'],
    default: 0
  },
  attributes: {
    type: mongoose.Schema.Types.Mixed,
    default: {}
  },
  image: {
    type: String
  },
  status: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Virtual for product relationship
productVariationSchema.virtual('baseProduct', {
  ref: 'Product',
  localField: 'product_id',
  foreignField: '_id',
  justOne: true
});

// Indexes for better query performance
productVariationSchema.index({ product_id: 1 });
productVariationSchema.index({ status: 1 });

// Safe export pattern
module.exports = mongoose.models.ProductVariation || mongoose.model('ProductVariation', productVariationSchema); 
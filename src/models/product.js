const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Product name is required'],
    trim: true
  },
  description: {
    type: String,
    trim: true
  },
  slug: {
    type: String,
    required: [true, 'Product slug is required'],
    unique: true,
    lowercase: true,
    trim: true
  },
  sku: {
    type: String,
    required: [true, 'Product SKU is required'],
    unique: true,
    trim: true
  },
  price: {
    type: Number,
    required: [true, 'Product price is required'],
    min: [0, 'Price cannot be negative']
  },
  sale_price: {
    type: Number,
    min: [0, 'Sale price cannot be negative']
  },
  stock: {
    type: Number,
    required: [true, 'Product stock is required'],
    min: [0, 'Stock cannot be negative'],
    default: 0
  },
  category_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Category',
    required: [true, 'Category is required']
  },
  sub_category_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Category'
  },
  brand_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Brand',
    required: [true, 'Brand is required']
  },
  featured_image: {
    type: String
  },
  photo: {
    type: String
  },
  images: [{
    type: String
  }],
  status: {
    type: Boolean,
    default: true
  },
  meta_title: {
    type: String,
    trim: true
  },
  meta_description: {
    type: String,
    trim: true
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Virtual for category relationship
productSchema.virtual('category', {
  ref: 'Category',
  localField: 'category_id',
  foreignField: '_id',
  justOne: true
});

// Virtual for brand relationship
productSchema.virtual('brand', {
  ref: 'Brand',
  localField: 'brand_id',
  foreignField: '_id',
  justOne: true
});

// Virtual for product variations
productSchema.virtual('productVariations', {
  ref: 'ProductVariation',
  localField: '_id',
  foreignField: 'product_id'
});

// Virtual for product attributes
productSchema.virtual('attributes', {
  ref: 'ProductAttribute',
  localField: '_id',
  foreignField: 'product_id'
});

// Indexes for better query performance
productSchema.index({ category_id: 1 });
productSchema.index({ brand_id: 1 });
productSchema.index({ status: 1 });
productSchema.index({ price: 1 });
productSchema.index({ stock: 1 });

// Safe export pattern
module.exports = mongoose.models.Product || mongoose.model('Product', productSchema);

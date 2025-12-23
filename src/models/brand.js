const mongoose = require('mongoose');

const brandSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Brand name is required'],
    trim: true
  },
  slug: {
    type: String,
    required: [true, 'Brand slug is required'],
    unique: true,
    lowercase: true,
    trim: true
  },
  description: {
    type: String,
    trim: true
  },
  logo: {
    type: String
  },
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

// Virtual for products of this brand
brandSchema.virtual('brandProducts', {
  ref: 'Product',
  localField: '_id',
  foreignField: 'brand_id'
});

// Indexes for better query performance
brandSchema.index({ status: 1 });

const Brand = mongoose.model('Brand', brandSchema);

module.exports = Brand; 
const mongoose = require('mongoose');

const categorySchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Category name is required'],
    trim: true
  },
  slug: {
    type: String,
    required: [true, 'Category slug is required'],
    unique: true,
    lowercase: true,
    trim: true
  },
  description: {
    type: String,
    trim: true
  },
  image: {
    type: String
  },
  parent_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Category',
    default: null
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

// Virtual for child categories
categorySchema.virtual('childCategories', {
  ref: 'Category',
  localField: '_id',
  foreignField: 'parent_id'
});

// Virtual for parent category
categorySchema.virtual('parentCategory', {
  ref: 'Category',
  localField: 'parent_id',
  foreignField: '_id',
  justOne: true
});

// Virtual for products in this category
categorySchema.virtual('categoryProducts', {
  ref: 'Product',
  localField: '_id',
  foreignField: 'category_id'
});

// Indexes for better query performance
categorySchema.index({ parent_id: 1 });
categorySchema.index({ status: 1 });

const Category = mongoose.model('Category', categorySchema);

module.exports = Category; 
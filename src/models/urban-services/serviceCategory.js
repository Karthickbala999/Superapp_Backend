const mongoose = require('mongoose');

const serviceCategorySchema = new mongoose.Schema({
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
  icon: {
    type: String,
    trim: true
  },
  image: {
    type: String,
    trim: true
  },
  parentCategory: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'ServiceCategory',
    default: null
  },
  isActive: {
    type: Boolean,
    default: true
  },
  sortOrder: {
    type: Number,
    default: 0
  },
  minPrice: {
    type: Number,
    default: 0
  },
  maxPrice: {
    type: Number,
    default: 0
  },
  pricingType: {
    type: String,
    enum: ['fixed', 'hourly', 'per_item', 'quote'],
    default: 'fixed'
  },
  estimatedDuration: {
    type: Number,
    default: 60
  },
  serviceAreas: [{
    type: String,
    trim: true
  }],
  metaTitle: {
    type: String,
    trim: true
  },
  metaDescription: {
    type: String,
    trim: true
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

serviceCategorySchema.virtual('subcategories', {
  ref: 'ServiceCategory',
  localField: '_id',
  foreignField: 'parentCategory'
});

serviceCategorySchema.virtual('services', {
  ref: 'Service',
  localField: '_id',
  foreignField: 'category'
});

serviceCategorySchema.index({ slug: 1 });
serviceCategorySchema.index({ parentCategory: 1 });
serviceCategorySchema.index({ isActive: 1 });
serviceCategorySchema.index({ sortOrder: 1 });

module.exports = mongoose.models.ServiceCategory || mongoose.model('ServiceCategory', serviceCategorySchema);

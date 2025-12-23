const mongoose = require('mongoose');

const serviceSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Service name is required'],
    trim: true
  },
  slug: {
    type: String,
    required: [true, 'Service slug is required'],
    unique: true,
    lowercase: true,
    trim: true
  },
  category: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'ServiceCategory',
    required: true
  },
  description: {
    type: String,
    required: [true, 'Service description is required'],
    trim: true
  },
  shortDescription: {
    type: String,
    trim: true
  },
  image: {
    type: String,
    trim: true
  },
  images: [String],
  pricing: {
    type: {
      type: String,
      enum: ['fixed', 'hourly', 'per_item', 'quote'],
      required: true
    },
    basePrice: {
      type: Number,
      required: true
    },
    additionalCharges: {
      type: Number,
      default: 0
    },
    maxPrice: Number,
    currency: {
      type: String,
      default: 'INR'
    }
  },
  duration: {
    type: Number,
    required: true
  },
  durationUnit: {
    type: String,
    enum: ['minutes', 'hours'],
    default: 'minutes'
  },
  features: [String],
  includes: [String],
  excludes: [String],
  requirements: [String],
  faqs: [{
    question: String,
    answer: String
  }],
  isActive: {
    type: Boolean,
    default: true
  },
  sortOrder: {
    type: Number,
    default: 0
  },
  popular: {
    type: Boolean,
    default: false
  },
  serviceAreas: [{
    city: String,
    areas: [String],
    pinCodes: [String],
    available: {
      type: Boolean,
      default: true
    }
  }],
  tags: [String],
  metaTitle: String,
  metaDescription: String,
  specifications: [{
    key: String,
    value: String
  }]
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

serviceSchema.virtual('categoryDetails', {
  ref: 'ServiceCategory',
  localField: 'category',
  foreignField: '_id',
  justOne: true
});

serviceSchema.virtual('bookings', {
  ref: 'ServiceBooking',
  localField: '_id',
  foreignField: 'service'
});

serviceSchema.pre('save', async function(next) {
  if (this.isNew && !this.slug) {
    this.slug = this.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
  }
  next();
});

serviceSchema.index({ slug: 1 });
serviceSchema.index({ category: 1 });
serviceSchema.index({ isActive: 1 });
serviceSchema.index({ popular: 1 });
serviceSchema.index({ sortOrder: 1 });
serviceSchema.index({ 'pricing.basePrice': 1 });

module.exports = mongoose.models.Service || mongoose.model('Service', serviceSchema);

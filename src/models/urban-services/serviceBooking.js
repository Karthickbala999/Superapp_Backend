const mongoose = require('mongoose');

const serviceBookingSchema = new mongoose.Schema({
  customer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  partner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'ServicePartner',
    required: false
  },
  category: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'ServiceCategory',
    required: true
  },
  service: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Service',
    required: true
  },
  bookingNumber: {
    type: String,
    required: true,
    unique: true
  },
  title: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    trim: true
  },
  address: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'SavedAddress',
    required: false
  },
  customAddress: {
    addressLine1: String,
    addressLine2: String,
    landmark: String,
    city: String,
    state: String,
    pinCode: String,
    coordinates: {
      lat: Number,
      lng: Number
    }
  },
  scheduledDate: {
    type: Date,
    required: true
  },
  scheduledTime: {
    type: String,
    required: true
  },
  estimatedDuration: {
    type: Number,
    required: true
  },
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
    discountAmount: {
      type: Number,
      default: 0
    },
    taxAmount: {
      type: Number,
      default: 0
    },
    totalAmount: {
      type: Number,
      required: true
    },
    paidAmount: {
      type: Number,
      default: 0
    },
    paymentMethod: {
      type: String,
      enum: ['cash', 'online', 'wallet'],
      default: 'cash'
    }
  },
  status: {
    type: String,
    enum: ['pending', 'accepted', 'rejected', 'on_the_way', 'in_progress', 'completed', 'cancelled', 'refunded'],
    default: 'pending'
  },
  timeline: [{
    status: String,
    timestamp: { type: Date, default: Date.now },
    note: String,
    updatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    }
  }],
  images: {
    before: [String],
    after: [String]
  },
  notes: {
    customerNotes: String,
    partnerNotes: String,
    adminNotes: String
  },
  issues: [{
    type: {
      type: String,
      enum: ['customer', 'partner', 'payment', 'service', 'other']
    },
    description: String,
    reportedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    reportedAt: { type: Date, default: Date.now },
    status: {
      type: String,
      enum: ['open', 'investigating', 'resolved', 'closed'],
      default: 'open'
    },
    resolution: String,
    resolvedAt: Date,
    resolvedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    }
  }],
  tracking: {
    partnerLocation: {
      lat: Number,
      lng: Number,
      lastUpdated: Date
    },
    estimatedArrival: Date,
    actualArrival: Date,
    serviceStartTime: Date,
    serviceEndTime: Date
  },
  paymentStatus: {
    type: String,
    enum: ['pending', 'partial', 'paid', 'refunded'],
    default: 'pending'
  },
  paymentId: String,
  refundId: String,
  promoCode: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'PromoCode'
  },
  assignedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  rejectedReason: String,
  cancelledBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  cancelledReason: String,
  cancelledAt: Date
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

serviceBookingSchema.virtual('customerDetails', {
  ref: 'User',
  localField: 'customer',
  foreignField: '_id',
  justOne: true
});

serviceBookingSchema.virtual('partnerDetails', {
  ref: 'ServicePartner',
  localField: 'partner',
  foreignField: '_id',
  justOne: true
});

serviceBookingSchema.virtual('categoryDetails', {
  ref: 'ServiceCategory',
  localField: 'category',
  foreignField: '_id',
  justOne: true
});

serviceBookingSchema.virtual('serviceDetails', {
  ref: 'Service',
  localField: 'service',
  foreignField: '_id',
  justOne: true
});

serviceBookingSchema.virtual('review', {
  ref: 'ServiceReview',
  localField: '_id',
  foreignField: 'booking',
  justOne: true
});

serviceBookingSchema.pre('save', async function(next) {
  if (this.isNew && !this.bookingNumber) {
    const count = await this.constructor.countDocuments();
    this.bookingNumber = `US${String(count + 1).padStart(6, '0')}`;
  }
  next();
});

serviceBookingSchema.index({ bookingNumber: 1 });
serviceBookingSchema.index({ customer: 1 });
serviceBookingSchema.index({ partner: 1 });
serviceBookingSchema.index({ category: 1 });
serviceBookingSchema.index({ status: 1 });
serviceBookingSchema.index({ scheduledDate: 1 });
serviceBookingSchema.index({ paymentStatus: 1 });
serviceBookingSchema.index({ createdAt: -1 });

module.exports = mongoose.models.ServiceBooking || mongoose.model('ServiceBooking', serviceBookingSchema);

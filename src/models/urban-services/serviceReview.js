const mongoose = require('mongoose');

const serviceReviewSchema = new mongoose.Schema({
  booking: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'ServiceBooking',
    required: true,
    unique: true
  },
  customer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  partner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'ServicePartner',
    required: true
  },
  rating: {
    type: Number,
    required: true,
    min: 1,
    max: 5
  },
  title: {
    type: String,
    trim: true
  },
  comment: {
    type: String,
    trim: true
  },
  aspects: {
    punctuality: {
      type: Number,
      min: 1,
      max: 5
    },
    quality: {
      type: Number,
      min: 1,
      max: 5
    },
    behavior: {
      type: Number,
      min: 1,
      max: 5
    },
    value_for_money: {
      type: Number,
      min: 1,
      max: 5
    }
  },
  images: [String],
  isVerified: {
    type: Boolean,
    default: true
  },
  helpfulCount: {
    type: Number,
    default: 0
  },
  response: {
    text: String,
    respondedAt: Date,
    respondedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'ServicePartner'
    }
  },
  status: {
    type: String,
    enum: ['published', 'hidden', 'flagged', 'removed'],
    default: 'published'
  },
  flaggedReason: String,
  removedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  removedAt: Date
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

serviceReviewSchema.virtual('customerDetails', {
  ref: 'User',
  localField: 'customer',
  foreignField: '_id',
  justOne: true
});

serviceReviewSchema.virtual('partnerDetails', {
  ref: 'ServicePartner',
  localField: 'partner',
  foreignField: '_id',
  justOne: true
});

serviceReviewSchema.virtual('bookingDetails', {
  ref: 'ServiceBooking',
  localField: 'booking',
  foreignField: '_id',
  justOne: true
});

serviceReviewSchema.index({ booking: 1 });
serviceReviewSchema.index({ customer: 1 });
serviceReviewSchema.index({ partner: 1 });
serviceReviewSchema.index({ rating: -1 });
serviceReviewSchema.index({ status: 1 });
serviceReviewSchema.index({ createdAt: -1 });

module.exports = mongoose.models.ServiceReview || mongoose.model('ServiceReview', serviceReviewSchema);

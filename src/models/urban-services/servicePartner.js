const mongoose = require('mongoose');

const servicePartnerSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  businessName: {
    type: String,
    required: [true, 'Business name is required'],
    trim: true
  },
  partnerType: {
    type: String,
    enum: ['individual', 'company'],
    default: 'individual'
  },
  categories: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'ServiceCategory'
  }],
  serviceAreas: [{
    city: String,
    areas: [String],
    pinCodes: [String]
  }],
  experience: {
    type: Number,
    default: 0
  },
  certifications: [{
    name: String,
    issuedBy: String,
    issuedDate: Date,
    expiryDate: Date,
    documentUrl: String
  }],
  skills: [String],
  rating: {
    type: Number,
    default: 0,
    min: 0,
    max: 5
  },
  totalReviews: {
    type: Number,
    default: 0
  },
  totalBookings: {
    type: Number,
    default: 0
  },
  completedBookings: {
    type: Number,
    default: 0
  },
  isVerified: {
    type: Boolean,
    default: false
  },
  verificationDocuments: [{
    documentType: {
      type: String,
      enum: ['pan', 'aadhaar', 'gst', 'trade_license', 'professional_certificate', 'address_proof']
    },
    documentUrl: String,
    documentNumber: String,
    status: {
      type: String,
      enum: ['pending', 'approved', 'rejected'],
      default: 'pending'
    },
    verifiedAt: Date,
    rejectionReason: String
  }],
  bankDetails: {
    accountNumber: String,
    ifscCode: String,
    bankName: String,
    accountHolderName: String
  },
  commissionRate: {
    type: Number,
    default: 15
  },
  isAvailable: {
    type: Boolean,
    default: true
  },
  workingHours: {
    monday: { open: String, close: String, isClosed: { type: Boolean, default: false } },
    tuesday: { open: String, close: String, isClosed: { type: Boolean, default: false } },
    wednesday: { open: String, close: String, isClosed: { type: Boolean, default: false } },
    thursday: { open: String, close: String, isClosed: { type: Boolean, default: false } },
    friday: { open: String, close: String, isClosed: { type: Boolean, default: false } },
    saturday: { open: String, close: String, isClosed: { type: Boolean, default: false } },
    sunday: { open: String, close: String, isClosed: { type: Boolean, default: false } }
  },
  wallet: {
    balance: { type: Number, default: 0 },
    lastUpdated: { type: Date, default: Date.now }
  },
  status: {
    type: String,
    enum: ['active', 'inactive', 'suspended', 'pending'],
    default: 'active'
  },
  rejectionReason: String,
  suspendedAt: Date,
  suspendedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

servicePartnerSchema.virtual('bookings', {
  ref: 'ServiceBooking',
  localField: '_id',
  foreignField: 'partner'
});

servicePartnerSchema.virtual('reviews', {
  ref: 'ServiceReview',
  localField: '_id',
  foreignField: 'partner'
});

servicePartnerSchema.virtual('userDetails', {
  ref: 'User',
  localField: 'user',
  foreignField: '_id',
  justOne: true
});

servicePartnerSchema.index({ user: 1 });
servicePartnerSchema.index({ categories: 1 });
servicePartnerSchema.index({ 'serviceAreas.city': 1 });
servicePartnerSchema.index({ isVerified: 1 });
servicePartnerSchema.index({ rating: -1 });
servicePartnerSchema.index({ status: 1 });
servicePartnerSchema.index({ isAvailable: 1 });

module.exports = mongoose.models.ServicePartner || mongoose.model('ServicePartner', servicePartnerSchema);

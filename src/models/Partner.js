const mongoose = require('mongoose');

const partnerSchema = new mongoose.Schema({
  phoneNumber: {
    type: String,
    required: true,
    unique: true,
    match: /^\+91[6-9]\d{9}$/
  },
  fullName: {
    type: String,
    required: true,
    trim: true,
    maxlength: 100
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true,
    match: /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  },
  address: {
    type: String,
    required: true,
    trim: true,
    maxlength: 500
  },
  city: {
    type: String,
    required: true,
    trim: true,
    maxlength: 50
  },
  state: {
    type: String,
    required: true,
    trim: true,
    maxlength: 50
  },
  pincode: {
    type: String,
    required: true,
    match: /^\d{6}$/
  },
  serviceCategories: [{
    type: String,
    required: true,
    enum: [
      'Cleaning', 'Plumbing', 'Electrical', 'Carpentry', 'Painting',
      'Pest Control', 'Appliance Repair', 'AC Service', 'Water Tank Cleaning',
      'Home Deep Cleaning', 'Kitchen Cleaning', 'Bathroom Cleaning',
      'Moving & Packing', 'Salon at Home', 'Massage Therapy', 'Fitness Trainer',
      'Yoga Instructor', 'Dance Teacher', 'Music Teacher', 'Tutor',
      'Car Repair', 'Bike Repair', 'Driver on Demand', 'Pet Care',
      'Event Management', 'Photography', 'Videography', 'Web Development'
    ]
  }],
  documents: [{
    type: String,
    required: true
  }],
  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected'],
    default: 'pending'
  },
  rejectionReason: {
    type: String,
    maxlength: 500
  },
  isAvailable: {
    type: Boolean,
    default: true
  },
  averageRating: {
    type: Number,
    min: 0,
    max: 5,
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
  cancelledBookings: {
    type: Number,
    default: 0
  },
  earnings: {
    type: Number,
    default: 0
  },
  lastActive: {
    type: Date,
    default: Date.now
  },
  approvedAt: {
    type: Date
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Indexes for better query performance
partnerSchema.index({ phoneNumber: 1 });
partnerSchema.index({ email: 1 });
partnerSchema.index({ status: 1 });
partnerSchema.index({ city: 1, state: 1 });
partnerSchema.index({ serviceCategories: 1 });
partnerSchema.index({ isAvailable: 1 });

// Virtual for completion rate
partnerSchema.virtual('completionRate').get(function () {
  if (this.totalBookings === 0) return 0;
  return ((this.completedBookings / this.totalBookings) * 100).toFixed(2);
});

// Virtual for approval status
partnerSchema.virtual('isApproved').get(function () {
  return this.status === 'approved';
});

// Pre-save middleware
partnerSchema.pre('save', function (next) {
  this.updatedAt = new Date();

  if (this.status === 'approved' && !this.approvedAt) {
    this.approvedAt = new Date();
  }

  next();
});

// Static methods
partnerSchema.statics.findByPhone = function (phoneNumber) {
  return this.findOne({ phoneNumber });
};

partnerSchema.statics.findAvailablePartners = function (city, serviceCategory) {
  return this.find({
    status: 'approved',
    isAvailable: true,
    city: city,
    serviceCategories: serviceCategory
  });
};

partnerSchema.statics.getTopPartners = function (limit = 10) {
  return this.find({ status: 'approved' })
    .sort({ averageRating: -1, completedBookings: -1 })
    .limit(limit);
};

// Instance methods
partnerSchema.methods.updateStats = async function (bookingStatus) {
  if (bookingStatus === 'completed') {
    this.completedBookings += 1;
    this.earnings += 100; // Default earning per booking (should be calculated based on actual booking)
  } else if (bookingStatus === 'cancelled') {
    this.cancelledBookings += 1;
  }

  this.totalBookings += 1;
  this.lastActive = new Date();

  return this.save();
};

partnerSchema.methods.updateRating = async function (newRating) {
  // This would typically calculate average based on all reviews
  // For now, simple update
  this.averageRating = ((this.averageRating * this.completedBookings) + newRating) / (this.completedBookings + 1);
  return this.save();
};

partnerSchema.methods.toJSON = function () {
  const partner = this.toObject();
  delete partner.documents; // Don't expose document paths in JSON
  return partner;
};

const Partner = mongoose.model('Partner', partnerSchema);

module.exports = Partner;

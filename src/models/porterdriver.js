const mongoose = require('mongoose');

const porterDriverSchema = new mongoose.Schema({
  user_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'User ID is required']
  },
  name: {
    type: String,
    required: [true, 'Driver name is required'],
    trim: true
  },
  phone: {
    type: String,
    required: [true, 'Phone number is required'],
    trim: true
  },
  email: {
    type: String,
    trim: true
  },
  license_number: {
    type: String,
    required: [true, 'License number is required'],
    trim: true
  },
  status: {
    type: String,
    enum: ['active', 'inactive', 'offline'],
    default: 'active'
  },
  rating: {
    type: Number,
    min: 0,
    max: 5,
    default: 0
  },
  total_deliveries: {
    type: Number,
    default: 0
  },
  current_location: {
    latitude: Number,
    longitude: Number,
    address: String
  },
  is_active: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Virtual for user relationship
porterDriverSchema.virtual('user', {
  ref: 'User',
  localField: 'user_id',
  foreignField: '_id',
  justOne: true
});

// Virtual for vehicles relationship (one-to-many)
porterDriverSchema.virtual('vehicles', {
  ref: 'PorterVehicle',
  localField: '_id',
  foreignField: 'driver_id'
});

// Indexes for efficient queries
porterDriverSchema.index({ user_id: 1 });
porterDriverSchema.index({ status: 1 });
porterDriverSchema.index({ is_active: 1 });
porterDriverSchema.index({ license_number: 1 });

module.exports = mongoose.models.PorterDriver || mongoose.model('PorterDriver', porterDriverSchema); 
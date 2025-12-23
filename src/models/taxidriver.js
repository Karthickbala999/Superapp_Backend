const mongoose = require('mongoose');

const taxiDriverSchema = new mongoose.Schema({
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
  vehicle_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'TaxiVehicle'
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
  total_rides: {
    type: Number,
    default: 0
  },
  current_rides: {
    type: Number,
    default: 0
  },
  last_assignment: {
    type: Date
  },
  is_available: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

taxiDriverSchema.virtual('user', {
  ref: 'User',
  localField: 'user_id',
  foreignField: '_id',
  justOne: true
});

taxiDriverSchema.virtual('vehicle', {
  ref: 'TaxiVehicle',
  localField: 'vehicle_id',
  foreignField: '_id',
  justOne: true
});

taxiDriverSchema.index({ user_id: 1 });
taxiDriverSchema.index({ vehicle_id: 1 });
taxiDriverSchema.index({ status: 1 });
taxiDriverSchema.index({ license_number: 1 });

const TaxiDriver = mongoose.model('TaxiDriver', taxiDriverSchema);

module.exports = TaxiDriver;
const mongoose = require('mongoose');

const porterBookingSchema = new mongoose.Schema({
  user_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  driver_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'PorterDriver',
    required: true
  },
  vehicle_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'PorterVehicle',
    required: true
  },
  pickup_location: {
    address: {
      type: String,
      required: true
    },
    latitude: Number,
    longitude: Number
  },
  dropoff_location: {
    address: {
      type: String,
      required: true
    },
    latitude: Number,
    longitude: Number
  },
  vehicle_type: {
    type: String,
    required: true,
    enum: ['Bike', 'Auto', 'Mini-Truck']
  },
  distance: {
    type: Number, // in kilometers
    required: false,
    default: 0
  },
  fare: {
    type: Number,
    required: false,
    default: 0
  },
  status: {
    type: String,
    enum: ['pending', 'assigned', 'picked_up', 'in_transit', 'delivered', 'completed', 'cancelled'],
    default: 'pending'
  },
  payment_method: {
    type: String,
    enum: ['cash', 'card', 'upi', 'wallet', 'razorpay', 'phonepay', 'paytm', 'amazonpay', 'credit_card', 'debit_card', 'net_banking'],
    default: 'cash'
  },
  payment_status: {
    type: String,
    enum: ['pending', 'completed', 'failed'],
    default: 'pending'
  },
  item_description: {
    type: String,
    trim: true
  },
  item_weight: {
    type: Number, // in kg
    default: 0
  },
  special_instructions: {
    type: String,
    trim: true
  },
  assigned_at: Date,
  picked_up_at: Date,
  delivered_at: Date,
  completed_at: Date,
  cancelled_at: Date,
  cancellation_reason: String,
  rating: {
    type: Number,
    min: 1,
    max: 5
  },
  review: {
    type: String,
    trim: true
  },
  is_active: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

// Virtual for driver relationship
porterBookingSchema.virtual('driver', {
  ref: 'PorterDriver',
  localField: 'driver_id',
  foreignField: '_id',
  justOne: true
});

// Virtual for vehicle relationship
porterBookingSchema.virtual('vehicle', {
  ref: 'PorterVehicle',
  localField: 'vehicle_id',
  foreignField: '_id',
  justOne: true
});

// Virtual for user relationship
porterBookingSchema.virtual('user', {
  ref: 'User',
  localField: 'user_id',
  foreignField: '_id',
  justOne: true
});

// Virtual for booking duration
porterBookingSchema.virtual('duration').get(function() {
  if (this.completed_at && this.createdAt) {
    return Math.round((this.completed_at - this.createdAt) / (1000 * 60)); // minutes
  }
  return null;
});

// Ensure virtuals are serialized
porterBookingSchema.set('toJSON', { virtuals: true });
porterBookingSchema.set('toObject', { virtuals: true });

// Indexes for efficient queries
porterBookingSchema.index({ user_id: 1, createdAt: -1 });
porterBookingSchema.index({ driver_id: 1, createdAt: -1 });
porterBookingSchema.index({ vehicle_id: 1, createdAt: -1 });
porterBookingSchema.index({ status: 1 });
porterBookingSchema.index({ payment_status: 1 });
porterBookingSchema.index({ is_active: 1 });

module.exports = mongoose.models.PorterBooking || mongoose.model('PorterBooking', porterBookingSchema); 
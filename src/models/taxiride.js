const mongoose = require('mongoose');

const taxiRideSchema = new mongoose.Schema({
  user_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'User ID is required']
  },
  driver_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'TaxiDriver',
    required: [true, 'Driver ID is required']
  },
  vehicle_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'TaxiVehicle',
    required: [true, 'Vehicle ID is required']
  },
  pickup_location: {
    address: String,
    latitude: Number,
    longitude: Number
  },
  dropoff_location: {
    address: String,
    latitude: Number,
    longitude: Number
  },
  distance: {
    type: Number,
    min: 0
  },
  duration: {
    type: Number,
    min: 0
  },
  fare: {
    type: Number,
    required: [true, 'Fare is required'],
    min: 0
  },
  status: {
    type: String,
    enum: ['pending', 'accepted', 'started', 'completed', 'cancelled'],
    default: 'pending'
  },
  payment_status: {
    type: String,
    enum: ['pending', 'paid', 'failed'],
    default: 'pending'
  },
  payment_method: {
    type: String,
    enum: ['cash', 'card', 'upi', 'razorpay', 'phonepay', 'paytm', 'amazonpay', 'credit_card', 'debit_card', 'net_banking'],
    default: 'cash'
  },
  rating: {
    type: Number,
    min: 1,
    max: 5
  },
  review: {
    type: String,
    trim: true
  },
  scheduled_time: {
    type: Date
  },
  started_at: {
    type: Date
  },
  completed_at: {
    type: Date
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

taxiRideSchema.virtual('user', {
  ref: 'User',
  localField: 'user_id',
  foreignField: '_id',
  justOne: true
});

taxiRideSchema.virtual('driver', {
  ref: 'TaxiDriver',
  localField: 'driver_id',
  foreignField: '_id',
  justOne: true
});

taxiRideSchema.virtual('vehicle', {
  ref: 'TaxiVehicle',
  localField: 'vehicle_id',
  foreignField: '_id',
  justOne: true
});

taxiRideSchema.index({ user_id: 1 });
taxiRideSchema.index({ driver_id: 1 });
taxiRideSchema.index({ vehicle_id: 1 });
taxiRideSchema.index({ status: 1 });
taxiRideSchema.index({ payment_status: 1 });
taxiRideSchema.index({ createdAt: -1 });

const TaxiRide = mongoose.model('TaxiRide', taxiRideSchema);

module.exports = TaxiRide;
const mongoose = require('mongoose');

const taxiVehicleSchema = new mongoose.Schema({
  driver_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'TaxiDriver',
    required: [true, 'Driver ID is required']
  },
  vehicle_number: {
    type: String,
    required: [true, 'Vehicle number is required'],
    unique: true,
    trim: true
  },
  model: {
    type: String,
    required: [true, 'Vehicle model is required'],
    trim: true
  },
  make: {
    type: String,
    required: [true, 'Vehicle make is required'],
    trim: true
  },
  year: {
    type: Number,
    min: 1900,
    max: new Date().getFullYear() + 1
  },
  color: {
    type: String,
    trim: true
  },
  capacity: {
    type: Number,
    min: 1,
    default: 4
  },
  status: {
    type: String,
    enum: ['active', 'maintenance', 'inactive'],
    default: 'active'
  },
  insurance_expiry: {
    type: Date
  },
  registration_expiry: {
    type: Date
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

taxiVehicleSchema.virtual('driver', {
  ref: 'TaxiDriver',
  localField: 'driver_id',
  foreignField: '_id',
  justOne: true
});

taxiVehicleSchema.index({ driver_id: 1 });
taxiVehicleSchema.index({ status: 1 });

const TaxiVehicle = mongoose.model('TaxiVehicle', taxiVehicleSchema);

module.exports = TaxiVehicle;
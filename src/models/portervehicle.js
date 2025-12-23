const mongoose = require('mongoose');

const porterVehicleSchema = new mongoose.Schema({
  driver_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'PorterDriver',
    required: false // Temporarily make optional for development
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
  vehicle_type: {
    type: String,
    required: [true, 'Vehicle type is required'],
    enum: ['Bike', 'Auto', 'Mini-Truck']
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
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

porterVehicleSchema.virtual('driver', {
  ref: 'PorterDriver',
  localField: 'driver_id',
  foreignField: '_id',
  justOne: true
});

porterVehicleSchema.index({ driver_id: 1 });
porterVehicleSchema.index({ status: 1 });
porterVehicleSchema.index({ vehicle_type: 1 });

module.exports = mongoose.models.PorterVehicle || mongoose.model('PorterVehicle', porterVehicleSchema); 
const mongoose = require('mongoose');

const roomSchema = new mongoose.Schema({
  hotel_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Hotel',
    required: [true, 'Hotel ID is required']
  },
  name: {
    type: String,
    required: [true, 'Room name is required'],
    trim: true
  },
  description: {
    type: String,
    trim: true
  },
  type: {
    type: String,
    required: [true, 'Room type is required'],
    enum: ['single', 'double', 'triple', 'suite', 'deluxe', 'presidential']
  },
  capacity: {
    type: Number,
    required: [true, 'Room capacity is required'],
    min: 1
  },
  price_per_night: {
    type: Number,
    required: [true, 'Price per night is required'],
    min: 0
  },
  discount_percentage: {
    type: Number,
    min: 0,
    max: 100,
    default: 0
  },
  amenities: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Amenity'
  }],
  images: [{
    type: String
  }],
  main_image: {
    type: String
  },
  size: {
    type: Number,
    min: 0
  },
  floor: {
    type: Number,
    min: 0
  },
  room_number: {
    type: String,
    trim: true
  },
  status: {
    type: String,
    enum: ['available', 'occupied', 'maintenance', 'reserved'],
    default: 'available'
  },
  is_smoking_allowed: {
    type: Boolean,
    default: false
  },
  has_balcony: {
    type: Boolean,
    default: false
  },
  has_sea_view: {
    type: Boolean,
    default: false
  },
  has_mountain_view: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

roomSchema.virtual('hotel', {
  ref: 'Hotel',
  localField: 'hotel_id',
  foreignField: '_id',
  justOne: true
});

roomSchema.virtual('bookings', {
  ref: 'Booking',
  localField: '_id',
  foreignField: 'room_id'
});



roomSchema.index({ hotel_id: 1 });
roomSchema.index({ status: 1 });
roomSchema.index({ type: 1 });
roomSchema.index({ price_per_night: 1 });
roomSchema.index({ room_number: 1 });

const Room = mongoose.models.Room || mongoose.model('Room', roomSchema);

module.exports = Room; 
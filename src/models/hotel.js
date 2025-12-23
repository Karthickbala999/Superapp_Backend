const mongoose = require('mongoose');

const hotelSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Hotel name is required'],
    trim: true
  },
  description: {
    type: String,
    trim: true
  },
  address: {
    street: String,
    city: String,
    state: String,
    country: String,
    postal_code: String,
    latitude: Number,
    longitude: Number
  },
  phone: {
    type: String,
    trim: true
  },
  email: {
    type: String,
    trim: true
  },
  website: {
    type: String,
    trim: true
  },
  rating: {
    type: Number,
    min: 0,
    max: 5,
    default: 0
  },
  total_reviews: {
    type: Number,
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
  star_rating: {
    type: Number,
    min: 1,
    max: 5
  },
  check_in_time: {
    type: String,
    default: '14:00'
  },
  check_out_time: {
    type: String,
    default: '12:00'
  },
  policies: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Policy'
  }],
  status: {
    type: String,
    enum: ['active', 'inactive', 'maintenance'],
    default: 'active'
  },
  owner_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

hotelSchema.virtual('owner', {
  ref: 'User',
  localField: 'owner_id',
  foreignField: '_id',
  justOne: true
});

hotelSchema.virtual('rooms', {
  ref: 'Room',
  localField: '_id',
  foreignField: 'hotel_id'
});

hotelSchema.index({ name: 1 });
hotelSchema.index({ status: 1 });
hotelSchema.index({ 'address.city': 1 });
hotelSchema.index({ rating: -1 });
hotelSchema.index({ owner_id: 1 });

const Hotel = mongoose.models.Hotel || mongoose.model('Hotel', hotelSchema);

module.exports = Hotel; 
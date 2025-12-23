const mongoose = require('mongoose');

const locationSchema = new mongoose.Schema({
  hotel_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Hotel',
    required: [true, 'Hotel ID is required']
  },
  address: {
    type: String,
    trim: true
  },
  city: {
    type: String,
    trim: true
  },
  state: {
    type: String,
    trim: true
  },
  country: {
    type: String,
    trim: true
  },
  pincode: {
    type: String,
    trim: true
  },
  latitude: {
    type: Number
  },
  longitude: {
    type: Number
  },
  status: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

locationSchema.virtual('hotel', {
  ref: 'Hotel',
  localField: 'hotel_id',
  foreignField: '_id',
  justOne: true
});

locationSchema.index({ hotel_id: 1 });
locationSchema.index({ status: 1 });

const Location = mongoose.models.Location || mongoose.model('Location', locationSchema);

module.exports = Location; 
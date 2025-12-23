const mongoose = require('mongoose');

const amenitySchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Amenity name is required'],
    trim: true
  },
  description: {
    type: String,
    trim: true
  },
  icon: {
    type: String
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

amenitySchema.index({ name: 1 });
amenitySchema.index({ status: 1 });

const Amenity = mongoose.models.Amenity || mongoose.model('Amenity', amenitySchema);

module.exports = Amenity; 
const mongoose = require('mongoose');

const sizeSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Size name is required'],
    trim: true
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

sizeSchema.index({ name: 1 });
sizeSchema.index({ status: 1 });

const Size = mongoose.model('Size', sizeSchema);

module.exports = Size; 
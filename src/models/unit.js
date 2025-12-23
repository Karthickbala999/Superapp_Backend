const mongoose = require('mongoose');

const unitSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Unit name is required'],
    trim: true
  },
  symbol: {
    type: String,
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

unitSchema.index({ name: 1 });
unitSchema.index({ status: 1 });

const Unit = mongoose.model('Unit', unitSchema);

module.exports = Unit; 
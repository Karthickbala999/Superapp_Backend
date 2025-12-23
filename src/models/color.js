const mongoose = require('mongoose');

const colorSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Color name is required'],
    trim: true
  },
  hex: {
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

colorSchema.index({ name: 1 });
colorSchema.index({ status: 1 });

const Color = mongoose.model('Color', colorSchema);

module.exports = Color; 
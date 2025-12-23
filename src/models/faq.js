const mongoose = require('mongoose');

const faqSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'FAQ title is required'],
    trim: true
  },
  description: {
    type: String,
    required: [true, 'FAQ description is required'],
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

faqSchema.index({ title: 1 });
faqSchema.index({ status: 1 });
faqSchema.index({ createdAt: -1 });

const FAQ = mongoose.model('FAQ', faqSchema);

module.exports = FAQ; 
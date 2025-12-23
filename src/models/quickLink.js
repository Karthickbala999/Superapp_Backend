const mongoose = require('mongoose');

const quickLinkSchema = new mongoose.Schema({
  product_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: true
  },
  display_order: {
    type: Number,
    default: 0,
    required: true
  },
  is_active: {
    type: Boolean,
    default: true
  },
  created_at: {
    type: Date,
    default: Date.now
  },
  updated_at: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Index for efficient queries
quickLinkSchema.index({ is_active: 1, display_order: 1 });
quickLinkSchema.index({ product_id: 1 });

// Pre-save middleware to update updated_at
quickLinkSchema.pre('save', function(next) {
  this.updated_at = new Date();
  next();
});

module.exports = mongoose.model('QuickLink', quickLinkSchema);

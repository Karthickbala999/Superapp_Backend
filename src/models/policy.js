const mongoose = require('mongoose');

const policySchema = new mongoose.Schema({
  hotel_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Hotel',
    required: false
  },
  title: {
    type: String,
    required: [true, 'Policy title is required'],
    trim: true
  },
  description: {
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

policySchema.virtual('hotel', {
  ref: 'Hotel',
  localField: 'hotel_id',
  foreignField: '_id',
  justOne: true
});

policySchema.index({ hotel_id: 1 });
policySchema.index({ status: 1 });

const Policy = mongoose.models.Policy || mongoose.model('Policy', policySchema);

module.exports = Policy; 
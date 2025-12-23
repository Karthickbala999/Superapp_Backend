const mongoose = require('mongoose');

const staffSchema = new mongoose.Schema({
  user_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'User ID is required']
  },
  department: {
    type: String,
    required: [true, 'Department is required'],
    trim: true
  },
  position: {
    type: String,
    required: [true, 'Position is required'],
    trim: true
  },
  hire_date: {
    type: Date,
    default: null
  },
  salary: {
    type: Number,
    default: null
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

staffSchema.virtual('user', {
  ref: 'User',
  localField: 'user_id',
  foreignField: '_id',
  justOne: true
});

staffSchema.index({ user_id: 1 });
staffSchema.index({ status: 1 });

const Staff = mongoose.model('Staff', staffSchema);

module.exports = Staff; 
const mongoose = require('mongoose');

const otpSchema = new mongoose.Schema({
  user_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'User ID is required']
  },
  otp: {
    type: String,
    required: [true, 'OTP is required'],
    minlength: 6,
    maxlength: 6
  },
  type: {
    type: String,
    enum: ['email', 'phone', 'reset_password'],
    default: 'email'
  },
  expires_at: {
    type: Date,
    required: [true, 'Expiration time is required']
  },
  is_used: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Virtual for user relationship
otpSchema.virtual('user', {
  ref: 'User',
  localField: 'user_id',
  foreignField: '_id',
  justOne: true
});

// Indexes for better query performance
otpSchema.index({ user_id: 1 });
otpSchema.index({ expires_at: 1 });
otpSchema.index({ is_used: 1 });

// Method to check if OTP is expired
otpSchema.methods.isExpired = function() {
  return new Date() > this.expires_at;
};

const OTP = mongoose.model('OTP', otpSchema);

module.exports = OTP; 
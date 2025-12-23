const mongoose = require('mongoose');

const otpSchema = new mongoose.Schema({
  phoneNumber: {
    type: String,
    required: true,
    match: /^\+91[6-9]\d{9}$/
  },
  otp: {
    type: String,
    required: true,
    length: 6
  },
  isUsed: {
    type: Boolean,
    default: false
  },
  expiresAt: {
    type: Date,
    required: true,
    default: Date.now,
    expires: 600 // 10 minutes TTL
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Index for faster lookups
otpSchema.index({ phoneNumber: 1, isUsed: 1 });
otpSchema.index({ expiresAt: 1 });

// Static method to find and validate OTP
otpSchema.statics.validateOTP = async function(phoneNumber, otp) {
  const otpRecord = await this.findOne({
    phoneNumber,
    otp,
    isUsed: false,
    expiresAt: { $gt: new Date() }
  });

  if (!otpRecord) {
    return null;
  }

  // Mark as used
  otpRecord.isUsed = true;
  await otpRecord.save();

  return otpRecord;
};

// Static method to cleanup expired OTPs
otpSchema.statics.cleanupExpired = async function() {
  const result = await this.deleteMany({
    expiresAt: { $lt: new Date() }
  });
  console.log(`Cleaned up ${result.deletedCount} expired OTPs`);
  return result;
};

// Pre-save middleware
otpSchema.pre('save', function(next) {
  // Ensure expiresAt is 10 minutes from now
  if (!this.expiresAt || this.expiresAt <= new Date()) {
    this.expiresAt = new Date(Date.now() + 10 * 60 * 1000);
  }
  next();
});

const UrbanOTP = mongoose.model('UrbanOTP', otpSchema);

module.exports = UrbanOTP;

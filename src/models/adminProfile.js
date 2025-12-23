const mongoose = require('mongoose');

const adminProfileSchema = new mongoose.Schema({
  business_name: {
    type: String,
    trim: true
  },
  name: {
    type: String,
    trim: true
  },
  email: {
    type: String,
    trim: true,
    lowercase: true
  },
  mobile_number: {
    type: String,
    trim: true
  },
  logo: {
    type: String
  },
  district_city: {
    type: String,
    trim: true
  },
  state: {
    type: String,
    trim: true
  },
  country: {
    type: String,
    trim: true
  },
  pincode: {
    type: String,
    trim: true
  },
  gst_number: {
    type: String,
    trim: true
  },
  facebook: {
    type: String,
    trim: true
  },
  instagram: {
    type: String,
    trim: true
  },
  linkedin: {
    type: String,
    trim: true
  },
  pintrest: {
    type: String,
    trim: true
  },
  youtube: {
    type: String,
    trim: true
  },
  twitter: {
    type: String,
    trim: true
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

const AdminProfile = mongoose.model('AdminProfile', adminProfileSchema);

module.exports = AdminProfile;


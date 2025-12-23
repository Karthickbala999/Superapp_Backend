const mongoose = require('mongoose');

const SavedAddressSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  label: String,
  address: String,
  lat: Number,
  lng: Number
});

module.exports = mongoose.model('SavedAddress', SavedAddressSchema); 
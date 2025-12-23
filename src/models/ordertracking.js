const mongoose = require('mongoose');

const OrderTrackingSchema = new mongoose.Schema({
  order: { type: mongoose.Schema.Types.ObjectId, ref: 'PorterOrder', required: true },
  porterLat: Number,
  porterLng: Number,
  speed: Number,
  accuracy: Number,
  timestamp: { type: Date, default: Date.now }
});

module.exports = mongoose.model('OrderTracking', OrderTrackingSchema); 
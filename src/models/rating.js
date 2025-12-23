const mongoose = require('mongoose');

const RatingSchema = new mongoose.Schema({
  order: { type: mongoose.Schema.Types.ObjectId, ref: 'PorterOrder', required: true },
  customer: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  porter: { type: mongoose.Schema.Types.ObjectId, ref: 'Porter', required: true },
  stars: { type: Number, min: 1, max: 5, required: true },
  comment: String,
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Rating', RatingSchema); 
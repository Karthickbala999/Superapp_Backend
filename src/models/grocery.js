const mongoose = require('mongoose');

const grocerySchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Grocery name is required'],
    trim: true
  },
  description: {
    type: String,
    trim: true
  },
  original_price: {
    type: Number,
    min: 0
  },
  discounted_price: {
    type: Number,
    min: 0
  },
  image: {
    type: String
  },
  rating: {
    type: Number,
    min: 0,
    max: 5,
    default: 0
  },
  is_best_seller: {
    type: Boolean,
    default: false
  },
  quantity: {
    type: Number,
    min: 0,
    default: 0
  },
  category: {
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

grocerySchema.index({ name: 1 });
grocerySchema.index({ category: 1 });
grocerySchema.index({ status: 1 });
grocerySchema.index({ is_best_seller: 1 });
grocerySchema.index({ rating: -1 });

const Grocery = mongoose.model('Grocery', grocerySchema);

module.exports = Grocery;

const mongoose = require('mongoose');

const restaurantCategorySchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Category name is required'],
    trim: true
  },
  slug: {
    type: String,
    required: [true, 'Slug is required'],
    unique: true,
    lowercase: true,
    trim: true
  },
  description: {
    type: String,
    trim: true
  },
  image: {
    type: String
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

restaurantCategorySchema.index({ status: 1 });

const RestaurantCategory = mongoose.model('RestaurantCategory', restaurantCategorySchema);

module.exports = RestaurantCategory;
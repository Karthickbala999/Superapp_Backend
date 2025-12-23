const mongoose = require('mongoose');

const dishSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Dish name is required'],
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
  restaurant_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Restaurant',
    required: [true, 'Restaurant is required']
  },
  price: {
    type: Number,
    required: [true, 'Price is required'],
    min: [0, 'Price cannot be negative']
  },
  // ✅ Enhanced fields for food delivery
  original_price: {
    type: Number,
    min: [0, 'Original price cannot be negative']
  },
  category: {
    type: String,
    trim: true,
    enum: ['north-indian', 'south-indian', 'chinese', 'italian', 'mexican', 'thai', 'desserts', 'beverages', 'appetizers', 'main-course', 'street-food', 'hyderabadi'],
    default: 'main-course'
  },
  preparation_time: {
    type: String,
    default: '15-20 mins'
  },
  rating: {
    type: Number,
    min: 0,
    max: 5,
    default: 0
  },
  reviews_count: {
    type: Number,
    default: 0
  },
  is_veg: {
    type: Boolean,
    default: true
  },
  is_bestseller: {
    type: Boolean,
    default: false
  },
  is_trending: {
    type: Boolean,
    default: false
  },
  trending_rank: {
    type: Number,
    min: 1
  },
  spice_level: {
    type: String,
    enum: ['mild', 'medium', 'spicy', 'very-spicy'],
    default: 'medium'
  },
  serves: {
    type: Number,
    min: 1,
    default: 1
  },
  calories: {
    type: Number,
    min: 0
  },
  ingredients: [{
    type: String,
    trim: true
  }],
  allergens: [{
    type: String,
    trim: true
  }],
  nutritional_info: {
    protein: Number,
    carbs: Number,
    fat: Number,
    fiber: Number
  },
  availability: {
    type: Boolean,
    default: true
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

dishSchema.virtual('restaurant', {
  ref: 'Restaurant',
  localField: 'restaurant_id',
  foreignField: '_id',
  justOne: true
});

// Virtual for discount percentage
dishSchema.virtual('discount_percentage').get(function() {
  if (this.original_price && this.original_price > this.price) {
    return Math.round(((this.original_price - this.price) / this.original_price) * 100);
  }
  return 0;
});

dishSchema.index({ restaurant_id: 1 });
dishSchema.index({ category: 1 });
dishSchema.index({ rating: -1 });
dishSchema.index({ is_veg: 1 });
dishSchema.index({ is_bestseller: 1 });
dishSchema.index({ price: 1 });

const Dish = mongoose.model('Dish', dishSchema);

module.exports = Dish;
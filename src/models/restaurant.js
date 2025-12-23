const mongoose = require('mongoose');

const restaurantSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Restaurant name is required'],
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
  category_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'RestaurantCategory',
    required: [true, 'Category is required']
  },
  // ✅ Enhanced fields for food delivery
  rating: {
    type: Number,
    min: 0,
    max: 5,
    default: 0
  },
  ratings_count: {
    type: Number,
    default: 0
  },
  delivery_time: {
    type: String,
    default: '30-45 mins'
  },
  distance: {
    type: String,
    default: '2-3 km'
  },
  minimum_order: {
    type: Number,
    default: 100
  },
  delivery_fee: {
    type: Number,
    default: 0
  },
  cuisines: [{
    type: String,
    trim: true
  }],
  location: {
    area: {
      type: String,
      trim: true
    },
    city: {
      type: String,
      trim: true,
      default: 'Mumbai'
    },
    latitude: {
      type: Number
    },
    longitude: {
      type: Number
    }
  },
  address: {
    type: String,
    trim: true
  },
  phone: {
    type: String,
    trim: true
  },
  email: {
    type: String,
    trim: true
  },
  opening_hours: {
    type: String,
    default: '9:00 AM - 11:00 PM'
  },
  offers: [{
    title: String,
    description: String,
    discount_percentage: Number,
    min_order_amount: Number
  }],
  status: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

restaurantSchema.virtual('category', {
  ref: 'RestaurantCategory',
  localField: 'category_id',
  foreignField: '_id',
  justOne: true
});

// Virtual for dishes
restaurantSchema.virtual('dishes', {
  ref: 'Dish',
  localField: '_id',
  foreignField: 'restaurant_id'
});

restaurantSchema.index({ 'location.city': 1 });
restaurantSchema.index({ rating: -1 });
restaurantSchema.index({ cuisines: 1 });

const Restaurant = mongoose.model('Restaurant', restaurantSchema);

module.exports = Restaurant;
const mongoose = require('mongoose');

const foodCartItemSchema = new mongoose.Schema({
  cart_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'FoodCart',
    required: [true, 'Cart ID is required']
  },
  dish_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Dish',
    required: [true, 'Dish ID is required']
  },
  restaurant_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Restaurant',
    required: [true, 'Restaurant ID is required']
  },
  quantity: {
    type: Number,
    required: [true, 'Quantity is required'],
    min: [1, 'Quantity must be at least 1'],
    default: 1
  },
  price: {
    type: Number,
    required: [true, 'Price is required'],
    min: [0, 'Price cannot be negative']
  },
  original_price: {
    type: Number,
    min: [0, 'Original price cannot be negative']
  },
  total_price: {
    type: Number,
    required: [true, 'Total price is required'],
    min: [0, 'Total price cannot be negative']
  },
  // Customizations for the dish
  customizations: [{
    type: {
      type: String,
      enum: ['spice_level', 'size', 'add_on', 'remove_item', 'special_request']
    },
    name: String,
    value: String,
    price: {
      type: Number,
      default: 0
    }
  }],
  special_instructions: {
    type: String,
    trim: true
  },
  // Cache dish details for faster access
  dish_snapshot: {
    name: String,
    description: String,
    image: String,
    category: String,
    is_veg: Boolean,
    spice_level: String,
    preparation_time: String,
    rating: Number
  },
  // Track when this item was added to cart
  added_at: {
    type: Date,
    default: Date.now
  },
  // Track when this item was last updated
  updated_at: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Virtual for cart relationship
foodCartItemSchema.virtual('cart', {
  ref: 'FoodCart',
  localField: 'cart_id',
  foreignField: '_id',
  justOne: true
});

// Virtual for dish relationship
foodCartItemSchema.virtual('dish', {
  ref: 'Dish',
  localField: 'dish_id',
  foreignField: '_id',
  justOne: true
});

// Virtual for restaurant relationship
foodCartItemSchema.virtual('restaurant', {
  ref: 'Restaurant',
  localField: 'restaurant_id',
  foreignField: '_id',
  justOne: true
});

// Virtual for discount percentage
foodCartItemSchema.virtual('discount_percentage').get(function() {
  if (this.original_price && this.original_price > this.price) {
    return Math.round(((this.original_price - this.price) / this.original_price) * 100);
  }
  return 0;
});

// Middleware to update timestamps
foodCartItemSchema.pre('save', function(next) {
  this.updated_at = new Date();
  if (this.isNew) {
    this.added_at = new Date();
  }
  next();
});

// Middleware to calculate total_price before saving
foodCartItemSchema.pre('save', function(next) {
  let itemPrice = this.price;
  
  // Add customization prices
  if (this.customizations && this.customizations.length > 0) {
    const customizationPrice = this.customizations.reduce((sum, custom) => {
      return sum + (custom.price || 0);
    }, 0);
    itemPrice += customizationPrice;
  }
  
  this.total_price = itemPrice * this.quantity;
  next();
});

// Indexes for performance
foodCartItemSchema.index({ cart_id: 1 });
foodCartItemSchema.index({ dish_id: 1 });
foodCartItemSchema.index({ restaurant_id: 1 });
foodCartItemSchema.index({ added_at: -1 });

// Compound index for uniqueness (one dish per cart with same customizations)
foodCartItemSchema.index({ cart_id: 1, dish_id: 1, customizations: 1 }, { unique: true });

const FoodCartItem = mongoose.model('FoodCartItem', foodCartItemSchema);

module.exports = FoodCartItem; 
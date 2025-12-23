const mongoose = require('mongoose');

const foodOrderItemSchema = new mongoose.Schema({
  order_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'FoodOrder',
    required: [true, 'Order ID is required']
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
    min: [1, 'Quantity must be at least 1']
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
  // Dish snapshot for historical reference (in case dish details change)
  dish_snapshot: {
    name: String,
    description: String,
    image: String,
    category: String,
    is_veg: Boolean,
    spice_level: String,
    preparation_time: String
  },
  // Item status (useful for restaurant kitchen management)
  item_status: {
    type: String,
    enum: ['ordered', 'preparing', 'ready', 'served'],
    default: 'ordered'
  },
  preparation_time: {
    type: String
  },
  // Nutritional tracking
  calories_per_item: {
    type: Number
  },
  total_calories: {
    type: Number
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Virtual for order relationship
foodOrderItemSchema.virtual('order', {
  ref: 'FoodOrder',
  localField: 'order_id',
  foreignField: '_id',
  justOne: true
});

// Virtual for dish relationship
foodOrderItemSchema.virtual('dish', {
  ref: 'Dish',
  localField: 'dish_id',
  foreignField: '_id',
  justOne: true
});

// Virtual for restaurant relationship
foodOrderItemSchema.virtual('restaurant', {
  ref: 'Restaurant',
  localField: 'restaurant_id',
  foreignField: '_id',
  justOne: true
});

// Virtual for discount percentage
foodOrderItemSchema.virtual('discount_percentage').get(function() {
  if (this.original_price && this.original_price > this.price) {
    return Math.round(((this.original_price - this.price) / this.original_price) * 100);
  }
  return 0;
});

// Indexes for performance
foodOrderItemSchema.index({ order_id: 1 });
foodOrderItemSchema.index({ dish_id: 1 });
foodOrderItemSchema.index({ restaurant_id: 1 });
foodOrderItemSchema.index({ item_status: 1 });

const FoodOrderItem = mongoose.model('FoodOrderItem', foodOrderItemSchema);

module.exports = FoodOrderItem; 
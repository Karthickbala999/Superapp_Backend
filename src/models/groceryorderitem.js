const mongoose = require('mongoose');

const groceryOrderItemSchema = new mongoose.Schema({
  order_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'GroceryOrder',
    required: [true, 'Order ID is required']
  },
  product_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Grocery',
    required: [true, 'Product ID is required']
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
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

groceryOrderItemSchema.virtual('order', {
  ref: 'GroceryOrder',
  localField: 'order_id',
  foreignField: '_id',
  justOne: true
});

groceryOrderItemSchema.virtual('product', {
  ref: 'Grocery',
  localField: 'product_id',
  foreignField: '_id',
  justOne: true
});

groceryOrderItemSchema.index({ order_id: 1 });
groceryOrderItemSchema.index({ product_id: 1 });

// Safe export pattern
module.exports = mongoose.models.GroceryOrderItem || mongoose.model('GroceryOrderItem', groceryOrderItemSchema); 
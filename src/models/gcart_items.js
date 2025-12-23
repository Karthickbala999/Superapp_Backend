const mongoose = require('mongoose');

const gCartItemSchema = new mongoose.Schema({
  user_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'User ID is required']
  },
  grocery_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Grocery',
    required: [true, 'Grocery ID is required']
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
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

gCartItemSchema.virtual('user', {
  ref: 'User',
  localField: 'user_id',
  foreignField: '_id',
  justOne: true
});

gCartItemSchema.virtual('grocery', {
  ref: 'Grocery',
  localField: 'grocery_id',
  foreignField: '_id',
  justOne: true
});

gCartItemSchema.index({ user_id: 1 });
gCartItemSchema.index({ grocery_id: 1 });

const GCartItem = mongoose.model('GCartItem', gCartItemSchema);

module.exports = GCartItem;

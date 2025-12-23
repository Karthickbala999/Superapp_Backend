const mongoose = require('mongoose');

const groceryOrderSchema = new mongoose.Schema({
  user_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'User ID is required']
  },
  order_number: {
    type: String,
    required: [true, 'Order number is required'],
    unique: true
  },
  status: {
    type: String,
    enum: ['pending', 'confirmed', 'processing', 'delivered', 'cancelled'],
    default: 'pending'
  },
  total_amount: {
    type: Number,
    required: [true, 'Total amount is required'],
    min: [0, 'Total amount cannot be negative']
  },
  address: {
    type: String,
    trim: true
  },
  payment_method: {
    type: String,
    enum: ['cod', 'card', 'upi', 'netbanking'],
    default: 'cod'
  },
  payment_status: {
    type: String,
    enum: ['pending', 'paid', 'failed', 'refunded'],
    default: 'pending'
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

groceryOrderSchema.virtual('user', {
  ref: 'User',
  localField: 'user_id',
  foreignField: '_id',
  justOne: true
});

groceryOrderSchema.virtual('items', {
  ref: 'GroceryOrderItem',
  localField: '_id',
  foreignField: 'order_id'
});

groceryOrderSchema.index({ user_id: 1 });
groceryOrderSchema.index({ order_number: 1 });
groceryOrderSchema.index({ status: 1 });

groceryOrderSchema.index({ payment_status: 1 });

const GroceryOrder = mongoose.model('GroceryOrder', groceryOrderSchema);

module.exports = GroceryOrder; 
const mongoose = require('mongoose');

const orderAssignmentSchema = new mongoose.Schema({
  order_id: {
    type: mongoose.Schema.Types.ObjectId,
    required: [true, 'Order ID is required']
  },
  order_type: {
    type: String,
    enum: ['porter', 'taxi', 'grocery', 'food'],
    required: [true, 'Order type is required']
  },
  rider_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Rider',
    required: [true, 'Rider ID is required']
  },
  assigned_at: {
    type: Date,
    default: Date.now
  },
  accepted_at: Date,
  picked_up_at: Date,
  delivered_at: Date,
  completed_at: Date,
  cancelled_at: Date,
  status: {
    type: String,
    enum: ['assigned', 'accepted', 'rejected', 'picked_up', 'in_transit', 'delivered', 'completed', 'cancelled'],
    default: 'assigned'
  },
  earnings: {
    type: Number,
    default: 0
  },
  distance: {
    type: Number,
    default: 0
  },
  duration: {
    type: Number,
    default: 0 // in minutes
  },
  cancellation_reason: {
    type: String,
    trim: true
  },
  rating: {
    type: Number,
    min: 1,
    max: 5
  },
  review: {
    type: String,
    trim: true
  },
  payment_status: {
    type: String,
    enum: ['pending', 'completed', 'failed'],
    default: 'pending'
  },
  is_active: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Virtual for rider relationship
orderAssignmentSchema.virtual('rider', {
  ref: 'Rider',
  localField: 'rider_id',
  foreignField: '_id',
  justOne: true
});

// Virtual for order relationship (dynamic based on order_type)
orderAssignmentSchema.virtual('order', {
  refPath: 'order_type',
  localField: 'order_id',
  foreignField: '_id',
  justOne: true
});

// Virtual for assignment duration
orderAssignmentSchema.virtual('assignment_duration').get(function() {
  if (this.completed_at && this.assigned_at) {
    return Math.round((this.completed_at - this.assigned_at) / (1000 * 60)); // minutes
  }
  return null;
});

// Indexes for efficient queries
orderAssignmentSchema.index({ order_id: 1, order_type: 1 });
orderAssignmentSchema.index({ rider_id: 1 });
orderAssignmentSchema.index({ status: 1 });
orderAssignmentSchema.index({ assigned_at: -1 });
orderAssignmentSchema.index({ is_active: 1 });

// Compound index for available orders query
orderAssignmentSchema.index({ status: 1, order_type: 1, assigned_at: -1 });

module.exports = mongoose.models.OrderAssignment || mongoose.model('OrderAssignment', orderAssignmentSchema);

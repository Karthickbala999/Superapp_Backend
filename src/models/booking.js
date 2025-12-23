
const mongoose = require('mongoose');

const bookingSchema = new mongoose.Schema({
  user_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: false // optional if user is not logged in
  },
  hotel_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Hotel',
    required: [true, 'Hotel ID is required']
  },
  room_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Room',
    required: [true, 'Room ID is required']
  },
  name: {
    type: String,
    required: [true, 'Guest name is required'],
    trim: true
  },
  contact_number: {
    type: String,
    required: [true, 'Contact number is required'],
    trim: true
  },
  check_in_date: {
    type: Date,
    required: [true, 'Check-in date is required']
  },
  check_out_date: {
    type: Date,
    required: [true, 'Check-out date is required']
  },
  guests: {
    adults: {
      type: Number,
      min: 1,
      default: 1
    },
    children: {
      type: Number,
      min: 0,
      default: 0
    },
    infants: {
      type: Number,
      min: 0,
      default: 0
    }
  },
  total_nights: {
    type: Number,
    min: 1,
    default: 1
  },
  price_per_night: {
    type: Number,
    required: [true, 'Price per night is required'],
    min: 0
  },
  total_amount: {
    type: Number,
    required: [true, 'Total amount is required'],
    min: 0
  },
  discount_amount: {
    type: Number,
    min: 0,
    default: 0
  },
  final_amount: {
    type: Number,
    required: [true, 'Final amount is required'],
    min: 0
  },
  payment_status: {
    type: String,
    enum: ['pending', 'paid', 'failed', 'refunded'],
    default: 'pending'
  },
  payment_method: {
    type: String,
    enum: ['cod', 'razorpay', 'phonepay', 'paytm', 'amazonpay', 'credit_card', 'debit_card', 'upi', 'net_banking', 'cash'],
    default: 'cod'
  },
  booking_status: {
    type: String,
    enum: ['confirmed', 'pending', 'cancelled', 'completed', 'no_show'],
    default: 'pending'
  },
  special_requests: {
    type: String,
    trim: true
  },
  cancellation_reason: {
    type: String,
    trim: true
  },
  cancellation_date: {
    type: Date
  },
  refund_amount: {
    type: Number,
    min: 0,
    default: 0
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
  review_date: {
    type: Date
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Virtuals for population
bookingSchema.virtual('user', {
  ref: 'User',
  localField: 'user_id',
  foreignField: '_id',
  justOne: true
});

bookingSchema.virtual('hotel', {
  ref: 'Hotel',
  localField: 'hotel_id',
  foreignField: '_id',
  justOne: true
});

bookingSchema.virtual('room', {
  ref: 'Room',
  localField: 'room_id',
  foreignField: '_id',
  justOne: true
});

// Indexes for performance
bookingSchema.index({ user_id: 1 });
bookingSchema.index({ hotel_id: 1 });
bookingSchema.index({ room_id: 1 });
bookingSchema.index({ check_in_date: 1 });
bookingSchema.index({ check_out_date: 1 });
bookingSchema.index({ booking_status: 1 });
bookingSchema.index({ payment_status: 1 });
bookingSchema.index({ createdAt: -1 });

const Booking = mongoose.models.Booking || mongoose.model('Booking', bookingSchema);


module.exports = Booking;

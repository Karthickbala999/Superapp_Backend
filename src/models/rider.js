const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const riderSchema = new mongoose.Schema({
  user_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: false // Optional - can be standalone rider
  },
  name: {
    type: String,
    required: [true, 'Rider name is required'],
    trim: true
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    trim: true,
    lowercase: true
  },
  phone: {
    type: String,
    required: [true, 'Phone number is required'],
    unique: true,
    trim: true
  },
  password: {
    type: String,
    required: [true, 'Password is required'],
    minlength: 6
  },
  vehicle_type: {
    type: String,
    enum: ['Bike', 'Auto', 'Mini-Truck', 'Car'],
    required: [true, 'Vehicle type is required']
  },
  license_number: {
    type: String,
    required: [true, 'License number is required'],
    trim: true
  },
  vehicle_number: {
    type: String,
    required: [true, 'Vehicle number is required'],
    trim: true
  },
  vehicle_model: {
    type: String,
    trim: true
  },
  vehicle_color: {
    type: String,
    trim: true
  },
  is_online: {
    type: Boolean,
    default: false
  },
  current_location: {
    latitude: Number,
    longitude: Number,
    updated_at: {
      type: Date,
      default: Date.now
    }
  },
  total_earnings: {
    type: Number,
    default: 0
  },
  total_orders: {
    type: Number,
    default: 0
  },
  completed_orders: {
    type: Number,
    default: 0
  },
  cancelled_orders: {
    type: Number,
    default: 0
  },
  rating: {
    type: Number,
    min: 0,
    max: 5,
    default: 0
  },
  total_ratings: {
    type: Number,
    default: 0
  },
  status: {
    type: String,
    enum: ['active', 'inactive', 'suspended', 'pending_verification'],
    default: 'pending_verification'
  },
  documents: {
    license_image: String,
    vehicle_rc: String,
    insurance: String,
    aadhar: String,
    pan: String
  },
  bank_details: {
    account_number: String,
    ifsc_code: String,
    account_holder_name: String
  },
  preferences: {
    max_distance: {
      type: Number,
      default: 50 // km
    },
    min_fare: {
      type: Number,
      default: 50 // rupees
    },
    working_hours: {
      start: {
        type: String,
        default: '06:00'
      },
      end: {
        type: String,
        default: '22:00'
      }
    }
  },
  last_active: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Hash password before saving
riderSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  
  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Compare password method
riderSchema.methods.comparePassword = async function(candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

// Virtual for completion rate
riderSchema.virtual('completion_rate').get(function() {
  if (this.total_orders === 0) return 0;
  return Math.round((this.completed_orders / this.total_orders) * 100);
});

// Virtual for average rating
riderSchema.virtual('average_rating').get(function() {
  if (this.total_ratings === 0) return 0;
  return Math.round((this.rating / this.total_ratings) * 10) / 10;
});

// Indexes for efficient queries
riderSchema.index({ email: 1 });
riderSchema.index({ phone: 1 });
riderSchema.index({ is_online: 1 });
riderSchema.index({ status: 1 });
riderSchema.index({ vehicle_type: 1 });
riderSchema.index({ 'current_location.latitude': 1, 'current_location.longitude': 1 });

// Virtual for user relationship
riderSchema.virtual('user', {
  ref: 'User',
  localField: 'user_id',
  foreignField: '_id',
  justOne: true
});

module.exports = mongoose.models.Rider || mongoose.model('Rider', riderSchema);

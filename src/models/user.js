const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Name is required'],
    trim: true
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    lowercase: true,
    trim: true
  },
  password: {
    type: String,
    required: [true, 'Password is required'],
    minlength: [6, 'Password must be at least 6 characters']
  },
  phone: {
    type: String,
    trim: true
  },
  role: {
    type: String,
    enum: ['user', 'admin', 'ecommerce_admin', 'grocery_admin', 'taxi_admin', 'hotel_admin', 'restaurant_admin', 'urban_services_admin'],
    default: 'user'
  },
  role_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Role',
    default: null
  },
  status: {
    type: Boolean,
    default: true
  },
  last_login: {
    type: Date
  },
  profilePicture: {
    type: String,
    default: null
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Virtual for profile relationship
userSchema.virtual('profile', {
  ref: 'UserProfile',
  localField: '_id',
  foreignField: 'user_id',
  justOne: true
});

// Virtual for staff relationship
userSchema.virtual('staff', {
  ref: 'Staff',
  localField: '_id',
  foreignField: 'user_id',
  justOne: true
});

// Virtual for role relationship
userSchema.virtual('roleDetails', {
  ref: 'Role',
  localField: 'role_id',
  foreignField: '_id',
  justOne: true
});

// Hash password before saving
userSchema.pre('save', async function (next) {
  if (this.isModified('password') && this.password && this.password.startsWith('$2b$')) {
    console.log('Password already hashed by admin, skipping pre-save hashing');
    return next();
  }

  if (!this.isModified('password')) return next();

  try {
    console.log('Pre-save: Hashing password for new user');
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Compare password method
userSchema.methods.comparePassword = async function (candidatePassword) {
  if (!candidatePassword || !this.password) {
    return false;
  }

  try {
    const result = await bcrypt.compare(candidatePassword, this.password);
    console.log(`Password comparison for ${this.email}:`, result);
    return result;
  } catch (error) {
    console.error('bcrypt.compare error:', error);
    return false;
  }
};

// Index for better query performance
userSchema.index({ role: 1 });
userSchema.index({ role_id: 1 });
userSchema.index({ status: 1 });

// Safe export pattern
module.exports = mongoose.models.User || mongoose.model('User', userSchema); 
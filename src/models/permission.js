const mongoose = require('mongoose');

const permissionSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Permission name is required'],
    unique: true,
    trim: true
  },
  description: {
    type: String,
    required: [true, 'Permission description is required'],
    trim: true
  },
  resource: {
    type: String,
    required: [true, 'Resource is required'],
    enum: ['products', 'orders', 'categories', 'users', 'brands', 'staff']
  },
  action: {
    type: String,
    required: [true, 'Action is required'],
    enum: ['create', 'read', 'update', 'delete', 'manage']
  },
  category: {
    type: String,
    required: [true, 'Category is required'],
    enum: ['electronics', 'clothing', 'groceries', 'restaurants', 'hotels', 'taxi', 'all']
  },
  module: {
    type: String,
    required: [true, 'Module is required'],
    enum: ['ecommerce', 'grocery', 'restaurant', 'hotel', 'taxi', 'admin']
  }
}, {
  timestamps: true
});

// Compound index for efficient permission lookups
permissionSchema.index({ resource: 1, action: 1, category: 1 });
permissionSchema.index({ module: 1, category: 1 });

// Virtual for full permission string
permissionSchema.virtual('permissionString').get(function() {
  return `${this.resource}:${this.action}:${this.category}`;
});

// Safe export pattern
module.exports = mongoose.models.Permission || mongoose.model('Permission', permissionSchema); 
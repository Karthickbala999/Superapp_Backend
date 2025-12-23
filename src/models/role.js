const mongoose = require('mongoose');

const roleSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Role name is required'],
    unique: true,
    trim: true
  },
  description: {
    type: String,
    required: [true, 'Role description is required'],
    trim: true
  },
  permissions: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Permission'
  }],
  // For backward compatibility with existing roles
  legacy_role: {
    type: String,
    enum: ['user', 'admin', 'ecommerce_admin', 'grocery_admin', 'taxi_admin', 'hotel_admin', 'restaurant_admin'],
    default: null
  },
  status: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

// Index for efficient role lookups
roleSchema.index({ name: 1 });
roleSchema.index({ legacy_role: 1 });

// Virtual to get permission strings
roleSchema.virtual('permissionStrings').get(function() {
  return this.permissions.map(permission => permission.permissionString);
});

// Method to check if role has specific permission
roleSchema.methods.hasPermission = function(resource, action, category) {
  const permissionString = `${resource}:${action}:${category}`;
  return this.permissions.some(permission => 
    permission.permissionString === permissionString
  );
};

// Method to check if role has any permission for a resource
roleSchema.methods.hasResourcePermission = function(resource) {
  return this.permissions.some(permission => 
    permission.resource === resource
  );
};

// Method to check if role has any permission for a category
roleSchema.methods.hasCategoryPermission = function(category) {
  return this.permissions.some(permission => 
    permission.category === category || permission.category === 'all'
  );
};

// Safe export pattern
module.exports = mongoose.models.Role || mongoose.model('Role', roleSchema); 
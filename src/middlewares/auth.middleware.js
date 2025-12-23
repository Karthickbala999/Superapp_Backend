const jwt = require('jsonwebtoken');
const User = require('../models/user');
const Role = require('../models/role');
const Permission = require('../models/permission');

exports.protect = async (req, res, next) => {
  try {
    let token;

    // Check if token exists in headers
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
      console.log('🚫 Auth Middleware: No token provided');
      return res.status(401).json({
        success: false,
        message: 'Not authorized to access this route (No Token)'
      });
    }

    // Temporary demo token bypass for development
    if (token === 'demo-token') {
      req.user = {
        id: '68678c6f2ccb87d7ca07fd6e', // Valid ObjectId for demo user with existing rides
        name: 'Demo User',
        email: 'demo@example.com',
        role: 'admin'
      };
      return next();
    }

    try {
      // Verify token
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-super-secret-jwt-key');

      // Get user from token
      const user = await User.findById(decoded.id);
      console.log('🔐 Protect middleware - decoded.id:', decoded.id);
      console.log('🔐 Protect middleware - user found:', user ? `${user.name} (${user._id})` : 'NULL');

      if (!user) {
        console.log('🚫 Auth Middleware: User not found for token');
        return res.status(401).json({
          success: false,
          message: 'Not authorized to access this route (User Not Found)'
        });
      }

      // Attach user to request object with role details
      req.user = {
        _id: user._id, // Use _id instead of id
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        role_id: user.role_id
      }; // ✅ Plain object with role_id for permission checking

      console.log('🔐 Protect middleware - req.user set:', req.user._id);
      next();
    } catch (error) {
      console.log('🚫 Auth Middleware: Token verification failed:', error.message);
      return res.status(401).json({
        success: false,
        message: 'Not authorized to access this route (Invalid Token)'
      });
    }
  } catch (error) {
    console.error('Auth middleware error:', error);
    res.status(500).json({
      success: false,
      message: 'Error in authentication',
      error: error.message
    });
  }
};

// Case-insensitive role check (backward compatibility)
exports.authorize = (...roles) => {
  return (req, res, next) => {
    if (!roles.map(r => r.toLowerCase()).includes(req.user.role.toLowerCase())) {
      return res.status(401).json({
        success: false,
        message: 'Not authorized to access this route'
      });
    }
    next();
  };
};

// Category-specific permission check
exports.checkPermission = (resource, action, category) => {
  return async (req, res, next) => {
    try {
      // Super admin bypass
      if (req.user.role === 'admin') {
        return next();
      }

      // Check if user has role_id (new permission system)
      if (req.user.role_id) {
        const role = await Role.findById(req.user.role_id)
          .populate('permissions', 'resource action category');

        if (role && role.permissions) {
          const hasPermission = role.permissions.some(permission =>
            permission.resource === resource &&
            permission.action === action &&
            (permission.category === category || permission.category === 'all')
          );

          if (hasPermission) {
            return next();
          }
        }
      }

      // Fallback to legacy role check
      const permissionString = `${resource}:${action}:${category}`;
      const legacyPermissions = {
        'admin': ['*:*:*'],
        'ecommerce_admin': ['products:*:electronics', 'products:*:clothing', 'orders:*:electronics', 'orders:*:clothing'],
        'grocery_admin': ['products:*:groceries', 'orders:*:groceries'],
        'restaurant_admin': ['products:*:restaurants', 'orders:*:restaurants'],
        'hotel_admin': ['products:*:hotels', 'orders:*:hotels'],
        'taxi_admin': ['products:*:taxi', 'orders:*:taxi']
      };

      const userPermissions = legacyPermissions[req.user.role] || [];
      const hasLegacyPermission = userPermissions.some(perm => {
        if (perm === '*:*:*') return true;
        const [permResource, permAction, permCategory] = perm.split(':');
        return (permResource === '*' || permResource === resource) &&
          (permAction === '*' || permAction === action) &&
          (permCategory === '*' || permCategory === category);
      });

      if (hasLegacyPermission) {
        return next();
      }

      return res.status(403).json({
        success: false,
        message: `Access denied. Required permission: ${permissionString}`
      });
    } catch (error) {
      console.error('Permission check error:', error);
      return res.status(500).json({
        success: false,
        message: 'Error checking permissions'
      });
    }
  };
};

// Check if user has any permission for a resource
exports.hasResourcePermission = (resource) => {
  return async (req, res, next) => {
    try {
      if (req.user.role === 'admin') {
        return next();
      }

      if (req.user.role_id) {
        const role = await Role.findById(req.user.role_id)
          .populate('permissions', 'resource');

        if (role && role.permissions) {
          const hasPermission = role.permissions.some(permission =>
            permission.resource === resource
          );

          if (hasPermission) {
            return next();
          }
        }
      }

      // Legacy role check
      const resourceRoles = {
        'products': ['admin', 'ecommerce_admin', 'grocery_admin', 'restaurant_admin', 'hotel_admin', 'taxi_admin'],
        'orders': ['admin', 'ecommerce_admin', 'grocery_admin', 'restaurant_admin', 'hotel_admin', 'taxi_admin'],
        'categories': ['admin', 'ecommerce_admin', 'grocery_admin', 'restaurant_admin', 'hotel_admin', 'taxi_admin'],
        'users': ['admin'],
        'roles': ['admin'],
        'permissions': ['admin']
      };

      if (resourceRoles[resource] && resourceRoles[resource].includes(req.user.role)) {
        return next();
      }

      return res.status(403).json({
        success: false,
        message: `Access denied. Required resource permission: ${resource}`
      });
    } catch (error) {
      console.error('Resource permission check error:', error);
      return res.status(500).json({
        success: false,
        message: 'Error checking resource permissions'
      });
    }
  };
}; 
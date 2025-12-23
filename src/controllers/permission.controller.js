const Permission = require('../models/permission');
const Role = require('../models/role');
const mongoose = require('mongoose');

// Get all permissions
exports.getAllPermissions = async (req, res) => {
  try {
    const permissions = await Permission.find().sort({ resource: 1, action: 1, category: 1 });
    
    res.json({
      success: true,
      data: permissions
    });
  } catch (error) {
    console.error('Get permissions error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching permissions',
      error: error.message
    });
  }
};

// Get permissions by module
exports.getPermissionsByModule = async (req, res) => {
  try {
    const { module } = req.params;
    const permissions = await Permission.find({ module }).sort({ resource: 1, action: 1, category: 1 });
    
    res.json({
      success: true,
      data: permissions
    });
  } catch (error) {
    console.error('Get permissions by module error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching permissions by module',
      error: error.message
    });
  }
};

// Get permissions by category
exports.getPermissionsByCategory = async (req, res) => {
  try {
    const { category } = req.params;
    const permissions = await Permission.find({ 
      $or: [{ category }, { category: 'all' }] 
    }).sort({ resource: 1, action: 1 });
    
    res.json({
      success: true,
      data: permissions
    });
  } catch (error) {
    console.error('Get permissions by category error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching permissions by category',
      error: error.message
    });
  }
};

// Create new permission
exports.createPermission = async (req, res) => {
  try {
    const { name, description, resource, action, category, module } = req.body;

    // Check if permission already exists
    const existingPermission = await Permission.findOne({ name });
    if (existingPermission) {
      return res.status(400).json({
        success: false,
        message: 'Permission already exists'
      });
    }

    const permission = await Permission.create({
      name,
      description,
      resource,
      action,
      category,
      module
    });

    res.status(201).json({
      success: true,
      message: 'Permission created successfully',
      data: permission
    });
  } catch (error) {
    console.error('Create permission error:', error);
    res.status(500).json({
      success: false,
      message: 'Error creating permission',
      error: error.message
    });
  }
};

// Update permission
exports.updatePermission = async (req, res) => {
  try {
    const { id } = req.params;
    // Defensive check for valid ObjectId
    if (!id || !mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid permission ID',
      });
    }
    const { name, description, resource, action, category, module } = req.body;

    const permission = await Permission.findByIdAndUpdate(
      id,
      { name, description, resource, action, category, module },
      { new: true, runValidators: true }
    );

    if (!permission) {
      return res.status(404).json({
        success: false,
        message: 'Permission not found'
      });
    }

    res.json({
      success: true,
      message: 'Permission updated successfully',
      data: permission
    });
  } catch (error) {
    console.error('Update permission error:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating permission',
      error: error.message
    });
  }
};

// Delete permission
exports.deletePermission = async (req, res) => {
  try {
    const { id } = req.params;

    // Check if permission is used by any roles
    const rolesUsingPermission = await Role.find({ permissions: id });
    if (rolesUsingPermission.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'Cannot delete permission as it is assigned to roles',
        data: {
          roles: rolesUsingPermission.map(role => role.name)
        }
      });
    }

    const permission = await Permission.findByIdAndDelete(id);
    if (!permission) {
      return res.status(404).json({
        success: false,
        message: 'Permission not found'
      });
    }

    res.json({
      success: true,
      message: 'Permission deleted successfully'
    });
  } catch (error) {
    console.error('Delete permission error:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting permission',
      error: error.message
    });
  }
};

// Get permission statistics
exports.getPermissionStats = async (req, res) => {
  try {
    const stats = await Permission.aggregate([
      {
        $group: {
          _id: '$module',
          count: { $sum: 1 },
          resources: { $addToSet: '$resource' },
          categories: { $addToSet: '$category' }
        }
      }
    ]);

    res.json({
      success: true,
      data: stats
    });
  } catch (error) {
    console.error('Get permission stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching permission statistics',
      error: error.message
    });
  }
}; 
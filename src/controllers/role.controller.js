const Role = require('../models/role');
const Permission = require('../models/permission');
const User = require('../models/user');

// Get all roles
exports.getAllRoles = async (req, res) => {
  try {
    const roles = await Role.find()
      .populate('permissions', 'name description resource action category module')
      .sort({ name: 1 });
    
    res.json({
      success: true,
      data: roles
    });
  } catch (error) {
    console.error('Get roles error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching roles',
      error: error.message
    });
  }
};

// Get role by ID
exports.getRoleById = async (req, res) => {
  try {
    const { id } = req.params;
    const role = await Role.findById(id)
      .populate('permissions', 'name description resource action category module');
    
    if (!role) {
      return res.status(404).json({
        success: false,
        message: 'Role not found'
      });
    }

    res.json({
      success: true,
      data: role
    });
  } catch (error) {
    console.error('Get role error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching role',
      error: error.message
    });
  }
};

// Create new role
exports.createRole = async (req, res) => {
  try {
    const { name, description, permissions, legacy_role } = req.body;

    // Check if role already exists
    const existingRole = await Role.findOne({ name });
    if (existingRole) {
      return res.status(400).json({
        success: false,
        message: 'Role already exists'
      });
    }

    // Validate permissions if provided
    if (permissions && permissions.length > 0) {
      const validPermissions = await Permission.find({ _id: { $in: permissions } });
      if (validPermissions.length !== permissions.length) {
        return res.status(400).json({
          success: false,
          message: 'Some permissions are invalid'
        });
      }
    }

    const role = await Role.create({
      name,
      description,
      permissions: permissions || [],
      legacy_role
    });

    const populatedRole = await Role.findById(role._id)
      .populate('permissions', 'name description resource action category module');

    res.status(201).json({
      success: true,
      message: 'Role created successfully',
      data: populatedRole
    });
  } catch (error) {
    console.error('Create role error:', error);
    res.status(500).json({
      success: false,
      message: 'Error creating role',
      error: error.message
    });
  }
};

// Update role
exports.updateRole = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description, permissions, legacy_role, status } = req.body;

    // Check if name is being changed and if it conflicts
    if (name) {
      const existingRole = await Role.findOne({ name, _id: { $ne: id } });
      if (existingRole) {
        return res.status(400).json({
          success: false,
          message: 'Role name already exists'
        });
      }
    }

    // Validate permissions if provided
    if (permissions && permissions.length > 0) {
      const validPermissions = await Permission.find({ _id: { $in: permissions } });
      if (validPermissions.length !== permissions.length) {
        return res.status(400).json({
          success: false,
          message: 'Some permissions are invalid'
        });
      }
    }

    const role = await Role.findByIdAndUpdate(
      id,
      { name, description, permissions, legacy_role, status },
      { new: true, runValidators: true }
    ).populate('permissions', 'name description resource action category module');

    if (!role) {
      return res.status(404).json({
        success: false,
        message: 'Role not found'
      });
    }

    res.json({
      success: true,
      message: 'Role updated successfully',
      data: role
    });
  } catch (error) {
    console.error('Update role error:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating role',
      error: error.message
    });
  }
};

// Delete role
exports.deleteRole = async (req, res) => {
  try {
    const { id } = req.params;

    // Check if role is assigned to any users
    const usersWithRole = await User.find({ role_id: id });
    if (usersWithRole.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'Cannot delete role as it is assigned to users',
        data: {
          userCount: usersWithRole.length,
          users: usersWithRole.map(user => ({ id: user._id, name: user.name, email: user.email }))
        }
      });
    }

    const role = await Role.findByIdAndDelete(id);
    if (!role) {
      return res.status(404).json({
        success: false,
        message: 'Role not found'
      });
    }

    res.json({
      success: true,
      message: 'Role deleted successfully'
    });
  } catch (error) {
    console.error('Delete role error:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting role',
      error: error.message
    });
  }
};

// Assign role to user
exports.assignRoleToUser = async (req, res) => {
  try {
    const { userId, roleId } = req.body;

    // Validate user and role
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    const role = await Role.findById(roleId);
    if (!role) {
      return res.status(404).json({
        success: false,
        message: 'Role not found'
      });
    }

    // Update user's role
    user.role_id = roleId;
    await user.save();

    res.json({
      success: true,
      message: 'Role assigned successfully',
      data: {
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          role_id: user.role_id
        },
        role: {
          id: role._id,
          name: role.name,
          description: role.description
        }
      }
    });
  } catch (error) {
    console.error('Assign role error:', error);
    res.status(500).json({
      success: false,
      message: 'Error assigning role',
      error: error.message
    });
  }
};

// Get role statistics
exports.getRoleStats = async (req, res) => {
  try {
    const stats = await Role.aggregate([
      {
        $lookup: {
          from: 'users',
          localField: '_id',
          foreignField: 'role_id',
          as: 'users'
        }
      },
      {
        $project: {
          name: 1,
          description: 1,
          userCount: { $size: '$users' },
          permissionCount: { $size: '$permissions' }
        }
      }
    ]);

    res.json({
      success: true,
      data: stats
    });
  } catch (error) {
    console.error('Get role stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching role statistics',
      error: error.message
    });
  }
}; 
const User = require('../models/user');
const bcrypt = require('bcryptjs');
const UserProfile = require('../models/userprofile'); // Added import for UserProfile

// Get all users with pagination
exports.getAllUsers = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    // Get total count and users
    const [users, total] = await Promise.all([
      User.find({}, { password: 0 })
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),
      User.countDocuments()
    ]);

    // Get user profiles for all users
    const userIds = users.map(user => user._id);
    const userProfiles = await UserProfile.find({ user_id: { $in: userIds } });
    
    // Create a map of user profiles for quick lookup
    const profileMap = {};
    userProfiles.forEach(profile => {
      profileMap[profile.user_id.toString()] = profile;
    });

    // Combine user data with profile data
    const usersWithProfiles = users.map(user => {
      const profile = profileMap[user._id.toString()];
      return {
        ...user.toObject(),
        profile: profile ? {
          address_line1: profile.address || '',
          address_line2: '',
          city: profile.city || '',
          state: profile.state || '',
          country: profile.country || '',
          pincode: profile.pincode || '',
          bio: ''
        } : {
          address_line1: '',
          address_line2: '',
          city: '',
          state: '',
          country: '',
          pincode: '',
          bio: ''
        }
      };
    });

    res.json({
      success: true,
      data: {
        users: usersWithProfiles,
        pagination: {
          total,
          page,
          totalPages: Math.ceil(total / limit)
        }
      }
    });
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching users',
      error: error.message
    });
  }
};

// Get user by ID
exports.getUserById = async (req, res) => {
  try {
    const user = await User.findById(req.params.id, { password: 0 });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Get user profile
    const userProfile = await UserProfile.findOne({ user_id: req.params.id });
    
    const userWithProfile = {
      ...user.toObject(),
      profile: userProfile ? {
        address_line1: userProfile.address || '',
        address_line2: '',
        city: userProfile.city || '',
        state: userProfile.state || '',
        country: userProfile.country || '',
        pincode: userProfile.pincode || '',
        bio: ''
      } : {
        address_line1: '',
        address_line2: '',
        city: '',
        state: '',
        country: '',
        pincode: '',
        bio: ''
      }
    };

    res.json({
      success: true,
      data: userWithProfile
    });
  } catch (error) {
    console.error('Error fetching user:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching user',
      error: error.message
    });
  }
};

// Create new user
exports.createUser = async (req, res) => {
  try {
    const { name, email, password, phone, role, status } = req.body;

    // Check if user exists
    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({
        success: false,
        message: 'User with this email already exists'
      });
    }

    // Create user
    const user = new User({
      name,
      email,
      password,
      phone,
      role: role || 'user',
      status: status === 'true' || status === true
    });

    await user.save();

    // Return user without password
    const userResponse = {
      id: user._id,
      name: user.name,
      email: user.email,
      phone: user.phone,
      role: user.role,
      status: user.status,
      last_login: user.last_login,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt
    };

    res.status(201).json({
      success: true,
      message: 'User created successfully',
      data: userResponse
    });
  } catch (error) {
    console.error('Error creating user:', error);
    if (error.name === 'ValidationError') {
      return res.status(400).json({
        success: false,
        message: 'Validation error',
        errors: Object.values(error.errors).map(e => e.message)
      });
    }
    res.status(500).json({
      success: false,
      message: 'Error creating user',
      error: error.message
    });
  }
};

// Update user
exports.updateUser = async (req, res) => {
  try {
    const { name, email, phone, role, status } = req.body;
    const userId = req.params.id;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Check if email is being changed and if it already exists
    if (email && email !== user.email) {
      const emailExists = await User.findOne({ email });
      if (emailExists) {
        return res.status(400).json({
          success: false,
          message: 'Email already exists'
        });
      }
    }

    // Update user
    user.name = name || user.name;
    user.email = email || user.email;
    user.phone = phone || user.phone;
    user.role = role || user.role;
    user.status = status === 'true' || status === true;

    await user.save();

    // Return updated user without password
    const userResponse = {
      id: user._id,
      name: user.name,
      email: user.email,
      phone: user.phone,
      role: user.role,
      status: user.status,
      last_login: user.last_login,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt
    };

    res.json({
      success: true,
      message: 'User updated successfully',
      data: userResponse
    });
  } catch (error) {
    console.error('Error updating user:', error);
    if (error.name === 'ValidationError') {
      return res.status(400).json({
        success: false,
        message: 'Validation error',
        errors: Object.values(error.errors).map(e => e.message)
      });
    }
    res.status(500).json({
      success: false,
      message: 'Error updating user',
      error: error.message
    });
  }
};

// Delete user
exports.deleteUser = async (req, res) => {
  try {
    const userId = req.params.id;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Don't allow deletion of admin users
    if (user.role === 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Cannot delete admin users'
      });
    }

    await User.findByIdAndDelete(userId);

    res.json({
      success: true,
      message: 'User deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting user:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting user',
      error: error.message
    });
  }
};

// Update user password - SIMPLIFIED VERSION
exports.updatePassword = async (req, res) => {
  try {
    console.log('=== SIMPLE PASSWORD UPDATE ===');
    const { newPassword, password } = req.body;
    const userId = req.params.id;

    // Find user
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Get the new password
    const passwordToSet = newPassword || password;
    if (!passwordToSet) {
      return res.status(400).json({
        success: false,
        message: 'New password is required'
      });
    }

    console.log('Updating password for user:', user.email);
    console.log('New password length:', passwordToSet.length);

    // Hash the password manually
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(passwordToSet, salt);
    
    console.log('Generated hash:', hashedPassword);
    console.log('Hash starts with $2b$:', hashedPassword.startsWith('$2b$'));

    // Update directly in database
    await User.updateOne(
      { _id: userId },
      { $set: { password: hashedPassword } }
    );

    console.log('Password updated successfully!');

    res.json({
      success: true,
      message: 'Password updated successfully'
    });
  } catch (error) {
    console.error('Error updating password:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating password',
      error: error.message
    });
  }
};

// Update user profile
exports.updateUserProfile = async (req, res) => {
  try {
    const userId = req.params.id;
    const { name, email, phone, bio, address_line1, address_line2, city, state, country, pincode } = req.body;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Check if email is being changed and if it already exists
    if (email && email !== user.email) {
      const emailExists = await User.findOne({ email });
      if (emailExists) {
        return res.status(400).json({
          success: false,
          message: 'Email already exists'
        });
      }
    }

    // Update basic user info
    user.name = name || user.name;
    user.email = email || user.email;
    user.phone = phone || user.phone;

    // Handle profile picture upload if present
    if (req.file) {
      user.profile_picture = req.file.path;
    }

    await user.save();

    // Update or create user profile
    let userProfile = await UserProfile.findOne({ user_id: userId });
    
    if (!userProfile) {
      userProfile = new UserProfile({
        user_id: userId,
        address: address_line1, // Using address field from model
        city,
        state,
        country,
        pincode,
        phone: user.phone
      });
    } else {
      userProfile.address = address_line1 || userProfile.address;
      userProfile.city = city || userProfile.city;
      userProfile.state = state || userProfile.state;
      userProfile.country = country || userProfile.country;
      userProfile.pincode = pincode || userProfile.pincode;
      userProfile.phone = user.phone || userProfile.phone;
    }

    await userProfile.save();

    // Return updated user with profile
    const userResponse = {
      id: user._id,
      name: user.name,
      email: user.email,
      phone: user.phone,
      role: user.role,
      status: user.status,
      profile_picture: user.profile_picture,
      last_login: user.last_login,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
      profile: {
        address_line1: userProfile.address,
        address_line2: '', // Not in model, keeping empty
        city: userProfile.city,
        state: userProfile.state,
        country: userProfile.country,
        pincode: userProfile.pincode,
        bio: '' // Not in model, keeping empty
      }
    };

    res.json({
      success: true,
      message: 'User profile updated successfully',
      data: userResponse
    });
  } catch (error) {
    console.error('Error updating user profile:', error);
    if (error.name === 'ValidationError') {
      return res.status(400).json({
        success: false,
        message: 'Validation error',
        errors: Object.values(error.errors).map(e => e.message)
      });
    }
    res.status(500).json({
      success: false,
      message: 'Error updating user profile',
      error: error.message
    });
  }
}; 
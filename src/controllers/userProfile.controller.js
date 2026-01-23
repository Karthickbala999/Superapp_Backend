const { UserProfile, User } = require('../models');
const { processImage } = require('../utils/imageProcessor');
const path = require('path');
const fs = require('fs');

// Get user profile
exports.getUserProfile = async (req, res) => {
  try {
    const profile = await UserProfile.findOne({ user_id: req.user.id })
      .populate('user_id', 'name email phone role');

    if (!profile) {
      // Return empty profile structure if not found
      return res.json({
        success: true,
        data: {
          address_line1: '',
          address_line2: '',
          city: '',
          state: '',
          country: '',
          pincode: '',
          profile_picture: null
        }
      });
    }

    // Format response to match frontend expectations
    const profileData = {
      address_line1: profile.address || '',
      address_line2: '', // Model doesn't have address_line2, keeping empty
      city: profile.city || '',
      state: profile.state || '',
      country: profile.country || '',
      pincode: profile.pincode || '',
      profile_picture: profile.avatar || profile.profile_picture || null
    };

    res.json({
      success: true,
      data: profileData
    });
  } catch (error) {
    console.error('Get user profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching user profile',
      error: error.message
    });
  }
};

// Update user profile
exports.updateUserProfile = async (req, res) => {
  try {
    const {
      name,
      email,
      phone,
      address_line1,
      address_line2,
      city,
      state,
      country,
      pincode
    } = req.body;

    console.log('ANTIGRAVITY_DEBUG: updateUserProfile called');
    console.log('ANTIGRAVITY_DEBUG: req.body:', req.body);
    console.log('ANTIGRAVITY_DEBUG: req.user.id:', req.user.id);

    // 1. Update Core User Data (Name, Email, Phone)
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Check email uniqueness if changed
    if (email && email !== user.email) {
      const emailExists = await User.findOne({ email });
      if (emailExists) {
        return res.status(400).json({
          success: false,
          message: 'Email already exists'
        });
      }
    }

    // Update user fields
    if (name) user.name = name;
    if (email) user.email = email;
    if (phone) user.phone = phone;

    await user.save();

    // 2. Update Extended Profile Data
    // Find existing profile
    let profile = await UserProfile.findOne({ user_id: req.user.id });

    let profilePicture = profile?.avatar || profile?.profile_picture;

    // Handle profile picture upload
    if (req.file) {
      try {
        const processedImage = await processImage(req.file, {
          width: 400,
          height: 400,
          quality: 85,
          format: 'jpeg'
        });
        profilePicture = path.join('uploads', 'profiles', processedImage.filename);

        // Delete old profile picture if exists
        if (profile?.avatar || profile?.profile_picture) {
          const oldImagePath = path.join(__dirname, '..', '..', profile.avatar || profile.profile_picture);
          if (fs.existsSync(oldImagePath)) {
            fs.unlinkSync(oldImagePath);
          }
        }
      } catch (imageError) {
        console.error('Image processing error:', imageError);
        // Continue without image if processing fails
      }
    }

    // Prepare update data - map address_line1 to address field
    const updateData = {
      address: address_line1 || '',
      city: city || '',
      state: state || '',
      country: country || '',
      pincode: pincode || ''
    };

    if (profilePicture) {
      updateData.avatar = profilePicture;
    }

    if (!profile) {
      // Create new profile
      profile = new UserProfile({
        user_id: req.user.id,
        ...updateData
      });
      await profile.save();
    } else {
      // Update existing profile
      Object.assign(profile, updateData);
      await profile.save();
    }

    // Format response to match frontend expectations
    const profileData = {
      // User data
      name: user.name,
      email: user.email,
      phone: user.phone,
      role: user.role,

      // Profile data
      address_line1: profile.address || '',
      address_line2: address_line2 || '', // Store in a note or separate field if needed
      city: profile.city || '',
      state: profile.state || '',
      country: profile.country || '',
      pincode: profile.pincode || '',
      profile_picture: profile.avatar || profile.profile_picture || null
    };

    res.json({
      success: true,
      message: 'Profile updated successfully',
      data: profileData
    });
  } catch (error) {
    console.error('Update user profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating user profile',
      error: error.message
    });
  }
};

// Delete profile picture
exports.deleteProfilePicture = async (req, res) => {
  try {
    const profile = await UserProfile.findOne({ user_id: req.user.id });

    if (!profile || (!profile.avatar && !profile.profile_picture)) {
      return res.status(404).json({
        success: false,
        message: 'Profile picture not found'
      });
    }

    const imagePath = profile.avatar || profile.profile_picture;
    const fullImagePath = path.join(__dirname, '..', '..', imagePath);

    if (fs.existsSync(fullImagePath)) {
      fs.unlinkSync(fullImagePath);
    }

    profile.avatar = null;
    if (profile.profile_picture) {
      profile.profile_picture = null;
    }
    await profile.save();

    res.json({
      success: true,
      message: 'Profile picture deleted successfully'
    });
  } catch (error) {
    console.error('Delete profile picture error:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting profile picture',
      error: error.message
    });
  }
}; 
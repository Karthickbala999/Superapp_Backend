const AdminProfile = require('../models/adminProfile');
const path = require('path');
const fs = require('fs');

// Get admin profile
exports.getAdminProfile = async (req, res) => {
  try {
    let profile = await AdminProfile.findOne();
    
    // If no profile exists, create a default one
    if (!profile) {
      profile = new AdminProfile({});
      await profile.save();
    }
    
    // Convert to plain object and ensure id field exists
    const profileObj = profile.toObject ? profile.toObject() : profile;
    if (profileObj._id) {
      profileObj.id = profileObj._id.toString();
    }
    
    res.json([profileObj]); // Return as array to match frontend expectation
  } catch (error) {
    console.error('Error fetching admin profile:', error);
    console.error('Error stack:', error.stack);
    res.status(500).json({
      success: false,
      message: 'Error fetching admin profile',
      error: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
};

// Update admin profile
exports.updateAdminProfile = async (req, res) => {
  try {
    const profileId = req.params.id;
    
    if (!profileId) {
      return res.status(400).json({
        success: false,
        message: 'Profile ID is required'
      });
    }
    
    // Find existing profile
    let profile = await AdminProfile.findById(profileId);
    
    if (!profile) {
      // Try to find any existing profile (there should only be one)
      profile = await AdminProfile.findOne();
      
      if (!profile) {
        // If no profile exists, create a new one
        profile = new AdminProfile({});
      } else {
        // Update the existing profile's ID if it doesn't match
        console.log(`Profile ID mismatch. Using existing profile: ${profile._id}`);
      }
    }
    
    // Handle logo file upload
    if (req.file) {
      // Delete old logo if exists
      if (profile.logo) {
        const oldLogoPath = path.join(__dirname, '../../', profile.logo);
        if (fs.existsSync(oldLogoPath)) {
          try {
            fs.unlinkSync(oldLogoPath);
          } catch (err) {
            console.error('Error deleting old logo:', err);
          }
        }
      }
      // Save logo path - multer stores file in uploads/profiles/ directory
      // req.file.path is the full path, we need relative path from project root
      const relativePath = path.relative(path.join(__dirname, '../../'), req.file.path);
      profile.logo = relativePath.replace(/\\/g, '/'); // Normalize path separators for web
    }
    
    // Update fields from request body
    const {
      business_name,
      name,
      email,
      mobile_number,
      district_city,
      state,
      country,
      pincode,
      gst_number,
      facebook,
      instagram,
      linkedin,
      pintrest,
      youtube,
      twitter
    } = req.body;
    
    // Update fields from request body (only if they are provided and not empty strings)
    if (business_name !== undefined && business_name !== '') profile.business_name = business_name;
    if (name !== undefined && name !== '') profile.name = name;
    if (email !== undefined && email !== '') profile.email = email;
    if (mobile_number !== undefined && mobile_number !== '') profile.mobile_number = mobile_number;
    if (district_city !== undefined && district_city !== '') profile.district_city = district_city;
    if (state !== undefined && state !== '') profile.state = state;
    if (country !== undefined && country !== '') profile.country = country;
    if (pincode !== undefined && pincode !== '') profile.pincode = pincode;
    if (gst_number !== undefined) profile.gst_number = gst_number || '';
    if (facebook !== undefined) profile.facebook = facebook || '';
    if (instagram !== undefined) profile.instagram = instagram || '';
    if (linkedin !== undefined) profile.linkedin = linkedin || '';
    if (pintrest !== undefined) profile.pintrest = pintrest || '';
    if (youtube !== undefined) profile.youtube = youtube || '';
    if (twitter !== undefined) profile.twitter = twitter || '';
    
    await profile.save();
    
    // Convert to plain object and ensure id field exists
    const profileObj = profile.toObject ? profile.toObject() : profile;
    if (profileObj._id) {
      profileObj.id = profileObj._id.toString();
    }
    
    res.json({
      success: true,
      message: 'Profile updated successfully',
      data: profileObj
    });
  } catch (error) {
    console.error('Error updating admin profile:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating admin profile',
      error: error.message
    });
  }
};


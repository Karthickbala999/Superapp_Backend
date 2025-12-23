const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { Partner, UrbanOTP, ServicePartner, User, ServiceCategory } = require('../../models');
const multer = require('multer');
const path = require('path');

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/partners/');
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + '-' + Math.round(Math.random() * 1E9) + path.extname(file.originalname));
  }
});

const upload = multer({
  storage: storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|pdf/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);

    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(new Error('Only JPEG, JPG, PNG, and PDF files are allowed'));
    }
  }
});

// Helper function to generate OTP
const generateOTP = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

// Send OTP
router.post('/partner/send-otp', async (req, res) => {
  try {
    const { phoneNumber } = req.body;

    if (!phoneNumber || phoneNumber.length !== 13 || !phoneNumber.startsWith('+91')) {
      return res.status(400).json({
        success: false,
        message: 'Valid Indian mobile number required (with +91)'
      });
    }

    // Generate OTP
    const otp = generateOTP();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    // Save or update OTP
    await UrbanOTP.findOneAndUpdate(
      { phoneNumber },
      { otp, expiresAt, isUsed: false },
      { upsert: true, new: true }
    );

    // In production, send SMS via Twilio or similar service
    console.log(`OTP for ${phoneNumber}: ${otp}`);

    res.json({
      success: true,
      message: 'OTP sent successfully',
      // In development, return OTP for testing
      ...(process.env.NODE_ENV === 'development' && { otp })
    });
  } catch (error) {
    console.error('Send OTP error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to send OTP'
    });
  }
});

// Verify OTP and check partner status
router.post('/partner/verify-otp', async (req, res) => {
  try {
    const { phoneNumber, otp } = req.body;

    if (!phoneNumber || !otp) {
      return res.status(400).json({
        success: false,
        message: 'Phone number and OTP required'
      });
    }

    // Verify OTP
    const otpRecord = await UrbanOTP.findOne({ phoneNumber, otp, isUsed: false });

    if (!otpRecord) {
      return res.status(400).json({
        success: false,
        message: 'Invalid or expired OTP'
      });
    }

    if (new Date() > otpRecord.expiresAt) {
      return res.status(400).json({
        success: false,
        message: 'OTP expired'
      });
    }

    // Mark OTP as used
    otpRecord.isUsed = true;
    await otpRecord.save();

    // Check if partner exists
    const partner = await Partner.findOne({ phoneNumber });

    if (partner) {
      // Existing partner
      if (partner.status === 'approved') {
        // Approved partner - generate JWT token
        const token = jwt.sign(
          { partnerId: partner._id, phoneNumber },
          process.env.JWT_SECRET,
          { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
        );

        res.json({
          success: true,
          message: 'Login successful',
          token,
          partner: {
            id: partner._id,
            fullName: partner.fullName,
            status: partner.status,
            isApproved: partner.status === 'approved'
          }
        });
      } else {
        // Pending or rejected partner
        res.json({
          success: true,
          message: 'Partner found but not approved',
          partner: {
            id: partner._id,
            fullName: partner.fullName,
            status: partner.status,
            isApproved: false
          }
        });
      }
    } else {
      // New partner
      res.json({
        success: true,
        message: 'OTP verified. Please complete registration',
        isNewPartner: true
      });
    }
  } catch (error) {
    console.error('Verify OTP error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to verify OTP'
    });
  }
});

// Check partner status
router.get('/partner/status/:phoneNumber', async (req, res) => {
  try {
    const { phoneNumber } = req.params;

    const partner = await Partner.findOne({ phoneNumber });

    res.json({
      success: true,
      isNewPartner: !partner,
      status: partner ? partner.status : null,
      isApproved: partner ? partner.status === 'approved' : false
    });
  } catch (error) {
    console.error('Check status error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to check status'
    });
  }
});

// Upload documents and create partner profile
router.post('/partner/upload-documents', upload.array('documents', 5), async (req, res) => {
  try {
    const {
      fullName,
      email,
      address,
      city,
      state,
      pincode,
      serviceCategories,
      phoneNumber
    } = req.body;

    // Parse service categories
    const categories = Array.isArray(serviceCategories)
      ? serviceCategories
      : JSON.parse(serviceCategories || '[]');

    // Get uploaded file paths
    const documents = req.files.map(file => `/uploads/partners/${file.filename}`);

    // Create new partner
    const partner = new Partner({
      phoneNumber,
      fullName,
      email,
      address,
      city,
      state,
      pincode,
      serviceCategories: categories,
      documents,
      status: 'pending',
      createdAt: new Date()
    });

    await partner.save();

    res.json({
      success: true,
      message: 'Documents uploaded successfully. Your application is under review.',
      partner: {
        id: partner._id,
        fullName: partner.fullName,
        status: partner.status
      }
    });
  } catch (error) {
    console.error('Upload documents error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to upload documents'
    });
  }
});

// Get partner profile (protected)
router.get('/partner/profile', async (req, res) => {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '');

    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required'
      });
    }

    // Verify JWT
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const partner = await Partner.findById(decoded.partnerId).select('-documents');

    if (!partner) {
      return res.status(404).json({
        success: false,
        message: 'Partner not found'
      });
    }

    res.json({
      success: true,
      partner: {
        id: partner._id,
        fullName: partner.fullName,
        email: partner.email,
        phoneNumber: partner.phoneNumber,
        address: partner.address,
        city: partner.city,
        state: partner.state,
        pincode: partner.pincode,
        serviceCategories: partner.serviceCategories,
        status: partner.status,
        averageRating: partner.averageRating || 0,
        totalBookings: partner.totalBookings || 0,
        completedBookings: partner.completedBookings || 0,
        earnings: partner.earnings || 0
      }
    });
  } catch (error) {
    console.error('Get profile error:', error);
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({
        success: false,
        message: 'Invalid token'
      });
    }
    res.status(500).json({
      success: false,
      message: 'Failed to fetch profile'
    });
  }
});

// Update partner profile (protected)
router.put('/partner/profile', async (req, res) => {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '');

    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required'
      });
    }

    // Verify JWT
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const partner = await Partner.findById(decoded.partnerId);

    if (!partner) {
      return res.status(404).json({
        success: false,
        message: 'Partner not found'
      });
    }

    const {
      fullName,
      email,
      address,
      city,
      state,
      pincode,
      serviceCategories
    } = req.body;

    // Update fields if provided
    if (fullName) partner.fullName = fullName;
    if (email) partner.email = email;
    if (address) partner.address = address;
    if (city) partner.city = city;
    if (state) partner.state = state;
    if (pincode) partner.pincode = pincode;

    // Update service categories if provided
    if (serviceCategories) {
      partner.serviceCategories = Array.isArray(serviceCategories)
        ? serviceCategories
        : JSON.parse(serviceCategories);
    }

    await partner.save();

    // ---------------------------------------------------------
    // SYNC TO SERVICE PARTNER (FOR ADMIN PANEL)
    // ---------------------------------------------------------
    try {
      const user = await User.findOne({ phone: partner.phoneNumber });
      if (user) {
        const servicePartner = await ServicePartner.findOne({ user: user._id });
        if (servicePartner) {
          // Sync basic details
          if (fullName) servicePartner.businessName = fullName;

          // Sync Categories (Map Strings to ObjectIds)
          if (partner.serviceCategories && partner.serviceCategories.length > 0) {
            const categoryDocs = await ServiceCategory.find({
              name: { $in: partner.serviceCategories }
            });

            if (categoryDocs.length > 0) {
              servicePartner.categories = categoryDocs.map(c => c._id);
            }
          }

          await servicePartner.save();
          console.log(`Synced Mobile Partner ${partner._id} to Service Partner ${servicePartner._id}`);
        }
      }
    } catch (syncError) {
      console.error('Error syncing to ServicePartner:', syncError);
    }
    // ---------------------------------------------------------

    res.json({
      success: true,
      message: 'Profile updated successfully',
      partner: {
        id: partner._id,
        fullName: partner.fullName,
        email: partner.email,
        phoneNumber: partner.phoneNumber,
        address: partner.address,
        city: partner.city,
        state: partner.state,
        pincode: partner.pincode,
        serviceCategories: partner.serviceCategories,
        status: partner.status
      }
    });
  } catch (error) {
    console.error('Update profile error:', error);
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({
        success: false,
        message: 'Invalid token'
      });
    }
    res.status(500).json({
      success: false,
      message: 'Failed to update profile: ' + (error.message || error)
    });
  }
});

module.exports = router;

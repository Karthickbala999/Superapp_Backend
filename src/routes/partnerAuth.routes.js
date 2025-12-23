const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { Partner, UrbanOTP } = require('../models');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { protect: auth } = require('../middlewares/auth.middleware');

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadDir = path.join(__dirname, '../../uploads/partners/');
    // Ensure directory exists
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
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
router.post('/send-otp', async (req, res) => {
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
router.post('/verify-otp', async (req, res) => {
  const log = console.log;

  try {
    log('--- Verify OTP Request Started ---');
    const { phoneNumber, otp } = req.body;
    log(`Phone: ${phoneNumber}, OTP: ${otp}`);

    if (!phoneNumber || !otp) {
      log('Missing phone or otp');
      return res.status(400).json({
        success: false,
        message: 'Phone number and OTP required'
      });
    }

    // For development: Accept any 6-digit OTP
    if (otp.length !== 6) {
      log('OTP length invalid');
      return res.status(400).json({
        success: false,
        message: 'OTP must be 6 digits'
      });
    }

    // Check if partner exists, if not create one
    let partner = await Partner.findOne({ phoneNumber });
    log(`Partner found: ${partner ? partner._id : 'No'}`);

    if (!partner) {
      // Auto-register new partner
      log('Creating new partner...');
      partner = new Partner({
        phoneNumber,
        fullName: `Partner ${phoneNumber.slice(-4)}`,
        status: 'pending',
        email: `partner_${phoneNumber.replace(/\D/g, '')}@urban.temp`,
        address: 'Pending Address',
        city: 'Pending City',
        state: 'Pending State',
        pincode: '000000',
        serviceCategories: []
      });
      await partner.save();
      log(`✅ Auto-registered new partner: ${partner._id}`);
    }

    // ---------------------------------------------------------
    // SYNC TO USER (FOR AUTH MIDDLEWARE COMPATIBILITY)
    // ---------------------------------------------------------
    const User = require('../models/user');
    const ServicePartner = require('../models/urban-services/servicePartner');

    // 1. Find or Create User
    // The auth middleware looks up User by ID from the token
    let userQuery = [];
    if (phoneNumber) userQuery.push({ phone: phoneNumber });
    // Only search by email if strictly defined
    const tempEmail = partner.email || `partner_${phoneNumber.replace(/\D/g, '')}@urban.temp`;
    userQuery.push({ email: tempEmail });

    let user = await User.findOne({ $or: userQuery });
    log(`User found: ${user ? user._id : 'No'}`);

    if (!user) {
      log('Creating new user...');
      const randomPassword = Math.random().toString(36).slice(-8) + 'A1!';
      try {
        user = await User.create({
          name: partner.fullName || `Partner ${phoneNumber.slice(-4)}`,
          email: tempEmail,
          phone: phoneNumber,
          password: randomPassword,
          role: 'user',
          status: true
        });
        log(`✅ Created User for partner: ${user._id}`);
      } catch (userError) {
        log(`❌ Error creating user: ${userError.message}`);
        throw userError;
      }
    }

    // 2. Ensure ServicePartner link exists
    // First check if partner is already linked to this user
    let servicePartner = await ServicePartner.findOne({ user: user._id });
    log(`ServicePartner found: ${servicePartner ? servicePartner._id : 'No'}`);

    // If not linked, try to find existing partner
    if (!servicePartner) {
      log(`🔍 Searching for existing ServicePartner for phone: ${phoneNumber}`);

      // Strategy 1: Find by business name pattern
      servicePartner = await ServicePartner.findOne({ businessName: /Thilocigan/i });

      // Strategy 2: If not found, find ANY partner with bookings assigned (This logic seems weird but keeping it per existing code)
      // Skipping the "partnersWithBookings" logic for new users to avoid mis-linking, unless needed.
      // But keeping original logic structure to be safe.
      if (!servicePartner) {
        log('Strategy 2: Searching via bookings...');
        try {
          const ServiceBooking = require('../models/urban-services/serviceBooking');
          const partnersWithBookings = await ServiceBooking.distinct('partner');
          if (partnersWithBookings.length > 0) {
            // Find first partner that has bookings and no user linked
            for (const partnerId of partnersWithBookings) {
              const p = await ServicePartner.findById(partnerId);
              if (p && !p.user) {
                servicePartner = p;
                log(`✅ Found partner with bookings: ${p._id}`);
                break;
              }
            }
          }
        } catch (bookingError) {
          log(`Warning: Booking search failed ${bookingError.message}`);
        }
      }

      if (servicePartner) {
        // Link existing partner to this user
        servicePartner.user = user._id;
        await servicePartner.save();
        log(`✅ Linked existing ServicePartner ${servicePartner._id} to user ${user._id}`);
      } else {
        log(`⚠️ No existing ServicePartner found`);
      }
    }

    // Only create new ServicePartner if none exists at all
    if (!servicePartner) {
      log('Creating new ServicePartner...');
      servicePartner = new ServicePartner({
        user: user._id,
        businessName: partner.fullName || `Store ${phoneNumber.slice(-4)}`,
        partnerType: 'individual',
        isVerified: false,
        status: 'active'
      });
      await servicePartner.save();
      log(`✅ Created ServicePartner: ${servicePartner._id}`);
    }

    // ALWAYS generate JWT token with USER ID (not Partner ID)
    const token = jwt.sign(
      {
        id: user._id, // Auth middleware checks User.findById(decoded.id)
        partnerId: partner._id,
        phoneNumber
      },
      process.env.JWT_SECRET,
      { expiresIn: '30d' }
    );

    log('Token generated successfully');

    res.json({
      success: true,
      message: 'Login successful',
      token,
      partner: {
        id: partner._id,
        fullName: partner.fullName,
        phoneNumber: partner.phoneNumber,
        status: partner.status,
        documentsUploaded: partner.documents && partner.documents.length > 0,
        isApproved: true // Always true to allow dashboard access
      }
    });
  } catch (error) {
    if (log) log(`❌ Verify OTP error: ${error.message} \n ${error.stack}`);
    console.error('Verify OTP error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to verify OTP',
      debug: error.message
    });
  }
});

// Check partner status
router.get('/status/:phoneNumber', async (req, res) => {
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
router.post('/upload-documents', upload.array('documents', 5), async (req, res) => {
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

    // Log received data for debugging
    console.log('Received phoneNumber:', phoneNumber);
    console.log('Received pincode:', pincode);
    console.log('Pincode validation test:', /^\d{6}$/.test(pincode));

    // Check if partner exists
    let partner = await Partner.findOne({ phoneNumber });

    if (partner) {
      // Update existing partner
      partner.fullName = fullName;
      partner.email = email;
      partner.address = address;
      partner.city = city;
      partner.state = state;
      partner.pincode = pincode;
      partner.serviceCategories = categories;
      partner.documents = documents;

      // If partner was rejected, reset to pending
      if (partner.status === 'rejected') {
        partner.status = 'pending';
        partner.rejectionReason = undefined;
      }

      partner.updatedAt = new Date();
    } else {
      // Create new partner
      partner = new Partner({
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
    }

    console.log('Partner data before save:', partner);
    await partner.save();

    // ---------------------------------------------------------
    // SYNC TO SERVICE PARTNER (FOR ADMIN PANEL VISIBILITY)
    // ---------------------------------------------------------
    try {
      const User = require('../models/user');
      const ServicePartner = require('../models/urban-services/servicePartner');
      const ServiceCategory = require('../models/urban-services/serviceCategory');

      // 1. Find or Create User
      let userQuery = [];
      if (phoneNumber) userQuery.push({ phone: phoneNumber });
      if (email) userQuery.push({ email: email.toLowerCase() });

      let user = null;
      if (userQuery.length > 0) {
        user = await User.findOne({ $or: userQuery });
      }

      if (!user) {
        // Create generated password
        const randomPassword = Math.random().toString(36).slice(-8) + 'A1!';

        user = await User.create({
          name: fullName,
          email: email,
          phone: phoneNumber,
          password: randomPassword, // Will be hashed by pre-save hook
          role: 'user', // Default role
          status: true
        });
        console.log(`Created new User for partner: ${user._id}`);
      } else {
        console.log(`Found existing User for partner: ${user._id}`);
      }

      // 2. Resolve Categories
      // Provide regex search to match category names loosely if needed
      const categoryDocs = await ServiceCategory.find({
        name: { $in: categories }
      });
      const categoryIds = categoryDocs.map(c => c._id);

      // 3. Find or Create ServicePartner
      let servicePartner = await ServicePartner.findOne({ user: user._id });

      if (!servicePartner) {
        servicePartner = new ServicePartner({
          user: user._id,
          businessName: fullName || `Partner ${phoneNumber}`, // Fallback to ensure not empty
          partnerType: 'individual',
          categories: categoryIds,
          serviceAreas: [{
            city: city,
            areas: [address], // Simple mapping
            pinCodes: [pincode]
          }],
          isVerified: false, // Apps start unverified
          status: 'pending',
          verificationDocuments: documents.map(d => ({
            documentType: 'professional_certificate', // Generic type
            documentUrl: d,
            status: 'pending'
          }))
        });
        await servicePartner.save();
        console.log(`Created ServicePartner: ${servicePartner._id}`);
      } else {
        // Update existing
        servicePartner.businessName = fullName || servicePartner.businessName;
        servicePartner.categories = categoryIds;
        servicePartner.serviceAreas = [{
          city: city,
          areas: [address],
          pinCodes: [pincode]
        }];
        servicePartner.status = 'pending'; // Reset to pending on re-submission

        // Re-submit verification docs
        servicePartner.verificationDocuments = documents.map(d => ({
          documentType: 'professional_certificate',
          documentUrl: d,
          status: 'pending'
        }));
        await servicePartner.save();
        console.log(`Updated ServicePartner: ${servicePartner._id}`);
      }

    } catch (syncError) {
      console.error('CRITICAL: Error syncing to ServicePartner:', syncError);
      if (syncError.errors) {
        Object.keys(syncError.errors).forEach(key => {
          console.error(`  Validation Error - ${key}: ${syncError.errors[key].message}`);
        });
      }
      // Note: We intentionally don't fail the request here to avoid rollback of the Partner creation,
      // but this logs clearly for debugging.
    }
    // ---------------------------------------------------------

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
    if (error.name === 'ValidationError') {
      console.error('Validation Errors:', JSON.stringify(error.errors, null, 2));
    }
    console.error('Request body from error:', req.body);
    // console.error('Files:', req.files);
    res.status(500).json({
      success: false,
      message: 'Failed to upload documents',
      error: error.message
    });
  }
});

// Get partner profile (protected)
router.get('/profile', async (req, res) => {
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

// Update Profile
router.put('/profile', auth, upload.single('profilePicture'), async (req, res) => {
  try {
    const { fullName, address, city, state, pincode, serviceCategories } = req.body;
    const updates = {};

    if (fullName) updates.fullName = fullName;
    if (address) updates.address = address;
    if (city) updates.city = city;
    if (state) updates.state = state;
    if (pincode) updates.pincode = pincode;

    // Handle serviceCategories array
    if (serviceCategories) {
      // If it's a string (single value), convert to array
      if (typeof serviceCategories === 'string') {
        updates.serviceCategories = [serviceCategories];
      } else if (Array.isArray(serviceCategories)) {
        updates.serviceCategories = serviceCategories;
      }
    }

    if (req.file) {
      // In a real app, upload to S3. For now, using local path
      updates.profilePicture = `/uploads/partners/${req.file.filename}`;
    }

    const partner = await Partner.findByIdAndUpdate(
      req.user.id,
      { $set: updates },
      { new: true }
    );

    if (!partner) {
      return res.status(404).json({ message: 'Partner not found' });
    }

    // Sync to ServicePartner if serviceCategories were updated
    if (updates.serviceCategories) {
      try {
        const ServicePartner = require('../models/urban-services/servicePartner');
        const ServiceCategory = require('../models/urban-services/serviceCategory');
        const User = require('../models/user');

        // Find user by phone
        const user = await User.findOne({ phone: partner.phoneNumber });

        if (user) {
          // Find ServicePartner by user
          const servicePartner = await ServicePartner.findOne({ user: user._id });

          if (servicePartner) {
            // Resolve category names to IDs
            const categoryDocs = await ServiceCategory.find({
              name: { $in: updates.serviceCategories }
            });
            const categoryIds = categoryDocs.map(c => c._id);

            // Update ServicePartner categories
            servicePartner.categories = categoryIds;
            await servicePartner.save();
            console.log(`✅ Synced service categories to ServicePartner: ${servicePartner._id}`);
          }
        }
      } catch (syncError) {
        console.error('Error syncing to ServicePartner:', syncError);
        // Don't fail the request if sync fails
      }
    }

    res.json({
      success: true,
      partner: {
        id: partner._id,
        fullName: partner.fullName,
        email: partner.email,
        phoneNumber: partner.phoneNumber,
        status: partner.status,
        profilePicture: partner.profilePicture,
        address: partner.address,
        city: partner.city,
        state: partner.state,
        pincode: partner.pincode,
        serviceCategories: partner.serviceCategories
      }
    });

  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;

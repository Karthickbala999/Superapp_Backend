const ServicePartner = require('../../models/urban-services/servicePartner');
const ServiceBooking = require('../../models/urban-services/serviceBooking');
const ServiceReview = require('../../models/urban-services/serviceReview');
const User = require('../../models/user');
const ServiceCategory = require('../../models/urban-services/serviceCategory');
const asyncHandler = require('express-async-handler');

// @desc    Register as service partner
// @route   POST /api/urban-services/partners/register
// @access  Private
const registerPartner = asyncHandler(async (req, res) => {
  const {
    businessName,
    partnerType,
    categories,
    serviceAreas,
    experience,
    skills,
    bankDetails
  } = req.body;

  // Check if already registered as partner
  const existingPartner = await ServicePartner.findOne({ user: req.user._id });
  if (existingPartner) {
    return res.status(400).json({
      success: false,
      message: 'Already registered as service partner'
    });
  }

  const partner = new ServicePartner({
    user: req.user._id,
    businessName,
    partnerType,
    categories,
    serviceAreas,
    experience,
    skills,
    bankDetails
  });

  const savedPartner = await partner.save();
  await savedPartner.populate([
    'user',
    'categories',
    'userDetails'
  ]);

  res.status(201).json({
    success: true,
    data: savedPartner
  });
});

// @desc    Get partner profile
// @route   GET /api/urban-services/partners/profile
// @access  Private/Partner
const getPartnerProfile = asyncHandler(async (req, res) => {
  try {
    const partner = await ServicePartner.findOne({ user: req.user._id })
      .populate('categories', 'name icon')
      .populate('user', 'name email phone profilePicture')
      .populate('verificationDocuments.documentType');

    if (!partner) {
      console.log('ℹ️ Partner profile not found for user:', req.user._id);
      return res.status(404).json({
        success: false,
        message: 'Partner profile not found'
      });
    }

    res.json({
      success: true,
      data: {
        ...partner.toObject(),
        fullName: partner.user?.name || partner.businessName,
        email: partner.user?.email,
        phoneNumber: partner.user?.phone,
        profilePicture: partner.user?.profilePicture,
        serviceCategories: partner.categories?.map(c => c.name) || []
      }
    });
  } catch (error) {
    console.error('❌ Error in getPartnerProfile:', error);
    res.status(500).json({ success: false, message: 'Server error fetching profile' });
  }
});

// @desc    Update partner profile
// @route   PUT /api/urban-services/partners/profile
// @access  Private/Partner
const updatePartnerProfile = asyncHandler(async (req, res) => {
  console.log('📝 Received profile update request for user:', req.user._id);
  console.log('📦 Data received:', JSON.stringify(req.body).substring(0, 500) + '...');

  let partner = await ServicePartner.findOne({ user: req.user._id });

  if (!partner) {
    console.log('➕ Creating new partner profile for user:', req.user._id);
    partner = new ServicePartner({
      user: req.user._id,
      businessName: req.body.fullName || 'New Partner',
      status: 'active'
    });
  }

  const { fullName, email, address, city, state, pincode, serviceCategories, profilePicture, phoneNumber } = req.body;

  // Update User model fields
  try {
    const user = await User.findById(req.user._id);
    if (user) {
      if (fullName) user.name = fullName;
      if (email) user.email = email;
      if (phoneNumber) user.phone = phoneNumber;
      if (profilePicture) user.profilePicture = profilePicture;
      await user.save();
      console.log('✅ User model updated');
    }
  } catch (userError) {
    console.error('❌ Error updating user model:', userError.message);
    return res.status(400).json({ success: false, message: 'User update failed: ' + userError.message });
  }

  // Update Partner model fields
  if (fullName) partner.businessName = fullName;

  // Map address fields to serviceAreas if needed
  if (address || city || state || pincode) {
    partner.serviceAreas = [{
      city: city || (partner.serviceAreas && partner.serviceAreas[0]?.city) || '',
      areas: [address || ''],
      pinCodes: [pincode || '']
    }];
  }

  // Update Service Categories (Map names to IDs)
  if (serviceCategories && Array.isArray(serviceCategories)) {
    console.log('🔍 Mapping categories:', serviceCategories);
    const categories = await ServiceCategory.find({
      name: { $in: serviceCategories }
    });
    partner.categories = categories.map(c => c._id);
    console.log('✅ Categories mapped:', partner.categories.length);
  }

  try {
    const updatedPartner = await partner.save();
    await updatedPartner.populate(['user', 'categories']);
    console.log('✅ Partner model updated successfully');

    res.json({
      success: true,
      message: 'Profile updated successfully',
      data: {
        ...updatedPartner.toObject(),
        fullName: updatedPartner.user?.name || updatedPartner.businessName,
        email: updatedPartner.user?.email,
        phoneNumber: updatedPartner.user?.phone,
        profilePicture: updatedPartner.user?.profilePicture,
        serviceCategories: updatedPartner.categories?.map(c => c.name) || []
      }
    });
  } catch (partnerError) {
    console.error('❌ Error updating partner model:', partnerError.message);
    res.status(400).json({ success: false, message: 'Partner update failed: ' + partnerError.message });
  }
});

// @desc    Upload verification documents
// @route   POST /api/urban-services/partners/documents
// @access  Private/Partner
const uploadDocuments = asyncHandler(async (req, res) => {
  const { documents } = req.body;

  const partner = await ServicePartner.findOne({ user: req.user._id });

  if (!partner) {
    return res.status(404).json({
      success: false,
      message: 'Partner profile not found'
    });
  }

  documents.forEach(doc => {
    partner.verificationDocuments.push({
      ...doc,
      status: 'pending'
    });
  });

  await partner.save();

  res.json({
    success: true,
    message: 'Documents uploaded successfully',
    data: partner.verificationDocuments
  });
});

// @desc    Get available partners for service
// @route   GET /api/urban-services/partners/available
// @access  Public
const getAvailablePartners = asyncHandler(async (req, res) => {
  const { category, city, page = 1, limit = 10 } = req.query;

  let query = {
    isVerified: true,
    isAvailable: true,
    status: 'active'
  };

  if (category) {
    query.categories = category;
  }

  if (city) {
    query['serviceAreas.city'] = city;
  }

  const partners = await ServicePartner.find(query)
    .populate('user', 'name phone')
    .populate('categories', 'name icon')
    .sort({ rating: -1, totalBookings: -1 })
    .limit(limit * 1)
    .skip((page - 1) * limit);

  const total = await ServicePartner.countDocuments(query);

  res.json({
    success: true,
    count: partners.length,
    total,
    pages: Math.ceil(total / limit),
    data: partners
  });
});

// @desc    Get partner earnings
// @route   GET /api/urban-services/partners/earnings
// @access  Private/Partner
const getPartnerEarnings = asyncHandler(async (req, res) => {
  const { period = 'monthly', year, month } = req.query;

  const partner = await ServicePartner.findOne({ user: req.user._id });
  if (!partner) {
    return res.status(404).json({
      success: false,
      message: 'Partner profile not found'
    });
  }

  let startDate, endDate;
  const currentDate = new Date();

  if (period === 'daily') {
    startDate = new Date(currentDate.setHours(0, 0, 0, 0));
    endDate = new Date(currentDate.setHours(23, 59, 59, 999));
  } else if (period === 'weekly') {
    startDate = new Date(currentDate.setDate(currentDate.getDate() - currentDate.getDay()));
    startDate.setHours(0, 0, 0, 0);
    endDate = new Date(currentDate.setDate(currentDate.getDate() + 6));
    endDate.setHours(23, 59, 59, 999);
  } else if (period === 'monthly') {
    const targetYear = year || currentDate.getFullYear();
    const targetMonth = month !== undefined ? month : currentDate.getMonth();
    startDate = new Date(targetYear, targetMonth, 1);
    endDate = new Date(targetYear, targetMonth + 1, 0, 23, 59, 59, 999);
  } else if (period === 'yearly') {
    const targetYear = year || currentDate.getFullYear();
    startDate = new Date(targetYear, 0, 1);
    endDate = new Date(targetYear, 11, 31, 23, 59, 59, 999);
  }

  const bookings = await ServiceBooking.find({
    partner: partner._id,
    status: 'completed',
    'tracking.serviceEndTime': { $gte: startDate, $lte: endDate }
  });

  const totalEarnings = bookings.reduce((sum, booking) => {
    return sum + (booking.pricing.totalAmount * (1 - partner.commissionRate / 100));
  }, 0);

  const completedBookings = bookings.length;
  const averageEarningPerBooking = completedBookings > 0 ? totalEarnings / completedBookings : 0;

  res.json({
    success: true,
    data: {
      period,
      totalEarnings,
      completedBookings,
      averageEarningPerBooking,
      commissionRate: partner.commissionRate,
      walletBalance: partner.wallet.balance
    }
  });
});

// @desc    Update partner availability
// @route   PUT /api/urban-services/partners/availability
// @access  Private/Partner
const updateAvailability = asyncHandler(async (req, res) => {
  const { isAvailable, workingHours } = req.body;

  const partner = await ServicePartner.findOne({ user: req.user._id });

  if (!partner) {
    return res.status(404).json({
      success: false,
      message: 'Partner profile not found'
    });
  }

  if (isAvailable !== undefined) {
    partner.isAvailable = isAvailable;
  }

  if (workingHours) {
    partner.workingHours = { ...partner.workingHours, ...workingHours };
  }

  await partner.save();

  res.json({
    success: true,
    data: {
      isAvailable: partner.isAvailable,
      workingHours: partner.workingHours
    }
  });
});

// @desc    Get partner dashboard stats
// @route   GET /api/urban-services/partners/dashboard
// @access  Private/Partner
const getPartnerDashboard = asyncHandler(async (req, res) => {
  const partner = await ServicePartner.findOne({ user: req.user._id });

  if (!partner) {
    return res.status(404).json({
      success: false,
      message: 'Partner profile not found'
    });
  }

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  // Today's bookings
  const todayBookings = await ServiceBooking.find({
    partner: partner._id,
    scheduledDate: { $gte: today, $lt: tomorrow }
  });

  // Pending bookings
  const pendingBookings = await ServiceBooking.find({
    partner: partner._id,
    status: { $in: ['pending', 'accepted', 'on_the_way'] }
  });

  // Recent reviews
  const recentReviews = await ServiceReview.find({
    partner: partner._id
  })
    .populate('customer', 'name')
    .sort({ createdAt: -1 })
    .limit(5);

  // Monthly earnings
  const thisMonth = new Date();
  thisMonth.setDate(1);
  thisMonth.setHours(0, 0, 0, 0);

  const monthlyBookings = await ServiceBooking.find({
    partner: partner._id,
    status: 'completed',
    'tracking.serviceEndTime': { $gte: thisMonth }
  });

  const monthlyEarnings = monthlyBookings.reduce((sum, booking) => {
    return sum + (booking.pricing.totalAmount * (1 - partner.commissionRate / 100));
  }, 0);

  res.json({
    success: true,
    data: {
      todayBookings: todayBookings.length,
      pendingBookings: pendingBookings.length,
      monthlyEarnings,
      monthlyBookings: monthlyBookings.length,
      rating: partner.rating,
      totalReviews: partner.totalReviews,
      walletBalance: partner.wallet.balance,
      recentReviews
    }
  });
});

// @desc    Get all partners (admin)
// @route   GET /api/urban-services/partners
// @access  Private/Admin
const getAllPartners = asyncHandler(async (req, res) => {
  const { status, verified, city, page = 1, limit = 10 } = req.query;

  let query = {};

  if (status) {
    query.status = status;
  }

  if (verified !== undefined) {
    query.isVerified = verified === 'true';
  }

  if (city) {
    query['serviceAreas.city'] = city;
  }

  const partners = await ServicePartner.find(query)
    .populate('user', 'name email phone')
    .populate('categories', 'name')
    .sort({ updatedAt: -1 })
    .limit(limit * 1 || 100)
    .skip((page - 1) * limit);

  const total = await ServicePartner.countDocuments(query);

  res.json({
    success: true,
    count: partners.length,
    total,
    pages: Math.ceil(total / limit),
    data: partners
  });
});

// @desc    Verify partner (admin)
// @route   PUT /api/urban-services/partners/:id/verify
// @access  Private/Admin
const verifyPartner = asyncHandler(async (req, res) => {
  const { isVerified, rejectionReason } = req.body;

  const partner = await ServicePartner.findById(req.params.id);

  if (!partner) {
    return res.status(404).json({
      success: false,
      message: 'Partner not found'
    });
  }

  partner.isVerified = isVerified;
  if (!isVerified && rejectionReason) {
    partner.rejectionReason = rejectionReason;
  }

  await partner.save();

  res.json({
    success: true,
    message: `Partner ${isVerified ? 'verified' : 'rejected'} successfully`,
    data: partner
  });
});

module.exports = {
  registerPartner,
  getPartnerProfile,
  updatePartnerProfile,
  uploadDocuments,
  getAvailablePartners,
  getPartnerEarnings,
  updateAvailability,
  getPartnerDashboard,
  getAllPartners,
  verifyPartner
};

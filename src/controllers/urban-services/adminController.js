const ServiceBooking = require('../../models/urban-services/serviceBooking');
const ServicePartner = require('../../models/urban-services/servicePartner');
const ServiceCategory = require('../../models/urban-services/serviceCategory');
const asyncHandler = require('express-async-handler');

// @desc    Get all bookings for admin
// @route   GET /api/urban-services/bookings/admin
// @access  Private/Admin
const getAdminBookings = asyncHandler(async (req, res) => {
  const { status, page = 1, limit = 10 } = req.query;

  let query = {};
  if (status) {
    query.status = status;
  }

  const bookings = await ServiceBooking.find(query)
    .populate('customer', 'name email phone coordinates')
    .populate('address')
    .populate({
      path: 'partner',
      select: 'businessName user',
      populate: { path: 'user', select: 'name phone' }
    })
    .populate('category', 'name')
    .sort({ createdAt: -1 })
    .limit(limit * 1)
    .skip((page - 1) * limit);

  const total = await ServiceBooking.countDocuments(query);

  res.status(200).json({
    success: true,
    count: bookings.length,
    total,
    data: bookings
  });
});

// @desc    Get all partners for admin
// @route   GET /api/urban-services/partners/admin
// @access  Private/Admin
const getAdminPartners = asyncHandler(async (req, res) => {
  const { status, page = 1, limit = 100 } = req.query;

  let query = {};
  if (status) {
    query.status = status;
  }

  const partners = await ServicePartner.find(query)
    .populate('user', 'name email phone')
    .sort({ createdAt: -1 })
    .limit(limit * 1)
    .skip((page - 1) * limit);

  const total = await ServicePartner.countDocuments(query);

  res.status(200).json({
    success: true,
    count: partners.length,
    total,
    data: partners
  });
});

// @desc    Verify partner
// @route   PUT /api/urban-services/partners/:id/verify
// @access  Private/Admin
const verifyPartner = asyncHandler(async (req, res) => {
  const partner = await ServicePartner.findByIdAndUpdate(
    req.params.id,
    { isVerified: true, status: 'active' },
    { new: true }
  ).populate('user');

  if (!partner) {
    return res.status(404).json({
      success: false,
      message: 'Partner not found'
    });
  }

  // ---------------------------------------------------------
  // SYNC BACK TO PARTNER (FOR MOBILE APP)
  // ---------------------------------------------------------
  if (partner.user && partner.user.phone) {
    const Partner = require('../../models/Partner'); // Mobile App Partner Model

    // Find partner by phone
    const mobilePartner = await Partner.findOne({ phoneNumber: partner.user.phone });

    if (mobilePartner) {
      mobilePartner.status = 'approved';
      await mobilePartner.save();
      console.log(`Synced approval to Mobile Partner: ${mobilePartner._id}`);
    } else {
      console.log(`Mobile Partner not found for phone: ${partner.user.phone}`);
    }
  }
  // ---------------------------------------------------------

  res.status(200).json({
    success: true,
    data: partner
  });
});

// @desc    Get dashboard stats for admin
// @route   GET /api/urban-services/admin/stats
// @access  Private/Admin
const getAdminStats = asyncHandler(async (req, res) => {
  const [
    totalBookings,
    pendingBookings,
    completedBookings,
    totalPartners,
    verifiedPartners,
    totalCategories
  ] = await Promise.all([
    ServiceBooking.countDocuments(),
    ServiceBooking.countDocuments({ status: 'pending' }),
    ServiceBooking.countDocuments({ status: 'completed' }),
    ServicePartner.countDocuments(),
    ServicePartner.countDocuments({ isVerified: true }),
    ServiceCategory.countDocuments({ isActive: true })
  ]);

  res.status(200).json({
    success: true,
    data: {
      totalBookings,
      pendingBookings,
      completedBookings,
      totalPartners,
      verifiedPartners,
      totalCategories
    }
  });
});

// @desc    Delete partner
// @route   DELETE /api/urban-services/partners/:id
// @access  Private/Admin
const deletePartner = asyncHandler(async (req, res) => {
  const partner = await ServicePartner.findById(req.params.id);

  if (!partner) {
    return res.status(404).json({
      success: false,
      message: 'Partner not found'
    });
  }

  // Populate first to get phone number for linking
  const partnerWithUser = await ServicePartner.findById(req.params.id).populate('user');

  if (partnerWithUser && partnerWithUser.user) {
    if (partnerWithUser.user.phone) {
      const Partner = require('../../models/Partner');
      const mobilePartner = await Partner.findOne({ phoneNumber: partnerWithUser.user.phone });
      if (mobilePartner) {
        await Partner.findByIdAndDelete(mobilePartner._id);
        console.log(`Deleted Mobile Partner: ${mobilePartner._id}`);
      }
    }
    const User = require('../../models/user');
    await User.findByIdAndDelete(partnerWithUser.user._id);
    console.log(`Deleted User: ${partnerWithUser.user._id}`);
  }

  await ServicePartner.findByIdAndDelete(req.params.id);

  res.status(200).json({
    success: true,
    message: 'Partner deleted successfully'
  });
});

// @desc    Assign categories to partner
// @route   PUT /api/urban-services/partners/:id/assign-categories
// @access  Private/Admin
const assignCategoriesToPartner = asyncHandler(async (req, res) => {
  const { categories } = req.body;

  if (!categories || !Array.isArray(categories)) {
    return res.status(400).json({
      success: false,
      message: 'Categories must be an array'
    });
  }

  const partner = await ServicePartner.findByIdAndUpdate(
    req.params.id,
    { categories },
    { new: true }
  ).populate('user').populate('categories');

  if (!partner) {
    return res.status(404).json({
      success: false,
      message: 'Partner not found'
    });
  }

  res.status(200).json({
    success: true,
    data: partner
  });
});

module.exports = {
  getAdminBookings,
  getAdminPartners,
  verifyPartner,
  getAdminStats,
  deletePartner,
  assignCategoriesToPartner
};

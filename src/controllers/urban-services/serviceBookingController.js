const mongoose = require('mongoose');
const ServiceBooking = require('../../models/urban-services/serviceBooking');
const ServicePartner = require('../../models/urban-services/servicePartner');
const ServiceCategory = require('../../models/urban-services/serviceCategory');
const ServiceReview = require('../../models/urban-services/serviceReview');
const asyncHandler = require('express-async-handler');
const User = require('../../models/user');

// Helper function to find partner with phone number fallback
const findPartnerWithFallback = async (userId) => {
  let partner = await ServicePartner.findOne({ user: userId });

  if (!partner) {
    const currentUser = await User.findById(userId);
    if (currentUser && currentUser.phone) {
      const usersWithPhone = await User.find({ phone: currentUser.phone });
      for (const u of usersWithPhone) {
        partner = await ServicePartner.findOne({ user: u._id });
        if (partner) {
          // partner.user = userId;
          // await partner.save();
          console.log(`✅ Found orphan partner ${partner._id} for user ${userId} via phone`);
          break;
        }
      }
    }
  }

  return partner;
};

// @desc    Create new service booking
// @route   POST /api/urban-services/bookings
// @access  Private
const createBooking = asyncHandler(async (req, res) => {
  const {
    category,
    service,
    address,
    customAddress,
    scheduledDate,
    scheduledTime,
    description,
    pricing
  } = req.body;

  // Validate required fields
  if (!category || !service) {
    return res.status(400).json({
      success: false,
      message: 'Category and Service IDs are required'
    });
  }

  // Find available partners (skip city filter for now since no partners exist)
  const partners = await ServicePartner.find({
    isVerified: true,
    isAvailable: true,
    status: 'active'
  }).populate('user', 'name phone email');

  // For now, create booking without partner assignment
  // Create booking without partner assignment (Admin will assign manually)
  let assignedPartner = null;
  // if (partners.length > 0) {
  //   assignedPartner = partners[0];
  // }

  // Get category details
  const categoryDetails = await ServiceCategory.findById(category);

  if (!categoryDetails) {
    return res.status(404).json({
      success: false,
      message: 'Service Category not found'
    });
  }

  // Generate booking number
  const bookingNumber = 'USR' + Date.now();

  // Create booking using Mongoose model
  const createdBooking = await ServiceBooking.create({
    customer: req.user.id || req.user._id,
    category,
    service,
    bookingNumber,
    title: categoryDetails.name ? `${categoryDetails.name} Service` : 'Urban Service',
    scheduledDate,
    scheduledTime,
    description,
    pricing,
    status: 'pending',
    estimatedDuration: 60,
    address: mongoose.Types.ObjectId.isValid(address) ? address : null,
    customAddress: customAddress || null,
    timeline: [{
      status: 'pending',
      timestamp: new Date(),
      note: 'Booking created'
    }]
  });

  console.log('Booking created successfully:', createdBooking._id);

  res.status(201).json({
    success: true,
    data: createdBooking
  });
});

// @desc    Get all bookings (customer)
// @route   GET /api/urban-services/bookings
// @access  Private
const getCustomerBookings = asyncHandler(async (req, res) => {
  const { status, page = 1, limit = 10 } = req.query;

  let query = { customer: req.user._id };

  if (status) {
    query.status = status;
  }

  const bookings = await ServiceBooking.find(query)
    .populate('customer', 'name email phone')
    .populate('partner')
    .populate('category', 'name icon')
    .populate('service', 'name')
    .sort({ createdAt: -1 })
    .limit(limit * 1)
    .skip((page - 1) * limit);

  const total = await ServiceBooking.countDocuments(query);

  res.json({
    success: true,
    count: bookings.length,
    total,
    pages: Math.ceil(total / limit),
    data: bookings
  });
});

// @desc    Get single booking
// @route   GET /api/urban-services/bookings/:id
// @access  Private
const getBookingById = asyncHandler(async (req, res) => {
  const booking = await ServiceBooking.findById(req.params.id)
    .populate('customer', 'name email phone')
    .populate('partner')
    .populate('category', 'name icon')
    .populate('service', 'name description');

  if (!booking) {
    return res.status(404).json({
      success: false,
      message: 'Booking not found'
    });
  }

  // Check if user is authorized to view this booking
  const partner = await ServicePartner.findOne({ user: req.user._id });
  if (booking.customer._id?.toString() !== req.user._id.toString() &&
    (!partner || booking.partner?._id?.toString() !== partner._id.toString()) &&
    req.user.role !== 'admin') {
    return res.status(403).json({
      success: false,
      message: 'Not authorized to view this booking'
    });
  }

  res.json({
    success: true,
    data: booking
  });
});

// @desc    Update booking status (partner)
// @route   PUT /api/urban-services/bookings/:id/status
// @access  Private/Partner
const updateBookingStatus = asyncHandler(async (req, res) => {
  const { status, notes, coordinates } = req.body;

  const booking = await ServiceBooking.findById(req.params.id);

  if (!booking) {
    return res.status(404).json({
      success: false,
      message: 'Booking not found'
    });
  }

  // Check authorization: Admin can update any booking, Partner can only update their assigned bookings
  const isAdmin = req.user.role === 'admin' || req.user.role === 'urban_services_admin';

  if (!isAdmin) {
    const partner = await ServicePartner.findOne({ user: req.user._id });

    // Special case: Allow accepting available (pending & unassigned) bookings
    const isAcceptingAvailable = status === 'accepted' &&
      booking.status === 'pending' &&
      (!booking.partner || booking.partner === null);

    if (isAcceptingAvailable) {
      if (!partner) {
        return res.status(403).json({ success: false, message: 'Partner profile not found' });
      }
      // Auto-assign the partner
      booking.partner = partner._id;
    } else {
      // Normal case: Must be assigned partner
      if (!partner || !booking.partner || booking.partner.toString() !== partner._id.toString()) {
        return res.status(403).json({
          success: false,
          message: 'Not authorized to update this booking'
        });
      }
    }
  }

  // Validate status transitions
  const validTransitions = {
    'pending': ['accepted', 'rejected'],
    'accepted': ['on_the_way', 'cancelled'],
    'on_the_way': ['in_progress', 'cancelled'],
    'in_progress': ['completed'],
    'completed': [],
    'cancelled': [],
    'rejected': []
  };

  if (!validTransitions[booking.status].includes(status)) {
    return res.status(400).json({
      success: false,
      message: `Cannot transition from ${booking.status} to ${status}`
    });
  }

  // Update timeline
  booking.timeline.push({
    status,
    timestamp: new Date(),
    note: notes,
    updatedBy: req.user._id
  });

  // Update tracking if partner is on the way
  if (status === 'on_the_way' && coordinates) {
    booking.tracking.partnerLocation = {
      lat: coordinates.lat,
      lng: coordinates.lng,
      lastUpdated: new Date()
    };
  }

  // Update service times
  if (status === 'on_the_way') {
    booking.tracking.estimatedArrival = new Date(Date.now() + 30 * 60 * 1000); // 30 mins
  } else if (status === 'in_progress') {
    booking.tracking.actualArrival = new Date();
    booking.tracking.serviceStartTime = new Date();
  } else if (status === 'completed') {
    booking.tracking.serviceEndTime = new Date();
  }

  booking.status = status;

  const updatedBooking = await booking.save();
  await updatedBooking.populate([
    { path: 'customer', select: 'name email phone' },
    { path: 'partner' },
    { path: 'category', select: 'name icon' }
  ]);

  // Broadcast update via WebSocket
  const partnerWebSocket = require('../../websocket/partnerWebSocket');
  partnerWebSocket.sendBookingUpdate(updatedBooking);

  res.json({
    success: true,
    data: updatedBooking
  });
});

// @desc    Get partner bookings
// @route   GET /api/urban-services/partner/bookings
// @access  Private/Partner
const getPartnerBookings = asyncHandler(async (req, res) => {
  const { status, page = 1, limit = 10 } = req.query;

  const partner = await findPartnerWithFallback(req.user._id);
  if (!partner) {
    return res.status(404).json({
      success: false,
      message: 'Partner profile not found'
    });
  }

  let query = { partner: partner._id };

  if (status) {
    query.status = status;
  }

  const bookings = await ServiceBooking.find(query)
    .populate('customer', 'name phone')
    .populate('partner')
    .populate('category', 'name icon')
    .populate('service', 'name')
    .sort({ createdAt: -1 })
    .limit(limit * 1)
    .skip((page - 1) * limit);

  const total = await ServiceBooking.countDocuments(query);

  res.json({
    success: true,
    count: bookings.length,
    total,
    pages: Math.ceil(total / limit),
    data: bookings
  });
});

// @desc    Get all bookings (admin)
// @route   GET /api/urban-services/admin/bookings
// @access  Private/Admin
const getAdminBookings = asyncHandler(async (req, res) => {
  const { status, page = 1, limit = 10 } = req.query;

  let query = {};

  if (status) {
    query.status = status;
  }

  const bookings = await ServiceBooking.find(query)
    .populate('customer', 'name email phone')
    .populate('partner')
    .populate('category', 'name icon')
    .populate('service', 'name description')
    .sort({ createdAt: -1 })
    .limit(limit * 1)
    .skip((page - 1) * limit);

  const total = await ServiceBooking.countDocuments(query);

  res.json({
    success: true,
    count: bookings.length,
    total,
    pages: Math.ceil(total / limit),
    data: bookings
  });
});

// @desc    Update partner location
// @route   PUT /api/urban-services/bookings/:id/location
// @access  Private/Partner
const updatePartnerLocation = asyncHandler(async (req, res) => {
  const { lat, lng } = req.body;

  const booking = await ServiceBooking.findById(req.params.id);

  if (!booking) {
    return res.status(404).json({
      success: false,
      message: 'Booking not found'
    });
  }

  const partner = await ServicePartner.findOne({ user: req.user._id });
  if (!partner || booking.partner.toString() !== partner._id.toString()) {
    return res.status(403).json({
      success: false,
      message: 'Not authorized to update this booking'
    });
  }

  booking.tracking.partnerLocation = {
    lat,
    lng,
    lastUpdated: new Date()
  };

  await booking.save();

  res.json({
    success: true,
    message: 'Location updated successfully'
  });
});

// @desc    Upload booking images
// @route   POST /api/urban-services/bookings/:id/images
// @access  Private/Partner
const uploadBookingImages = asyncHandler(async (req, res) => {
  const { type, images } = req.body; // type: 'before' or 'after'

  const booking = await ServiceBooking.findById(req.params.id);

  if (!booking) {
    return res.status(404).json({
      success: false,
      message: 'Booking not found'
    });
  }

  const partner = await ServicePartner.findOne({ user: req.user._id });
  if (!partner || booking.partner.toString() !== partner._id.toString()) {
    return res.status(403).json({
      success: false,
      message: 'Not authorized to update this booking'
    });
  }

  if (type === 'before') {
    booking.images.before = [...booking.images.before, ...images];
  } else if (type === 'after') {
    booking.images.after = [...booking.images.after, ...images];
  } else {
    return res.status(400).json({
      success: false,
      message: 'Invalid image type. Must be "before" or "after"'
    });
  }

  await booking.save();

  res.json({
    success: true,
    data: booking.images
  });
});

// @desc    Update booking destination/location manually
// @route   PUT /api/urban-services/bookings/:id/destination
// @access  Private/Partner
const updateBookingDestination = asyncHandler(async (req, res) => {
  const { address, city, pinCode, coordinates } = req.body;

  const booking = await ServiceBooking.findById(req.params.id);

  if (!booking) {
    return res.status(404).json({
      success: false,
      message: 'Booking not found'
    });
  }

  // Update custom address
  booking.customAddress = {
    addressLine1: address,
    city: city || booking.customAddress?.city || 'Unknown',
    pinCode: pinCode || booking.customAddress?.pinCode || '',
    coordinates: {
      lat: coordinates.lat,
      lng: coordinates.lng
    }
  };

  await booking.save();

  res.json({
    success: true,
    data: booking
  });
});

// @desc    Add booking review
// @route   POST /api/urban-services/bookings/:id/review
// @access  Private/Customer
const addBookingReview = asyncHandler(async (req, res) => {
  const { rating, title, comment, aspects } = req.body;

  const booking = await ServiceBooking.findById(req.params.id);

  if (!booking) {
    return res.status(404).json({
      success: false,
      message: 'Booking not found'
    });
  }

  if (booking.customer.toString() !== req.user._id.toString()) {
    return res.status(403).json({
      success: false,
      message: 'Not authorized to review this booking'
    });
  }

  if (booking.status !== 'completed') {
    return res.status(400).json({
      success: false,
      message: 'Can only review completed bookings'
    });
  }

  // Check if review already exists
  const existingReview = await ServiceReview.findOne({ booking: booking._id });
  if (existingReview) {
    return res.status(400).json({
      success: false,
      message: 'Review already exists for this booking'
    });
  }

  const review = new ServiceReview({
    booking: booking._id,
    customer: req.user._id,
    partner: booking.partner,
    rating,
    title,
    comment,
    aspects
  });

  await review.save();

  // Update partner rating
  const partner = await ServicePartner.findById(booking.partner);
  const allReviews = await ServiceReview.find({ partner: partner._id });
  const totalRating = allReviews.reduce((sum, r) => sum + r.rating, 0);
  partner.rating = totalRating / allReviews.length;
  partner.totalReviews = allReviews.length;
  await partner.save();

  res.status(201).json({
    success: true,
    data: review
  });
});

// @desc    Assign partner to booking (admin)
// @route   PUT /api/urban-services/bookings/:id/assign-partner
// @access  Private/Admin
const assignPartner = asyncHandler(async (req, res) => {
  const { partnerId } = req.body;
  const { id } = req.params;

  console.log(`[AssignPartner] Request for Booking ${id} with Partner ${partnerId}`);

  if (!partnerId) {
    res.status(400);
    throw new Error('Partner ID is required');
  }

  // Validate ObjectId format to prevent CastErrors
  if (!mongoose.Types.ObjectId.isValid(partnerId)) {
    res.status(400);
    throw new Error('Invalid Partner ID format');
  }

  // Use findByIdAndUpdate for atomic operation, avoiding VersionError and some validation complexities
  const updatedBooking = await ServiceBooking.findByIdAndUpdate(
    id,
    {
      partner: partnerId,
      status: 'pending' // Reset status to allow partner acceptance
    },
    { new: true, runValidators: false } // Skip validators to strict avoid 500s on unrelated fields
  );

  if (!updatedBooking) {
    res.status(404);
    throw new Error('Booking not found');
  }

  console.log(`[AssignPartner] Success: Booking ${updatedBooking._id} assigned to ${partnerId}`);

  res.json({
    success: true,
    data: updatedBooking
  });
});

// @desc    Get available bookings (pending assigned)
// @route   GET /api/urban-services/bookings/available
// @access  Private/Partner
const getAvailableBookings = asyncHandler(async (req, res) => {
  console.log('🔍 getAvailableBookings called for user:', req.user._id);

  const partner = await findPartnerWithFallback(req.user._id);
  console.log('Partner found:', partner ? `${partner.businessName} (${partner._id})` : 'NULL');

  if (!partner) {
    console.log('❌ Returning 404 - Partner not found');
    return res.status(404).json({
      success: false,
      message: 'Partner profile not found'
    });
  }

  // Find bookings assigned to this partner with status 'pending' or 'accepted'
  const bookings = await ServiceBooking.find({
    partner: partner._id,
    status: { $in: ['pending', 'accepted'] }
  })
    .populate('customer', 'name phone')
    .populate('category', 'name icon')
    .populate('service', 'name')
    .sort({ createdAt: -1 });

  res.json({
    success: true,
    count: bookings.length,
    data: bookings
  });
});

module.exports = {
  createBooking,
  getCustomerBookings,
  getBookingById,
  updateBookingStatus,
  getPartnerBookings,
  getAdminBookings,
  updatePartnerLocation,
  uploadBookingImages,
  addBookingReview,
  assignPartner,
  getAvailableBookings,
  updateBookingDestination
};

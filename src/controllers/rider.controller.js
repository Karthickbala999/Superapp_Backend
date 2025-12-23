const mongoose = require('mongoose');
const Rider = require('../models/rider');
const OrderAssignment = require('../models/orderAssignment');
const PorterBooking = require('../models/porterbooking');
const TaxiRide = require('../models/taxiride');
const GroceryOrder = require('../models/groceryorder');
const jwt = require('jsonwebtoken');
const asyncHandler = require('express-async-handler');


// @desc    Register rider
// @route   POST /api/riders/register
// @access  Public
exports.registerRider = asyncHandler(async (req, res, next) => {
  const {
    name,
    email,
    phone,
    password,
    vehicle_type,
    license_number,
    vehicle_number,
    vehicle_model,
    vehicle_color
  } = req.body;

  // Check if rider already exists
  const existingRider = await Rider.findOne({
    $or: [{ email }, { phone }]
  });

  if (existingRider) {
    res.status(400);
    throw new Error('Rider with this email or phone already exists');
  }

  // Create rider
  const rider = await Rider.create({
    name,
    email,
    phone,
    password,
    vehicle_type,
    license_number,
    vehicle_number,
    vehicle_model,
    vehicle_color
  });

  // Generate JWT token
  const token = jwt.sign(
    { id: rider._id, type: 'rider' },
    process.env.JWT_SECRET || 'your-super-secret-jwt-key',
    { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
  );

  res.status(201).json({
    success: true,
    token,
    data: rider
  });
});

// @desc    Login rider
// @route   POST /api/riders/login
// @access  Public
exports.loginRider = asyncHandler(async (req, res, next) => {
  const { email, phone, password } = req.body;

  // Validate email/phone and password
  if (!password) {
    res.status(400);
    throw new Error('Please provide password');
  }

  if (!email && !phone) {
    res.status(400);
    throw new Error('Please provide email or phone');
  }

  // Check for rider
  const rider = await Rider.findOne({
    $or: [{ email }, { phone }]
  }).select('+password');

  if (!rider) {
    res.status(401);
    throw new Error('Invalid credentials');
  }

  // Check if password matches
  const isMatch = await rider.comparePassword(password);

  if (!isMatch) {
    res.status(401);
    throw new Error('Invalid credentials');
  }

  // Check if rider is active or pending verification
  if (rider.status !== 'active' && rider.status !== 'pending_verification') {
    res.status(401);
    throw new Error('Account is not active. Please contact support.');
  }

  // Update last active
  rider.last_active = new Date();
  await rider.save();

  // Generate JWT token
  const token = jwt.sign(
    { id: rider._id, type: 'rider' },
    process.env.JWT_SECRET || 'your-super-secret-jwt-key',
    { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
  );

  res.json({
    success: true,
    token,
    data: rider
  });
});

// @desc    Get rider profile
// @route   GET /api/riders/profile
// @access  Private
exports.getRiderProfile = asyncHandler(async (req, res, next) => {
  const rider = await Rider.findById(req.rider.id);

  res.json({
    success: true,
    data: rider
  });
});

// @desc    Update rider profile
// @route   PUT /api/riders/profile
// @access  Private
exports.updateRiderProfile = asyncHandler(async (req, res, next) => {
  const fieldsToUpdate = {
    name: req.body.name,
    vehicle_model: req.body.vehicle_model,
    vehicle_color: req.body.vehicle_color,
    documents: req.body.documents,
    bank_details: req.body.bank_details,
    preferences: req.body.preferences
  };

  // Remove undefined fields
  Object.keys(fieldsToUpdate).forEach(key => 
    fieldsToUpdate[key] === undefined && delete fieldsToUpdate[key]
  );

  const rider = await Rider.findByIdAndUpdate(
    req.rider.id,
    fieldsToUpdate,
    {
      new: true,
      runValidators: true
    }
  );

  res.json({
    success: true,
    data: rider
  });
});

// @desc    Update rider location
// @route   POST /api/riders/location
// @access  Private
exports.updateLocation = asyncHandler(async (req, res, next) => {
  const { latitude, longitude } = req.body;

  if (!latitude || !longitude) {
    res.status(400);
    throw new Error('Latitude and longitude are required');
  }

  const rider = await Rider.findByIdAndUpdate(
    req.rider.id,
    {
      current_location: {
        latitude,
        longitude,
        updated_at: new Date()
      },
      last_active: new Date()
    },
    { new: true }
  );

  res.json({
    success: true,
    data: rider
  });
});

// @desc    Toggle online status
// @route   PUT /api/riders/online-status
// @access  Private
exports.toggleOnlineStatus = asyncHandler(async (req, res, next) => {
  const rider = await Rider.findById(req.rider.id);
  
  rider.is_online = !rider.is_online;
  rider.last_active = new Date();
  
  await rider.save();

  res.json({
    success: true,
    data: {
      is_online: rider.is_online,
      message: rider.is_online ? 'You are now online' : 'You are now offline'
    }
  });
});

// @desc    Get available orders
// @route   GET /api/riders/orders/available
// @access  Private
exports.getAvailableOrders = asyncHandler(async (req, res, next) => {
  const { order_type, vehicle_type } = req.query;
  
  // Get rider preferences
  const rider = await Rider.findById(req.rider.id);
  
  // Build query for available orders
  let query = {};
  
  if (order_type) {
    query.order_type = order_type;
  }
  
  if (vehicle_type) {
    query.vehicle_type = vehicle_type;
  }

  // Get orders that haven't been assigned yet
  const availableOrders = [];

  // Check Porter Bookings
  if (!order_type || order_type === 'porter') {
    const porterBookings = await PorterBooking.find({
      status: 'pending',
      payment_status: 'completed'
    }).populate('user', 'name phone');

    for (const booking of porterBookings) {
      // Check if already assigned
      const existingAssignment = await OrderAssignment.findOne({
        order_id: booking._id,
        order_type: 'porter',
        status: { $in: ['assigned', 'accepted'] }
      });

      if (!existingAssignment) {
        availableOrders.push({
          id: booking._id,
          type: 'porter',
          pickup: booking.pickup_location.address,
          dropoff: booking.dropoff_location.address,
          fare: booking.fare,
          distance: booking.distance,
          vehicle_type: booking.vehicle_type,
          customer: booking.user?.name || 'Customer',
          customer_phone: booking.user?.phone || '',
          created_at: booking.createdAt,
          item_description: booking.item_description,
          special_instructions: booking.special_instructions
        });
      }
    }
  }

  // Check Taxi Rides
  if (!order_type || order_type === 'taxi') {
    const taxiRides = await TaxiRide.find({
      status: 'pending',
      payment_status: 'paid'
    }).populate('user', 'name phone');

    for (const ride of taxiRides) {
      const existingAssignment = await OrderAssignment.findOne({
        order_id: ride._id,
        order_type: 'taxi',
        status: { $in: ['assigned', 'accepted'] }
      });

      if (!existingAssignment) {
        availableOrders.push({
          id: ride._id,
          type: 'taxi',
          pickup: ride.pickup_location.address,
          dropoff: ride.dropoff_location.address,
          fare: ride.fare,
          distance: ride.distance,
          vehicle_type: 'Car',
          customer: ride.user?.name || 'Customer',
          customer_phone: ride.user?.phone || '',
          created_at: ride.createdAt
        });
      }
    }
  }

  // Check Grocery Orders
  if (!order_type || order_type === 'grocery') {
    const groceryOrders = await GroceryOrder.find({
      status: 'confirmed',
      payment_status: 'paid'
    }).populate('user', 'name phone');

    for (const order of groceryOrders) {
      const existingAssignment = await OrderAssignment.findOne({
        order_id: order._id,
        order_type: 'grocery',
        status: { $in: ['assigned', 'accepted'] }
      });

      if (!existingAssignment) {
        availableOrders.push({
          id: order._id,
          type: 'grocery',
          pickup: 'Grocery Store', // You might want to add store location
          dropoff: order.address,
          fare: order.total_amount * 0.1, // 10% delivery fee
          distance: 0, // Calculate based on store location
          vehicle_type: 'Bike',
          customer: order.user?.name || 'Customer',
          customer_phone: order.user?.phone || '',
          created_at: order.createdAt,
          item_description: 'Grocery items'
        });
      }
    }
  }

  // Sort by creation time (newest first)
  availableOrders.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));

  res.json({
    success: true,
    data: availableOrders
  });
});

// @desc    Accept order assignment
// @route   POST /api/riders/orders/:orderId/accept
// @access  Private
exports.acceptOrder = asyncHandler(async (req, res, next) => {
  const { orderId } = req.params;
  const { order_type } = req.body;

  console.log('Accept order request:', { orderId, order_type, rider: req.rider?.id });

  if (!order_type) {
    res.status(400);
    throw new Error('Order type is required');
  }

  // Validate orderId is a valid ObjectId
  if (!mongoose.Types.ObjectId.isValid(orderId)) {
    res.status(400);
    throw new Error('Invalid order ID format');
  }

  try {
    // Check if order is still available
    const existingAssignment = await OrderAssignment.findOne({
      order_id: orderId,
      order_type: order_type,
      status: { $in: ['assigned', 'accepted'] }
    });

    if (existingAssignment) {
      res.status(400);
      throw new Error('Order is already assigned');
    }

    // Verify the order exists in the appropriate collection
    let orderExists = false;
    if (order_type === 'grocery') {
      orderExists = await GroceryOrder.findById(orderId);
    } else if (order_type === 'porter') {
      orderExists = await PorterBooking.findById(orderId);
    } else if (order_type === 'taxi') {
      orderExists = await TaxiRide.findById(orderId);
    }

    if (!orderExists) {
      res.status(404);
      throw new Error(`Order not found in ${order_type} orders`);
    }

    // Create assignment
    const assignment = await OrderAssignment.create({
      order_id: orderId,
      order_type: order_type,
      rider_id: req.rider.id,
      status: 'accepted',
      accepted_at: new Date()
    });

    // Update rider stats
    await Rider.findByIdAndUpdate(req.rider.id, {
      $inc: { total_orders: 1 },
      last_active: new Date()
    });

    // Update the order status
    if (order_type === 'grocery') {
      await GroceryOrder.findByIdAndUpdate(orderId, { status: 'processing', rider_id: req.rider.id });
    } else if (order_type === 'porter') {
      await PorterBooking.findByIdAndUpdate(orderId, { status: 'accepted', driver_id: req.rider.id });
    } else if (order_type === 'taxi') {
      await TaxiRide.findByIdAndUpdate(orderId, { status: 'accepted', driver_id: req.rider.id });
    }

    console.log('Order accepted successfully:', assignment._id);

    res.json({
      success: true,
      data: assignment
    });
  } catch (error) {
    console.error('Error accepting order:', error);
    if (!res.headersSent) {
      res.status(error.status || 500);
      throw error;
    }
  }
});

// @desc    Update order status
// @route   PUT /api/riders/orders/:orderId/status
// @access  Private
exports.updateOrderStatus = asyncHandler(async (req, res, next) => {
  const { orderId } = req.params;
  const { status, order_type } = req.body;

  if (!status || !order_type) {
    res.status(400);
    throw new Error('Status and order type are required');
  }

  // Find assignment
  const assignment = await OrderAssignment.findOne({
    order_id: orderId,
    order_type: order_type,
    rider_id: req.rider.id
  });

  if (!assignment) {
    res.status(404);
    throw new Error('Order assignment not found');
  }

  // Update assignment status
  assignment.status = status;
  
  // Set timestamps based on status
  switch (status) {
    case 'picked_up':
      assignment.picked_up_at = new Date();
      break;
    case 'delivered':
      assignment.delivered_at = new Date();
      break;
    case 'completed':
      assignment.completed_at = new Date();
      // Update rider earnings
      await Rider.findByIdAndUpdate(req.rider.id, {
        $inc: { 
          total_earnings: assignment.earnings,
          completed_orders: 1
        }
      });
      break;
    case 'cancelled':
      assignment.cancelled_at = new Date();
      assignment.cancellation_reason = req.body.cancellation_reason;
      // Update rider stats
      await Rider.findByIdAndUpdate(req.rider.id, {
        $inc: { cancelled_orders: 1 }
      });
      break;
  }

  await assignment.save();

  res.json({
    success: true,
    data: assignment
  });
});

// @desc    Get rider earnings
// @route   GET /api/riders/earnings
// @access  Private
exports.getRiderEarnings = asyncHandler(async (req, res, next) => {
  const { period = 'all' } = req.query;
  
  const rider = await Rider.findById(req.rider.id);
  
  // Get assignments for the period
  let dateFilter = {};
  const now = new Date();
  
  switch (period) {
    case 'today':
      dateFilter = {
        createdAt: {
          $gte: new Date(now.getFullYear(), now.getMonth(), now.getDate())
        }
      };
      break;
    case 'week':
      const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      dateFilter = { createdAt: { $gte: weekAgo } };
      break;
    case 'month':
      const monthAgo = new Date(now.getFullYear(), now.getMonth() - 1, now.getDate());
      dateFilter = { createdAt: { $gte: monthAgo } };
      break;
  }

  const assignments = await OrderAssignment.find({
    rider_id: req.rider.id,
    status: 'completed',
    ...dateFilter
  });

  const totalEarnings = assignments.reduce((sum, assignment) => sum + assignment.earnings, 0);
  const totalOrders = assignments.length;

  res.json({
    success: true,
    data: {
      total_earnings: totalEarnings,
      total_orders: totalOrders,
      period: period,
      assignments: assignments
    }
  });
});

// @desc    Get rider order history
// @route   GET /api/riders/orders
// @access  Private
exports.getRiderOrders = asyncHandler(async (req, res, next) => {
  const { status, order_type, limit = 50, page = 1 } = req.query;
  
  const query = { rider_id: req.rider.id };
  
  if (status) query.status = status;
  if (order_type) query.order_type = order_type;

  const assignments = await OrderAssignment.find(query)
    .populate('rider', 'name phone vehicle_type')
    .sort({ assigned_at: -1 })
    .limit(parseInt(limit))
    .skip((parseInt(page) - 1) * parseInt(limit));

  const total = await OrderAssignment.countDocuments(query);

  res.json({
    success: true,
    data: assignments,
    pagination: {
      current_page: parseInt(page),
      total_pages: Math.ceil(total / parseInt(limit)),
      total_items: total,
      items_per_page: parseInt(limit)
    }
  });
});

// ==================== ADMIN CONTROLLERS ====================

// @desc    Get all riders (admin)
// @route   GET /api/riders
// @access  Admin
exports.getAllRiders = asyncHandler(async (req, res, next) => {
  const { status, vehicle_type, limit = 50, page = 1 } = req.query;
  
  const query = {};
  
  if (status) query.status = status;
  if (vehicle_type) query.vehicle_type = vehicle_type;

  const riders = await Rider.find(query)
    .select('-password')
    .sort({ createdAt: -1 })
    .limit(parseInt(limit))
    .skip((parseInt(page) - 1) * parseInt(limit));

  const total = await Rider.countDocuments(query);

  res.json({
    success: true,
    data: riders,
    pagination: {
      current_page: parseInt(page),
      total_pages: Math.ceil(total / parseInt(limit)),
      total_items: total,
      items_per_page: parseInt(limit)
    }
  });
});

// @desc    Get rider by ID (admin)
// @route   GET /api/riders/:id
// @access  Admin
exports.getRiderById = asyncHandler(async (req, res, next) => {
  const rider = await Rider.findById(req.params.id).select('-password');
  
  if (!rider) {
    return res.status(404).json({
      success: false,
      message: 'Rider not found'
    });
  }

  // Get rider's order assignments
  const assignments = await OrderAssignment.find({ rider_id: req.params.id })
    .populate('order_id')
    .sort({ assigned_at: -1 })
    .limit(10);

  res.json({
    success: true,
    data: {
      ...rider.toObject(),
      recent_assignments: assignments
    }
  });
});

// @desc    Update rider status (admin)
// @route   PUT /api/riders/:id/status
// @access  Admin
exports.updateRiderStatus = asyncHandler(async (req, res, next) => {
  const { status } = req.body;
  
  if (!['pending_verification', 'active', 'inactive', 'suspended'].includes(status)) {
    return res.status(400).json({
      success: false,
      message: 'Invalid status'
    });
  }

  const rider = await Rider.findByIdAndUpdate(
    req.params.id,
    { status },
    { new: true }
  ).select('-password');

  if (!rider) {
    return res.status(404).json({
      success: false,
      message: 'Rider not found'
    });
  }

  res.json({
    success: true,
    data: rider,
    message: `Rider status updated to ${status}`
  });
});

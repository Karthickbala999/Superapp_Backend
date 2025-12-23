const Booking = require('../models/booking');

// Controller functions
const getAllBookings = async (req, res) => {
  console.log('Controller: getAllBookings', req.path, req.params);
  try {
    const bookings = await Booking.find()
      .populate('hotel', 'name address')
      .populate('room', 'name type')
      .populate('user', 'name email phone')
      .sort({ createdAt: -1 });
    res.json(bookings);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const getBookingById = async (req, res) => {
  console.log('Controller: getBookingById', req.path, req.params);
  try {
    const booking = await Booking.findById(req.params.id)
      .populate('hotel', 'name address')
      .populate('room', 'name type')
      .populate('user', 'name email phone');
    if (!booking) return res.status(404).json({ error: 'Booking not found' });
    res.json(booking);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const createBooking = async (req, res) => {
  console.log('🚨 CREATE BOOKING FUNCTION CALLED!');
  console.log('🔍 AUTH HEADER:', req.headers.authorization);
  console.log('🔍 req.user object:', req.user);
  console.log('🔍 req.user._id:', req.user?._id);
  console.log('🔍 req.user.id:', req.user?.id);
  console.log('Controller: createBooking', req.path, req.body);
  try {
    const userId = req.user && req.user.id;
    console.log('Creating booking with user_id:', userId);
    const bookingData = { ...req.body, user_id: userId };
    console.log('🔍 Final booking data to save:', bookingData);
    const booking = new Booking(bookingData);
    await booking.save();
    console.log('✅ Booking created successfully with ID:', booking._id);
    console.log('✅ Saved booking user_id:', booking.user_id);
    res.status(201).json(booking);
  } catch (err) {
    console.error('❌ Error creating booking:', err);
    res.status(400).json({ error: err.message });
  }
};

const updateBooking = async (req, res) => {
  console.log('Controller: updateBooking', req.path, req.params, req.body);
  try {
    const booking = await Booking.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!booking) return res.status(404).json({ error: 'Booking not found' });
    res.json(booking);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

const deleteBooking = async (req, res) => {
  console.log('Controller: deleteBooking', req.path, req.params);
  try {
    const booking = await Booking.findByIdAndDelete(req.params.id);
    if (!booking) return res.status(404).json({ error: 'Booking not found' });
    res.json({ message: 'Booking deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const getMyBookings = async (req, res) => {
  console.log('Controller: getMyBookings', req.path, req.params, req.user);
  try {
    const userId = req.user && req.user.id;
    console.log('🔍 Looking for bookings with user_id:', userId);
    if (!userId) return res.status(401).json({ error: 'Not authenticated' });
    
    const bookings = await Booking.find({ user_id: userId })
      .populate('hotel')
      .populate('room')
      .populate('user')
      .sort({ createdAt: -1 }); // Sort by newest first
    
    console.log(`📋 Found ${bookings.length} bookings for user ${userId}`);
    console.log('Bookings:', bookings.map(b => ({ 
      id: b._id, 
      hotel: b.hotel?.name, 
      guest: b.name,
      contact: b.contact_number,
      checkIn: b.check_in_date,
      checkOut: b.check_out_date,
      guests: b.guests,
      totalAmount: b.final_amount
    })));
    
    console.log('🔍 Raw booking data for debugging:');
    bookings.forEach((b, index) => {
      console.log(`Booking ${index + 1}:`, {
        name: b.name,
        contact_number: b.contact_number,
        check_in_date: b.check_in_date,
        check_out_date: b.check_out_date,
        guests: b.guests,
        final_amount: b.final_amount
      });
    });
    
    // Transform bookings to match frontend expected format
    const transformedBookings = bookings.map(booking => ({
      _id: booking._id,
      hotel: booking.hotel,
      city: booking.hotel?.address?.city || 'City',
      bookingDetails: {
        name: booking.name,
        contact: booking.contact_number,
        checkIn: booking.check_in_date,
        checkOut: booking.check_out_date,
        guests: booking.guests,
        special: booking.special_requests,
        totalAmount: booking.final_amount
      }
    }));
    
    res.json(transformedBookings);
  } catch (err) {
    console.error('❌ Error in getMyBookings:', err);
    res.status(500).json({ error: err.message });
  }
};

const cancelBooking = async (req, res) => {
  console.log('Controller: cancelBooking', req.path, req.params);
  try {
    const booking = await Booking.findByIdAndUpdate(
      req.params.id,
      { 
        booking_status: 'cancelled',
        payment_status: 'failed',
        cancelled_at: new Date(),
        updatedAt: new Date()
      },
      { new: true }
    );
    
    if (!booking) {
      return res.status(404).json({ error: 'Booking not found' });
    }
    
    console.log('✅ Booking cancelled successfully:', booking._id);
    res.json({ 
      success: true, 
      message: 'Booking cancelled successfully',
      data: booking 
    });
  } catch (err) {
    console.error('❌ Error cancelling booking:', err);
    res.status(500).json({ error: err.message });
  }
};

module.exports = {
  getAllBookings,
  getBookingById,
  createBooking,
  updateBooking,
  deleteBooking,
  getMyBookings,
  cancelBooking,
};
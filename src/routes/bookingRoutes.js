'use strict';

const express = require('express');
const router = express.Router();
const bookingController = require('../controllers/bookingController');
const { protect, authorize } = require('../middlewares/auth.middleware');

// Test route to check if protect middleware works
router.get('/test-auth', protect, (req, res) => {
  console.log('🔍 TEST AUTH - req.user:', req.user);
  res.json({ message: 'Auth working', user: req.user });
});

// GET all bookings
router.get('/', bookingController.getAllBookings);

// GET my bookings (user's own bookings)
router.get('/my-bookings', protect, bookingController.getMyBookings);

// POST create a new booking
router.post('/', (req, res, next) => {
  console.log('🚨 POST ROUTE HIT - BEFORE PROTECT MIDDLEWARE');
  console.log('🔍 Headers:', req.headers);
  next();
}, protect, bookingController.createBooking);

// GET booking by ID
router.get('/:id', protect, authorize('admin', 'hotel_admin'), bookingController.getBookingById);

// PUT update a booking
router.put('/:id', protect, authorize('admin', 'hotel_admin'), bookingController.updateBooking);

// DELETE a booking
router.delete('/:id', protect, authorize('admin', 'hotel_admin'), bookingController.deleteBooking);

// Cancel booking
router.put('/:id/cancel', protect, bookingController.cancelBooking);

module.exports = router; 
const express = require('express');
const {
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
} = require('../../controllers/urban-services/serviceBookingController');
const { protect } = require('../../middlewares/auth.middleware');

const router = express.Router();






router.route('/available')
  .get((req, res, next) => {
    console.log('🎯 /available route HIT');
    next();
  }, protect, getAvailableBookings);






router.route('/')
  .post(protect, createBooking)
  .get(protect, getCustomerBookings);

router.route('/partner')
  .get(protect, getPartnerBookings);

router.route('/admin')
  .get(protect, getAdminBookings);

router.route('/:id')
  .get(protect, getBookingById);

router.route('/:id/status')
  .put(protect, updateBookingStatus);

router.route('/:id/location')
  .put(protect, updatePartnerLocation);

router.route('/:id/images')
  .post(protect, uploadBookingImages);

router.route('/:id/review')
  .post(protect, addBookingReview);

router.route('/:id/assign-partner')
  .put(protect, assignPartner);

router.route('/:id/destination')
  .put(protect, updateBookingDestination);

module.exports = router;

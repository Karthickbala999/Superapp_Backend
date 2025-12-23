const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middlewares/auth.middleware');
const controller = require('../controllers/porterBooking.controller');

// All routes require authentication
router.use(protect);

// User routes
router.get('/my-bookings', controller.getUserBookings); // MUST be before /:id route
router.post('/', controller.create);

// Admin routes
router.get('/', authorize('admin', 'porter_admin'), controller.getAll);
router.get('/:id', controller.getById);
router.put('/:id', authorize('admin', 'porter_admin'), controller.update);
router.patch('/:id/status', authorize('admin', 'porter_admin'), controller.updateStatus);
router.patch('/:id/rating', controller.addRating);
router.patch('/:id/inactivate', authorize('admin', 'porter_admin'), controller.inactivate);
router.delete('/:id', authorize('admin', 'porter_admin'), controller.delete);

// Cancel porter booking
router.put('/:id/cancel', controller.cancelBooking);

module.exports = router; 
const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middlewares/auth.middleware');
const taxiRideController = require('../controllers/taxiRide.controller');

// Get user's own rides (for regular users) - MUST be before /:id route
router.get('/my-rides', protect, taxiRideController.getUserRides);
// List all rides (admin only - optionally filter by user_id, driver_id, vehicle_id)
router.get('/', protect, authorize('admin', 'taxi_admin'), taxiRideController.getAll);
// Create ride
router.post('/', protect, taxiRideController.create);
// Get ride by ID
router.get('/:id', protect, authorize('admin', 'taxi_admin'), taxiRideController.getById);
// Update ride
router.put('/:id', protect, authorize('admin', 'taxi_admin'), taxiRideController.update);
// Delete ride
router.delete('/:id', protect, authorize('admin', 'taxi_admin'), taxiRideController.delete);

// Cancel taxi ride
router.put('/:id/cancel', protect, taxiRideController.cancelRide);

module.exports = router; 
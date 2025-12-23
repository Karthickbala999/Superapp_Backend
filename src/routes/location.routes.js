const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middlewares/auth.middleware');
const {
  getAllLocations,
  getLocationById,
  createLocation,
  updateLocation,
  toggleLocationStatus,
  deleteLocation
} = require('../controllers/location.controller');

// Apply auth middleware to all routes
router.use(protect);
router.use(authorize('admin'));

// Get all locations with pagination and search
router.get('/', getAllLocations);

// Get location by ID
router.get('/:id', getLocationById);

// Create new location
router.post('/', createLocation);

// Update location
router.put('/:id', updateLocation);

// Toggle location status
router.patch('/:id/toggle-status', toggleLocationStatus);

// Delete location
router.delete('/:id', deleteLocation);

module.exports = router; 
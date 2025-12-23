const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middlewares/auth.middleware');
const taxiDriverController = require('../controllers/taxiDriver.controller');

// List all drivers
router.get('/', protect, taxiDriverController.getAll);
// Smart driver assignment (for ride booking)
router.get('/available/assign', protect, taxiDriverController.getAvailableDriver);
// Get driver by ID
router.get('/:id', protect, authorize('admin', 'taxi_admin'), taxiDriverController.getById);
// Create driver
router.post('/', protect, authorize('admin', 'taxi_admin'), taxiDriverController.create);
// Update driver
router.put('/:id', protect, authorize('admin', 'taxi_admin'), taxiDriverController.update);
// Delete driver
router.delete('/:id', protect, authorize('admin', 'taxi_admin'), taxiDriverController.delete);

module.exports = router; 
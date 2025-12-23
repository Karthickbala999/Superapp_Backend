const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middlewares/auth.middleware');
const taxiVehicleController = require('../controllers/taxiVehicle.controller');

// List all vehicles
router.get('/', protect, taxiVehicleController.getAll);
// Get vehicle by ID
router.get('/:id', protect, authorize('admin', 'taxi_admin'), taxiVehicleController.getById);
// Create vehicle
router.post('/', protect, authorize('admin', 'taxi_admin'), taxiVehicleController.create);
// Update vehicle
router.put('/:id', protect, authorize('admin', 'taxi_admin'), taxiVehicleController.update);
// Delete vehicle
router.delete('/:id', protect, authorize('admin', 'taxi_admin'), taxiVehicleController.delete);

module.exports = router; 
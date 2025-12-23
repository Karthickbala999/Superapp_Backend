const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middlewares/auth.middleware');
const controller = require('../controllers/porterVehicle.controller');

// All routes require authentication
router.use(protect);

// Admin routes
router.get('/', authorize('admin', 'porter_admin'), controller.getAll);
router.get('/:id', authorize('admin', 'porter_admin'), controller.getById);
router.post('/', authorize('admin', 'porter_admin'), controller.create);
router.put('/:id', authorize('admin', 'porter_admin'), controller.update);
router.patch('/:id/status', authorize('admin', 'porter_admin'), controller.updateStatus);
router.delete('/:id', authorize('admin', 'porter_admin'), controller.delete);

// Get vehicles by driver
router.get('/driver/:driverId', authorize('admin', 'porter_admin'), controller.getByDriver);

// Get vehicles by type
router.get('/type/:vehicle_type', controller.getByType);

module.exports = router; 
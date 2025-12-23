const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middlewares/auth.middleware');
const controller = require('../controllers/porterDriver.controller');

// All routes require authentication
router.use(protect);

// Admin routes
router.get('/', authorize('admin', 'porter_admin'), controller.getAll);
router.get('/:id', authorize('admin', 'porter_admin'), controller.getById);
router.post('/', authorize('admin', 'porter_admin'), controller.create);
router.put('/:id', authorize('admin', 'porter_admin'), controller.update);
router.patch('/:id/status', authorize('admin', 'porter_admin'), controller.updateStatus);
router.delete('/:id', authorize('admin', 'porter_admin'), controller.delete);

// Get vehicles for a specific driver
router.get('/:id/vehicles', authorize('admin', 'porter_admin'), controller.getVehicles);

module.exports = router; 
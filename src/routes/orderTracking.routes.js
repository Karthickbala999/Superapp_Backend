const express = require('express');
const router = express.Router();
const orderTrackingController = require('../controllers/orderTracking.controller');

router.patch('/:orderId', orderTrackingController.updateTracking);
router.get('/:orderId', orderTrackingController.getTracking);

module.exports = router; 
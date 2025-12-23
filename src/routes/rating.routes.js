const express = require('express');
const router = express.Router();
const ratingController = require('../controllers/rating.controller');

router.post('/:orderId', ratingController.addRating);
router.get('/porter/:porterId', ratingController.getPorterRatings);

module.exports = router; 
const express = require('express');
const router = express.Router();
const amenityController = require('../controllers/amenity.controller');
const upload = require('../middlewares/upload.middleware');

router.get('/', amenityController.getAllAmenities);
router.get('/:id', amenityController.getAmenityById);
router.post('/', upload.single('icon'), amenityController.createAmenity);
router.put('/:id', upload.single('icon'), amenityController.updateAmenity);
router.delete('/:id', amenityController.deleteAmenity);
router.patch('/:id/toggle-status', amenityController.toggleStatus);

module.exports = router; 
const express = require('express');
const router = express.Router();
const controller = require('../controllers/productAttribute.Controller');
const upload = require('../middlewares/upload.middleware');
const { validateImage } = require('../middlewares/imageValidation.middleware');

// Create new attribute (with image upload and validation)
router.post('/', upload.single('attribute_image'), validateImage, controller.create);

// Get attributes for a product (updated path to avoid conflict)
router.get('/product/:product_id', controller.getByProduct);

// Update an attribute (with optional image upload)
router.put('/:id', upload.single('attribute_image'), controller.update);

// Delete an attribute
router.delete('/:id', controller.delete);

module.exports = router;

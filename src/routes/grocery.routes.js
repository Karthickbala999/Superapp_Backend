const express = require('express');
const router = express.Router();
const Grocery = require('../models/grocery');
const groceryController = require('../controllers/grocery.controller');
const upload = require('../middlewares/upload.middleware');
const { protect, authorize } = require('../middlewares/auth.middleware');
const { validateImage } = require('../middlewares/imageValidation.middleware');

// GET all groceries (public)
router.get('/', groceryController.getAllGroceries);

// GET grocery by ID (protected)
router.get('/:id', protect, authorize('admin', 'grocery_admin'), groceryController.getGroceryById);

// POST create grocery (with image upload, protected)
router.post('/', protect, authorize('admin', 'grocery_admin'), upload.single('image'), validateImage, groceryController.createGrocery);

// PUT update grocery (with image upload, protected)
router.put('/:id', protect, authorize('admin', 'grocery_admin'), upload.single('image'), groceryController.updateGrocery);

// DELETE grocery (protected)
router.delete('/:id', protect, authorize('admin', 'grocery_admin'), groceryController.deleteGrocery);

module.exports = router;
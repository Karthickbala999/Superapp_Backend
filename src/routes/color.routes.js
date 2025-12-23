const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middlewares/auth.middleware');

// Import color controller (we'll create this next)
const {
  getAllColors,
  getColorById,
  createColor,
  updateColor,
  deleteColor,
  bulkDeleteColors
} = require('../controllers/color.controller');

// Color routes
router.get('/get_all_colours', getAllColors);
router.get('/:id', getColorById);
router.post('/save_colour', protect, authorize('admin'), createColor);
router.put('/update_colour_by_id/:id', protect, authorize('admin'), updateColor);
router.delete('/delete_colour_by_id/:id', protect, authorize('admin'), deleteColor);
router.delete('/delete_colours', protect, authorize('admin'), bulkDeleteColors);

module.exports = router; 
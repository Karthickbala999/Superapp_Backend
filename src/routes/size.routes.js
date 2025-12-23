const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middlewares/auth.middleware');

// Import size controller (we'll create this next)
const {
  getAllSizes,
  getSizeById,
  createSize,
  updateSize,
  deleteSize,
  bulkDeleteSizes
} = require('../controllers/size.controller');

// Size routes
router.get('/get_all_size', getAllSizes);
router.get('/:id', getSizeById);
router.post('/save_size', protect, authorize('admin'), createSize);
router.put('/update_size_by_id/:id', protect, authorize('admin'), updateSize);
router.delete('/delete_size_by_id/:id', protect, authorize('admin'), deleteSize);
router.delete('/delete_sizes', protect, authorize('admin'), bulkDeleteSizes);

module.exports = router; 
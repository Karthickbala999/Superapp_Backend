const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middlewares/auth.middleware');

// Import unit controller (we'll create this next)
const {
  getAllUnits,
  getUnitById,
  createUnit,
  updateUnit,
  deleteUnit,
  bulkDeleteUnits
} = require('../controllers/unit.controller');

// Unit routes
router.get('/get_all_unit', getAllUnits);
router.get('/:id', getUnitById);
router.post('/save_unit', protect, authorize('admin'), createUnit);
router.put('/update_unit_by_id/:id', protect, authorize('admin'), updateUnit);
router.delete('/delete_unit_by_id/:id', protect, authorize('admin'), deleteUnit);
router.delete('/delete_units', protect, authorize('admin'), bulkDeleteUnits);

module.exports = router; 
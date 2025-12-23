const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middlewares/auth.middleware');
const { 
  getAllStaff, 
  getStaffById, 
  createStaff, 
  updateStaff, 
  deleteStaff 
} = require('../controllers/staff.controller');

// All routes require authentication and admin access
router.use(protect);
router.use(authorize('admin'));

// Get all staff
router.get('/', getAllStaff);

// Get staff by ID
router.get('/:id', getStaffById);

// Create new staff
router.post('/', createStaff);

// Update staff
router.put('/:id', updateStaff);

// Delete staff
router.delete('/:id', deleteStaff);

module.exports = router; 
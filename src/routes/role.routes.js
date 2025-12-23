const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middlewares/auth.middleware');
const { 
  getAllRoles, 
  getRoleById, 
  createRole, 
  updateRole, 
  deleteRole,
  assignRoleToUser,
  getRoleStats
} = require('../controllers/role.controller');

// All routes require authentication and admin access
router.use(protect);
router.use(authorize('admin'));

// Get all roles
router.get('/', getAllRoles);

// Get role by ID
router.get('/:id', getRoleById);

// Create new role
router.post('/', createRole);

// Update role
router.put('/:id', updateRole);

// Delete role
router.delete('/:id', deleteRole);

// Assign role to user
router.post('/assign', assignRoleToUser);

// Get role statistics
router.get('/stats', getRoleStats);

module.exports = router; 
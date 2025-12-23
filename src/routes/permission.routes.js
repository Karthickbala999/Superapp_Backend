const express = require('express');
const router = express.Router();
const permissionController = require('../controllers/permission.controller');
const { protect, authorize, hasResourcePermission } = require('../middlewares/auth.middleware');

// All routes require authentication
router.use(protect);

// Get all permissions (admin only)
router.get('/', authorize('admin'), permissionController.getAllPermissions);

// Get permissions by module
router.get('/module/:module', authorize('admin'), permissionController.getPermissionsByModule);

// Get permissions by category
router.get('/category/:category', authorize('admin'), permissionController.getPermissionsByCategory);

// Get permission statistics
router.get('/stats', authorize('admin'), permissionController.getPermissionStats);

// Create new permission (admin only)
router.post('/', authorize('admin'), permissionController.createPermission);

// Update permission (admin only)
router.put('/:id', authorize('admin'), permissionController.updatePermission);

// Delete permission (admin only)
router.delete('/:id', authorize('admin'), permissionController.deletePermission);

module.exports = router; 
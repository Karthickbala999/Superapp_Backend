const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../../middlewares/auth.middleware');
const {
  getAdminBookings,
  getAdminPartners,
  verifyPartner,
  getAdminStats,
  deletePartner,
  assignCategoriesToPartner
} = require('../../controllers/urban-services/adminController');

// Admin routes
router.use(protect);
router.use(authorize('admin', 'urban_services_admin'));

// Dashboard stats
router.get('/stats', getAdminStats);

// Bookings management
router.get('/bookings', getAdminBookings);

// Partners management (admin prefix)
router.get('/partners', getAdminPartners);
router.put('/partners/:id/verify', verifyPartner);
router.put('/partners/:id/assign-categories', assignCategoriesToPartner);
router.delete('/partners/:id', deletePartner);

module.exports = router;

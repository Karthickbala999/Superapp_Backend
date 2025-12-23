const express = require('express');
const {
  registerPartner,
  getPartnerProfile,
  updatePartnerProfile,
  uploadDocuments,
  getAvailablePartners,
  getPartnerEarnings,
  updateAvailability,
  getPartnerDashboard,
  getAllPartners,
  verifyPartner
} = require('../../controllers/urban-services/servicePartnerController');
const { protect, authorize } = require('../../middlewares/auth.middleware');

const router = express.Router();

router.route('/register')
  .post(protect, registerPartner);

router.route('/available')
  .get(getAvailablePartners);

router.route('/profile')
  .get(protect, getPartnerProfile)
  .put(protect, updatePartnerProfile);

router.route('/documents')
  .post(protect, uploadDocuments);

router.route('/earnings')
  .get(protect, getPartnerEarnings);

router.route('/availability')
  .put(protect, updateAvailability);

router.route('/dashboard')
  .get(protect, getPartnerDashboard);

router.route('/')
  .get(protect, authorize('admin'), getAllPartners);

router.route('/:id/verify')
  .put(protect, authorize('admin'), verifyPartner);

module.exports = router;

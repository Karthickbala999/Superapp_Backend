const express = require('express');
const {
  getServices,
  getServiceById,
  createService,
  updateService,
  deleteService,
  getServicesByCategory,
  searchServices,
  seedUrbanServices
} = require('../../controllers/urban-services/serviceController');
const { protect, authorize } = require('../../middlewares/auth.middleware');

const router = express.Router();

router.route('/')
  .get(getServices)
  .post(protect, authorize('admin'), createService);

router.route('/search')
  .get(searchServices);

router.route('/seed')
  .post(seedUrbanServices);

router.route('/category/:categoryId')
  .get(getServicesByCategory);

router.route('/:id')
  .get(getServiceById)
  .put(protect, authorize('admin'), updateService)
  .delete(protect, authorize('admin'), deleteService);

module.exports = router;

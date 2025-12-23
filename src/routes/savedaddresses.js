const express = require('express');
const {
  getSavedAddresses,
  createSavedAddress,
  updateSavedAddress,
  deleteSavedAddress
} = require('../controllers/savedaddressController');
const { protect } = require('../middlewares/auth.middleware');

const router = express.Router();

router.route('/')
  .get(protect, getSavedAddresses)
  .post(protect, createSavedAddress);

router.route('/:id')
  .put(protect, updateSavedAddress)
  .delete(protect, deleteSavedAddress);

module.exports = router;

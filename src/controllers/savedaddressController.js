const SavedAddress = require('../models/savedaddress');
const asyncHandler = require('express-async-handler');

// @desc    Get all saved addresses for a user
// @route   GET /api/saved-addresses
// @access  Private
const getSavedAddresses = asyncHandler(async (req, res) => {
  const addresses = await SavedAddress.find({ user: req.user._id })
    .sort({ createdAt: -1 });

  res.json({
    success: true,
    count: addresses.length,
    data: addresses
  });
});

// @desc    Create a new saved address
// @route   POST /api/saved-addresses
// @access  Private
const createSavedAddress = asyncHandler(async (req, res) => {
  const { label, address, lat, lng } = req.body;

  const savedAddress = await SavedAddress.create({
    user: req.user._id,
    label,
    address,
    lat,
    lng
  });

  res.status(201).json({
    success: true,
    data: savedAddress
  });
});

// @desc    Update a saved address
// @route   PUT /api/saved-addresses/:id
// @access  Private
const updateSavedAddress = asyncHandler(async (req, res) => {
  const { label, address, lat, lng } = req.body;

  const savedAddress = await SavedAddress.findOneAndUpdate(
    { _id: req.params.id, user: req.user._id },
    { label, address, lat, lng },
    { new: true, runValidators: true }
  );

  if (!savedAddress) {
    return res.status(404).json({
      success: false,
      message: 'Address not found'
    });
  }

  res.json({
    success: true,
    data: savedAddress
  });
});

// @desc    Delete a saved address
// @route   DELETE /api/saved-addresses/:id
// @access  Private
const deleteSavedAddress = asyncHandler(async (req, res) => {
  const savedAddress = await SavedAddress.findOneAndDelete({
    _id: req.params.id,
    user: req.user._id
  });

  if (!savedAddress) {
    return res.status(404).json({
      success: false,
      message: 'Address not found'
    });
  }

  res.json({
    success: true,
    message: 'Address deleted successfully'
  });
});

module.exports = {
  getSavedAddresses,
  createSavedAddress,
  updateSavedAddress,
  deleteSavedAddress
};

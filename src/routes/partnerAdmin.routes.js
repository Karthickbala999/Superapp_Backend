const express = require('express');
const router = express.Router();
const { Partner } = require('../models');
const { protect } = require('../middlewares/auth.middleware');

// Get all partners
router.get('/all', protect, async (req, res) => {
  try {
    const partners = await Partner.find({})
      .sort({ createdAt: -1 });
    
    res.json({
      success: true,
      partners
    });
  } catch (error) {
    console.error('Error fetching partners:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch partners'
    });
  }
});

// Get all pending partners
router.get('/pending', protect, async (req, res) => {
  try {
    const partners = await Partner.find({ status: 'pending' })
      .sort({ createdAt: -1 });
    
    res.json({
      success: true,
      partners
    });
  } catch (error) {
    console.error('Error fetching pending partners:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch pending partners'
    });
  }
});

// Approve partner
router.post('/:id/approve', protect, async (req, res) => {
  try {
    const partner = await Partner.findByIdAndUpdate(
      req.params.id,
      { status: 'approved' },
      { new: true }
    );
    
    if (!partner) {
      return res.status(404).json({
        success: false,
        message: 'Partner not found'
      });
    }
    
    res.json({
      success: true,
      message: 'Partner approved successfully',
      partner
    });
  } catch (error) {
    console.error('Error approving partner:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to approve partner'
    });
  }
});

// Reject partner
router.post('/:id/reject', protect, async (req, res) => {
  try {
    const partner = await Partner.findByIdAndUpdate(
      req.params.id,
      { status: 'rejected' },
      { new: true }
    );
    
    if (!partner) {
      return res.status(404).json({
        success: false,
        message: 'Partner not found'
      });
    }
    
    res.json({
      success: true,
      message: 'Partner rejected',
      partner
    });
  } catch (error) {
    console.error('Error rejecting partner:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to reject partner'
    });
  }
});

module.exports = router;

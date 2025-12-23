// OrderTracking Controller
const mongoose = require('mongoose');
const OrderTracking = require('../models/ordertracking');

module.exports = {
  // Update porter location for an order
  updateTracking: async (req, res) => {
    try {
      const { orderId } = req.params;
      const { porterLat, porterLng, speed, accuracy } = req.body;
      if (typeof porterLat !== 'number' || typeof porterLng !== 'number') {
        return res.status(400).json({ message: 'Invalid coordinates' });
      }
      const tracking = await OrderTracking.create({
        order: orderId,
        porterLat,
        porterLng,
        speed,
        accuracy
      });
      res.status(201).json({ message: 'Tracking updated', tracking });
    } catch (error) {
      res.status(500).json({ message: 'Error updating tracking', error: error.message });
    }
  },
  // Get tracking info for an order
  getTracking: async (req, res) => {
    try {
      const { orderId } = req.params;
      const trackingPoints = await OrderTracking.find({ order: orderId }).sort({ timestamp: 1 });
      res.status(200).json({ tracking: trackingPoints });
    } catch (error) {
      res.status(500).json({ message: 'Error fetching tracking info', error: error.message });
    }
  }
}; 
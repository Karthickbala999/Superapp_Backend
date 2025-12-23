const RecentTaxiLocation = require('../models/recenttaxilocation');

// Get all recent locations for the logged-in user
exports.getAll = async (req, res) => {
  try {
    const locations = await RecentTaxiLocation.find({ user_id: req.user.id })
      .sort({ timestamp: -1 })
      .limit(10);
    res.json({ success: true, data: locations });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Error fetching recent locations', error: err.message });
  }
};

// Add a recent location
exports.create = async (req, res) => {
  try {
    const { title, address } = req.body;
    // Remove duplicates
    await RecentTaxiLocation.deleteMany({ user_id: req.user.id, title, address });
    const location = await RecentTaxiLocation.create({ user_id: req.user.id, title, address });
    res.status(201).json({ success: true, data: location });
  } catch (err) {
    res.status(400).json({ success: false, message: 'Error adding recent location', error: err.message });
  }
};

// Delete a recent location
exports.delete = async (req, res) => {
  try {
    await RecentTaxiLocation.deleteOne({ _id: req.params.id, user_id: req.user.id });
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Error deleting recent location', error: err.message });
  }
}; 
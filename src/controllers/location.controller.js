const Location = require('../models/location');

// Get all locations
const getAllLocations = async (req, res) => {
  try {
    const { page = 1, limit = 10, search = '', status } = req.query;
    const skip = (page - 1) * limit;

    let query = {};
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }
    if (status !== undefined && status !== 'all') {
      query.status = status === 'true';
    }

    const locations = await Location.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Location.countDocuments(query);

    res.json({
      success: true,
      data: locations,
      total: total,
      currentPage: parseInt(page),
      totalPages: Math.ceil(total / limit)
    });
  } catch (error) {
    console.error('Error fetching locations:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

// Get location by ID
const getLocationById = async (req, res) => {
  try {
    const { id } = req.params;
    const location = await Location.findById(id);
    if (!location) {
      return res.status(404).json({ success: false, message: 'Location not found' });
    }
    res.json({ success: true, data: location });
  } catch (error) {
    console.error('Error fetching location:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

// Create new location
const createLocation = async (req, res) => {
  try {
    const { name, description } = req.body;
    if (!name) {
      return res.status(400).json({ success: false, message: 'Name is required' });
    }
    const location = await Location.create({
      name,
      description: description || null,
      status: true
    });
    res.status(201).json({ success: true, data: location });
  } catch (error) {
    console.error('Error creating location:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

// Update location
const updateLocation = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description } = req.body;
    const location = await Location.findById(id);
    if (!location) {
      return res.status(404).json({ success: false, message: 'Location not found' });
    }
    location.name = name || location.name;
    location.description = description !== undefined ? description : location.description;
    await location.save();
    res.json({ success: true, data: location });
  } catch (error) {
    console.error('Error updating location:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

// Toggle location status
const toggleLocationStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const location = await Location.findById(id);
    if (!location) {
      return res.status(404).json({ success: false, message: 'Location not found' });
    }
    location.status = !location.status;
    await location.save();
    res.json({ success: true, data: location });
  } catch (error) {
    console.error('Error toggling location status:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

// Delete location
const deleteLocation = async (req, res) => {
  try {
    const { id } = req.params;
    const location = await Location.findById(id);
    if (!location) {
      return res.status(404).json({ success: false, message: 'Location not found' });
    }
    await location.deleteOne();
    res.json({ success: true, message: 'Location deleted successfully' });
  } catch (error) {
    console.error('Error deleting location:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

module.exports = {
  getAllLocations,
  getLocationById,
  createLocation,
  updateLocation,
  toggleLocationStatus,
  deleteLocation
}; 
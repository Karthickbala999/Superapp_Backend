const Amenity = require('../models/amenity');

exports.getAllAmenities = async (req, res) => {
  try {
    const { status } = req.query;
    let filter = {};
    
    // Handle status filtering
    if (status === 'active') {
      filter.status = true;
    } else if (status === 'inactive') {
      filter.status = false;
    }
    
    const amenities = await Amenity.find(filter).sort({ createdAt: -1 });
    res.json({ success: true, data: amenities });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error fetching amenities', error: error.message });
  }
};

exports.getAmenityById = async (req, res) => {
  try {
    const amenity = await Amenity.findById(req.params.id);
    if (!amenity) return res.status(404).json({ success: false, message: 'Amenity not found' });
    res.json({ success: true, data: amenity });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error fetching amenity', error: error.message });
  }
};

exports.createAmenity = async (req, res) => {
  try {
    const { name, description, status } = req.body;
    let icon = req.body.icon;
    if (req.file) {
      icon = `/uploads/hotel_attributes/${req.file.filename}`;
    }
    const amenity = new Amenity({ name, description, icon, status });
    await amenity.save();
    res.status(201).json({ success: true, data: amenity });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error creating amenity', error: error.message });
  }
};

exports.updateAmenity = async (req, res) => {
  try {
    const { name, description, status } = req.body;
    let icon = req.body.icon;
    if (req.file) {
      icon = `/uploads/hotel_attributes/${req.file.filename}`;
    }
    const amenity = await Amenity.findById(req.params.id);
    if (!amenity) return res.status(404).json({ success: false, message: 'Amenity not found' });
    amenity.name = name || amenity.name;
    amenity.description = description || amenity.description;
    amenity.icon = icon || amenity.icon;
    if (typeof status !== 'undefined') amenity.status = status;
    await amenity.save();
    res.json({ success: true, data: amenity });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error updating amenity', error: error.message });
  }
};

exports.deleteAmenity = async (req, res) => {
  try {
    const amenity = await Amenity.findById(req.params.id);
    if (!amenity) return res.status(404).json({ success: false, message: 'Amenity not found' });
    await Amenity.deleteOne({ _id: req.params.id });
    res.json({ success: true, message: 'Amenity deleted' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error deleting amenity', error: error.message });
  }
};

exports.toggleStatus = async (req, res) => {
  try {
    const amenity = await Amenity.findById(req.params.id);
    if (!amenity) return res.status(404).json({ success: false, message: 'Amenity not found' });
    amenity.status = !amenity.status;
    await amenity.save();
    res.json({ success: true, data: amenity });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error toggling status', error: error.message });
  }
}; 
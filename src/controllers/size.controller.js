const Size = require('../models/size');

// Get all sizes
exports.getAllSizes = async (req, res) => {
  try {
    const sizes = await Size.find().sort({ createdAt: -1 });
    res.json(sizes);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get size by ID
exports.getSizeById = async (req, res) => {
  try {
    const size = await Size.findById(req.params.id);
    if (!size) {
      return res.status(404).json({ message: 'Size not found' });
    }
    res.json(size);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Create size
exports.createSize = async (req, res) => {
  try {
    const { name, status } = req.body;
    const size = new Size({
      name,
      status: typeof status !== 'undefined' ? (String(status) === 'true') : true
    });
    await size.save();
    res.status(201).json({
      success: true,
      message: 'Size created successfully',
      data: size
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error creating size',
      error: error.message
    });
  }
};

// Update size
exports.updateSize = async (req, res) => {
  try {
    const size = await Size.findById(req.params.id);
    if (!size) {
      return res.status(404).json({ message: 'Size not found' });
    }

    const { name, status } = req.body;
    size.name = name || size.name;
    size.status = typeof status !== 'undefined' ? (String(status) === 'true') : size.status;

    await size.save();
    res.json({
      success: true,
      message: 'Size updated successfully',
      data: size
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error updating size',
      error: error.message
    });
  }
};

// Delete size
exports.deleteSize = async (req, res) => {
  try {
    const size = await Size.findById(req.params.id);
    if (!size) {
      return res.status(404).json({ message: 'Size not found' });
    }

    await Size.findByIdAndDelete(req.params.id);
    res.json({
      success: true,
      message: 'Size deleted successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error deleting size',
      error: error.message
    });
  }
};

// Bulk delete sizes
exports.bulkDeleteSizes = async (req, res) => {
  try {
    const { ids } = req.body;
    if (!ids || !Array.isArray(ids)) {
      return res.status(400).json({
        success: false,
        message: 'Please provide an array of size IDs'
      });
    }

    await Size.deleteMany({ _id: { $in: ids } });
    res.json({
      success: true,
      message: `${ids.length} sizes deleted successfully`
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error deleting sizes',
      error: error.message
    });
  }
}; 
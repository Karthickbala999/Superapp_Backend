const Color = require('../models/color');

// Get all colors
exports.getAllColors = async (req, res) => {
  try {
    const colors = await Color.find().sort({ createdAt: -1 });
    res.json(colors);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get color by ID
exports.getColorById = async (req, res) => {
  try {
    const color = await Color.findById(req.params.id);
    if (!color) {
      return res.status(404).json({ message: 'Color not found' });
    }
    res.json(color);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Create color
exports.createColor = async (req, res) => {
  try {
    const { name, code, status } = req.body;
    const color = new Color({
      name,
      code,
      status: typeof status !== 'undefined' ? (String(status) === 'true') : true
    });
    await color.save();
    res.status(201).json({
      success: true,
      message: 'Color created successfully',
      data: color
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error creating color',
      error: error.message
    });
  }
};

// Update color
exports.updateColor = async (req, res) => {
  try {
    const color = await Color.findById(req.params.id);
    if (!color) {
      return res.status(404).json({ message: 'Color not found' });
    }

    const { name, code, status } = req.body;
    color.name = name || color.name;
    color.code = code || color.code;
    color.status = typeof status !== 'undefined' ? (String(status) === 'true') : color.status;

    await color.save();
    res.json({
      success: true,
      message: 'Color updated successfully',
      data: color
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error updating color',
      error: error.message
    });
  }
};

// Delete color
exports.deleteColor = async (req, res) => {
  try {
    const color = await Color.findById(req.params.id);
    if (!color) {
      return res.status(404).json({ message: 'Color not found' });
    }

    await Color.findByIdAndDelete(req.params.id);
    res.json({
      success: true,
      message: 'Color deleted successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error deleting color',
      error: error.message
    });
  }
};

// Bulk delete colors
exports.bulkDeleteColors = async (req, res) => {
  try {
    const { ids } = req.body;
    if (!ids || !Array.isArray(ids)) {
      return res.status(400).json({
        success: false,
        message: 'Please provide an array of color IDs'
      });
    }

    await Color.deleteMany({ _id: { $in: ids } });
    res.json({
      success: true,
      message: `${ids.length} colors deleted successfully`
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error deleting colors',
      error: error.message
    });
  }
}; 
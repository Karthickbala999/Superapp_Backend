const Unit = require('../models/unit');

// Get all units
exports.getAllUnits = async (req, res) => {
  try {
    const units = await Unit.find().sort({ createdAt: -1 });
    res.json(units);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get unit by ID
exports.getUnitById = async (req, res) => {
  try {
    const unit = await Unit.findById(req.params.id);
    if (!unit) {
      return res.status(404).json({ message: 'Unit not found' });
    }
    res.json(unit);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Create unit
exports.createUnit = async (req, res) => {
  try {
    const { name, status } = req.body;
    const unit = new Unit({
      name,
      status: typeof status !== 'undefined' ? (String(status) === 'true') : true
    });
    await unit.save();
    res.status(201).json({
      success: true,
      message: 'Unit created successfully',
      data: unit
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error creating unit',
      error: error.message
    });
  }
};

// Update unit
exports.updateUnit = async (req, res) => {
  try {
    const unit = await Unit.findById(req.params.id);
    if (!unit) {
      return res.status(404).json({ message: 'Unit not found' });
    }

    const { name, status } = req.body;
    unit.name = name || unit.name;
    unit.status = typeof status !== 'undefined' ? (String(status) === 'true') : unit.status;

    await unit.save();
    res.json({
      success: true,
      message: 'Unit updated successfully',
      data: unit
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error updating unit',
      error: error.message
    });
  }
};

// Delete unit
exports.deleteUnit = async (req, res) => {
  try {
    const unit = await Unit.findById(req.params.id);
    if (!unit) {
      return res.status(404).json({ message: 'Unit not found' });
    }

    await Unit.findByIdAndDelete(req.params.id);
    res.json({
      success: true,
      message: 'Unit deleted successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error deleting unit',
      error: error.message
    });
  }
};

// Bulk delete units
exports.bulkDeleteUnits = async (req, res) => {
  try {
    const { ids } = req.body;
    if (!ids || !Array.isArray(ids)) {
      return res.status(400).json({
        success: false,
        message: 'Please provide an array of unit IDs'
      });
    }

    await Unit.deleteMany({ _id: { $in: ids } });
    res.json({
      success: true,
      message: `${ids.length} units deleted successfully`
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error deleting units',
      error: error.message
    });
  }
}; 
const PorterDriver = require('../models/porterdriver');
const PorterVehicle = require('../models/portervehicle');

exports.getAll = async (req, res) => {
  try {
    const drivers = await PorterDriver.find({ is_active: true })
      .populate('user_id', 'name email phone')
      .populate('vehicles')
      .sort({ createdAt: -1 });
    res.json({ success: true, data: drivers });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Error fetching drivers', error: err.message });
  }
};

exports.getAvailable = async (req, res) => {
  try {
    const { vehicle_type } = req.query;
    let query = { status: 'available', is_active: true };
    
    if (vehicle_type) {
      query.vehicle_type = vehicle_type;
    }
    
    const drivers = await PorterDriver.find(query).sort({ rating: -1, total_deliveries: -1 });
    res.json({ success: true, data: drivers });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Error fetching available drivers', error: err.message });
  }
};

exports.getById = async (req, res) => {
  try {
    const driver = await PorterDriver.findById(req.params.id)
      .populate('user_id', 'name email phone')
      .populate('vehicles');
    
    if (!driver) {
      return res.status(404).json({ success: false, message: 'Driver not found' });
    }
    res.json({ success: true, data: driver });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Error fetching driver', error: err.message });
  }
};

exports.create = async (req, res) => {
  try {
    const {
      user_id,
      name,
      phone,
      email,
      license_number,
      current_location
    } = req.body;

    // Check if driver already exists
    const existingDriver = await PorterDriver.findOne({ 
      $or: [{ phone }, { license_number }] 
    });
    
    if (existingDriver) {
      return res.status(400).json({ 
        success: false, 
        message: 'Driver with this phone or license number already exists' 
      });
    }

    const driver = new PorterDriver({
      user_id,
      name,
      phone,
      email,
      license_number,
      current_location,
      status: 'active',
      is_active: true
    });

    await driver.save();

    const populatedDriver = await PorterDriver.findById(driver._id)
      .populate('user_id', 'name email phone');

    res.status(201).json({ 
      success: true, 
      message: 'Driver created successfully', 
      data: populatedDriver 
    });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Error creating driver', error: err.message });
  }
};

exports.update = async (req, res) => {
  try {
    const driver = await PorterDriver.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    ).populate('user_id', 'name email phone');

    if (!driver) {
      return res.status(404).json({ success: false, message: 'Driver not found' });
    }
    res.json({ success: true, message: 'Driver updated successfully', data: driver });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Error updating driver', error: err.message });
  }
};

exports.delete = async (req, res) => {
  try {
    const driver = await PorterDriver.findByIdAndUpdate(
      req.params.id,
      { is_active: false },
      { new: true }
    );

    if (!driver) {
      return res.status(404).json({ success: false, message: 'Driver not found' });
    }
    res.json({ success: true, message: 'Driver deactivated successfully' });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Error deactivating driver', error: err.message });
  }
};

exports.updateStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const driver = await PorterDriver.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true, runValidators: true }
    ).populate('user_id', 'name email phone');

    if (!driver) {
      return res.status(404).json({ success: false, message: 'Driver not found' });
    }
    res.json({ success: true, message: 'Driver status updated successfully', data: driver });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Error updating driver status', error: err.message });
  }
};

exports.updateLocation = async (req, res) => {
  try {
    const { latitude, longitude, address } = req.body;
    const driver = await PorterDriver.findByIdAndUpdate(
      req.params.id,
      { current_location: { latitude, longitude, address } },
      { new: true }
    );
    if (!driver) {
      return res.status(404).json({ success: false, message: 'Driver not found' });
    }
    res.json({ success: true, message: 'Driver location updated successfully', data: driver });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Error updating driver location', error: err.message });
  }
}; 

exports.getVehicles = async (req, res) => {
  try {
    const vehicles = await PorterVehicle.find({ driver_id: req.params.id })
      .populate('driver_id', 'name phone');
    
    res.json({ success: true, data: vehicles });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Error fetching driver vehicles', error: err.message });
  }
}; 
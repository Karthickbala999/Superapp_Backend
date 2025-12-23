const PorterVehicle = require('../models/portervehicle');
const PorterDriver = require('../models/porterdriver');

exports.getAll = async (req, res) => {
  try {
    const vehicles = await PorterVehicle.find({})
      .populate('driver_id', 'name phone email')
      .sort({ createdAt: -1 });
    res.json({ success: true, data: vehicles });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Error fetching vehicles', error: err.message });
  }
};

exports.getById = async (req, res) => {
  try {
    const vehicle = await PorterVehicle.findById(req.params.id)
      .populate('driver_id', 'name phone email');
    
    if (!vehicle) {
      return res.status(404).json({ success: false, message: 'Vehicle not found' });
    }
    res.json({ success: true, data: vehicle });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Error fetching vehicle', error: err.message });
  }
};

exports.create = async (req, res) => {
  try {
    const {
      vehicle_number,
      model,
      make,
      vehicle_type,
      capacity,
      driver_id,
      status
    } = req.body;

    console.log('PorterVehicle Controller - Received request body:', req.body);
    console.log('PorterVehicle Controller - driver_id value:', driver_id);

    // Check if driver exists (only if driver_id is provided)
    if (driver_id) {
      console.log('PorterVehicle Controller - Checking for driver with ID:', driver_id);
      const driver = await PorterDriver.findById(driver_id);
      console.log('PorterVehicle Controller - Driver found:', driver);
      if (!driver) {
        return res.status(400).json({ 
          success: false, 
          message: 'Driver not found' 
        });
      }
    } else {
      console.log('PorterVehicle Controller - No driver_id provided, vehicle will be created without driver assignment');
    }

    const vehicleData = {
      vehicle_number,
      model,
      make,
      vehicle_type,
      capacity,
      status: status || 'active'
    };
    
    // Only add driver_id if it's provided and valid
    if (driver_id) {
      vehicleData.driver_id = driver_id;
    }
    
    const vehicle = new PorterVehicle(vehicleData);
    await vehicle.save();

    const populatedVehicle = await PorterVehicle.findById(vehicle._id)
      .populate('driver_id', 'name phone');

    res.status(201).json({
      success: true,
      message: 'Vehicle created successfully',
      data: populatedVehicle
    });
  } catch (error) {
    console.error('PorterVehicle Controller - Error creating vehicle:', error);
    res.status(500).json({
      success: false,
      message: 'Error creating vehicle',
      error: error.message
    });
  }
};

exports.update = async (req, res) => {
  try {
    const vehicle = await PorterVehicle.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    ).populate('driver_id', 'name phone email');

    if (!vehicle) {
      return res.status(404).json({ success: false, message: 'Vehicle not found' });
    }
    res.json({ success: true, message: 'Vehicle updated successfully', data: vehicle });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Error updating vehicle', error: err.message });
  }
};

exports.updateStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const vehicle = await PorterVehicle.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true, runValidators: true }
    ).populate('driver_id', 'name phone email');

    if (!vehicle) {
      return res.status(404).json({ success: false, message: 'Vehicle not found' });
    }
    res.json({ success: true, message: 'Vehicle status updated successfully', data: vehicle });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Error updating vehicle status', error: err.message });
  }
};

exports.delete = async (req, res) => {
  try {
    const vehicle = await PorterVehicle.findByIdAndDelete(req.params.id);

    if (!vehicle) {
      return res.status(404).json({ success: false, message: 'Vehicle not found' });
    }
    res.json({ success: true, message: 'Vehicle deleted successfully' });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Error deleting vehicle', error: err.message });
  }
};

exports.getByDriver = async (req, res) => {
  try {
    const vehicles = await PorterVehicle.find({ driver_id: req.params.driverId })
      .populate('driver_id', 'name phone email');
    
    res.json({ success: true, data: vehicles });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Error fetching driver vehicles', error: err.message });
  }
};

exports.getByType = async (req, res) => {
  try {
    const { vehicle_type } = req.params;
    const vehicles = await PorterVehicle.find({ 
      vehicle_type,
      status: 'active'
    }).populate('driver_id', 'name phone email');
    
    res.json({ success: true, data: vehicles });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Error fetching vehicles by type', error: err.message });
  }
}; 
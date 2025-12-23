const TaxiVehicle = require('../models/taxivehicle');
const TaxiDriver = require('../models/taxidriver');

module.exports = {
  // List all vehicles
  async getAll(req, res) {
    try {
      const vehicles = await TaxiVehicle.find({}).sort({ createdAt: -1 }).populate('driver_id');
      res.json({ success: true, data: vehicles });
    } catch (err) {
      res.status(500).json({ success: false, message: 'Error fetching taxi vehicles', error: err.message });
    }
  },

  // Get vehicle by ID
  async getById(req, res) {
    try {
      const vehicle = await TaxiVehicle.findById(req.params.id).populate('driver_id');
      if (!vehicle) return res.status(404).json({ success: false, message: 'Taxi vehicle not found' });
      res.json({ success: true, data: vehicle });
    } catch (err) {
      res.status(500).json({ success: false, message: 'Error fetching taxi vehicle', error: err.message });
    }
  },

  // Create vehicle
  async create(req, res) {
    try {
      const { driver_id, vehicle_number, model, make, year, color, capacity, status } = req.body;
      const vehicle = new TaxiVehicle({ driver_id, vehicle_number, model, make, year, color, capacity, status });
      await vehicle.save();
      res.status(201).json({ success: true, message: 'Taxi vehicle created successfully', data: vehicle });
    } catch (err) {
      res.status(400).json({ success: false, message: 'Error creating taxi vehicle', error: err.message });
    }
  },

  // Update vehicle
  async update(req, res) {
    try {
      const { driver_id, vehicle_number, model, make, year, color, capacity, status } = req.body;
      const vehicle = await TaxiVehicle.findById(req.params.id);
      if (!vehicle) return res.status(404).json({ success: false, message: 'Taxi vehicle not found' });
      vehicle.driver_id = driver_id || vehicle.driver_id;
      vehicle.vehicle_number = vehicle_number || vehicle.vehicle_number;
      vehicle.model = model || vehicle.model;
      vehicle.make = make || vehicle.make;
      vehicle.year = year || vehicle.year;
      vehicle.color = color || vehicle.color;
      vehicle.capacity = capacity || vehicle.capacity;
      vehicle.status = status || vehicle.status;
      await vehicle.save();
      res.json({ success: true, message: 'Taxi vehicle updated successfully', data: vehicle });
    } catch (err) {
      res.status(400).json({ success: false, message: 'Error updating taxi vehicle', error: err.message });
    }
  },

  // Delete vehicle
  async delete(req, res) {
    try {
      const vehicle = await TaxiVehicle.findById(req.params.id);
      if (!vehicle) return res.status(404).json({ success: false, message: 'Taxi vehicle not found' });
      await TaxiVehicle.deleteOne({ _id: req.params.id });
      res.json({ success: true, message: 'Taxi vehicle deleted successfully' });
    } catch (err) {
      res.status(500).json({ success: false, message: 'Error deleting taxi vehicle', error: err.message });
    }
  }
}; 
const TaxiDriver = require('../models/taxidriver');
const TaxiRide = require('../models/taxiride');

module.exports = {
  // List all drivers
  async getAll(req, res) {
    try {
      // Find all drivers
      const drivers = await TaxiDriver.find({}).sort({ createdAt: -1 });
      // For each driver, find their vehicle
      const driversWithVehicles = await Promise.all(drivers.map(async (driver) => {
        const vehicle = await require('../models/taxivehicle').findOne({ driver_id: driver._id });
        return {
          ...driver.toObject(),
          vehicle: vehicle ? vehicle.toObject() : null,
          vehicle_id: vehicle ? vehicle._id : null, // for compatibility
        };
      }));
      res.json({ success: true, data: driversWithVehicles });
    } catch (err) {
      res.status(500).json({ success: false, message: 'Error fetching taxi drivers', error: err.message });
    }
  },

  // Get driver by ID
  async getById(req, res) {
    try {
      const driver = await TaxiDriver.findById(req.params.id);
      if (!driver) return res.status(404).json({ success: false, message: 'Taxi driver not found' });
      res.json({ success: true, data: driver });
    } catch (err) {
      res.status(500).json({ success: false, message: 'Error fetching taxi driver', error: err.message });
    }
  },

  // Create driver
  async create(req, res) {
    try {
      const { name, phone, license_number, status, user_id } = req.body;
      const driver = new TaxiDriver({ name, phone, license_number, status, user_id });
      await driver.save();
      res.status(201).json({ success: true, message: 'Taxi driver created successfully', data: driver });
    } catch (err) {
      res.status(400).json({ success: false, message: 'Error creating taxi driver', error: err.message });
    }
  },

  // Update driver
  async update(req, res) {
    try {
      const { name, phone, license_number, status, user_id } = req.body;
      const driver = await TaxiDriver.findById(req.params.id);
      if (!driver) return res.status(404).json({ success: false, message: 'Taxi driver not found' });
      driver.name = name || driver.name;
      driver.phone = phone || driver.phone;
      driver.license_number = license_number || driver.license_number;
      driver.status = status || driver.status;
      driver.user_id = user_id || driver.user_id;
      await driver.save();
      res.json({ success: true, message: 'Taxi driver updated successfully', data: driver });
    } catch (err) {
      res.status(400).json({ success: false, message: 'Error updating taxi driver', error: err.message });
    }
  },

  // Delete driver
  async delete(req, res) {
    try {
      const driver = await TaxiDriver.findById(req.params.id);
      if (!driver) return res.status(404).json({ success: false, message: 'Taxi driver not found' });
      await TaxiDriver.deleteOne({ _id: req.params.id });
      res.json({ success: true, message: 'Taxi driver deleted successfully' });
    } catch (err) {
      res.status(500).json({ success: false, message: 'Error deleting taxi driver', error: err.message });
    }
  },

  // Smart driver assignment with rotation
  async getAvailableDriver(req, res) {
    try {
      console.log('🔍 Smart driver assignment requested');
      
      // Step 1: Get all active drivers with their vehicles
      const activeDrivers = await TaxiDriver.find({ 
        status: 'active' 
      }).sort({ createdAt: -1 });

      if (activeDrivers.length === 0) {
        return res.status(404).json({ 
          success: false, 
          message: 'No active drivers available' 
        });
      }

      // Step 2: Get current ride counts for each driver (last 24 hours)
      const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
      
      const driversWithWorkload = await Promise.all(activeDrivers.map(async (driver) => {
        // Get vehicle for this driver
        const vehicle = await require('../models/taxivehicle').findOne({ driver_id: driver._id });
        
        // Use the tracked current_rides from driver model (more efficient)
        const activeRidesCount = driver.current_rides || 0;
        
        // Count rides in last 24 hours
        const recentRidesCount = await TaxiRide.countDocuments({
          driver_id: driver._id,
          createdAt: { $gte: twentyFourHoursAgo }
        });

        return {
          ...driver.toObject(),
          vehicle: vehicle ? vehicle.toObject() : null,
          vehicle_id: vehicle ? vehicle._id : null,
          activeRidesCount,
          recentRidesCount,
          // Calculate priority score (lower score = higher priority)
          // Weight current rides more heavily than recent rides
          priorityScore: activeRidesCount * 15 + recentRidesCount * 2
        };
      }));

      // Step 3: Filter out drivers without vehicles
      const driversWithVehicles = driversWithWorkload.filter(driver => driver.vehicle_id);

      if (driversWithVehicles.length === 0) {
        return res.status(404).json({ 
          success: false, 
          message: 'No drivers with assigned vehicles available' 
        });
      }

      // Step 4: Sort by priority score (lowest first) and select the best driver
      driversWithVehicles.sort((a, b) => a.priorityScore - b.priorityScore);
      
      // Step 5: Add some randomness to the top 3 drivers to avoid always picking the same one
      const topDrivers = driversWithVehicles.slice(0, Math.min(3, driversWithVehicles.length));
      const selectedDriver = topDrivers[Math.floor(Math.random() * topDrivers.length)];

      console.log('🚕 Smart driver assignment result:', {
        totalDrivers: activeDrivers.length,
        driversWithVehicles: driversWithVehicles.length,
        selectedDriver: {
          name: selectedDriver.name,
          activeRides: selectedDriver.activeRidesCount,
          recentRides: selectedDriver.recentRidesCount,
          priorityScore: selectedDriver.priorityScore
        }
      });

      res.json({ 
        success: true, 
        data: selectedDriver,
        assignmentInfo: {
          totalAvailable: driversWithVehicles.length,
          selectedFromTop: topDrivers.length,
          priorityScore: selectedDriver.priorityScore
        }
      });
    } catch (err) {
      console.error('Error in smart driver assignment:', err);
      res.status(500).json({ 
        success: false, 
        message: 'Error assigning driver', 
        error: err.message 
      });
    }
  }
}; 
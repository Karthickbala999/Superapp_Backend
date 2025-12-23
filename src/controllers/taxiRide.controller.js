const { TaxiRide, TaxiDriver, TaxiVehicle, User } = require('../models');

module.exports = {
  // List all rides (optionally filter by user_id, driver_id, vehicle_id)
  async getAll(req, res) {
    try {
      const filter = {};
      if (req.query.user_id) filter.user_id = req.query.user_id;
      if (req.query.driver_id) filter.driver_id = req.query.driver_id;
      if (req.query.vehicle_id) filter.vehicle_id = req.query.vehicle_id;

      const rides = await TaxiRide.find(filter)
        .populate('user_id')
        .populate('driver_id')
        .populate('vehicle_id')
        .sort({ createdAt: -1 });
      res.json({ success: true, data: rides });
    } catch (err) {
      res.status(500).json({ success: false, message: 'Error fetching taxi rides', error: err.message });
    }
  },

  // Get user's own rides
  async getUserRides(req, res) {
    try {
      const userId = req.user.id;
      const rides = await TaxiRide.find({ user_id: userId })
        .populate('user_id')
        .populate('driver_id')
        .populate('vehicle_id')
        .sort({ createdAt: -1 });
      res.json({ success: true, data: rides });
    } catch (err) {
      res.status(500).json({ success: false, message: 'Error fetching user rides', error: err.message });
    }
  },

  // Get ride by ID
  async getById(req, res) {
    try {
      console.log('GET /api/taxi-rides/:id - Request received for ID:', req.params.id);
      const ride = await TaxiRide.findById(req.params.id)
        .populate('user_id')
        .populate('driver_id')
        .populate('vehicle_id');
      if (!ride) return res.status(404).json({ success: false, message: 'Taxi ride not found' });
      
      console.log('Ride data being returned:', {
        id: ride._id,
        user_id: ride.user_id,
        driver_id: ride.driver_id,
        vehicle_id: ride.vehicle_id,
        createdAt: ride.createdAt,
        started_at: ride.started_at,
        completed_at: ride.completed_at
      });
      
      res.json({ success: true, data: ride });
    } catch (err) {
      console.error('Error in getById:', err);
      res.status(500).json({ success: false, message: 'Error fetching taxi ride', error: err.message });
    }
  },

  // Create ride
  async create(req, res) {
    try {
      console.log('taxiRide.controller.js: Received POST /api/taxi-rides with body:', req.body);
      const { user_id, driver_id, vehicle_id, pickup_location, dropoff_location, fare, status, started_at, completed_at } = req.body;
      
      // Update driver workload when ride is created
      if (driver_id) {
        await TaxiDriver.findByIdAndUpdate(driver_id, {
          $inc: { current_rides: 1, total_rides: 1 },
          last_assignment: new Date()
        });
        console.log('🚕 Updated driver workload for driver:', driver_id);
      }
      
      const ride = await TaxiRide.create({ 
        user_id, 
        driver_id, 
        vehicle_id, 
        pickup_location, 
        dropoff_location, 
        fare, 
        status, 
        started_at: started_at ? new Date(started_at) : null,
        completed_at: completed_at ? new Date(completed_at) : null
      });
      
      // Return populated data
      const createdRide = await TaxiRide.findById(ride._id)
        .populate('user_id')
        .populate('driver_id')
        .populate('vehicle_id');
      console.log('taxiRide.controller.js: Ride created and saved:', createdRide);
        
      res.status(201).json({ success: true, message: 'Taxi ride created successfully', data: createdRide });
    } catch (err) {
      console.error('taxiRide.controller.js: Error creating taxi ride:', err);
      res.status(400).json({ success: false, message: 'Error creating taxi ride', error: err.message });
    }
  },

  // Update ride
  async update(req, res) {
    try {
      console.log('taxiRide.controller.js: Received PUT /api/taxi-rides/:id with body:', req.body);
      const ride = await TaxiRide.findById(req.params.id);
      if (!ride) return res.status(404).json({ success: false, message: 'Taxi ride not found' });
      


      // Handle pickup_location - can be object or string
      let pickupLocation = ride.pickup_location || {};
      if (req.body.pickup_location) {
        if (typeof req.body.pickup_location === 'object') {
          pickupLocation = req.body.pickup_location;
        } else {
          pickupLocation.address = req.body.pickup_location;
        }
      } else if (req.body.pickup_address) {
        pickupLocation.address = req.body.pickup_address;
      }

      // Handle dropoff_location - can be object or string
      let dropoffLocation = ride.dropoff_location || {};
      if (req.body.dropoff_location) {
        if (typeof req.body.dropoff_location === 'object') {
          dropoffLocation = req.body.dropoff_location;
        } else {
          dropoffLocation.address = req.body.dropoff_location;
        }
      } else if (req.body.dropoff_address) {
        dropoffLocation.address = req.body.dropoff_address;
      }

      // Update fields with proper validation - only allow certain fields to be updated
      const updateData = {
        // Allow status updates (most common use case)
        status: req.body.status || ride.status,
        
        // Allow timing updates
        started_at: req.body.started_at ? new Date(req.body.started_at) : ride.started_at,
        completed_at: req.body.completed_at ? new Date(req.body.completed_at) : ride.completed_at,
        
        // Allow fare adjustments (for corrections)
        fare: req.body.fare !== undefined ? req.body.fare : ride.fare,
        
        // Allow location corrections (for admin fixes)
        pickup_location: pickupLocation,
        dropoff_location: dropoffLocation,
        
        // Only allow user/driver/vehicle changes if explicitly provided (for admin corrections)
        ...(req.body.user_id && { user_id: req.body.user_id }),
        ...(req.body.driver_id && { driver_id: req.body.driver_id }),
        ...(req.body.vehicle_id && { vehicle_id: req.body.vehicle_id }),
      };

      // Only update fields that are provided
      Object.keys(updateData).forEach(key => {
        if (updateData[key] !== undefined) {
          ride[key] = updateData[key];
        }
      });

      // Update driver workload based on status changes
      if (req.body.status && req.body.status !== ride.status) {
        if (req.body.status === 'completed' || req.body.status === 'cancelled') {
          // Decrease current rides when ride is completed or cancelled
          // Use $max to prevent negative values
          await TaxiDriver.findByIdAndUpdate(ride.driver_id, [
            {
              $set: {
                current_rides: {
                  $max: [{ $subtract: ['$current_rides', 1] }, 0]
                }
              }
            }
          ]);
          console.log('🚕 Decreased driver workload for completed/cancelled ride');
        }
      }
      
      await ride.save();
      const updatedRide = await TaxiRide.findById(ride._id)
        .populate('user_id')
        .populate('driver_id')
        .populate('vehicle_id');
      console.log('taxiRide.controller.js: Ride updated and saved:', updatedRide);

      res.json({ success: true, message: 'Taxi ride updated successfully', data: updatedRide });
    } catch (err) {
      console.error('taxiRide.controller.js: Error updating taxi ride:', err);
      res.status(400).json({ success: false, message: 'Error updating taxi ride', error: err.message });
    }
  },

  // Soft delete ride (mark as cancelled instead of hard delete)
  async delete(req, res) {
    try {
      const ride = await TaxiRide.findById(req.params.id);
      if (!ride) return res.status(404).json({ success: false, message: 'Taxi ride not found' });
      
      // Instead of deleting, mark as cancelled to preserve records
      ride.status = 'cancelled';
      await ride.save();
      
      res.json({ success: true, message: 'Taxi ride cancelled successfully' });
    } catch (err) {
      res.status(500).json({ success: false, message: 'Error cancelling taxi ride', error: err.message });
    }
  },

  // Cancel taxi ride
  async cancelRide(req, res) {
    try {
      const ride = await TaxiRide.findByIdAndUpdate(
        req.params.id,
        { 
          status: 'cancelled',
          payment_status: 'failed',
          cancelled_at: new Date(),
          updatedAt: new Date()
        },
        { new: true }
      );
      
      if (!ride) {
        return res.status(404).json({ success: false, message: 'Taxi ride not found' });
      }
      
      console.log('✅ Taxi ride cancelled successfully:', ride._id);
      res.json({ 
        success: true, 
        message: 'Taxi ride cancelled successfully',
        data: ride 
      });
    } catch (err) {
      console.error('❌ Error cancelling taxi ride:', err);
      res.status(500).json({ success: false, message: 'Error cancelling taxi ride', error: err.message });
    }
  }
}; 
const PorterBooking = require('../models/porterbooking');
const PorterDriver = require('../models/porterdriver');
const PorterVehicle = require('../models/portervehicle');

exports.getAll = async (req, res) => {
  try {
    const bookings = await PorterBooking.find({ is_active: true })
      .populate('user_id', 'name email phone')
      .populate('driver_id', 'name phone rating')
      .populate('vehicle_id', 'vehicle_number model make vehicle_type')
      .sort({ createdAt: -1 });
    res.json({ success: true, data: bookings });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Error fetching bookings', error: err.message });
  }
};

exports.getUserBookings = async (req, res) => {
  try {
    const userId = req.user.id;
    const bookings = await PorterBooking.find({ user_id: userId, is_active: true })
      .populate('driver_id', 'name phone rating')
      .populate('vehicle_id', 'vehicle_number model make vehicle_type')
      .sort({ createdAt: -1 });
    res.json({ success: true, data: bookings });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Error fetching user bookings', error: err.message });
  }
};

exports.getById = async (req, res) => {
  try {
    const booking = await PorterBooking.findById(req.params.id)
      .populate('user_id', 'name email phone')
      .populate('driver_id', 'name phone rating')
      .populate('vehicle_id', 'vehicle_number model make vehicle_type');
    
    if (!booking) {
      return res.status(404).json({ success: false, message: 'Booking not found' });
    }
    res.json({ success: true, data: booking });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Error fetching booking', error: err.message });
  }
};

exports.create = async (req, res) => {
  console.log('porterBooking.controller.js: Received POST /api/porter-bookings with body:', req.body);
  
  try {
    const {
      user_id,
      driver_id,
      vehicle_id,
      pickup_location,
      dropoff_location,
      vehicle_type,
      distance,
      fare,
      item_description,
      item_weight,
      special_instructions
    } = req.body;

    // Use user_id from request body or fallback to authenticated user
    const final_user_id = user_id || req.user?.id;

    // Calculate default distance and fare if not provided
    let calculatedDistance = distance;
    let calculatedFare = fare;
    
    if (!calculatedDistance || !calculatedFare) {
      // Simple distance calculation using coordinates if available
      if (pickup_location.latitude && pickup_location.longitude && 
          dropoff_location.latitude && dropoff_location.longitude) {
        const lat1 = pickup_location.latitude;
        const lon1 = pickup_location.longitude;
        const lat2 = dropoff_location.latitude;
        const lon2 = dropoff_location.longitude;
        
        // Haversine formula for distance calculation
        const R = 6371; // Earth's radius in km
        const dLat = (lat2 - lat1) * Math.PI / 180;
        const dLon = (lon2 - lon1) * Math.PI / 180;
        const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
                  Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
                  Math.sin(dLon/2) * Math.sin(dLon/2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
        calculatedDistance = Math.round(R * c * 100) / 100; // Round to 2 decimal places
      } else {
        calculatedDistance = 5; // Default 5 km if coordinates not available
      }
      
      // Calculate fare based on vehicle type and distance
      const baseFares = {
        'Bike': 50,
        'Auto': 80,
        'Mini-Truck': 150
      };
      const perKmRates = {
        'Bike': 15,
        'Auto': 25,
        'Mini-Truck': 40
      };
      
      const baseFare = baseFares[vehicle_type] || 100;
      const perKmRate = perKmRates[vehicle_type] || 20;
      calculatedFare = Math.round(baseFare + (calculatedDistance * perKmRate));
    }

    // Find available vehicle for the vehicle type
    const availableVehicles = await PorterVehicle.find({
      vehicle_type: vehicle_type,
      status: 'active'
    }).populate({
      path: 'driver_id',
      match: { is_active: true } // Only check if driver is_active, not status
    });

    // Filter vehicles with active drivers
    const vehiclesWithActiveDrivers = availableVehicles.filter(vehicle => vehicle.driver_id);
    
    console.log('porterBooking.controller.js: Available vehicles for', vehicle_type, ':', vehiclesWithActiveDrivers.length);

    if (vehiclesWithActiveDrivers.length === 0) {
      console.error('porterBooking.controller.js: No available vehicles for this vehicle type:', vehicle_type);
      return res.status(400).json({ 
        success: false, 
        message: 'No available vehicles for this vehicle type' 
      });
    }

    // Assign random vehicle (for now - can be enhanced later)
    const assignedVehicle = vehiclesWithActiveDrivers[Math.floor(Math.random() * vehiclesWithActiveDrivers.length)];
    const assignedDriver = assignedVehicle.driver_id;

    // Create booking with pending status (will be updated to assigned after payment)
    const booking = new PorterBooking({
      user_id: final_user_id,
      driver_id: assignedDriver._id,
      vehicle_id: assignedVehicle._id,
      pickup_location,
      dropoff_location,
      vehicle_type,
      distance: calculatedDistance,
      fare: calculatedFare,
      item_description,
      item_weight,
      special_instructions,
      status: 'pending', // Start with pending status
      payment_status: 'pending', // Ensure payment status is pending
      created_at: new Date()
    });

    await booking.save();

    // Don't immediately set driver to offline - they can handle multiple deliveries
    // Only set to offline when they actually start the delivery
    // await PorterDriver.findByIdAndUpdate(assignedDriver._id, { status: 'offline' });

    console.log('porterBooking.controller.js: Created booking:', booking);

    // Populate driver and vehicle info for response
    const populatedBooking = await PorterBooking.findById(booking._id)
      .populate('driver_id', 'name phone rating')
      .populate('vehicle_id', 'vehicle_number model make vehicle_type');

    res.status(201).json({ 
      success: true, 
      message: 'Booking created successfully', 
      data: populatedBooking 
    });
  } catch (err) {
    console.error('porterBooking.controller.js: Error creating booking:', err);
    res.status(500).json({ success: false, message: 'Error creating booking', error: err.message });
  }
};

exports.update = async (req, res) => {
  try {
    const booking = await PorterBooking.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    ).populate('driver_id', 'name phone rating')
      .populate('vehicle_id', 'vehicle_number model make vehicle_type');

    if (!booking) {
      return res.status(404).json({ success: false, message: 'Booking not found' });
    }
    res.json({ success: true, message: 'Booking updated successfully', data: booking });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Error updating booking', error: err.message });
  }
};

exports.updateStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const updateData = { status };
    
    // Add timestamp based on status
    switch (status) {
      case 'picked_up':
        updateData.picked_up_at = new Date();
        // Set driver to offline when they start the delivery
        const pickupBooking = await PorterBooking.findById(req.params.id);
        if (pickupBooking && pickupBooking.driver_id) {
          await PorterDriver.findByIdAndUpdate(pickupBooking.driver_id, {
            status: 'offline'
          });
        }
        break;
      case 'delivered':
        updateData.delivered_at = new Date();
        break;
      case 'completed':
        updateData.completed_at = new Date();
        // Update driver status back to active and increment deliveries
        const booking = await PorterBooking.findById(req.params.id);
        if (booking && booking.driver_id) {
          await PorterDriver.findByIdAndUpdate(booking.driver_id, {
            status: 'active',
            $inc: { total_deliveries: 1 }
          });
        }
        break;
      case 'cancelled':
        updateData.cancelled_at = new Date();
        // Update driver status back to active
        const cancelledBooking = await PorterBooking.findById(req.params.id);
        if (cancelledBooking && cancelledBooking.driver_id) {
          await PorterDriver.findByIdAndUpdate(cancelledBooking.driver_id, {
            status: 'active'
          });
        }
        break;
    }

    const updatedBooking = await PorterBooking.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, runValidators: true }
    ).populate('driver_id', 'name phone rating')
      .populate('vehicle_id', 'vehicle_number model make vehicle_type');

    if (!updatedBooking) {
      return res.status(404).json({ success: false, message: 'Booking not found' });
    }
    res.json({ success: true, message: 'Booking status updated successfully', data: updatedBooking });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Error updating booking status', error: err.message });
  }
};

exports.addRating = async (req, res) => {
  try {
    const { rating, review } = req.body;
    
    // Validate rating
    if (rating < 1 || rating > 5) {
      return res.status(400).json({ 
        success: false, 
        message: 'Rating must be between 1 and 5' 
      });
    }

    const booking = await PorterBooking.findByIdAndUpdate(
      req.params.id,
      { rating, review },
      { new: true, runValidators: true }
    ).populate('driver_id', 'name phone rating')
      .populate('vehicle_id', 'vehicle_number model make vehicle_type');

    if (!booking) {
      return res.status(404).json({ success: false, message: 'Booking not found' });
    }

    // Calculate and update driver's average rating
    if (booking.driver_id) {
      const driverBookings = await PorterBooking.find({
        driver_id: booking.driver_id._id,
        rating: { $exists: true, $ne: null }
      });

      if (driverBookings.length > 0) {
        const totalRating = driverBookings.reduce((sum, booking) => sum + booking.rating, 0);
        const averageRating = Math.round((totalRating / driverBookings.length) * 10) / 10; // Round to 1 decimal

        await PorterDriver.findByIdAndUpdate(booking.driver_id._id, {
          rating: averageRating
        });
      }
    }

    res.json({ success: true, message: 'Rating added successfully', data: booking });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Error adding rating', error: err.message });
  }
};

exports.delete = async (req, res) => {
  try {
    const booking = await PorterBooking.findByIdAndDelete(req.params.id);
    if (!booking) {
      return res.status(404).json({ success: false, message: 'Booking not found' });
    }
    res.json({ success: true, message: 'Booking deleted successfully' });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Error deleting booking', error: err.message });
  }
}; 

exports.inactivate = async (req, res) => {
  try {
    const booking = await PorterBooking.findByIdAndUpdate(
      req.params.id,
      { is_active: false },
      { new: true }
    );
    if (!booking) {
      return res.status(404).json({ success: false, message: 'Booking not found' });
    }
    res.json({ success: true, message: 'Booking inactivated successfully', data: booking });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Error inactivating booking', error: err.message });
  }
};

// Cleanup function to cancel pending bookings that haven't been paid
exports.cleanupPendingBookings = async () => {
  try {
    const thirtyMinutesAgo = new Date(Date.now() - 30 * 60 * 1000); // 30 minutes ago
    
    const pendingBookings = await PorterBooking.find({
      status: 'pending',
      payment_status: 'pending',
      created_at: { $lt: thirtyMinutesAgo }
    });

    if (pendingBookings.length > 0) {
      console.log(`🧹 Cleaning up ${pendingBookings.length} pending bookings older than 30 minutes`);
      
      for (const booking of pendingBookings) {
        await PorterBooking.findByIdAndUpdate(booking._id, {
          status: 'cancelled',
          payment_status: 'timeout',
          cancelled_at: new Date(),
          updatedAt: new Date()
        });
        console.log(`❌ Cancelled pending booking due to timeout: ${booking._id}`);
      }
    }
  } catch (error) {
    console.error('❌ Error cleaning up pending bookings:', error);
  }
};

// Cancel porter booking
exports.cancelBooking = async (req, res) => {
  try {
    const booking = await PorterBooking.findByIdAndUpdate(
      req.params.id,
      { 
        status: 'cancelled',
        payment_status: 'failed',
        cancelled_at: new Date(),
        updatedAt: new Date()
      },
      { new: true }
    );
    
    if (!booking) {
      return res.status(404).json({ success: false, message: 'Booking not found' });
    }
    
    console.log('✅ Porter booking cancelled successfully:', booking._id);
    res.json({ 
      success: true, 
      message: 'Porter booking cancelled successfully',
      data: booking 
    });
  } catch (err) {
    console.error('❌ Error cancelling porter booking:', err);
    res.status(500).json({ success: false, message: 'Error cancelling booking', error: err.message });
  }
}; 
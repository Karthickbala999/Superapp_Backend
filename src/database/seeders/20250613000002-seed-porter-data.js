'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    const PorterDriver = require('../../models/porterdriver');
    const PorterVehicle = require('../../models/portervehicle');
    const PorterBooking = require('../../models/porterbooking');

    try {
      // Create demo porter drivers
      const drivers = [
        {
          name: 'Rajesh Kumar',
          email: 'rajesh.porter@example.com',
          phone: '9876543210',
          license_number: 'DL-01-1234567890',
          status: 'active',
          rating: 4.8,
          total_deliveries: 156,
          current_location: {
            address: 'MG Road, Bangalore'
          },
          is_active: true
        },
        {
          name: 'Suresh Patel',
          email: 'suresh.porter@example.com',
          phone: '9876543211',
          license_number: 'DL-01-1234567891',
          status: 'active',
          rating: 4.6,
          total_deliveries: 89,
          current_location: {
            address: 'Indiranagar, Bangalore'
          },
          is_active: true
        },
        {
          name: 'Amit Singh',
          email: 'amit.porter@example.com',
          phone: '9876543212',
          license_number: 'DL-01-1234567892',
          status: 'active',
          rating: 4.7,
          total_deliveries: 234,
          current_location: {
            address: 'Koramangala, Bangalore'
          },
          is_active: true
        },
        {
          name: 'Vikram Malhotra',
          email: 'vikram.porter@example.com',
          phone: '9876543213',
          license_number: 'DL-01-1234567893',
          status: 'active',
          rating: 4.9,
          total_deliveries: 312,
          current_location: {
            address: 'HSR Layout, Bangalore'
          },
          is_active: true
        },
        {
          name: 'Deepak Sharma',
          email: 'deepak.porter@example.com',
          phone: '9876543214',
          license_number: 'DL-01-1234567894',
          status: 'active',
          rating: 4.5,
          total_deliveries: 67,
          current_location: {
            address: 'JP Nagar, Bangalore'
          },
          is_active: true
        }
      ];

      const createdDrivers = await PorterDriver.insertMany(drivers);
      console.log('✅ Created', createdDrivers.length, 'porter drivers');

      // Create vehicles for each driver with different types
      const vehicles = [
        // Driver 1 - Bike
        {
          driver_id: createdDrivers[0]._id,
          vehicle_number: 'KA-01-AB-1234',
          model: 'Hero Splendor',
          make: 'Hero',
          vehicle_type: 'Bike',
          capacity: 2,
          status: 'active'
        },
        // Driver 2 - Auto
        {
          driver_id: createdDrivers[1]._id,
          vehicle_number: 'KA-01-CD-5678',
          model: 'Bajaj RE',
          make: 'Bajaj',
          vehicle_type: 'Auto',
          capacity: 4,
          status: 'active'
        },
        // Driver 3 - Mini-Truck
        {
          driver_id: createdDrivers[2]._id,
          vehicle_number: 'KA-01-EF-9012',
          model: 'Tata Ace',
          make: 'Tata',
          vehicle_type: 'Mini-Truck',
          capacity: 8,
          status: 'active'
        },
        // Driver 4 - Bike
        {
          driver_id: createdDrivers[3]._id,
          vehicle_number: 'KA-01-GH-3456',
          model: 'Honda Activa',
          make: 'Honda',
          vehicle_type: 'Bike',
          capacity: 2,
          status: 'active'
        },
        // Driver 5 - Auto
        {
          driver_id: createdDrivers[4]._id,
          vehicle_number: 'KA-01-IJ-7890',
          model: 'TVS King',
          make: 'TVS',
          vehicle_type: 'Auto',
          capacity: 4,
          status: 'active'
        },
        // Additional Mini-Truck for Driver 1 (multiple vehicles)
        {
          driver_id: createdDrivers[0]._id,
          vehicle_number: 'KA-01-KL-1111',
          model: 'Mahindra Maxximo',
          make: 'Mahindra',
          vehicle_type: 'Mini-Truck',
          capacity: 10,
          status: 'active'
        },
        // Additional Auto for Driver 2
        {
          driver_id: createdDrivers[1]._id,
          vehicle_number: 'KA-01-MN-2222',
          model: 'Piaggio Ape',
          make: 'Piaggio',
          vehicle_type: 'Auto',
          capacity: 4,
          status: 'active'
        }
      ];

      const createdVehicles = await PorterVehicle.insertMany(vehicles);
      console.log('✅ Created', createdVehicles.length, 'porter vehicles');

      // Create sample bookings (if you want to test with existing data)
      const sampleBookings = [
        {
          user_id: '68678c6f2ccb87d7ca07fd6e', // Demo user ID
          driver_id: createdDrivers[0]._id,
          vehicle_id: createdVehicles[0]._id, // Bike
          pickup_location: {
            address: 'MG Road, Bangalore',
            latitude: 12.9716,
            longitude: 77.5946
          },
          dropoff_location: {
            address: 'Indiranagar, Bangalore',
            latitude: 12.9789,
            longitude: 77.5917
          },
          vehicle_type: 'Bike',
          distance: 3.2,
          fare: 160,
          status: 'completed',
          payment_method: 'cash',
          payment_status: 'completed',
          item_description: 'Documents and small package',
          item_weight: 2.5,
          special_instructions: 'Handle with care',
          assigned_at: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
          picked_up_at: new Date(Date.now() - 1.5 * 60 * 60 * 1000), // 1.5 hours ago
          delivered_at: new Date(Date.now() - 1 * 60 * 60 * 1000), // 1 hour ago
          completed_at: new Date(Date.now() - 1 * 60 * 60 * 1000), // 1 hour ago
          rating: 5,
          review: 'Excellent service, very professional driver'
        }
      ];

      const createdBookings = await PorterBooking.insertMany(sampleBookings);
      console.log('✅ Created', createdBookings.length, 'sample porter bookings');

      // Update driver stats
      await PorterDriver.findByIdAndUpdate(createdDrivers[0]._id, {
        status: 'active',
        $inc: { total_deliveries: 1 }
      });

      console.log('✅ Porter module seeding completed successfully!');
      console.log('📊 Sample data created:');
      console.log('   - Drivers:', createdDrivers.length);
      console.log('   - Vehicles:', createdVehicles.length);
      console.log('   - Bookings:', createdBookings.length);
      console.log('🚚 Vehicle types available: Bike, Auto, Mini-Truck');

    } catch (error) {
      console.error('❌ Error seeding porter data:', error);
      throw error;
    }
  },

  async down(queryInterface, Sequelize) {
    const PorterDriver = require('../../models/porterdriver');
    const PorterVehicle = require('../../models/portervehicle');
    const PorterBooking = require('../../models/porterbooking');

    try {
      await PorterBooking.deleteMany({});
      await PorterVehicle.deleteMany({});
      await PorterDriver.deleteMany({});
      console.log('✅ Porter data cleaned up successfully!');
    } catch (error) {
      console.error('❌ Error cleaning up porter data:', error);
      throw error;
    }
  }
}; 
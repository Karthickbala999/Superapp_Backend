const mongoose = require('mongoose');
require('dotenv').config();

// MongoDB connection string
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb+srv://superapp:superapp123@cluster0.mongodb.net/superapp_db?retryWrites=true&w=majority';

const seedPorterComplete = async () => {
  try {
    console.log('🚀 Connecting to MongoDB...');
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    // Import models
    const PorterDriver = require('./src/models/porterdriver');
    const PorterVehicle = require('./src/models/portervehicle');
    const PorterBooking = require('./src/models/porterbooking');
    const User = require('./src/models/user');

    // Clean up existing data
    console.log('🧹 Cleaning up existing Porter data...');
    await PorterBooking.deleteMany({});
    await PorterVehicle.deleteMany({});
    await PorterDriver.deleteMany({});
    console.log('✅ Cleaned up existing data');

    // Get or create demo user for drivers
    let demoUser = await User.findOne({ email: 'demo@example.com' });
    if (!demoUser) {
      demoUser = await User.findOne({ email: 'admin@example.com' });
    }
    
    if (!demoUser) {
      console.log('⚠️ No demo user found, creating one...');
      demoUser = new User({
        name: 'Demo User',
        email: 'demo@example.com',
        phone: '9999999999',
        role: 'user'
      });
      await demoUser.save();
    }

    console.log('👥 Using demo user:', demoUser.email);

    // Create demo Porter drivers
    console.log('🚚 Creating demo Porter drivers...');
    const drivers = [
      {
        user_id: demoUser._id,
        name: 'Rajesh Kumar',
        phone: '+91-9876543210',
        email: 'rajesh.porter@example.com',
        license_number: 'DL-01-1234567890',
        status: 'active',
        rating: 4.8,
        total_deliveries: 156,
        current_location: {
          latitude: 12.9716,
          longitude: 77.5946,
          address: 'MG Road, Bangalore'
        },
        is_active: true
      },
      {
        user_id: demoUser._id,
        name: 'Suresh Patel',
        phone: '+91-9876543211',
        email: 'suresh.porter@example.com',
        license_number: 'DL-01-1234567891',
        status: 'active',
        rating: 4.6,
        total_deliveries: 89,
        current_location: {
          latitude: 12.9789,
          longitude: 77.5917,
          address: 'Indiranagar, Bangalore'
        },
        is_active: true
      },
      {
        user_id: demoUser._id,
        name: 'Amit Singh',
        phone: '+91-9876543212',
        email: 'amit.porter@example.com',
        license_number: 'DL-01-1234567892',
        status: 'active',
        rating: 4.7,
        total_deliveries: 234,
        current_location: {
          latitude: 12.9654,
          longitude: 77.5998,
          address: 'Koramangala, Bangalore'
        },
        is_active: true
      }
    ];

    const createdDrivers = await PorterDriver.insertMany(drivers);
    console.log('✅ Created', createdDrivers.length, 'Porter drivers');

    // Create demo Porter vehicles
    console.log('🚗 Creating demo Porter vehicles...');
    const vehicles = [
      {
        driver_id: createdDrivers[0]._id,
        vehicle_number: 'KA-01-AB-1234',
        model: 'Activa 6G',
        make: 'Honda',
        vehicle_type: 'Bike',
        capacity: 2,
        status: 'active'
      },
      {
        driver_id: createdDrivers[1]._id,
        vehicle_number: 'KA-01-CD-5678',
        model: 'Auto Rickshaw',
        make: 'Bajaj',
        vehicle_type: 'Auto',
        capacity: 3,
        status: 'active'
      },
      {
        driver_id: createdDrivers[2]._id,
        vehicle_number: 'KA-01-EF-9012',
        model: 'Tata Ace',
        make: 'Tata',
        vehicle_type: 'Mini-Truck',
        capacity: 8,
        status: 'active'
      }
    ];

    const createdVehicles = await PorterVehicle.insertMany(vehicles);
    console.log('✅ Created', createdVehicles.length, 'Porter vehicles');

    // Create sample bookings
    console.log('📦 Creating sample Porter bookings...');
    const sampleBookings = [
      {
        user_id: demoUser._id,
        driver_id: createdDrivers[0]._id,
        vehicle_id: createdVehicles[0]._id,
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
    console.log('✅ Created', createdBookings.length, 'sample Porter bookings');

    console.log('\n🎉 Porter module seeding completed successfully!');
    console.log('📊 Summary:');
    console.log('   - Drivers:', createdDrivers.length);
    console.log('   - Vehicles:', createdVehicles.length);
    console.log('   - Bookings:', createdBookings.length);
    console.log('\n🚚 Porter module is ready for testing!');

    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding Porter data:', error);
    process.exit(1);
  }
};

seedPorterComplete(); 
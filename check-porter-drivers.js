const mongoose = require('mongoose');
require('dotenv').config();

// MongoDB connection string
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb+srv://superapp:superapp123@cluster0.mongodb.net/superapp_db?retryWrites=true&w=majority';

const checkAndSeedPorterDrivers = async () => {
  try {
    console.log('🚀 Connecting to MongoDB...');
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    // Import models
    const PorterDriver = require('./src/models/porterdriver');
    const PorterBooking = require('./src/models/porterbooking');

    // Check existing drivers
    const existingDrivers = await PorterDriver.find({});
    console.log('📊 Existing Porter drivers:', existingDrivers.length);

    if (existingDrivers.length === 0) {
      console.log('🔧 No drivers found. Creating demo drivers...');
      
      const drivers = [
        {
          name: 'Demo Mini-Truck Driver',
          email: 'minitruck_driver@example.com',
          phone: '9999999991',
          vehicle_type: 'Mini-Truck',
          vehicle_number: 'KA-01-AB-1234',
          license_number: 'DL-01-1234567890',
          status: 'available',
          rating: 4.5,
          total_deliveries: 1,
          current_location: {
            latitude: 12.9716,
            longitude: 77.5946,
            address: 'MG Road, Bangalore'
          },
          is_active: true
        },
        {
          name: 'Demo Bike Driver',
          email: 'bike_driver@example.com',
          phone: '9999999992',
          vehicle_type: 'Bike',
          vehicle_number: 'KA-01-CD-5678',
          license_number: 'DL-01-1234567891',
          status: 'available',
          rating: 4.6,
          total_deliveries: 1,
          current_location: {
            latitude: 12.9789,
            longitude: 77.5917,
            address: 'Indiranagar, Bangalore'
          },
          is_active: true
        },
        {
          name: 'Demo Auto Driver',
          email: 'auto_driver@example.com',
          phone: '9999999993',
          vehicle_type: 'Auto',
          vehicle_number: 'KA-01-EF-9012',
          license_number: 'DL-01-1234567892',
          status: 'available',
          rating: 4.7,
          total_deliveries: 1,
          current_location: {
            latitude: 12.9654,
            longitude: 77.5998,
            address: 'Koramangala, Bangalore'
          },
          is_active: true
        }
      ];

      const createdDrivers = await PorterDriver.insertMany(drivers);
      console.log('✅ Created', createdDrivers.length, 'demo Porter drivers');
    } else {
      console.log('✅ Porter drivers already exist');
      existingDrivers.forEach(driver => {
        console.log(`   - ${driver.name} (${driver.vehicle_type}) - Status: ${driver.status}`);
      });
    }

    // Check available drivers for Mini-Truck
    const availableMiniTruckDrivers = await PorterDriver.find({
      status: 'available',
      vehicle_type: 'Mini-Truck',
      is_active: true
    });
    console.log('🚛 Available Mini-Truck drivers:', availableMiniTruckDrivers.length);

    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
};

checkAndSeedPorterDrivers(); 
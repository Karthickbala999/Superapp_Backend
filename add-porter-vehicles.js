const mongoose = require('mongoose');
require('dotenv').config();

const PorterDriver = require('./src/models/porterdriver');
const PorterVehicle = require('./src/models/portervehicle');

async function addPorterVehicles() {
  try {
    console.log('🌐 Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    // Get existing drivers
    const drivers = await PorterDriver.find({});
    console.log(`Found ${drivers.length} existing drivers`);

    if (drivers.length === 0) {
      console.log('❌ No drivers found. Please run Porter driver seeder first.');
      return;
    }

    // Clear existing vehicles
    await PorterVehicle.deleteMany({});
    console.log('🧹 Cleared existing vehicles');

    // Create vehicles for each driver with different types
    const vehicles = [
      // Driver 1 - Bike
      {
        driver_id: drivers[0]._id,
        vehicle_number: 'KA-01-AB-1234',
        model: 'Hero Splendor',
        make: 'Hero',
        vehicle_type: 'Bike',
        capacity: 2,
        status: 'active'
      },
      // Driver 2 - Auto
      {
        driver_id: drivers[1]._id,
        vehicle_number: 'KA-01-CD-5678',
        model: 'Bajaj RE',
        make: 'Bajaj',
        vehicle_type: 'Auto',
        capacity: 4,
        status: 'active'
      },
      // Driver 3 - Mini-Truck
      {
        driver_id: drivers[2]._id,
        vehicle_number: 'KA-01-EF-9012',
        model: 'Tata Ace',
        make: 'Tata',
        vehicle_type: 'Mini-Truck',
        capacity: 8,
        status: 'active'
      },
      // Driver 4 - Bike
      {
        driver_id: drivers[3]._id,
        vehicle_number: 'KA-01-GH-3456',
        model: 'Honda Activa',
        make: 'Honda',
        vehicle_type: 'Bike',
        capacity: 2,
        status: 'active'
      },
      // Driver 5 - Auto
      {
        driver_id: drivers[4]._id,
        vehicle_number: 'KA-01-IJ-7890',
        model: 'TVS King',
        make: 'TVS',
        vehicle_type: 'Auto',
        capacity: 4,
        status: 'active'
      },
      // Additional Mini-Truck for Driver 1 (multiple vehicles)
      {
        driver_id: drivers[0]._id,
        vehicle_number: 'KA-01-KL-1111',
        model: 'Mahindra Maxximo',
        make: 'Mahindra',
        vehicle_type: 'Mini-Truck',
        capacity: 10,
        status: 'active'
      },
      // Additional Auto for Driver 2
      {
        driver_id: drivers[1]._id,
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
    console.log('🚚 Vehicle types available: Bike, Auto, Mini-Truck');

    // Show vehicle summary
    const vehicleTypes = await PorterVehicle.aggregate([
      { $group: { _id: '$vehicle_type', count: { $sum: 1 } } }
    ]);
    
    console.log('\n📊 Vehicle Summary:');
    vehicleTypes.forEach(vt => {
      console.log(`   - ${vt._id}: ${vt.count} vehicles`);
    });

    console.log('\n✅ Porter vehicles added successfully!');
    process.exit(0);

  } catch (error) {
    console.error('❌ Error adding Porter vehicles:', error);
    process.exit(1);
  }
}

addPorterVehicles(); 
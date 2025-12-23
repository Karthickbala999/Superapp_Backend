const mongoose = require('mongoose');
const TaxiDriver = require('../../models/taxiDriver');
const TaxiVehicle = require('../../models/taxiVehicle');
const TaxiRide = require('../../models/taxiride');
const User = require('../../models/User');

async function seedTaxiData() {
  try {
    console.log('🌐 Connecting to MongoDB for taxi data seeding...');
    
    // Connect to MongoDB
    const mongoUri = process.env.MONGODB_URI || 'mongodb+srv://superapp_admin:superapp_admin%40749@cluster0.gtmzerf.mongodb.net/superapp_db?retryWrites=true&w=majority&appName=Cluster0';
    await mongoose.connect(mongoUri);
    console.log('✅ Connected to MongoDB Atlas');

    // Clear existing data
    await TaxiDriver.deleteMany({});
    await TaxiVehicle.deleteMany({});
    await TaxiRide.deleteMany({});
    console.log('🧹 Cleared existing taxi data');

    // Get a user for the rides
    const user = await User.findOne({});
    if (!user) {
      console.log('❌ No users found. Please run user seeder first.');
      return;
    }

    // Create taxi drivers
    const drivers = await TaxiDriver.create([
      {
        user_id: user._id,
        name: 'John Doe',
        phone: '+1234567890',
        license_number: 'DL123456',
        status: 'active'
      },
      {
        user_id: user._id,
        name: 'Jane Smith',
        phone: '+1987654321',
        license_number: 'DL789012',
        status: 'active'
      },
      {
        user_id: user._id,
        name: 'Mike Johnson',
        phone: '+1555123456',
        license_number: 'DL345678',
        status: 'active'
      }
    ]);
    console.log(`✅ Created ${drivers.length} taxi drivers`);

    // Create taxi vehicles
    const vehicles = await TaxiVehicle.create([
      {
        driver_id: drivers[0]._id,
        make: 'Toyota',
        model: 'Camry',
        year: 2022,
        vehicle_number: 'ABC123',
        color: 'White',
        status: 'active'
      },
      {
        driver_id: drivers[1]._id,
        make: 'Honda',
        model: 'Civic',
        year: 2021,
        vehicle_number: 'XYZ789',
        color: 'Blue',
        status: 'active'
      },
      {
        driver_id: drivers[2]._id,
        make: 'Ford',
        model: 'Focus',
        year: 2023,
        vehicle_number: 'DEF456',
        color: 'Red',
        status: 'active'
      }
    ]);
    console.log(`✅ Created ${vehicles.length} taxi vehicles`);

    // Create taxi rides with proper date fields
    const now = new Date();
    const rides = await TaxiRide.create([
      {
        user_id: user._id,
        driver_id: drivers[0]._id,
        vehicle_id: vehicles[0]._id,
        pickup_location: {
          address: '123 Main St, Downtown',
          latitude: 40.7128,
          longitude: -74.0060
        },
        dropoff_location: {
          address: '456 Park Ave, Midtown',
          latitude: 40.7589,
          longitude: -73.9851
        },
        fare: 25.50,
        status: 'completed',
        started_at: new Date(now.getTime() - 2 * 60 * 60 * 1000), // 2 hours ago
        completed_at: new Date(now.getTime() - 1 * 60 * 60 * 1000), // 1 hour ago
        payment_status: 'paid',
        payment_method: 'card'
      },
      {
        user_id: user._id,
        driver_id: drivers[1]._id,
        vehicle_id: vehicles[1]._id,
        pickup_location: {
          address: '789 Broadway, SoHo',
          latitude: 40.7243,
          longitude: -73.9967
        },
        dropoff_location: {
          address: '321 5th Ave, Flatiron',
          latitude: 40.7411,
          longitude: -73.9897
        },
        fare: 18.75,
        status: 'started',
        started_at: new Date(now.getTime() - 30 * 60 * 1000), // 30 minutes ago
        payment_status: 'pending',
        payment_method: 'cash'
      },
      {
        user_id: user._id,
        driver_id: drivers[2]._id,
        vehicle_id: vehicles[2]._id,
        pickup_location: {
          address: '555 Madison Ave, Upper East Side',
          latitude: 40.7614,
          longitude: -73.9776
        },
        dropoff_location: {
          address: '888 Central Park West, Upper West Side',
          latitude: 40.7829,
          longitude: -73.9654
        },
        fare: 32.00,
        status: 'pending',
        payment_status: 'pending',
        payment_method: 'upi'
      }
    ]);
    console.log(`✅ Created ${rides.length} taxi rides`);

    console.log('🎉 Taxi data seeding completed successfully!');
    
    // Log some sample data for verification
    console.log('\n📊 Sample Data Created:');
    console.log('Drivers:', drivers.map(d => ({ id: d._id, name: d.name })));
    console.log('Vehicles:', vehicles.map(v => ({ id: v._id, make: v.make, model: v.model, plate: v.vehicle_number })));
    console.log('Rides:', rides.map(r => ({ 
      id: r._id, 
      status: r.status, 
      started_at: r.started_at, 
      completed_at: r.completed_at 
    })));

  } catch (error) {
    console.error('❌ Error seeding taxi data:', error);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Disconnected from MongoDB');
  }
}

// Run the seeder
seedTaxiData(); 
const mongoose = require('mongoose');
require('dotenv').config();

const PorterDriver = require('./src/models/porterdriver');

async function checkPorterSchema() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    // Check existing documents
    const drivers = await PorterDriver.find({});
    console.log(`Found ${drivers.length} PorterDriver documents`);

    if (drivers.length > 0) {
      console.log('\n📋 Sample document structure:');
      console.log(JSON.stringify(drivers[0].toObject(), null, 2));
      
      // Check for problematic fields
      const hasVehicleNumber = drivers.some(d => d.vehicle_number);
      const hasVehicleType = drivers.some(d => d.vehicle_type);
      const hasInvalidStatus = drivers.some(d => !['active', 'inactive', 'offline'].includes(d.status));
      
      console.log('\n🔍 Schema Issues:');
      console.log(`Has vehicle_number field: ${hasVehicleNumber}`);
      console.log(`Has vehicle_type field: ${hasVehicleType}`);
      console.log(`Has invalid status: ${hasInvalidStatus}`);
      
      if (hasVehicleNumber || hasVehicleType || hasInvalidStatus) {
        console.log('\n❌ Found schema issues! Clearing all PorterDriver data...');
        await PorterDriver.deleteMany({});
        console.log('✅ Cleared all PorterDriver documents');
      }
    }

    console.log('✅ Schema check completed!');
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await mongoose.disconnect();
  }
}

checkPorterSchema(); 
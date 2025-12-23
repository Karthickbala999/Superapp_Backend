const mongoose = require('mongoose');
require('dotenv').config();

const PorterDriver = require('./src/models/porterdriver');

async function clearPorterData() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    // Clear existing PorterDriver data
    const result = await PorterDriver.deleteMany({});
    console.log(`✅ Cleared ${result.deletedCount} PorterDriver records`);

    // Run the seeder
    const seeder = require('./src/database/seeders/20250613000002-seed-porter-data.js');
    await seeder.up();
    console.log('✅ Reseeded PorterDriver data with correct schema');

    console.log('✅ Porter data cleared and reseeded successfully!');
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await mongoose.disconnect();
    console.log('✅ Disconnected from MongoDB');
  }
}

clearPorterData(); 
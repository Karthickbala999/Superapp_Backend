const mongoose = require('mongoose');
require('dotenv').config();

const PorterDriver = require('./src/models/porterdriver');

async function testPorterDriver() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    // Test creating a PorterDriver with correct schema
    const testDriver = new PorterDriver({
      name: 'Test Driver',
      phone: '9876543210',
      email: 'test@example.com',
      license_number: 'DL-TEST-123',
      status: 'active',
      current_location: {
        address: 'Test Address'
      },
      is_active: true
    });

    await testDriver.save();
    console.log('✅ Test driver created successfully:', testDriver._id);

    // Clean up
    await PorterDriver.findByIdAndDelete(testDriver._id);
    console.log('✅ Test driver cleaned up');

    console.log('✅ PorterDriver model is working correctly!');
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await mongoose.disconnect();
  }
}

testPorterDriver(); 
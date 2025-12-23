const mongoose = require('mongoose');
const Hotel = require('./src/models/Hotel');
const { initializeDatabase } = require('./src/config/database');

const checkHotels = async () => {
  try {
    console.log('Connecting to MongoDB...');
    await initializeDatabase();
    
    console.log('\n=== Checking Hotels in Database ===');
    const hotels = await Hotel.find({});
    console.log(`Found ${hotels.length} hotels in database:`);
    
    if (hotels.length > 0) {
      hotels.forEach((hotel, index) => {
        console.log(`${index + 1}. ${hotel.name} (ID: ${hotel._id})`);
        console.log(`   Status: ${hotel.status}`);
        console.log(`   Address: ${hotel.address?.city}, ${hotel.address?.state}`);
        console.log('   ---');
      });
    } else {
      console.log('No hotels found in database!');
    }
    
    console.log('\n=== Testing API Endpoint ===');
    console.log('You can test the API endpoint: GET http://localhost:5000/api/hotels');
    console.log('Make sure to include the Authorization header with a valid JWT token.');
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await mongoose.connection.close();
    console.log('\nDatabase connection closed.');
  }
};

checkHotels(); 
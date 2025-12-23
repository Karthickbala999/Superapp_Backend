const axios = require('axios');

const testPorterBooking = async () => {
  try {
    console.log('🧪 Testing Porter booking endpoint...');
    
    const bookingPayload = {
      pickup_location: {
        address: 'Chennai, TN, India',
        latitude: 13.066682,
        longitude: 80.224741
      },
      dropoff_location: {
        address: 'Hyderabad Division, SD, Pakistan',
        latitude: 25.31426,
        longitude: 68.04064
      },
      vehicle_type: 'Mini-Truck',
      distance: 195.95,
      fare: 98000
    };

    console.log('📤 Sending payload:', bookingPayload);

    const response = await axios.post('http://localhost:5000/api/porter-bookings', bookingPayload, {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer demo-token'
      }
    });

    console.log('✅ Success! Response:', response.data);
  } catch (error) {
    console.error('❌ Error:', error.response?.data || error.message);
    console.error('Status:', error.response?.status);
  }
};

testPorterBooking(); 
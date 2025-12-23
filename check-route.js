const axios = require('axios');

async function checkRoute() {
    const API_URL = 'http://localhost:5000/api';
    const phone = '+919876543210';
    const otp = '123456';

    console.log('🔍 Checking /my-available Route');

    try {
        console.log('🔑 Logging in...');
        const verifyRes = await axios.post(`${API_URL}/auth/partner/verify-otp`, {
            phoneNumber: phone,
            otp: otp
        });
        const token = verifyRes.data.token;
        console.log('✅ Logged in.');

        console.log('📡 Requesting GET /urban-services/bookings/my-available ...');
        const res = await axios.get(`${API_URL}/urban-services/bookings/my-available`, {
            headers: { Authorization: `Bearer ${token}` }
        });

        console.log(`✅ Status: ${res.status} ${res.statusText}`);
        console.log(`📦 Data Count: ${res.data.count}`);
        if (res.data.data && res.data.data.length > 0) {
            console.log('📋 Bookings found:');
            res.data.data.forEach(b => console.log(`   - ${b.bookingNumber} (${b.status})`));
        } else {
            console.log('⚠️ Bookings list is empty.');
        }

    } catch (error) {
        if (error.response) {
            console.error(`❌ Request Failed: ${error.response.status} ${error.response.statusText}`);
            console.error('   Response:', JSON.stringify(error.response.data));
        } else {
            console.error('❌ Error:', error.message);
        }
    }
}

checkRoute();

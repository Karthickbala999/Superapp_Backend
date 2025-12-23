const axios = require('axios');

async function testAvailableBookings() {
    const API_URL = 'http://localhost:5000/api';
    const phone = '+917845235347'; // Actual Thilocigan phone
    const otp = '123456';

    try {
        console.log('🔑 Logging in...');
        const verifyRes = await axios.post(`${API_URL}/auth/partner/verify-otp`, {
            phoneNumber: phone,
            otp: otp
        });
        const token = verifyRes.data.token;
        console.log('✅ Login successful');

        console.log('\n📡 Testing GET /urban-services/bookings/available');
        const res = await axios.get(`${API_URL}/urban-services/bookings/available`, {
            headers: { Authorization: `Bearer ${token}` }
        });

        console.log(`\n✅ Status: ${res.status}`);
        console.log(`📦 Response:`, JSON.stringify(res.data, null, 2));

        if (res.data.data && res.data.data.length > 0) {
            console.log(`\n✅ SUCCESS! Found ${res.data.data.length} available booking(s):`);
            res.data.data.forEach(b => {
                console.log(`   - ${b.bookingNumber} | Status: ${b.status} | Customer: ${b.customer?.name}`);
            });
        } else {
            console.log('\n⚠️ No bookings returned. Checking partner linkage...');
        }

    } catch (error) {
        console.error('\n❌ Error:', error.response?.data || error.message);
        if (error.response?.status === 404) {
            console.log('💡 Partner profile not found - User/Partner linkage issue');
        }
    }
}

testAvailableBookings();

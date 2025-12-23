const axios = require('axios');

async function testDirect() {
    try {
        // Test without auth first to see if route exists
        console.log('Testing /urban-services/bookings/available without auth...');
        try {
            await axios.get('http://localhost:5000/api/urban-services/bookings/available');
        } catch (err) {
            console.log('Status:', err.response?.status);
            console.log('Message:', err.response?.data?.message);
        }

        // Test with auth
        console.log('\nTesting with auth...');
        const loginRes = await axios.post('http://localhost:5000/api/auth/partner/verify-otp', {
            phoneNumber: '+917845235347',
            otp: '123456'
        });

        const token = loginRes.data.token;

        try {
            const res = await axios.get('http://localhost:5000/api/urban-services/bookings/available', {
                headers: { Authorization: `Bearer ${token}` }
            });
            console.log('SUCCESS!', res.data);
        } catch (err) {
            console.log('Status:', err.response?.status);
            console.log('Message:', err.response?.data?.message);
        }

    } catch (error) {
        console.error('Error:', error.message);
    }
}

testDirect();

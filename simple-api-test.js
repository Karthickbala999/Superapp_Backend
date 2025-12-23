const axios = require('axios');

async function testAPI() {
    try {
        const API_URL = 'http://localhost:5000/api';
        const phone = '+917845235347';
        const otp = '123456';

        console.log('=== STEP 1: Login ===');
        const loginRes = await axios.post(`${API_URL}/auth/partner/verify-otp`, {
            phoneNumber: phone,
            otp: otp
        });

        console.log('Login Status:', loginRes.status);
        console.log('Token received:', loginRes.data.token ? 'YES' : 'NO');
        const token = loginRes.data.token;

        console.log('\n=== STEP 2: Call /available ===');
        try {
            const availableRes = await axios.get(`${API_URL}/urban-services/bookings/available`, {
                headers: { Authorization: `Bearer ${token}` }
            });

            console.log('Status:', availableRes.status);
            console.log('Full Response:', JSON.stringify(availableRes.data, null, 2));

        } catch (err) {
            console.log('ERROR calling /available:');
            console.log('Status:', err.response?.status);
            console.log('Response:', JSON.stringify(err.response?.data, null, 2));
        }

        console.log('\n=== STEP 3: Call /partner/bookings ===');
        try {
            const partnerRes = await axios.get(`${API_URL}/urban-services/partner/bookings`, {
                headers: { Authorization: `Bearer ${token}` }
            });

            console.log('Status:', partnerRes.status);
            console.log('Full Response:', JSON.stringify(partnerRes.data, null, 2));

        } catch (err) {
            console.log('ERROR calling /partner/bookings:');
            console.log('Status:', err.response?.status);
            console.log('Response:', JSON.stringify(err.response?.data, null, 2));
        }

    } catch (error) {
        console.error('FATAL ERROR:', error.message);
    }
}

testAPI();

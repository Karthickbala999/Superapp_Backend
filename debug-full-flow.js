const axios = require('axios');

async function debugFullFlow() {
    const API_URL = 'http://localhost:5000/api';
    const phone = '+919876543210';
    const otp = '123456'; // Assuming dev mode accepts this or generated OTP

    console.log('🔍 Debugging Full Login Flow');
    console.log('==================================================');

    try {
        // 1. Send OTP
        console.log('\nrequesting OTP...');
        await axios.post(`${API_URL}/auth/partner/send-otp`, { phoneNumber: phone });
        console.log('✅ OTP Sent');

        // 2. Verify OTP
        console.log('\nVerifying OTP...');
        const verifyRes = await axios.post(`${API_URL}/auth/partner/verify-otp`, {
            phoneNumber: phone,
            otp: otp
        });
        const token = verifyRes.data.token;
        console.log('✅ OTP Verified');
        console.log(`🔑 Token: ${token.substring(0, 20)}...`);

        // Decode token payload
        const base64Url = token.split('.')[1];
        const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
        const payload = JSON.parse(Buffer.from(base64, 'base64').toString());
        console.log('📋 Token Payload:', JSON.stringify(payload, null, 2));


        // 3. Get Partner Profile (Simulate App.js)
        console.log('\nFetching Partner Profile (/auth/partner/profile)...');
        try {
            const profileRes = await axios.get(`${API_URL}/auth/partner/profile`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            console.log('✅ Profile Fetched:', profileRes.status);
            console.log('   Partner ID:', profileRes.data.partner.id);
        } catch (err) {
            console.error('❌ Profile Fetch Failed:', err.response?.status, err.response?.data);
        }

        // 4. Get Partner Stats (Simulate Dashboard.jsx)
        console.log('\nFetching Partner Stats (/urban-services/partner/stats)...');
        try {
            const statsRes = await axios.get(`${API_URL}/urban-services/partner/stats`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            console.log('✅ Stats Fetched:', statsRes.status);
            console.log('   Total Bookings:', statsRes.data.totalBookings);
        } catch (err) {
            console.error('❌ Stats Fetch Failed:', err.response?.status, err.response?.data);
        }

    } catch (error) {
        console.error('❌ Flow Failed:', error.message);
        if (error.response) {
            console.error('Status:', error.response.status);
            console.error('Data:', error.response.data);
        }
    }
}

debugFullFlow();

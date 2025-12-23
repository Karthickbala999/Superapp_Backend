require('dotenv').config();
const axios = require('axios');

async function testOTPVerificationDetailed() {
    try {
        const response = await axios.post('http://localhost:5000/api/auth/partner/verify-otp', {
            phoneNumber: '+919876543210',
            otp: '478085'
        });

        console.log('✅ Full API Response Structure:');
        console.log(JSON.stringify(response.data, null, 2));
        console.log('\n📋 Token Location Check:');
        console.log('response.data.token:', response.data.token);
        console.log('Token exists:', !!response.data.token);
        console.log('Token type:', typeof response.data.token);

    } catch (error) {
        console.error('❌ API Error:');
        console.error('Status:', error.response?.status);
        console.error('Message:', error.response?.data?.message);
        console.error('Full response:', JSON.stringify(error.response?.data, null, 2));
    }
}

testOTPVerificationDetailed();

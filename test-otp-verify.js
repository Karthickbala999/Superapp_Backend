require('dotenv').config();
const axios = require('axios');

async function testOTPVerification() {
    try {
        const response = await axios.post('http://localhost:5000/api/auth/partner/verify-otp', {
            phoneNumber: '+919876543210',
            otp: '347713'
        });

        console.log('✅ API Response:');
        console.log(JSON.stringify(response.data, null, 2));

        if (response.data.success) {
            console.log('\n✅ Success is TRUE');
            console.log('Token:', response.data.token ? 'Present' : 'Missing');
        } else {
            console.log('\n❌ Success is FALSE or missing');
        }
    } catch (error) {
        console.error('❌ API Error:');
        console.error('Status:', error.response?.status);
        console.error('Message:', error.response?.data?.message);
        console.error('Full response:', JSON.stringify(error.response?.data, null, 2));
    }
}

testOTPVerification();

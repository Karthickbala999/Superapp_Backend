require('dotenv').config();
const axios = require('axios');

async function testCompleteFlow() {
    try {
        console.log('Testing complete OTP verification flow...\n');

        // Test OTP verification
        const response = await axios.post('http://localhost:5000/api/auth/partner/verify-otp', {
            phoneNumber: '+919876543210',
            otp: '342245'
        });

        console.log('='.repeat(60));
        console.log('BACKEND RESPONSE:');
        console.log('='.repeat(60));
        console.log(JSON.stringify(response.data, null, 2));
        console.log('='.repeat(60));
        console.log('\nKEY CHECKS:');
        console.log('- response.data exists:', !!response.data);
        console.log('- response.data.success:', response.data.success);
        console.log('- response.data.token exists:', !!response.data.token);
        console.log('- response.data.token type:', typeof response.data.token);
        console.log('- response.data.token length:', response.data.token ? response.data.token.length : 0);
        console.log('='.repeat(60));

    } catch (error) {
        console.error('\n❌ ERROR:');
        console.error('Status:', error.response?.status);
        console.error('Message:', error.response?.data?.message);
        console.error('Full error:', error.message);
    }
}

testCompleteFlow();

require('dotenv').config();
const axios = require('axios');

async function testLogin() {
    const API_URL = 'http://localhost:5000/api';
    const testPhone = '+919876543210';
    const testOTP = '123456';

    console.log('🧪 Testing Partner Login Flow\n');

    try {
        // Step 1: Send OTP
        console.log('1️⃣ Sending OTP...');
        const otpResponse = await axios.post(`${API_URL}/auth/partner/send-otp`, {
            phoneNumber: testPhone
        });
        console.log('✅ OTP Response:', otpResponse.data);

        // Step 2: Verify OTP
        console.log('\n2️⃣ Verifying OTP...');
        const verifyResponse = await axios.post(`${API_URL}/auth/partner/verify-otp`, {
            phoneNumber: testPhone,
            otp: testOTP
        });
        console.log('✅ Verify Response:', verifyResponse.data);

        if (verifyResponse.data.token) {
            console.log('\n✅ TOKEN RECEIVED:', verifyResponse.data.token.substring(0, 50) + '...');
            console.log('✅ Partner:', verifyResponse.data.partner);
            console.log('\n🎉 LOGIN SUCCESSFUL!');
        } else {
            console.log('\n❌ No token in response!');
        }

    } catch (error) {
        console.error('\n❌ ERROR:', error.response?.data || error.message);
        console.error('Status:', error.response?.status);
    }
}

testLogin();

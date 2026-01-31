const axios = require('axios');
const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');
const User = require('./src/models/user');
require('dotenv').config();

// Configuration
const API_URL = 'http://localhost:3000/api';
const JWT_SECRET = process.env.JWT_SECRET || 'your-super-secret-jwt-key';
const MONGODB_URI = process.env.MONGODB_URI;

async function testCreateOrder() {
    let dbConnection = null;
    try {
        // 1. Get Real User
        console.log('Connecting to DB to fetch real user...');
        dbConnection = await mongoose.connect(MONGODB_URI);
        const user = await User.findOne({});

        if (!user) {
            console.error('❌ No users found in DB. Please run seed script or register a user first.');
            process.exit(1);
        }

        const userId = user._id.toString();
        console.log('Found User ID:', userId);

        // Disconnect so it doesn't hang the script
        // await mongoose.disconnect(); // Actually, let's keep it open or just close it. Mongoose buffering might allow us to just close.

        // 2. Generate Token
        const userPayload = {
            id: userId,
            role: user.role || 'user',
            email: user.email,
            name: user.name
        };

        const token = jwt.sign(userPayload, JWT_SECRET, { expiresIn: '1h' });
        console.log('Generated Token for testing.');

        // 3. Test Razorpay
        console.log('\n--- Testing Razorpay Create Order ---');

        const orderData = {
            amount: 500, // ₹500
            currency: 'INR',
            order_id: 'TEST_ORDER_' + Date.now(),
            order_model: 'Order',
            description: 'Test Payment for SuperApp',
            email: user.email || 'test@example.com',
            contact: '9999999999'
        };

        console.log('Sending request to', `${API_URL}/payments/create-order`);

        const response = await axios.post(`${API_URL}/payments/create-order`, orderData, {
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });

        console.log('\n✅ Success! Response Status:', response.status);
        console.log('Response Data:', JSON.stringify(response.data, null, 2));

    } catch (error) {
        console.error('\n❌ Test Failed:');
        if (error.response) {
            console.error('Status:', error.response.status);
            console.error('Data:', JSON.stringify(error.response.data, null, 2));
        } else if (error.request) {
            console.error('No response received:', error.message);
        } else {
            console.error('Error message:', error.message);
        }
    } finally {
        if (mongoose.connection.readyState !== 0) {
            await mongoose.disconnect();
        }
    }
}

testCreateOrder();

const axios = require('axios');
require('dotenv').config();
const Razorpay = require('razorpay');
const fs = require('fs');

const API_URL = 'http://localhost:5000/api';
const TIMESTAMP = Date.now();
const USER_EMAIL = `paytest_${TIMESTAMP}@example.com`;
const USER_PASSWORD = 'password123';
const USER_NAME = 'Payment Test User';
const USER_PHONE = '9876543210';

const LOG_FILE = 'reproduction_log.txt';

function log(message) {
    fs.appendFileSync(LOG_FILE, message + '\n');
    console.log(message);
}

const run = async () => {
    fs.writeFileSync(LOG_FILE, '=== Grocery Payment Flow Diagnostics ===\n');
    log(`${new Date().toISOString()} - Starting diagnostics`);

    // 1. Check Env Vars
    if (!process.env.RAZORPAY_KEY_ID || !process.env.RAZORPAY_KEY_SECRET) {
        log(`✗ Missing Razorpay Keys in .env`);
    } else {
        log(`✓ Razorpay Keys match format`);
    }

    // 2. Test Razorpay Connection
    try {
        const razorpay = new Razorpay({
            key_id: process.env.RAZORPAY_KEY_ID,
            key_secret: process.env.RAZORPAY_KEY_SECRET
        });
        try {
            await razorpay.orders.create({
                amount: 100,
                currency: 'INR',
                receipt: 'connectivity_test',
                notes: { test: 'connectivity' }
            });
            log(`✓ Razorpay API reachable`);
        } catch (apiError) {
            log(`✗ Razorpay API Call Failed: ${JSON.stringify(apiError.error || apiError.message)}`);
        }
    } catch (e) {
        log(`✗ Razorpay Init Failed: ${e.message}`);
    }

    // 3. Register/Login User
    let authToken;
    try {
        const regRes = await axios.post(`${API_URL}/auth/register`, {
            name: USER_NAME,
            email: USER_EMAIL,
            password: USER_PASSWORD,
            phone: USER_PHONE,
            role: 'user'
        });
        authToken = regRes.data.data.token;
        log(`✓ User registered successfully`);
    } catch (e) {
        log(`✗ Registration Failed: ${e.message}`);
        if (e.response) {
            if (e.response.data?.message === 'Email already exists') {
                // Try login
                log(`User exists, attempting login...`);
                try {
                    const loginRes = await axios.post(`${API_URL}/auth/login`, {
                        email: USER_EMAIL,
                        password: USER_PASSWORD
                    });
                    authToken = loginRes.data.data.token;
                    log(`✓ User logged in (exists)`);
                } catch (loginError) {
                    log(`✗ Login Failed: ${loginError.message}`);
                    if (loginError.response) log(`Login Response: ${JSON.stringify(loginError.response.data)}`);
                }
            } else {
                log(`Response: ${JSON.stringify(e.response.data)}`);
            }
        }
    }

    if (!authToken) {
        log("Cannot proceed without token.");
        return;
    }

    // 4. Create Grocery Order
    let orderId;
    let orderAmount;
    try {
        const dummyProductId = "507f1f77bcf86cd799439011"; // A random Mongo ID

        // Note: Using /api/grocery-orders as identified
        const orderRes = await axios.post(`${API_URL}/grocery-orders`, {
            items: [{
                grocery_id: dummyProductId,
                quantity: 2,
                price: 100
            }],
            shipping_address: "Test Address",
            payment_method: "razorpay"
        }, {
            headers: { Authorization: `Bearer ${authToken}` }
        });

        orderId = orderRes.data.data._id;
        orderAmount = orderRes.data.data.total_amount;
        log(`✓ Grocery Order Created: ${orderId} (Amount: ₹${orderAmount})`);

    } catch (e) {
        log(`✗ Grocery Order Creation Failed: ${e.message}`);
        if (e.response) log(`Response: ${JSON.stringify(e.response.data)}`);
        return;
    }

    // 5. Create Payment Order
    try {
        const paymentRes = await axios.post(`${API_URL}/payments/create-order`, {
            amount: orderAmount,
            currency: 'INR',
            order_id: orderId,
            order_model: 'GroceryOrder',
            email: USER_EMAIL,
            contact: USER_PHONE,
            description: "Test Grocery Payment"
        }, {
            headers: { Authorization: `Bearer ${authToken}` }
        });

        const razorpayOrderId = paymentRes.data.data.razorpayOrder.id;
        log(`✓ Payment Order Created: ${razorpayOrderId}`);
        log(`SUCCESS: Backend payment initialization flow validates correctly.`);

    } catch (e) {
        log(`✗ Payment Order Creation Failed: ${e.message}`);
        if (e.response) log(`Response: ${JSON.stringify(e.response.data)}`);
    }
};

run();

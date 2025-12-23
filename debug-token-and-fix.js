const axios = require('axios');
const jwt = require('jsonwebtoken');

async function debugToken() {
    try {
        const API_URL = 'http://localhost:5000/api';
        const phone = '+917845235347';
        const otp = '123456';

        console.log('=== LOGIN ===');
        const loginRes = await axios.post(`${API_URL}/auth/partner/verify-otp`, {
            phoneNumber: phone,
            otp: otp
        });

        const token = loginRes.data.token;
        console.log('Token received:', token.substring(0, 50) + '...');

        // Decode token
        const decoded = jwt.decode(token);
        console.log('\n=== DECODED TOKEN ===');
        console.log('User ID in token:', decoded.id);
        console.log('Partner ID in token:', decoded.partnerId);
        console.log('Phone in token:', decoded.phoneNumber);

        // Now check database for this exact user ID
        const mongoose = require('mongoose');
        const path = require('path');
        require('dotenv').config({ path: path.join(__dirname, '.env') });

        const User = require('./src/models/user');
        const ServicePartner = require('./src/models/urban-services/servicePartner');

        const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/super_app';
        await mongoose.connect(mongoUri);

        console.log('\n=== DATABASE CHECK ===');
        const user = await User.findById(decoded.id);
        console.log('User found:', user ? `${user.name} (${user._id})` : 'NOT FOUND');

        const partner = await ServicePartner.findOne({ user: decoded.id });
        console.log('Partner linked to this user:', partner ? `${partner.businessName} (${partner._id})` : 'NOT FOUND');

        if (!partner) {
            console.log('\n❌ PROBLEM: No ServicePartner linked to user ID:', decoded.id);
            console.log('Searching for ANY ServicePartner with bookings...');

            const ServiceBooking = require('./src/models/urban-services/serviceBooking');
            const allPartners = await ServicePartner.find({});

            for (const p of allPartners) {
                const bookingCount = await ServiceBooking.countDocuments({ partner: p._id });
                console.log(`  - ${p.businessName} (${p._id}) | User: ${p.user || 'NONE'} | Bookings: ${bookingCount}`);

                if (bookingCount > 0 && !partner) {
                    console.log(`\n✅ FIXING: Linking partner ${p._id} to user ${decoded.id}`);
                    p.user = decoded.id;
                    await p.save();
                    console.log('✅ FIXED!');
                }
            }
        }

        await mongoose.disconnect();

    } catch (error) {
        console.error('Error:', error.message);
    }
}

debugToken();

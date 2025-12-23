const mongoose = require('mongoose');
const path = require('path');
const jwt = require('jsonwebtoken');
require('dotenv').config({ path: path.join(__dirname, '.env') });

const User = require('./src/models/user');
const ServicePartner = require('./src/models/urban-services/servicePartner');

async function debugAuthFlow() {
    try {
        const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/super_app';
        await mongoose.connect(mongoUri);
        console.log('✅ Connected to MongoDB\n');

        const phone = '+917845235347';

        // Step 1: Find user by phone (simulating verify-otp)
        console.log('Step 1: Finding user by phone...');
        const user = await User.findOne({ phone });

        if (!user) {
            console.log('❌ User not found with phone:', phone);
            return;
        }

        console.log(`✅ User found: ${user.name} (ID: ${user._id})`);
        console.log(`   Email: ${user.email}`);
        console.log(`   Phone: ${user.phone}`);

        // Step 2: Generate token (simulating verify-otp)
        console.log('\nStep 2: Generating JWT token...');
        const token = jwt.sign(
            { id: user._id },
            process.env.JWT_SECRET || 'your-super-secret-jwt-key',
            { expiresIn: '30d' }
        );
        console.log(`✅ Token generated`);

        // Step 3: Decode token (simulating protect middleware)
        console.log('\nStep 3: Decoding token...');
        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-super-secret-jwt-key');
        console.log(`✅ Decoded user ID: ${decoded.id}`);

        // Step 4: Find user from token (simulating protect middleware)
        console.log('\nStep 4: Finding user from token...');
        const userFromToken = await User.findById(decoded.id);
        if (!userFromToken) {
            console.log('❌ User not found from token ID');
            return;
        }
        console.log(`✅ User from token: ${userFromToken.name} (${userFromToken._id})`);

        // Step 5: Find partner (simulating getAvailableBookings controller)
        console.log('\nStep 5: Finding ServicePartner...');
        console.log(`   Looking for partner with user: ${userFromToken._id}`);

        const partner = await ServicePartner.findOne({ user: userFromToken._id });

        if (!partner) {
            console.log('❌ ServicePartner NOT FOUND');
            console.log('\n   Checking all partners linked to users named Thilocigan:');
            const allPartners = await ServicePartner.find({ businessName: /Thilocigan/i }).populate('user');
            allPartners.forEach(p => {
                console.log(`   - Partner ${p._id} | User: ${p.user?._id} | Name: ${p.user?.name}`);
            });
        } else {
            console.log(`✅ ServicePartner found: ${partner.businessName} (${partner._id})`);
            console.log(`   Linked to user: ${partner.user}`);
        }

    } catch (err) {
        console.error('Error:', err);
    } finally {
        await mongoose.disconnect();
    }
}

debugAuthFlow();

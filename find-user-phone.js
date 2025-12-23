const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });

const User = require('./src/models/user');
const ServicePartner = require('./src/models/urban-services/servicePartner');

async function findUserPhone() {
    try {
        const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/super_app';
        await mongoose.connect(mongoUri);
        console.log('✅ Connected to MongoDB');

        // Find user named Thilocigan
        const users = await User.find({ name: /Thilocigan/i });

        if (users.length === 0) {
            console.log('❌ No user found with name "Thilocigan"');
            return;
        }

        console.log(`\nFound ${users.length} user(s) named "Thilocigan":\n`);

        for (const user of users) {
            console.log(`User ID: ${user._id}`);
            console.log(`Name: ${user.name}`);
            console.log(`Phone: ${user.phone || 'NOT SET'}`);
            console.log(`Email: ${user.email}`);

            // Check if linked to partner
            const partner = await ServicePartner.findOne({ user: user._id });
            if (partner) {
                console.log(`✅ Linked to Partner: ${partner.businessName} (${partner._id})`);
            } else {
                console.log(`❌ NOT linked to any ServicePartner`);
            }
            console.log('---');
        }

    } catch (err) {
        console.error(err);
    } finally {
        await mongoose.disconnect();
    }
}

findUserPhone();

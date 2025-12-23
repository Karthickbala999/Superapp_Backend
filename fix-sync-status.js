const mongoose = require('mongoose');
const dotenv = require('dotenv');
const ServicePartner = require('./src/models/urban-services/servicePartner');
const Partner = require('./src/models/Partner');
const User = require('./src/models/user');

dotenv.config();

const connectDB = async () => {
    try {
        const conn = await mongoose.connect(process.env.MONGODB_URI);
        console.log(`MongoDB Connected: ${conn.connection.host}`);
    } catch (error) {
        console.error(`Error: ${error.message}`);
        process.exit(1);
    }
};

const fixSyncStatus = async () => {
    await connectDB();

    try {
        console.log('--- Starting Sync Check ---');

        // 1. Get all verified ServicePartners
        const servicePartners = await ServicePartner.find({ isVerified: true }).populate('user');
        console.log(`Found ${servicePartners.length} verified ServicePartners.`);

        for (const sp of servicePartners) {
            if (!sp.user) {
                console.warn(`ServicePartner ${sp._id} has no linked User! Skipping.`);
                continue;
            }

            const userPhone = sp.user.phone;
            if (!userPhone) {
                console.warn(`User ${sp.user._id} (${sp.user.name}) has no phone! Skipping.`);
                continue;
            }

            console.log(`Checking Partner for User: ${sp.user.name} (${userPhone})...`);

            // 2. Find corresponding Mobile Partner
            // Try exact match first
            let partner = await Partner.findOne({ phoneNumber: userPhone });

            if (!partner) {
                console.log(`  No Partner found for exact phone ${userPhone}. Trying without +91...`);
                // Try stripping +91 if present
                const stripped = userPhone.replace('+91', '');
                // Or adding it
                const added = '+91' + stripped;

                partner = await Partner.findOne({
                    phoneNumber: { $in: [stripped, added] } // simple fuzzy try
                });
            }

            if (partner) {
                console.log(`  Found Partner: ${partner._id} (Status: ${partner.status})`);

                if (partner.status !== 'approved') {
                    console.log(`  MISMATCH FOUND! Updating Partner status to 'approved'...`);
                    partner.status = 'approved';
                    await partner.save();
                    console.log(`  FIXED: Partner ${partner._id} status is now 'approved'.`);
                } else {
                    console.log('  Status is already consistent.');
                }
            } else {
                console.error(`  CRITICAL: No Mobile Partner record found for phone ${userPhone} (User: ${sp.user._id})`);
            }
        }

        console.log('--- Sync Check Complete ---');
        process.exit();
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
};

fixSyncStatus();

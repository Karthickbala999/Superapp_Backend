require('dotenv').config();
const mongoose = require('mongoose');

async function getLatestOTP() {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('✅ Connected to MongoDB\n');

        // Try to find the OTP model
        const db = mongoose.connection.db;
        const collections = await db.listCollections().toArray();

        console.log('Available collections:');
        collections.forEach(col => console.log(`  - ${col.name}`));

        // Look for OTP-related collections
        const otpCollections = collections.filter(col =>
            col.name.toLowerCase().includes('otp')
        );

        if (otpCollections.length > 0) {
            console.log('\nOTP Collections found:');
            for (const col of otpCollections) {
                console.log(`\n📋 Collection: ${col.name}`);
                const docs = await db.collection(col.name)
                    .find({ phoneNumber: '+919876543210' })
                    .sort({ createdAt: -1 })
                    .limit(1)
                    .toArray();

                if (docs.length > 0) {
                    console.log('Latest OTP:', docs[0].otp);
                    console.log('Expires at:', docs[0].expiresAt);
                    console.log('Is used:', docs[0].isUsed);
                } else {
                    console.log('No OTP found for +919876543210');
                }
            }
        } else {
            console.log('\n❌ No OTP collections found');
        }

        await mongoose.connection.close();
    } catch (error) {
        console.error('❌ Error:', error.message);
    }
}

getLatestOTP();

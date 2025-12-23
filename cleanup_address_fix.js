const mongoose = require('mongoose');
const dotenv = require('dotenv');

// Load env vars
dotenv.config();

const cleanBadAddressData = async () => {
    try {
        console.log('Connecting to DB...');
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected.');

        const db = mongoose.connection.db;
        const collection = db.collection('servicebookings');

        // Check how many have the issue
        const count = await collection.countDocuments({ address: "new" });
        console.log(`Found ${count} bookings with invalid address "new".`);

        if (count > 0) {
            // Update all documents where address is the string "new" to be null
            const result = await collection.updateMany(
                { address: "new" },
                { $set: { address: null } }
            );
            console.log(`Cleaned up ${result.modifiedCount} bookings.`);
        } else {
            console.log('No cleanup needed.');
        }

        process.exit(0);
    } catch (error) {
        console.error('Cleanup failed:', error);
        process.exit(1);
    }
};

cleanBadAddressData();

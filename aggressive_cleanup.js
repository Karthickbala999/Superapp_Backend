const mongoose = require('mongoose');
const dotenv = require('dotenv');

dotenv.config();

const aggressiveCleanup = async () => {
    try {
        console.log('Connecting to DB for aggressive cleanup...');
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected.');

        const db = mongoose.connection.db;
        const collection = db.collection('servicebookings');

        // Find documents where 'address' is a string (Type 2 in BSON)
        // This covers "new", "New", "  new  ", or any garbage string that isn't an ObjectId
        const query = { address: { $type: 2 } };

        const count = await collection.countDocuments(query);
        console.log(`Found ${count} bookings where address is a STRING (should be ObjectId or Null).`);

        if (count > 0) {
            const result = await collection.updateMany(
                query,
                { $set: { address: null } }
            );
            console.log(`Successfully fixed ${result.modifiedCount} bookings.`);
        } else {
            console.log('No invalid string addresses found.');
        }

        // Double check: Find any that are NOT null and NOT ObjectId?
        // Hard to do strictly with standard query, but string check is usually sufficient for this error.

        process.exit(0);
    } catch (error) {
        console.error('Aggressive cleanup failed:', error);
        process.exit(1);
    }
};

aggressiveCleanup();

const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/superapp_db';
console.log('Using URI:', MONGODB_URI.replace(/\/\/.*@/, '//***@')); // Hide credentials in log

const debugDb = async () => {
    try {
        console.log('Connecting...');
        await mongoose.connect(MONGODB_URI, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        });
        console.log('Connected to:', mongoose.connection.name);

        if (mongoose.connection.db) {
            const collections = await mongoose.connection.db.listCollections().toArray();
            console.log('Collections:', collections.map(c => c.name));

            // Try to find the partner collection
            const partnerCol = collections.find(c => c.name.toLowerCase().includes('partner'));

            if (partnerCol) {
                console.log(`Found partner collection: ${partnerCol.name}`);
                const collection = mongoose.connection.collection(partnerCol.name);
                const indexes = await collection.indexes();
                console.log('Indexes:', indexes.map(i => i.name));

                const targets = ['personal_info.email_1', 'application_id_1'];
                for (const t of targets) {
                    if (indexes.find(i => i.name === t)) {
                        console.log(`Dropping ${t}...`);
                        await collection.dropIndex(t);
                        console.log(`Dropped ${t}`);
                    } else {
                        console.log(`Index ${t} not found.`);
                    }
                }
            } else {
                console.log('No partner collection found!');
            }
        } else {
            console.log('Database object is undefined?');
        }

        process.exit(0);
    } catch (error) {
        console.error('Error:', error);
        process.exit(1);
    }
};

debugDb();

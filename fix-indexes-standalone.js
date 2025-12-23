const mongoose = require('mongoose');

// Use the URI from config or default to localhost
const MONGODB_URI = 'mongodb://localhost:27017/superapp_db';

const fixIndexes = async () => {
    try {
        console.log('Connecting to MongoDB...');
        await mongoose.connect(MONGODB_URI, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        });
        console.log('Connected.');

        const collection = mongoose.connection.collection('partners');

        // List indexes
        const indexes = await collection.indexes();
        console.log('Current indexes:', indexes.map(i => i.name));

        // Indexes to remove
        const targets = ['personal_info.email_1', 'application_id_1'];

        for (const indexName of targets) {
            if (indexes.find(i => i.name === indexName)) {
                console.log(`Dropping index: ${indexName}...`);
                await collection.dropIndex(indexName);
                console.log(`Dropped ${indexName}.`);
            } else {
                console.log(`Index ${indexName} not found (already removed).`);
            }
        }

        console.log('Done.');
        process.exit(0);
    } catch (error) {
        console.error('Error:', error);
        process.exit(1);
    }
};

fixIndexes();

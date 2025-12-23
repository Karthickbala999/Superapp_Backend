const mongoose = require('mongoose');

const MONGODB_URI = 'mongodb+srv://superapp_admin:superapp_admin%40740@cluster0.gtmzerf.mongodb.net/superapp_db?retrywrites=true&w=majority&appName=Cluster0';

const run = async () => {
    try {
        await mongoose.connect(MONGODB_URI);
        console.log('Connected to Atlas DB.');

        const collection = mongoose.connection.collection('partners');
        const indexes = await collection.indexes();
        console.log('Current Indexes:', indexes.map(i => i.name));

        const toDrop = ['personal_info.email_1', 'application_id_1'];

        for (const idxName of toDrop) {
            if (indexes.find(i => i.name === idxName)) {
                console.log(`Dropping index: ${idxName}`);
                await collection.dropIndex(idxName);
                console.log('Dropped.');
            } else {
                console.log(`Index ${idxName} not found.`);
            }
        }

        console.log('Done.');
        process.exit(0);

    } catch (error) {
        console.error('Error:', error);
        process.exit(1);
    }
};

run();

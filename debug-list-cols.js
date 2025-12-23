const mongoose = require('mongoose');
const fs = require('fs');
require('dotenv').config({ path: 'src/config/.env' });

async function listCollections() {
    const log = [];
    function logMsg(msg) {
        console.log(msg);
        log.push(msg);
    }

    try {
        const uri = 'mongodb://localhost:27017/superapp_db';
        await mongoose.connect(uri);
        logMsg('Connected to MongoDB');

        const collections = await mongoose.connection.db.listCollections().toArray();
        logMsg('\n--- Collections ---');
        for (const col of collections) {
            const count = await mongoose.connection.db.collection(col.name).countDocuments();
            logMsg(`${col.name}: ${count} docs`);
        }

    } catch (err) {
        logMsg(`Error: ${err.message}`);
    } finally {
        fs.writeFileSync('debug-cols.txt', log.join('\n'));
        await mongoose.disconnect();
    }
}

listCollections();

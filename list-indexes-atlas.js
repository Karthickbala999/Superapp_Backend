const mongoose = require('mongoose');
const fs = require('fs');

const MONGODB_URI = 'mongodb+srv://superapp_admin:superapp_admin%40740@cluster0.gtmzerf.mongodb.net/superapp_db?retrywrites=true&w=majority&appName=Cluster0';

const run = async () => {
    const log = [];
    function logMsg(msg) {
        console.log(msg);
        log.push(msg);
    }
    try {
        await mongoose.connect(MONGODB_URI);
        logMsg('Connected to Atlas DB.');

        const collections = ['users', 'partners', 'servicepartners'];
        for (const colName of collections) {
            logMsg(`\n--- Indexes for ${colName} ---`);
            const col = mongoose.connection.collection(colName);
            try {
                const indexes = await col.indexes();
                indexes.forEach(i => logMsg(`${i.name}: ${JSON.stringify(i.key)}`));
            } catch (e) {
                logMsg(`Error listing indexes for ${colName}: ${e.message}`);
            }
        }

    } catch (error) {
        logMsg('Error:', error);
    } finally {
        fs.writeFileSync('atlas-indexes.txt', log.join('\n'));
        process.exit(0);
    }
};

run();

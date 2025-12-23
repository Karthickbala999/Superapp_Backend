const mongoose = require('mongoose');
const fs = require('fs');
const User = require('./src/models/user');
const ServicePartner = require('./src/models/urban-services/servicePartner');
require('dotenv').config();

(async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        const partners = await ServicePartner.find({}).populate('user', 'name');
        const logStream = fs.createWriteStream('partners_list.txt');
        partners.forEach(p => {
            logStream.write(`Biz: "${p.businessName}" | User: "${p.user?.name}" | ID: ${p._id}\n`);
        });
        logStream.end();
    } catch (e) { console.error(e); }
    finally { mongoose.connection.close(); }
})();

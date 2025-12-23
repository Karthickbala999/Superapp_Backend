const mongoose = require('mongoose');
const User = require('./src/models/user');
const ServicePartner = require('./src/models/urban-services/servicePartner');
require('dotenv').config();

(async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        const partners = await ServicePartner.find({}).populate('user', 'name');
        console.log('--- ALL PARTNERS ---');
        partners.forEach(p => {
            console.log(`Biz: "${p.businessName}" | User: "${p.user?.name}" | ID: ${p._id}`);
        });
    } catch (e) { console.error(e); }
    finally { mongoose.connection.close(); }
})();

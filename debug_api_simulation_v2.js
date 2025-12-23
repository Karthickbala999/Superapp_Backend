const mongoose = require('mongoose');
const User = require('./src/models/user'); // Load User model
const ServicePartner = require('./src/models/urban-services/servicePartner');
require('dotenv').config();

(async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);

        const query = {};
        const limit = 10;
        const page = 1;

        const total = await ServicePartner.countDocuments(query);
        console.log(`Total Documents in DB: ${total}`);

        const partners = await ServicePartner.find(query)
            .populate('user', 'name email phone') // Now User model is known
            .sort({ createdAt: -1 })
            .limit(limit)
            .skip((page - 1) * limit);

        console.log(`Returned Partners: ${partners.length}`);

        partners.forEach((p, i) => {
            console.log(`${i + 1}. ${p.businessName} (Created: ${p.createdAt})`);
        });

    } catch (e) { console.error(e); }
    finally { mongoose.connection.close(); }
})();

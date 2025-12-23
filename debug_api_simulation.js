const mongoose = require('mongoose');
const ServicePartner = require('./src/models/urban-services/servicePartner');
require('dotenv').config();

(async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);

        // Simulate controller query
        const query = {};
        const limit = 10;
        const page = 1;

        const total = await ServicePartner.countDocuments(query);
        console.log(`Total Documents in DB: ${total}`);

        const partners = await ServicePartner.find(query)
            .populate('user', 'name email phone')
            .sort({ createdAt: -1 })
            .limit(limit)
            .skip((page - 1) * limit);

        console.log(`Returned Partners: ${partners.length}`);

        partners.forEach((p, i) => {
            console.log(`${i + 1}. ${p.businessName} | Verified: ${p.isVerified} | Status: ${p.status} | ID: ${p._id}`);
        });

    } catch (e) { console.error(e); }
    finally { mongoose.connection.close(); }
})();

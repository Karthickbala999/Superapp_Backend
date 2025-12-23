const mongoose = require('mongoose');
const ServicePartner = require('./src/models/urban-services/servicePartner');

require('dotenv').config();

const listPartners = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected to DB');

        const partners = await ServicePartner.find({});
        console.log(`Total Partners: ${partners.length}`);
        partners.forEach(p => console.log(` - ${p.businessName} (ID: ${p._id}, User: ${p.user})`));

    } catch (err) {
        console.error(err);
    } finally {
        mongoose.connection.close();
    }
};

listPartners();

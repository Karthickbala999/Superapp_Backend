const mongoose = require('mongoose');
const ServicePartner = require('./src/models/urban-services/servicePartner');
require('dotenv').config();

(async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        const thilo = await ServicePartner.findOne({ businessName: /Thilocigan/i });
        if (thilo) {
            thilo.isVerified = true;
            thilo.status = 'active';
            thilo.isAvailable = true;
            // Trigger update
            thilo.experience = thilo.experience || 0;
            await thilo.save();
            console.log(`Updated Thilocigan (${thilo._id}). New updatedAt: ${thilo.updatedAt}`);
        } else {
            console.log('Thilocigan not found to update.');
        }
    } catch (e) { console.error(e); }
    finally { mongoose.connection.close(); }
})();

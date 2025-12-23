const mongoose = require('mongoose');
const ServicePartner = require('./src/models/urban-services/servicePartner');
const User = require('./src/models/user');
require('dotenv').config();

(async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        const partners = await ServicePartner.find({}).populate('user');
        console.log(`Total Partners: ${partners.length}`);

        let foundThilo = false;
        partners.forEach(p => {
            const uName = p.user ? p.user.name : 'No User';
            console.log(`P: "${p.businessName}" | Status: ${p.status} | Verified: ${p.isVerified} | User: ${uName} (${p.user?._id})`);
            if (p.businessName.match(/Thilocigan/i)) foundThilo = true;
        });

        if (!foundThilo) {
            console.log('\nThilocigan NOT FOUND in ServicePartner collection.');
            // Check User
            const userThilo = await User.findOne({ name: /Thilocigan/i });
            if (userThilo) {
                console.log(`User "Thilocigan" exists: ${userThilo._id}`);
            } else {
                console.log('User "Thilocigan" NOT FOUND.');
            }
        }

    } catch (e) { console.error(e); }
    finally { mongoose.connection.close(); }
})();

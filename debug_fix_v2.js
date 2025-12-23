const mongoose = require('mongoose');
const User = require('./src/models/user');
const ServicePartner = require('./src/models/urban-services/servicePartner');

require('dotenv').config();

const fixIt = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected to DB');

        const phone = '+919952643759';
        const users = await User.find({ phone }).sort({ createdAt: 1 });

        console.log(`Found ${users.length} users with phone ${phone}`);
        users.forEach(u => console.log(` - ${u._id} | ${u.name} | ${u.createdAt}`));

        // We suspect there are TWO users, but maybe my previous log was truncated.
        // If there is only ONE user, then "Vinoth" IS "Thilocigan" (renamed account)?
        // Or did "Thilocigan" get deleted?

        // Let's check ServicePartners associated with these users.
        for (const u of users) {
            const p = await ServicePartner.findOne({ user: u._id });
            if (p) {
                console.log(`User ${u.name} (${u._id}) HAS Partner ${p.businessName} (${p._id})`);
                console.log(`Partner Details: Verified: ${p.isVerified}, Status: ${p.status}`);

                // If this user is Vinoth (New), but Partner name is "Thilocigan" (Old)?
                // Or if Partner name is "Vinoth", then data was overwritten.
                console.log('Partner Full Dump:', p);
            } else {
                // Maybe this is the old user (Thilocigan) who lost link?
                console.log(`User ${u.name} (${u._id}) has NO Partner`);
            }
        }
    } catch (err) {
        console.error(err);
    } finally {
        mongoose.connection.close();
    }
};

fixIt();

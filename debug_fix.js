const mongoose = require('mongoose');
const User = require('./src/models/user');
const ServicePartner = require('./src/models/urban-services/servicePartner');

// Hardcoded URI since I couldn't read .env fully easily, but I can assume it's valid if I require the app config? 
// No, simpler to just assume local or try to import it.
// Let's try to assume the standard Mongo URI or import from config if possible.
// Actually, I can just require dotenv.

require('dotenv').config();

const fixIt = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected to DB');

        const phone = '+919952643759'; // The problematic number

        // Find Users
        const users = await User.find({ phone });
        console.log(`Found ${users.length} users with phone ${phone}:`);
        users.forEach(u => console.log(` - ID: ${u._id}, Name: ${u.name}, Created: ${u.createdAt}`));

        // Find ServicePartner
        // We want the partner linked to this phone (User)
        // Currently linked to one of them

        // We can search ServicePartner by user ID
        for (const u of users) {
            const p = await ServicePartner.findOne({ user: u._id });
            if (p) {
                console.log(`User ${u.name} IS linked to ServicePartner: ${p.businessName} (ID: ${p._id})`);
            } else {
                console.log(`User ${u.name} is NOT linked to any ServicePartner`);
            }
        }

    } catch (err) {
        console.error(err);
    } finally {
        mongoose.connection.close();
    }
};

fixIt();

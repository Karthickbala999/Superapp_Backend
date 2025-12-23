const mongoose = require('mongoose');
const ServicePartner = require('./src/models/urban-services/servicePartner');
const User = require('./src/models/user');
require('dotenv').config();

(async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);

        const marker = new ServicePartner({
            user: new mongoose.Types.ObjectId(), // Dummy user ID (unsafe but for test)
            // Wait, schema requires ref to User. I should use an existing user or create one.
            // Let's use the first user found.
        });

        const user = await User.findOne();
        if (!user) throw new Error('No user found');

        const p = new ServicePartner({
            user: user._id,
            businessName: "ANTIGRAVITY_TEST_MARKER",
            status: 'active',
            isVerified: true
        });
        await p.save();
        console.log('Created marker partner ANTIGRAVITY_TEST_MARKER');

    } catch (e) { console.error(e); }
    finally { mongoose.connection.close(); }
})();

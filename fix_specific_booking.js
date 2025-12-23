const mongoose = require('mongoose');
const fs = require('fs');
const User = require('./src/models/user');
const ServicePartner = require('./src/models/urban-services/servicePartner');
const ServiceBooking = require('./src/models/urban-services/serviceBooking');

require('dotenv').config();

const log = (msg) => {
    console.log(msg);
    fs.appendFileSync('fix_log.txt', msg + '\n');
};

const fixIt = async () => {
    fs.writeFileSync('fix_log.txt', '--- START FIX ---\n');
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        log('Connected to DB');

        // 1. Find target Thilocigan User
        const thilociganId = '693b13e17e2c9d023bf08277'; // Found in previous log
        const user = await User.findById(thilociganId);
        if (!user) {
            throw new Error('Thilocigan User not found!');
        }
        log(`Target User: ${user.name} (${user._id})`);

        // 2. Find the Booking
        const bookingNumber = 'USR1765950059831';
        const booking = await ServiceBooking.findOne({ bookingNumber });
        if (!booking) {
            throw new Error('Booking not found!');
        }
        log(`Booking Found: ${booking.bookingNumber}, Partner ID: ${booking.partner}`);

        if (!booking.partner) {
            throw new Error('Booking has no partner assigned');
        }

        // 3. Find the Partner
        const partner = await ServicePartner.findById(booking.partner);
        if (!partner) {
            throw new Error('Partner not found');
        }
        log(`Current Partner State:`);
        log(`  ID: ${partner._id}`);
        log(`  Name: ${partner.businessName}`);
        log(`  Linked User: ${partner.user}`);

        // Verify current user name
        const currentUser = await User.findById(partner.user);
        log(`  Current Linked User Name: ${currentUser ? currentUser.name : 'Unknown'}`);

        // 4. APPLY FIX
        log('--- APPLYING FIX ---');
        partner.user = user._id;           // Relink to Thilocigan
        partner.businessName = "Thilocigan"; // Rename
        partner.isVerified = true;           // Ensure verified
        partner.status = 'active';           // Ensure active

        await partner.save();
        log('✅ Partner restored successfully to Thilocigan!');

        // 5. Verification
        const updatedPartner = await ServicePartner.findById(partner._id).populate('user');
        log(`New Partner State: Name=${updatedPartner.businessName}, User=${updatedPartner.user.name}`);

    } catch (err) {
        log('ERROR: ' + err.message);
    } finally {
        mongoose.connection.close();
    }
};

fixIt();

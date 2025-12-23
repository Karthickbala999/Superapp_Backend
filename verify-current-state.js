const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });

const User = require('./src/models/user');
const ServicePartner = require('./src/models/urban-services/servicePartner');
const ServiceBooking = require('./src/models/urban-services/serviceBooking');

async function verifyCurrentState() {
    try {
        const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/super_app';
        await mongoose.connect(mongoUri);

        const phone = '+917845235347';

        // Find user
        const user = await User.findOne({ phone });
        console.log('\n=== USER ===');
        console.log(`ID: ${user?._id}`);
        console.log(`Name: ${user?.name}`);
        console.log(`Phone: ${user?.phone}`);

        if (!user) {
            console.log('❌ USER NOT FOUND');
            return;
        }

        // Find partner linked to this user
        const partner = await ServicePartner.findOne({ user: user._id });
        console.log('\n=== PARTNER LINKED TO USER ===');
        if (partner) {
            console.log(`ID: ${partner._id}`);
            console.log(`Name: ${partner.businessName}`);
            console.log(`User: ${partner.user}`);

            // Find bookings for this partner
            const bookings = await ServiceBooking.find({ partner: partner._id });
            console.log(`\n=== BOOKINGS FOR THIS PARTNER ===`);
            console.log(`Count: ${bookings.length}`);
            bookings.forEach(b => {
                console.log(`  - ${b.bookingNumber} (${b.status})`);
            });
        } else {
            console.log('❌ NO PARTNER LINKED TO THIS USER');

            // Check if any Thilocigan partners exist
            const allPartners = await ServicePartner.find({ businessName: /Thilocigan/i });
            console.log(`\n=== ALL THILOCIGAN PARTNERS ===`);
            for (const p of allPartners) {
                const count = await ServiceBooking.countDocuments({ partner: p._id });
                console.log(`  - ${p._id} | User: ${p.user} | Bookings: ${count}`);
            }
        }

    } catch (err) {
        console.error(err.message);
    } finally {
        await mongoose.disconnect();
    }
}

verifyCurrentState();

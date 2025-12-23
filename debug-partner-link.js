const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });

const User = require('./src/models/user');
const ServicePartner = require('./src/models/urban-services/servicePartner');
const ServiceBooking = require('./src/models/urban-services/serviceBooking');

async function debugPartnerLink() {
    try {
        const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/super_app'; // Fallback
        await mongoose.connect(mongoUri);
        console.log('✅ Connected to MongoDB');

        // 1. Find User by Phone (Login User)
        const phone = '+919876543210'; // Replace with the phone user is testing with if known, else usage default
        // Wait, the screenshot shows "Thilocigan" as name.
        // I should search for ServicePartner "Thilocigan" first.

        console.log('🔍 Finding ServicePartners named "Thilocigan"...');
        // Using regex for case-insensitive
        const partners = await ServicePartner.find({
            $or: [
                { businessName: /Thilocigan/i },
                { name: /Thilocigan/i } // Check schema if name exists? Schema has businessName. User has name.
            ]
        });

        console.log(`Found ${partners.length} partners named "Thilocigan".`);

        for (const p of partners) {
            console.log('--------------------------------------------------');
            console.log(`Partner ID: ${p._id}`);
            console.log(`Business Name: ${p.businessName}`);
            console.log(`Linked User ID: ${p.user}`);

            if (p.user) {
                const u = await User.findById(p.user);
                if (u) {
                    console.log(`Linked User Name: ${u.name}`);
                    console.log(`Linked User Phone: ${u.phone}`);
                    console.log(`Linked User Email: ${u.email}`);
                } else {
                    console.log('❌ Linked User NOT FOUND in Users collection!');
                }
            } else {
                console.log('❌ No User linked!');
            }

            // Check bookings for this partner
            const bookings = await ServiceBooking.countDocuments({ partner: p._id });
            console.log(`Bookings Assigned: ${bookings}`);
        }

        // 2. Find User for test phone
        console.log('\n🔍 Check Login User (Test Phone)...');
        // Is the user testing with +919876543210 or real phone?
        // Screenshot 417 shows "Thilocigan" under Partner column.
        // Screenshot 451 shows logged in user avatar "T".

        // I'll list ALL ServicePartners with bookings to see who has them.
        console.log('\n🔍 Partners with Bookings:');
        const bookings = await ServiceBooking.find({}).populate('partner');
        const bookingCounts = {};
        bookings.forEach(b => {
            const pid = b.partner ? b.partner._id.toString() : 'Unassigned';
            const name = b.partner ? b.partner.businessName : 'Unassigned';
            if (!bookingCounts[pid]) bookingCounts[pid] = { name, count: 0, status: {} };
            bookingCounts[pid].count++;
            bookingCounts[pid].status[b.status] = (bookingCounts[pid].status[b.status] || 0) + 1;
        });

        console.table(Object.values(bookingCounts));

    } catch (err) {
        console.error(err);
    } finally {
        await mongoose.disconnect();
    }
}

debugPartnerLink();

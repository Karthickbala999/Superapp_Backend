const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });

const User = require('./src/models/user');
const ServicePartner = require('./src/models/urban-services/servicePartner');
const ServiceBooking = require('./src/models/urban-services/serviceBooking');

async function reassignBookings() {
    try {
        const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/super_app';
        await mongoose.connect(mongoUri);
        console.log('✅ Connected to MongoDB\n');

        const phone = '+917845235347';

        // 1. Find the user
        const user = await User.findOne({ phone });
        if (!user) {
            console.log('❌ User not found');
            return;
        }
        console.log(`✅ Found user: ${user.name} (${user._id})`);

        // 2. Find the partner linked to this user
        let userPartner = await ServicePartner.findOne({ user: user._id });
        console.log(`Partner linked to user: ${userPartner?._id || 'NONE'}`);

        // 3. Find all partners named Thilocigan
        const allPartners = await ServicePartner.find({ businessName: /Thilocigan/i });
        console.log(`\nFound ${allPartners.length} Thilocigan partners:`);

        let partnerWithBookings = null;
        for (const p of allPartners) {
            const count = await ServiceBooking.countDocuments({ partner: p._id });
            console.log(`  - ${p._id} | User: ${p.user || 'NONE'} | Bookings: ${count}`);
            if (count > 0) {
                partnerWithBookings = p;
            }
        }

        if (!partnerWithBookings) {
            console.log('\n❌ No partner has bookings assigned');
            return;
        }

        console.log(`\n✅ Partner with bookings: ${partnerWithBookings._id}`);

        // 4. If user partner is different from partner with bookings, reassign
        if (!userPartner || userPartner._id.toString() !== partnerWithBookings._id.toString()) {
            console.log('\n🔄 Reassigning bookings...');

            // Update the partner with bookings to link to the user
            partnerWithBookings.user = user._id;
            await partnerWithBookings.save();
            console.log(`✅ Linked partner ${partnerWithBookings._id} to user ${user._id}`);

            // Delete the duplicate partner if it exists and has no bookings
            if (userPartner && userPartner._id.toString() !== partnerWithBookings._id.toString()) {
                const dupBookings = await ServiceBooking.countDocuments({ partner: userPartner._id });
                if (dupBookings === 0) {
                    await ServicePartner.findByIdAndDelete(userPartner._id);
                    console.log(`🗑️ Deleted duplicate partner ${userPartner._id}`);
                }
            }
        } else {
            console.log('\n✅ Partner already correctly linked');
        }

        // 5. Verify final state
        const finalBookings = await ServiceBooking.find({ partner: partnerWithBookings._id }).select('bookingNumber status');
        console.log(`\n📊 Final verification:`);
        console.log(`   Partner: ${partnerWithBookings._id}`);
        console.log(`   Linked to user: ${partnerWithBookings.user}`);
        console.log(`   Bookings (${finalBookings.length}):`);
        finalBookings.forEach(b => console.log(`     - ${b.bookingNumber} (${b.status})`));

    } catch (err) {
        console.error('Error:', err.message);
    } finally {
        await mongoose.disconnect();
    }
}

reassignBookings();

const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });

const User = require('./src/models/user');
const ServicePartner = require('./src/models/urban-services/servicePartner');
const ServiceBooking = require('./src/models/urban-services/serviceBooking');

async function finalFix() {
    try {
        const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/super_app';
        await mongoose.connect(mongoUri);
        console.log('✅ Connected to MongoDB\n');

        const phone = '+917845235347';

        console.log('=== STEP 1: Find/Create User ===');
        let user = await User.findOne({ phone });
        if (!user) {
            console.log('❌ User not found - creating new user');
            user = await User.create({
                name: 'Thilocigan',
                email: `partner_${phone.replace('+', '')}@urban.temp`,
                phone: phone,
                password: 'TempPass123!',
                role: 'user',
                status: true
            });
        }
        console.log(`✅ User: ${user.name} (${user._id})`);

        console.log('\n=== STEP 2: Find All Thilocigan Partners ===');
        const allPartners = await ServicePartner.find({ businessName: /Thilocigan/i });
        console.log(`Found ${allPartners.length} partners`);

        let masterPartner = null;
        const partnersToDelete = [];

        for (const p of allPartners) {
            const bookingCount = await ServiceBooking.countDocuments({ partner: p._id });
            console.log(`  - ${p._id} | User: ${p.user || 'NONE'} | Bookings: ${bookingCount}`);

            if (bookingCount > 0) {
                masterPartner = p;
            } else if (masterPartner) {
                partnersToDelete.push(p._id);
            }
        }

        if (!masterPartner && allPartners.length > 0) {
            masterPartner = allPartners[0];
        }

        console.log('\n=== STEP 3: Link Master Partner to User ===');
        if (masterPartner) {
            masterPartner.user = user._id;
            masterPartner.businessName = 'Thilocigan';
            await masterPartner.save();
            console.log(`✅ Linked partner ${masterPartner._id} to user ${user._id}`);

            // Delete duplicates
            for (const pid of partnersToDelete) {
                await ServicePartner.findByIdAndDelete(pid);
                console.log(`🗑️ Deleted duplicate partner ${pid}`);
            }
        } else {
            console.log('Creating new partner...');
            masterPartner = await ServicePartner.create({
                user: user._id,
                businessName: 'Thilocigan',
                partnerType: 'individual',
                isVerified: true,
                status: 'active'
            });
            console.log(`✅ Created partner ${masterPartner._id}`);
        }

        console.log('\n=== STEP 4: Verify Bookings ===');
        const bookings = await ServiceBooking.find({ partner: masterPartner._id });
        console.log(`Total bookings: ${bookings.length}`);
        bookings.forEach(b => {
            console.log(`  - ${b.bookingNumber} | Status: ${b.status}`);
        });

        console.log('\n=== FINAL STATE ===');
        console.log(`User ID: ${user._id}`);
        console.log(`User Phone: ${user.phone}`);
        console.log(`Partner ID: ${masterPartner._id}`);
        console.log(`Partner Name: ${masterPartner.businessName}`);
        console.log(`Bookings: ${bookings.length}`);
        console.log('\n✅ FIX COMPLETE!');
        console.log(`\nLogin with: ${phone}`);
        console.log('OTP: 123456');

    } catch (err) {
        console.error('Error:', err.message);
    } finally {
        await mongoose.disconnect();
    }
}

finalFix();

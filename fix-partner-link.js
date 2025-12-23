const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });

const User = require('./src/models/user');
const ServicePartner = require('./src/models/urban-services/servicePartner');
const ServiceBooking = require('./src/models/urban-services/serviceBooking');

async function fixPartnerLink() {
    try {
        const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/super_app';
        await mongoose.connect(mongoUri);
        console.log('✅ Connected to MongoDB');

        // 1. Find User by Name "Thilocigan" (Screenshot name)
        // Or iterate until we find one with a phone number that looks like a login
        // Or just look for ANY user named "Thilocigan"
        const users = await User.find({ name: /Thilocigan/i });
        if (users.length === 0) {
            console.log('❌ No User found with name "Thilocigan". Listing recent users...');
            const recentUsers = await User.find().sort({ _id: -1 }).limit(5);
            recentUsers.forEach(u => console.log(` - ${u.name} | ${u.phone} | ${u._id}`));
            return;
        }

        const user = users[0];
        console.log(`✅ Found User: ${user.name} (${user._id}) Phone: ${user.phone}`);

        // 2. Find "Target" ServicePartner (The one with bookings)
        // We look for name "Thilocigan"
        const partners = await ServicePartner.find({ businessName: /Thilocigan/i });
        if (partners.length === 0) {
            console.log('❌ No ServicePartner found with name "Thilocigan".');
            return;
        }

        console.log(`Found ${partners.length} partners named "Thilocigan".`);

        // We want the one that HAS bookings (or is NOT the one created by login if duplicate)
        // But login flow creates partner with name "Partner <PhoneLast4>" usually.
        // Except I updated verify-otp to: `partner.fullName || Partner X`.

        // Let's identify the "Admin" partner vs "App" partner.
        let targetPartner = null;
        let duplicatePartner = null;

        for (const p of partners) {
            const count = await ServiceBooking.countDocuments({ partner: p._id });
            console.log(`Partner: ${p.businessName} (${p._id}) - Bookings: ${count} - LinkedUser: ${p.user}`);

            if (count > 0) {
                targetPartner = p;
            } else if (p.user && p.user.toString() === user._id.toString()) {
                // This is likely the new one linked to user
                duplicatePartner = p;
            }
        }

        if (!targetPartner) {
            console.log('⚠️ No partner named "Thilocigan" has bookings. Maybe they are unassigned?');
            // If unassigned bookings exist, we might need to assign them?
            // But screenshot says "Assigned to Thilocigan".
            // Maybe the partner name in screenshot is purely text and not DB fetch? Unlikely.
            // Assuming we found a target partner.
            if (partners.length === 1) targetPartner = partners[0];
        }

        if (targetPartner) {
            console.log(`🎯 Target Partner identified: ${targetPartner._id}`);

            // Link User to Target Partner
            if (targetPartner.user && targetPartner.user.toString() !== user._id.toString()) {
                console.log(`⚠️ Target Partner is linked to DIFFERENT user: ${targetPartner.user}`);
                // Force update? Yes, user wants to access it.
            }

            targetPartner.user = user._id;
            await targetPartner.save();
            console.log(`✅ Linked User ${user._id} to Target Partner ${targetPartner._id}`);

            // Remove duplicate
            if (duplicatePartner && duplicatePartner._id.toString() !== targetPartner._id.toString()) {
                const count = await ServiceBooking.countDocuments({ partner: duplicatePartner._id });
                if (count === 0) {
                    await ServicePartner.findByIdAndDelete(duplicatePartner._id);
                    console.log(`🗑️ Deleted duplicate partner ${duplicatePartner._id}`);
                }
            }
        }

    } catch (err) {
        console.error(err);
    } finally {
        await mongoose.disconnect();
    }
}

fixPartnerLink();

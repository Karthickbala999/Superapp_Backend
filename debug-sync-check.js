const mongoose = require('mongoose');
require('dotenv').config({ path: 'src/config/.env' }); // Adjust path if needed

// Import Models directly to avoid index.js issues if any
const partnerSchema = new mongoose.Schema({}, { strict: false });
const Partner = mongoose.model('Partner', partnerSchema, 'partners');

const servicePartnerSchema = new mongoose.Schema({}, { strict: false });
const ServicePartner = mongoose.model('ServicePartner', servicePartnerSchema, 'servicepartners');

const userSchema = new mongoose.Schema({}, { strict: false });
const User = mongoose.model('User', userSchema, 'users');

async function checkRecentRecords() {
    try {
        // Connect to DB
        const uri = 'mongodb://localhost:27017/superapp_db'; // Hardcoded based on previous context
        await mongoose.connect(uri);
        console.log('Connected to MongoDB');

        // 1. Get 3 most recent Partners (Mobile App)
        const recentPartners = await Partner.find().sort({ _id: -1 }).limit(3);
        console.log('\n--- Recent Partners (Mobile App) ---');
        recentPartners.forEach(p => {
            console.log(`ID: ${p._id}`);
            console.log(`Name: ${p.fullName}, Phone: ${p.phoneNumber}, Email: ${p.email}`);
            console.log(`Created: ${p.createdAt}`);
            console.log('---');
        });

        // 2. Get 3 most recent ServicePartners (Admin Panel)
        const recentServicePartners = await ServicePartner.find().sort({ _id: -1 }).limit(3);
        console.log('\n--- Recent ServicePartners (Admin Panel) ---');
        recentServicePartners.forEach(p => {
            console.log(`ID: ${p._id}`);
            console.log(`BusinessName: ${p.businessName}`);
            console.log(`User ID: ${p.user}`);
            console.log(`Created: ${p.createdAt}`);
            console.log('---');
        });

        // 3. Check for specific missing sync
        if (recentPartners.length > 0) {
            const lastPartner = recentPartners[0];
            console.log(`\nChecking sync for latest partner: ${lastPartner.fullName} (${lastPartner.phoneNumber})`);

            // Find User by phone
            const user = await User.findOne({ phone: lastPartner.phoneNumber });
            if (!user) {
                console.log('❌ User record NOT FOUND for this phone number.');
            } else {
                console.log(`✅ User record found: ${user._id}`);
                // Check ServicePartner
                const sp = await ServicePartner.findOne({ user: user._id });
                if (!sp) {
                    console.log('❌ ServicePartner record NOT FOUND for this User.');
                } else {
                    console.log(`✅ ServicePartner record found: ${sp._id}`);
                }
            }
        }

    } catch (err) {
        console.error('Error:', err);
    } finally {
        await mongoose.disconnect();
    }
}

checkRecentRecords();

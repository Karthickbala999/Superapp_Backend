const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });

const ServicePartner = require('./src/models/urban-services/servicePartner');

async function checkPartnerStatus() {
    try {
        const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/super_app';
        await mongoose.connect(mongoUri);
        console.log('✅ Connected to MongoDB\n');

        const allPartners = await ServicePartner.find({});

        console.log(`Total ServicePartners: ${allPartners.length}\n`);

        allPartners.forEach(p => {
            console.log(`Partner: ${p.businessName || 'NO NAME'}`);
            console.log(`  ID: ${p._id}`);
            console.log(`  isVerified: ${p.isVerified}`);
            console.log(`  isAvailable: ${p.isAvailable}`);
            console.log(`  status: ${p.status}`);
            console.log(`  user: ${p.user || 'NONE'}`);
            console.log('---');
        });

        // Check how many match the filter
        const availablePartners = await ServicePartner.find({
            isVerified: true,
            isAvailable: true,
            status: 'active'
        });

        console.log(`\n✅ Partners matching filter (isVerified=true, isAvailable=true, status=active): ${availablePartners.length}`);

        if (availablePartners.length === 0) {
            console.log('\n❌ NO PARTNERS MATCH THE FILTER!');
            console.log('Updating Thilocigan partner to match filter...');

            const thilocigan = await ServicePartner.findOne({ businessName: /Thilocigan/i });
            if (thilocigan) {
                thilocigan.isVerified = true;
                thilocigan.isAvailable = true;
                thilocigan.status = 'active';
                await thilocigan.save();
                console.log('✅ Updated Thilocigan partner');
            }
        }

    } catch (err) {
        console.error('Error:', err.message);
    } finally {
        await mongoose.disconnect();
    }
}

checkPartnerStatus();

const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });

const ServicePartner = require('./src/models/urban-services/servicePartner');
const ServiceCategory = require('./src/models/urban-services/serviceCategory');

async function fixPartnerCategories() {
    try {
        const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/super_app';
        await mongoose.connect(mongoUri);
        console.log('✅ Connected to MongoDB\n');

        // Find all categories
        const allCategories = await ServiceCategory.find({});
        console.log(`Total categories: ${allCategories.length}\n`);

        allCategories.forEach(c => {
            console.log(`- ${c.name} (${c._id})`);
        });

        // Find Thilocigan partner
        const thilocigan = await ServicePartner.findOne({ businessName: /Thilocigan/i });

        if (!thilocigan) {
            console.log('\n❌ Thilocigan partner not found');
            return;
        }

        console.log(`\n✅ Found Thilocigan partner: ${thilocigan._id}`);
        console.log(`Current categories: ${thilocigan.categories || 'NONE'}`);

        // Assign ALL categories to this partner so they can be assigned to any booking
        if (!thilocigan.categories || thilocigan.categories.length === 0) {
            thilocigan.categories = allCategories.map(c => c._id);
            thilocigan.isVerified = true;
            thilocigan.isAvailable = true;
            thilocigan.status = 'active';
            await thilocigan.save();
            console.log(`\n✅ Updated Thilocigan partner with ${allCategories.length} categories`);
        } else {
            console.log(`\n✅ Partner already has ${thilocigan.categories.length} categories`);
        }

        // Verify the update
        const updated = await ServicePartner.findById(thilocigan._id).populate('categories', 'name');
        console.log(`\nFinal state:`);
        console.log(`  isVerified: ${updated.isVerified}`);
        console.log(`  isAvailable: ${updated.isAvailable}`);
        console.log(`  status: ${updated.status}`);
        console.log(`  categories (${updated.categories.length}):`);
        updated.categories.forEach(c => console.log(`    - ${c.name}`));

    } catch (err) {
        console.error('Error:', err.message);
    } finally {
        await mongoose.disconnect();
    }
}

fixPartnerCategories();

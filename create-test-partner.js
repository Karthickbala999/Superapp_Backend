require('dotenv').config();
const mongoose = require('mongoose');

async function listPartnersWithPhones() {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('✅ Connected to MongoDB\n');

        const ServicePartner = require('./src/models/urban-services/servicePartner');

        // Find partners with phone numbers
        const partners = await ServicePartner.find({ phoneNumber: { $exists: true, $ne: null } })
            .select('fullName phoneNumber email status');

        console.log(`📋 PARTNERS WITH PHONE NUMBERS: ${partners.length}\n`);

        if (partners.length === 0) {
            console.log('❌ No partners found with phone numbers!');
            console.log('\nCreating a test partner...\n');

            // Create a test partner
            const testPartner = new ServicePartner({
                fullName: 'Test Partner',
                phoneNumber: '+919876543210',
                email: 'test@partner.com',
                status: 'active',
                serviceCategories: []
            });

            await testPartner.save();
            console.log('✅ Test partner created!');
            console.log(`   Phone: ${testPartner.phoneNumber}`);
            console.log(`   Status: ${testPartner.status}`);
            console.log(`   ID: ${testPartner._id}`);
        } else {
            partners.forEach((p, index) => {
                console.log(`${index + 1}. ${p.fullName || 'No Name'}`);
                console.log(`   Phone: ${p.phoneNumber}`);
                console.log(`   Email: ${p.email || 'N/A'}`);
                console.log(`   Status: ${p.status}`);
                console.log('');
            });
        }

        await mongoose.connection.close();
        console.log('\n✅ Done');
    } catch (error) {
        console.error('❌ Error:', error);
    }
}

listPartnersWithPhones();

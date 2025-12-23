require('dotenv').config();
const mongoose = require('mongoose');
const ServicePartner = require('./src/models/urban-services/servicePartner');
const Partner = require('./src/models/Partner');

const connectDB = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('MongoDB Connected');
    } catch (err) {
        console.error('Connection error:', err);
        process.exit(1);
    }
};

const inspectLatest = async () => {
    await connectDB();

    try {
        console.log('\n--- LATEST 3 PARTNERS (Mobile App) ---');
        const partners = await Partner.find({}).sort({ createdAt: -1 }).limit(3);
        partners.forEach(p => {
            console.log(`\nPartner: ${p.fullName} (${p.phoneNumber})`);
            console.log(` - ID: ${p._id}`);
            console.log(` - Created: ${p.createdAt}`);
            console.log(` - Status: ${p.status}`);
        });

        console.log('\n--- LATEST 3 SERVICE PARTNERS (Admin Panel) ---');
        const servicePartners = await ServicePartner.find({}).sort({ createdAt: -1 }).limit(3);

        servicePartners.forEach(sp => {
            console.log(`\nServicePartner: "${sp.businessName}"`);
            console.log(` - ID: ${sp._id}`);
            console.log(` - User ID: ${sp.user}`);
            console.log(` - Status: ${sp.status}`);
            console.log(` - Verified: ${sp.isVerified}`);
            console.log(` - Created: ${sp.createdAt}`);
        });

    } catch (error) {
        console.error('Error:', error);
    } finally {
        mongoose.connection.close();
    }
};

inspectLatest();

require('dotenv').config();
const mongoose = require('mongoose');
const ServicePartner = require('./src/models/urban-services/servicePartner');
const Partner = require('./src/models/Partner');

const connectDB = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('MongoDB Connected to:', process.env.MONGODB_URI.substring(0, 20) + '...');
    } catch (err) {
        console.error('Connection error:', err);
        process.exit(1);
    }
};

const inspectDB = async () => {
    await connectDB();

    try {
        console.log('\n--- PARTNERS (Mobile App) ---');
        const partners = await Partner.find({});
        console.log(`Total Partners: ${partners.length}`);
        partners.forEach(p => console.log(` - ${p.fullName} (${p.phoneNumber}) [${p.status}]`));

        console.log('\n--- SERVICE PARTNERS (Admin Panel) ---');
        const servicePartners = await ServicePartner.find({});
        console.log(`Total ServicePartners: ${servicePartners.length}`);

        servicePartners.forEach(sp => {
            console.log(` - BusinessName: "${sp.businessName}" | User: ${sp.user} | Status: ${sp.status} | Verified: ${sp.isVerified}`);
        });

    } catch (error) {
        console.error('Error:', error);
    } finally {
        mongoose.connection.close();
    }
};

inspectDB();

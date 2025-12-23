require('dotenv').config();
const mongoose = require('mongoose');
const ServicePartner = require('./src/models/urban-services/servicePartner');
const Partner = require('./src/models/Partner');
const fs = require('fs');

const connectDB = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('MongoDB Connected');
    } catch (err) {
        console.error('Connection error:', err);
        process.exit(1);
    }
};

const inspectToJson = async () => {
    await connectDB();

    try {
        const partners = await Partner.find({}).sort({ createdAt: -1 }).limit(5).lean();
        const servicePartners = await ServicePartner.find({}).sort({ createdAt: -1 }).limit(5).lean();

        const data = {
            partners: partners.map(p => ({
                id: p._id,
                phone: p.phoneNumber,
                name: p.fullName,
                created: p.createdAt,
                status: p.status
            })),
            servicePartners: servicePartners.map(sp => ({
                id: sp._id,
                user: sp.user,
                businessName: sp.businessName,
                status: sp.status,
                isVerified: sp.isVerified,
                created: sp.createdAt
            }))
        };

        fs.writeFileSync('db-inspect.json', JSON.stringify(data, null, 2));
        console.log('Data written to db-inspect.json');

    } catch (error) {
        console.error('Error:', error);
    } finally {
        mongoose.connection.close();
    }
};

inspectToJson();

require('dotenv').config();
const mongoose = require('mongoose');
const ServicePartner = require('./src/models/urban-services/servicePartner');
const Partner = require('./src/models/Partner');
const User = require('./src/models/user');

const connectDB = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('MongoDB Connected');
    } catch (err) {
        console.error('Connection error:', err);
        process.exit(1);
    }
};

const syncDocs = async () => {
    await connectDB();

    try {
        console.log('Syncing documents...');
        const partners = await Partner.find({});

        for (const p of partners) {
            if (!p.documents || p.documents.length === 0) continue;

            const user = await User.findOne({ phone: p.phoneNumber });
            if (!user) continue;

            const sp = await ServicePartner.findOne({ user: user._id });
            if (!sp) continue;

            // Check if sync needed
            const currentDocs = sp.verificationDocuments || [];
            if (currentDocs.length === 0) {
                console.log(`Syncing ${p.documents.length} docs for ${p.fullName}`);

                sp.verificationDocuments = p.documents.map(url => ({
                    documentType: 'professional_certificate',
                    documentUrl: url,
                    status: p.status === 'approved' ? 'approved' : 'pending',
                    uploadedAt: new Date()
                }));

                await sp.save();
                console.log('Saved.');
            }
        }
        console.log('Sync complete.');

    } catch (error) {
        console.error('Error:', error);
    } finally {
        mongoose.connection.close();
    }
};

syncDocs();

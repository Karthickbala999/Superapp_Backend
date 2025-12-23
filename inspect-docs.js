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

const inspectDocs = async () => {
    await connectDB();

    try {
        console.log('\n--- Checking Documents ---');
        const partners = await Partner.find({}).sort({ createdAt: -1 });

        for (const p of partners) {
            console.log(`\nPartner: ${p.fullName} (${p.phoneNumber})`);
            console.log(` - App Docs: ${p.documents ? p.documents.length : 0}`);

            // Find linked user
            const user = await User.findOne({ phone: p.phoneNumber });
            if (!user) {
                console.log(' - User: NOT FOUND');
                continue;
            }

            const sp = await ServicePartner.findOne({ user: user._id });
            if (!sp) {
                console.log(' - ServicePartner: NOT FOUND');
                continue;
            }

            console.log(` - ServicePartner Docs: ${sp.verificationDocuments ? sp.verificationDocuments.length : 0}`);
            if (sp.verificationDocuments && sp.verificationDocuments.length > 0) {
                sp.verificationDocuments.forEach((doc, i) => {
                    console.log(`   [${i}] ${doc.documentUrl} (${doc.documentType})`);
                });
            }
        }

    } catch (error) {
        console.error('Error:', error);
    } finally {
        mongoose.connection.close();
    }
};

inspectDocs();

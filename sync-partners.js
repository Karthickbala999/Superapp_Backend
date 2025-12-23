const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/superapp_db';

const safeModel = (name, schema) => {
    return mongoose.models[name] || mongoose.model(name, schema);
};

const run = async () => {
    try {
        await mongoose.connect(MONGODB_URI, { useNewUrlParser: true, useUnifiedTopology: true });
        console.log('Connected to DB.');

        // Define schemas loosely
        const Partner = safeModel('Partner', new mongoose.Schema({}, { strict: false }));
        const User = safeModel('User', new mongoose.Schema({
            name: String, email: String, phone: String, password: String, role: String, status: Boolean
        }, { strict: false }));
        const ServicePartner = safeModel('ServicePartner', new mongoose.Schema({
            user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
            businessName: String,
            categories: [mongoose.Schema.Types.ObjectId],
            status: String,
            verificationDocuments: Array
        }, { strict: false, timestamps: true }));
        const ServiceCategory = safeModel('ServiceCategory', new mongoose.Schema({ name: String }, { strict: false }));

        const partners = await Partner.find({});
        console.log(`Found ${partners.length} partners.`);

        for (const p of partners) {
            try {
                console.log(`Syncing ${p.fullName}...`);
                const email = p.email ? p.email.toLowerCase() : '';
                const phone = p.phoneNumber;

                if (!email) {
                    console.log('  Skipping: No email');
                    continue;
                }

                // 1. User
                let user = await User.findOne({ $or: [{ email }, { phone }] });
                if (!user) {
                    user = await User.create({
                        name: p.fullName, email, phone,
                        password: 'hashed_dummy_password', role: 'user', status: true
                    });
                    console.log(`  Created User: ${user._id}`);
                } else {
                    console.log(`  Found User: ${user._id}`);
                }

                // 2. Categories
                // p.serviceCategories is array of strings
                const cats = Array.isArray(p.serviceCategories) ? p.serviceCategories : [];
                const catDocs = await ServiceCategory.find({ name: { $in: cats } });
                const catIds = catDocs.map(c => c._id);

                // 3. ServicePartner
                let sp = await ServicePartner.findOne({ user: user._id });
                const documents = (p.documents || []).map(d => ({
                    documentType: 'professional_certificate',
                    documentUrl: d,
                    status: 'pending'
                }));

                if (!sp) {
                    sp = await ServicePartner.create({
                        user: user._id,
                        businessName: p.fullName,
                        partnerType: 'individual',
                        categories: catIds,
                        serviceAreas: [{ city: p.city, areas: [p.address], pinCodes: [p.pincode] }],
                        isVerified: false,
                        status: 'active', // Important for visibility
                        verificationDocuments: documents
                    });
                    console.log(`  Created SP: ${sp._id}`);
                } else {
                    sp.verificationDocuments = documents;
                    sp.businessName = p.fullName;
                    sp.categories = catIds;
                    sp.status = 'active'; // Ensure active
                    await sp.save();
                    console.log(`  Updated SP: ${sp._id}`);
                }

            } catch (innerError) {
                console.error(`  Failed to sync ${p._id}: ${innerError.message}`);
            }
        }

        console.log('Done.');
        process.exit(0);

    } catch (e) {
        console.error('Fatal Error:', e);
        process.exit(1);
    }
};

run();

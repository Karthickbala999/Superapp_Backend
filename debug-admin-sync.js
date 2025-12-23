const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/superapp_db';

const checkRecords = async () => {
    try {
        console.log('Connecting to MongoDB...');
        await mongoose.connect(MONGODB_URI, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        });
        console.log('Connected to:', mongoose.connection.name);

        if (mongoose.connection.db) {
            const partnersCol = mongoose.connection.collection('partners');
            // Collection name fallback check
            const cols = await mongoose.connection.db.listCollections().toArray();
            const spColInfo = cols.find(c => c.name.toLowerCase().includes('servicepartner'));
            const spColName = spColInfo ? spColInfo.name : 'servicepartners';

            console.log(`Using ServicePartner collection: ${spColName}`);
            const servicePartnersCol = mongoose.connection.collection(spColName);

            console.log('\n--- Recent Partners (Mobile App) ---');
            const partners = await partnersCol.find().sort({ createdAt: -1 }).limit(3).toArray();
            partners.forEach(p => {
                console.log(`ID: ${p._id}, Phone: ${p.phoneNumber}, Name: ${p.fullName}, Status: ${p.status}`);
                console.log(`Docs: ${p.documents ? p.documents.length : 0}, Cats: ${p.serviceCategories}`);
            });

            console.log('\n--- Recent ServicePartners (Admin Panel) ---');
            const servicePartners = await servicePartnersCol.find().sort({ createdAt: -1 }).limit(3).toArray();

            servicePartners.forEach(sp => {
                console.log(`ID: ${sp._id}, UserID: ${sp.user}, Biz: ${sp.businessName}, Verified: ${sp.isVerified}, Status: ${sp.status}`);
                const docs = sp.verificationDocuments || [];
                console.log(`Docs: ${docs.length} items. First: ${docs.length > 0 ? JSON.stringify(docs[0]) : 'N/A'}`);
            });
        } else {
            console.log('DB connection object missing?');
        }

        process.exit(0);
    } catch (error) {
        console.error('Error:', error);
        process.exit(1);
    }
};

checkRecords();

require('dotenv').config();
const mongoose = require('mongoose');
const { Partner } = require('./src/models');
const ServicePartner = require('./src/models/urban-services/servicePartner');
const User = require('./src/models/user');
const ServiceCategory = require('./src/models/urban-services/serviceCategory');

const connectDB = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/super_app_db');
        console.log('MongoDB Connected');
    } catch (err) {
        console.error('Connection error:', err);
        process.exit(1);
    }
};

const fixAllPartners = async () => {
    await connectDB();

    try {
        console.log('Fetching all Partners from mobile app DB...');
        const partners = await Partner.find({}).sort({ createdAt: -1 });
        console.log(`Found ${partners.length} mobile app partners.`);

        let syncedCount = 0;
        let createdCount = 0;
        let fixedCount = 0;

        for (const partner of partners) {

            // 1. Find or Create User
            let user = await User.findOne({
                $or: [{ email: partner.email?.toLowerCase() }, { phone: partner.phoneNumber }]
            });

            if (!user) {
                // Must create a User for this partner
                const randomPassword = Math.random().toString(36).slice(-8) + 'A1!';
                try {
                    user = await User.create({
                        name: partner.fullName || `Partner ${partner.phoneNumber}`,
                        email: partner.email || `partner_${partner.phoneNumber.replace('+', '')}@urban.temp`,
                        phone: partner.phoneNumber,
                        password: randomPassword,
                        role: 'user',
                        status: true
                    });
                    console.log(`Created new User for ${partner.phoneNumber}`);
                } catch (err) {
                    console.error(`Failed to create User for ${partner.phoneNumber}:`, err.message);
                    continue;
                }
            }

            // 2. Sync to ServicePartner
            let servicePartner = await ServicePartner.findOne({ user: user._id });

            const categoryDocs = await ServiceCategory.find({
                name: { $in: partner.serviceCategories || [] }
            });
            const categoryIds = categoryDocs.map(c => c._id);

            const businessName = partner.fullName || `Partner ${partner.phoneNumber}`;

            if (!servicePartner) {
                // CREATE
                servicePartner = new ServicePartner({
                    user: user._id,
                    businessName: businessName,
                    partnerType: 'individual',
                    categories: categoryIds,
                    serviceAreas: [{
                        city: partner.city || 'Unknown',
                        areas: [partner.address || 'Unknown'],
                        pinCodes: [partner.pincode || '000000']
                    }],
                    isVerified: partner.status === 'approved', // Only verified if approved
                    status: 'active', // Important for visibility
                    verificationDocuments: (partner.documents || []).map(d => ({
                        documentType: 'professional_certificate',
                        documentUrl: d,
                        status: partner.status === 'approved' ? 'approved' : 'pending'
                    }))
                });
                await servicePartner.save();
                console.log(`[CREATED] ServicePartner for ${partner.phoneNumber}`);
                createdCount++;
            } else {
                // UPDATE / FIX
                let needsSave = false;

                if (servicePartner.status !== 'active') {
                    servicePartner.status = 'active';
                    needsSave = true;
                    console.log(`[FIX] Setting status to active for ${partner.phoneNumber}`);
                }

                if (!servicePartner.businessName) {
                    servicePartner.businessName = businessName;
                    needsSave = true;
                    console.log(`[FIX] Setting missing businessName for ${partner.phoneNumber}`);
                }

                if (needsSave) {
                    await servicePartner.save();
                    fixedCount++;
                } else {
                    syncedCount++;
                }
            }
        }

        console.log(`\nSummary:`);
        console.log(`Total Partners Processed: ${partners.length}`);
        console.log(`Already Synced: ${syncedCount}`);
        console.log(`Newly Created: ${createdCount}`);
        console.log(`Fixed (Status/Name): ${fixedCount}`);

    } catch (error) {
        console.error('Error during sync:', error);
    } finally {
        mongoose.connection.close();
    }
};

fixAllPartners();

require('dotenv').config();
const mongoose = require('mongoose');
const { Partner } = require('./src/models');
const ServicePartner = require('./src/models/urban-services/servicePartner');
const User = require('./src/models/user');
const ServiceCategory = require('./src/models/urban-services/serviceCategory');

const connectDB = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('MongoDB Connected');
    } catch (err) {
        console.error('Connection error:', err);
        process.exit(1);
    }
};

const fixAllPartnersReal = async () => {
    await connectDB();

    try {
        console.log('Fetching Partners from REAL DB...');
        const partners = await Partner.find({}).sort({ createdAt: -1 });
        console.log(`Found ${partners.length} mobile app partners.`);

        for (const partner of partners) {
            console.log(`Processing: ${partner.fullName} (${partner.phoneNumber})`);

            // 1. Find or Create User
            let user = await User.findOne({
                $or: [{ email: partner.email?.toLowerCase() }, { phone: partner.phoneNumber }]
            });

            if (!user) {
                console.log('User missing. Creating...');
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
                } catch (err) {
                    // Try finding partially matched user if duplicates exist
                    console.error('User creation failed, trying to find existing:', err.message);
                    user = await User.findOne({ phone: partner.phoneNumber });
                    if (!user) continue;
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
                console.log('Creating missing ServicePartner...');
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
                    isVerified: partner.status === 'approved',
                    status: 'active',
                    verificationDocuments: (partner.documents || []).map(d => ({
                        documentType: 'professional_certificate',
                        documentUrl: d,
                        status: partner.status === 'approved' ? 'approved' : 'pending'
                    }))
                });
                await servicePartner.save();
                console.log('Saved.');
            } else {
                console.log('Updating existing ServicePartner...');
                let changed = false;
                if (servicePartner.status !== 'active') {
                    servicePartner.status = 'active';
                    changed = true;
                }
                if (!servicePartner.businessName) {
                    servicePartner.businessName = businessName;
                    changed = true;
                }
                if (changed) await servicePartner.save();
            }
        }

        console.log('Sync Complete.');
    } catch (error) {
        console.error('Error:', error);
    } finally {
        mongoose.connection.close();
    }
};

fixAllPartnersReal();

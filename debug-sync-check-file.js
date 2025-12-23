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

const syncPartners = async () => {
    await connectDB();

    try {
        console.log('Fetching all Partners...');
        const partners = await Partner.find({}).sort({ createdAt: -1 });
        console.log(`Found ${partners.length} partners.`);

        for (const partner of partners) {
            console.log(`\n--------------------------------------------------`);
            console.log(`Processing Partner ID: ${partner._id}`);
            console.log(`Created At: ${partner.createdAt}`);
            console.log(`Name: ${partner.fullName}`);
            console.log(`Phone: ${partner.phoneNumber}`);
            console.log(`Status: ${partner.status}`);

            // Fix missing Name
            if (!partner.fullName) {
                console.log('⚠️ Partner matches missing fullName. Using default.');
                partner.fullName = `Partner ${partner.phoneNumber || 'Unknown'}`;
            }

            // 1. Find or Create User
            let user = await User.findOne({
                $or: [{ email: partner.email?.toLowerCase() }, { phone: partner.phoneNumber }]
            });

            if (!user) {
                console.log('User not found. Creating new User...');
                const randomPassword = Math.random().toString(36).slice(-8) + 'A1!';
                try {
                    user = await User.create({
                        name: partner.fullName,
                        email: partner.email || `partner_${partner.phoneNumber.replace('+', '')}@urban.temp`,
                        phone: partner.phoneNumber,
                        password: randomPassword,
                        role: 'user',
                        status: true
                    });
                    console.log(`✅ Created new User: ${user._id}`);
                } catch (err) {
                    console.error('Failed to create User:', err.message);
                    // Try to find user again, maybe race condition or checking wrong field
                    continue;
                }
            } else {
                console.log(`Found existing User: ${user._id}`);
            }

            // 2. Find ServicePartner
            let servicePartner = await ServicePartner.findOne({ user: user._id });

            if (servicePartner) {
                console.log(`ServicePartner already exists: ${servicePartner._id}`);
                console.log(`SP Status: ${servicePartner.status}, Verified: ${servicePartner.isVerified}`);
            } else {
                console.log('ServicePartner NOT found. Creating...');

                // Resolve Categories
                const categories = partner.serviceCategories || [];
                const categoryDocs = await ServiceCategory.find({
                    name: { $in: categories }
                });
                const categoryIds = categoryDocs.map(c => c._id);

                console.log(`Categories found: ${categoryIds.length}`);

                try {
                    servicePartner = new ServicePartner({
                        user: user._id,
                        businessName: partner.fullName || `Partner ${partner.phoneNumber}`, // Fallback for businessName
                        partnerType: 'individual',
                        categories: categoryIds,
                        serviceAreas: [{
                            city: partner.city || 'Unknown',
                            areas: [partner.address || 'Unknown'],
                            pinCodes: [partner.pincode || '000000']
                        }],
                        isVerified: false,
                        status: 'active', // Visible in Admin Panel
                        verificationDocuments: (partner.documents || []).map(d => ({
                            documentType: 'professional_certificate',
                            documentUrl: d,
                            status: 'pending'
                        }))
                    });

                    await servicePartner.save();
                    console.log(`✅ Created ServicePartner: ${servicePartner._id}`);
                } catch (err) {
                    console.error('❌ Failed to create ServicePartner:', err.message);
                    if (err.errors) {
                        Object.keys(err.errors).forEach(key => {
                            console.error(`  - ${key}: ${err.errors[key].message}`);
                        });
                    }
                }
            }
        }

        console.log('\nSync Check Complete.');

    } catch (error) {
        console.error('Error during sync:', error);
    } finally {
        mongoose.connection.close();
    }
};

syncPartners();

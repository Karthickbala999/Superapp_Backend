require('dotenv').config();
const mongoose = require('mongoose');
const ServicePartner = require('./src/models/urban-services/servicePartner');
const Partner = require('./src/models/Partner');
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

const fixSpecific = async () => {
    await connectDB();

    const targetIds = ['693bcd642576a8ea6c34daa2', '693bc16a2576a8ea6c34d451'];

    try {
        for (const id of targetIds) {
            const partner = await Partner.findById(id);
            if (!partner) {
                console.log(`Partner ${id} not found`);
                continue;
            }
            console.log(`\nProcessing ${partner.fullName} (${partner.phoneNumber})`);

            // 1. User
            let user = await User.findOne({
                $or: [{ phone: partner.phoneNumber }, { email: partner.email }]
            });

            if (!user) {
                console.log('Creating User...');
                try {
                    user = await User.create({
                        name: partner.fullName || `Partner ${partner.phoneNumber}`,
                        email: partner.email || `partner_${partner.phoneNumber.replace('+', '')}@temp.com`,
                        phone: partner.phoneNumber,
                        password: 'Password123!',
                        role: 'user',
                        status: true
                    });
                    console.log(`User created: ${user._id}`);
                } catch (e) {
                    console.error('User creation failed:', e.message);
                    continue;
                }
            } else {
                console.log(`User found: ${user._id}`);
            }

            // 2. ServicePartner
            let sp = await ServicePartner.findOne({ user: user._id });
            if (!sp) {
                console.log('Creating ServicePartner...');
                try {
                    sp = new ServicePartner({
                        user: user._id,
                        businessName: partner.fullName || `Partner ${partner.phoneNumber}`,
                        partnerType: 'individual',
                        status: 'active',
                        isVerified: false,
                        categories: [] // Should populate if available
                    });
                    // Map categories if present
                    if (partner.serviceCategories && partner.serviceCategories.length > 0) {
                        const cats = await ServiceCategory.find({ name: { $in: partner.serviceCategories } });
                        sp.categories = cats.map(c => c._id);
                    }

                    await sp.save();
                    console.log(`ServicePartner created: ${sp._id}`);
                } catch (e) {
                    console.error('ServicePartner creation failed:', e.message);
                    if (e.errors) console.error(JSON.stringify(e.errors, null, 2));
                }
            } else {
                console.log(`ServicePartner exists: ${sp._id}`);
            }
        }

    } catch (error) {
        console.error('Error:', error);
    } finally {
        mongoose.connection.close();
    }
};

fixSpecific();

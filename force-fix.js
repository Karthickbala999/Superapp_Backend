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

const forceFixTargets = async () => {
    await connectDB();
    const targetIds = ['693bcd642576a8ea6c34daa2', '693bc16a2576a8ea6c34d451'];

    for (const id of targetIds) {
        const partner = await Partner.findById(id);
        if (!partner) continue;
        console.log(`\nProcessing ${partner.fullName} (${partner.phoneNumber})`);

        // Check user BY PHONE explicitly
        let user = await User.findOne({ phone: partner.phoneNumber });

        if (user) {
            console.log(`Matched User ID: ${user._id} by PHONE.`);
            // Check ServicePartner matching THIS user
            let sp = await ServicePartner.findOne({ user: user._id });
            if (sp) {
                console.log(`Correct ServicePartner found: ${sp.businessName}`);
                if (sp.status !== 'active') {
                    sp.status = 'active';
                    await sp.save();
                    console.log('Fixed status to active');
                }
            } else {
                console.log('User exists but ServicePartner missing. Creating...');
                await createSP(user, partner);
            }
        } else {
            console.log('User matching phone NOT found. Previous match was likely by email query bug.');
            console.log('Creating FRESH User...');
            try {
                user = await User.create({
                    name: partner.fullName || `Partner ${partner.phoneNumber}`,
                    email: partner.email || `p${partner.phoneNumber.replace('+', '')}${Math.floor(Math.random() * 1000)}@temp.urban`,
                    phone: partner.phoneNumber,
                    password: 'Password123!',
                    role: 'user',
                    status: true
                });
                console.log(`Created new User: ${user._id}`);
                await createSP(user, partner);
            } catch (err) {
                console.error('Failed to create new user:', err.message);
                // If email duplicate?
                if (err.message.includes('email')) {
                    console.log('Retrying with rand email...');
                    user = await User.create({
                        name: partner.fullName,
                        email: `fix${Date.now()}@temp.urban`,
                        phone: partner.phoneNumber,
                        password: 'Password123!',
                        role: 'user',
                        status: true
                    });
                    await createSP(user, partner);
                }
            }
        }
    }
    console.log('Done.');
    mongoose.connection.close();
};

async function createSP(user, partner) {
    const sp = new ServicePartner({
        user: user._id,
        businessName: partner.fullName || `Partner ${partner.phoneNumber}`,
        partnerType: 'individual',
        status: 'active',
        isVerified: false,
        serviceAreas: [{ city: 'Unknown', areas: [], pinCodes: [] }]
    });
    await sp.save();
    console.log(`Created ServicePartner: ${sp._id}`);
}

forceFixTargets();

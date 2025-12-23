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

const fixCorrectly = async () => {
    await connectDB();
    const targetIds = ['693bcd642576a8ea6c34daa2', '693bc16a2576a8ea6c34d451'];

    for (const id of targetIds) {
        const partner = await Partner.findById(id);
        if (!partner) continue;
        console.log(`\nFixing ${partner.fullName} (${partner.phoneNumber})`);

        // Strict User Lookup
        let userQuery = [];
        if (partner.phoneNumber) userQuery.push({ phone: partner.phoneNumber });
        if (partner.email) userQuery.push({ email: partner.email.toLowerCase() });

        if (userQuery.length === 0) {
            console.log('No phone or email to find user.');
            continue;
        }

        let user = await User.findOne({ $or: userQuery });

        if (user) {
            console.log(`Found existing User match: ${user.name} (${user.phone}) [ID: ${user._id}]`);
            // Check if this user is actually bound to another partner?
            // Actually, if the phone matches, it IS this user.
        } else {
            console.log('Creating NEW User...');
            user = await User.create({
                name: partner.fullName || `Partner ${partner.phoneNumber}`,
                email: partner.email || `p${partner.phoneNumber.replace('+', '')}${Date.now()}@temp.urban`, // Unique email
                phone: partner.phoneNumber,
                password: 'Password123!',
                role: 'user',
                status: true
            });
            console.log(`Created User: ${user._id}`);
        }

        // Service Partner Check
        let sp = await ServicePartner.findOne({ user: user._id });
        if (sp) {
            console.log(`ServicePartner matches User! Business: ${sp.businessName}`);
            // Ensure status active
            if (sp.status !== 'active') {
                sp.status = 'active';
                await sp.save();
                console.log('Fixed Status -> Active');
            }
        } else {
            console.log('Creating MISSING ServicePartner...');
            sp = new ServicePartner({
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
    }
    mongoose.connection.close();
};

fixCorrectly();

require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./src/models/user');
const UserProfile = require('./src/models/userprofile');
const { updateUserProfile } = require('./src/controllers/userProfile.controller');

// Mock Express objects
const mockRes = () => {
    const res = {};
    res.status = (code) => {
        res.statusCode = code;
        return res;
    };
    res.json = (data) => {
        res.data = data;
        return res;
    };
    return res;
};

async function run() {
    try {
        console.log('Connecting to MongoDB...');
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected.');

        // 1. Create a Test User
        const uniqueId = Date.now();
        const testEmail = `unit_test_${uniqueId}@example.com`;
        const testUser = await User.create({
            name: 'Unit Test User',
            email: testEmail,
            password: 'password123',
            phone: '1112223333',
            role: 'user'
        });
        console.log('Created test user:', testUser.email);

        // 2. Call updateUserProfile Controller
        const req = {
            user: { id: testUser._id },
            body: {
                name: 'Updated Unit Name',
                phone: '9998887777',
                address_line1: 'Unit Address',
                city: 'Unit City'
            },
            file: null
        };
        const res = mockRes();

        console.log('Calling updateUserProfile...');
        await updateUserProfile(req, res);

        if (res.data) {
            console.log('Response:', res.data);
        } else {
            console.log('No JSON response. Status:', res.statusCode);
        }

        // 3. Verify Updates in DB
        const updatedUser = await User.findById(testUser._id);
        const updatedProfile = await UserProfile.findOne({ user_id: testUser._id });

        let success = true;

        // Check Name (User Model)
        if (updatedUser.name === 'Updated Unit Name') {
            console.log('PASS: User name updated correctly.');
        } else {
            console.log(`FAIL: User name NOT updated. Got: "${updatedUser.name}"`);
            success = false;
        }

        // Check Phone (User Model)
        if (updatedUser.phone === '9998887777') {
            console.log('PASS: User phone updated correctly.');
        } else {
            console.log(`FAIL: User phone NOT updated. Got: "${updatedUser.phone}"`);
            success = false;
        }

        // Check Address (UserProfile Model)
        if (updatedProfile && updatedProfile.address === 'Unit Address') {
            console.log('PASS: User profile address updated correctly.');
        } else {
            console.log(`FAIL: User profile address NOT updated. Got: "${updatedProfile?.address}"`);
            success = false;
        }

        // Check Response Data includes User data
        if (res.data.data.name === 'Updated Unit Name') {
            console.log('PASS: Response includes updated name.');
        } else {
            console.log('FAIL: Response missing updated name.');
            success = false;
        }

        // Cleanup
        await User.findByIdAndDelete(testUser._id);
        if (updatedProfile) await UserProfile.findByIdAndDelete(updatedProfile._id);

        if (success) {
            console.log('=== VERIFICATION SUCCESSFUL ===');
        } else {
            console.log('=== VERIFICATION FAILED ===');
        }

        process.exit(0);

    } catch (error) {
        console.error('Error:', error);
        process.exit(1);
    }
}

run();

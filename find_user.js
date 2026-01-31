require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./src/models/user');

const MONGODB_URI = process.env.MONGODB_URI;

async function findUser() {
    try {
        await mongoose.connect(MONGODB_URI);
        console.log('Connected to DB');

        const user = await User.findOne({});
        if (user) {
            console.log('USER_ID:', user._id.toString());
            console.log('USER_EMAIL:', user.email);
        } else {
            console.log('No users found');
        }
    } catch (error) {
        console.error('Error:', error);
    } finally {
        await mongoose.disconnect();
    }
}

findUser();

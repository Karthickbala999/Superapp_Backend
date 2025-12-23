const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });

const User = require('./src/models/user');
const ServicePartner = require('./src/models/urban-services/servicePartner');
const ServiceBooking = require('./src/models/urban-services/serviceBooking');

async function debugBookingFetch() {
    try {
        const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/super_app';
        await mongoose.connect(mongoUri);
        console.log('✅ Connected to MongoDB');

        // 1. Find User "Thilocigan"
        const users = await User.find({ name: /Thilocigan/i });
        if (!users.length) {
            console.log('❌ User "Thilocigan" not found.');
            return;
        }
        const user = users[0];
        console.log(`👤 User: ${user.name} (${user._id})`);

        // 2. Find Linked ServicePartner
        const partner = await ServicePartner.findOne({ user: user._id });
        if (!partner) {
            console.log('❌ No ServicePartner linked to this user!');
            return;
        }
        console.log(`🏢 Partner: ${partner.businessName} (${partner._id})`);

        // 3. Simulate "Available Bookings" Query
        console.log('\n--- Checking Available Bookings (pending, accepted) ---');
        const availableBookings = await ServiceBooking.find({
            partner: partner._id,
            status: { $in: ['pending', 'accepted'] }
        }).select('bookingNumber status'); // Select fewer fields for clean output

        console.log(`Found ${availableBookings.length} available bookings:`);
        availableBookings.forEach(b => console.log(` - ${b.bookingNumber} [${b.status}]`));

        // 4. Simulate "My Bookings" Query
        console.log('\n--- Checking My Bookings (ALL assigned) ---');
        const myBookings = await ServiceBooking.find({
            partner: partner._id
        }).select('bookingNumber status');

        console.log(`Found ${myBookings.length} total assigned bookings:`);
        myBookings.forEach(b => console.log(` - ${b.bookingNumber} [${b.status}]`));

        // 5. Check if any bookings exist at all for name "Thilocigan" (Unsafe check)
        // In case partner ID is somehow wrong but logic assigns by something else? No, logic is FK.

    } catch (err) {
        console.error(err);
    } finally {
        await mongoose.disconnect();
    }
}

debugBookingFetch();

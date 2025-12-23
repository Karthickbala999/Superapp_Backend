const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });

const ServicePartner = require('./src/models/urban-services/servicePartner');
const ServiceBooking = require('./src/models/urban-services/serviceBooking');

async function checkBookingAssignments() {
    try {
        const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/super_app';
        await mongoose.connect(mongoUri);
        console.log('✅ Connected to MongoDB\n');

        // Find all partners named Thilocigan
        const partners = await ServicePartner.find({ businessName: /Thilocigan/i }).populate('user');

        console.log(`Found ${partners.length} partner(s) named "Thilocigan":\n`);

        for (const partner of partners) {
            console.log(`Partner ID: ${partner._id}`);
            console.log(`Business Name: ${partner.businessName}`);
            console.log(`Linked User: ${partner.user?._id || 'NONE'}`);
            console.log(`User Phone: ${partner.user?.phone || 'N/A'}`);

            // Count bookings
            const bookingCount = await ServiceBooking.countDocuments({ partner: partner._id });
            console.log(`Bookings Assigned: ${bookingCount}`);

            if (bookingCount > 0) {
                const bookings = await ServiceBooking.find({ partner: partner._id }).select('bookingNumber status');
                console.log('Booking Details:');
                bookings.forEach(b => console.log(`  - ${b.bookingNumber} (${b.status})`));
            }
            console.log('---\n');
        }

    } catch (err) {
        console.error(err);
    } finally {
        await mongoose.disconnect();
    }
}

checkBookingAssignments();

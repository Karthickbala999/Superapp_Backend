require('dotenv').config();
const mongoose = require('mongoose');

async function checkBookings() {
    try {
        // Connect to MongoDB
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('✅ Connected to MongoDB');

        // Get models
        const ServiceBooking = require('./src/models/urban-services/serviceBooking');
        const ServicePartner = require('./src/models/urban-services/servicePartner');

        // Find all partners
        console.log('\n📋 ALL PARTNERS:');
        const partners = await ServicePartner.find({}).select('_id fullName phoneNumber email status');
        partners.forEach(p => {
            console.log(`  - ID: ${p._id}`);
            console.log(`    Name: ${p.fullName}`);
            console.log(`    Phone: ${p.phoneNumber}`);
            console.log(`    Status: ${p.status}`);
            console.log('');
        });

        // Find all bookings
        console.log('\n📋 ALL BOOKINGS:');
        const bookings = await ServiceBooking.find({})
            .select('_id bookingNumber partner status')
            .populate('partner', 'fullName phoneNumber');

        console.log(`Total bookings: ${bookings.length}`);
        bookings.forEach(b => {
            console.log(`  - Booking: ${b.bookingNumber}`);
            console.log(`    Status: ${b.status}`);
            console.log(`    Partner ID: ${b.partner?._id || 'NOT ASSIGNED'}`);
            console.log(`    Partner Name: ${b.partner?.fullName || 'N/A'}`);
            console.log('');
        });

        // Find bookings with partner assigned
        console.log('\n📋 BOOKINGS WITH PARTNER ASSIGNED:');
        const assignedBookings = await ServiceBooking.find({ partner: { $ne: null } })
            .populate('partner', 'fullName phoneNumber');

        console.log(`Count: ${assignedBookings.length}`);
        assignedBookings.forEach(b => {
            console.log(`  - ${b.bookingNumber}: ${b.partner?.fullName} (${b.status})`);
        });

        // Find bookings without partner
        console.log('\n📋 BOOKINGS WITHOUT PARTNER:');
        const unassignedBookings = await ServiceBooking.find({ partner: null });
        console.log(`Count: ${unassignedBookings.length}`);

        await mongoose.connection.close();
        console.log('\n✅ Done');
    } catch (error) {
        console.error('❌ Error:', error);
    }
}

checkBookings();

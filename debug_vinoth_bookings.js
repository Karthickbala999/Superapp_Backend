const mongoose = require('mongoose');
const ServicePartner = require('./src/models/urban-services/servicePartner');
const ServiceBooking = require('./src/models/urban-services/serviceBooking');

require('dotenv').config();

const checkVinothBookings = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected to DB');

        // 1. Find Vinoth's Partner Profile
        const partner = await ServicePartner.findOne({ businessName: 'Vinoth' });

        if (!partner) {
            console.log('Partner "Vinoth" not found!');
            return;
        }

        console.log(`Partner "Vinoth" ID: ${partner._id}`);

        // 2. Find any bookings for this partner
        const bookings = await ServiceBooking.find({ partner: partner._id });
        console.log(`Bookings found for Vinoth: ${bookings.length}`);

        bookings.forEach(b => {
            console.log(` - Booking: ${b.bookingNumber} | Status: ${b.status} | Date: ${b.scheduledDate}`);
        });

        // 3. Just in case, remove them if they exist and user wants "Fresh"
        if (bookings.length > 0) {
            // Uncomment to delete
            // await ServiceBooking.deleteMany({ partner: partner._id });
            // console.log('Cleaned up bookings for Vinoth.');
        }

    } catch (err) {
        console.error(err);
    } finally {
        mongoose.connection.close();
    }
};

checkVinothBookings();

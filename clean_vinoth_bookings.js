const mongoose = require('mongoose');
const ServicePartner = require('./src/models/urban-services/servicePartner');
const ServiceBooking = require('./src/models/urban-services/serviceBooking');

require('dotenv').config();

const cleanVinoth = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected to DB');

        const pVinoth = await ServicePartner.findOne({ businessName: 'Vinoth' });
        if (!pVinoth) {
            console.log('Partner Vinoth not found');
            return;
        }

        console.log(`Cleaning bookings for Vinoth (${pVinoth._id})...`);

        // Find bookings
        const bookings = await ServiceBooking.find({ partner: pVinoth._id });
        console.log(`Found ${bookings.length} assigned bookings.`);

        bookings.forEach(b => console.log(` - ${b.bookingNumber} [${b.status}]`));

        if (bookings.length > 0) {
            // Unassign them
            const res = await ServiceBooking.updateMany(
                { partner: pVinoth._id },
                { $unset: { partner: "" }, $set: { status: 'pending' } }
            );
            console.log(`Unassigned ${res.modifiedCount} bookings.`);
        }

    } catch (err) {
        console.error(err);
    } finally {
        mongoose.connection.close();
    }
};

cleanVinoth();

const mongoose = require('mongoose');
const ServicePartner = require('./src/models/urban-services/servicePartner');
const ServiceBooking = require('./src/models/urban-services/serviceBooking');

require('dotenv').config();

const cleanLokesh = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected to DB');

        const pLokesh = await ServicePartner.findOne({ businessName: 'Lokesh' });
        if (!pLokesh) {
            console.log('Partner Lokesh not found');
            return;
        }

        console.log(`Cleaning bookings for Lokesh (${pLokesh._id})...`);

        // Find bookings
        const bookings = await ServiceBooking.find({ partner: pLokesh._id });
        console.log(`Found ${bookings.length} assigned bookings.`);

        if (bookings.length > 0) {
            // Unassign them (set partner to null, status to pending)
            const res = await ServiceBooking.updateMany(
                { partner: pLokesh._id },
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

cleanLokesh();

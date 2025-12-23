const mongoose = require('mongoose');
const ServicePartner = require('./src/models/urban-services/servicePartner');
const ServiceBooking = require('./src/models/urban-services/serviceBooking');

require('dotenv').config();

const analyzeBookings = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected to DB');

        const bookings = await ServiceBooking.find({}).populate('partner');
        console.log(`Total Bookings: ${bookings.length}`);

        // Group by Partner
        const stats = {};
        bookings.forEach(b => {
            const pName = b.partner ? b.partner.businessName : 'Unassigned';
            if (!stats[pName]) stats[pName] = 0;
            stats[pName]++;
        });

        console.log('Bookings Distribution:');
        console.table(stats);

        // Specifically check for "Vinoth" or "Lokesh"
        const targetPartners = ['Vinoth', 'Lokesh'];
        for (const name of targetPartners) {
            const p = await ServicePartner.findOne({ businessName: name });
            if (p) {
                const count = await ServiceBooking.countDocuments({ partner: p._id });
                console.log(`${name} (${p._id}) has ${count} bookings.`);

                // If they have bookings, list them
                if (count > 0) {
                    const pBookings = await ServiceBooking.find({ partner: p._id });
                    pBookings.forEach(pb => console.log(`   - ${pb.bookingNumber} [${pb.status}]`));
                }
            } else {
                console.log(`${name} not found.`);
            }
        }

    } catch (err) {
        console.error(err);
    } finally {
        mongoose.connection.close();
    }
};

analyzeBookings();

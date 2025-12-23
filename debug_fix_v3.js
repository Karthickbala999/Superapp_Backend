const mongoose = require('mongoose');
const User = require('./src/models/user');
const ServicePartner = require('./src/models/urban-services/servicePartner');
const ServiceBooking = require('./src/models/urban-services/serviceBooking');

require('dotenv').config();

const fixIt = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected to DB');

        // 1. Find anything related to Thilocigan
        console.log('\n--- Searching for Thilocigan ---');
        const usersT = await User.find({ name: /Thilocigan/i });
        console.log(`Users matching 'Thilocigan': ${usersT.length}`);
        usersT.forEach(u => console.log(`  U: ${u.name} | ${u.phone} | ${u._id}`));

        const partnersT = await ServicePartner.find({ businessName: /Thilocigan/i });
        console.log(`Partners matching 'Thilocigan': ${partnersT.length}`);
        partnersT.forEach(p => console.log(`  P: ${p.businessName} | User: ${p.user} | ${p._id}`));

        // 2. Find anything related to Vinoth
        console.log('\n--- Searching for Vinoth ---');
        const usersV = await User.find({ name: /Vinoth/i });
        console.log(`Users matching 'Vinoth': ${usersV.length}`);
        usersV.forEach(u => console.log(`  U: ${u.name} | ${u.phone} | ${u._id}`));

        const partnersV = await ServicePartner.find({ businessName: /Vinoth/i });
        console.log(`Partners matching 'Vinoth': ${partnersV.length}`);
        partnersV.forEach(p => console.log(`  P: ${p.businessName} | User: ${p.user} | ${p._id}`));

        // 3. Inspect the Booking mentioned
        // User image shows Booking ID: USR1765950059831
        console.log('\n--- Inspecting Booking ---');
        const booking = await ServiceBooking.findOne({ bookingNumber: 'USR1765950059831' }).populate('partner');
        if (booking) {
            console.log(`Booking Found. Partner Assigned:`);
            if (booking.partner) {
                console.log(`  ID: ${booking.partner._id}`);
                console.log(`  Name: ${booking.partner.businessName}`);
                console.log(`  User ID: ${booking.partner.user}`);

                // Check if this User ID matches Vinoth or Thilocigan
                const assignedUser = await User.findById(booking.partner.user);
                console.log(`  Linked User Name: ${assignedUser ? assignedUser.name : 'NULL'}`);
            } else {
                console.log('  No partner assigned in DB');
            }
        } else {
            console.log('Booking not found');
        }

    } catch (err) {
        console.error(err);
    } finally {
        mongoose.connection.close();
    }
};

fixIt();

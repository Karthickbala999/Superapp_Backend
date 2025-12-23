const mongoose = require('mongoose');
const User = require('./src/models/user');
const ServicePartner = require('./src/models/urban-services/servicePartner');

require('dotenv').config();

const whoIsLokesh = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected to DB');

        // 1. Find Partner with name Lokesh
        const pLokesh = await ServicePartner.findOne({ businessName: 'Lokesh' });
        if (pLokesh) {
            console.log(`Partner "Lokesh": ID=${pLokesh._id}, User=${pLokesh.user}`);
        } else {
            console.log('Partner "Lokesh" not found via businessName.');
        }

        // 2. Find Partner Thilocigan
        const pThilo = await ServicePartner.findOne({ businessName: 'Thilocigan' });
        if (pThilo) {
            console.log(`Partner "Thilocigan": ID=${pThilo._id}, User=${pThilo.user}`);
        }

        // 3. Find User Lokesh
        const uLokesh = await User.findOne({ name: /Lokesh/i });
        if (uLokesh) {
            console.log(`User "Lokesh": ID=${uLokesh._id}, Phone=${uLokesh.phone}`);
            // Check if this user is linked to ANY partner
            const linkedP = await ServicePartner.findOne({ user: uLokesh._id });
            if (linkedP) {
                console.log(`  -> Linked to Partner: ${linkedP.businessName} (${linkedP._id})`);
            } else {
                console.log(`  -> Not linked to any partner.`);
            }
        }

    } catch (err) {
        console.error(err);
    } finally {
        mongoose.connection.close();
    }
};

whoIsLokesh();

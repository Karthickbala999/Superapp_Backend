const mongoose = require('mongoose');
const fs = require('fs');

// Real Atlas URI
const uri = 'mongodb+srv://superapp_admin:superapp_admin%40740@cluster0.gtmzerf.mongodb.net/superapp_db?retrywrites=true&w=majority&appName=Cluster0';

const partnerSchema = new mongoose.Schema({}, { strict: false });
const Partner = mongoose.model('Partner', partnerSchema, 'partners');

const servicePartnerSchema = new mongoose.Schema({}, { strict: false });
const ServicePartner = mongoose.model('ServicePartner', servicePartnerSchema, 'servicepartners');

const userSchema = new mongoose.Schema({}, { strict: false });
const User = mongoose.model('User', userSchema, 'users');

async function checkRecentRecords() {
    const log = [];
    function logMsg(msg) {
        console.log(msg);
        log.push(msg);
    }

    try {
        await mongoose.connect(uri);
        logMsg('Connected to Atlas MongoDB');

        // 1. Get 3 most recent Partners (Mobile App)
        const recentPartners = await Partner.find().sort({ _id: -1 }).limit(3);
        logMsg('\n--- Recent Partners (Mobile App) ---');
        recentPartners.forEach(p => {
            logMsg(`ID: ${p._id}`);
            logMsg(`Name: ${p.fullName}, Phone: ${p.phoneNumber}, Status: ${p.status}`);
            logMsg(`Created: ${p.createdAt}`);
            // console.log(JSON.stringify(p, null, 2));
            logMsg('---');
        });

        // 2. Get 3 most recent ServicePartners (Admin Panel)
        const recentServicePartners = await ServicePartner.find().sort({ _id: -1 }).limit(3);
        logMsg('\n--- Recent ServicePartners (Admin Panel) ---');
        recentServicePartners.forEach(p => {
            logMsg(`ID: ${p._id}`);
            logMsg(`BusinessName: ${p.businessName}, Type: ${p.partnerType}`);
            logMsg(`User ID: ${p.user}`);
            logMsg(`Is Verified: ${p.isVerified}`);
            logMsg(`Created: ${p.createdAt}`);
            logMsg('---');
        });

        // 3. Check for specific missing sync
        if (recentPartners.length > 0) {
            const lastPartner = recentPartners[0];
            logMsg(`\nChecking sync for latest partner: ${lastPartner.fullName} (${lastPartner.phoneNumber})`);

            const user = await User.findOne({ phone: lastPartner.phoneNumber });
            if (!user) {
                logMsg('❌ User record NOT FOUND for this phone number.');
            } else {
                logMsg(`✅ User record found: ${user._id}`);
                const sp = await ServicePartner.findOne({ user: user._id });
                if (!sp) {
                    logMsg('❌ ServicePartner record NOT FOUND for this User.');
                } else {
                    logMsg(`✅ ServicePartner record found: ${sp._id}`);
                    // Check if admin endpoint would return it
                    // Admin endpoint usually filters by nothing or status
                    logMsg(`SP Status: ${sp.status}, Verified: ${sp.isVerified}`);
                }
            }
        }

    } catch (err) {
        logMsg(`Error: ${err.message}`);
    } finally {
        fs.writeFileSync('debug-atlas-output.txt', log.join('\n'));
        await mongoose.disconnect();
    }
}

checkRecentRecords();

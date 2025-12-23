const mongoose = require('mongoose');
const fs = require('fs');
const User = require('./src/models/user');
const ServicePartner = require('./src/models/urban-services/servicePartner');
const ServiceBooking = require('./src/models/urban-services/serviceBooking');

require('dotenv').config();

const log = (msg) => {
    console.log(msg);
    fs.appendFileSync('debug_log.txt', msg + '\n');
};

const fixIt = async () => {
    fs.writeFileSync('debug_log.txt', '--- START LOG ---\n');
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        log('Connected to DB');

        // 1. Find Thilocigan User
        const usersT = await User.find({ name: /Thilocigan/i });
        log(`Users Thilocigan: ${usersT.length}`);
        let thilociganUser = null;
        if (usersT.length > 0) {
            thilociganUser = usersT[0];
            log(`  Found Thilocigan User: ${thilociganUser._id} | ${thilociganUser.name} | ${thilociganUser.phone}`);
        }

        // 2. Find Vinoth User (or "Partner 3759")
        // From previous output "Partner 3..."
        const usersV = await User.find({ name: /Partner 3759/i });
        log(`Users Vinoth/Partner 3759: ${usersV.length}`);
        let vinothUser = null;
        if (usersV.length > 0) {
            vinothUser = usersV[0];
            log(`  Found Vinoth User: ${vinothUser._id} | ${vinothUser.name} | ${vinothUser.phone}`);
        }

        // 3. Find the Partner currently linked to Vinoth
        if (vinothUser) {
            const partnerV = await ServicePartner.findOne({ user: vinothUser._id });
            if (partnerV) {
                log(`  Vinoth has Partner Profile: ${partnerV._id} | ${partnerV.businessName}`);

                // 4. Proposed Fix:
                if (thilociganUser) {
                    log(`  PROPOSAL: Move Partner ${partnerV._id} back to Thilocigan ${thilociganUser._id} ??`);

                    // Perform the fix?
                    // Uncomment below to apply
                    partnerV.user = thilociganUser._id;
                    partnerV.businessName = "Thilocigan";
                    await partnerV.save();
                    log('  *** FIX APPLIED: Partner reassigned to Thilocigan ***');

                    // Create new partner for Vinoth?
                    // For now, let's just detach. Vinoth can start fresh or we create blank.
                    // We won't create blank to avoid issues, let him verify again.
                } else {
                    log('  Cannot fix: Thilocigan User not found.');
                }
            }
        }

    } catch (err) {
        log(err);
    } finally {
        mongoose.connection.close();
    }
};

fixIt();

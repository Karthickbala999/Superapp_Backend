require('dotenv').config();
const mongoose = require('mongoose');
const ServicePartner = require('./src/models/urban-services/servicePartner');
const fs = require('fs');
const path = require('path');

const connectDB = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('MongoDB Connected');
    } catch (err) {
        console.error('Connection error:', err);
        process.exit(1);
    }
};

const repairMissingFiles = async () => {
    await connectDB();
    const uploadsDir = path.join(__dirname, 'uploads/partners');

    try {
        const sps = await ServicePartner.find({});
        for (const sp of sps) {
            if (sp.verificationDocuments && sp.verificationDocuments.length > 0) {
                for (const doc of sp.verificationDocuments) {
                    const filename = doc.documentUrl.split('/').pop();
                    const filePath = path.join(uploadsDir, filename);

                    if (!fs.existsSync(filePath)) {
                        console.log(`Missing file for ${sp.businessName}: ${filename}`);
                        // Clone a placeholder
                        // Try to find ANY valid file
                        const validFile = fs.readdirSync(uploadsDir).find(f => f.endsWith('.png') || f.endsWith('.jpg'));
                        if (validFile) {
                            fs.copyFileSync(path.join(uploadsDir, validFile), filePath);
                            console.log(' -> Restored with placeholder.');
                        }
                    }
                }
            }
        }

    } catch (error) {
        console.error('Error:', error);
    } finally {
        mongoose.connection.close();
    }
};

repairMissingFiles();

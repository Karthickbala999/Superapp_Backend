const mongoose = require('mongoose');
const User = require('./src/models/User');

const MONGO_URI = 'mongodb://localhost:27017/superapp_db';

const adminEmails = [
  'admin@example.com',
  'ecommerce@example.com',
  'grocery@example.com',
  'taxi@example.com',
  'hotel@example.com',
];

async function deleteAdmins() {
  try {
    await mongoose.connect(MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true });
    const result = await User.deleteMany({ email: { $in: adminEmails } });
    console.log(`Deleted ${result.deletedCount} admin users.`);
    process.exit(0);
  } catch (err) {
    console.error('Error deleting admin users:', err);
    process.exit(1);
  }
}

deleteAdmins(); 
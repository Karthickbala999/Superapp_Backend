const mongoose = require('mongoose');
const User = require('../../models/User');
require('dotenv').config();

const MONGO_URI = process.env.MONGODB_URI;

const adminUsers = [
  {
    name: 'Main Admin',
    email: 'admin@example.com',
    password: 'admin123',
    role: 'admin',
    status: true,
    phone: '+1234567891',
  },
  {
    name: 'Ecommerce Admin',
    email: 'ecommerce@example.com',
    password: 'admin123',
    role: 'ecommerce_admin',
    status: true,
    phone: '+1234567892',
  },
  {
    name: 'Grocery Admin',
    email: 'grocery@example.com',
    password: 'admin123',
    role: 'grocery_admin',
    status: true,
    phone: '+1234567893',
  },
  {
    name: 'Taxi Admin',
    email: 'taxi@example.com',
    password: 'admin123',
    role: 'taxi_admin',
    status: true,
    phone: '+1234567894',
  },
  {
    name: 'Hotel Admin',
    email: 'hotel@example.com',
    password: 'admin123',
    role: 'hotel_admin',
    status: true,
    phone: '+1234567895',
  },
];

async function seedAdmins() {
  try {
    await mongoose.connect(MONGO_URI);
    console.log('✅ Connected to MongoDB Atlas');

    for (const admin of adminUsers) {
      const existing = await User.findOne({ email: admin.email });
      if (existing) {
        console.log(`User with email ${admin.email} already exists. Skipping.`);
        continue;
      }
      const user = new User({
        ...admin,
        password: admin.password, // Store as plain text
        last_login: new Date(),
        created_at: new Date(),
        updated_at: new Date(),
      });
      await user.save();
      console.log(`Created admin user: ${admin.email}`);
    }
    console.log('Admin users seeding complete.');
    process.exit(0);
  } catch (err) {
    console.error('Error seeding admin users:', err);
    process.exit(1);
  }
}

seedAdmins(); 
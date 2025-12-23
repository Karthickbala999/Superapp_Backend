const mongoose = require('mongoose');
const { spawn } = require('child_process');
const path = require('path');
require('dotenv').config();

// MongoDB connection string
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb+srv://superapp:superapp123@cluster0.mongodb.net/superapp_db?retryWrites=true&w=majority';

// List of seeders in order
const seeders = [
  'seed-admin-users-mongo.js',
  'seed-categories-mongo.js',
  'seed-brands-mongo.js',
  'seed-products-mongo.js',
  'seed-amenities-mongo.js',
  'seed-policies-mongo.js',
  'seed-hotels-mongo.js',
  'seed-orders-mongo.js',
  'seed-groceries-mongo.js',
  'seed-restaurant-categories-mongo.js',
  '20250127000001-seed-permissions.js',
  '20250613000001-seed-taxi-data.js', // <-- Added taxi data seeder
  '20250613000002-seed-porter-data.js' // <-- Added porter data seeder
];

const runSeeder = (seederFile) => {
  return new Promise((resolve, reject) => {
    const seederPath = path.join(__dirname, 'src', 'database', 'seeders', seederFile);
    const child = spawn('node', [seederPath], {
      stdio: 'inherit',
      env: { ...process.env, MONGODB_URI }
    });

    child.on('close', (code) => {
      if (code === 0) {
        resolve();
      } else {
        reject(new Error(`Seeder ${seederFile} failed with code ${code}`));
      }
    });

    child.on('error', (error) => {
      reject(error);
    });
  });
};

const runAllSeeders = async () => {
  try {
    console.log('🚀 Starting comprehensive database seeding...');
    console.log('✅ Using MongoDB URI:', MONGODB_URI);
    
    // Run seeders sequentially
    for (let i = 0; i < seeders.length; i++) {
      const seeder = seeders[i];
      const stepNumber = i + 1;
      const stepName = seeder.replace('.js', '').replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
      
      console.log(`\n📋 Step ${stepNumber}: Running ${stepName}...`);
      await runSeeder(seeder);
      console.log(`✅ Step ${stepNumber} completed: ${stepName}`);
    }
    
    console.log('\n🎉 All seeders completed successfully!');
    console.log('\n📊 Database Summary:');
    console.log('   - Admin Users: ✅');
    console.log('   - Categories: ✅');
    console.log('   - Brands: ✅');
    console.log('   - Products: ✅');
    console.log('   - Amenities: ✅');
    console.log('   - Policies: ✅');
    console.log('   - Hotels: ✅');
    console.log('   - Orders: ✅');
    console.log('   - Groceries: ✅');
    console.log('   - Restaurant Categories: ✅');
    console.log('   - Permissions & Roles: ✅');
    
    console.log('\n✨ Your database is now fully populated and ready for testing!');
    
    process.exit(0);
    
  } catch (error) {
    console.error('❌ Error during seeding:', error);
    process.exit(1);
  }
};

// Run the seeder
runAllSeeders(); 
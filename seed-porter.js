const mongoose = require('mongoose');
require('dotenv').config();

// MongoDB connection string
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb+srv://superapp:superapp123@cluster0.mongodb.net/superapp_db?retryWrites=true&w=majority';

// Import the Porter seeder
const porterSeeder = require('./src/database/seeders/20250613000002-seed-porter-data.js');

const runPorterSeeder = async () => {
  try {
    console.log('🚀 Connecting to MongoDB...');
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    console.log('📋 Running Porter seeder...');
    await porterSeeder.up();
    
    console.log('✅ Porter seeder completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error running Porter seeder:', error);
    process.exit(1);
  }
};

runPorterSeeder(); 
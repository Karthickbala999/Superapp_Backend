require('dotenv').config();
const mongoose = require('mongoose');

// MongoDB connection string
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/superapp_db';

// Mongoose connection options
const mongooseOptions = {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  maxPoolSize: 10,
  serverSelectionTimeoutMS: 30000, // Increased timeout
  socketTimeoutMS: 45000,
  bufferCommands: false,
  retryWrites: true,
  w: 'majority',
  heartbeatFrequencyMS: 10000,
  retryReads: true
};

// Initialize MongoDB connection
const initializeDatabase = async () => {
  try {
    await mongoose.connect(MONGODB_URI, mongooseOptions);
    console.log('✅ MongoDB connection established successfully.');
    
    // Handle connection events
    mongoose.connection.on('error', (err) => {
      console.error('❌ MongoDB connection error:', err);
    });

    mongoose.connection.on('disconnected', () => {
      console.log('⚠️ MongoDB disconnected');
    });

    mongoose.connection.on('reconnected', () => {
      console.log('✅ MongoDB reconnected');
    });

    // Graceful shutdown
    process.on('SIGINT', async () => {
      await mongoose.connection.close();
      console.log('MongoDB connection closed through app termination');
      process.exit(0);
    });

  } catch (error) {
    console.error('❌ Unable to connect to MongoDB:', error);
    process.exit(1);
  }
};

module.exports = mongoose;
module.exports.initializeDatabase = initializeDatabase;
module.exports.connection = mongoose.connection;
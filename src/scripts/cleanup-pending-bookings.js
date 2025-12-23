const mongoose = require('mongoose');
const PorterBooking = require('../models/porterbooking');
require('dotenv').config();

// Connect to MongoDB
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/superapp_db');
    console.log('✅ MongoDB connected for cleanup');
  } catch (error) {
    console.error('❌ MongoDB connection error:', error);
    process.exit(1);
  }
};

// Cleanup function
const cleanupPendingBookings = async () => {
  try {
    const thirtyMinutesAgo = new Date(Date.now() - 30 * 60 * 1000); // 30 minutes ago
    
    const pendingBookings = await PorterBooking.find({
      status: 'pending',
      payment_status: 'pending',
      created_at: { $lt: thirtyMinutesAgo }
    });

    if (pendingBookings.length > 0) {
      console.log(`🧹 Cleaning up ${pendingBookings.length} pending bookings older than 30 minutes`);
      
      for (const booking of pendingBookings) {
        await PorterBooking.findByIdAndUpdate(booking._id, {
          status: 'cancelled',
          payment_status: 'timeout',
          cancelled_at: new Date(),
          updatedAt: new Date()
        });
        console.log(`❌ Cancelled pending booking due to timeout: ${booking._id}`);
      }
      
      console.log(`✅ Cleanup completed. ${pendingBookings.length} bookings cancelled.`);
    } else {
      console.log('✅ No pending bookings to clean up');
    }
  } catch (error) {
    console.error('❌ Error cleaning up pending bookings:', error);
  }
};

// Run cleanup
const runCleanup = async () => {
  await connectDB();
  await cleanupPendingBookings();
  await mongoose.disconnect();
  console.log('✅ Cleanup script completed');
  process.exit(0);
};

// Run if called directly
if (require.main === module) {
  runCleanup();
}

module.exports = { cleanupPendingBookings }; 
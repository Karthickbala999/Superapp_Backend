const mongoose = require('mongoose');
const PorterBooking = require('../models/porterbooking');
const Payment = require('../models/payment');
require('dotenv').config();

// Connect to MongoDB
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/superapp_db');
    console.log('✅ MongoDB connected for fixing existing bookings');
  } catch (error) {
    console.error('❌ MongoDB connection error:', error);
    process.exit(1);
  }
};

// Fix existing bookings based on payment status
const fixExistingBookings = async () => {
  try {
    console.log('🔍 Checking existing Porter bookings...');
    
    // Get all Porter bookings
    const allBookings = await PorterBooking.find({});
    console.log(`📊 Found ${allBookings.length} total Porter bookings`);
    
    let fixedCount = 0;
    let skippedCount = 0;
    
    for (const booking of allBookings) {
      console.log(`\n🔍 Checking booking: ${booking._id}`);
      console.log(`   Current status: ${booking.status}`);
      console.log(`   Payment status: ${booking.payment_status}`);
      
      // Check if there's a successful payment for this booking
      const payment = await Payment.findOne({
        order_id: booking._id.toString(),
        order_model: 'PorterBooking',
        status: 'captured'
      });
      
      if (payment) {
        console.log(`   ✅ Found successful payment: ${payment._id}`);
        // This booking should be 'assigned' - it's correct
        if (booking.status !== 'assigned') {
          await PorterBooking.findByIdAndUpdate(booking._id, {
            status: 'assigned',
            payment_status: 'completed',
            assigned_at: new Date(),
            updatedAt: new Date()
          });
          console.log(`   🔧 Fixed: Updated to 'assigned' status`);
          fixedCount++;
        } else {
          console.log(`   ✅ Already correct: 'assigned' status`);
          skippedCount++;
        }
      } else {
        console.log(`   ❌ No successful payment found`);
        // Check if there's a failed payment
        const failedPayment = await Payment.findOne({
          order_id: booking._id.toString(),
          order_model: 'PorterBooking',
          status: 'failed'
        });
        
        if (failedPayment) {
          console.log(`   ❌ Found failed payment: ${failedPayment._id}`);
          // This booking should be 'cancelled'
          if (booking.status !== 'cancelled') {
            await PorterBooking.findByIdAndUpdate(booking._id, {
              status: 'cancelled',
              payment_status: 'failed',
              cancelled_at: new Date(),
              updatedAt: new Date()
            });
            console.log(`   🔧 Fixed: Updated to 'cancelled' status`);
            fixedCount++;
          } else {
            console.log(`   ✅ Already correct: 'cancelled' status`);
            skippedCount++;
          }
        } else {
          console.log(`   ⏳ No payment record found - should be 'pending'`);
          // This booking should be 'pending' (no payment attempt)
          if (booking.status !== 'pending') {
            await PorterBooking.findByIdAndUpdate(booking._id, {
              status: 'pending',
              payment_status: 'pending',
              updatedAt: new Date()
            });
            console.log(`   🔧 Fixed: Updated to 'pending' status`);
            fixedCount++;
          } else {
            console.log(`   ✅ Already correct: 'pending' status`);
            skippedCount++;
          }
        }
      }
    }
    
    console.log(`\n📊 SUMMARY:`);
    console.log(`   Fixed bookings: ${fixedCount}`);
    console.log(`   Skipped (already correct): ${skippedCount}`);
    console.log(`   Total processed: ${allBookings.length}`);
    
  } catch (error) {
    console.error('❌ Error fixing existing bookings:', error);
  }
};

// Run fix
const runFix = async () => {
  await connectDB();
  await fixExistingBookings();
  await mongoose.disconnect();
  console.log('✅ Fix script completed');
  process.exit(0);
};

// Run if called directly
if (require.main === module) {
  runFix();
}

module.exports = { fixExistingBookings }; 
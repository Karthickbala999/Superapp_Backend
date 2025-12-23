const mongoose = require('mongoose');

async function fixPaymentIndexes() {
  try {
    // Connect to MongoDB using the same connection string as the backend
    const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/superapp_db';
    await mongoose.connect(MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });
    console.log('✅ Connected to MongoDB');

    const db = mongoose.connection.db;
    const collection = db.collection('payments');

    // Check existing indexes
    console.log('🔍 Checking existing indexes...');
    const indexes = await collection.indexes();
    console.log('Current indexes:', JSON.stringify(indexes, null, 2));

    // Drop the problematic unique index on razorpay_payment_id
    try {
      await collection.dropIndex('razorpay_payment_id_1');
      console.log('✅ Dropped unique index on razorpay_payment_id');
    } catch (error) {
      console.log('ℹ️ Index razorpay_payment_id_1 not found or already dropped');
    }

    // Create the correct sparse index
    await collection.createIndex({ razorpay_payment_id: 1 }, { sparse: true });
    console.log('✅ Created sparse index on razorpay_payment_id');

    // Verify the fix
    const newIndexes = await collection.indexes();
    console.log('✅ New indexes:', JSON.stringify(newIndexes, null, 2));

    console.log('🎉 Payment indexes fixed successfully!');
  } catch (error) {
    console.error('❌ Error fixing indexes:', error);
  } finally {
    await mongoose.connection.close();
    console.log('✅ MongoDB connection closed');
  }
}

fixPaymentIndexes(); 
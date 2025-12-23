const mongoose = require('mongoose');
require('dotenv').config();

const MONGO_URI = process.env.MONGODB_URI;

async function fixWishlistComplete() {
  try {
    await mongoose.connect(MONGO_URI);
    console.log('✅ Connected to MongoDB Atlas');

    const db = mongoose.connection.db;
    const collection = db.collection('gwhishlists');

    // List current indexes
    console.log('📋 Current indexes:');
    const indexes = await collection.indexes();
    indexes.forEach(index => {
      console.log('  -', index.name, ':', JSON.stringify(index.key));
    });

    // Drop ALL indexes except _id
    console.log('🗑️  Dropping all indexes except _id...');
    for (const index of indexes) {
      if (index.name !== '_id_') {
        try {
          await collection.dropIndex(index.name);
          console.log(`✅ Dropped index: ${index.name}`);
        } catch (err) {
          console.log(`ℹ️  Could not drop index ${index.name}:`, err.message);
        }
      }
    }

    // Clear any old data that might have product_id field
    console.log('🧹 Cleaning old data with product_id field...');
    const deleteResult = await collection.deleteMany({
      $or: [
        { product_id: { $exists: true } },
        { product_id: null }
      ]
    });
    console.log(`✅ Deleted ${deleteResult.deletedCount} old records`);

    // Create the correct indexes
    console.log('🔧 Creating correct indexes...');
    await collection.createIndex({ user_id: 1 });
    console.log('✅ Created user_id index');

    await collection.createIndex({ grocery_id: 1 });
    console.log('✅ Created grocery_id index');

    await collection.createIndex({ user_id: 1, grocery_id: 1 }, { unique: true });
    console.log('✅ Created unique user_id + grocery_id index');

    // List final indexes
    console.log('📋 Final indexes:');
    const finalIndexes = await collection.indexes();
    finalIndexes.forEach(index => {
      console.log('  -', index.name, ':', JSON.stringify(index.key));
    });

    // Verify collection structure
    console.log('🔍 Verifying collection structure...');
    const sampleDoc = await collection.findOne({});
    if (sampleDoc) {
      console.log('📄 Sample document structure:', Object.keys(sampleDoc));
    } else {
      console.log('📄 Collection is empty (ready for new data)');
    }

    console.log('🎉 Wishlist collection completely fixed!');
    console.log('💡 You can now add items to wishlist without errors.');
    process.exit(0);
  } catch (err) {
    console.error('❌ Error fixing wishlist collection:', err);
    process.exit(1);
  }
}

fixWishlistComplete(); 
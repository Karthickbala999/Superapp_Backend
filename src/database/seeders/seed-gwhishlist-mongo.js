const mongoose = require('mongoose');
const Gwhishlist = require('../../models/gwhishlist');
require('dotenv').config();

const MONGO_URI = process.env.MONGODB_URI;

// Sample wishlist data (optional - for testing)
const sampleWishlistItems = [
  {
    user_id: new mongoose.Types.ObjectId(), // This will be replaced with actual user ID
    product_id: new mongoose.Types.ObjectId() // This will be replaced with actual product ID
  }
];

async function seedGWhishlist() {
  try {
    await mongoose.connect(MONGO_URI);
    console.log('✅ Connected to MongoDB Atlas');

    // Check if collection exists, if not create it
    const collections = await mongoose.connection.db.listCollections().toArray();
    const collectionNames = collections.map(col => col.name);
    
    if (!collectionNames.includes('gwhishlists')) {
      console.log('Creating gwhishlists collection...');
      await mongoose.connection.db.createCollection('gwhishlists');
      console.log('✅ gwhishlists collection created');
    } else {
      console.log('✅ gwhishlists collection already exists');
    }

    // Create indexes if they don't exist
    try {
      await Gwhishlist.createIndexes();
      console.log('✅ Indexes created/verified for gwhishlists');
    } catch (indexError) {
      console.log('Indexes already exist or error creating indexes:', indexError.message);
    }

    console.log('GWhishlist collection setup complete.');
    process.exit(0);
  } catch (err) {
    console.error('Error setting up gwhishlist collection:', err);
    process.exit(1);
  }
}

seedGWhishlist(); 
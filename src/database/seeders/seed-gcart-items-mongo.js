const mongoose = require('mongoose');
const GCartItem = require('../../models/gcart_items');
require('dotenv').config();

const MONGO_URI = process.env.MONGODB_URI;

// Sample cart items data (optional - for testing)
const sampleCartItems = [
  {
    user_id: new mongoose.Types.ObjectId(), // This will be replaced with actual user ID
    product_id: new mongoose.Types.ObjectId(), // This will be replaced with actual product ID
    quantity: 2,
    price: 150.00
  }
];

async function seedGCartItems() {
  try {
    await mongoose.connect(MONGO_URI);
    console.log('✅ Connected to MongoDB Atlas');

    // Check if collection exists, if not create it
    const collections = await mongoose.connection.db.listCollections().toArray();
    const collectionNames = collections.map(col => col.name);
    
    if (!collectionNames.includes('gcartitems')) {
      console.log('Creating gcartitems collection...');
      await mongoose.connection.db.createCollection('gcartitems');
      console.log('✅ gcartitems collection created');
    } else {
      console.log('✅ gcartitems collection already exists');
    }

    // Create indexes if they don't exist
    try {
      await GCartItem.createIndexes();
      console.log('✅ Indexes created/verified for gcartitems');
    } catch (indexError) {
      console.log('Indexes already exist or error creating indexes:', indexError.message);
    }

    console.log('GCartItems collection setup complete.');
    process.exit(0);
  } catch (err) {
    console.error('Error setting up gcart_items collection:', err);
    process.exit(1);
  }
}

seedGCartItems(); 
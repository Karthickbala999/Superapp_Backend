const mongoose = require('mongoose');
const ServiceCategory = require('./src/models/urban-services/serviceCategory');

// MongoDB connection
const mongoURI = 'mongodb://localhost:27017/superapp_db';

async function fixImagePaths() {
  try {
    await mongoose.connect(mongoURI);
    console.log('Connected to MongoDB');

    // Find all categories with image paths that don't include subdirectories
    const categories = await ServiceCategory.find({
      image: { $regex: '^/uploads/[^/]+\.jpg$' }
    });

    console.log(`Found ${categories.length} categories to fix`);

    for (const category of categories) {
      // Update image path to include 'others' subdirectory
      const oldImagePath = category.image;
      const newImagePath = category.image.replace('/uploads/', '/uploads/others/');
      
      await ServiceCategory.updateOne(
        { _id: category._id },
        { $set: { image: newImagePath } }
      );
      
      console.log(`Updated ${category.name}: ${oldImagePath} -> ${newImagePath}`);
    }

    console.log('Image paths fixed successfully!');
  } catch (error) {
    console.error('Error fixing image paths:', error);
  } finally {
    await mongoose.disconnect();
  }
}

fixImagePaths();

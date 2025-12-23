const mongoose = require('mongoose');
const ServiceCategory = require('./src/models/urban-services/serviceCategory');

// Connect to MongoDB
mongoose.connect('mongodb://localhost:27017/superapp_db', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(async () => {
  console.log('Connected to MongoDB');
  
  try {
    // Update first category with uploaded image
    const result1 = await ServiceCategory.updateOne(
      { name: 'AC Service & Repair' },
      { image: '/uploads/others/image-1766389388695-266716206.jpg' }
    );
    console.log('Updated AC Service & Repair:', result1.modifiedCount, 'documents');
    
    // Update second category with uploaded image
    const result2 = await ServiceCategory.updateOne(
      { name: 'Washing Machine Service' },
      { image: '/uploads/others/image-1766389796064-307459723.jpg' }
    );
    console.log('Updated Washing Machine Service:', result2.modifiedCount, 'documents');
    
    // Update a few more categories with the same images for demonstration
    const result3 = await ServiceCategory.updateOne(
      { name: 'Electrician Services' },
      { image: '/uploads/others/image-1766389388695-266716206.jpg' }
    );
    console.log('Updated Electrician Services:', result3.modifiedCount, 'documents');
    
    const result4 = await ServiceCategory.updateOne(
      { name: 'Plumbing Service' },
      { image: '/uploads/others/image-1766389796064-307459723.jpg' }
    );
    console.log('Updated Plumbing Service:', result4.modifiedCount, 'documents');
    
    console.log('Successfully updated categories with actual uploaded images');
    process.exit(0);
  } catch (error) {
    console.error('Error updating categories:', error);
    process.exit(1);
  }
})
.catch(err => {
  console.error('MongoDB connection error:', err);
  process.exit(1);
});

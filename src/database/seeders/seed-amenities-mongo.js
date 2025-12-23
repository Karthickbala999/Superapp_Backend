const mongoose = require('mongoose');
const Amenity = require('../../models/Amenity');

const seedAmenities = async () => {
  try {
    console.log('Starting amenities seeder...');
    
    // Clear existing amenities
    await Amenity.deleteMany({});
    console.log('Cleared existing amenities');
    
    const amenityData = [
      {
        name: 'WiFi',
        description: 'Free high-speed wireless internet access',
        status: true
      },
      {
        name: 'Swimming Pool',
        description: 'Outdoor swimming pool with lounge chairs',
        status: true
      },
      {
        name: 'Free Parking',
        description: 'Complimentary on-site parking for guests',
        status: true
      },
      {
        name: 'Restaurant',
        description: 'On-site restaurant serving local and international cuisine',
        status: true
      },
      {
        name: 'Room Service',
        description: '24/7 room service available',
        status: true
      },
      {
        name: 'Air Conditioning',
        description: 'Individual climate control in all rooms',
        status: true
      },
      {
        name: 'Fitness Center',
        description: 'Fully equipped gym with modern equipment',
        status: true
      },
      {
        name: 'Spa',
        description: 'Relaxing spa services and treatments',
        status: true
      },
      {
        name: 'Business Center',
        description: 'Meeting rooms and business facilities',
        status: true
      },
      {
        name: 'Laundry Service',
        description: 'Professional laundry and dry cleaning services',
        status: true
      },
      {
        name: 'Concierge',
        description: '24/7 concierge service for guest assistance',
        status: true
      },
      {
        name: 'Bar/Lounge',
        description: 'Hotel bar serving cocktails and beverages',
        status: true
      },
      {
        name: 'Garden',
        description: 'Beautiful garden area for relaxation',
        status: true
      },
      {
        name: 'Terrace',
        description: 'Rooftop terrace with city views',
        status: true
      },
      {
        name: 'Pet Friendly',
        description: 'Pet-friendly accommodation available',
        status: true
      }
    ];
    
    const amenities = await Amenity.insertMany(amenityData);
    console.log(`Created ${amenities.length} amenities`);
    
    console.log('Amenities seeder completed successfully');
  } catch (error) {
    console.error('Error seeding amenities:', error);
    throw error;
  }
};

// Run seeder if called directly
if (require.main === module) {
  require('dotenv').config();
  mongoose.connect(process.env.MONGODB_URI)
    .then(() => {
      console.log('Connected to MongoDB');
      return seedAmenities();
    })
    .then(() => {
      console.log('Seeding completed');
      process.exit(0);
    })
    .catch((error) => {
      console.error('Seeding failed:', error);
      process.exit(1);
    });
}

module.exports = seedAmenities; 
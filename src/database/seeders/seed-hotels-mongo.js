const mongoose = require('mongoose');
const Hotel = require('../../models/hotel');
const Policy = require('../../models/policy');
const Amenity = require('../../models/amenity');

const seedHotels = async () => {
  try {
    console.log('Starting hotel seeder...');
    
    // Clear existing hotels
    await Hotel.deleteMany({});
    console.log('Cleared existing hotels');
    
    // Get some policies and amenities for reference
    const policies = await Policy.find().limit(3);
    const amenities = await Amenity.find().limit(5);
    
    const hotelData = [
      {
        name: 'Grand Hotel & Spa',
        address: {
          street: '123 Main Street',
          city: 'New York',
          state: 'NY',
          country: 'USA',
          postal_code: '10001'
        },
        phone: '+1-555-123-4567',
        email: 'info@grandhotel.com',
        website: 'https://grandhotel.com',
        description: 'Luxury 5-star hotel in the heart of Manhattan with world-class amenities and exceptional service.',
        star_rating: 5,
        check_in_time: '15:00',
        check_out_time: '11:00',
        rating: 4.8,
        total_reviews: 1250,
        main_image: '/uploads/hotels/grand-hotel.jpg',
        status: 'active',
        policies: policies.slice(0, 2).map(p => p._id),
        amenities: amenities.slice(0, 3).map(a => a._id)
      },
      {
        name: 'Seaside Resort & Beach Club',
        address: {
          street: '456 Ocean Drive',
          city: 'Miami Beach',
          state: 'FL',
          country: 'USA',
          postal_code: '33139'
        },
        phone: '+1-555-987-6543',
        email: 'reservations@seasideresort.com',
        website: 'https://seasideresort.com',
        description: 'Beachfront resort with stunning ocean views, private beach access, and tropical atmosphere.',
        star_rating: 4,
        check_in_time: '16:00',
        check_out_time: '10:00',
        rating: 4.6,
        total_reviews: 890,
        main_image: '/uploads/hotels/seaside-resort.jpg',
        status: 'active',
        policies: policies.slice(1, 3).map(p => p._id),
        amenities: amenities.slice(2, 5).map(a => a._id)
      },
      {
        name: 'Mountain View Lodge',
        address: {
          street: '789 Pine Ridge Road',
          city: 'Aspen',
          state: 'CO',
          country: 'USA',
          postal_code: '81611'
        },
        phone: '+1-555-456-7890',
        email: 'stay@mountainviewlodge.com',
        website: 'https://mountainviewlodge.com',
        description: 'Cozy mountain lodge with breathtaking views, perfect for outdoor enthusiasts and nature lovers.',
        star_rating: 4,
        check_in_time: '14:00',
        check_out_time: '12:00',
        rating: 4.7,
        total_reviews: 567,
        main_image: '/uploads/hotels/mountain-lodge.jpg',
        status: 'active',
        policies: policies.slice(0, 1).map(p => p._id),
        amenities: amenities.slice(0, 2).map(a => a._id)
      },
      {
        name: 'Urban Boutique Hotel',
        address: {
          street: '321 Downtown Avenue',
          city: 'San Francisco',
          state: 'CA',
          country: 'USA',
          postal_code: '94102'
        },
        phone: '+1-555-321-0987',
        email: 'hello@urbanboutique.com',
        website: 'https://urbanboutique.com',
        description: 'Modern boutique hotel in the heart of the city with contemporary design and personalized service.',
        star_rating: 4,
        check_in_time: '15:00',
        check_out_time: '11:00',
        rating: 4.5,
        total_reviews: 432,
        main_image: '/uploads/hotels/urban-boutique.jpg',
        status: 'active',
        policies: policies.slice(1, 2).map(p => p._id),
        amenities: amenities.slice(1, 4).map(a => a._id)
      },
      {
        name: 'Historic Grand Plaza',
        address: {
          street: '654 Heritage Boulevard',
          city: 'Boston',
          state: 'MA',
          country: 'USA',
          postal_code: '02108'
        },
        phone: '+1-555-654-3210',
        email: 'reservations@historicgrandplaza.com',
        website: 'https://historicgrandplaza.com',
        description: 'Historic hotel with classic architecture, modern amenities, and rich cultural heritage.',
        star_rating: 5,
        check_in_time: '16:00',
        check_out_time: '12:00',
        rating: 4.9,
        total_reviews: 678,
        main_image: '/uploads/hotels/historic-plaza.jpg',
        status: 'active',
        policies: policies.map(p => p._id),
        amenities: amenities.map(a => a._id)
      }
    ];
    
    console.log('Hotel data to insert:', hotelData.length, 'hotels');
    
    // Insert hotels
    const result = await Hotel.insertMany(hotelData);
    console.log('Successfully seeded', result.length, 'hotels');
    
    return result;
  } catch (error) {
    console.error('Hotel seeder error:', error);
    throw error;
  }
};

// Run seeder if called directly
if (require.main === module) {
  const { initializeDatabase } = require('../../config/database');
  initializeDatabase()
    .then(() => seedHotels())
    .then(() => {
      console.log('Hotel seeding completed');
      process.exit(0);
    })
    .catch((error) => {
      console.error('Hotel seeding failed:', error);
      process.exit(1);
    });
}

module.exports = seedHotels; 
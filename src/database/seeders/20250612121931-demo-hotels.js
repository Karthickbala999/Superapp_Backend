'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.bulkDelete('hotels', null, {}); // Clean slate
    console.log('Starting hotel seeder...');
    
    const hotelData = [
      {
        name: 'Grand Hotel',
        address: '123 Main St',
        city: 'New York',
        state: 'NY',
        country: 'USA',
        description: 'Luxury hotel in downtown',
        status: 1,
        main_image: '/uploads/hotels/grand-hotel.jpg'
      },
      {
        name: 'Seaside Resort',
        address: '456 Ocean Dr',
        city: 'Miami',
        state: 'FL',
        country: 'USA',
        description: 'Beachfront resort with ocean views',
        status: 1,
        main_image: '/uploads/hotels/seaside-resort.jpg'
      }
    ];
    
    console.log('Hotel data to insert:', hotelData);
    
    try {
      const result = await queryInterface.bulkInsert('hotels', hotelData, {});
      console.log('Hotel seeder result:', result);
    } catch (error) {
      console.error('Hotel seeder error:', error);
      throw error;
    }
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.bulkDelete('hotels', null, {});
  }
}; 
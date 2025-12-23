'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.bulkDelete('rooms', null, {}); // Clean slate
    // Fetch hotel IDs
    const hotels = await queryInterface.sequelize.query('SELECT id, name FROM hotels ORDER BY id');
    const hotelRows = hotels[0];
    const hotel1 = hotelRows.find(h => h.name === 'Grand Hotel');
    const hotel2 = hotelRows.find(h => h.name === 'Seaside Resort');

    const roomData = [
      {
        hotel_id: hotel1 ? hotel1.id : null,
        type: 'Standard',
        size: '25 sqm',
        price: 100.00,
        bed: '1 Queen Bed',
        view: 'City View',
        images: JSON.stringify(['/uploads/rooms/standard1.jpg']),
        available: 5,
        status: 1
      },
      {
        hotel_id: hotel1 ? hotel1.id : null,
        type: 'Deluxe',
        size: '35 sqm',
        price: 150.00,
        bed: '1 King Bed',
        view: 'Ocean View',
        images: JSON.stringify(['/uploads/rooms/deluxe1.jpg']),
        available: 3,
        status: 1
      },
      {
        hotel_id: hotel2 ? hotel2.id : null,
        type: 'Suite',
        size: '50 sqm',
        price: 200.00,
        bed: '1 King Bed + 1 Sofa Bed',
        view: 'Mountain View',
        images: JSON.stringify(['/uploads/rooms/suite1.jpg']),
        available: 2,
        status: 1
      }
    ];
    await queryInterface.bulkInsert('rooms', roomData, {});
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.bulkDelete('rooms', null, {});
  }
}; 
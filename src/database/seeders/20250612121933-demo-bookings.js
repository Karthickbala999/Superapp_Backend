'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.bulkDelete('bookings', null, {}); // Clean slate
    
    // Get a user ID dynamically
    const users = await queryInterface.sequelize.query(
      'SELECT id FROM users LIMIT 1',
      { type: Sequelize.QueryTypes.SELECT }
    );

    if (users.length === 0) {
      console.log('No users found. Please run user seeders first.');
      return;
    }

    // Fetch room IDs
    const rooms = await queryInterface.sequelize.query('SELECT id, type FROM rooms ORDER BY id');
    const roomRows = rooms[0];
    const room1 = roomRows.find(r => r.type === 'Standard');
    const room2 = roomRows.find(r => r.type === 'Deluxe');

    const bookingData = [
      {
        user_id: users[0].id,
        room_id: room1 ? room1.id : null,
        check_in: new Date('2024-06-15'),
        check_out: new Date('2024-06-20'),
        status: 1,
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        user_id: users[0].id,
        room_id: room2 ? room2.id : null,
        check_in: new Date('2024-06-16'),
        check_out: new Date('2024-06-18'),
        status: 1,
        created_at: new Date(),
        updated_at: new Date()
      }
    ];
    await queryInterface.bulkInsert('bookings', bookingData, {});
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.bulkDelete('bookings', null, {});
  }
}; 
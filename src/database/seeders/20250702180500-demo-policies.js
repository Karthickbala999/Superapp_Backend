'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.bulkInsert('policies', [
      { title: 'No Smoking', description: 'Smoking is not allowed in any area of the hotel.', status: true, created_at: new Date(), updated_at: new Date() },
      { title: 'Free Cancellation', description: 'You can cancel your booking for free up to 24 hours before check-in.', status: true, created_at: new Date(), updated_at: new Date() },
      { title: 'Check-in after 2pm', description: 'Check-in is available after 2pm.', status: true, created_at: new Date(), updated_at: new Date() },
      { title: 'No Pets', description: 'Pets are not allowed in the hotel.', status: true, created_at: new Date(), updated_at: new Date() },
      { title: 'ID Required', description: 'A valid government-issued ID is required at check-in.', status: true, created_at: new Date(), updated_at: new Date() }
    ], {});
  },
  down: async (queryInterface, Sequelize) => {
    await queryInterface.bulkDelete('policies', null, {});
  }
}; 
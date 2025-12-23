'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.bulkInsert('amenities', [
      { name: 'Wifi', icon: '', status: true, created_at: new Date(), updated_at: new Date() },
      { name: 'Pool', icon: '', status: true, created_at: new Date(), updated_at: new Date() },
      { name: 'Parking', icon: '', status: true, created_at: new Date(), updated_at: new Date() },
      { name: 'Restaurant', icon: '', status: true, created_at: new Date(), updated_at: new Date() },
      { name: 'Laundry', icon: '', status: true, created_at: new Date(), updated_at: new Date() },
      { name: 'Air Conditioning', icon: '', status: true, created_at: new Date(), updated_at: new Date() },
      { name: 'Room Service', icon: '', status: true, created_at: new Date(), updated_at: new Date() },
      { name: 'Free Internet', icon: '', status: true, created_at: new Date(), updated_at: new Date() },
      { name: 'Double Bed', icon: '', status: true, created_at: new Date(), updated_at: new Date() },
      { name: 'Swimming Pool', icon: '', status: true, created_at: new Date(), updated_at: new Date() }
    ], {});
  },
  down: async (queryInterface, Sequelize) => {
    await queryInterface.bulkDelete('amenities', null, {});
  }
}; 
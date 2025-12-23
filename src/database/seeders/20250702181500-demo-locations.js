'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.bulkInsert('locations', [
      { name: 'Chennai', description: 'Chennai, Tamil Nadu', status: true, created_at: new Date(), updated_at: new Date() },
      { name: 'Bangalore', description: 'Bangalore, Karnataka', status: true, created_at: new Date(), updated_at: new Date() },
      { name: 'Hyderabad', description: 'Hyderabad, Telangana', status: true, created_at: new Date(), updated_at: new Date() },
      { name: 'Mumbai', description: 'Mumbai, Maharashtra', status: true, created_at: new Date(), updated_at: new Date() },
      { name: 'Delhi', description: 'Delhi, National Capital Territory', status: true, created_at: new Date(), updated_at: new Date() }
    ], {});
  },
  down: async (queryInterface, Sequelize) => {
    await queryInterface.bulkDelete('locations', null, {});
  }
}; 
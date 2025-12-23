'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.bulkInsert('taxi_drivers', [
      {
        id: 1,
        name: 'John Doe',
        phone: '+1234567890',
        license_no: 'DL123456',
        status: 1,
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        id: 2,
        name: 'Jane Smith',
        phone: '+1987654321',
        license_no: 'DL789012',
        status: 1,
        created_at: new Date(),
        updated_at: new Date()
      }
    ], {});
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete('taxi_drivers', null, {});
  }
};

'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.bulkInsert('taxi_vehicles', [
      {
        id: 1,
        driver_id: 1,
        make: 'Toyota',
        model: 'Camry',
        plate_number: 'ABC123',
        color: 'White',
        status: 1,
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        id: 2,
        driver_id: 2,
        make: 'Honda',
        model: 'Civic',
        plate_number: 'XYZ789',
        color: 'Black',
        status: 1,
        created_at: new Date(),
        updated_at: new Date()
      }
    ], {});
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete('taxi_vehicles', null, {});
  }
};

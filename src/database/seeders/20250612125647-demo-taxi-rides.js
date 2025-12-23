'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    try {
      // Fetch the first available user
      const users = await queryInterface.sequelize.query(
        'SELECT id FROM users LIMIT 1;',
        { type: queryInterface.sequelize.QueryTypes.SELECT }
      );
      if (users.length === 0) {
        console.log('No users found. Skipping taxi rides seeder.');
        return;
      }
      const userId = users[0].id;

      // Fetch the first available driver
      const drivers = await queryInterface.sequelize.query(
        'SELECT id FROM taxi_drivers LIMIT 1;',
        { type: queryInterface.sequelize.QueryTypes.SELECT }
      );
      if (drivers.length === 0) {
        console.log('No taxi drivers found. Skipping taxi rides seeder.');
        return;
      }
      const driverId = drivers[0].id;

      // Fetch the first available vehicle
      const vehicles = await queryInterface.sequelize.query(
        'SELECT id FROM taxi_vehicles LIMIT 1;',
        { type: queryInterface.sequelize.QueryTypes.SELECT }
      );
      if (vehicles.length === 0) {
        console.log('No taxi vehicles found. Skipping taxi rides seeder.');
        return;
      }
      const vehicleId = vehicles[0].id;

      await queryInterface.bulkInsert('taxi_rides', [
        {
          user_id: userId,
          driver_id: driverId,
          vehicle_id: vehicleId,
          pickup_location: '123 Main St',
          dropoff_location: '456 Park Ave',
          fare: 25.50,
          status: 1,
          requested_at: new Date(),
          started_at: new Date(),
          completed_at: new Date(),
          created_at: new Date(),
          updated_at: new Date()
        }
      ], {});
      console.log('Taxi ride seeded successfully.');
    } catch (error) {
      console.error('Error seeding taxi_rides:', error);
    }
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete('taxi_rides', null, {});
  }
};

'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.bulkInsert('roles', [
      {
        id: 1,
        name: 'admin',
        description: 'Super administrator with full access to all modules',
        status: true,
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        id: 2,
        name: 'ecommerce_admin',
        description: 'Ecommerce module administrator with access to ecommerce and grocery modules',
        status: true,
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        id: 3,
        name: 'grocery_admin',
        description: 'Grocery module administrator with access to grocery module only',
        status: true,
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        id: 4,
        name: 'taxi_admin',
        description: 'Taxi module administrator with access to taxi module only',
        status: true,
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        id: 5,
        name: 'hotel_admin',
        description: 'Hotel module administrator with access to hotel and restaurant modules',
        status: true,
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        id: 6,
        name: 'user',
        description: 'Regular user with no admin access',
        status: true,
        created_at: new Date(),
        updated_at: new Date()
      }
    ], {});
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.bulkDelete('roles', {
      name: ['admin', 'ecommerce_admin', 'grocery_admin', 'taxi_admin', 'hotel_admin', 'user']
    }, {});
  }
}; 
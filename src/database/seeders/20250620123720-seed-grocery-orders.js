'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // Get a user ID dynamically
    const users = await queryInterface.sequelize.query(
      'SELECT id FROM users LIMIT 1',
      { type: Sequelize.QueryTypes.SELECT }
    );

    if (users.length === 0) {
      console.log('No users found. Please run user seeders first.');
      return;
    }

    await queryInterface.bulkInsert('grocery_orders', [
      {
        user_id: users[0].id,
        total_amount: 150.00,
        status: 'pending',
        payment_status: 'pending',
        shipping_address: '123 Example Street, Chennai',
        created_at: new Date(),
        updated_at: new Date()
      }
    ]);
  },

  down: async (queryInterface) => {
    await queryInterface.bulkDelete('grocery_orders', null, {});
  }
};


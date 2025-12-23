'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // Get grocery order ID dynamically
    const orders = await queryInterface.sequelize.query(
      'SELECT id FROM grocery_orders LIMIT 1',
      { type: Sequelize.QueryTypes.SELECT }
    );

    if (orders.length === 0) {
      console.log('No grocery orders found. Please run grocery orders seeder first.');
      return;
    }

    // Get grocery ID dynamically
    const groceries = await queryInterface.sequelize.query(
      'SELECT id FROM groceries LIMIT 1',
      { type: Sequelize.QueryTypes.SELECT }
    );

    if (groceries.length === 0) {
      console.log('No groceries found. Please run groceries seeder first.');
      return;
    }

    await queryInterface.bulkInsert('grocery_order_items', [
      {
        order_id: orders[0].id,
        grocery_id: groceries[0].id,
        quantity: 2,
        original_price: 100.00,
        discounted_price: 75.00,
        name: 'Basmati Rice 5kg',
        image: 'rice5kg.jpg',
        category: 'Grains',
        created_at: new Date(),
        updated_at: new Date()
      }
    ]);
  },

  down: async (queryInterface) => {
    await queryInterface.bulkDelete('grocery_order_items', null, {});
  }
};

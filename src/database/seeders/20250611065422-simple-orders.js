'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // First, get some user IDs (assuming we have users)
    const users = await queryInterface.sequelize.query(
      'SELECT id FROM users LIMIT 2',
      { type: Sequelize.QueryTypes.SELECT }
    );

    if (users.length === 0) {
      console.log('No users found. Please run user seeders first.');
      return;
    }

    // Get some product IDs
    const products = await queryInterface.sequelize.query(
      'SELECT id FROM products LIMIT 2',
      { type: Sequelize.QueryTypes.SELECT }
    );

    if (products.length === 0) {
      console.log('No products found. Please run product seeders first.');
      return;
    }

    const now = Date.now();
    const orders = [
      {
        user_id: users[0].id,
        order_number: `ORD-2025-001-${now}`,
        status: 'pending',
        total_amount: 299.99,
        subtotal: 299.99,
        tax_amount: 0,
        shipping_amount: 0,
        discount_amount: 0,
        shipping_address: JSON.stringify({
          address_line1: '123 Main St',
          city: 'New York',
          state: 'NY',
          country: 'USA',
          pincode: '10001'
        }),
        billing_address: JSON.stringify({
          address_line1: '123 Main St',
          city: 'New York',
          state: 'NY',
          country: 'USA',
          pincode: '10001'
        }),
        payment_method: 'cod',
        payment_status: 'pending',
        payment_details: JSON.stringify({}),
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        user_id: users[1] ? users[1].id : users[0].id,
        order_number: `ORD-2025-002-${now}`,
        status: 'confirmed',
        total_amount: 149.50,
        subtotal: 149.50,
        tax_amount: 0,
        shipping_amount: 0,
        discount_amount: 0,
        shipping_address: JSON.stringify({
          address_line1: '456 Oak Ave',
          city: 'Los Angeles',
          state: 'CA',
          country: 'USA',
          pincode: '90210'
        }),
        billing_address: JSON.stringify({
          address_line1: '456 Oak Ave',
          city: 'Los Angeles',
          state: 'CA',
          country: 'USA',
          pincode: '90210'
        }),
        payment_method: 'card',
        payment_status: 'paid',
        payment_details: JSON.stringify({}),
        created_at: new Date(),
        updated_at: new Date()
      }
    ];

    await queryInterface.bulkInsert('orders', orders, {});

    // Get the inserted order IDs
    const insertedOrders = await queryInterface.sequelize.query(
      'SELECT id FROM orders ORDER BY id DESC LIMIT 2',
      { type: Sequelize.QueryTypes.SELECT }
    );

    const orderItems = [
      {
        order_id: insertedOrders[1] ? insertedOrders[1].id : insertedOrders[0].id,
        product_id: products[0].id,
        quantity: 2,
        unit_price: 149.99,
        total_price: 299.98,
        product_snapshot: JSON.stringify({
          name: 'Sample Product 1',
          sku: 'SKU-001',
          price: 149.99
        }),
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        order_id: insertedOrders[0].id,
        product_id: products[1] ? products[1].id : products[0].id,
        quantity: 1,
        unit_price: 149.50,
        total_price: 149.50,
        product_snapshot: JSON.stringify({
          name: 'Sample Product 2',
          sku: 'SKU-002',
          price: 149.50
        }),
        created_at: new Date(),
        updated_at: new Date()
      }
    ];

    await queryInterface.bulkInsert('order_items', orderItems, {});
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.bulkDelete('order_items', null, {});
    await queryInterface.bulkDelete('orders', null, {});
  }
}; 
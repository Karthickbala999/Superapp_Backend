'use strict';
const bcrypt = require('bcryptjs');

module.exports = {
  up: async (queryInterface, Sequelize) => {
    const password = 'admin123';
    const hashedPassword = await bcrypt.hash(password, 10);

    const adminUsers = [
      {
        id: 1, // Explicitly set ID to 1 for restaurant vendor references
        name: 'Restaurant Vendor',
        email: 'vendor@example.com',
        password: hashedPassword,
        role: 'restaurant_admin',
        status: true,
        phone: '+1234567890',
        last_login: new Date(),
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        name: 'Super Admin',
        email: 'admin@example.com',
        password: hashedPassword,
        role: 'admin',
        status: true,
        phone: '+1234567891',
        last_login: new Date(),
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        name: 'Ecommerce Manager',
        email: 'ecommerce@example.com',
        password: hashedPassword,
        role: 'ecommerce_admin',
        status: true,
        phone: '+1234567892',
        last_login: new Date(),
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        name: 'Grocery Manager',
        email: 'grocery@example.com',
        password: hashedPassword,
        role: 'grocery_admin',
        status: true,
        phone: '+1234567893',
        last_login: new Date(),
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        name: 'Taxi Manager',
        email: 'taxi@example.com',
        password: hashedPassword,
        role: 'taxi_admin',
        status: true,
        phone: '+1234567894',
        last_login: new Date(),
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        name: 'Hotel Manager',
        email: 'hotel@example.com',
        password: hashedPassword,
        role: 'hotel_admin',
        status: true,
        phone: '+1234567895',
        last_login: new Date(),
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        name: 'Regular User',
        email: 'user@example.com',
        password: hashedPassword,
        role: 'user',
        status: true,
        phone: '+1234567896',
        last_login: new Date(),
        created_at: new Date(),
        updated_at: new Date()
      }
    ];

    // First, remove any existing data from dependent tables to avoid foreign key constraints
    await queryInterface.bulkDelete('order_items', null, {});
    await queryInterface.bulkDelete('orders', null, {});
    await queryInterface.bulkDelete('user_profiles', null, {});
    await queryInterface.bulkDelete('wishlists', null, {});
    await queryInterface.bulkDelete('gcart_items', null, {});
    await queryInterface.bulkDelete('gwhishlist', null, {});
    // Add any other dependent tables here if needed
    
    // Then remove any existing users (without truncating to avoid FK constraints)
    await queryInterface.bulkDelete('users', null, {});

    // Insert new admin users
    await queryInterface.bulkInsert('users', adminUsers);
  },

  down: async (queryInterface, Sequelize) => {
    // Remove all users created by this seeder
    await queryInterface.bulkDelete('users', {
      email: [
        'vendor@example.com',
        'admin@example.com',
        'ecommerce@example.com',
        'grocery@example.com',
        'taxi@example.com',
        'hotel@example.com',
        'user@example.com'
      ]
    });
  }
}; 
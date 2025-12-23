const { sequelize } = require('../models');
const bcrypt = require('bcryptjs');
const { User, Cart, CartItem, Product, Category } = require('../models');

async function dropAndInitDatabase() {
  try {
    // Disable foreign key checks
    await sequelize.query('SET FOREIGN_KEY_CHECKS = 0');

    // Drop all tables
    await sequelize.query('DROP TABLE IF EXISTS cart_items');
    await sequelize.query('DROP TABLE IF EXISTS carts');
    await sequelize.query('DROP TABLE IF EXISTS product_variations');
    await sequelize.query('DROP TABLE IF EXISTS products');
    await sequelize.query('DROP TABLE IF EXISTS categories');
    await sequelize.query('DROP TABLE IF EXISTS user_profiles');
    await sequelize.query('DROP TABLE IF EXISTS users');

    // Enable foreign key checks
    await sequelize.query('SET FOREIGN_KEY_CHECKS = 1');

    // Now sync all models to create fresh tables
    await sequelize.sync({ force: true });

    // Create a test user
    const testUser = await User.create({
      name: 'Test User',
      email: 'test@example.com',
      password: await bcrypt.hash('password123', 10),
      phone: '1234567890',
      role: 'user'
    });

    console.log('Database reinitialized successfully');
    process.exit(0);
  } catch (error) {
    console.error('Error reinitializing database:', error);
    console.error('Detailed error:', error.original || error);
    process.exit(1);
  }
}

// Run the initialization
dropAndInitDatabase(); 
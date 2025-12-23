const { sequelize } = require('../models');
const bcrypt = require('bcryptjs');
const { User, Cart, CartItem, Product, Category } = require('../models');

async function initializeDatabase() {
  try {
    // Disable foreign key checks before dropping tables
    await sequelize.query('SET FOREIGN_KEY_CHECKS = 0');

    // Force sync will drop all tables and recreate them
    await sequelize.sync({ force: true });

    // Enable foreign key checks after recreation
    await sequelize.query('SET FOREIGN_KEY_CHECKS = 1');

    // Create a test user
    const testUser = await User.create({
      name: 'Test User',
      email: 'test@example.com',
      password: await bcrypt.hash('password123', 10),
      phone: '1234567890',
      role: 'user'
    });

    console.log('Database initialized successfully');
    process.exit(0);
  } catch (error) {
    console.error('Error initializing database:', error);
    process.exit(1);
  }
}

// Run the initialization
initializeDatabase(); 
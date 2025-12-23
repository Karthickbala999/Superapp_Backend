const { sequelize } = require('../models');

async function resetDatabase() {
  try {
    // Disable foreign key checks
    await sequelize.query('SET FOREIGN_KEY_CHECKS = 0');

    // Drop all existing tables
    await sequelize.query('DROP TABLE IF EXISTS cart_items');
    await sequelize.query('DROP TABLE IF EXISTS carts');
    await sequelize.query('DROP TABLE IF EXISTS product_variations');
    await sequelize.query('DROP TABLE IF EXISTS products');
    await sequelize.query('DROP TABLE IF EXISTS categories');
    await sequelize.query('DROP TABLE IF EXISTS user_profiles');
    await sequelize.query('DROP TABLE IF EXISTS users');

    // Enable foreign key checks
    await sequelize.query('SET FOREIGN_KEY_CHECKS = 1');

    // Sync all models with force: true to create fresh tables
    await sequelize.sync({ force: true });

    console.log('Database reset successfully');
    process.exit(0);
  } catch (error) {
    console.error('Error resetting database:', error);
    console.error('Detailed error:', error.original || error);
    process.exit(1);
  }
}

// Run the reset
resetDatabase(); 
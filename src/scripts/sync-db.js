const { sequelize, User, Category, Product, ProductVariation, Cart, CartItem } = require('../models');
const bcrypt = require('bcryptjs');

async function syncDatabase() {
  try {
    // Disable foreign key checks
    await sequelize.query('SET FOREIGN_KEY_CHECKS = 0');

    // Force sync all models
    await sequelize.sync({ force: true });
    
    // Enable foreign key checks
    await sequelize.query('SET FOREIGN_KEY_CHECKS = 1');
    
    console.log('Database synced successfully');

    // Create test admin user
    const adminUser = await User.create({
      name: 'Admin User',
      email: 'admin@example.com',
      password: await bcrypt.hash('admin123', 10),
      role: 'admin',
      phone: '1234567890'
    });
    console.log('Admin user created');

    // Create test categories
    const electronics = await Category.create({
      name: 'Electronics',
      slug: 'electronics',
      description: 'Electronic devices and gadgets'
    });

    const smartphones = await Category.create({
      name: 'Smartphones',
      slug: 'smartphones',
      description: 'Mobile phones and accessories',
      parent_id: electronics.id
    });

    const laptops = await Category.create({
      name: 'Laptops',
      slug: 'laptops',
      description: 'Laptops and notebooks',
      parent_id: electronics.id
    });
    console.log('Categories created');

    // Create test product with variations
    const iphone = await Product.create({
      name: 'iPhone 15 Pro',
      slug: 'iphone-15-pro',
      description: 'Latest iPhone with advanced features',
      sku: 'IPH15PRO',
      price: 999.99,
      stock: 100,
      category_id: smartphones.id
    });

    // Create variations
    await ProductVariation.create({
      product_id: iphone.id,
      sku: 'IPH15PRO-256',
      price: 999.99,
      stock: 50,
      attributes: {
        storage: '256GB',
        color: 'Natural Titanium'
      }
    });

    await ProductVariation.create({
      product_id: iphone.id,
      sku: 'IPH15PRO-512',
      price: 1199.99,
      stock: 30,
      attributes: {
        storage: '512GB',
        color: 'Natural Titanium'
      }
    });
    console.log('Products and variations created');

    console.log('Database setup completed successfully');
    process.exit(0);
  } catch (error) {
    console.error('Error syncing database:', error);
    process.exit(1);
  }
}

syncDatabase(); 
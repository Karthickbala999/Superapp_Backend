const { Product, ProductVariation } = require('../../models');

module.exports = {
  up: async (queryInterface, Sequelize) => {
    try {
      // First create products
      const products = await queryInterface.bulkInsert('Products', [
        {
          name: 'Navy Blue Blazer',
          description: 'Classic navy blue blazer for formal occasions.',
          price: 4000,
          original_price: 5000,
          image: '/images/navy-blazer.png',
          category: 'Men Uniforms - Formal Wear',
          rating: 4.2,
          created_at: new Date(),
          updated_at: new Date()
        },
        {
          name: 'Black Suit',
          description: 'Complete black suit set for formal events.',
          price: 5600,
          original_price: 7000,
          image: '/images/black-suit.png',
          category: 'Men Uniforms - Formal Wear',
          rating: 4.5,
          created_at: new Date(),
          updated_at: new Date()
        },
        {
          name: 'White Formal Shirt',
          description: 'Crisp white formal shirt with slim fit.',
          price: 1600,
          original_price: 2000,
          image: '/images/white-formal-shirt.png',
          category: 'Men Uniforms - Formal Wear',
          rating: 4.3,
          created_at: new Date(),
          updated_at: new Date()
        },
        {
          name: 'Denim Jeans',
          description: 'Slim fit denim jeans.',
          price: 2000,
          original_price: 2500,
          image: '/images/denim-jeans.png',
          category: 'Men Uniforms - Casual Wear',
          rating: 4.4,
          created_at: new Date(),
          updated_at: new Date()
        }
      ], {});

      // Then create variations for each product
      await queryInterface.bulkInsert('ProductVariations', [
        {
          product_id: products[0],
          size: 'S',
          price: 4000,
          created_at: new Date(),
          updated_at: new Date()
        },
        {
          product_id: products[0],
          size: 'M',
          price: 4000,
          created_at: new Date(),
          updated_at: new Date()
        },
        {
          product_id: products[0],
          size: 'L',
          price: 4000,
          created_at: new Date(),
          updated_at: new Date()
        },
        {
          product_id: products[1],
          size: 'S',
          price: 5600,
          created_at: new Date(),
          updated_at: new Date()
        },
        {
          product_id: products[1],
          size: 'M',
          price: 5600,
          created_at: new Date(),
          updated_at: new Date()
        },
        {
          product_id: products[1],
          size: 'L',
          price: 5600,
          created_at: new Date(),
          updated_at: new Date()
        }
      ], {});

      return Promise.resolve();
    } catch (error) {
      console.error('Error seeding products:', error);
      return Promise.reject(error);
    }
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.bulkDelete('Products', null, {});
    await queryInterface.bulkDelete('ProductVariations', null, {});
  }
};

'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    // Seed restaurant categories
    await queryInterface.bulkInsert('restaurant_categories', [
      {
        name: 'Italian',
        description: 'Authentic Italian cuisine with pasta, pizza, and more',
        image: null,
        status: true,
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        name: 'Chinese',
        description: 'Traditional Chinese dishes and flavors',
        image: null,
        status: true,
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        name: 'Indian',
        description: 'Spicy and flavorful Indian cuisine',
        image: null,
        status: true,
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        name: 'Fast Food',
        description: 'Quick and convenient fast food options',
        image: null,
        status: true,
        created_at: new Date(),
        updated_at: new Date()
      }
    ], {});

    // Get the inserted categories
    const categories = await queryInterface.sequelize.query(
      'SELECT id FROM restaurant_categories;',
      { type: queryInterface.sequelize.QueryTypes.SELECT }
    );

    // Seed restaurants
    await queryInterface.bulkInsert('restaurants', [
      {
        name: 'Pizza Palace',
        address: '123 Main Street, Downtown',
        category_id: categories[0].id, // Italian
        image: null,
        average_rating: 4.5,
        status: true,
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        name: 'Golden Dragon',
        address: '456 Oak Avenue, Chinatown',
        category_id: categories[1].id, // Chinese
        image: null,
        average_rating: 4.2,
        status: true,
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        name: 'Spice Garden',
        address: '789 Spice Road, Little India',
        category_id: categories[2].id, // Indian
        image: null,
        average_rating: 4.7,
        status: true,
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        name: 'Burger Express',
        address: '321 Fast Lane, Food Court',
        category_id: categories[3].id, // Fast Food
        image: null,
        average_rating: 3.8,
        status: true,
        created_at: new Date(),
        updated_at: new Date()
      }
    ], {});

    // Get the inserted restaurants
    const restaurants = await queryInterface.sequelize.query(
      'SELECT id FROM restaurants;',
      { type: queryInterface.sequelize.QueryTypes.SELECT }
    );

    // Seed dishes
    await queryInterface.bulkInsert('dishes', [
      {
        name: 'Margherita Pizza',
        price: 15.99,
        description: 'Classic tomato sauce with mozzarella cheese',
        image: null,
        restaurant_id: restaurants[0].id, // Pizza Palace
        status: true,
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        name: 'Pepperoni Pizza',
        price: 17.99,
        description: 'Spicy pepperoni with melted cheese',
        image: null,
        restaurant_id: restaurants[0].id, // Pizza Palace
        status: true,
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        name: 'Kung Pao Chicken',
        price: 12.99,
        description: 'Spicy diced chicken with peanuts and vegetables',
        image: null,
        restaurant_id: restaurants[1].id, // Golden Dragon
        status: true,
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        name: 'Sweet and Sour Pork',
        price: 11.99,
        description: 'Crispy pork in tangy sweet and sour sauce',
        image: null,
        restaurant_id: restaurants[1].id, // Golden Dragon
        status: true,
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        name: 'Butter Chicken',
        price: 14.99,
        description: 'Creamy tomato-based curry with tender chicken',
        image: null,
        restaurant_id: restaurants[2].id, // Spice Garden
        status: true,
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        name: 'Biryani',
        price: 16.99,
        description: 'Fragrant rice dish with aromatic spices',
        image: null,
        restaurant_id: restaurants[2].id, // Spice Garden
        status: true,
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        name: 'Classic Burger',
        price: 8.99,
        description: 'Juicy beef patty with lettuce, tomato, and cheese',
        image: null,
        restaurant_id: restaurants[3].id, // Burger Express
        status: true,
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        name: 'Chicken Wings',
        price: 9.99,
        description: 'Crispy wings with your choice of sauce',
        image: null,
        restaurant_id: restaurants[3].id, // Burger Express
        status: true,
        created_at: new Date(),
        updated_at: new Date()
      }
    ], {});
  },

  async down(queryInterface, Sequelize) {
    // Remove seeded data in reverse order
    await queryInterface.bulkDelete('dishes', null, {});
    await queryInterface.bulkDelete('restaurants', null, {});
    await queryInterface.bulkDelete('restaurant_categories', null, {});
  }
};

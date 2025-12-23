'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // await queryInterface.bulkInsert('gwhishlist', [{
    //   user_id: 1,
    //   grocery_id: 1,
    //   name: 'Tortilla Chips',
    //   image: '/uploads/tortilla_chips.png',
    //   category: 'Snacks',
    //   original_price: 40.00,
    //   discounted_price: 30.00,
    //   quantity: 1,
    //   created_at: new Date(),
    //   updated_at: new Date()
    // }], {});
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.bulkDelete('gwhishlist', null, {});
  }
};

'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // await queryInterface.bulkInsert('wishlists', [], {});
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.bulkDelete('wishlists', null, {});
  }
}; 
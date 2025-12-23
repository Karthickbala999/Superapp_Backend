'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    // No static cart items seeded
   // await queryInterface.bulkInsert('gcart_items', []);
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete('gcart_items', null, {});
  }
};

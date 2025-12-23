'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.bulkInsert('gcart', [
      {
        userId: 1,
        productId: 1,
        quantity: 2,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        userId: 1,
        productId: 2,
        quantity: 1,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        userId: 2,
        productId: 1,
        quantity: 3,
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ], {});
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete('gcart', null, {});
  }
};

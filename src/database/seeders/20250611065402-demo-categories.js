'use strict';

const { Op } = require('sequelize');

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  up: async (queryInterface, Sequelize) => {
    // First, check if categories already exist
    const existingCategories = await queryInterface.sequelize.query(
      'SELECT id FROM categories LIMIT 1',
      { type: queryInterface.sequelize.QueryTypes.SELECT }
    );

    // If categories already exist, skip seeding
    if (existingCategories && existingCategories.length > 0) {
      console.log('Categories already exist, skipping seeding');
      return;
    }

    // First, create parent categories
    await queryInterface.bulkInsert('categories', [
      {
        id: 1,
        name: 'Men\'s Wear',
        description: 'Men\'s fashion and apparel',
        slug: 'mens-wear',
        status: true,
        created_at: new Date(),
        updated_at: new Date()
      },
      {
          id: 2,
          name: 'Women\'s Wear',
          description: 'Women\'s fashion and apparel',
          slug: 'womens-wear',
          status: true,
          created_at: new Date(),
          updated_at: new Date()
      },
      {
          id: 3, // ✅ NEW category
          name: 'Home Appliances',
          description: 'Appliances for home use',
          slug: 'home-appliances',
          status: true,
          created_at: new Date(),
          updated_at: new Date()
      },
      {
          id: 4, // ✅ NEW category
          name: 'Cosmetics',
          description: 'Beauty and personal care products',
          slug: 'cosmetics',
          status: true,
          created_at: new Date(),
          updated_at: new Date()
      },
    ]);

    // Then, create child categories
    await queryInterface.bulkInsert('categories', [
      {
        id: 101,
        name: 'Tops',
        description: 'Men\'s tops and shirts',
        slug: 'mens-tops',
        status: true,
        parent_id: 1, // Men's Clothing
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        id: 102,
        name: 'Bottoms',
        description: 'Men\'s pants and shorts',
        slug: 'mens-bottoms',
        status: true,
        parent_id: 1, // Men's Clothing
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        id: 103,
        name: 'Footwear',
        description: 'Men\'s shoes and boots',
        slug: 'mens-footwear',
        status: true,
        parent_id: 1, // Men's Clothing
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        id: 104,
        name: 'Accessories',
        description: 'Men\'s accessories and jewelry',
        slug: 'mens-accessories',
        status: true,
        parent_id: 1, // Men's Clothing
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        id: 105,
        name: 'Outerwear',
        description: 'Men\'s jackets and coats',
        slug: 'mens-outerwear',
        status: true,
        parent_id: 1, // Men's Clothing
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        id: 106,
        name: 'Suits & Formals',
        description: 'Men\'s formal wear and suits',
        slug: 'mens-suits-formals',
        status: true,
        parent_id: 1, // Men's Clothing
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        id: 107,
        name: 'Underwear & Loungewear',
        description: 'Men\'s underwear and loungewear',
        slug: 'mens-underwear-loungewear',
        status: true,
        parent_id: 1, // Men's Clothing
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        id: 108,
        name: 'New Arrivals',
        description: 'Latest men\'s fashion arrivals',
        slug: 'mens-new-arrivals',
        status: true,
        parent_id: 1, // Men's Clothing
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        id: 109,
        name: 'Seasonal Collections',
        description: 'Seasonal men\'s fashion collections',
        slug: 'mens-seasonal-collections',
        status: true,
        parent_id: 1, // Men's Clothing
        created_at: new Date(),
        updated_at: new Date()
      },
      // Home Appliances subcategories
      {
        id: 301,
        name: 'Refrigerators',
        description: 'All types of refrigerators',
        slug: 'refrigerators',
        status: true,
        parent_id: 3,
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        id:302,
        name: 'Washing Machines',
        description: 'All types of washing machines',
        slug: 'washing-machines',
        status: true,
        parent_id: 3,
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        id:303,
        name: 'Air Conditioners & Coolers',
        description: 'Air conditioners and coolers',
        slug: 'air-conditioners-coolers',
        status: true,
        parent_id: 3,
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        id:304,
        name: 'Kitchen Appliances',
        description: 'Kitchen appliances',
        slug: 'kitchen-appliances',
        status: true,
        parent_id: 3,
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        id:305,
        name: 'Televisions',
        description: 'All types of televisions',
        slug: 'televisions',
        status: true,
        parent_id: 3,
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        id:306,
        name: 'Fans & Other appliances',
        description: 'Fans and other appliances',
        slug: 'fans-other',
        status: true,
        parent_id: 3,
        created_at: new Date(),
        updated_at: new Date()
      },
    ]);
  },

  down: async (queryInterface, Sequelize) => {
    // First, set all parent_id to NULL
    await queryInterface.bulkUpdate('categories', 
      { parent_id: null },
      { parent_id: { [Op.ne]: null } }
    );
    
  }
};

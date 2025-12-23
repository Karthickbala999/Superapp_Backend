const sequelize = require('../config/database');
const Brand = require('../models/brand');

const seedBrands = async () => {
  try {
    // Sync the database to ensure tables exist
    await sequelize.sync();

    const brandsData = [
      {
        brand_name: 'Nike',
        photo: 'brands/nike-logo.png',
        status: true
      },
      {
        brand_name: 'Adidas',
        photo: 'brands/adidas-logo.png',
        status: true
      },
      {
        brand_name: 'Puma',
        photo: 'brands/puma-logo.png',
        status: true
      },
      {
        brand_name: 'Under Armour',
        photo: 'brands/under-armour-logo.png',
        status: true
      },
      {
        brand_name: 'Reebok',
        photo: 'brands/reebok-logo.png',
        status: true
      }
    ];

    console.log('Starting to insert brands...');
    
    // Clear existing brands
    await Brand.destroy({ where: {}, force: true });
    
    // Insert new brands
    const createdBrands = await Brand.bulkCreate(brandsData);
    
    console.log('Brands seeded successfully!');
    console.log('Created brands:', createdBrands.map(brand => brand.brand_name));
    process.exit(0);
  } catch (error) {
    console.error('Error seeding brands:', error);
    process.exit(1);
  }
};

seedBrands(); 
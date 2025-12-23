'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    try {
      // Check if brands already exist
      const existingBrands = await queryInterface.sequelize.query(
        'SELECT id FROM brands LIMIT 1',
        { type: queryInterface.sequelize.QueryTypes.SELECT }
      );

      // If brands already exist, skip seeding
      if (existingBrands && existingBrands.length > 0) {
        console.log('Brands already exist, skipping seeding');
        return;
      }

      const brandsData = [
        { brand_name: 'LG', photo: 'brands/lg.png', status: true, created_at: new Date(), updated_at: new Date() },
        { brand_name: 'Samsung', photo: 'brands/samsung.png', status: true, created_at: new Date(), updated_at: new Date() },
        { brand_name: 'Whirlpool', photo: 'brands/whirlpool.png', status: true, created_at: new Date(), updated_at: new Date() },
        { brand_name: 'Godrej', photo: 'brands/godrej.png', status: true, created_at: new Date(), updated_at: new Date() },
        { brand_name: 'Haier', photo: 'brands/haier.png', status: true, created_at: new Date(), updated_at: new Date() },
        { brand_name: 'Panasonic', photo: 'brands/panasonic.png', status: true, created_at: new Date(), updated_at: new Date() },
        { brand_name: 'Bosch', photo: 'brands/bosch.png', status: true, created_at: new Date(), updated_at: new Date() },
        { brand_name: 'Hitachi', photo: 'brands/hitachi.png', status: true, created_at: new Date(), updated_at: new Date() },
        { brand_name: 'IFB', photo: 'brands/ifb.png', status: true, created_at: new Date(), updated_at: new Date() },
        { brand_name: 'Voltas', photo: 'brands/voltas.png', status: true, created_at: new Date(), updated_at: new Date() },
        { brand_name: 'Blue Star', photo: 'brands/bluestar.png', status: true, created_at: new Date(), updated_at: new Date() },
        { brand_name: 'Symphony', photo: 'brands/symphony.png', status: true, created_at: new Date(), updated_at: new Date() },
        { brand_name: 'Crompton', photo: 'brands/crompton.png', status: true, created_at: new Date(), updated_at: new Date() },
        { brand_name: 'Daikin', photo: 'brands/daikin.png', status: true, created_at: new Date(), updated_at: new Date() },
        { brand_name: 'Kenstar', photo: 'brands/kenstar.png', status: true, created_at: new Date(), updated_at: new Date() },
        { brand_name: 'Preethi', photo: 'brands/preethi.png', status: true, created_at: new Date(), updated_at: new Date() },
        { brand_name: 'Philips', photo: 'brands/philips.png', status: true, created_at: new Date(), updated_at: new Date() },
        { brand_name: 'Bajaj', photo: 'brands/bajaj.png', status: true, created_at: new Date(), updated_at: new Date() },
        { brand_name: 'Prestige', photo: 'brands/prestige.png', status: true, created_at: new Date(), updated_at: new Date() },
        { brand_name: 'Morphy Richards', photo: 'brands/morphyrichards.png', status: true, created_at: new Date(), updated_at: new Date() },
        { brand_name: 'Butterfly', photo: 'brands/butterfly.png', status: true, created_at: new Date(), updated_at: new Date() },
        { brand_name: 'Sujata', photo: 'brands/sujata.png', status: true, created_at: new Date(), updated_at: new Date() },
        { brand_name: 'Kent', photo: 'brands/kent.png', status: true, created_at: new Date(), updated_at: new Date() },
        { brand_name: 'Sony', photo: 'brands/sony.png', status: true, created_at: new Date(), updated_at: new Date() },
        { brand_name: 'TCL', photo: 'brands/tcl.png', status: true, created_at: new Date(), updated_at: new Date() },
        { brand_name: 'OnePlus', photo: 'brands/oneplus.png', status: true, created_at: new Date(), updated_at: new Date() },
        { brand_name: 'Vu', photo: 'brands/vu.png', status: true, created_at: new Date(), updated_at: new Date() },
        { brand_name: 'Mi', photo: 'brands/mi.png', status: true, created_at: new Date(), updated_at: new Date() },
        { brand_name: 'Havells', photo: 'brands/havells.png', status: true, created_at: new Date(), updated_at: new Date() },
        { brand_name: 'Usha', photo: 'brands/usha.png', status: true, created_at: new Date(), updated_at: new Date() },
        { brand_name: 'Orient', photo: 'brands/orient.png', status: true, created_at: new Date(), updated_at: new Date() },
        { brand_name: 'V-Guard', photo: 'brands/vguard.png', status: true, created_at: new Date(), updated_at: new Date() },
        { brand_name: 'Khaitan', photo: 'brands/khaitan.png', status: true, created_at: new Date(), updated_at: new Date() },
        { brand_name: 'Polycab', photo: 'brands/polycab.png', status: true, created_at: new Date(), updated_at: new Date() },
        {
          brand_name: 'Nike',
          photo: 'brands/nike-logo.png',
          status: true,
          created_at: new Date(),
          updated_at: new Date()
        },
        {
          brand_name: 'Adidas',
          photo: 'brands/adidas-logo.png',
          status: true,
          created_at: new Date(),
          updated_at: new Date()
        },
        {
          brand_name: 'Puma',
          photo: 'brands/puma-logo.png',
          status: true,
          created_at: new Date(),
          updated_at: new Date()
        },
        {
          brand_name: 'Under Armour',
          photo: 'brands/under-armour-logo.png',
          status: true,
          created_at: new Date(),
          updated_at: new Date()
        },
        {
          brand_name: 'Reebok',
          photo: 'brands/reebok-logo.png',
          status: true,
          created_at: new Date(),
          updated_at: new Date()
        },
        {
          brand_name: 'New Balance',
          photo: 'brands/new-balance-logo.png',
          status: true,
          created_at: new Date(),
          updated_at: new Date()
        },
        {
          brand_name: 'Converse',
          photo: 'brands/converse-logo.png',
          status: true,
          created_at: new Date(),
          updated_at: new Date()
        },
        {
          brand_name: 'Vans',
          photo: 'brands/vans-logo.png',
          status: true,
          created_at: new Date(),
          updated_at: new Date()
        },
        {
          brand_name: 'Fila',
          photo: 'brands/fila-logo.png',
          status: true,
          created_at: new Date(),
          updated_at: new Date()
        },
        {
          brand_name: 'ASICS',
          photo: 'brands/asics-logo.png',
          status: true,
          created_at: new Date(),
          updated_at: new Date()
        }
      ];

      console.log('Starting to insert brands...');
      await queryInterface.bulkInsert('brands', brandsData, {});
      console.log('Brands inserted successfully!');
    } catch (error) {
      console.error('Error seeding brands:', error);
      throw error;
    }
  }
};
'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  up: async (queryInterface, Sequelize) => {
    // Check if products already exist
    const existingProducts = await queryInterface.sequelize.query(
      'SELECT id FROM products LIMIT 1',
      { type: queryInterface.sequelize.QueryTypes.SELECT }
    );

    // If products already exist, skip seeding
    if (existingProducts && existingProducts.length > 0) {
      console.log('Products already exist, skipping seeding');
      return;
    }

    // 1. Create a lookup for brand names to IDs (assuming order in brands seeder)
    const brandNameToId = {
      'LG': 1,
      'Samsung': 2,
      'Whirlpool': 3,
      'Godrej': 4,
      'Haier': 5,
      'Panasonic': 6,
      'Bosch': 7,
      'Hitachi': 8,
      'IFB': 9,
      'Voltas': 10,
      'Blue Star': 11,
      'Symphony': 12,
      'Crompton': 13,
      'Daikin': 14,
      'Kenstar': 15,
      'Preethi': 16,
      'Philips': 17,
      'Bajaj': 18,
      'Prestige': 19,
      'Morphy Richards': 20,
      'Butterfly': 21,
      'Sujata': 22,
      'Kent': 23,
      'Sony': 24,
      'TCL': 25,
      'OnePlus': 26,
      'Vu': 27,
      'Mi': 28,
      'Havells': 29,
      'Usha': 30,
      'Orient': 31,
      'V-Guard': 32,
      'Khaitan': 33,
      'Polycab': 34
    };
    const brandId = 35;

    // First, create the products
    await queryInterface.bulkInsert('products', [
      // Refrigerators (category_id: 301)
      {
        id: 1,
        name: 'LG Double Door Refrigerator',
        description: '260L Frost Free Double Door',
        slug: 'lg-double-door-refrigerator',
        sku: 'REF-001',
        price: 24999.99,
        stock: 20,
        category_id: 301,
        status: true,
        brand_id: brandNameToId['LG'],
        photo: 'products/homeAppliance.jpg',
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        id: 2,
        name: 'Samsung Single Door Refrigerator',
        description: '192L Direct Cool Single Door',
        slug: 'samsung-single-door-refrigerator',
        sku: 'REF-002',
        price: 15999.99,
        stock: 15,
        category_id: 301,
        status: true,
        brand_id: brandNameToId['Samsung'],
        photo: 'products/homeAppliance.jpg',
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        id: 3,
        name: 'Whirlpool Multi Door Refrigerator',
        description: '300L Multi Door',
        slug: 'whirlpool-multi-door-refrigerator',
        sku: 'REF-003',
        price: 28999.99,
        stock: 10,
        category_id: 301,
        status: true,
        brand_id: brandNameToId['Whirlpool'],
        photo: 'products/homeAppliance.jpg',
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        id: 4,
        name: 'Godrej Mini Refrigerator',
        description: '99L Mini Fridge',
        slug: 'godrej-mini-refrigerator',
        sku: 'REF-004',
        price: 8999.99,
        stock: 25,
        category_id: 301,
        status: true,
        brand_id: brandNameToId['Godrej'],
        photo: 'products/homeAppliance.jpg',
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        id: 5,
        name: 'Haier Side by Side Refrigerator',
        description: '570L Side by Side',
        slug: 'haier-side-by-side-refrigerator',
        sku: 'REF-005',
        price: 49999.99,
        stock: 8,
        category_id: 301,
        status: true,
        brand_id: brandNameToId['Haier'],
        photo: 'products/homeAppliance.jpg',
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        id: 6,
        name: 'Panasonic Inverter Refrigerator',
        description: '307L Inverter Refrigerator',
        slug: 'panasonic-inverter-refrigerator',
        sku: 'REF-006',
        price: 21999.99,
        stock: 12,
        category_id: 301,
        status: true,
        brand_id: brandNameToId['Panasonic'],
        photo: 'products/homeAppliance.jpg',
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        id: 7,
        name: 'Bosch Bottom Freezer Refrigerator',
        description: '350L Bottom Freezer',
        slug: 'bosch-bottom-freezer-refrigerator',
        sku: 'REF-007',
        price: 32999.99,
        stock: 9,
        category_id: 301,
        status: true,
        brand_id: brandNameToId['Bosch'],
        photo: 'products/homeAppliance.jpg',
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        id: 8,
        name: 'Hitachi French Door Refrigerator',
        description: '456L French Door',
        slug: 'hitachi-french-door-refrigerator',
        sku: 'REF-008',
        price: 55999.99,
        stock: 7,
        category_id: 301,
        status: true,
        brand_id: brandNameToId['Hitachi'],
        photo: 'products/homeAppliance.jpg',
        created_at: new Date(),
        updated_at: new Date()
      },
      // Washing Machines (category_id: 302)
      {
        id: 9,
        name: 'LG Front Load Washing Machine',
        description: '6kg Inverter Front Load',
        slug: 'lg-front-load-washing-machine',
        sku: 'WM-001',
        price: 22999.99,
        stock: 12,
        category_id: 302,
        status: true,
        brand_id: brandNameToId['LG'],
        photo: 'products/homeAppliance.jpg',
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        id: 10,
        name: 'Samsung Top Load Washing Machine',
        description: '7kg Top Load',
        slug: 'samsung-top-load-washing-machine',
        sku: 'WM-002',
        price: 17999.99,
        stock: 18,
        category_id: 302,
        status: true,
        brand_id: brandNameToId['Samsung'],
        photo: 'products/homeAppliance.jpg',
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        id: 11,
        name: 'Whirlpool Semi Automatic Washing Machine',
        description: '7.5kg Semi Automatic',
        slug: 'whirlpool-semi-automatic-washing-machine',
        sku: 'WM-003',
        price: 12999.99,
        stock: 20,
        category_id: 302,
        status: true,
        brand_id: brandNameToId['Whirlpool'],
        photo: 'products/homeAppliance.jpg',
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        id: 12,
        name: 'Bosch Fully Automatic Washing Machine',
        description: '8kg Fully Automatic',
        slug: 'bosch-fully-automatic-washing-machine',
        sku: 'WM-004',
        price: 25999.99,
        stock: 10,
        category_id: 302,
        status: true,
        brand_id: brandNameToId['Bosch'],
        photo: 'products/homeAppliance.jpg',
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        id: 13,
        name: 'IFB Top Load Washing Machine',
        description: '6.5kg Top Load',
        slug: 'ifb-top-load-washing-machine',
        sku: 'WM-005',
        price: 15999.99,
        stock: 14,
        category_id: 302,
        status: true,
        brand_id: brandNameToId['IFB'],
        photo: 'products/homeAppliance.jpg',
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        id: 14,
        name: 'Panasonic Fully Automatic Washing Machine',
        description: '7kg Fully Automatic',
        slug: 'panasonic-fully-automatic-washing-machine',
        sku: 'WM-006',
        price: 18999.99,
        stock: 11,
        category_id: 302,
        status: true,
        brand_id: brandNameToId['Panasonic'],
        photo: 'products/homeAppliance.jpg',
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        id: 15,
        name: 'Godrej Semi Automatic Washing Machine',
        description: '6kg Semi Automatic',
        slug: 'godrej-semi-automatic-washing-machine',
        sku: 'WM-007',
        price: 10999.99,
        stock: 13,
        category_id: 302,
        status: true,
        brand_id: brandNameToId['Godrej'],
        photo: 'products/homeAppliance.jpg',
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        id: 16,
        name: 'Haier Top Load Washing Machine',
        description: '7.5kg Top Load',
        slug: 'haier-top-load-washing-machine',
        sku: 'WM-008',
        price: 16999.99,
        stock: 10,
        category_id: 302,
        status: true,
        brand_id: brandNameToId['Haier'],
        photo: 'products/homeAppliance.jpg',
        created_at: new Date(),
        updated_at: new Date()
      },
      // Air Conditioners & Coolers (category_id: 303)
      {
        id: 17,
        name: 'LG Split AC',
        description: '1.5 Ton 5 Star Split AC',
        slug: 'lg-split-ac',
        sku: 'AC-001',
        price: 34999.99,
        stock: 10,
        category_id: 303,
        status: true,
        brand_id: brandNameToId['LG'],
        photo: 'products/homeAppliance.jpg',
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        id: 18,
        name: 'Voltas Window AC',
        description: '1.5 Ton 3 Star Window AC',
        slug: 'voltas-window-ac',
        sku: 'AC-002',
        price: 25999.99,
        stock: 8,
        category_id: 303,
        status: true,
        brand_id: brandNameToId['Voltas'],
        photo: 'products/homeAppliance.jpg',
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        id: 19,
        name: 'Blue Star Tower AC',
        description: '2 Ton Tower AC',
        slug: 'blue-star-tower-ac',
        sku: 'AC-003',
        price: 49999.99,
        stock: 5,
        category_id: 303,
        status: true,
        brand_id: brandNameToId['Blue Star'],
        photo: 'products/homeAppliance.jpg',
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        id: 20,
        name: 'Symphony Air Cooler',
        description: '70L Desert Air Cooler',
        slug: 'symphony-air-cooler',
        sku: 'AC-004',
        price: 8999.99,
        stock: 20,
        category_id: 303,
        status: true,
        brand_id: brandNameToId['Symphony'],
        photo: 'products/homeAppliance.jpg',
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        id: 21,
        name: 'Crompton Personal Cooler',
        description: '20L Personal Air Cooler',
        slug: 'crompton-personal-cooler',
        sku: 'AC-005',
        price: 5999.99,
        stock: 25,
        category_id: 303,
        status: true,
        brand_id: brandNameToId['Crompton'],
        photo: 'products/homeAppliance.jpg',
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        id: 22,
        name: 'Daikin Inverter Split AC',
        description: '1.8 Ton Inverter Split AC',
        slug: 'daikin-inverter-split-ac',
        sku: 'AC-006',
        price: 42999.99,
        stock: 7,
        category_id: 303,
        status: true,
        brand_id: brandNameToId['Daikin'],
        photo: 'products/homeAppliance.jpg',
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        id: 23,
        name: 'Hitachi Window AC',
        description: '1.5 Ton Window AC',
        slug: 'hitachi-window-ac',
        sku: 'AC-007',
        price: 28999.99,
        stock: 9,
        category_id: 303,
        status: true,
        brand_id: brandNameToId['Hitachi'],
        photo: 'products/homeAppliance.jpg',
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        id: 24,
        name: 'Kenstar Tower Cooler',
        description: '40L Tower Air Cooler',
        slug: 'kenstar-tower-cooler',
        sku: 'AC-008',
        price: 7999.99,
        stock: 11,
        category_id: 303,
        status: true,
        brand_id: brandNameToId['Kenstar'],
        photo: 'products/homeAppliance.jpg',
        created_at: new Date(),
        updated_at: new Date()
      },
      // Kitchen Appliances (category_id: 304)
      {
        id: 25,
        name: 'Preethi Mixer Grinder',
        description: '750W Mixer Grinder',
        slug: 'preethi-mixer-grinder',
        sku: 'KA-001',
        price: 4999.99,
        stock: 30,
        category_id: 304,
        status: true,
        brand_id: brandNameToId['Preethi'],
        photo: 'products/homeAppliance.jpg',
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        id: 26,
        name: 'Philips Air Fryer',
        description: 'Rapid Air Technology',
        slug: 'philips-air-fryer',
        sku: 'KA-002',
        price: 7999.99,
        stock: 18,
        category_id: 304,
        status: true,
        brand_id: brandNameToId['Philips'],
        photo: 'products/homeAppliance.jpg',
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        id: 27,
        name: 'Bajaj Electric Kettle',
        description: '1.5L Electric Kettle',
        slug: 'bajaj-electric-kettle',
        sku: 'KA-003',
        price: 1999.99,
        stock: 22,
        category_id: 304,
        status: true,
        brand_id: brandNameToId['Bajaj'],
        photo: 'products/homeAppliance.jpg',
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        id: 28,
        name: 'Prestige Induction Cooktop',
        description: '2000W Induction Cooktop',
        slug: 'prestige-induction-cooktop',
        sku: 'KA-004',
        price: 3499.99,
        stock: 16,
        category_id: 304,
        status: true,
        brand_id: brandNameToId['Prestige'],
        photo: 'products/homeAppliance.jpg',
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        id: 29,
        name: 'Morphy Richards OTG',
        description: '28L Oven Toaster Grill',
        slug: 'morphy-richards-otg',
        sku: 'KA-005',
        price: 8999.99,
        stock: 10,
        category_id: 304,
        status: true,
        brand_id: brandNameToId['Morphy Richards'],
        photo: 'products/homeAppliance.jpg',
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        id: 30,
        name: 'Butterfly Wet Grinder',
        description: '2L Wet Grinder',
        slug: 'butterfly-wet-grinder',
        sku: 'KA-006',
        price: 5999.99,
        stock: 14,
        category_id: 304,
        status: true,
        brand_id: brandNameToId['Butterfly'],
        photo: 'products/homeAppliance.jpg',
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        id: 31,
        name: 'Sujata Juicer Mixer',
        description: '900W Juicer Mixer',
        slug: 'sujata-juicer-mixer',
        sku: 'KA-007',
        price: 6499.99,
        stock: 12,
        category_id: 304,
        status: true,
        brand_id: brandNameToId['Sujata'],
        photo: 'products/homeAppliance.jpg',
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        id: 32,
        name: 'Kent Water Purifier',
        description: 'RO+UV+UF Water Purifier',
        slug: 'kent-water-purifier',
        sku: 'KA-008',
        price: 11999.99,
        stock: 9,
        category_id: 304,
        status: true,
        brand_id: brandNameToId['Kent'],
        photo: 'products/homeAppliance.jpg',
        created_at: new Date(),
        updated_at: new Date()
      },
      // Televisions (category_id: 305)
      {
        id: 33,
        name: 'Sony Bravia 4K TV',
        description: '55 inch Ultra HD Smart TV',
        slug: 'sony-bravia-4k-tv',
        sku: 'TV-001',
        price: 59999.99,
        stock: 7,
        category_id: 305,
        status: true,
        brand_id: brandNameToId['Sony'],
        photo: 'products/homeAppliance.jpg',
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        id: 34,
        name: 'Samsung Crystal UHD TV',
        description: '50 inch 4K Smart TV',
        slug: 'samsung-crystal-uhd-tv',
        sku: 'TV-002',
        price: 44999.99,
        stock: 9,
        category_id: 305,
        status: true,
        brand_id: brandNameToId['Samsung'],
        photo: 'products/homeAppliance.jpg',
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        id: 35,
        name: 'LG OLED TV',
        description: '48 inch OLED Smart TV',
        slug: 'lg-oled-tv',
        sku: 'TV-003',
        price: 79999.99,
        stock: 5,
        category_id: 305,
        status: true,
        brand_id: brandNameToId['LG'],
        photo: 'products/homeAppliance.jpg',
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        id: 36,
        name: 'TCL Android TV',
        description: '43 inch Full HD Android TV',
        slug: 'tcl-android-tv',
        sku: 'TV-004',
        price: 29999.99,
        stock: 12,
        category_id: 305,
        status: true,
        brand_id: brandNameToId['TCL'],
        photo: 'products/homeAppliance.jpg',
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        id: 37,
        name: 'OnePlus Q1 Series TV',
        description: '55 inch QLED TV',
        slug: 'oneplus-q1-series-tv',
        sku: 'TV-005',
        price: 69999.99,
        stock: 6,
        category_id: 305,
        status: true,
        brand_id: brandNameToId['OnePlus'],
        photo: 'products/homeAppliance.jpg',
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        id: 38,
        name: 'Panasonic 4K Smart TV',
        description: '65 inch 4K Smart TV',
        slug: 'panasonic-4k-smart-tv',
        sku: 'TV-006',
        price: 74999.99,
        stock: 8,
        category_id: 305,
        status: true,
        brand_id: brandNameToId['Panasonic'],
        photo: 'products/homeAppliance.jpg',
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        id: 39,
        name: 'Vu Premium Android TV',
        description: '43 inch Android TV',
        slug: 'vu-premium-android-tv',
        sku: 'TV-007',
        price: 25999.99,
        stock: 10,
        category_id: 305,
        status: true,
        brand_id: brandNameToId['Vu'],
        photo: 'products/homeAppliance.jpg',
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        id: 40,
        name: 'Mi 4A Pro TV',
        description: '32 inch HD Ready Smart TV',
        slug: 'mi-4a-pro-tv',
        sku: 'TV-008',
        price: 15999.99,
        stock: 15,
        category_id: 305,
        status: true,
        brand_id: brandNameToId['Mi'],
        photo: 'products/homeAppliance.jpg',
        created_at: new Date(),
        updated_at: new Date()
      },
      // Fans & Other appliances (category_id: 306)
      {
        id: 41,
        name: 'Havells Ceiling Fan',
        description: '1200mm Energy Saving Fan',
        slug: 'havells-ceiling-fan',
        sku: 'FAN-001',
        price: 2499.99,
        stock: 30,
        category_id: 306,
        status: true,
        brand_id: brandNameToId['Havells'],
        photo: 'products/homeAppliance.jpg',
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        id: 42,
        name: 'Usha Table Fan',
        description: '400mm Table Fan',
        slug: 'usha-table-fan',
        sku: 'FAN-002',
        price: 1599.99,
        stock: 18,
        category_id: 306,
        status: true,
        brand_id: brandNameToId['Usha'],
        photo: 'products/homeAppliance.jpg',
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        id: 43,
        name: 'Bajaj Pedestal Fan',
        description: 'High Speed Pedestal Fan',
        slug: 'bajaj-pedestal-fan',
        sku: 'FAN-003',
        price: 1999.99,
        stock: 22,
        category_id: 306,
        status: true,
        brand_id: brandNameToId['Bajaj'],
        photo: 'products/homeAppliance.jpg',
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        id: 44,
        name: 'Orient Wall Fan',
        description: '400mm Wall Fan',
        slug: 'orient-wall-fan',
        sku: 'FAN-004',
        price: 1799.99,
        stock: 15,
        category_id: 306,
        status: true,
        brand_id: brandNameToId['Orient'],
        photo: 'products/homeAppliance.jpg',
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        id: 45,
        name: 'Crompton Exhaust Fan',
        description: '250mm Exhaust Fan',
        slug: 'crompton-exhaust-fan',
        sku: 'FAN-005',
        price: 1299.99,
        stock: 20,
        category_id: 306,
        status: true,
        brand_id: brandNameToId['Crompton'],
        photo: 'products/homeAppliance.jpg',
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        id: 46,
        name: 'V-Guard Pedestal Fan',
        description: 'High Speed Pedestal Fan',
        slug: 'v-guard-pedestal-fan',
        sku: 'FAN-006',
        price: 2199.99,
        stock: 13,
        category_id: 306,
        status: true,
        brand_id: brandNameToId['V-Guard'],
        photo: 'products/homeAppliance.jpg',
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        id: 47,
        name: 'Khaitan Table Fan',
        description: '300mm Table Fan',
        slug: 'khaitan-table-fan',
        sku: 'FAN-007',
        price: 1399.99,
        stock: 17,
        category_id: 306,
        status: true,
        brand_id: brandNameToId['Khaitan'],
        photo: 'products/homeAppliance.jpg',
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        id: 48,
        name: 'Polycab Ceiling Fan',
        description: '1200mm Decorative Fan',
        slug: 'polycab-ceiling-fan',
        sku: 'FAN-008',
        price: 2699.99,
        stock: 11,
        category_id: 306,
        status: true,
        brand_id: brandNameToId['Polycab'],
        photo: 'products/homeAppliance.jpg',
        created_at: new Date(),
        updated_at: new Date()
      },
      // Tops
      {
        id: 50,
        name: 'Cotton T-Shirt',
        description: 'Comfortable cotton t-shirt for everyday wear',
        slug: 'cotton-tshirt',
        sku: 'CT-001',
        price: 960.00,
        stock: 100,
        category_id: 101, // Tops
        brand_id: brandId,
        status: true,
        photo: 'products/TShirt.png',
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        id: 51,
        name: 'Sports T-Shirt',
        description: 'Moisture-wicking sports t-shirt for active lifestyle',
        slug: 'sports-tshirt',
        sku: 'ST-001',
        price: 800.00,
        stock: 80,
        category_id: 101, // Tops
        brand_id: brandId,
        status: true,
        photo: 'products/TShirt.png',
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        id: 52,
        name: 'Graphic Print T-Shirt',
        description: 'Stylish t-shirt with unique graphic print',
        slug: 'graphic-tshirt',
        sku: 'GT-001',
        price: 1040.00,
        stock: 60,
        category_id: 101, // Tops
        brand_id: brandId,
        status: true,
        photo: 'products/TShirt.png',
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        id: 53,
        name: 'V-Neck Casual Tee',
        description: 'Comfortable V-neck tee for casual occasions',
        slug: 'vneck-tee',
        sku: 'VT-001',
        price: 720.00,
        stock: 90,
        category_id: 101, // Tops
        brand_id: brandId,
        status: true,
        photo: 'products/TShirt.png',
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        id: 54,
        name: 'Polo Shirt',
        description: 'Classic polo shirt for smart casual look',
        slug: 'polo-shirt',
        sku: 'PS-001',
        price: 1440.00,
        stock: 70,
        category_id: 101, // Tops
        brand_id: brandId,
        status: true,
        photo: 'products/TShirt.png',
        created_at: new Date(),
        updated_at: new Date()
      },

      // Bottoms Products (category_id: 102)
      {
        id: 55,
        name: 'Slim Fit Denim Jeans',
        description: 'Classic denim jeans with slim fit',
        slug: 'slim-fit-jeans',
        sku: 'SFJ-001',
        price: 1600.00,
        stock: 80,
        category_id: 102, // Bottoms
        brand_id: brandId,
        status: true,
        photo: 'products/FormalTrouser.jpg',
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        id: 56,
        name: 'Comfortable Track Pants',
        description: 'Soft and comfortable track pants',
        slug: 'track-pants',
        sku: 'TP-001',
        price: 1200.00,
        stock: 90,
        category_id: 102, // Bottoms
        brand_id: brandId,
        status: true,
        photo: 'products/FormalTrouser.jpg',
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        id: 57,
        name: 'Cargo Shorts',
        description: 'Durable cargo shorts with multiple pockets',
        slug: 'cargo-shorts',
        sku: 'CS-001',
        price: 880.00,
        stock: 70,
        category_id: 102, // Bottoms
        brand_id: brandId,
        status: true,
        photo: 'products/FormalTrouser.jpg',
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        id: 58,
        name: 'Chinos',
        description: 'Versatile chinos for smart casual look',
        slug: 'chinos',
        sku: 'CH-001',
        price: 1520.00,
        stock: 60,
        category_id: 102, // Bottoms
        brand_id: brandId,
        status: true,
        photo: 'products/FormalTrouser.jpg',
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        id: 59,
        name: 'Formal Trousers',
        description: 'Elegant formal trousers for business',
        slug: 'formal-trousers',
        sku: 'FT-001',
        price: 1760.00,
        stock: 50,
        category_id: 102, // Bottoms
        brand_id: brandId,
        status: true,
        photo: 'products/FormalTrouser.jpg',
        created_at: new Date(),
        updated_at: new Date()
      },

      // Footwear Products (category_id: 103)
      {
        id: 60,
        name: 'Men\'s Casual Sneakers',
        description: 'Comfortable and stylish casual sneakers',
        slug: 'mens-casual-sneakers',
        sku: 'MCS-001',
        price: 2000.00,
        stock: 100,
        category_id: 103, // Footwear
        brand_id: brandId,
        status: true,
        photo: 'products/MensCasualSneakers.png',
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        id: 61,
        name: 'Formal Leather Shoes',
        description: 'Elegant leather shoes for formal occasions',
        slug: 'formal-leather-shoes',
        sku: 'FLS-001',
        price: 3200.00,
        stock: 60,
        category_id: 103, // Footwear
        brand_id: brandId,
        status: true,
        photo: 'products/MensCasualSneakers.png',
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        id: 62,
        name: 'Running Sports Shoes',
        description: 'Lightweight running shoes for athletes',
        slug: 'running-shoes',
        sku: 'RS-001',
        price: 2400.00,
        stock: 75,
        category_id: 103, // Footwear
        brand_id: brandId,
        status: true,
        photo: 'products/MensCasualSneakers.png',
        created_at: new Date(),
        updated_at: new Date()
      },

      // Accessories Products (category_id: 104)
      {
        id: 63,
        name: 'Leather Wallet',
        description: 'Stylish and durable leather wallet',
        slug: 'leather-wallet',
        sku: 'LW-001',
        price: 960.00,
        stock: 120,
        category_id: 104, // Accessories
        brand_id: brandId,
        status: true,
        photo: 'products/AviatorSunglasses.jpg',
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        id: 64,
        name: 'Men\'s Watch',
        description: 'Classic analog watch for men',
        slug: 'mens-watch',
        sku: 'MW-001',
        price: 2400.00,
        stock: 80,
        category_id: 104, // Accessories
        brand_id: brandId,
        status: true,
        photo: 'products/AviatorSunglasses.jpg',
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        id: 65,
        name: 'Aviator Sunglasses',
        description: 'Classic aviator sunglasses with UV protection',
        slug: 'aviator-sunglasses',
        sku: 'AS-001',
        price: 1200.00,
        stock: 90,
        category_id: 104, // Accessories
        brand_id: brandId,
        status: true,
        photo: 'products/AviatorSunglasses.jpg',
        created_at: new Date(),
        updated_at: new Date()
      },

      // Outerwear Products (category_id: 105)
      {
        id: 66,
        name: 'Stylish Winter Jacket',
        description: 'Warm and stylish winter jacket',
        slug: 'winter-jacket',
        sku: 'WJ-001',
        price: 4000.00,
        stock: 45,
        category_id: 105, // Outerwear
        brand_id: brandId,
        status: true,
        photo: 'products/ClassicDenimJacket.jpg',
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        id: 67,
        name: 'Classic Denim Jacket',
        description: 'Timeless denim jacket for casual wear',
        slug: 'denim-jacket',
        sku: 'DJ-001',
        price: 2800.00,
        stock: 70,
        category_id: 105, // Outerwear
        brand_id: brandId,
        status: true,
        photo: 'products/ClassicDenimJacket.jpg',
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        id: 68,
        name: 'Leather Biker Jacket',
        description: 'Edgy leather biker jacket',
        slug: 'biker-jacket',
        sku: 'BJ-001',
        price: 6400.00,
        stock: 25,
        category_id: 105, // Outerwear
        brand_id: brandId,
        status: true,
        photo: 'products/ClassicDenimJacket.jpg',
        created_at: new Date(),
        updated_at: new Date()
      },

      // Suits & Formals Products (category_id: 106)
      {
        id: 69,
        name: 'Navy Blue Business Suit',
        description: 'Premium quality navy blue business suit',
        slug: 'navy-business-suit',
        sku: 'NBS-001',
        price: 6400.00,
        stock: 30,
        category_id: 106, // Suits & Formals
        brand_id: brandId,
        status: true,
        photo: 'products/ThreePieceSuit.jpg',
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        id: 70,
        name: 'Formal White Shirt',
        description: 'Crisp white formal shirt',
        slug: 'formal-white-shirt',
        sku: 'FWS-001',
        price: 1440.00,
        stock: 85,
        category_id: 106, // Suits & Formals
        brand_id: brandId,
        status: true,
        photo: 'products/ThreePieceSuit.jpg',
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        id: 71,
        name: 'Black Tuxedo',
        description: 'Elegant black tuxedo for special events',
        slug: 'black-tuxedo',
        sku: 'BT-001',
        price: 9600.00,
        stock: 20,
        category_id: 106, // Suits & Formals
        brand_id: brandId,
        status: true,
        photo: 'products/ThreePieceSuit.jpg',
        created_at: new Date(),
        updated_at: new Date()
      },

      // Underwear & Loungewear Products (category_id: 107)
      {
        id: 72,
        name: 'Cotton Boxer Briefs',
        description: 'Comfortable cotton boxer briefs',
        slug: 'cotton-boxer-briefs',
        sku: 'CBB-001',
        price: 599.00,
        stock: 200,
        category_id: 107, // Underwear & Loungewear
        brand_id: brandId,
        status: true,
        photo: 'products/TerryRobe.jpg',
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        id: 73,
        name: 'Silk Pajamas',
        description: 'Luxurious silk pajamas for comfortable sleep',
        slug: 'silk-pajamas',
        sku: 'SP-001',
        price: 2000.00,
        stock: 50,
        category_id: 107, // Underwear & Loungewear
        brand_id: brandId,
        status: true,
        photo: 'products/TerryRobe.jpg',
        created_at: new Date(),
        updated_at: new Date()
      },

      // New Arrivals Products (category_id: 108)
      {
        id: 74,
        name: 'Hooded Sweatshirt',
        description: 'Warm hooded sweatshirt for cooler days',
        slug: 'hooded-sweatshirt',
        sku: 'HS-001',
        price: 2000.00,
        stock: 50,
        category_id: 108, // New Arrivals
        brand_id: brandId,
        status: true,
        photo: 'products/JerseyLoungePants.jpg',
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        id: 75,
        name: 'Running Top',
        description: 'Lightweight performance top for running',
        slug: 'running-top',
        sku: 'RT-001',
        price: 880.00,
        stock: 75,
        category_id: 108, // New Arrivals
        brand_id: brandId,
        status: true,
        photo: 'products/JerseyLoungePants.jpg',
        created_at: new Date(),
        updated_at: new Date()
      },

      // Seasonal Collections Products (category_id: 109)
      {
        id: 76,
        name: 'Holiday Sweater',
        description: 'Festive sweater for the holiday season',
        slug: 'holiday-sweater',
        sku: 'HS-002',
        price: 1440.00,
        stock: 40,
        category_id: 109, // Seasonal Collections
        brand_id: brandId,
        status: true,
        photo: 'products/SummerCollectionTShirt.jpg',
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        id: 77,
        name: 'Beach Shorts',
        description: 'Quick-dry beach shorts for summer',
        slug: 'beach-shorts',
        sku: 'BS-001',
        price: 800.00,
        stock: 60,
        category_id: 109, // Seasonal Collections
        brand_id: brandId,
        status: true,
        photo: 'products/SummerCollectionTShirt.jpg',
        created_at: new Date(),
        updated_at: new Date()
      }
    ]);

    // Then, create product variations
    // Product variations for ALL Mens Wear seed data (Tops, Bottoms, Footwear, Accessories, Outerwear, New Arrivals, Seasonal Collections)
    await queryInterface.bulkInsert('product_variations', [
      // Tops (category_id: 101)
      // Cotton T-Shirt (id: 50)
      { product_id: 50, sku: 'CT-001-S-White', price: 960.00, stock: 25, attributes: JSON.stringify({ size: 'S', color: 'White' }), status: true, created_at: new Date(), updated_at: new Date() },
      { product_id: 50, sku: 'CT-001-M-Black', price: 960.00, stock: 35, attributes: JSON.stringify({ size: 'M', color: 'Black' }), status: true, created_at: new Date(), updated_at: new Date() },
      { product_id: 50, sku: 'CT-001-L-Blue', price: 960.00, stock: 40, attributes: JSON.stringify({ size: 'L', color: 'Blue' }), status: true, created_at: new Date(), updated_at: new Date() },

      // Sports T-Shirt (id: 51)
      { product_id: 51, sku: 'ST-001-S-Grey', price: 800.00, stock: 20, attributes: JSON.stringify({ size: 'S', color: 'Grey' }), status: true, created_at: new Date(), updated_at: new Date() },
      { product_id: 51, sku: 'ST-001-M-Blue', price: 800.00, stock: 30, attributes: JSON.stringify({ size: 'M', color: 'Blue' }), status: true, created_at: new Date(), updated_at: new Date() },
      { product_id: 51, sku: 'ST-001-L-Black', price: 800.00, stock: 30, attributes: JSON.stringify({ size: 'L', color: 'Black' }), status: true, created_at: new Date(), updated_at: new Date() },

      // Graphic Print T-Shirt (id: 52)
      { product_id: 52, sku: 'GT-001-M-White', price: 1040.00, stock: 20, attributes: JSON.stringify({ size: 'M', color: 'White' }), status: true, created_at: new Date(), updated_at: new Date() },
      { product_id: 52, sku: 'GT-001-L-Black', price: 1040.00, stock: 20, attributes: JSON.stringify({ size: 'L', color: 'Black' }), status: true, created_at: new Date(), updated_at: new Date() },
      { product_id: 52, sku: 'GT-001-XL-Red', price: 1040.00, stock: 20, attributes: JSON.stringify({ size: 'XL', color: 'Red' }), status: true, created_at: new Date(), updated_at: new Date() },

      // V-Neck Casual Tee (id: 53)
      { product_id: 53, sku: 'VT-001-S-Green', price: 720.00, stock: 30, attributes: JSON.stringify({ size: 'S', color: 'Green' }), status: true, created_at: new Date(), updated_at: new Date() },
      { product_id: 53, sku: 'VT-001-M-Blue', price: 720.00, stock: 30, attributes: JSON.stringify({ size: 'M', color: 'Blue' }), status: true, created_at: new Date(), updated_at: new Date() },
      { product_id: 53, sku: 'VT-001-L-Black', price: 720.00, stock: 30, attributes: JSON.stringify({ size: 'L', color: 'Black' }), status: true, created_at: new Date(), updated_at: new Date() },

      // Polo Shirt (id: 54)
      { product_id: 54, sku: 'PS-001-M-Navy', price: 1200.00, stock: 20, attributes: JSON.stringify({ size: 'M', color: 'Navy' }), status: true, created_at: new Date(), updated_at: new Date() },
      { product_id: 54, sku: 'PS-001-L-White', price: 1200.00, stock: 20, attributes: JSON.stringify({ size: 'L', color: 'White' }), status: true, created_at: new Date(), updated_at: new Date() },

      // Hooded Sweatshirt (id: 55)
      { product_id: 55, sku: 'HS-001-M-Grey', price: 1600.00, stock: 15, attributes: JSON.stringify({ size: 'M', color: 'Grey' }), status: true, created_at: new Date(), updated_at: new Date() },
      { product_id: 55, sku: 'HS-001-L-Black', price: 1600.00, stock: 15, attributes: JSON.stringify({ size: 'L', color: 'Black' }), status: true, created_at: new Date(), updated_at: new Date() },

      // Long Sleeve Henley (id: 72)
      { product_id: 72, sku: 'LSH-001-M-White', price: 1200.00, stock: 10, attributes: JSON.stringify({ size: 'M', color: 'White' }), status: true, created_at: new Date(), updated_at: new Date() },
      { product_id: 72, sku: 'LSH-001-L-Grey', price: 1200.00, stock: 10, attributes: JSON.stringify({ size: 'L', color: 'Grey' }), status: true, created_at: new Date(), updated_at: new Date() },

      // Running Top (id: 75)
      { product_id: 75, sku: 'RT-001-M-Blue', price: 880.00, stock: 25, attributes: JSON.stringify({ size: 'M', color: 'Blue' }), status: true, created_at: new Date(), updated_at: new Date() },
      { product_id: 75, sku: 'RT-001-L-Black', price: 880.00, stock: 25, attributes: JSON.stringify({ size: 'L', color: 'Black' }), status: true, created_at: new Date(), updated_at: new Date() },

      // Flannel Shirt (id: 73)
      { product_id: 73, sku: 'FS-001-M-Red', price: 1440.00, stock: 10, attributes: JSON.stringify({ size: 'M', color: 'Red' }), status: true, created_at: new Date(), updated_at: new Date() },
      { product_id: 73, sku: 'FS-001-L-Green', price: 1440.00, stock: 10, attributes: JSON.stringify({ size: 'L', color: 'Green' }), status: true, created_at: new Date(), updated_at: new Date() },

      // Check Shirt (id: 74)
      { product_id: 74, sku: 'CS-001-M-Blue', price: 1200.00, stock: 10, attributes: JSON.stringify({ size: 'M', color: 'Blue' }), status: true, created_at: new Date(), updated_at: new Date() },
      { product_id: 74, sku: 'CS-001-L-Red', price: 1200.00, stock: 10, attributes: JSON.stringify({ size: 'L', color: 'Red' }), status: true, created_at: new Date(), updated_at: new Date() },

      // Denim Shirt (id: 70)
      { product_id: 70, sku: 'DS-001-M-Blue', price: 1600.00, stock: 10, attributes: JSON.stringify({ size: 'M', color: 'Blue' }), status: true, created_at: new Date(), updated_at: new Date() },
      { product_id: 70, sku: 'DS-001-L-Black', price: 1600.00, stock: 10, attributes: JSON.stringify({ size: 'L', color: 'Black' }), status: true, created_at: new Date(), updated_at: new Date() },

      // Printed Shirt (id: 71)
      { product_id: 71, sku: 'PRS-001-M-White', price: 1360.00, stock: 10, attributes: JSON.stringify({ size: 'M', color: 'White' }), status: true, created_at: new Date(), updated_at: new Date() },
      { product_id: 71, sku: 'PRS-001-L-Blue', price: 1360.00, stock: 10, attributes: JSON.stringify({ size: 'L', color: 'Blue' }), status: true, created_at: new Date(), updated_at: new Date() },

      // Linen Shirt (id: 69)
      { product_id: 69, sku: 'LS-001-M-Beige', price: 1760.00, stock: 10, attributes: JSON.stringify({ size: 'M', color: 'Beige' }), status: true, created_at: new Date(), updated_at: new Date() },
      { product_id: 69, sku: 'LS-001-L-White', price: 1760.00, stock: 10, attributes: JSON.stringify({ size: 'L', color: 'White' }), status: true, created_at: new Date(), updated_at: new Date() },

      // Cuban Collar Shirt (id: 68)
      { product_id: 68, sku: 'CCS-001-M-Green', price: 1520.00, stock: 10, attributes: JSON.stringify({ size: 'M', color: 'Green' }), status: true, created_at: new Date(), updated_at: new Date() },
      { product_id: 68, sku: 'CCS-001-L-Blue', price: 1520.00, stock: 10, attributes: JSON.stringify({ size: 'L', color: 'Blue' }), status: true, created_at: new Date(), updated_at: new Date() },

      // Bottoms (category_id: 102)
      // Jeans (id: 56)
      { product_id: 56, sku: 'JNS-001-30-Blue', price: 1760.00, stock: 20, attributes: JSON.stringify({ waist: '30', color: 'Blue' }), status: true, created_at: new Date(), updated_at: new Date() },
      { product_id: 56, sku: 'JNS-001-32-Black', price: 1760.00, stock: 20, attributes: JSON.stringify({ waist: '32', color: 'Black' }), status: true, created_at: new Date(), updated_at: new Date() },
      { product_id: 56, sku: 'JNS-001-34-Grey', price: 1760.00, stock: 20, attributes: JSON.stringify({ waist: '34', color: 'Grey' }), status: true, created_at: new Date(), updated_at: new Date() },

      // Chinos (id: 58)
      { product_id: 58, sku: 'CH-001-32-Khaki', price: 1520.00, stock: 20, attributes: JSON.stringify({ waist: '32', color: 'Khaki' }), status: true, created_at: new Date(), updated_at: new Date() },
      { product_id: 58, sku: 'CH-001-34-Navy', price: 1520.00, stock: 20, attributes: JSON.stringify({ waist: '34', color: 'Navy' }), status: true, created_at: new Date(), updated_at: new Date() },

      // Formal Trousers (id: 59)
      { product_id: 59, sku: 'FT-001-32-Grey', price: 1760.00, stock: 15, attributes: JSON.stringify({ waist: '32', color: 'Grey' }), status: true, created_at: new Date(), updated_at: new Date() },
      { product_id: 59, sku: 'FT-001-34-Black', price: 1760.00, stock: 15, attributes: JSON.stringify({ waist: '34', color: 'Black' }), status: true, created_at: new Date(), updated_at: new Date() },

      // Shorts (id: 57)
      { product_id: 57, sku: 'SH-001-M-Navy', price: 1040.00, stock: 20, attributes: JSON.stringify({ size: 'M', color: 'Navy' }), status: true, created_at: new Date(), updated_at: new Date() },
      { product_id: 57, sku: 'SH-001-L-Grey', price: 1040.00, stock: 20, attributes: JSON.stringify({ size: 'L', color: 'Grey' }), status: true, created_at: new Date(), updated_at: new Date() },

      // Footwear (category_id: 103)
      // Men's Casual Sneakers (id: 60)
      { product_id: 60, sku: 'MCS-001-8-White', price: 2000.00, stock: 30, attributes: JSON.stringify({ size: '8', color: 'White' }), status: true, created_at: new Date(), updated_at: new Date() },
      { product_id: 60, sku: 'MCS-001-9-Black', price: 2000.00, stock: 40, attributes: JSON.stringify({ size: '9', color: 'Black' }), status: true, created_at: new Date(), updated_at: new Date() },
      { product_id: 60, sku: 'MCS-001-10-Blue', price: 2000.00, stock: 30, attributes: JSON.stringify({ size: '10', color: 'Blue' }), status: true, created_at: new Date(), updated_at: new Date() },

      // Formal Leather Shoes (id: 61)
      { product_id: 61, sku: 'FLS-001-8-Brown', price: 3200.00, stock: 20, attributes: JSON.stringify({ size: '8', color: 'Brown' }), status: true, created_at: new Date(), updated_at: new Date() },
      { product_id: 61, sku: 'FLS-001-9-Black', price: 3200.00, stock: 20, attributes: JSON.stringify({ size: '9', color: 'Black' }), status: true, created_at: new Date(), updated_at: new Date() },

      // Running Sports Shoes (id: 62)
      { product_id: 62, sku: 'RS-001-8-Blue', price: 2400.00, stock: 25, attributes: JSON.stringify({ size: '8', color: 'Blue' }), status: true, created_at: new Date(), updated_at: new Date() },
      { product_id: 62, sku: 'RS-001-9-Grey', price: 2400.00, stock: 25, attributes: JSON.stringify({ size: '9', color: 'Grey' }), status: true, created_at: new Date(), updated_at: new Date() },

      // Accessories (category_id: 104)
      // Leather Wallet (id: 63)
      { product_id: 63, sku: 'LW-001-Brown', price: 960.00, stock: 60, attributes: JSON.stringify({ color: 'Brown' }), status: true, created_at: new Date(), updated_at: new Date() },
      { product_id: 63, sku: 'LW-001-Black', price: 960.00, stock: 60, attributes: JSON.stringify({ color: 'Black' }), status: true, created_at: new Date(), updated_at: new Date() },

      // Men's Watch (id: 64)
      { product_id: 64, sku: 'MW-001-Silver', price: 2400.00, stock: 40, attributes: JSON.stringify({ color: 'Silver' }), status: true, created_at: new Date(), updated_at: new Date() },
      { product_id: 64, sku: 'MW-001-Black', price: 2400.00, stock: 40, attributes: JSON.stringify({ color: 'Black' }), status: true, created_at: new Date(), updated_at: new Date() },

      // Aviator Sunglasses (id: 65)
      { product_id: 65, sku: 'AS-001-Gold', price: 1200.00, stock: 45, attributes: JSON.stringify({ color: 'Gold' }), status: true, created_at: new Date(), updated_at: new Date() },
      { product_id: 65, sku: 'AS-001-Silver', price: 1200.00, stock: 45, attributes: JSON.stringify({ color: 'Silver' }), status: true, created_at: new Date(), updated_at: new Date() },

      // Outerwear (category_id: 105)
      // Stylish Winter Jacket (id: 66)
      { product_id: 66, sku: 'WJ-001-M-Black', price: 4000.00, stock: 20, attributes: JSON.stringify({ size: 'M', color: 'Black' }), status: true, created_at: new Date(), updated_at: new Date() },
      { product_id: 66, sku: 'WJ-001-L-Navy', price: 4000.00, stock: 25, attributes: JSON.stringify({ size: 'L', color: 'Navy' }), status: true, created_at: new Date(), updated_at: new Date() },

      // Classic Denim Jacket (id: 67)
      { product_id: 67, sku: 'DJ-001-M-Blue', price: 2800.00, stock: 35, attributes: JSON.stringify({ size: 'M', color: 'Blue' }), status: true, created_at: new Date(), updated_at: new Date() },
      { product_id: 67, sku: 'DJ-001-L-Black', price: 2800.00, stock: 35, attributes: JSON.stringify({ size: 'L', color: 'Black' }), status: true, created_at: new Date(), updated_at: new Date() },

      // Leather Biker Jacket (id: 68)
      { product_id: 68, sku: 'BJ-001-M-Black', price: 6400.00, stock: 10, attributes: JSON.stringify({ size: 'M', color: 'Black' }), status: true, created_at: new Date(), updated_at: new Date() },
      { product_id: 68, sku: 'BJ-001-L-Brown', price: 6400.00, stock: 15, attributes: JSON.stringify({ size: 'L', color: 'Brown' }), status: true, created_at: new Date(), updated_at: new Date() },

      // New Arrivals (category_id: 108)
      // Hooded Sweatshirt (id: 55) - already above
      // Running Top (id: 75) - already above

      // Seasonal Collections (category_id: 109)
      // Holiday Sweater (id: 76)
      { product_id: 76, sku: 'HS-002-M-Red', price: 1440.00, stock: 20, attributes: JSON.stringify({ size: 'M', color: 'Red' }), status: true, created_at: new Date(), updated_at: new Date() },
      { product_id: 76, sku: 'HS-002-L-Green', price: 1440.00, stock: 20, attributes: JSON.stringify({ size: 'L', color: 'Green' }), status: true, created_at: new Date(), updated_at: new Date() },

      // Beach Shorts (id: 77)
      { product_id: 77, sku: 'BS-001-M-Blue', price: 800.00, stock: 30, attributes: JSON.stringify({ size: 'M', color: 'Blue' }), status: true, created_at: new Date(), updated_at: new Date() },
      { product_id: 77, sku: 'BS-001-L-Yellow', price: 800.00, stock: 30, attributes: JSON.stringify({ size: 'L', color: 'Yellow' }), status: true, created_at: new Date(), updated_at: new Date() }
    ]);
  },

  down: async (queryInterface, Sequelize) => {
    // Only delete the demo products
    await queryInterface.bulkDelete('product_variations', {
      product_id: {
        [Sequelize.Op.in]: [1, 2, 3] // Only delete the demo products
      }
    });
    await queryInterface.bulkDelete('products', {
      id: {
        [Sequelize.Op.in]: [1, 2, 3] // Only delete the demo products
      }
    });
  }
};
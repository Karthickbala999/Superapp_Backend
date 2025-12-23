'use strict';

/** @type {import('sequelize-cli').Seeder} */
module.exports = {
  up: async (queryInterface) => {
    const attributesToInsert = [];
    // Refrigerators (product_id: 1-8)
    [1,2,3,4,5,6,7,8].forEach((id, idx) => {
      attributesToInsert.push(
        { product_id: id, attribute_name: 'Capacity', attribute_value: ['300L','192L','350L','99L','570L','307L','350L','456L'][idx], created_at: new Date(), updated_at: new Date() },
        { product_id: id, attribute_name: 'Door Type', attribute_value: ['Double Door','Single Door','Bottom Freezer','Mini','Side by Side','Inverter','Bottom Freezer','French Door'][idx], created_at: new Date(), updated_at: new Date() },
        { product_id: id, attribute_name: 'Defrost Type', attribute_value: idx%2===0?'Frost Free':'Direct Cool', created_at: new Date(), updated_at: new Date() },
        { product_id: id, attribute_name: 'Color', attribute_value: ['Silver','Red','Grey','White','Black','Blue','Steel','Silver'][idx], created_at: new Date(), updated_at: new Date() },
        { product_id: id, attribute_name: 'Rating', attribute_value: (4.1+0.1*idx).toFixed(1), created_at: new Date(), updated_at: new Date() },
        { product_id: id, attribute_name: 'isBestSeller', attribute_value: idx%3===0?'true':'false', created_at: new Date(), updated_at: new Date() }
      );
    });
    // Washing Machines (product_id: 9-16)
    [9,10,11,12,13,14,15,16].forEach((id, idx) => {
      attributesToInsert.push(
        { product_id: id, attribute_name: 'Capacity', attribute_value: ['6kg','7kg','7.5kg','8kg','6.5kg','7kg','6kg','7.5kg'][idx], created_at: new Date(), updated_at: new Date() },
        { product_id: id, attribute_name: 'Type', attribute_value: ['Front Load','Top Load','Semi Automatic','Fully Automatic','Top Load','Fully Automatic','Semi Automatic','Top Load'][idx], created_at: new Date(), updated_at: new Date() },
        { product_id: id, attribute_name: 'Spin Speed', attribute_value: ['1200 RPM','1000 RPM','800 RPM','1400 RPM','1000 RPM','1200 RPM','800 RPM','1200 RPM'][idx], created_at: new Date(), updated_at: new Date() },
        { product_id: id, attribute_name: 'Color', attribute_value: ['White','Grey','Blue','Silver','Red','White','Grey','Black'][idx], created_at: new Date(), updated_at: new Date() },
        { product_id: id, attribute_name: 'Rating', attribute_value: (4.2+0.1*idx).toFixed(1), created_at: new Date(), updated_at: new Date() },
        { product_id: id, attribute_name: 'isBestSeller', attribute_value: idx%2===0?'true':'false', created_at: new Date(), updated_at: new Date() }
      );
    });
    // Air Conditioners & Coolers (product_id: 17-24)
    [17,18,19,20,21,22,23,24].forEach((id, idx) => {
      attributesToInsert.push(
        { product_id: id, attribute_name: 'Type', attribute_value: ['Split AC','Window AC','Tower AC','Desert Cooler','Personal Cooler','Split AC','Window AC','Tower Cooler'][idx], created_at: new Date(), updated_at: new Date() },
        { product_id: id, attribute_name: 'Capacity', attribute_value: ['1.5 Ton','1.5 Ton','2 Ton','70L','20L','1.8 Ton','1.5 Ton','40L'][idx], created_at: new Date(), updated_at: new Date() },
        { product_id: id, attribute_name: 'Inverter', attribute_value: idx%2===0?'Yes':'No', created_at: new Date(), updated_at: new Date() },
        { product_id: id, attribute_name: 'Power Consumption', attribute_value: ['1500W','1200W','2000W','180W','100W','1700W','1300W','110W'][idx], created_at: new Date(), updated_at: new Date() },
        { product_id: id, attribute_name: 'Rating', attribute_value: (4.0+0.1*idx).toFixed(1), created_at: new Date(), updated_at: new Date() },
        { product_id: id, attribute_name: 'isBestSeller', attribute_value: idx%4===0?'true':'false', created_at: new Date(), updated_at: new Date() }
      );
    });
    // Kitchen Appliances (product_id: 25-32)
    [25,26,27,28,29,30,31,32].forEach((id, idx) => {
      attributesToInsert.push(
        { product_id: id, attribute_name: 'Type', attribute_value: ['Mixer Grinder','Air Fryer','Kettle','Induction Cooktop','OTG','Wet Grinder','Juicer Mixer','Water Purifier'][idx], created_at: new Date(), updated_at: new Date() },
        { product_id: id, attribute_name: 'Power', attribute_value: ['750W','1400W','1500W','2000W','1600W','150W','900W','60W'][idx], created_at: new Date(), updated_at: new Date() },
        { product_id: id, attribute_name: 'Capacity', attribute_value: ['1.5L','4.1L','1.5L','2000W','28L','2L','1.5L','8L'][idx], created_at: new Date(), updated_at: new Date() },
        { product_id: id, attribute_name: 'Material', attribute_value: ['Stainless Steel','Plastic','Steel','Glass','Steel','Plastic','Steel','Plastic'][idx], created_at: new Date(), updated_at: new Date() },
        { product_id: id, attribute_name: 'Color', attribute_value: ['White','Black','Silver','Black','Red','Grey','White','Blue'][idx], created_at: new Date(), updated_at: new Date() },
        { product_id: id, attribute_name: 'Rating', attribute_value: (4.1+0.1*idx).toFixed(1), created_at: new Date(), updated_at: new Date() },
        { product_id: id, attribute_name: 'isBestSeller', attribute_value: idx%3===0?'true':'false', created_at: new Date(), updated_at: new Date() }
      );
    });
    // Televisions (product_id: 33-40)
    [33,34,35,36,37,38,39,40].forEach((id, idx) => {
      attributesToInsert.push(
        { product_id: id, attribute_name: 'Screen Size', attribute_value: ['55 inch','50 inch','48 inch','43 inch','55 inch','65 inch','43 inch','32 inch'][idx], created_at: new Date(), updated_at: new Date() },
        { product_id: id, attribute_name: 'Resolution', attribute_value: ['4K','4K','4K','Full HD','QLED','4K','Full HD','HD Ready'][idx], created_at: new Date(), updated_at: new Date() },
        { product_id: id, attribute_name: 'Smart TV', attribute_value: idx%2===0?'Yes':'No', created_at: new Date(), updated_at: new Date() },
        { product_id: id, attribute_name: 'Panel Type', attribute_value: ['OLED','LED','OLED','LED','QLED','LED','LED','LED'][idx], created_at: new Date(), updated_at: new Date() },
        { product_id: id, attribute_name: 'HDMI Ports', attribute_value: ['3','3','4','2','4','3','2','2'][idx], created_at: new Date(), updated_at: new Date() },
        { product_id: id, attribute_name: 'Rating', attribute_value: (4.3+0.1*idx).toFixed(1), created_at: new Date(), updated_at: new Date() },
        { product_id: id, attribute_name: 'isBestSeller', attribute_value: idx%2===0?'true':'false', created_at: new Date(), updated_at: new Date() }
      );
    });
    // Fans & Other appliances (product_id: 41-48)
    const fanTypes = ['Ceiling Fan','Table Fan','Pedestal Fan','Wall Fan','Exhaust Fan','Pedestal Fan','Table Fan','Vacuum Cleaner'];
    const fanPowers = ['75W','60W','80W','55W','50W','85W','65W','1200W'];
    const fanColors = ['White','Blue','Grey','Black','Silver','Red','Green','Black'];
    [41,42,43,44,45,46,47,48].forEach((id, idx) => {
      attributesToInsert.push(
        { product_id: id, attribute_name: 'Type', attribute_value: fanTypes[idx], created_at: new Date(), updated_at: new Date() },
        { product_id: id, attribute_name: 'Power', attribute_value: fanPowers[idx], created_at: new Date(), updated_at: new Date() },
        { product_id: id, attribute_name: 'Color', attribute_value: fanColors[idx], created_at: new Date(), updated_at: new Date() },
        { product_id: id, attribute_name: 'Rating', attribute_value: (4.0+0.1*idx).toFixed(1), created_at: new Date(), updated_at: new Date() },
        { product_id: id, attribute_name: 'isBestSeller', attribute_value: idx%2===0?'true':'false', created_at: new Date(), updated_at: new Date() }
      );
      if (fanTypes[idx].includes('Fan')) {
        attributesToInsert.push({ product_id: id, attribute_name: 'Sweep Size', attribute_value: ['1200mm','400mm','450mm','400mm','250mm','450mm','300mm',null][idx], created_at: new Date(), updated_at: new Date() });
        attributesToInsert.push({ product_id: id, attribute_name: 'Speed Settings', attribute_value: ['3','3','5','3','1','5','3',null][idx], created_at: new Date(), updated_at: new Date() });
      }
      if (fanTypes[idx] === 'Vacuum Cleaner') {
        attributesToInsert.push({ product_id: id, attribute_name: 'Bagless', attribute_value: 'Yes', created_at: new Date(), updated_at: new Date() });
        attributesToInsert.push({ product_id: id, attribute_name: 'Cord Length', attribute_value: '5m', created_at: new Date(), updated_at: new Date() });
      }
    });
    await queryInterface.bulkInsert('product_attributes', attributesToInsert);
  },

  down: async (queryInterface) => {
    await queryInterface.bulkDelete('product_attributes', null, {});
  }
};

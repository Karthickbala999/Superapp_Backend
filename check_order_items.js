const { sequelize } = require('./src/models');

async function checkTable() {
  try {
    const [results] = await sequelize.query('DESCRIBE order_items');
    console.log('Order Items table structure:');
    console.table(results);
  } catch (error) {
    console.error('Error:', error.message);
  } finally {
    await sequelize.close();
  }
}

checkTable(); 
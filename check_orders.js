const { sequelize } = require('./src/models');

async function checkOrders() {
  try {
    const [results] = await sequelize.query('DESCRIBE orders');
    console.log('Orders table structure:');
    console.table(results);
  } catch (error) {
    console.error('Error:', error.message);
  } finally {
    await sequelize.close();
  }
}

checkOrders(); 
const { sequelize } = require('../src/models');

async function checkColumns(table) {
  const [results] = await sequelize.query(`SHOW COLUMNS FROM \`${table}\``);
  console.log(`\nColumns in ${table}:`);
  results.forEach(col => console.log(`- ${col.Field}`));
}

(async () => {
  try {
    await checkColumns('categories');
    await checkColumns('order_items');
    await sequelize.close();
  } catch (err) {
    console.error('Error checking columns:', err);
    process.exit(1);
  }
})(); 
const { sequelize } = require('./src/models');

async function checkUsers() {
  try {
    const [results] = await sequelize.query('SELECT id, name, email FROM users LIMIT 5');
    console.log('Users in database:');
    console.table(results);
  } catch (error) {
    console.error('Error:', error.message);
  } finally {
    await sequelize.close();
  }
}

checkUsers(); 
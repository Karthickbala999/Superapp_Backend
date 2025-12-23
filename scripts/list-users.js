const { sequelize } = require('../src/models');

async function listUsers() {
  try {
    // Test connection
    await sequelize.authenticate();
    console.log('Database connection established successfully.');

    // Query all users
    const results = await sequelize.query(
      'SELECT id, name, email, role FROM users ORDER BY id;',
      { type: sequelize.QueryTypes.SELECT }
    );

    console.log('\nCurrent users in database:');
    console.log('ID | Name | Email | Role');
    console.log('---|------|-------|------');
    
    if (results.length === 0) {
      console.log('No users found in the database.');
    } else {
      results.forEach(user => {
        console.log(`${user.id} | ${user.name} | ${user.email} | ${user.role}`);
      });
    }

    console.log(`\nTotal users: ${results.length}`);
    
    // Show available IDs for booking seeder
    if (results.length > 0) {
      console.log('\nAvailable user IDs for booking seeder:');
      const ids = results.map(user => user.id);
      console.log('IDs:', ids.join(', '));
    }

  } catch (error) {
    console.error('Error listing users:', error);
  } finally {
    await sequelize.close();
    process.exit(0);
  }
}

listUsers(); 
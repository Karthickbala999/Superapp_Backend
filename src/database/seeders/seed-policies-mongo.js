const mongoose = require('mongoose');
const Policy = require('../../models/Policy');

const seedPolicies = async () => {
  try {
    console.log('Starting policies seeder...');
    
    // Clear existing policies
    await Policy.deleteMany({});
    console.log('Cleared existing policies');
    
    const policyData = [
      {
        title: 'Cancellation Policy',
        description: 'Free cancellation up to 24 hours before check-in. Late cancellations may incur charges.',
        status: true
      },
      {
        title: 'Check-in Policy',
        description: 'Check-in time is 3:00 PM. Early check-in subject to availability.',
        status: true
      },
      {
        title: 'Check-out Policy',
        description: 'Check-out time is 11:00 AM. Late check-out subject to availability and may incur charges.',
        status: true
      },
      {
        title: 'Pet Policy',
        description: 'Pets are welcome with prior arrangement. Pet fee applies. Maximum 2 pets per room.',
        status: true
      },
      {
        title: 'Smoking Policy',
        description: 'Designated smoking areas available. Smoking in rooms is strictly prohibited.',
        status: true
      },
      {
        title: 'Noise Policy',
        description: 'Quiet hours from 10:00 PM to 8:00 AM. Please respect other guests.',
        status: true
      },
      {
        title: 'Pool Policy',
        description: 'Pool hours: 6:00 AM to 10:00 PM. Children must be supervised at all times.',
        status: true
      },
      {
        title: 'Parking Policy',
        description: 'Complimentary parking available for hotel guests. Limited spaces available.',
        status: true
      },
      {
        title: 'WiFi Policy',
        description: 'Free WiFi available throughout the hotel. Premium high-speed option available for purchase.',
        status: true
      },
      {
        title: 'Room Service Policy',
        description: '24/7 room service available. Service charge applies to all orders.',
        status: true
      }
    ];
    
    const policies = await Policy.insertMany(policyData);
    console.log(`Created ${policies.length} policies`);
    
    console.log('Policies seeder completed successfully');
  } catch (error) {
    console.error('Error seeding policies:', error);
    throw error;
  }
};

// Run seeder if called directly
if (require.main === module) {
  require('dotenv').config();
  mongoose.connect(process.env.MONGODB_URI)
    .then(() => {
      console.log('Connected to MongoDB');
      return seedPolicies();
    })
    .then(() => {
      console.log('Seeding completed');
      process.exit(0);
    })
    .catch((error) => {
      console.error('Seeding failed:', error);
      process.exit(1);
    });
}

module.exports = seedPolicies; 
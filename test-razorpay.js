require('dotenv').config();
const Razorpay = require('razorpay');

console.log('🔍 Testing Razorpay Configuration...\n');

// Check environment variables
console.log('Environment Variables:');
console.log(`NODE_ENV: ${process.env.NODE_ENV || 'not set'}`);
console.log(`RAZORPAY_KEY_ID: ${process.env.RAZORPAY_KEY_ID ? 'Set' : 'Not set'}`);
console.log(`RAZORPAY_KEY_SECRET: ${process.env.RAZORPAY_KEY_SECRET ? 'Set' : 'Not set'}`);

if (!process.env.RAZORPAY_KEY_ID || !process.env.RAZORPAY_KEY_SECRET) {
  console.error('\n❌ Razorpay keys are not configured in environment variables!');
  console.log('Please set RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET in your .env file');
  process.exit(1);
}

// Test Razorpay connectivity
console.log('\n🔍 Testing Razorpay Connectivity...');

try {
  const razorpay = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET
  });

  // Test account fetch
  razorpay.accounts.fetch()
    .then(account => {
      console.log('✅ Razorpay connectivity successful!');
      console.log(`Account Name: ${account.name}`);
      console.log(`Account Email: ${account.email}`);
      console.log(`Account Type: ${account.type}`);
      
      // Test order creation with small amount
      console.log('\n🔍 Testing order creation with ₹1...');
      return razorpay.orders.create({
        amount: 100, // ₹1 in paise
        currency: 'INR',
        receipt: `TEST_${Date.now()}`,
        notes: {
          test: 'true',
          timestamp: new Date().toISOString()
        }
      });
    })
    .then(order => {
      console.log('✅ Test order created successfully!');
      console.log(`Order ID: ${order.id}`);
      console.log(`Amount: ${order.amount} paise (₹${order.amount / 100})`);
      console.log(`Status: ${order.status}`);
      
      console.log('\n🎉 All tests passed! Razorpay is configured correctly.');
    })
    .catch(error => {
      console.error('❌ Razorpay test failed:', error.message);
      if (error.error && error.error.description) {
        console.error('Error Description:', error.error.description);
      }
      if (error.error && error.error.code) {
        console.error('Error Code:', error.error.code);
      }
    });

} catch (error) {
  console.error('❌ Failed to initialize Razorpay:', error.message);
} 
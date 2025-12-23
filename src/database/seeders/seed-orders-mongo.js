const mongoose = require('mongoose');
const Order = require('../../models/Order');
const OrderItem = require('../../models/OrderItem');
const User = require('../../models/User');
const Product = require('../../models/Product');

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/superapp_db';

const seedOrders = async () => {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('Connected to MongoDB for order seeding');

    // Clear existing orders and order items
    await Order.deleteMany({});
    await OrderItem.deleteMany({});
    console.log('Cleared existing orders and order items');

    let users = await User.find().limit(2);
    let products = await Product.find().limit(3);

    console.log('Found users:', users.map(u => u.email));
    console.log('Found products:', products.map(p => p.name));

    // If no users, create a dummy user
    if (users.length === 0) {
      const dummyUser = new User({
        name: 'Dummy User',
        email: 'dummy@example.com',
        password: 'dummy123',
        role: 'user',
        status: true,
        phone: '+10000000000'
      });
      await dummyUser.save();
      users = [dummyUser];
      console.log('Created dummy user');
    }

    // If no products, create a dummy product
    if (products.length === 0) {
      const dummyProduct = new Product({
        name: 'Dummy Product',
        sku: 'DUMMY-001',
        price: 99.99,
        status: true,
        stock: 10
      });
      await dummyProduct.save();
      products = [dummyProduct];
      console.log('Created dummy product');
    }

    const now = Date.now();
    const orders = [
      {
        user_id: users[0]._id,
        order_number: `ORD-2025-001-${now}`,
        status: 'pending',
        total_amount: 299.99,
        subtotal: 299.99,
        tax_amount: 0,
        shipping_amount: 0,
        discount_amount: 0,
        shipping_address: {
          address_line1: '123 Main St',
          city: 'New York',
          state: 'NY',
          country: 'USA',
          pincode: '10001',
          phone: '+1-555-123-4567'
        },
        billing_address: {
          address_line1: '123 Main St',
          city: 'New York',
          state: 'NY',
          country: 'USA',
          pincode: '10001',
          phone: '+1-555-123-4567'
        },
        payment_method: 'cod',
        payment_status: 'pending',
        payment_details: {},
        shipping_method: 'standard',
        tracking_number: '',
        notes: 'Please deliver during business hours'
      }
    ];

    const createdOrders = await Order.insertMany(orders);
    console.log(`Created ${createdOrders.length} order(s)`);

    // Create order items
    const orderItems = [
      {
        order_id: createdOrders[0]._id,
        product_id: products[0]._id,
        quantity: 2,
        price: products[0].price,
        total_price: products[0].price * 2,
        product_snapshot: {
          name: products[0].name,
          sku: products[0].sku,
          image: products[0].photo || '',
          brand: products[0].brand || '',
          category: products[0].category || ''
        }
      }
    ];

    const createdOrderItems = await OrderItem.insertMany(orderItems);
    createdOrders[0].items = [createdOrderItems[0]._id];
    await createdOrders[0].save();

    console.log('Order seeder completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Order seeder error:', error);
    process.exit(1);
  }
};

seedOrders(); 
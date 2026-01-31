
const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');
const Cart = require('./src/models/cart');
const CartItem = require('./src/models/cartitem');
const User = require('./src/models/user');
const Product = require('./src/models/product');

// Mock Models if they don't exist in the path relative to script execution
// Adjust paths as necessary based on where we run this. We will run from root.

async function reproduce() {
  let mongoServer;
  try {
    mongoServer = await MongoMemoryServer.create();
    const uri = mongoServer.getUri();
    await mongoose.connect(uri);

    console.log('connected to test db');

    // 1. Create two users
    const user1 = await User.create({
      name: 'User One',
      email: 'user1@example.com',
      password: 'password123',
      phone: '1234567890'
    });

    const user2 = await User.create({
      name: 'User Two',
      email: 'user2@example.com',
      password: 'password123',
      phone: '0987654321'
    });

    console.log('Created users:', user1._id, user2._id);

    // 2. Create a product
    const product = await Product.create({
      name: 'Test Product',
      price: 100,
      description: 'Test Desc',
      status: 'active'
    });
    console.log('Created product:', product._id);

    // 3. Simulate Add to Cart for User 1
    // Logic mimicked from cart.controller.js
    let cart1 = new Cart({ user_id: user1._id });
    await cart1.save();

    const cartItem1 = new CartItem({
      cart_id: cart1._id,
      product_id: product._id,
      quantity: 1,
      price: 100,
      total_price: 100
    });
    await cartItem1.save();
    console.log('Added to User 1 cart');

    // 4. Check User 2 Cart
    // Should be empty or null
    let cart2 = await Cart.findOne({ user_id: user2._id });
    if (cart2) {
      const items2 = await CartItem.find({ cart_id: cart2._id });
      console.log('User 2 Cart Items:', items2.length);
      if (items2.length > 0) {
        console.error('FAIL: User 2 has items!');
      } else {
        console.log('PASS: User 2 cart is empty.');
      }
    } else {
      console.log('PASS: User 2 has no cart yet.');
    }

    // 5. Check if User 2 can see User 1's items via a bad query?
    // What if we query CartItem without cart_id?
    // Attempt to "find all cart items"
    const allItems = await CartItem.find();
    console.log('Total items in DB:', allItems.length);

    // Verify isolation logic
    // Controller does: Cart.findOne({ user_id: req.user.id })
    // Then CartItem.find({ cart_id: cart._id })
    
    // Simulate User 2 Controller Logic
    const user2CartQuery = await Cart.findOne({ user_id: user2._id });
    if (user2CartQuery) {
        const user2Items = await CartItem.find({ cart_id: user2CartQuery._id });
        console.log(`User 2 sees ${user2Items.length} items.`);
        if (user2Items.length !== 0) throw new Error('Isolation failed');
    } else {
        console.log('User 2 sees 0 items (no cart).');
    }

    console.log('SUCCESS: Backend logic supports isolation.');

  } catch (err) {
    console.error('Error:', err);
  } finally {
    await mongoose.disconnect();
    if (mongoServer) await mongoServer.stop();
  }
}

reproduce();

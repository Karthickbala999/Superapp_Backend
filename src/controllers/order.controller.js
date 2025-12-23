const Order = require('../models/order');
const OrderItem = require('../models/orderitem');
const Cart = require('../models/cart');
const CartItem = require('../models/cartitem');
const Product = require('../models/product');
const ProductVariation = require('../models/productvariation');
const User = require('../models/user');

// Get user's orders
exports.getUserOrders = async (req, res) => {
  try {
    const userId = req.user.id;
    const orders = await Order.find({ user_id: userId })
      .populate({
        path: 'items',
        populate: [
          { path: 'product_id', model: 'Product' },
          { path: 'variation_id', model: 'ProductVariation' }
        ]
      })
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      data: orders
    });
  } catch (error) {
    console.error('Error fetching orders:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching orders',
      error: error.message
    });
  }
};

// Get order by ID
exports.getOrderById = async (req, res) => {
  try {
    const userId = req.user.id;
    const order = await Order.findOne({ _id: req.params.id, user_id: userId })
      .populate({
        path: 'items',
        populate: [
          { path: 'product_id', model: 'Product' },
          { path: 'variation_id', model: 'ProductVariation' }
        ]
      });

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    res.json({
      success: true,
      data: order
    });
  } catch (error) {
    console.error('Error fetching order:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching order',
      error: error.message
    });
  }
};

// Create order from cart
exports.createOrder = async (req, res) => {
  try {
    const userId = req.user.id;
    const { shipping_address, payment_method, notes } = req.body;

    // Get user's cart
    const cart = await Cart.findOne({ user_id: userId })
      .populate({
        path: 'items',
        populate: [
          { path: 'product_id', model: 'Product' },
          { path: 'variation_id', model: 'ProductVariation' }
        ]
      });

    if (!cart || !cart.items || cart.items.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Cart is empty'
      });
    }

    // Calculate order totals and prepare cart item data
    let subtotal = 0;
    const cartItemsData = [];

    for (const cartItem of cart.items) {
      const product = cartItem.product_id;
      const itemTotal = product.price * cartItem.quantity;
      subtotal += itemTotal;

      // Store cart item data for later OrderItem creation
      cartItemsData.push({
        product_id: product._id,
        variation_id: cartItem.variation_id || null,
        quantity: cartItem.quantity,
        price: product.price,
        total_price: itemTotal
      });
    }

    // Calculate final amounts
    const tax_amount = 0; // No tax for now
    const shipping_amount = 0; // Free shipping
    const discount_amount = 0; // No discount
    const total_amount = subtotal + tax_amount + shipping_amount - discount_amount;

    // ✅ STEP 0: Fetch current user data to ensure we have the latest profile info
    let user = await User.findById(userId).select('name email phone');

    // Fallback for demo user if not found in database
    if (!user && req.user && req.user.name === 'Demo User') {
      user = {
        name: 'Demo User',
        email: 'demo@example.com',
        phone: '+91 9876543210'
      };
    }

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User for order creation not found'
      });
    }

    // ✅ STEP 1: Create and save the Order FIRST with all required fields
    const order = new Order({
      user_id: userId,
      order_number: `ORD-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      subtotal: subtotal, // ✅ Required field added
      tax_amount: tax_amount,
      shipping_amount: shipping_amount,
      discount_amount: discount_amount,
      total_amount: total_amount, // ✅ Required field
      shipping_address,
      payment_method: payment_method || 'cod',
      status: 'pending',
      notes,
      // Save snapshot of customer details
      customer_name: user.name,
      customer_email: user.email,
      customer_phone: user.phone
    });

    await order.save();
    console.log('✅ Order created with ID:', order._id);

    // ✅ STEP 2: Now create OrderItems with the Order ID
    const orderItems = [];
    for (const itemData of cartItemsData) {
      const orderItem = new OrderItem({
        order_id: order._id, // ✅ Now we have the Order ID!
        product_id: itemData.product_id,
        variation_id: itemData.variation_id,
        quantity: itemData.quantity,
        price: itemData.price,
        total_price: itemData.total_price
      });
      await orderItem.save();
      orderItems.push(orderItem._id);
      console.log('✅ OrderItem created:', orderItem._id);
    }

    // ✅ STEP 3: OrderItems created successfully (no need to update order since items is virtual)
    console.log('✅ OrderItems created successfully:', orderItems.length, 'items');

    // Clear cart
    await CartItem.deleteMany({ cart_id: cart._id });
    cart.items = [];
    await cart.save();
    console.log('✅ Cart cleared successfully');

    // Return created order with populated items
    const createdOrder = await Order.findById(order._id)
      .populate({
        path: 'items',
        populate: [
          { path: 'product_id', model: 'Product' },
          { path: 'variation_id', model: 'ProductVariation' }
        ]
      });

    console.log('✅ Order creation completed successfully:', createdOrder.order_number);

    res.status(201).json({
      success: true,
      message: 'Order created successfully',
      data: createdOrder
    });
  } catch (error) {
    console.error('❌ Error creating order:', error);
    console.error('❌ Error stack:', error.stack);
    console.error('❌ Request body:', req.body);
    console.error('❌ User ID:', req.user?.id);
    res.status(500).json({
      success: false,
      message: 'Error creating order',
      error: error.message
    });
  }
};

// Cancel order
exports.cancelOrder = async (req, res) => {
  try {
    const userId = req.user.id;
    const order = await Order.findOne({ _id: req.params.id, user_id: userId });

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    if (order.status === 'cancelled') {
      return res.status(400).json({
        success: false,
        message: 'Order is already cancelled'
      });
    }

    if (order.status === 'shipped' || order.status === 'delivered') {
      return res.status(400).json({
        success: false,
        message: 'Cannot cancel order that has been shipped or delivered'
      });
    }

    order.status = 'cancelled';
    await order.save();

    res.json({
      success: true,
      message: 'Order cancelled successfully',
      data: order
    });
  } catch (error) {
    console.error('Error cancelling order:', error);
    res.status(500).json({
      success: false,
      message: 'Error cancelling order',
      error: error.message
    });
  }
};

// Get order status
exports.getOrderStatus = async (req, res) => {
  try {
    const userId = req.user.id;
    const order = await Order.findOne({ _id: req.params.id, user_id: userId })
      .select('status order_number total_amount createdAt');

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    res.json({
      success: true,
      data: order
    });
  } catch (error) {
    console.error('Error fetching order status:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching order status',
      error: error.message
    });
  }
}; 
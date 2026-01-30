const GroceryOrder = require('../models/groceryorder');
const GroceryOrderItem = require('../models/groceryorderitem');
const User = require('../models/user');

// Get user's grocery orders
exports.getUserGroceryOrders = async (req, res) => {
  try {
    const userId = req.user.id;
    const orders = await GroceryOrder.find({ user_id: userId })
      .populate({
        path: 'items',
        populate: {
          path: 'product'  // ✅ FIX: Use 'product' instead of 'grocery_id'
        }
      })
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      data: orders
    });
  } catch (error) {
    console.error('Error fetching grocery orders:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching grocery orders',
      error: error.message
    });
  }
};

// Get grocery order by ID
exports.getGroceryOrderById = async (req, res) => {
  try {
    const userId = req.user.id;
    const userRole = req.user.role;

    // Build query - admins can access any order, users can only access their own
    const query = { _id: req.params.id };
    if (userRole !== 'admin' && userRole !== 'grocery_admin') {
      query.user_id = userId;
    }

    let order = await GroceryOrder.findOne(query)
      .populate({
        path: 'items',
        populate: {
          path: 'product'  // ✅ FIX: Use 'product' instead of 'grocery_id'
        }
      })
      .populate({
        path: 'user_id',
        select: 'name email phone'
      });

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Grocery order not found'
      });
    }

    // Map order to ensure user data is accessible via both user_id and user for frontend compatibility
    const orderObj = order.toObject ? order.toObject({ virtuals: true }) : { ...order };
    if (orderObj.user_id && typeof orderObj.user_id === 'object' && orderObj.user_id._id) {
      orderObj.user = {
        _id: orderObj.user_id._id,
        name: orderObj.user_id.name,
        email: orderObj.user_id.email,
        phone: orderObj.user_id.phone
      };
    }

    res.json({
      success: true,
      data: orderObj
    });
  } catch (error) {
    console.error('Error fetching grocery order:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching grocery order',
      error: error.message
    });
  }
};

// Create grocery order
exports.createGroceryOrder = async (req, res) => {
  try {
    console.log('DEBUG createGroceryOrder req.body:', req.body);
    const userId = req.user.id;
    const { items, shipping_address, payment_method, notes } = req.body;

    // ✅ STEP 0: Fetch current user data to ensure we have the latest profile info
    const user = await User.findById(userId).select('name email phone');
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    if (!items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Order items are required'
      });
    }

    // 1. Create the order first (without items)
    const order = new GroceryOrder({
      user_id: userId,
      order_number: `GORD-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      total_amount: 0, // will update after items
      address: shipping_address || 'Default Address',
      payment_method: payment_method || 'cod',
      status: 'pending',
      // Save snapshot of customer details
      customer_name: user.name,
      customer_email: user.email,
      customer_phone: user.phone
    });
    await order.save();

    // 2. Create order items, now with order._id
    let total = 0;
    const orderItems = [];
    for (const item of items) {
      const { grocery_id, quantity, price } = item;
      const itemPrice = (typeof price === 'number' && !isNaN(price)) ? price : 0;
      const itemTotal = itemPrice * quantity;
      total += itemTotal;

      const orderItem = new GroceryOrderItem({
        order_id: order._id,
        product_id: grocery_id, // This should match the grocery_id from frontend
        quantity,
        price: itemPrice
      });
      await orderItem.save();
      orderItems.push(orderItem._id);
    }

    // 3. Update order with items and total
    order.items = orderItems;
    order.total_amount = total;
    await order.save();

    // Populate and return the created order with current user data
    const createdOrder = await GroceryOrder.findById(order._id)
      .populate({
        path: 'user_id',
        select: 'name email phone'
      })
      .populate({
        path: 'items',
        populate: {
          path: 'product'
        }
      });

    // Map order to ensure user data is accessible via both user_id and user for frontend compatibility
    const orderObj = createdOrder.toObject ? createdOrder.toObject({ virtuals: true }) : { ...createdOrder };

    if (!orderObj.user) orderObj.user = {};

    // Prioritize snapshot data we just saved
    if (orderObj.customer_name) {
      orderObj.user.name = orderObj.customer_name;
      orderObj.user.email = orderObj.customer_email;
      orderObj.user.phone = orderObj.customer_phone;
      // Also set _id from user_id
      if (orderObj.user_id && orderObj.user_id._id) {
        orderObj.user._id = orderObj.user_id._id;
      } else if (orderObj.user_id) {
        orderObj.user._id = orderObj.user_id;
      }
    } else if (orderObj.user_id && typeof orderObj.user_id === 'object' && orderObj.user_id._id) {
      orderObj.user = {
        _id: orderObj.user_id._id,
        name: orderObj.user_id.name,
        email: orderObj.user_id.email,
        phone: orderObj.user_id.phone
      };
    }

    console.log('✅ Grocery order created with current user data:', {
      name: orderObj.user?.name,
      email: orderObj.user?.email
    });

    res.status(201).json({
      success: true,
      message: 'Grocery order created successfully',
      data: orderObj
    });
  } catch (error) {
    console.error('Error creating grocery order:', error);
    res.status(500).json({
      success: false,
      message: 'Error creating grocery order',
      error: error.message
    });
  }
};

// Cancel grocery order
exports.cancelGroceryOrder = async (req, res) => {
  try {
    const userId = req.user.id;
    const order = await GroceryOrder.findOne({ _id: req.params.id, user_id: userId });

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Grocery order not found'
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
      message: 'Grocery order cancelled successfully',
      data: order
    });
  } catch (error) {
    console.error('Error cancelling grocery order:', error);
    res.status(500).json({
      success: false,
      message: 'Error cancelling grocery order',
      error: error.message
    });
  }
};

// Get grocery order status
exports.getGroceryOrderStatus = async (req, res) => {
  try {
    const userId = req.user.id;
    const order = await GroceryOrder.findOne({ _id: req.params.id, user_id: userId })
      .select('status order_number total_amount createdAt');

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Grocery order not found'
      });
    }

    res.json({
      success: true,
      data: order
    });
  } catch (error) {
    console.error('Error fetching grocery order status:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching grocery order status',
      error: error.message
    });
  }
};

// ADMIN: Get all grocery orders (with filtering, pagination)
exports.adminGetAllGroceryOrders = async (req, res) => {
  try {
    const { page = 1, limit = 20, status, search, date_from, date_to, payment_status, payment_method } = req.query;
    const query = {};
    if (status) query.status = status;
    if (payment_status) query.payment_status = payment_status;
    if (payment_method) query.payment_method = payment_method;
    if (date_from || date_to) {
      query.createdAt = {};
      if (date_from) query.createdAt.$gte = new Date(date_from);
      if (date_to) query.createdAt.$lte = new Date(date_to);
    }

    // Search filter - we'll handle user search after population
    let userQuery = {};
    if (search) {
      userQuery = {
        $or: [
          { name: { $regex: search, $options: 'i' } },
          { email: { $regex: search, $options: 'i' } },
          { phone: { $regex: search, $options: 'i' } }
        ]
      };
      // Also search by order number
      query.$or = [
        { order_number: { $regex: search, $options: 'i' } }
      ];
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const total_items = await GroceryOrder.countDocuments(query);

    // Build populate options for user_id - only use match if there's a search query
    const userPopulateOptions = {
      path: 'user_id',
      select: 'name email phone'
    };
    if (search && Object.keys(userQuery).length > 0) {
      userPopulateOptions.match = userQuery;
    }

    let orders = await GroceryOrder.find(query)
      .populate({
        path: 'items',
        populate: { path: 'product' }
      })
      .populate(userPopulateOptions)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    // DEBUG: Log first order to see what we're getting
    if (orders.length > 0) {
      console.log('🔍 DEBUG - First order before mapping:', {
        orderId: orders[0]._id,
        orderNumber: orders[0].order_number,
        user_id: orders[0].user_id,
        user_id_type: typeof orders[0].user_id,
        user_id_isObject: orders[0].user_id && typeof orders[0].user_id === 'object',
        user_id_name: orders[0].user_id?.name,
        user_id_email: orders[0].user_id?.email
      });
    }

    // Filter out orders where user doesn't match search criteria
    if (search) {
      orders = orders.filter(order => {
        const user = order.user_id;
        // If searching, include orders that match order number OR have a matching user
        if (order.order_number && order.order_number.toLowerCase().includes(search.toLowerCase())) {
          return true;
        }
        return user && typeof user === 'object' && user._id;
      });
    }

    // Map orders to ensure user data is accessible via both user_id and user for frontend compatibility
    orders = orders.map(order => {
      const orderObj = order.toObject ? order.toObject({ virtuals: true }) : { ...order };

      // Initialize user object if not present
      if (!orderObj.user) {
        orderObj.user = {};
      }

      // 1. Try to use populated user_id first (dynamic/current data)
      if (orderObj.user_id && typeof orderObj.user_id === 'object' && orderObj.user_id._id) {
        orderObj.user = {
          _id: orderObj.user_id._id,
          name: orderObj.user_id.name,
          email: orderObj.user_id.email,
          phone: orderObj.user_id.phone
        };
      }

      // 2. If we have denormalized/snapshot data, allow it to override or fallback
      // The requirement is to show the LATEST data if the user updates their profile.
      // But if we want to show the snapshot, we would prioritize customer_name.
      // However, the user specifically said: "new orders in the Admin Panel still show old values"
      // and wants "latest user profile".
      // So we should PRIORITIZE the populated data (current profile).
      // BUT if populated data is missing or failed, use snapshot.
      // Wait, if the populated data IS the old value (as user implies), then maybe we should use the snapshot we JUST saved?
      // If we just saved the snapshot from the fetched user, it IS the latest.

      if (orderObj.customer_name) {
        // If we have a snapshot, it might be more reliable for "what was the user when order was created"
        // But user said "Update profile -> Place Order -> Verify Admin Panel shows updated name".
        // So if we save the NEW name to snapshot, and display snapshot, it works.
        orderObj.user.name = orderObj.customer_name;
        orderObj.user.email = orderObj.customer_email;
        orderObj.user.phone = orderObj.customer_phone;
      } else if (orderObj.user_id && typeof orderObj.user_id === 'object') {
        // Fallback to populated if no snapshot
        orderObj.user.name = orderObj.user_id.name;
        orderObj.user.email = orderObj.user_id.email;
        orderObj.user.phone = orderObj.user_id.phone;
      }

      return orderObj;
    });

    // DEBUG: Log first order after mapping
    if (orders.length > 0) {
      console.log('🔍 DEBUG - First order after mapping:', {
        orderId: orders[0]._id,
        orderNumber: orders[0].order_number,
        user: orders[0].user,
        userName: orders[0].user?.name,
        userEmail: orders[0].user?.email
      });
    }

    res.json({
      success: true,
      data: orders,
      pagination: {
        total_items,
        total_pages: Math.ceil(total_items / limit),
        current_page: parseInt(page)
      }
    });
  } catch (error) {
    console.error('Error fetching grocery orders (admin):', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching grocery orders',
      error: error.message
    });
  }
};

// ADMIN: Update grocery order status
exports.adminUpdateGroceryOrderStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, notes } = req.body;
    const order = await GroceryOrder.findById(id);
    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Grocery order not found'
      });
    }
    order.status = status || order.status;
    if (notes) order.notes = notes;
    await order.save();

    // Populate the updated order with current user data
    const updatedOrder = await GroceryOrder.findById(id)
      .populate({
        path: 'items',
        populate: { path: 'product' }
      })
      .populate({
        path: 'user_id',
        select: 'name email phone'
      });

    // Map order to ensure user data is accessible via both user_id and user for frontend compatibility
    const orderObj = updatedOrder.toObject ? updatedOrder.toObject({ virtuals: true }) : { ...updatedOrder };
    if (orderObj.user_id && typeof orderObj.user_id === 'object' && orderObj.user_id._id) {
      orderObj.user = {
        _id: orderObj.user_id._id,
        name: orderObj.user_id.name,
        email: orderObj.user_id.email,
        phone: orderObj.user_id.phone
      };
    }

    res.json({
      success: true,
      message: 'Grocery order status updated successfully',
      data: orderObj
    });
  } catch (error) {
    console.error('Error updating grocery order status (admin):', error);
    res.status(500).json({
      success: false,
      message: 'Error updating grocery order status',
      error: error.message
    });
  }
};

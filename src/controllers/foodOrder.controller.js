const FoodOrder = require('../models/foodorder');
const FoodOrderItem = require('../models/foodorderitem');
const FoodCart = require('../models/foodcart');
const FoodCartItem = require('../models/foodcartitem');
const Dish = require('../models/dish');
const Restaurant = require('../models/restaurant');
const User = require('../models/user');

// Get user's food orders
exports.getUserFoodOrders = async (req, res) => {
  try {
    const userId = req.user.id;
    const orders = await FoodOrder.find({ user_id: userId })
      .populate('restaurant', 'name image location.area cuisines rating delivery_time')
      .populate({
        path: 'items',
        populate: {
          path: 'dish_id',
          model: 'Dish',
          select: 'name image price is_veg category'
        }
      })
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      data: orders
    });
  } catch (error) {
    console.error('Error fetching food orders:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching food orders',
      error: error.message
    });
  }
};

// Get food order by ID
exports.getFoodOrderById = async (req, res) => {
  try {
    const userId = req.user.id;
    const order = await FoodOrder.findOne({ _id: req.params.id, user_id: userId })
      .populate('restaurant')
      .populate('user')
      .populate({
        path: 'items',
        populate: {
          path: 'dish_id',
          model: 'Dish'
        }
      });

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Food order not found'
      });
    }

    res.json({
      success: true,
      data: order
    });
  } catch (error) {
    console.error('Error fetching food order:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching food order',
      error: error.message
    });
  }
};

// Create food order from cart
exports.createFoodOrder = async (req, res) => {
  try {
    const userId = req.user.id;
    const {
      delivery_address,
      payment_method,
      delivery_method = 'delivery',
      delivery_instructions,
      special_instructions
    } = req.body;

    // ✅ STEP 0: Fetch current user data to ensure we have the latest profile info
    const user = await User.findById(userId).select('name email phone');
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Get user's food cart
    const cart = await FoodCart.findOne({ user_id: userId })
      .populate('restaurant_id');

    if (!cart) {
      return res.status(400).json({
        success: false,
        message: 'Food cart is empty'
      });
    }

    // Get cart items
    const cartItems = await FoodCartItem.find({ cart_id: cart._id })
      .populate('dish_id');

    if (!cartItems || cartItems.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Food cart is empty'
      });
    }

    // Check minimum order requirement
    // if (cart.subtotal < cart.restaurant_id.minimum_order) {
    //   return res.status(400).json({
    //     success: false,
    //     message: `Minimum order amount is ₹${cart.restaurant_id.minimum_order}`,
    //     minimum_order: cart.restaurant_id.minimum_order,
    //     current_amount: cart.subtotal
    //   });
    // }

    // Calculate estimated delivery time
    const now = new Date();
    const deliveryTimeMinutes = parseInt(cart.restaurant_id.delivery_time.split('-')[1]) || 45;
    const estimatedDeliveryTime = new Date(now.getTime() + deliveryTimeMinutes * 60000);

    // ✅ STEP 1: Create and save the FoodOrder FIRST with all required fields
    const foodOrder = new FoodOrder({
      user_id: userId,
      restaurant_id: cart.restaurant_id._id,
      order_number: `FOOD-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      subtotal: cart.subtotal,
      tax_amount: cart.tax_amount || 0,
      delivery_fee: cart.delivery_fee || 0,
      discount_amount: cart.discount_amount || 0,
      packaging_fee: cart.packaging_fee || 0,
      total_amount: cart.total_amount,
      delivery_address,
      payment_method: payment_method || 'cod',
      delivery_method,
      estimated_delivery_time: estimatedDeliveryTime,
      delivery_instructions,
      special_instructions,
      status: 'pending',
      tracking_info: {
        order_confirmed_at: new Date()
      },
      // Save snapshot of customer details
      customer_name: user.name,
      customer_email: user.email,
      customer_phone: user.phone
    });

    await foodOrder.save();
    console.log('✅ Food Order created with ID:', foodOrder._id);




    // ✅ STEP 2: Now create FoodOrderItems with the Order ID
    const orderItems = [];
    for (const cartItem of cartItems) {
      const dish = cartItem.dish_id;

      // ✅ FIX: Add validation for calories
      const caloriesPerItem = dish.calories || 0; // Default to 0 if calories is undefined
      const totalCalories = caloriesPerItem * cartItem.quantity;

      const orderItem = new FoodOrderItem({
        order_id: foodOrder._id,
        dish_id: dish._id,
        restaurant_id: cart.restaurant_id._id,
        quantity: cartItem.quantity,
        price: cartItem.price,
        original_price: cartItem.original_price,
        total_price: cartItem.total_price,
        customizations: cartItem.customizations || [],
        special_instructions: cartItem.special_instructions,
        dish_snapshot: {
          name: dish.name,
          description: dish.description,
          image: dish.image,
          category: dish.category,
          is_veg: dish.is_veg,
          spice_level: dish.spice_level,
          preparation_time: dish.preparation_time
        },
        preparation_time: dish.preparation_time,
        calories_per_item: caloriesPerItem, // ✅ FIXED: Use validated calories
        total_calories: totalCalories // ✅ FIXED: Use calculated total calories
      });

      await orderItem.save();
      orderItems.push(orderItem._id);
    }

    // ✅ STEP 3: Update Order with OrderItem IDs (if using items array)
    // FoodOrder model uses virtual population, so this step might not be needed
    // but we'll keep it for consistency

    console.log(`✅ Created ${orderItems.length} order items`);

    // ✅ STEP 4: Clear the cart after successful order creation
    await FoodCartItem.deleteMany({ cart_id: cart._id });
    await FoodCart.findByIdAndDelete(cart._id);
    console.log('✅ Cart cleared after successful order');

    // ✅ STEP 5: Return the complete order with populated data including current user data
    const createdOrder = await FoodOrder.findById(foodOrder._id)
      .populate({
        path: 'user',
        select: 'name email phone'
      })
      .populate('restaurant_id')
      .populate({
        path: 'items',
        populate: {
          path: 'dish_id',
          model: 'Dish'
        }
      });

    // Map order to ensure user data is accessible (FoodOrder uses virtual 'user')
    const orderObj = createdOrder.toObject ? createdOrder.toObject({ virtuals: true }) : { ...createdOrder };

    // Ensure user data is accessible via both user and user_id for frontend compatibility
    if (!orderObj.user && orderObj.user_id && typeof orderObj.user_id === 'object') {
      // If user virtual didn't populate, fetch it manually
      const userData = await User.findById(orderObj.user_id).select('name email phone');
      if (userData) {
        orderObj.user = {
          _id: userData._id,
          name: userData.name,
          email: userData.email,
          phone: userData.phone
        };
      }
    } else if (orderObj.user && typeof orderObj.user === 'object') {
      // Ensure user data structure is consistent
      orderObj.user = {
        _id: orderObj.user._id,
        name: orderObj.user.name,
        email: orderObj.user.email,
        phone: orderObj.user.phone
      };
    }

    console.log('✅ Food order created with current user data:', {
      name: orderObj.user?.name,
      email: orderObj.user?.email
    });

    res.status(201).json({
      success: true,
      message: 'Food order created successfully',
      data: orderObj
    });

  } catch (error) {
    console.error('Error creating food order:', error);
    res.status(500).json({
      success: false,
      message: 'Error creating food order',
      error: error.message
    });
  }
};

// Cancel food order
exports.cancelFoodOrder = async (req, res) => {
  try {
    const userId = req.user.id;
    const { cancellation_reason } = req.body;

    const order = await FoodOrder.findOne({
      _id: req.params.id,
      user_id: userId
    });

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Food order not found'
      });
    }

    // Check if order can be cancelled
    if (!['pending', 'confirmed'].includes(order.status)) {
      return res.status(400).json({
        success: false,
        message: 'Order cannot be cancelled at this stage',
        current_status: order.status
      });
    }

    // Update order status
    order.status = 'cancelled';
    order.cancelled_by = 'customer';
    order.cancellation_reason = cancellation_reason;
    await order.save();

    res.json({
      success: true,
      message: 'Food order cancelled successfully',
      data: order
    });
  } catch (error) {
    console.error('Error cancelling food order:', error);
    res.status(500).json({
      success: false,
      message: 'Error cancelling food order',
      error: error.message
    });
  }
};

// Get order status/tracking
exports.getFoodOrderStatus = async (req, res) => {
  try {
    const userId = req.user.id;

    const order = await FoodOrder.findOne({
      _id: req.params.id,
      user_id: userId
    })
      .populate('restaurant_id', 'name phone address')
      .select('order_number status tracking_info delivery_partner estimated_delivery_time actual_delivery_time');

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Food order not found'
      });
    }

    res.json({
      success: true,
      data: order
    });
  } catch (error) {
    console.error('Error fetching food order status:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching food order status',
      error: error.message
    });
  }
};

// Rate food order
exports.rateFoodOrder = async (req, res) => {
  try {
    const userId = req.user.id;
    const { rating, review } = req.body;

    if (!rating || rating < 1 || rating > 5) {
      return res.status(400).json({
        success: false,
        message: 'Rating must be between 1 and 5'
      });
    }

    const order = await FoodOrder.findOne({
      _id: req.params.id,
      user_id: userId
    });

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Food order not found'
      });
    }

    if (order.status !== 'delivered') {
      return res.status(400).json({
        success: false,
        message: 'Order must be delivered before rating'
      });
    }

    // Update order rating
    order.rating = rating;
    order.review = review;
    await order.save();

    res.json({
      success: true,
      message: 'Food order rated successfully',
      data: {
        order_id: order._id,
        rating: order.rating,
        review: order.review
      }
    });
  } catch (error) {
    console.error('Error rating food order:', error);
    res.status(500).json({
      success: false,
      message: 'Error rating food order',
      error: error.message
    });
  }
};

// Restaurant owner: Get restaurant orders
exports.getRestaurantOrders = async (req, res) => {
  try {
    const { restaurant_id } = req.params;
    const { status, date_from, date_to, page = 1, limit = 20 } = req.query;

    // Build query
    let query = { restaurant_id };

    if (status) {
      query.status = status;
    }

    if (date_from || date_to) {
      query.createdAt = {};
      if (date_from) query.createdAt.$gte = new Date(date_from);
      if (date_to) query.createdAt.$lte = new Date(date_to);
    }

    const orders = await FoodOrder.find(query)
      .populate('user', 'name phone email')
      .populate({
        path: 'items',
        populate: {
          path: 'dish_id',
          model: 'Dish',
          select: 'name is_veg preparation_time'
        }
      })
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await FoodOrder.countDocuments(query);

    res.json({
      success: true,
      data: orders,
      pagination: {
        current_page: page,
        total_pages: Math.ceil(total / limit),
        total_orders: total,
        per_page: limit
      }
    });
  } catch (error) {
    console.error('Error fetching restaurant orders:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching restaurant orders',
      error: error.message
    });
  }
};

// Restaurant owner: Update order status
exports.updateFoodOrderStatus = async (req, res) => {
  try {
    const { order_id } = req.params;
    const { status, delivery_partner } = req.body;

    const validStatuses = ['pending', 'confirmed', 'preparing', 'ready', 'out_for_delivery', 'delivered', 'cancelled'];

    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid order status',
        valid_statuses: validStatuses
      });
    }

    const order = await FoodOrder.findById(order_id);
    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Food order not found'
      });
    }

    // Update order status and tracking info
    order.status = status;

    const now = new Date();
    switch (status) {
      case 'confirmed':
        order.tracking_info.order_confirmed_at = now;
        break;
      case 'preparing':
        order.tracking_info.preparation_started_at = now;
        break;
      case 'ready':
        order.tracking_info.order_ready_at = now;
        break;
      case 'out_for_delivery':
        order.tracking_info.pickup_at = now;
        if (delivery_partner) {
          order.delivery_partner = delivery_partner;
        }
        break;
      case 'delivered':
        order.tracking_info.delivered_at = now;
        order.actual_delivery_time = now;
        break;
    }

    await order.save();

    res.json({
      success: true,
      message: `Order status updated to ${status}`,
      data: order
    });
  } catch (error) {
    console.error('Error updating food order status:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating food order status',
      error: error.message
    });
  }
};

// Get all restaurant orders (admin only)
exports.getAllRestaurantOrders = async (req, res) => {
  try {
    console.log('🔍 ADMIN: getAllRestaurantOrders called');
    console.log(' ADMIN: User:', req.user);
    console.log('🔍 ADMIN: Query params:', req.query);

    const {
      page = 1,
      limit = 20,
      status,
      search,
      date_from,
      date_to,
      payment_status,
      payment_method,
      restaurant_id,
      sort_by = 'createdAt',
      sort_order = 'DESC'
    } = req.query;

    const skip = (page - 1) * limit;

    // Build query
    const query = {};
    if (status) query.status = status;
    if (payment_status) query.payment_status = payment_status;
    if (payment_method) query.payment_method = payment_method;
    if (restaurant_id) query.restaurant_id = restaurant_id;

    // Search by order number
    if (search) {
      query.$or = [
        { order_number: { $regex: search, $options: 'i' } }
      ];
    }

    // Date range filter
    if (date_from || date_to) {
      query.createdAt = {};
      if (date_from) query.createdAt.$gte = new Date(date_from);
      if (date_to) query.createdAt.$lte = new Date(date_to + ' 23:59:59');
    }

    console.log(' ADMIN: Final query:', JSON.stringify(query, null, 2));

    // Check total orders in database
    const totalOrdersInDB = await FoodOrder.countDocuments({});
    console.log('🔍 ADMIN: Total orders in database:', totalOrdersInDB);

    // First get orders
    let orders = await FoodOrder.find(query)
      .populate({
        path: 'user',
        select: 'name email phone'
      })
      .populate({
        path: 'user_id',
        select: 'name email phone'
      })
      .populate({
        path: 'restaurant',
        select: 'name address phone'
      })
      .populate('items')
      .sort({ [sort_by]: sort_order === 'DESC' ? -1 : 1 })
      .skip(skip)
      .limit(parseInt(limit));

    // Map orders to prioritize snapshot data
    orders = orders.map(order => {
      const orderObj = order.toObject ? order.toObject({ virtuals: true }) : { ...order };

      if (!orderObj.user) orderObj.user = {};

      // Prioritize snapshot data
      if (orderObj.customer_name) {
        orderObj.user.name = orderObj.customer_name;
        orderObj.user.email = orderObj.customer_email;
        orderObj.user.phone = orderObj.customer_phone;
        // Ensure _id is preserved if available
        if (orderObj.user_id && orderObj.user && !orderObj.user._id) {
          orderObj.user._id = orderObj.user_id;
        }
      } else if (orderObj.user_id && typeof orderObj.user_id === 'object' && (!orderObj.user || !orderObj.user.name)) {
        // Fallback to user_id populated data
        orderObj.user = {
          _id: orderObj.user_id._id,
          name: orderObj.user_id.name,
          email: orderObj.user_id.email,
          phone: orderObj.user_id.phone
        };
      }

      return orderObj;
    });

    console.log('🔍 ADMIN: Orders found:', orders.length);
    console.log(' ADMIN: First order sample:', orders[0] ? {
      id: orders[0]._id,
      order_number: orders[0].order_number,
      status: orders[0].status,
      user: orders[0].user,
      restaurant: orders[0].restaurant
    } : 'No orders');

    // Search filter - we'll handle user/restaurant search after population
    // Note: order_number search is already handled in the query above
    let userQuery = {};
    let restaurantQuery = {};
    if (search) {
      userQuery = {
        $or: [
          { name: { $regex: search, $options: 'i' } },
          { email: { $regex: search, $options: 'i' } },
          { phone: { $regex: search, $options: 'i' } }
        ]
      };
      restaurantQuery = {
        name: { $regex: search, $options: 'i' }
      };
    }

    // Filter out orders where user or restaurant doesn't match search criteria
    // But keep orders that match by order_number (already in query)
    if (search) {
      orders = orders.filter(order => {
        // If order number matches, keep it
        if (order.order_number && order.order_number.toLowerCase().includes(search.toLowerCase())) {
          return true;
        }
        // Otherwise, check if user or restaurant matches
        return order.user && order.restaurant;
      });
    }

    const total = await FoodOrder.countDocuments(query);

    console.log('🔍 ADMIN: Final response - orders:', orders.length, 'total:', total);

    res.json({
      success: true,
      data: orders,
      pagination: {
        current_page: parseInt(page),
        total_pages: Math.ceil(total / limit),
        total_items: total,
        items_per_page: parseInt(limit)
      }
    });
  } catch (error) {
    console.error('❌ ADMIN: Get all restaurant orders error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch restaurant orders',
      error: error.message
    });
  }
};

// Get restaurant order statistics (admin dashboard)
exports.getRestaurantOrderStats = async (req, res) => {
  try {
    const { period = '30' } = req.query; // days
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - parseInt(period));

    // Total orders
    const totalOrders = await FoodOrder.countDocuments({
      createdAt: { $gte: startDate }
    });

    // Orders by status
    const ordersByStatus = await FoodOrder.aggregate([
      {
        $match: {
          createdAt: { $gte: startDate }
        }
      },
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 }
        }
      }
    ]);

    // Total revenue
    const revenueResult = await FoodOrder.aggregate([
      {
        $match: {
          createdAt: { $gte: startDate }
        }
      },
      {
        $group: {
          _id: null,
          total: { $sum: '$total_amount' }
        }
      }
    ]);

    const totalRevenue = revenueResult.length > 0 ? revenueResult[0].total : 0;

    res.json({
      success: true,
      data: {
        total_orders: totalOrders,
        orders_by_status: ordersByStatus,
        total_revenue: totalRevenue
      }
    });
  } catch (error) {
    console.error('Get restaurant order stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch restaurant order statistics',
      error: error.message
    });
  }
}; 
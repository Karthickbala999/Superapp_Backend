const Order = require('../models/order');
const OrderItem = require('../models/orderitem');
const User = require('../models/user');
const Product = require('../models/product');
const ProductVariation = require('../models/productvariation');

// Get all orders with advanced filtering (admin)
exports.getAllOrders = async (req, res) => {
  console.log('ADMIN GET ALL ORDERS HIT', req.user);
  try {
    const {
      page = 1,
      limit = 20,
      status,
      search,
      date_from,
      date_to,
      payment_status,
      payment_method,
      sort_by = 'createdAt',
      sort_order = 'DESC'
    } = req.query;

    const skip = (page - 1) * limit;

    // Build query
    const query = {};
    if (status) query.status = status;
    if (payment_status) query.payment_status = payment_status;
    if (payment_method) query.payment_method = payment_method;

    // Date range filter
    if (date_from || date_to) {
      query.createdAt = {};
      if (date_from) query.createdAt.$gte = new Date(date_from);
      if (date_to) query.createdAt.$lte = new Date(date_to + ' 23:59:59');
    }

    // Search filter - we'll handle this after population
    let userQuery = {};
    if (search) {
      userQuery = {
        $or: [
          { name: { $regex: search, $options: 'i' } },
          { email: { $regex: search, $options: 'i' } },
          { phone: { $regex: search, $options: 'i' } }
        ]
      };
    }

    // First get orders - populate user using user_id directly (not virtual)
    let orders = await Order.find(query)
      .populate({
        path: 'user_id', // Populate user_id directly since it's the actual field in the schema
        select: 'name email phone',
        match: userQuery
      })
      .populate('items')
      .sort({ [sort_by]: sort_order === 'DESC' ? -1 : 1 })
      .skip(skip)
      .limit(parseInt(limit));

    // Filter out orders where user doesn't match search criteria
    if (search) {
      orders = orders.filter(order => {
        const user = order.user_id;
        return user && typeof user === 'object' && user._id;
      });
    }

    // Map orders to ensure user data is accessible via both user_id and user for frontend compatibility
    orders = orders.map(order => {
      const orderObj = order.toObject ? order.toObject({ virtuals: true }) : { ...order };

      if (!orderObj.user) orderObj.user = {};

      // 1. Try to use populated user_id first
      if (orderObj.user_id && typeof orderObj.user_id === 'object' && orderObj.user_id._id) {
        orderObj.user = {
          _id: orderObj.user_id._id,
          name: orderObj.user_id.name,
          email: orderObj.user_id.email,
          phone: orderObj.user_id.phone
        };
      }

      // 2. Prioritize snapshot if available (ensures historical accuracy or latest captured data)
      if (orderObj.customer_name) {
        orderObj.user.name = orderObj.customer_name;
        orderObj.user.email = orderObj.customer_email;
        orderObj.user.phone = orderObj.customer_phone;
        if (orderObj.user_id && orderObj.user_id._id) {
          orderObj.user._id = orderObj.user_id._id;
        }
      } else if (orderObj.shipping_address && orderObj.shipping_address.name) {
        // Fallback to shipping address name if snapshot not available
        orderObj.user.name = orderObj.shipping_address.name;
        if (orderObj.shipping_address.email) orderObj.user.email = orderObj.shipping_address.email;
        if (orderObj.shipping_address.phone) orderObj.user.phone = orderObj.shipping_address.phone;
      } else if (orderObj.billing_address && orderObj.billing_address.name) {
        // Fallback to billing address name
        orderObj.user.name = orderObj.billing_address.name;
        if (orderObj.billing_address.email) orderObj.user.email = orderObj.billing_address.email;
        if (orderObj.billing_address.phone) orderObj.user.phone = orderObj.billing_address.phone;
      }

      return orderObj;
    });

    // Debug: Log first order to verify user population
    if (orders.length > 0) {
      console.log('First order from backend:', {
        orderId: orders[0]._id,
        orderNumber: orders[0].order_number,
        userId: orders[0].user_id,
        user: orders[0].user,
        userName: orders[0].user?.name,
        userEmail: orders[0].user?.email
      });
    }

    const total = await Order.countDocuments(query);

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
    console.error('Get all orders error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch orders',
      error: error.message
    });
  }
};

// Search order by order number (admin) - searches both regular and grocery orders
exports.searchOrderByNumber = async (req, res) => {
  try {
    const { orderNumber } = req.params;

    console.log('🔍 Search order by number called with:', orderNumber);
    console.log('🔍 Decoded order number:', decodeURIComponent(orderNumber));

    if (!orderNumber) {
      return res.status(400).json({
        success: false,
        message: 'Order number is required'
      });
    }

    // Decode the order number in case it was URL encoded
    const decodedOrderNumber = decodeURIComponent(orderNumber);

    // Try to find in regular orders first
    console.log('🔍 Searching in regular orders...');
    let order = await Order.findOne({ order_number: decodedOrderNumber })
      .populate({
        path: 'user_id',
        select: 'name email phone'
      })
      .populate({
        path: 'items',
        populate: {
          path: 'product',
          select: 'name sku image images brand_id category_id',
          populate: {
            path: 'brand_id',
            select: 'name'
          }
        }
      });

    if (order) {
      console.log('✅ Found regular order:', order.order_number);
      const orderObj = order.toObject ? order.toObject({ virtuals: true }) : { ...order };
      orderObj.order_type = 'regular';

      // Map user data to ensure it's accessible via both user_id and user for frontend compatibility
      // Initialize user object if not present
      if (!orderObj.user) orderObj.user = {};

      if (orderObj.user_id && typeof orderObj.user_id === 'object' && orderObj.user_id._id) {
        orderObj.user = {
          _id: orderObj.user_id._id,
          name: orderObj.user_id.name,
          email: orderObj.user_id.email,
          phone: orderObj.user_id.phone
        };
      }

      // Prioritize snapshot if available
      if (orderObj.customer_name) {
        orderObj.user.name = orderObj.customer_name;
        orderObj.user.email = orderObj.customer_email;
        orderObj.user.phone = orderObj.customer_phone;
      }

      return res.json({
        success: true,
        data: orderObj,
        order_type: 'regular'
      });
    }

    // If not found in regular orders, try grocery orders
    console.log('🔍 Not found in regular orders, searching grocery orders...');
    const GroceryOrder = require('../models/groceryorder');
    const groceryOrder = await GroceryOrder.findOne({ order_number: decodedOrderNumber })
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

    if (groceryOrder) {
      console.log('✅ Found grocery order:', groceryOrder.order_number);
      const orderObj = groceryOrder.toObject ? groceryOrder.toObject({ virtuals: true }) : { ...groceryOrder };
      orderObj.order_type = 'grocery';

      // Map user data to ensure it's accessible via both user_id and user for frontend compatibility
      if (orderObj.user_id && typeof orderObj.user_id === 'object' && orderObj.user_id._id) {
        orderObj.user = {
          _id: orderObj.user_id._id,
          name: orderObj.user_id.name,
          email: orderObj.user_id.email,
          phone: orderObj.user_id.phone
        };
      }

      return res.json({
        success: true,
        data: orderObj,
        order_type: 'grocery'
      });
    }

    // If not found in grocery orders, try restaurant/food orders
    console.log('🔍 Not found in grocery orders, searching restaurant orders...');
    const FoodOrder = require('../models/foodorder');
    let foodOrder = await FoodOrder.findOne({ order_number: decodedOrderNumber })
      .populate({
        path: 'user',
        select: 'name email phone'
      })
      .populate({
        path: 'restaurant',
        select: 'name address phone'
      })
      .populate({
        path: 'items',
        populate: {
          path: 'dish_id'
        }
      });

    if (foodOrder) {
      console.log('✅ Found restaurant order:', foodOrder.order_number);
      const orderObj = foodOrder.toObject ? foodOrder.toObject({ virtuals: true }) : { ...foodOrder };
      orderObj.order_type = 'restaurant';

      // Ensure user data is accessible (FoodOrder uses virtual 'user', but ensure it's populated)
      if (!orderObj.user && orderObj.user_id && typeof orderObj.user_id === 'object') {
        orderObj.user = {
          _id: orderObj.user_id._id,
          name: orderObj.user_id.name,
          email: orderObj.user_id.email,
          phone: orderObj.user_id.phone
        };
      }

      return res.json({
        success: true,
        data: orderObj,
        order_type: 'restaurant'
      });
    }

    console.log('❌ Order not found:', decodedOrderNumber);
    return res.status(404).json({
      success: false,
      message: 'Order not found'
    });
  } catch (error) {
    console.error('❌ Search order by number error:', error);
    console.error('❌ Error stack:', error.stack);
    res.status(500).json({
      success: false,
      message: 'Failed to search order',
      error: error.message
    });
  }
};

// Get single order by ID (admin)
exports.getOrderById = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id)
      .populate({
        path: 'user_id',
        select: 'name email phone'
      })
      .populate({
        path: 'items',
        populate: {
          path: 'product',
          select: 'name sku image images brand_id category_id',
          populate: {
            path: 'brand_id',
            select: 'name'
          }
        }
      });

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
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
    console.error('Get order by ID error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch order',
      error: error.message
    });
  }
};

// Update order status (admin)
exports.updateOrderStatus = async (req, res) => {
  try {
    const { status, tracking_number, notes } = req.body;

    const order = await Order.findById(req.params.id);
    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    // Validate status transition
    const validStatuses = ['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled', 'refunded'];
    if (status && !validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid status'
      });
    }

    // Update fields only if provided (allow empty strings to clear fields)
    if (status !== undefined) {
      order.status = status;
    }
    if (tracking_number !== undefined) {
      order.tracking_number = tracking_number;
    }
    if (notes !== undefined) {
      order.notes = notes;
    }

    await order.save();

    // Populate the updated order before sending response
    const updatedOrder = await Order.findById(req.params.id)
      .populate({
        path: 'user_id',
        select: 'name email phone'
      })
      .populate({
        path: 'items',
        populate: {
          path: 'product',
          select: 'name sku image images brand_id category_id',
          populate: {
            path: 'brand_id',
            select: 'name'
          }
        }
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
      message: 'Order updated successfully',
      data: orderObj
    });
  } catch (error) {
    console.error('Update order status error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update order',
      error: error.message
    });
  }
};

// Get order statistics (admin dashboard)
exports.getOrderStats = async (req, res) => {
  try {
    const { period = '30' } = req.query; // days
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - parseInt(period));

    // Total orders
    const totalOrders = await Order.countDocuments({
      createdAt: { $gte: startDate }
    });

    // Orders by status
    const ordersByStatus = await Order.aggregate([
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
    const revenueResult = await Order.aggregate([
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
    console.error('Get order stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch order statistics',
      error: error.message
    });
  }
};

// Bulk update order statuses (admin)
exports.bulkUpdateOrders = async (req, res) => {
  try {
    const { order_ids, status, tracking_number, notes } = req.body;

    if (!order_ids || !Array.isArray(order_ids) || order_ids.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Order IDs array is required'
      });
    }

    const updateData = {};
    if (status) updateData.status = status;
    if (tracking_number) updateData.tracking_number = tracking_number;
    if (notes) updateData.notes = notes;

    const result = await Order.updateMany(
      { _id: { $in: order_ids } },
      updateData
    );

    res.json({
      success: true,
      message: `Updated ${result.modifiedCount} orders successfully`,
      updated_count: result.modifiedCount
    });
  } catch (error) {
    console.error('Bulk update orders error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update orders',
      error: error.message
    });
  }
};

// Export orders (admin)
exports.exportOrders = async (req, res) => {
  try {
    const { status, date_from, date_to, format = 'json' } = req.query;

    const query = {};
    if (status) query.status = status;
    if (date_from || date_to) {
      query.createdAt = {};
      if (date_from) query.createdAt.$gte = new Date(date_from);
      if (date_to) query.createdAt.$lte = new Date(date_to + ' 23:59:59');
    }

    const orders = await Order.find(query)
      .populate('items')
      .populate({
        path: 'user_id',
        select: 'name email phone'
      })
      .sort({ createdAt: -1 });

    // Map orders to ensure user data is accessible via both user_id and user for frontend compatibility
    const mappedOrders = orders.map(order => {
      const orderObj = order.toObject ? order.toObject({ virtuals: true }) : { ...order };

      if (!orderObj.user) orderObj.user = {};

      if (orderObj.user_id && typeof orderObj.user_id === 'object' && orderObj.user_id._id) {
        orderObj.user = {
          _id: orderObj.user_id._id,
          name: orderObj.user_id.name,
          email: orderObj.user_id.email,
          phone: orderObj.user_id.phone
        };
      }

      // Prioritize snapshot if available
      if (orderObj.customer_name) {
        orderObj.user.name = orderObj.customer_name;
        orderObj.user.email = orderObj.customer_email;
        orderObj.user.phone = orderObj.customer_phone;
      }
      return orderObj;
    });

    if (format === 'csv') {
      // Convert to CSV format
      const csvData = mappedOrders.map(order => ({
        'Order Number': order.order_number,
        'Customer': order.user?.name || order.user_id?.name,
        'Email': order.user?.email || order.user_id?.email,
        'Status': order.status,
        'Total Amount': order.total_amount,
        'Payment Method': order.payment_method,
        'Payment Status': order.payment_status,
        'Created Date': order.createdAt,
        'Items Count': order.items?.length || 0
      }));

      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', 'attachment; filename=orders.csv');

      // Simple CSV conversion
      if (csvData.length === 0) {
        res.send('Order Number,Customer,Email,Status,Total Amount,Payment Method,Payment Status,Created Date,Items Count\n');
      } else {
        const csv = [
          Object.keys(csvData[0]).join(','),
          ...csvData.map(row => Object.values(row).join(','))
        ].join('\n');

        res.send(csv);
      }
    } else {
      res.json({
        success: true,
        data: mappedOrders,
        total: mappedOrders.length
      });
    }
  } catch (error) {
    console.error('Export orders error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to export orders',
      error: error.message
    });
  }
}; 
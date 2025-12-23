const FoodCart = require('../models/foodcart');
const FoodCartItem = require('../models/foodcartitem');
const Dish = require('../models/dish');
const Restaurant = require('../models/restaurant');

// Get user's food cart
exports.getFoodCart = async (req, res) => {
  try {
    const userId = req.user.id;
    
    const cart = await FoodCart.findOne({ user_id: userId })
      .populate('restaurant_id', 'name image rating delivery_time minimum_order delivery_fee')
      .populate({
        path: 'items',
        populate: {
          path: 'dish_id',
          model: 'Dish',
          select: 'name description image price original_price is_veg rating preparation_time'
        }
      });

    if (!cart) {
      return res.json({
        success: true,
        data: {
          items: [],
          total_items: 0,
          total_amount: 0,
          subtotal: 0,
          delivery_fee: 0,
          restaurant: null
        }
      });
    }

    res.json({
      success: true,
      data: cart
    });
  } catch (error) {
    console.error('Error fetching food cart:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching food cart',
      error: error.message
    });
  }
};

// Add item to food cart
exports.addToFoodCart = async (req, res) => {
  try {
    const userId = req.user.id;
    const { dish_id, quantity = 1, customizations = [], special_instructions = '' } = req.body;

    // Debug log for incoming dish_id
    console.log('🍽️ [addToFoodCart] Received dish_id:', dish_id);

    // Validate dish exists
    const dish = await Dish.findById(dish_id).populate('restaurant_id');
    console.log('🍽️ [addToFoodCart] Dish lookup result:', dish);

    if (!dish) {
      return res.status(404).json({
        success: false,
        message: 'Dish not found'
      });
    }

    if (!dish.availability || !dish.status) {
      return res.status(400).json({
        success: false,
        message: 'Dish is currently unavailable'
      });
    }

    const restaurantId = dish.restaurant_id._id;

    // Get or create cart
    let cart = await FoodCart.findOne({ user_id: userId });
    
    if (cart) {
      // Check if adding item from different restaurant
      if (cart.restaurant_id.toString() !== restaurantId.toString()) {
        return res.status(400).json({
          success: false,
          message: 'You can only order from one restaurant at a time. Clear your cart to order from a different restaurant.',
          current_restaurant: cart.restaurant_id
        });
      }
    } else {
      // Create new cart
      cart = new FoodCart({
        user_id: userId,
        restaurant_id: restaurantId
      });
      await cart.save();
    }

    // Check if item with same customizations already exists
    const existingItem = await FoodCartItem.findOne({
      cart_id: cart._id,
      dish_id: dish_id,
      customizations: { $eq: customizations }
    });

    if (existingItem) {
      // Update quantity and total_price
      existingItem.quantity += quantity;
      existingItem.total_price = existingItem.price * existingItem.quantity;
      await existingItem.save();
    } else {
      // Create new cart item
      const cartItem = new FoodCartItem({
        cart_id: cart._id,
        dish_id: dish_id,
        restaurant_id: restaurantId,
        quantity: quantity,
        price: dish.price,
        total_price: dish.price * quantity,
        original_price: dish.original_price,
        customizations: customizations,
        special_instructions: special_instructions,
        dish_snapshot: {
          name: dish.name,
          description: dish.description,
          image: dish.image,
          category: dish.category,
          is_veg: dish.is_veg,
          spice_level: dish.spice_level,
          preparation_time: dish.preparation_time,
          rating: dish.rating
        }
      });
      await cartItem.save();
    }

    // Update cart totals
    await updateCartTotals(cart._id);

    // Return updated cart
    const updatedCart = await FoodCart.findById(cart._id)
      .populate('restaurant_id', 'name image rating delivery_time minimum_order delivery_fee')
      .populate({
        path: 'items',
        populate: {
          path: 'dish_id',
          model: 'Dish'
        }
      });

    res.json({
      success: true,
      message: 'Item added to cart successfully',
      data: updatedCart
    });
  } catch (error) {
    console.error('Error adding to food cart:', error);
    res.status(500).json({
      success: false,
      message: 'Error adding to food cart',
      error: error.message
    });
  }
};

// Update item quantity in cart
exports.updateFoodCartItem = async (req, res) => {
  try {
    const userId = req.user.id;
    const { item_id } = req.params;
    const { quantity } = req.body;

    if (quantity < 1) {
      return res.status(400).json({
        success: false,
        message: 'Quantity must be at least 1'
      });
    }

    // Find cart item
    const cartItem = await FoodCartItem.findById(item_id).populate({
      path: 'cart_id',
      match: { user_id: userId }
    });

    if (!cartItem || !cartItem.cart_id) {
      return res.status(404).json({
        success: false,
        message: 'Cart item not found'
      });
    }

    // Update quantity
    cartItem.quantity = quantity;
    await cartItem.save();

    // Update cart totals
    await updateCartTotals(cartItem.cart_id._id);

    // Return updated cart
    const updatedCart = await FoodCart.findById(cartItem.cart_id._id)
      .populate('restaurant_id', 'name image rating delivery_time minimum_order delivery_fee')
      .populate({
        path: 'items',
        populate: {
          path: 'dish_id',
          model: 'Dish'
        }
      });

    res.json({
      success: true,
      message: 'Cart item updated successfully',
      data: updatedCart
    });
  } catch (error) {
    console.error('Error updating food cart item:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating food cart item',
      error: error.message
    });
  }
};

// Remove item from cart
exports.removeFoodCartItem = async (req, res) => {
  try {
    const userId = req.user.id;
    const { item_id } = req.params;

    // Find cart item
    const cartItem = await FoodCartItem.findById(item_id).populate({
      path: 'cart_id',
      match: { user_id: userId }
    });

    if (!cartItem || !cartItem.cart_id) {
      return res.status(404).json({
        success: false,
        message: 'Cart item not found'
      });
    }

    const cartId = cartItem.cart_id._id;

    // Remove cart item
    await FoodCartItem.findByIdAndDelete(item_id);

    // Update cart totals
    await updateCartTotals(cartId);

    // Check if cart is empty
    const remainingItems = await FoodCartItem.countDocuments({ cart_id: cartId });
    if (remainingItems === 0) {
      // Delete empty cart
      await FoodCart.findByIdAndDelete(cartId);
      return res.json({
        success: true,
        message: 'Item removed from cart',
        data: {
          items: [],
          total_items: 0,
          total_amount: 0,
          subtotal: 0,
          delivery_fee: 0,
          restaurant: null
        }
      });
    }

    // Return updated cart
    const updatedCart = await FoodCart.findById(cartId)
      .populate('restaurant_id', 'name image rating delivery_time minimum_order delivery_fee')
      .populate({
        path: 'items',
        populate: {
          path: 'dish_id',
          model: 'Dish'
        }
      });

    res.json({
      success: true,
      message: 'Item removed from cart',
      data: updatedCart
    });
  } catch (error) {
    console.error('Error removing food cart item:', error);
    res.status(500).json({
      success: false,
      message: 'Error removing food cart item',
      error: error.message
    });
  }
};

// Clear entire cart
exports.clearFoodCart = async (req, res) => {
  try {
    const userId = req.user.id;

    // Find and delete cart
    const cart = await FoodCart.findOne({ user_id: userId });
    if (cart) {
      // Delete all cart items
      await FoodCartItem.deleteMany({ cart_id: cart._id });
      // Delete cart
      await FoodCart.findByIdAndDelete(cart._id);
    }

    res.json({
      success: true,
      message: 'Cart cleared successfully',
      data: {
        items: [],
        total_items: 0,
        total_amount: 0,
        subtotal: 0,
        delivery_fee: 0,
        restaurant: null
      }
    });
  } catch (error) {
    console.error('Error clearing food cart:', error);
    res.status(500).json({
      success: false,
      message: 'Error clearing food cart',
      error: error.message
    });
  }
};

// Helper function to update cart totals
const updateCartTotals = async (cartId) => {
  try {
    const cart = await FoodCart.findById(cartId).populate('restaurant_id');
    const cartItems = await FoodCartItem.find({ cart_id: cartId });

    let subtotal = 0;
    let totalItems = 0;

    cartItems.forEach(item => {
      subtotal += item.total_price;
      totalItems += item.quantity;
    });

    // Calculate delivery fee based on restaurant and order amount
    let deliveryFee = 0;
    if (cart.restaurant_id) {
      deliveryFee = subtotal >= cart.restaurant_id.minimum_order 
        ? cart.restaurant_id.delivery_fee || 0 
        : (cart.restaurant_id.delivery_fee || 40);
    }

    // Calculate total
    const totalAmount = subtotal + deliveryFee + cart.tax_amount + cart.packaging_fee - cart.discount_amount;

    // Update cart
    cart.total_items = totalItems;
    cart.subtotal = subtotal;
    cart.delivery_fee = deliveryFee;
    cart.total_amount = totalAmount;
    
    await cart.save();

    return cart;
  } catch (error) {
    console.error('Error updating cart totals:', error);
    throw error;
  }
}; 
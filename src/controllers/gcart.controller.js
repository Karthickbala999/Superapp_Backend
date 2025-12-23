const GCartItem = require('../models/gcart_items');
const Grocery = require('../models/grocery');

// Get user's grocery cart
exports.getUserGroceryCart = async (req, res) => {
  try {
    const userId = req.user.id;
    const cartItems = await GCartItem.find({ user_id: userId })
      .populate('grocery')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      data: cartItems,
      count: cartItems.length
    });
  } catch (error) {
    console.error('Error fetching grocery cart:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching grocery cart',
      error: error.message
    });
  }
};

// Add item to grocery cart
exports.addToGroceryCart = async (req, res) => {
  try {
    const userId = req.user.id;
    const { grocery_id, quantity } = req.body;

    // Check if item already exists in cart
    const existingItem = await GCartItem.findOne({
      user_id: userId,
      grocery_id
    });

    if (existingItem) {
      // Update quantity
      existingItem.quantity += quantity || 1;
      await existingItem.save();
    } else {
      // Fetch price from Grocery model
      const grocery = await Grocery.findById(grocery_id);
      if (!grocery) {
        return res.status(404).json({
          success: false,
          message: 'Grocery item not found'
        });
      }
      // Create new cart item with price
      const cartItem = new GCartItem({
        user_id: userId,
        grocery_id,
        quantity: quantity || 1,
        price: grocery.discounted_price || grocery.original_price || 0
      });
      await cartItem.save();
    }

    // Return updated cart
    const updatedCart = await GCartItem.find({ user_id: userId })
      .populate('grocery')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      message: 'Item added to grocery cart successfully',
      data: updatedCart
    });
  } catch (error) {
    console.error('Error adding to grocery cart:', error);
    res.status(500).json({
      success: false,
      message: 'Error adding to grocery cart',
      error: error.message
    });
  }
};

// Update grocery cart item quantity
exports.updateGroceryCartItem = async (req, res) => {
  try {
    const userId = req.user.id;
    const { item_id } = req.params;
    const { quantity } = req.body;

    // Find cart item and verify ownership
    const cartItem = await GCartItem.findOne({ _id: item_id, user_id: userId });

    if (!cartItem) {
      return res.status(404).json({
        success: false,
        message: 'Cart item not found'
      });
    }

    if (quantity <= 0) {
      // Remove item if quantity is 0 or less
      await GCartItem.findByIdAndDelete(item_id);
    } else {
      // Update quantity
      cartItem.quantity = quantity;
      await cartItem.save();
    }

    // Return updated cart
    const updatedCart = await GCartItem.find({ user_id: userId })
      .populate('grocery')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      message: 'Grocery cart item updated successfully',
      data: updatedCart
    });
  } catch (error) {
    console.error('Error updating grocery cart item:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating grocery cart item',
      error: error.message
    });
  }
};

// Remove item from grocery cart
exports.removeFromGroceryCart = async (req, res) => {
  try {
    const userId = req.user.id;
    const { item_id } = req.params;

    // Find and remove cart item by _id
    const deleted = await GCartItem.findOneAndDelete({
      user_id: userId,
      _id: item_id
    });

    if (!deleted) {
      return res.status(404).json({
        success: false,
        message: 'Cart item not found'
      });
    }

    // Return updated cart
    const updatedCart = await GCartItem.find({ user_id: userId })
      .populate('grocery')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      message: 'Item removed from grocery cart successfully',
      data: updatedCart
    });
  } catch (error) {
    console.error('Error removing from grocery cart:', error);
    res.status(500).json({
      success: false,
      message: 'Error removing from grocery cart',
      error: error.message
    });
  }
};

// Clear grocery cart
exports.clearGroceryCart = async (req, res) => {
  try {
    const userId = req.user.id;

    await GCartItem.deleteMany({ user_id: userId });

    res.json({
      success: true,
      message: 'Grocery cart cleared successfully',
      data: []
    });
  } catch (error) {
    console.error('Error clearing grocery cart:', error);
    res.status(500).json({
      success: false,
      message: 'Error clearing grocery cart',
      error: error.message
    });
  }
};

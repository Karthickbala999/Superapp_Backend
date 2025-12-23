const Wishlist = require('../models/wishlist');
const Product = require('../models/product');

// Get user's wishlist
exports.getWishlist = async (req, res) => {
  try {
    const userId = req.user.id;
    console.log('=== GET WISHLIST DEBUG ===');
    console.log('User ID:', userId);
    
    const wishlistItems = await Wishlist.find({ user_id: userId })
      .populate({
        path: 'product_id',
        model: 'Product',
        populate: [
          { path: 'category_id', model: 'Category' },
          { path: 'brand_id', model: 'Brand' }
        ]
      })
      .sort({ createdAt: -1 });

    console.log('Found wishlist items:', wishlistItems.length);
    console.log('=== END GET WISHLIST DEBUG ===');

    res.json({
      success: true,
      data: wishlistItems,
      count: wishlistItems.length
    });
  } catch (error) {
    console.error('Error fetching wishlist:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching wishlist',
      error: error.message
    });
  }
};

// Get wishlist item by ID
exports.getWishlistItemById = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    // Validate item_id format
    if (!id.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid item ID format'
      });
    }

    const wishlistItem = await Wishlist.findOne({ 
      _id: id, 
      user_id: userId 
    }).populate({
      path: 'product_id',
      model: 'Product',
      populate: [
        { path: 'category_id', model: 'Category' },
        { path: 'brand_id', model: 'Brand' }
      ]
    });

    if (!wishlistItem) {
      return res.status(404).json({
        success: false,
        message: 'Wishlist item not found'
      });
    }

    res.json({
      success: true,
      data: wishlistItem
    });
  } catch (error) {
    console.error('Error fetching wishlist item:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching wishlist item',
      error: error.message
    });
  }
};

// Add item to wishlist
exports.addToWishlist = async (req, res) => {
  try {
    const userId = req.user.id;
    console.log('=== ADD TO WISHLIST DEBUG ===');
    console.log('Request body:', req.body);
    console.log('User ID:', userId);
    
    // Handle different request body formats (similar to cart)
    let product_id, quantity;
    
    if (req.body.productId) {
      product_id = req.body.productId;
      quantity = req.body.quantity || 1;
    } else if (req.body.product_id) {
      product_id = req.body.product_id;
      quantity = req.body.quantity || 1;
    } else if (req.body.id) {
      product_id = req.body.id;
      quantity = req.body.quantity || 1;
    }

    console.log('Extracted product_id:', product_id);

    if (!product_id) {
      return res.status(400).json({
        success: false,
        message: 'Product ID is required'
      });
    }

    // Validate MongoDB ObjectId format
    if (!product_id.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid product ID format'
      });
    }

    // Check if product exists
    const product = await Product.findById(product_id);
    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }

    // Check if item already exists in wishlist
    const existingItem = await Wishlist.findOne({
      user_id: userId,
      product_id
    });

    if (existingItem) {
      return res.status(400).json({
        success: false,
        message: 'Item already exists in wishlist'
      });
    }

    // Create new wishlist item
    const wishlistItem = new Wishlist({
      user_id: userId,
      product_id,
      quantity: parseInt(quantity) || 1
    });

    await wishlistItem.save();

    // Fetch the created item with product details
    const createdItem = await Wishlist.findById(wishlistItem._id)
      .populate({
        path: 'product_id',
        model: 'Product',
        populate: [
          { path: 'category_id', model: 'Category' },
          { path: 'brand_id', model: 'Brand' }
        ]
      });

    console.log('=== END ADD TO WISHLIST DEBUG ===');

    res.status(201).json({
      success: true,
      message: 'Item added to wishlist successfully',
      data: createdItem
    });
  } catch (error) {
    console.error('Error adding to wishlist:', error);
    res.status(500).json({
      success: false,
      message: 'Error adding to wishlist',
      error: error.message
    });
  }
};

// Update wishlist item
exports.updateWishlistItem = async (req, res) => {
  try {
    const { id } = req.params;
    const { quantity } = req.body;
    const userId = req.user.id;

    // Validate item_id format
    if (!id.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid item ID format'
      });
    }

    const validQuantity = parseInt(quantity);
    if (isNaN(validQuantity) || validQuantity < 1) {
      return res.status(400).json({
        success: false,
        message: 'Invalid quantity value'
      });
    }

    const wishlistItem = await Wishlist.findOne({ 
      _id: id, 
      user_id: userId 
    });

    if (!wishlistItem) {
      return res.status(404).json({
        success: false,
        message: 'Wishlist item not found'
      });
    }

    wishlistItem.quantity = validQuantity;
    await wishlistItem.save();

    // Return updated item with product details
    const updatedItem = await Wishlist.findById(wishlistItem._id)
      .populate({
        path: 'product_id',
        model: 'Product',
        populate: [
          { path: 'category_id', model: 'Category' },
          { path: 'brand_id', model: 'Brand' }
        ]
      });

    res.json({
      success: true,
      message: 'Wishlist item updated successfully',
      data: updatedItem
    });
  } catch (error) {
    console.error('Error updating wishlist item:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating wishlist item',
      error: error.message
    });
  }
};

// Remove item from wishlist
exports.removeFromWishlist = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    // Validate item_id format
    if (!id.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid item ID format'
      });
    }

    const wishlistItem = await Wishlist.findOne({ 
      _id: id, 
      user_id: userId 
    });

    if (!wishlistItem) {
      return res.status(404).json({
        success: false,
        message: 'Wishlist item not found'
      });
    }

    await Wishlist.findByIdAndDelete(id);

    res.json({
      success: true,
      message: 'Item removed from wishlist successfully'
    });
  } catch (error) {
    console.error('Error removing from wishlist:', error);
    res.status(500).json({
      success: false,
      message: 'Error removing from wishlist',
      error: error.message
    });
  }
};

// Clear wishlist
exports.clearWishlist = async (req, res) => {
  try {
    const userId = req.user.id;

    await Wishlist.deleteMany({ user_id: userId });

    res.json({
      success: true,
      message: 'Wishlist cleared successfully'
    });
  } catch (error) {
    console.error('Error clearing wishlist:', error);
    res.status(500).json({
      success: false,
      message: 'Error clearing wishlist',
      error: error.message
    });
  }
}; 
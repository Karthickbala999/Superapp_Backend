const Cart = require('../models/cart');
const CartItem = require('../models/cartitem');
const Product = require('../models/product');
const ProductVariation = require('../models/productvariation');

// Get user's cart
exports.getUserCart = async (req, res) => {
  try {
    const userId = req.user.id;
    let cart = await Cart.findOne({ user_id: userId });

    if (!cart) {
      cart = new Cart({ user_id: userId });
      await cart.save();
    }

    // Get cart with populated items
    const populatedCart = await Cart.findById(cart._id).populate({
      path: 'items',
      populate: [
        { 
          path: 'product_id', 
          model: 'Product',
          populate: [
            { path: 'category_id', model: 'Category' },
            { path: 'brand_id', model: 'Brand' }
          ]
        },
        { path: 'variation_id', model: 'ProductVariation' }
      ]
    });

    res.json({
      success: true,
      data: populatedCart
    });
  } catch (error) {
    console.error('Error fetching cart:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching cart',
      error: error.message
    });
  }
};

// Add item to cart - FIXED VERSION
exports.addToCart = async (req, res) => {
  try {
    const userId = req.user.id;
    console.log('=== ADD TO CART DEBUG ===');
    console.log('Request body:', req.body);
    console.log('User ID:', userId);
    
    // Robust data extraction - handles multiple frontend formats
    let product_id, variation_id, quantity;
    
    // Handle different request body formats
    if (req.body.productId) {
      product_id = req.body.productId;
      quantity = req.body.quantity || 1;
      variation_id = req.body.variation_id || req.body.variationId || null;
    } else if (req.body.product_id) {
      product_id = req.body.product_id;
      quantity = req.body.quantity || 1;
      variation_id = req.body.variation_id || null;
    } else if (req.body.id) {
      product_id = req.body.id;
      quantity = req.body.quantity || 1;
      variation_id = req.body.variation_id || null;
    } else {
      // Handle case where entire object is stringified and sent as key
      const bodyKeys = Object.keys(req.body);
      if (bodyKeys.length === 1 && bodyKeys[0].startsWith('{')) {
        try {
          const parsedData = JSON.parse(bodyKeys[0]);
          product_id = parsedData.productId || parsedData.product_id || parsedData.id;
          quantity = parsedData.quantity || 1;
          variation_id = parsedData.variation_id || parsedData.variationId || null;
        } catch (parseError) {
          console.error('Error parsing request body:', parseError);
        }
      }
    }

    console.log('Extracted product_id:', product_id);
    console.log('Extracted quantity:', quantity);
    console.log('Extracted variation_id:', variation_id);

    // Validation
    if (!product_id) {
      return res.status(400).json({
        success: false,
        message: 'Product ID is required',
        received: req.body
      });
    }

    // Validate MongoDB ObjectId format
    if (!product_id.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid product ID format',
        received: product_id
      });
    }

    // Validate product exists
    const product = await Product.findById(product_id);
    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found',
        product_id: product_id
      });
    }

    // Validate variation if provided
    if (variation_id) {
      if (!variation_id.match(/^[0-9a-fA-F]{24}$/)) {
        return res.status(400).json({
          success: false,
          message: 'Invalid variation ID format',
          received: variation_id
        });
      }
      
      const variation = await ProductVariation.findById(variation_id);
      if (!variation) {
        return res.status(404).json({
          success: false,
          message: 'Product variation not found',
          variation_id: variation_id
        });
      }
    }

    // Ensure quantity is a positive integer
    const validQuantity = Math.max(1, parseInt(quantity) || 1);

    // Find or create cart
    let cart = await Cart.findOne({ user_id: userId });
    if (!cart) {
      cart = new Cart({ user_id: userId });
      await cart.save();
    }

    // Check if item already exists in cart
    const existingItem = await CartItem.findOne({
      cart_id: cart._id,
      product_id,
      variation_id: variation_id || null
    });

    if (existingItem) {
      // Update quantity and total price
      existingItem.quantity += validQuantity;
      existingItem.total_price = existingItem.price * existingItem.quantity;
      await existingItem.save();
      console.log('Updated existing cart item quantity:', existingItem.quantity);
    } else {
      // Create new cart item (no need to push to cart.items - it's a virtual field)
      const itemPrice = product.sale_price || product.price;
      const cartItem = new CartItem({
        cart_id: cart._id,
        product_id,
        variation_id: variation_id || null,
        quantity: validQuantity,
        price: itemPrice,
        total_price: itemPrice * validQuantity
      });
      await cartItem.save();
      console.log('Created new cart item:', cartItem._id);
    }

    // Return updated cart with populated data
    const updatedCart = await Cart.findById(cart._id).populate({
      path: 'items',
      populate: [
        { 
          path: 'product_id', 
          model: 'Product',
          populate: [
            { path: 'category_id', model: 'Category' },
            { path: 'brand_id', model: 'Brand' }
          ]
        },
        { path: 'variation_id', model: 'ProductVariation' }
      ]
    });

    console.log('=== END ADD TO CART DEBUG ===');

    res.json({
      success: true,
      message: 'Item added to cart successfully',
      data: updatedCart
    });

  } catch (error) {
    console.error('Error adding to cart:', error);
    res.status(500).json({
      success: false,
      message: 'Error adding to cart',
      error: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
};

// Update item quantity in cart
exports.updateCartItem = async (req, res) => {
  try {
    const userId = req.user.id;
    const { itemId } = req.params; // Fixed: was item_id, should be itemId
    const { quantity } = req.body;

    console.log('=== UPDATE CART ITEM DEBUG ===');
    console.log('User ID:', userId);
    console.log('Item ID:', itemId);
    console.log('New Quantity:', quantity);
    console.log('Params object:', req.params);

    // Validate itemId format
    if (!itemId || !itemId.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid item ID format'
      });
    }

    // Validate quantity
    if (!quantity || quantity < 1 || quantity > 10) {
      return res.status(400).json({
        success: false,
        message: 'Quantity must be between 1 and 10'
      });
    }

    // Find the cart item
    const cartItem = await CartItem.findById(itemId).populate('product_id');

    if (!cartItem) {
      return res.status(404).json({
        success: false,
        message: 'Cart item not found'
      });
    }

    // Find the cart and verify ownership
    const cart = await Cart.findById(cartItem.cart_id);
    
    if (!cart || cart.user_id.toString() !== userId) {
      return res.status(404).json({
        success: false,
        message: 'Cart item not found'
      });
    }

    // Update quantity and calculate new total
    cartItem.quantity = quantity;
    cartItem.total_price = cartItem.price * quantity;
    await cartItem.save();

    // Get updated cart
    const updatedCart = await Cart.findOne({ user_id: userId }).populate({
      path: 'items',
      populate: {
        path: 'product_id',
        populate: { path: 'category_id' }
      }
    });

    // Calculate cart total
    const total = updatedCart.items.reduce((sum, item) => sum + item.total_price, 0);
    updatedCart.total_amount = total;
    await updatedCart.save();

    res.json({
      success: true,
      message: 'Cart item updated successfully',
      data: updatedCart
    });

  } catch (error) {
    console.error('Error updating cart item:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating cart item',
      error: error.message
    });
  }
};

// Remove item from cart
exports.removeFromCart = async (req, res) => {
  try {
    const userId = req.user.id;
    const { itemId } = req.params; // Fixed: was item_id, should be itemId

    console.log('=== REMOVE CART ITEM DEBUG ===');
    console.log('User ID:', userId);
    console.log('Item ID:', itemId);
    console.log('Params object:', req.params);

    // Validate itemId format
    if (!itemId || !itemId.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid item ID format'
      });
    }

    // Find cart item
    const cartItem = await CartItem.findById(itemId);
    
    if (!cartItem) {
      return res.status(404).json({
        success: false,
        message: 'Cart item not found'
      });
    }

    // Find the cart and verify ownership
    const cart = await Cart.findById(cartItem.cart_id);
    
    if (!cart || cart.user_id.toString() !== userId) {
      return res.status(404).json({
        success: false,
        message: 'Cart item not found'
      });
    }

    // Remove item
    await CartItem.findByIdAndDelete(itemId);

    // Return updated cart
    const updatedCart = await Cart.findById(cartItem.cart_id._id).populate({
      path: 'items',
      populate: [
        { 
          path: 'product_id', 
          model: 'Product',
          populate: [
            { path: 'category_id', model: 'Category' },
            { path: 'brand_id', model: 'Brand' }
          ]
        },
        { path: 'variation_id', model: 'ProductVariation' }
      ]
    });

    // Calculate cart total
    const total = updatedCart.items.reduce((sum, item) => sum + item.total_price, 0);
    updatedCart.total_amount = total;
    await updatedCart.save();

    res.json({
      success: true,
      message: 'Item removed from cart successfully',
      data: updatedCart
    });

  } catch (error) {
    console.error('Error removing cart item:', error);
    res.status(500).json({
      success: false,
      message: 'Error removing cart item',
      error: error.message
    });
  }
};

// Clear cart
exports.clearCart = async (req, res) => {
  try {
    const userId = req.user.id;

    const cart = await Cart.findOne({ user_id: userId });
    if (!cart) {
      return res.status(404).json({
        success: false,
        message: 'Cart not found'
      });
    }

    // Remove all cart items for this cart
    await CartItem.deleteMany({ cart_id: cart._id });

    // Return empty cart
    const updatedCart = await Cart.findById(cart._id).populate('items');

    res.json({
      success: true,
      message: 'Cart cleared successfully',
      data: updatedCart
    });
  } catch (error) {
    console.error('Error clearing cart:', error);
    res.status(500).json({
      success: false,
      message: 'Error clearing cart',
      error: error.message
    });
  }
}; 
const mongoose = require('mongoose');
const Restaurant = require('../models/restaurant');
const RestaurantCategory = require('../models/restaurantcategory');
const { processImage } = require('../utils/imageProcessor');
const path = require('path');
const fs = require('fs');
const slugify = require('slugify');

// Get all restaurants
exports.getAllRestaurants = async (req, res) => {
  try {
    const restaurants = await Restaurant.find()
      .populate('category_id', 'name')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      data: restaurants,
      count: restaurants.length
    });
  } catch (error) {
    console.error('Error fetching restaurants:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching restaurants',
      error: error.message
    });
  }
};

// Get restaurant by ID
exports.getRestaurantById = async (req, res) => {
  try {
    // Validate ObjectId format
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid restaurant ID format'
      });
    }

    const restaurant = await Restaurant.findById(req.params.id)
      .populate('category_id', 'name');

    if (!restaurant) {
      return res.status(404).json({
        success: false,
        message: 'Restaurant not found'
      });
    }

    res.json({
      success: true,
      data: restaurant
    });
  } catch (error) {
    console.error('Error fetching restaurant:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching restaurant',
      error: error.message
    });
  }
};

// Create restaurant
exports.createRestaurant = async (req, res) => {
  try {
    const {
      name,
      description,
      address,
      phone,
      email,
      category_id,
      cuisine_type,
      opening_hours,
      delivery_radius,
      minimum_order,
      delivery_fee,
      status
    } = req.body;

    // Validate category exists
    if (category_id) {
      const category = await RestaurantCategory.findById(category_id);
      if (!category) {
        return res.status(404).json({
          success: false,
          message: 'Restaurant category not found'
        });
      }
    }

    let imagePath = null;
    if (req.file) {
      const processedImage = await processImage(req.file, {
        width: 800,
        height: 800,
        quality: 85,
        format: 'jpeg'
      }, 'restaurants');
      imagePath = `/uploads/restaurants/${processedImage.filename}`;
    }

    const restaurant = new Restaurant({
      name,
      description,
      slug: slugify(name, { lower: true }),
      address,
      phone,
      email,
      category_id: category_id || null,
      cuisine_type,
      opening_hours,
      delivery_radius: parseFloat(delivery_radius) || 5,
      minimum_order: parseFloat(minimum_order) || 0,
      delivery_fee: parseFloat(delivery_fee) || 0,
      image: imagePath,
      status: status === 'true' || status === true
    });

    await restaurant.save();

    res.status(201).json({
      success: true,
      message: 'Restaurant created successfully',
      data: restaurant
    });
  } catch (error) {
    console.error('Error creating restaurant:', error);
    res.status(500).json({
      success: false,
      message: 'Error creating restaurant',
      error: error.message
    });
  }
};

// Update restaurant
exports.updateRestaurant = async (req, res) => {
  try {
    const restaurant = await Restaurant.findById(req.params.id);
    if (!restaurant) {
      return res.status(404).json({
        success: false,
        message: 'Restaurant not found'
      });
    }

    const {
      name,
      description,
      address,
      phone,
      email,
      category_id,
      cuisine_type,
      opening_hours,
      delivery_radius,
      minimum_order,
      delivery_fee,
      status
    } = req.body;

    let imagePath = restaurant.image;
    if (req.file) {
      // Delete old image if exists
      if (restaurant.image) {
        const oldImagePath = path.join(__dirname, '..', '..', 'uploads', restaurant.image.replace('/uploads/', ''));
        if (fs.existsSync(oldImagePath)) {
          fs.unlinkSync(oldImagePath);
        }
      }
      
      const processedImage = await processImage(req.file, {
        width: 800,
        height: 800,
        quality: 85,
        format: 'jpeg'
      }, 'restaurants');
      imagePath = `/uploads/restaurants/${processedImage.filename}`;
    }

    restaurant.name = name || restaurant.name;
    restaurant.description = description || restaurant.description;
    restaurant.slug = name ? slugify(name, { lower: true }) : restaurant.slug;
    restaurant.address = address || restaurant.address;
    restaurant.phone = phone || restaurant.phone;
    restaurant.email = email || restaurant.email;
    restaurant.category_id = category_id || restaurant.category_id;
    restaurant.cuisine_type = cuisine_type || restaurant.cuisine_type;
    restaurant.opening_hours = opening_hours || restaurant.opening_hours;
    restaurant.delivery_radius = delivery_radius ? parseFloat(delivery_radius) : restaurant.delivery_radius;
    restaurant.minimum_order = minimum_order ? parseFloat(minimum_order) : restaurant.minimum_order;
    restaurant.delivery_fee = delivery_fee ? parseFloat(delivery_fee) : restaurant.delivery_fee;
    restaurant.image = imagePath;
    restaurant.status = status !== undefined ? (status === 'true' || status === true) : restaurant.status;

    await restaurant.save();

    res.json({
      success: true,
      message: 'Restaurant updated successfully',
      data: restaurant
    });
  } catch (error) {
    console.error('Error updating restaurant:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating restaurant',
      error: error.message
    });
  }
};

// Delete restaurant
exports.deleteRestaurant = async (req, res) => {
  try {
    const restaurant = await Restaurant.findById(req.params.id);
    if (!restaurant) {
      return res.status(404).json({
        success: false,
        message: 'Restaurant not found'
      });
    }

    // Check if restaurant has associated dishes
    const Dish = require('../models/dish');
    const dishCount = await Dish.countDocuments({ restaurant_id: req.params.id });

    if (dishCount > 0) {
      return res.status(400).json({
        success: false,
        message: 'Cannot delete restaurant with associated dishes. Please delete or reassign dishes first.'
      });
    }

    await Restaurant.findByIdAndDelete(req.params.id);

    res.json({
      success: true,
      message: 'Restaurant deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting restaurant:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting restaurant',
      error: error.message
    });
  }
};

// Search restaurants
exports.searchRestaurants = async (req, res) => {
  try {
    const { q, category_id, cuisine_type } = req.query;
    let query = {};

    if (q) {
      query.$or = [
        { name: { $regex: q, $options: 'i' } },
        { description: { $regex: q, $options: 'i' } },
        { cuisine_type: { $regex: q, $options: 'i' } }
      ];
    }

    if (category_id) {
      query.category_id = category_id;
    }

    if (cuisine_type) {
      query.cuisine_type = cuisine_type;
    }

    const restaurants = await Restaurant.find(query)
      .populate('category_id', 'name')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      data: restaurants,
      count: restaurants.length
    });
  } catch (error) {
    console.error('Error searching restaurants:', error);
    res.status(500).json({
      success: false,
      message: 'Error searching restaurants',
      error: error.message
    });
  }
};

// Get active restaurants only
exports.getActiveRestaurants = async (req, res) => {
  try {
    const restaurants = await Restaurant.find({ status: true })
      .populate('category_id', 'name')
      .sort({ name: 1 });

    res.json({
      success: true,
      data: restaurants,
      count: restaurants.length
    });
  } catch (error) {
    console.error('Error fetching active restaurants:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching active restaurants',
      error: error.message
    });
  }
}; 
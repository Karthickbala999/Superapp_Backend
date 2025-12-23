const RestaurantCategory = require('../models/restaurantcategory');
const { processImage } = require('../utils/imageProcessor');

module.exports = {
  // List all categories
  async getAll(req, res) {
    try {
      const categories = await RestaurantCategory.find().sort({ createdAt: -1 });
      res.json({
        success: true,
        data: categories
      });
    } catch (err) {
      res.status(500).json({ 
        success: false,
        error: 'Failed to fetch categories', 
        details: err.message 
      });
    }
  },

  // Get category by ID
  async getById(req, res) {
    try {
      const category = await RestaurantCategory.findById(req.params.id);
      if (!category) {
        return res.status(404).json({ 
          success: false,
          error: 'Category not found' 
        });
      }
      res.json({
        success: true,
        data: category
      });
    } catch (err) {
      res.status(500).json({ 
        success: false,
        error: 'Failed to fetch category', 
        details: err.message 
      });
    }
  },

  // Create category
  async create(req, res) {
    try {
      const { name, slug, description, status } = req.body;
      
      // Handle image upload
      let imagePath = null;
      if (req.file) {
        const processedImage = await processImage(req.file, {}, 'restaurant_categories');
        imagePath = `/uploads/restaurant_categories/${processedImage.filename}`;
      }

      const category = new RestaurantCategory({ 
        name, 
        slug,
        description, 
        image: imagePath,
        status: status === 'true' || status === true
      });
      
      await category.save();
      
      res.status(201).json({
        success: true,
        message: 'Restaurant category created successfully',
        data: category
      });
    } catch (err) {
      res.status(400).json({ 
        success: false,
        error: 'Failed to create category', 
        details: err.message 
      });
    }
  },

  // Update category
  async update(req, res) {
    try {
      const { name, slug, description, status } = req.body;
      const category = await RestaurantCategory.findById(req.params.id);
      
      if (!category) {
        return res.status(404).json({ 
          success: false,
          error: 'Category not found' 
        });
      }
      
      // Handle image upload
      let imagePath = category.image; // Keep existing image if no new one
      if (req.file) {
        const processedImage = await processImage(req.file, {}, 'restaurant_categories');
        imagePath = `/uploads/restaurant_categories/${processedImage.filename}`;
      }

      category.name = name || category.name;
      category.slug = slug || category.slug;
      category.description = description || category.description;
      category.image = imagePath;
      category.status = status === 'true' || status === true;
      
      await category.save();
      
      res.json({
        success: true,
        message: 'Restaurant category updated successfully',
        data: category
      });
    } catch (err) {
      res.status(400).json({ 
        success: false,
        error: 'Failed to update category', 
        details: err.message 
      });
    }
  },

  // Delete category
  async delete(req, res) {
    try {
      const category = await RestaurantCategory.findById(req.params.id);
      if (!category) {
        return res.status(404).json({ 
          success: false,
          error: 'Category not found' 
        });
      }
      await RestaurantCategory.findByIdAndDelete(req.params.id);
      res.json({ 
        success: true,
        message: 'Category deleted successfully' 
      });
    } catch (err) {
      res.status(500).json({ 
        success: false,
        error: 'Failed to delete category', 
        details: err.message 
      });
    }
  }
}; 
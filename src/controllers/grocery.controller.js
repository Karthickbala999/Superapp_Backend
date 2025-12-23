const Grocery = require('../models/grocery');
const path = require('path');
const fs = require('fs');
const fsPromises = require('fs').promises;
const { processImage } = require('../utils/imageProcessor');

// Get all groceries
exports.getAllGroceries = async (req, res) => {
  try {
    const groceries = await Grocery.find().sort({ createdAt: -1 });
    res.json({ success: true, data: groceries });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error fetching groceries', error: error.message });
  }
};

// Get grocery by ID
exports.getGroceryById = async (req, res) => {
  try {
    const grocery = await Grocery.findById(req.params.id);
    if (!grocery) return res.status(404).json({ success: false, message: 'Grocery not found' });
    res.json({ success: true, data: grocery });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error fetching grocery', error: error.message });
  }
};

// Create grocery (with image upload)
exports.createGrocery = async (req, res) => {
  try {
    const { name, description, original_price, discounted_price, rating, is_best_seller, quantity, category, status } = req.body;
    let imagePath = null;
    
    if (req.file) {
      // Correctly call the image processor and construct the web-accessible URL
      const processedImage = await processImage(req.file, {}, 'groceries');
      imagePath = `/uploads/groceries/${processedImage.filename}`;
    }

    const grocery = new Grocery({
      name,
      description,
      original_price,
      discounted_price,
      rating,
      is_best_seller: is_best_seller === 'true' || is_best_seller === true,
      quantity,
      category,
      status: status === 'true' || status === true,
      image: imagePath
    });
    
    await grocery.save();
    res.status(201).json({ success: true, message: 'Grocery created successfully', data: grocery });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error creating grocery', error: error.message });
  }
};

// Update grocery (with image upload and old image cleanup)
exports.updateGrocery = async (req, res) => {
  try {
    const grocery = await Grocery.findById(req.params.id);
    if (!grocery) {
      return res.status(404).json({ success: false, message: 'Grocery not found' });
    }

    const { 
      name, 
      description, 
      original_price, 
      discounted_price, 
      rating, 
      is_best_seller, 
      quantity, 
      category, 
      status 
    } = req.body;
    
    let imagePath = grocery.image;

    if (req.file) {
      // Delete the old image if it exists
      if (grocery.image) {
        const imagePath = path.join(__dirname, '..', '..', 'uploads', grocery.image);
        try {
          if (fs.existsSync(imagePath)) {
            await fsPromises.unlink(imagePath);
          }
        } catch (e) {
          console.error("Error deleting old image:", e);
        }
      }
      
      const processedImage = await processImage(req.file, {}, 'groceries');
      imagePath = `/uploads/groceries/${processedImage.filename}`;
    }

    grocery.name = name || grocery.name;
    grocery.description = description || grocery.description;
    grocery.original_price = (original_price === '' || original_price === null) ? null : original_price;
    grocery.discounted_price = (discounted_price === '' || discounted_price === null) ? null : discounted_price;
    grocery.rating = (rating === '' || rating === null) ? null : rating;
    grocery.is_best_seller = is_best_seller === 'true' || is_best_seller === true;
    grocery.quantity = (quantity === '' || quantity === null) ? null : quantity;
    grocery.category = category || grocery.category;
    grocery.status = status === 'true' || status === true;
    grocery.image = imagePath;

    await grocery.save();
    res.json({ success: true, message: 'Grocery updated successfully', data: grocery });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error updating grocery', error: error.message });
  }
};

// Delete grocery (with image deletion)
exports.deleteGrocery = async (req, res) => {
  try {
    const grocery = await Grocery.findById(req.params.id);
    if (!grocery) return res.status(404).json({ success: false, message: 'Grocery not found' });
    if (grocery.image) {
      const imagePath = path.join(__dirname, '..', '..', 'uploads', grocery.image.replace('/uploads/', ''));
      try { 
        if (fs.existsSync(imagePath)) {
          await fsPromises.unlink(imagePath); 
        }
      } catch (e) {
        console.error("Error deleting image on grocery deletion:", e)
      }
    }
    await Grocery.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: 'Grocery deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error deleting grocery', error: error.message });
  }
}; 
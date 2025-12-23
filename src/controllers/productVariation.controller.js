const { ProductVariation, Product } = require('../models');
const { processImage } = require('../utils/imageProcessor');
const path = require('path');
const fs = require('fs');

// Get all variations for a product
exports.getProductVariations = async (req, res) => {
  try {
    const variations = await ProductVariation.findAll({
      where: { product_id: req.params.productId }
    });
    res.json(variations);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get variation by ID
exports.getVariationById = async (req, res) => {
  try {
    const variation = await ProductVariation.findByPk(req.params.id);
    if (!variation) {
      return res.status(404).json({ message: 'Variation not found' });
    }
    res.json(variation);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Create variation
exports.createVariation = async (req, res) => {
  try {
    const { product_id, sku, price, sale_price, stock, attributes, status } = req.body;
    let image = null;

    if (req.file) {
      const processedImage = await processImage(req.file, {
        width: 800,
        height: 800,
        quality: 85,
        format: 'jpeg'
      });
      image = path.join('uploads', 'products', 'variations', processedImage.filename);
    }

    const variation = await ProductVariation.create({
      product_id,
      sku,
      price,
      sale_price,
      stock,
      attributes,
      image,
      status
    });

    res.status(201).json(variation);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Update variation
exports.updateVariation = async (req, res) => {
  try {
    const variation = await ProductVariation.findByPk(req.params.id);
    if (!variation) {
      return res.status(404).json({ message: 'Variation not found' });
    }

    const { sku, price, sale_price, stock, attributes, status } = req.body;
    let image = variation.image;

    if (req.file) {
      const processedImage = await processImage(req.file, {
        width: 800,
        height: 800,
        quality: 85,
        format: 'jpeg'
      });
      image = path.join('uploads', 'products', 'variations', processedImage.filename);

      // Delete old image if exists
      if (variation.image) {
        const oldImagePath = path.join(__dirname, '..', '..', variation.image);
        if (fs.existsSync(oldImagePath)) {
          fs.unlinkSync(oldImagePath);
        }
      }
    }

    await variation.update({
      sku,
      price,
      sale_price,
      stock,
      attributes,
      image,
      status
    });

    res.json(variation);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Delete variation
exports.deleteVariation = async (req, res) => {
  try {
    const variation = await ProductVariation.findByPk(req.params.id);
    if (!variation) {
      return res.status(404).json({ message: 'Variation not found' });
    }

    // Delete variation image if exists
    if (variation.image) {
      const imagePath = path.join(__dirname, '..', '..', variation.image);
      if (fs.existsSync(imagePath)) {
        fs.unlinkSync(imagePath);
      }
    }

    await variation.destroy();
    res.json({ message: 'Variation deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
}; 
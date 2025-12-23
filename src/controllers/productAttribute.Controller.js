const ProductAttribute = require('../models/productattribute');
const { processImage } = require('../utils/imageProcessor');
const path = require('path');
const fs = require('fs');

exports.create = async (req, res) => {
  try {
    const { product_id, name, value } = req.body;
    let imagePath = null;

    // Image is required for create
    if (req.file) {
      const processedImage = await processImage(req.file, {
        width: 800,
        height: 800,
        quality: 85,
        format: 'jpeg'
      }, 'hotel_attributes');
      imagePath = `/uploads/hotel_attributes/${processedImage.filename}`;
    } else {
      return res.status(400).json({ message: 'Attribute image is required.' });
    }

    const attribute = new ProductAttribute({
      product_id,
      name,
      value,
      image: imagePath
    });
    await attribute.save();
    res.status(201).json(attribute);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getByProduct = async (req, res) => {
  try {
    const { product_id } = req.params;
    const attributes = await ProductAttribute.find({ product_id });
    res.json(attributes);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.update = async (req, res) => {
  try {
    const { id } = req.params;
    const attribute = await ProductAttribute.findById(id);
    if (!attribute) return res.status(404).json({ message: 'Attribute not found' });

    const { product_id, name, value } = req.body;
    let imagePath = attribute.image;

    // If new image uploaded, process and replace old
    if (req.file) {
      // Delete old image if exists
      if (attribute.image) {
        const oldImagePath = path.join(__dirname, '..', '..', 'uploads', attribute.image.replace('/uploads/', ''));
        if (fs.existsSync(oldImagePath)) {
          fs.unlinkSync(oldImagePath);
        }
      }
      const processedImage = await processImage(req.file, {
        width: 800,
        height: 800,
        quality: 85,
        format: 'jpeg'
      }, 'hotel_attributes');
      imagePath = `/uploads/hotel_attributes/${processedImage.filename}`;
    }

    attribute.product_id = product_id || attribute.product_id;
    attribute.name = name || attribute.name;
    attribute.value = value || attribute.value;
    attribute.image = imagePath;
    await attribute.save();
    res.json({ message: 'Updated', attribute });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.delete = async (req, res) => {
  try {
    const { id } = req.params;
    await ProductAttribute.findByIdAndDelete(id);
    res.json({ message: 'Deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const Category = require('../models/category');
const Product = require('../models/product');
const { processImage } = require('../utils/imageProcessor');
const path = require('path');
const slugify = require('slugify');
const fs = require('fs');
const mongoose = require('mongoose');

// Generate a unique slug
const generateUniqueSlug = async (baseName, currentId = null) => {
  let baseSlug = slugify(baseName, { lower: true, strict: true });
  let slug = baseSlug;
  let counter = 1;

  while (true) {
    const query = { slug };
    if (currentId) query._id = { $ne: currentId }; // Exclude current ID on update

    const existing = await Category.findOne(query);
    if (!existing) break;

    slug = `${baseSlug}-${counter++}`;
  }

  return slug;
};

// Helper function to transform category data for frontend
const transformCategoryForFrontend = (category) => ({
  id: category._id,
  name: category.name,
  description: category.description,
  slug: category.slug,
  image: category.image,
  parent_id: category.parent_id,
  status: category.status,
  meta_title: category.meta_title,
  meta_description: category.meta_description,
  createdAt: category.createdAt,
  updatedAt: category.updatedAt
});

// Get all categories
exports.getAllCategories = async (req, res) => {
  try {
    const categories = await Category.find()
      .populate('parentCategory')
      .sort({ createdAt: -1 });

    const transformedCategories = categories.map(category => ({
      ...transformCategoryForFrontend(category),
      parentCategory: category.parentCategory ? {
        id: category.parentCategory._id,
        name: category.parentCategory.name
      } : null
    }));

    res.json(transformedCategories);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get active parent categories only (for home page)
exports.getParentCategories = async (req, res) => {
  try {
    const parentCategories = await Category.find({ 
      parent_id: null,  // Only parent categories
      status: true      // Only active categories
    }).sort({ createdAt: -1 });

    const transformedCategories = parentCategories.map(category => ({
      ...transformCategoryForFrontend(category)
    }));

    res.json(transformedCategories);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get children categories by parent ID
exports.getChildrenByParentId = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Validate ObjectId
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: 'Invalid category ID' });
    }

    const childrenCategories = await Category.find({ 
      parent_id: id,
      status: true  // Only active subcategories
    }).sort({ createdAt: -1 });

    const transformedCategories = childrenCategories.map(category => ({
      ...transformCategoryForFrontend(category)
    }));

    res.json(transformedCategories);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get category by ID
exports.getCategoryById = async (req, res) => {
  try {
    const category = await Category.findById(req.params.id)
      .populate({ path: 'childCategories', populate: { path: 'childCategories' } })
      .populate('parentCategory');

    if (!category) {
      return res.status(404).json({ message: 'Category not found' });
    }

    const transformedCategory = {
      ...transformCategoryForFrontend(category),
      parentCategory: category.parentCategory ? {
        id: category.parentCategory._id,
        name: category.parentCategory.name
      } : null,
      childCategories: category.childCategories ? category.childCategories.map(transformCategoryForFrontend) : []
    };

    res.json(transformedCategory);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Create new category
exports.createCategory = async (req, res) => {
  try {
    const { name, description, parent_id, status, meta_title, meta_description } = req.body;
    let imagePath = null;

    if (req.file) {
      const processedImage = await processImage(req.file, {
        width: 800,
        height: 800,
        quality: 85,
        format: 'jpeg'
      }, 'categories');
      imagePath = `/uploads/categories/${processedImage.filename}`;
    }

    let validParentId = null;
    if (parent_id && mongoose.Types.ObjectId.isValid(parent_id)) {
      validParentId = parent_id;
    }

    const uniqueSlug = await generateUniqueSlug(name);

    const category = new Category({
      name,
      description,
      slug: uniqueSlug,
      image: imagePath,
      status: status !== undefined ? String(status) === 'true' : true,
      parent_id: validParentId,
      meta_title,
      meta_description
    });

    await category.save();
    res.status(201).json(transformCategoryForFrontend(category));
  } catch (error) {
    console.error('Create category error:', error);
    res.status(500).json({
      message: 'An unexpected error occurred while creating the category.',
      error: error.message
    });
  }
};

// Update category
exports.updateCategory = async (req, res) => {
  try {
    const category = await Category.findById(req.params.id);
    if (!category) return res.status(404).json({ message: 'Category not found' });

    const { name, description, parent_id, status, meta_title, meta_description } = req.body;
    let imagePath = category.image;

    if (req.file) {
      if (category.image) {
        const oldImagePath = path.join(__dirname, '..', '..', 'uploads', category.image);
        if (fs.existsSync(oldImagePath)) fs.unlinkSync(oldImagePath);
      }

      const processedImage = await processImage(req.file, {
        width: 800,
        height: 800,
        quality: 85,
        format: 'jpeg'
      }, 'categories');

      imagePath = `/uploads/categories/${processedImage.filename}`;
    }

    let validParentId = category.parent_id;
    if (parent_id === 'null' || parent_id === '' || parent_id === null) {
      validParentId = null;
    } else if (mongoose.Types.ObjectId.isValid(parent_id)) {
      validParentId = parent_id;
    }

    category.name = name || category.name;
    category.description = description || category.description;
    category.slug = name ? await generateUniqueSlug(name, category._id) : category.slug;
    category.image = imagePath;
    category.status = typeof status !== 'undefined' ? (String(status) === 'true') : category.status;
    category.parent_id = validParentId;
    category.meta_title = meta_title || category.meta_title;
    category.meta_description = meta_description || category.meta_description;

    await category.save();
    res.json(transformCategoryForFrontend(category));
  } catch (error) {
    console.error('Update category error:', error);
    res.status(500).json({
      message: 'An unexpected error occurred while updating the category.',
      error: error.message
    });
  }
};

// Delete category
exports.deleteCategory = async (req, res) => {
  try {
    const category = await Category.findById(req.params.id).populate('childCategories');
    if (!category) return res.status(404).json({ message: 'Category not found' });

    if (category.childCategories && category.childCategories.length > 0) {
      return res.status(400).json({
        message: 'Cannot delete category with subcategories. Please delete or reassign subcategories first.'
      });
    }

    const productCount = await Product.countDocuments({ category_id: req.params.id });
    if (productCount > 0) {
      return res.status(400).json({
        message: 'Cannot delete category with associated products. Please delete or reassign products first.'
      });
    }

    await Category.findByIdAndDelete(req.params.id);
    res.json({ message: 'Category deleted successfully' });
  } catch (error) {
    console.error('Delete category error:', error);
    res.status(500).json({
      message: 'An unexpected error occurred while deleting the category.',
      error: error.message
    });
  }
};

// Get categories by parent ID
exports.getCategoriesByParent = async (req, res) => {
  try {
    const { parent_id } = req.params;
    const categories = await Category.find({ parent_id }).populate('childCategories');
    res.json(categories);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Search categories
exports.searchCategories = async (req, res) => {
  try {
    const { q } = req.query;
    const categories = await Category.find({
      $or: [
        { name: { $regex: q, $options: 'i' } },
        { description: { $regex: q, $options: 'i' } }
      ]
    });
    res.json(categories);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get active categories only
exports.getActiveCategories = async (req, res) => {
  try {
    const categories = await Category.find({ status: true })
      .populate({
        path: 'childCategories',
        match: { status: true },
        populate: {
          path: 'childCategories',
          match: { status: true }
        }
      });
    res.json(categories);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

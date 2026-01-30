const ServiceCategory = require('../../models/urban-services/serviceCategory');
const asyncHandler = require('express-async-handler');

// @desc    Get all service categories
// @route   GET /api/urban-services/categories
// @access  Public
const getCategories = asyncHandler(async (req, res) => {
  const { parent, active, city } = req.query;
  
  let query = {};
  
  if (parent) {
    query.parentCategory = parent === 'null' ? null : parent;
  }
  
  if (active !== undefined) {
    query.isActive = active === 'true';
  }
  
  if (city) {
    query.serviceAreas = { $in: [city] };
  }
  
  const categories = await ServiceCategory.find(query)
    .populate('parentCategory', 'name slug')
    .sort({ sortOrder: 1, name: 1 });
  
  res.json({
    success: true,
    count: categories.length,
    data: categories
  });
});

// @desc    Get single service category
// @route   GET /api/urban-services/categories/:id
// @access  Public
const getCategoryById = asyncHandler(async (req, res) => {
  const category = await ServiceCategory.findById(req.params.id)
    .populate('parentCategory', 'name slug')
    .populate('subcategories', 'name slug icon image')
    .populate('services', 'name description price');
  
  if (!category) {
    return res.status(404).json({
      success: false,
      message: 'Category not found'
    });
  }
  
  res.json({
    success: true,
    data: category
  });
});

// @desc    Create service category
// @route   POST /api/urban-services/categories
// @access  Private/Admin
const createCategory = asyncHandler(async (req, res) => {
  const category = new ServiceCategory(req.body);
  
  // Generate slug from name if not provided
  if (!category.slug) {
    category.slug = category.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
  }
  
  const savedCategory = await category.save();
  
  res.status(201).json({
    success: true,
    data: savedCategory
  });
});

// @desc    Update service category
// @route   PUT /api/urban-services/categories/:id
// @access  Private/Admin
const updateCategory = asyncHandler(async (req, res) => {
  const category = await ServiceCategory.findById(req.params.id);
  
  if (!category) {
    return res.status(404).json({
      success: false,
      message: 'Category not found'
    });
  }
  
  Object.assign(category, req.body);
  
  if (req.body.name && !req.body.slug) {
    category.slug = req.body.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
  }
  
  const updatedCategory = await category.save();
  
  res.json({
    success: true,
    data: updatedCategory
  });
});

// @desc    Delete service category
// @route   DELETE /api/urban-services/categories/:id
// @access  Private/Admin
const deleteCategory = asyncHandler(async (req, res) => {
  const category = await ServiceCategory.findById(req.params.id);
  
  if (!category) {
    return res.status(404).json({
      success: false,
      message: 'Category not found'
    });
  }
  
  // Check if category has subcategories
  const hasSubcategories = await ServiceCategory.findOne({ parentCategory: req.params.id });
  if (hasSubcategories) {
    return res.status(400).json({
      success: false,
      message: 'Cannot delete category with subcategories'
    });
  }
  
  await ServiceCategory.findByIdAndDelete(req.params.id);
  
  res.json({
    success: true,
    message: 'Category deleted successfully'
  });
});

// @desc    Get category tree
// @route   GET /api/urban-services/categories/tree
// @access  Public
const getCategoryTree = asyncHandler(async (req, res) => {
  const { city } = req.query;
  
  let query = { parentCategory: null };
  if (city) {
    query.serviceAreas = { $in: [city] };
  }
  
  const rootCategories = await ServiceCategory.find(query)
    .populate({
      path: 'subcategories',
      populate: {
        path: 'subcategories',
        model: 'ServiceCategory'
      }
    })
    .sort({ sortOrder: 1, name: 1 });
  
  res.json({
    success: true,
    data: rootCategories
  });
});

// @desc    Update category order
// @route   PUT /api/urban-services/categories/reorder
// @access  Private/Admin
const reorderCategories = asyncHandler(async (req, res) => {
  const { categories } = req.body;
  
  const updatePromises = categories.map(({ id, sortOrder }) =>
    ServiceCategory.findByIdAndUpdate(id, { sortOrder }, { new: true })
  );
  
  await Promise.all(updatePromises);
  
  res.json({
    success: true,
    message: 'Categories reordered successfully'
  });
});

module.exports = {
  getCategories,
  getCategoryById,
  createCategory,
  updateCategory,
  deleteCategory,
  getCategoryTree,
  reorderCategories
};

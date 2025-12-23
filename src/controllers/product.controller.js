const Product = require('../models/product');
const ProductVariation = require('../models/productvariation');
const Brand = require('../models/brand');
const Category = require('../models/category');
const Size = require('../models/size');
const Color = require('../models/color');
const Unit = require('../models/unit');
const { processImage } = require('../utils/imageProcessor');
const path = require('path');
const fs = require('fs');
const fsPromises = require('fs').promises;
const ProductAttribute = require('../models/productattribute');

// Helper to make absolute image URLs
function makeAbsoluteUrl(req, path) {
  if (!path) return null;
  if (path.startsWith('http')) return path;
  if (path.startsWith('/')) return `${req.protocol}://${req.get('host')}${path}`;
  return `${req.protocol}://${req.get('host')}/uploads/products/${path}`;
}

// Get all products
exports.getAllProducts = async (req, res) => {
  try {
    // ✅ FIXED: Use populate instead of manual mapping to get complete category data
    const products = await Product.find()
      .populate({
        path: 'category_id',
        select: 'name slug'
      })
      .populate({
        path: 'sub_category_id', // ✅ ADD: Populate subcategory with slug
        select: 'name slug'
      })
      .populate({
        path: 'brand_id',
        select: 'name slug'
      })
      .sort({ createdAt: -1 })
      .lean();

    // ✅ ADD: Transform to include absolute URLs for images
    const transformedProducts = products.map(product => ({
      ...product,
      photo: product.photo ? `${process.env.REACT_APP_API_URL || 'http://localhost:5000'}${product.photo}` : null,
      featured_image: product.featured_image ? `${process.env.REACT_APP_API_URL || 'http://localhost:5000'}${product.featured_image}` : null,
      images: product.images && product.images.length > 0
        ? product.images.map(img => img ? `${process.env.REACT_APP_API_URL || 'http://localhost:5000'}${img}` : null).filter(Boolean)
        : [],
      // Keep backward compatibility
      category: product.category_id?.name || null,
      sub_category: product.sub_category_id?.name || null,
      brand: product.brand_id?.name || null,
    }));

    res.json({
      success: true,
      data: transformedProducts,
      count: transformedProducts.length
    });
  } catch (error) {
    console.error('Error fetching products:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching products',
      error: error.message
    });
  }
};

exports.getProductsByCategory = async (req, res) => {
  try {
    const { categoryId } = req.params;
    const products = await Product.find({ category_id: categoryId })
      .populate({
        path: 'category',
        populate: { path: 'parent_id' }
      })
      .populate('brand')
      .populate('sub_category_id')
      .sort({ createdAt: -1 });
    res.json({
      success: true,
      data: products,
      count: products.length
    });
  } catch (error) {
    console.error('Error fetching products by category:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching products by category',
      error: error.message
    });
  }
};

exports.getProductsByCategoryName = async (req, res) => {
  try {
    const { categorySlug } = req.params;
    const category = await Category.findOne({ slug: categorySlug });
    if (!category) {
      return res.status(404).json({
        success: false,
        message: 'Category not found'
      });
    }
    const products = await Product.find({ category_id: category._id })
      .populate({
        path: 'category',
        populate: { path: 'parent_id' }
      })
      .populate('brand')
      .populate('sub_category_id')
      .sort({ createdAt: -1 });
    // Map image URLs
    const mapped = products.map(prod => ({
      ...prod.toObject(),
      photo: makeAbsoluteUrl(req, prod.photo),
      featured_image: makeAbsoluteUrl(req, prod.featured_image)
    }));
    res.json({
      success: true,
      data: mapped,
      count: mapped.length
    });
  } catch (error) {
    console.error('Error fetching products by category name:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching products by category name',
      error: error.message
    });
  }
};

exports.getProductById = async (req, res) => {
  try {
    console.log('🔍 DEBUG: getProductById called for ID:', req.params.id);

    const product = await Product.findById(req.params.id)
      .populate({
        path: 'category_id',
        select: 'name slug'
      })
      .populate({
        path: 'brand_id',
        select: 'name slug'
      })
      .populate({
        path: 'sub_category_id',
        select: 'name slug'
      });

    if (!product) {
      console.log('❌ DEBUG: Product not found');
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }

    console.log('🔍 DEBUG: Raw product data from database:');
    console.log('  - product.category_id:', product.category_id);
    console.log('  - product.sub_category_id:', product.sub_category_id);
    console.log('  - product.brand_id:', product.brand_id);

    // ✅ FIXED: Convert populated objects to plain string IDs for form compatibility
    const productForForm = {
      ...product.toObject(),
      category_id: product.category_id ? product.category_id._id.toString() : null,
      sub_category_id: product.sub_category_id ? product.sub_category_id._id.toString() : null,
      brand_id: product.brand_id ? product.brand_id._id.toString() : null,
      photo: makeAbsoluteUrl(req, product.photo),
      images: product.images && product.images.length > 0
        ? product.images.map(img => makeAbsoluteUrl(req, img))
        : []
    };

    console.log('🔍 DEBUG: Transformed product data for frontend:');
    console.log('  - productForForm.category_id:', productForForm.category_id, 'Type:', typeof productForForm.category_id);
    console.log('  - productForForm.sub_category_id:', productForForm.sub_category_id, 'Type:', typeof productForForm.sub_category_id);
    console.log('  - productForForm.brand_id:', productForForm.brand_id, 'Type:', typeof productForForm.brand_id);

    res.json(productForForm);
  } catch (error) {
    console.error('❌ DEBUG: Error in getProductById:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

exports.createProduct = async (req, res) => {
  try {
    const { name, description, price, brand_id, category_id, sub_category_id, slug, sku, sale_price, stock, status, meta_title, meta_description } = req.body;

    // Validate required fields
    if (!category_id) {
      return res.status(400).json({
        success: false,
        message: 'Category is required'
      });
    }

    if (!brand_id) {
      return res.status(400).json({
        success: false,
        message: 'Brand is required'
      });
    }

    let imagePath = null;
    let imagesPaths = [];

    if (req.files && req.files.length > 0) {
      for (const file of req.files) {
        const processedImage = await processImage(file, {}, 'products');
        const path = `/uploads/products/${processedImage.filename}`;
        imagesPaths.push(path);
      }
      imagePath = imagesPaths[0]; // Set first image as main photo
    }

    const product = await Product.create({
      name,
      description,
      slug,
      sku,
      price,
      sale_price,
      stock,
      category_id,
      sub_category_id: sub_category_id || null,
      brand_id,
      photo: imagePath,
      featured_image: imagePath,
      images: imagesPaths,
      status: status === 'true' || status === true,
      meta_title,
      meta_description,
    });

    // Return product with populated relationships
    const populatedProduct = await Product.findById(product._id)
      .populate('category_id', 'name')
      .populate('sub_category_id', 'name')
      .populate('brand_id', 'name');

    res.status(201).json({
      success: true,
      message: 'Product created successfully',
      data: populatedProduct
    });
  } catch (error) {
    console.error('Error creating product:', error);
    res.status(500).json({
      success: false,
      message: 'Error creating product',
      error: error.message
    });
  }
};

exports.updateProduct = async (req, res) => {
  try {
    console.log('🔍 DEBUG: updateProduct called for ID:', req.params.id);
    console.log('🔍 DEBUG: Request body:', req.body);
    console.log('🔍 DEBUG: Request file:', req.file);

    const product = await Product.findById(req.params.id);
    if (!product) {
      console.log('❌ DEBUG: Product not found for update');
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }

    const { name, description, price, brand_id, category_id, sub_category_id, slug, sku, sale_price, stock, status, meta_title, meta_description } = req.body;

    console.log('🔍 DEBUG: Extracted values from request body:');
    console.log('  - category_id:', category_id, 'Type:', typeof category_id);
    console.log('  - sub_category_id:', sub_category_id, 'Type:', typeof sub_category_id);
    console.log('  - brand_id:', brand_id, 'Type:', typeof brand_id);

    // Update product fields
    if (name) product.name = name;
    if (description !== undefined) product.description = description;
    if (price) product.price = price;
    if (sale_price !== undefined) product.sale_price = sale_price;
    if (stock !== undefined) product.stock = stock;
    if (sku) product.sku = sku;
    if (slug) product.slug = slug;
    if (brand_id) product.brand_id = brand_id;
    if (category_id) product.category_id = category_id;
    if (sub_category_id !== undefined) product.sub_category_id = sub_category_id || null;
    if (status !== undefined) product.status = status === 'true' || status === true;
    if (meta_title !== undefined) product.meta_title = meta_title;
    if (meta_description !== undefined) product.meta_description = meta_description;

    console.log('🔍 DEBUG: Product fields after assignment:');
    console.log('  - product.category_id:', product.category_id);
    console.log('  - product.sub_category_id:', product.sub_category_id);
    console.log('  - product.brand_id:', product.brand_id);

    // Handle image upload - FIXED: Use same pattern as working grocery controller
    // Handle image upload (Multiple)
    // 1. Filter existing images if 'existing_images' is provided
    if (req.body.existing_images !== undefined) {
      const keptUrls = Array.isArray(req.body.existing_images)
        ? req.body.existing_images
        : [req.body.existing_images];

      const keptPaths = keptUrls.map(url => {
        try {
          if (url.startsWith('http')) {
            const urlObj = new URL(url);
            return urlObj.pathname;
          }
          return url;
        } catch (e) {
          return url;
        }
      });

      if (product.images) {
        product.images = product.images.filter(img => keptPaths.includes(img));
      }
    }

    // 2. Handle new image uploads (Append)
    if (req.files && req.files.length > 0) {
      console.log('🔍 DEBUG: New images received:', req.files.length);

      const newImagePaths = [];
      for (const file of req.files) {
        try {
          const processedImage = await processImage(file, {}, 'products');
          newImagePaths.push(`/uploads/products/${processedImage.filename}`);
        } catch (error) {
          console.error('❌ DEBUG: Error processing new image:', error);
        }
      }

      if (!product.images) product.images = [];
      product.images = [...product.images, ...newImagePaths];
    }

    // 3. Sync photo/featured_image
    if (product.images && product.images.length > 0) {
      // If product.photo is not in the current images list, pick the first one.
      if (!product.photo || !product.images.includes(product.photo)) {
        product.photo = product.images[0];
        product.featured_image = product.images[0];
      }
    } else {
      product.photo = null;
      product.featured_image = null;
    }

    console.log('🔍 DEBUG: Final image path set:', product.photo);

    // Save the updated product
    await product.save();

    console.log('🔍 DEBUG: Product saved successfully');
    console.log('🔍 DEBUG: Final saved product data:');
    console.log('  - product.category_id:', product.category_id);
    console.log('  - product.sub_category_id:', product.sub_category_id);
    console.log('  - product.brand_id:', product.brand_id);
    console.log('  - product.photo:', product.photo);

    res.json({
      success: true,
      message: 'Product updated successfully',
      data: product
    });
  } catch (error) {
    console.error('❌ DEBUG: Error in updateProduct:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
};

exports.deleteProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }
    if (product.photo) {
      const oldImagePath = path.join(__dirname, '..', '..', 'uploads', product.photo);
      try {
        if (fs.existsSync(oldImagePath)) {
          await fsPromises.unlink(oldImagePath);
        }
      } catch (error) {
        console.error('Error deleting product image:', error);
      }
    }
    await product.deleteOne();
    res.json({
      success: true,
      message: 'Product deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting product:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting product',
      error: error.message
    });
  }
};

// Stub functions for missing exports - TODO: Implement these with Mongoose
exports.bulkDeleteProducts = async (req, res) => {
  res.status(501).json({
    success: false,
    message: 'Bulk delete products - Not implemented yet (MongoDB migration in progress)'
  });
};

exports.getProductVariationById = async (req, res) => {
  res.status(501).json({
    success: false,
    message: 'Get product variation by ID - Not implemented yet (MongoDB migration in progress)'
  });
};

exports.getAllProductVariations = async (req, res) => {
  res.status(501).json({
    success: false,
    message: 'Get all product variations - Not implemented yet (MongoDB migration in progress)'
  });
};

exports.createProductVariation = async (req, res) => {
  res.status(501).json({
    success: false,
    message: 'Create product variation - Not implemented yet (MongoDB migration in progress)'
  });
};

exports.updateProductVariation = async (req, res) => {
  res.status(501).json({
    success: false,
    message: 'Update product variation - Not implemented yet (MongoDB migration in progress)'
  });
};

exports.deleteProductVariation = async (req, res) => {
  res.status(501).json({
    success: false,
    message: 'Delete product variation - Not implemented yet (MongoDB migration in progress)'
  });
};

exports.bulkDeleteProductVariations = async (req, res) => {
  res.status(501).json({
    success: false,
    message: 'Bulk delete product variations - Not implemented yet (MongoDB migration in progress)'
  });
};

exports.updateProductVariationStock = async (req, res) => {
  res.status(501).json({
    success: false,
    message: 'Update product variation stock - Not implemented yet (MongoDB migration in progress)'
  });
};

exports.getStockByProductVariation = async (req, res) => {
  res.status(501).json({
    success: false,
    message: 'Get stock by product variation - Not implemented yet (MongoDB migration in progress)'
  });
};

exports.deleteStockManagement = async (req, res) => {
  res.status(501).json({
    success: false,
    message: 'Delete stock management - Not implemented yet (MongoDB migration in progress)'
  });
};

exports.getApplianceProductsWithAttributes = async (req, res) => {
  res.status(501).json({
    success: false,
    message: 'Get appliance products with attributes - Not implemented yet (MongoDB migration in progress)'
  });
};

// Get products by subcategory (NEW FUNCTION - CRITICAL FOR SUBCATEGORY NAVIGATION)
exports.getProductsBySubcategory = async (req, res) => {
  try {
    const { subcategoryId } = req.params;

    // Validate subcategory exists
    const subcategory = await Category.findById(subcategoryId);
    if (!subcategory) {
      return res.status(404).json({
        success: false,
        message: 'Subcategory not found'
      });
    }

    // Find products by subcategory
    const products = await Product.find({ sub_category_id: subcategoryId })
      .populate({
        path: 'category_id',
        select: 'name slug'
      })
      .populate({
        path: 'sub_category_id',
        select: 'name slug'
      })
      .populate({
        path: 'brand_id',
        select: 'name slug'
      })
      .sort({ createdAt: -1 });

    // Map image URLs to absolute paths
    const mapped = products.map(prod => ({
      ...prod.toObject(),
      photo: makeAbsoluteUrl(req, prod.photo),
      featured_image: makeAbsoluteUrl(req, prod.featured_image),
      images: prod.images && prod.images.length > 0
        ? prod.images.map(img => makeAbsoluteUrl(req, img))
        : []
    }));

    res.json({
      success: true,
      data: mapped,
      subcategory: {
        id: subcategory._id,
        name: subcategory.name,
        slug: subcategory.slug
      },
      count: mapped.length
    });
  } catch (error) {
    console.error('Error fetching products by subcategory:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching products by subcategory',
      error: error.message
    });
  }
};
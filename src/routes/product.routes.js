const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middlewares/auth.middleware');
const upload = require('../middlewares/upload.middleware');
const { validateImage } = require('../middlewares/imageValidation.middleware');

// Import product controller
const {
  getAllProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
  bulkDeleteProducts,
  getProductVariationById,
  getAllProductVariations,
  createProductVariation,
  updateProductVariation,
  deleteProductVariation,
  bulkDeleteProductVariations,
  updateProductVariationStock,
  getStockByProductVariation,
  deleteStockManagement,
  getApplianceProductsWithAttributes, // custom endpoint
  getProductsByCategory,
  getProductsByCategoryName,
  getProductsBySubcategory  // ✅ ADDED: Import subcategory function
} = require('../controllers/product.controller');

// Product routes
router.get('/', getAllProducts); // Simple GET /api/products
router.get('/get_all_product', getAllProducts);
router.get('/appliances', getApplianceProductsWithAttributes); // custom appliances endpoint
router.get('/category/:categoryId', getProductsByCategory);
router.get('/category/name/:categorySlug', getProductsByCategoryName);
router.get('/subcategory/:subcategoryId', getProductsBySubcategory);  // ✅ ADDED: Subcategory route
router.get('/:id', getProductById);
router.post('/save_product', protect, authorize('admin'), upload.single('product_image'), validateImage, createProduct);
router.put('/update_product_by_id/:id', protect, authorize('admin'), upload.single('product_image'), updateProduct);
router.delete('/delete_product_by_id/:id', protect, authorize('admin'), deleteProduct);
router.delete('/delete_products', protect, authorize('admin'), bulkDeleteProducts);

// Product variation routes
router.get('/get_product_variation_by_id/:id', getProductVariationById);
router.get('/get_all_product_variation', getAllProductVariations);
router.post('/save_product_variation', protect, authorize('admin'), upload.array('images[]'), createProductVariation);
router.put('/update_product_variation_by_id/:id', protect, authorize('admin'), upload.array('images[]'), updateProductVariation);
router.delete('/delete_product_variation_by_id/:id', protect, authorize('admin'), deleteProductVariation);
router.delete('/delete_product_variations', protect, authorize('admin'), bulkDeleteProductVariations);

// Additional variation routes
router.put('/update_product_variation_stock', protect, authorize('admin'), updateProductVariationStock);
router.get('/get_stock_by_product_variation', protect, authorize('admin'), getStockByProductVariation);
router.delete('/delete_stock_management/:id', protect, authorize('admin'), deleteStockManagement);

module.exports = router;
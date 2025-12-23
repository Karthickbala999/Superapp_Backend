// models/ProductAttribute.js

const mongoose = require('mongoose');

const productAttributeSchema = new mongoose.Schema({
  product_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: [true, 'Product ID is required']
  },
  name: {
    type: String,
    required: [true, 'Attribute name is required'],
    trim: true
  },
  value: {
    type: String,
    required: [true, 'Attribute value is required'],
    trim: true
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

productAttributeSchema.virtual('product', {
  ref: 'Product',
  localField: 'product_id',
  foreignField: '_id',
  justOne: true
});

productAttributeSchema.index({ product_id: 1 });
productAttributeSchema.index({ name: 1 });

const ProductAttribute = mongoose.model('ProductAttribute', productAttributeSchema);

module.exports = ProductAttribute;

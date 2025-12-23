const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const ProductWishlist = sequelize.define('ProductWishlist', {
  id: {
    type: DataTypes.BIGINT.UNSIGNED,
    autoIncrement: true,
    primaryKey: true
  },
  user_id: {
    type: DataTypes.BIGINT.UNSIGNED,
    allowNull: false,
    references: {
      model: 'users',
      key: 'id'
    }
  },
  product_id: {
    type: DataTypes.BIGINT.UNSIGNED,
    allowNull: false,
    references: {
      model: 'products',
      key: 'id'
    }
  },
  name: DataTypes.STRING,
  image: DataTypes.STRING,
  category: DataTypes.STRING,
  price: DataTypes.DECIMAL(10, 2),
  quantity: {
    type: DataTypes.INTEGER,
    defaultValue: 1
  }
}, {
  tableName: 'wishlists',
  timestamps: true,
  underscored: true
});

module.exports = ProductWishlist; 
 
'use strict';
module.exports = (sequelize, DataTypes) => {
  const GroceryOrder = sequelize.define('GroceryOrder', {
    user_id: DataTypes.BIGINT.UNSIGNED,
    total_amount: DataTypes.DECIMAL(10, 2),
    status: {
      type: DataTypes.ENUM('pending', 'processing', 'out_for_delivery', 'delivered', 'cancelled'),
      defaultValue: 'processing',
      allowNull: false
    },
    payment_status: {
      type: DataTypes.STRING,
      defaultValue: 'pending'
    },
    shipping_address: {
        type: DataTypes.TEXT
    }
  }, {
    tableName: 'grocery_orders',
    underscored: true
  });

  GroceryOrder.associate = function(models) {
    GroceryOrder.belongsTo(models.User, { foreignKey: 'user_id' });
    GroceryOrder.hasMany(models.GroceryOrderItem, { foreignKey: 'order_id', as: 'items' });
  };

  return GroceryOrder;
};

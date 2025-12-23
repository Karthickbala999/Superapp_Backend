'use strict';
module.exports = (sequelize, DataTypes) => {
  const GroceryOrderItem = sequelize.define('GroceryOrderItem', {
    order_id: DataTypes.BIGINT.UNSIGNED,
    grocery_id: DataTypes.BIGINT.UNSIGNED,
    quantity: DataTypes.INTEGER,
    original_price: DataTypes.DECIMAL(10, 2),
    discounted_price: DataTypes.DECIMAL(10, 2),
    name: DataTypes.STRING,
    image: DataTypes.STRING,
    category: DataTypes.STRING
  }, {
    tableName: 'grocery_order_items',
    underscored: true
  });

  GroceryOrderItem.associate = function(models) {
    GroceryOrderItem.belongsTo(models.GroceryOrder, { foreignKey: 'order_id' });
    GroceryOrderItem.belongsTo(models.Grocery, { foreignKey: 'grocery_id' });
  };

  return GroceryOrderItem;
};

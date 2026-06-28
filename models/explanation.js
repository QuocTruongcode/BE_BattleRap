'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Explanation extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      Explanation.belongsTo(models.Bar, {
        foreignKey: 'barId',
        onDelete: 'CASCADE',
      });
    }
  }
  Explanation.init({
    meaning: DataTypes.TEXT,
    reference: DataTypes.TEXT,
    whyGood: DataTypes.TEXT,
    barId: DataTypes.INTEGER
  }, {
    sequelize,
    modelName: 'Explanation',
  });
  return Explanation;
};
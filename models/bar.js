'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Bar extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      Bar.hasOne(models.Explanation, {
        foreignKey: 'barId',
        onDelete: 'CASCADE',
      });
    }
  }
  Bar.init({
    startTime: DataTypes.FLOAT,
    endTime: DataTypes.FLOAT,
    content: DataTypes.TEXT,
    videoId: DataTypes.INTEGER
  }, {
    sequelize,
    modelName: 'Bar',
  });
  return Bar;
};
'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Drama extends Model {
    static associate(models) {
      Drama.hasMany(models.DramaEvent, {
        foreignKey: 'dramaID',
        as: 'DramaEvents'
      });
    }
  }
  Drama.init({
    title: DataTypes.STRING,
    summary: DataTypes.TEXT
  }, {
    sequelize,
    modelName: 'Drama',
  });
  return Drama;
};

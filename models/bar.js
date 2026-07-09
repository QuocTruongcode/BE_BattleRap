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
      Bar.hasOne(models.Explanation, {
        foreignKey: 'barId',
        onDelete: 'CASCADE',
      });

      Bar.belongsTo(models.AllCode, {
        foreignKey: 'barType',
        targetKey: 'KeyMap',
        as: 'BarTypeRef'
      });

      Bar.hasMany(models.BarRelationship, {
        foreignKey: 'SourceBarID',
        sourceKey: 'id',
        onDelete: 'CASCADE',
      });

      Bar.hasOne(models.Entity, {
        foreignKey: 'RefID',
        sourceKey: 'id',
        onDelete: 'SET NULL',
        constraints: false,
        as: 'EntityRef',
        scope: {
          EntityType: 'Bar'
        }
      });
    }
  }
  Bar.init({
    startTime: DataTypes.FLOAT,
    content: DataTypes.TEXT,
    videoId: DataTypes.INTEGER,
    barttelID: DataTypes.INTEGER,
    barType: DataTypes.STRING,
  }, {
    sequelize,
    modelName: 'Bar',
  });
  return Bar;
};
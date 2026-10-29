'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class KeyR2 extends Model {
    static associate(models) {
      KeyR2.belongsTo(models.Video, {
        foreignKey: 'VideoID',
        targetKey: 'id',
        as: 'Video'
      });
    }
  }

  KeyR2.init({
    VideoID: {
      type: DataTypes.INTEGER,
      allowNull: false,
      unique: true,
      references: {
        model: 'Videos',
        key: 'id'
      },
      onDelete: 'CASCADE',
      onUpdate: 'CASCADE'
    },
    key: {
      type: DataTypes.STRING,
      allowNull: true
    }
  }, {
    sequelize,
    modelName: 'KeyR2',
    tableName: 'KeyR2'
  });

  return KeyR2;
};

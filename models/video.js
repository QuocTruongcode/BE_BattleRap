'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Video extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      Video.hasOne(models.Entity, {
        foreignKey: 'RefID',
        sourceKey: 'id',
        onDelete: 'SET NULL',
        constraints: false,
        as: 'EntityRef',
        scope: {
          EntityType: 'Video'
        }
      });
    }
  }
  Video.init({
    title: DataTypes.STRING,
    linkVideo: DataTypes.STRING,
    thumbnailUrl: DataTypes.STRING,
    battlerID: DataTypes.INTEGER,
    review: DataTypes.TEXT,
    eventID: DataTypes.INTEGER,
    cleanScore: DataTypes.FLOAT,
  }, {
    sequelize,
    modelName: 'Video',
  });
  return Video;
};
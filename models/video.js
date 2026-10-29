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
      Video.hasMany(models.CommentVideo, {
        foreignKey: 'videoID',
        sourceKey: 'id',
        as: 'CommentVideos'
      });

      Video.hasMany(models.DramaEvent, {
        foreignKey: 'videoID',
        as: 'DramaEvents',
        onDelete: 'SET NULL',
        onUpdate: 'CASCADE'
      });

      Video.hasOne(models.KeyR2, {
        foreignKey: 'VideoID',
        sourceKey: 'id',
        as: 'KeyR2'
      });

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

      Video.belongsToMany(models.Battler, {
        through: models.VideoBattler,
        foreignKey: 'videoID',
        otherKey: 'battlerID',
        as: 'Battlers'
      });
    }
  }
  Video.init({
    title: DataTypes.STRING,
    linkVideo: DataTypes.STRING,
    linkBunny: DataTypes.STRING,
    storageId: {
      type: DataTypes.STRING,
      allowNull: true
    },
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
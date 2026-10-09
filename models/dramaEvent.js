'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class DramaEvent extends Model {
    static associate(models) {
      DramaEvent.belongsTo(models.Drama, {
        foreignKey: 'dramaID',
        as: 'Drama'
      });
      DramaEvent.belongsTo(models.Video, {
        foreignKey: 'videoID',
        as: 'Video',
        onDelete: 'SET NULL',
        onUpdate: 'CASCADE'
      });
    }
  }
  DramaEvent.init({
    link: DataTypes.STRING,
    title: DataTypes.TEXT,
    review: {
      type: DataTypes.TEXT,
      get() {
        const value = this.getDataValue('review');
        if (value === null || value === undefined) {
          return value;
        }

        try {
          return JSON.parse(value);
        } catch {
          return value;
        }
      },
      set(value) {
        if (value === null || value === undefined) {
          this.setDataValue('review', value);
          return;
        }

        const serializedValue = JSON.stringify(value);
        if (serializedValue === undefined) {
          throw new TypeError('DramaEvent.review must be a JSON-serializable value');
        }
        this.setDataValue('review', serializedValue);
      },
    },
    dramaID: DataTypes.INTEGER,
    videoID: DataTypes.INTEGER,
    facebookUrl: DataTypes.STRING,
    pageName: DataTypes.STRING,
    postId: DataTypes.STRING,
    time: DataTypes.DATE
  }, {
    sequelize,
    modelName: 'DramaEvent',
  });
  return DramaEvent;
};

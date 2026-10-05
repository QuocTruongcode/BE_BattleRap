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
    }
  }
  DramaEvent.init({
    link: DataTypes.STRING,
    title: DataTypes.STRING,
    review: DataTypes.TEXT,
    dramaID: DataTypes.INTEGER,
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

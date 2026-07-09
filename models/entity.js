'use strict';
const {
    Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
    class Entity extends Model {
        /**
         * Helper method for defining associations.
         * This method is not a part of Sequelize lifecycle.
         * The `models/index` file will call this method automatically.
         */
        static associate(models) {
            Entity.hasMany(models.BarRelationship, {
                foreignKey: 'EntityID',
                sourceKey: 'id',
                onDelete: 'SET NULL'
            });

            Entity.belongsTo(models.Bar, {
                foreignKey: 'RefID',
                targetKey: 'id',
                as: 'Bar',
                constraints: false,
                scope: {
                    EntityType: 'Bar'
                }
            });

            Entity.belongsTo(models.Video, {
                foreignKey: 'RefID',
                targetKey: 'id',
                as: 'Video',
                constraints: false,
                scope: {
                    EntityType: 'Video'
                }
            });
        }
    }
    Entity.init({
        EntityType: DataTypes.STRING,
        RefID: DataTypes.INTEGER,
    }, {
        sequelize,
        modelName: 'Entity',
    });
    return Entity;
};
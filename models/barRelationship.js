'use strict';
const {
    Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
    class BarRelationship extends Model {
        /**
         * Helper method for defining associations.
         * This method is not a part of Sequelize lifecycle.
         * The `models/index` file will call this method automatically.
         */
        static associate(models) {
            BarRelationship.belongsTo(models.Bar, {
                foreignKey: 'SourceBarID',
                targetKey: 'id',
                as: 'SourceBar'
            });

            BarRelationship.belongsTo(models.Entity, {
                foreignKey: 'EntityID',
                targetKey: 'id',
                as: 'Entity'
            });

            BarRelationship.belongsTo(models.AllCode, {
                foreignKey: 'RelationType',
                targetKey: 'KeyMap',
                as: 'RelationTypeRef'
            });
        }
    }
    BarRelationship.init({
        RelationType: DataTypes.STRING,
        SourceBarID: DataTypes.INTEGER,
        EntityID: DataTypes.INTEGER,
    }, {
        sequelize,
        modelName: 'BarRelationship',
    });
    return BarRelationship;
};
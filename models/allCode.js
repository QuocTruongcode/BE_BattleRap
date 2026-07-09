'use strict';
const {
    Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
    class AllCode extends Model {
        /**
         * Helper method for defining associations.
         * This method is not a part of Sequelize lifecycle.
         * The `models/index` file will call this method automatically.
         */
        static associate(models) {
            AllCode.hasMany(models.Bar, {
                foreignKey: 'barType',
                sourceKey: 'KeyMap',
                as: 'Bars'
            });

            AllCode.hasMany(models.BarRelationship, {
                foreignKey: 'RelationType',
                sourceKey: 'KeyMap',
                as: 'BarRelationships'
            });
        }
    }
    AllCode.init({
        KeyMap: {
            type: DataTypes.STRING,
            unique: true
        },
        Type: DataTypes.STRING,
        ValueVi: DataTypes.STRING,
        ValueEn: DataTypes.STRING
    }, {
        sequelize,
        modelName: 'AllCode',
    });
    return AllCode;
};
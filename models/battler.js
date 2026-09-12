'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
    class Battler extends Model {
        static associate(models) {
            Battler.hasMany(models.Bar, {
                foreignKey: 'barttelID',
                sourceKey: 'id',
                as: 'Bars'
            });

            Battler.belongsToMany(models.Video, {
                through: models.VideoBattler,
                foreignKey: 'battlerID',
                otherKey: 'videoID',
                as: 'Videos'
            });
        }
    }

    Battler.init({
        id: {
            type: DataTypes.INTEGER,
            allowNull: false,
            autoIncrement: true,
            primaryKey: true,
        },
        RapName: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        FullName: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        Describe: {
            type: DataTypes.TEXT,
            allowNull: true,
        },
        image: {
            type: DataTypes.STRING,
            allowNull: true,
        }
    }, {
        sequelize,
        modelName: 'Battler',
        tableName: 'Battlers',
    });

    return Battler;
};
